import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// IMPORTANTE: Necesitas agregar SUPABASE_SERVICE_ROLE_KEY a tus variables de entorno
// La encuentras en Supabase Dashboard > Settings > API > service_role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    // Crear cliente de Supabase con service role (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Obtener datos del body
    const body = await request.json()
    const { coach_id, full_name, email, phone, company, position, notes, status } = body

    // Validar datos requeridos
    if (!coach_id || !full_name || !email) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Paso 1: Crear usuario auth para el cliente
    const temporaryPassword = Math.random().toString(36).slice(-10) + 'Aa1!'
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: temporaryPassword,
      email_confirm: true, // Auto-confirmar el email
      user_metadata: {
        name: full_name,
        role: 'client'
      }
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return NextResponse.json(
        { error: `No se pudo crear la cuenta del cliente: ${authError.message}` },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'No se pudo obtener el ID del usuario creado' },
        { status: 500 }
      )
    }

    // Paso 2: Crear el registro de cliente en la tabla
    const { data: clientData, error: clientError } = await supabaseAdmin
      .from('clients')
      .insert({
        coach_id: coach_id,
        user_id: authData.user.id,
        full_name: full_name,
        email: email,
        phone: phone || null,
        company: company || null,
        position: position || null,
        notes: notes || null,
        status: status || 'active',
        coaching_focus: [],
        start_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single()

    if (clientError) {
      console.error('Error creating client:', clientError)
      
      // Si falla la creación del cliente, intentar eliminar el usuario creado
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      
      return NextResponse.json(
        { error: `No se pudo crear el cliente: ${clientError.message}` },
        { status: 400 }
      )
    }

    // Paso 3: Crear registro en la tabla users si no existe
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        name: full_name,
        role: 'client',
        subscription_plan: 'starter',
        subscription_status: 'trial'
      })
      .select()
      .single()

    // No es crítico si falla (el registro ya podría existir)
    if (userError && !userError.message.includes('duplicate')) {
      console.warn('Warning creating user record:', userError)
    }

    return NextResponse.json(
      { 
        success: true, 
        client: clientData,
        user_id: authData.user.id 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Exception in create client API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
