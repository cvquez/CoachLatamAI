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

    // ⭐ PASO 1: Verificar si el usuario ya existe en auth
    console.log('🔍 Verificando si el email ya existe:', email)
    
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error listing users:', listError)
      return NextResponse.json(
        { error: 'Error al verificar usuarios existentes' },
        { status: 500 }
      )
    }

    const existingUser = existingUsers.users.find(u => u.email === email)

    let userId: string

    if (existingUser) {
      // ✅ USUARIO YA EXISTE - Solo vincular
      console.log('✅ Usuario ya existe:', existingUser.id)
      console.log('📎 Solo creando relación coach-cliente...')
      
      userId = existingUser.id

      // Verificar si la relación coach-cliente ya existe
      const { data: existingClient, error: checkError } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('coach_id', coach_id)
        .eq('user_id', userId)
        .maybeSingle()

      if (checkError) {
        console.error('Error checking existing client relationship:', checkError)
      }

      if (existingClient) {
        return NextResponse.json(
          { error: 'Este cliente ya está vinculado a tu cuenta' },
          { status: 400 }
        )
      }

    } else {
      // ❌ USUARIO NO EXISTE - Crear nuevo
      console.log('❌ Usuario no existe, creando nuevo...')
      
      // Crear contraseña temporal
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

      userId = authData.user.id
      console.log('✅ Usuario auth creado:', userId)

      // Crear registro en la tabla users
      const { error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          id: userId,
          email: email,
          full_name: full_name,
          role: 'client',
          user_type: 'client',
          subscription_plan: 'starter',
          subscription_status: 'active'
        })

      if (userError && !userError.message.includes('duplicate')) {
        console.warn('Warning creating user record:', userError)
      } else {
        console.log('✅ Usuario creado en tabla users')
      }

      // TODO: Aquí deberías enviar un email al cliente
      // con un link para que establezca su contraseña
      console.log('📧 TODO: Enviar email de bienvenida con link para establecer contraseña')
    }

    // ⭐ PASO 2: Crear el registro de cliente en la tabla clients
    console.log('💾 Creando relación en tabla clients...')
    
    const { data: clientData, error: clientError } = await supabaseAdmin
      .from('clients')
      .insert({
        coach_id: coach_id,
        user_id: userId,
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
      console.error('Error creating client relationship:', clientError)
      
      // Si el usuario fue recién creado y falla la relación, eliminar el usuario
      if (!existingUser) {
        console.log('🗑️ Rollback: Eliminando usuario creado')
        await supabaseAdmin.auth.admin.deleteUser(userId)
      }
      
      return NextResponse.json(
        { error: `No se pudo crear la relación coach-cliente: ${clientError.message}` },
        { status: 400 }
      )
    }

    console.log('✅ Cliente vinculado exitosamente')

    return NextResponse.json(
      { 
        success: true, 
        client: clientData,
        user_id: userId,
        was_existing_user: !!existingUser
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
