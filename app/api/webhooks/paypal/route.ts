import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Cliente Supabase con service role para bypass RLS (lazy initialization)
let supabaseAdmin: SupabaseClient | null = null

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return supabaseAdmin
}

// Verificar webhook de PayPal usando el SDK oficial
async function verifyPayPalWebhook(
  headers: Headers,
  body: string,
  webhookId: string
): Promise<boolean> {
  // En desarrollo, permitir bypass si está configurado
  if (process.env.NODE_ENV === 'development' && process.env.PAYPAL_WEBHOOK_BYPASS === 'true') {
    console.warn('⚠️ WEBHOOK VERIFICATION BYPASSED - DEVELOPMENT MODE ONLY')
    return true
  }

  try {
    const transmissionId = headers.get('paypal-transmission-id')
    const transmissionTime = headers.get('paypal-transmission-time')
    const transmissionSig = headers.get('paypal-transmission-sig')
    const certUrl = headers.get('paypal-cert-url')
    const authAlgo = headers.get('paypal-auth-algo')

    // Validar que todos los headers necesarios estén presentes
    if (!transmissionId || !transmissionTime || !transmissionSig || !certUrl || !authAlgo) {
      console.error('❌ Missing PayPal webhook headers')
      return false
    }

    // Validar que la URL del certificado sea de PayPal
    if (!certUrl.startsWith('https://api.paypal.com/') && !certUrl.startsWith('https://api-m.paypal.com/')) {
      console.error('❌ Invalid PayPal certificate URL')
      return false
    }

    // Construir el mensaje esperado para verificación
    const expectedMessage = `${transmissionId}|${transmissionTime}|${webhookId}|${crypto.createHash('sha256').update(body).digest('hex')}`

    // Verificar usando el API de PayPal
    const verificationResponse = await fetch(`${process.env.PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getPayPalAccessToken()}`,
      },
      body: JSON.stringify({
        transmission_id: transmissionId,
        transmission_time: transmissionTime,
        cert_url: certUrl,
        auth_algo: authAlgo,
        transmission_sig: transmissionSig,
        webhook_id: webhookId,
        webhook_event: JSON.parse(body),
      }),
    })

    const verificationResult = await verificationResponse.json()

    if (verificationResult.verification_status === 'SUCCESS') {
      console.log('✅ PayPal webhook signature verified')
      return true
    } else {
      console.error('❌ PayPal webhook signature verification failed:', verificationResult)
      return false
    }
  } catch (error) {
    console.error('❌ Error verifying PayPal webhook:', error)
    return false
  }
}

// Obtener access token de PayPal (cachear por 1 hora)
let cachedAccessToken: { token: string; expiresAt: number } | null = null

