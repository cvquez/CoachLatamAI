import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Crear cliente con Service Role para operaciones de servidor
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Crear cliente con las cookies del usuario
async function getSupabaseClient() {
  const { createServerClient } = await import('@supabase/ssr')
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignorar errores en Route Handlers
          }
        },
      },
    }
  )
}

// PayPal API helpers
async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')

  const response = await fetch(
    `${process.env.PAYPAL_API_BASE}/v1/oauth2/token`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    }
  )

  const data = await response.json()
  return data.access_token
}

async function cancelPayPalSubscription(subscriptionId: string, reason: string) {
  const accessToken = await getPayPalAccessToken()

  const response = await fetch(
    `${process.env.PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}/cancel`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: reason || 'Customer request',
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`PayPal API error: ${error}`)
  }

  return response.status === 204
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 Cancel subscription request received')
    
    // Obtener cliente con autenticación del usuario
    const supabase = await getSupabaseClient()
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('❌ Auth error:', authError)
      return NextResponse.json({ error: 'Authentication error' }, { status: 401 })
    }
    
    if (!user) {
      console.error('❌ No user found in session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ User authenticated:', user.id)

    const body = await request.json()
    const { reason } = body

    // Obtener suscripción activa del usuario
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subError) {
      console.error('❌ Error fetching subscription:', subError)
      return NextResponse.json(
        { error: 'Error fetching subscription' },
        { status: 500 }
      )
    }

    if (!subscription) {
      console.log('❌ No active subscription found for user:', user.id)
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }

    console.log('📋 Found subscription:', subscription.paypal_subscription_id)

    // Cancelar en PayPal
    console.log('🔄 Cancelling subscription in PayPal...')
    await cancelPayPalSubscription(
      subscription.paypal_subscription_id,
      reason || 'User requested cancellation'
    )

    console.log('✅ PayPal cancellation successful')

    // Usar Service Role para actualizar (bypass RLS)
    const supabaseAdmin = getSupabaseAdmin()
    
    const { error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', subscription.id)

    if (updateError) {
      console.error('❌ Error updating subscription:', updateError)
      throw updateError
    }

    console.log('✅ Database updated successfully')

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
    })
  } catch (error: any) {
    console.error('❌ Error cancelling subscription:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}