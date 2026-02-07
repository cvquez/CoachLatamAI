'use client'

import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Loader2 } from 'lucide-react'
import CouponInput, { CouponData } from '@/components/subscription/CouponInput'

interface PayPalSubscriptionButtonProps {
  userId: string
  planId: string // Plan ID de PayPal
}

export default function PayPalSubscriptionButton({ userId, planId }: PayPalSubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [coupon, setCoupon] = useState<CouponData | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleApprove = async (data: any) => {
    setIsLoading(true)
    console.log('✅ Subscription approved:', data)

    try {
      // Usar función RPC para crear suscripción de manera atómica
      // Esto garantiza que tanto la suscripción como el estado del usuario
      // se actualizan en una sola transacción, evitando race conditions
      const { data: result, error } = await supabase.rpc('create_subscription_atomic', {
        p_user_id: userId,
        p_paypal_subscription_id: data.subscriptionID,
        p_paypal_plan_id: planId,
      })

      if (error) {
        console.error('Error creating subscription:', error)

        // Intentar cancelar la suscripción en PayPal si la BD falló
        try {
          await fetch('/api/subscription/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subscriptionId: data.subscriptionID,
              reason: 'Database error during activation - rollback',
            }),
          })
          console.log('🔄 Subscription rolled back in PayPal')
        } catch (cancelError) {
          console.error('❌ Failed to rollback PayPal subscription:', cancelError)
        }

        toast({
          variant: 'destructive',
          title: 'Error',
          description: `No se pudo activar la suscripción. Contacta soporte con el ID: ${data.subscriptionID}`,
        })
        return
      }

      // Verificar resultado
      if (!result?.success) {
        throw new Error(result?.message || 'Error desconocido al crear suscripción')
      }

      console.log('✅ Subscription created successfully:', result)

      if (coupon && result?.subscription_id) {
        const { error: couponError } = await supabase.rpc('apply_coupon', {
          p_coupon_id: coupon.coupon_id,
          p_user_id: userId,
          p_subscription_id: result.subscription_id,
          p_discount_applied: coupon.discount_value
        })
        if (couponError) console.error('Error applying coupon:', couponError)
      }

      toast({
        title: '¡Suscripción Activada!',
        description: 'Tu suscripción se ha activado correctamente.',
      })

      // Redirigir al dashboard después de un breve delay
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)

    } catch (error) {
      console.error('Exception processing subscription:', error)

      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Ocurrió un error al procesar tu suscripción.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleError = (err: any) => {
    console.error('PayPal error:', err)
    toast({
      variant: 'destructive',
      title: 'Error de PayPal',
      description: 'Hubo un problema con PayPal. Por favor intenta de nuevo.',
    })
  }

  const handleCancel = () => {
    toast({
      title: 'Suscripción Cancelada',
      description: 'Cancelaste el proceso de suscripción.',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-lg">Procesando suscripción...</span>
      </div>
    )
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
        vault: true,
        intent: 'subscription',
      }}
    >
      <div className="space-y-4">
        <CouponInput planId={planId} onCouponApplied={setCoupon} />
        <PayPalButtons
          createSubscription={(data, actions) => {
            return actions.subscription.create({
              plan_id: planId,
            })
          }}
          onApprove={handleApprove}
          onError={handleError}
          onCancel={handleCancel}
          style={{
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'subscribe',
          }}
        />
      </div>
    </PayPalScriptProvider>
  )
}
