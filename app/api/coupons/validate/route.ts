import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    try {
        const supabase = createClient()

        // Verificar autenticación
        const { data: { session }, error: authError } = await supabase.auth.getSession()

        if (authError || !session) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { code, planId } = body

        if (!code) {
            return NextResponse.json(
                { error: 'Código de cupón requerido' },
                { status: 400 }
            )
        }

        // Validar cupón usando la función RPC
        const { data, error } = await supabase.rpc('validate_coupon', {
            p_code: code.trim().toUpperCase(),
            p_user_id: session.user.id,
            p_plan_id: planId || null
        })

        if (error) {
            console.error('Error validating coupon:', error)
            return NextResponse.json(
                { error: 'Error al validar el cupón' },
                { status: 500 }
            )
        }

        return NextResponse.json(data)

    } catch (error) {
        console.error('Error in coupon validation:', error)
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        )
    }
}