async function getPayPalAccessToken(): Promise<string> {
  // Si tenemos un token en cache y no ha expirado, usarlo
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now()) {
    return cachedAccessToken.token
  }

  try {
    const auth = Buffer.from(
      `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64')

    const response = await fetch(`${process.env.PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`,
      },
      body: 'grant_type=client_credentials',
    })

    const data = await response.json()

    if (data.access_token) {
      // Cachear el token (expira en 1 hora típicamente)
      cachedAccessToken = {
        token: data.access_token,
        expiresAt: Date.now() + (data.expires_in - 60) * 1000, // Restar 1 minuto por seguridad
      }
      return data.access_token
    } else {
      throw new Error('Failed to get PayPal access token')
    }
  } catch (error) {
    console.error('❌ Error getting PayPal access token:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validar que las variables de entorno necesarias estén configuradas
    if (!process.env.PAYPAL_WEBHOOK_ID) {
      console.error('❌ PAYPAL_WEBHOOK_ID not configured')
      return NextResponse.json(
        { error: 'Webhook not configured' },
        { status: 500 }
      )
    }

    if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      console.error('❌ PayPal credentials not configured')
      return NextResponse.json(
        { error: 'PayPal credentials not configured' },
        { status: 500 }
      )
    }

    const body = await request.text()
    const event = JSON.parse(body)

    console.log('📨 PayPal Webhook Event:', event.event_type)

    // Verificar webhook (IMPORTANTE en producción)
    const isValid = await verifyPayPalWebhook(
      request.headers,
      body,
      process.env.PAYPAL_WEBHOOK_ID!
    )

    if (!isValid) {
      console.error('❌ Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const subscriptionId = event.resource?.id

    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.CREATED':
        // Suscripción creada
        console.log('✅ Subscription created:', subscriptionId)
        await getSupabaseAdmin()
          .from('subscriptions')
          .update({
            status: 'active',
            start_date: new Date().toISOString(),
          })
          .eq('paypal_subscription_id', subscriptionId)
        break

      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        // Suscripción activada (primer pago exitoso)
        console.log('✅ Subscription activated:', subscriptionId)

        const { data: activatedResult, error: activatedError } = await getSupabaseAdmin().rpc(
          'update_subscription_status_webhook',
          {
            p_paypal_subscription_id: subscriptionId,
            p_status: 'active',
          }
        )

        if (activatedError) {
          console.error('❌ Error updating activated subscription:', activatedError)
          return NextResponse.json(
            { error: 'Failed to update subscription' },
            { status: 500 }
          )
        }

        console.log('✅ Subscription activated successfully:', activatedResult)
        break

      case 'BILLING.SUBSCRIPTION.UPDATED':
        // Suscripción actualizada
        console.log('📝 Subscription updated:', subscriptionId)
        break

      case 'BILLING.SUBSCRIPTION.CANCELLED':
        // Suscripción cancelada por el usuario
        console.log('❌ Subscription cancelled:', subscriptionId)

        const { data: cancelledResult, error: cancelledError } = await getSupabaseAdmin().rpc(
          'update_subscription_status_webhook',
          {
            p_paypal_subscription_id: subscriptionId,
            p_status: 'cancelled',
          }
        )

        if (cancelledError) {
          console.error('❌ Error updating cancelled subscription:', cancelledError)
          return NextResponse.json(
            { error: 'Failed to update subscription' },
            { status: 500 }
          )
        }

        console.log('✅ Subscription cancelled successfully:', cancelledResult)
        break

      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        // Suscripción suspendida (falta de pago)
        console.log('⚠️ Subscription suspended:', subscriptionId)

        const { data: suspendedResult, error: suspendedError } = await getSupabaseAdmin().rpc(
          'update_subscription_status_webhook',
          {
            p_paypal_subscription_id: subscriptionId,
            p_status: 'suspended',
          }
        )

        if (suspendedError) {
          console.error('❌ Error updating suspended subscription:', suspendedError)
          return NextResponse.json(
            { error: 'Failed to update subscription' },
            { status: 500 }
          )
        }

        console.log('✅ Subscription suspended successfully:', suspendedResult)
        break

      case 'BILLING.SUBSCRIPTION.EXPIRED':
        // Suscripción expirada
        console.log('⏰ Subscription expired:', subscriptionId)

        const { data: expiredResult, error: expiredError } = await getSupabaseAdmin().rpc(
          'update_subscription_status_webhook',
          {
            p_paypal_subscription_id: subscriptionId,
            p_status: 'expired',
          }
        )

        if (expiredError) {
          console.error('❌ Error updating expired subscription:', expiredError)
          return NextResponse.json(
            { error: 'Failed to update subscription' },
            { status: 500 }
          )
        }

        console.log('✅ Subscription expired successfully:', expiredResult)
        break

      case 'PAYMENT.SALE.COMPLETED':
        // Pago completado
        console.log('💰 Payment completed for subscription:', subscriptionId)

        // Calcular próxima fecha de cobro (1 mes adelante)
        const nextBillingDate = new Date()
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)

        const { data: paymentResult, error: paymentError } = await getSupabaseAdmin().rpc(
          'update_subscription_status_webhook',
          {
            p_paypal_subscription_id: subscriptionId,
            p_status: 'active', // Confirmar que está activa
            p_next_billing_date: nextBillingDate.toISOString(),
          }
        )

        if (paymentError) {
          console.error('❌ Error updating subscription after payment:', paymentError)
          return NextResponse.json(
            { error: 'Failed to update subscription' },
            { status: 500 }
          )
        }

        console.log('✅ Payment processed successfully:', paymentResult)
        break

      default:
        console.log('ℹ️ Unhandled event type:', event.event_type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
