'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Tag, Loader2, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CouponInputProps {
    onCouponApplied: (coupon: CouponData | null) => void
    planId?: string
    disabled?: boolean
}

export interface CouponData {
    coupon_id: string
    code: string
    discount_type: 'percentage' | 'fixed'
    discount_value: number
    plan_id?: string | null
    description?: string
    message?: string
}

export default function CouponInput({ onCouponApplied, planId, disabled }: CouponInputProps) {
    const [code, setCode] = useState('')
    const [isValidating, setIsValidating] = useState(false)
    const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()

    const validateCoupon = async () => {
        if (!code.trim()) {
            setError('Ingresa un código de cupón')
            return
        }

        setIsValidating(true)
        setError(null)

        try {
            const response = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code.trim(), planId })
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Error al validar cupón')
                setAppliedCoupon(null)
                onCouponApplied(null)
                return
            }

            if (data.valid) {
                const couponData: CouponData = {
                    coupon_id: data.coupon_id,
                    code: data.code,
                    discount_type: data.discount_type,
                    discount_value: data.discount_value,
                    description: data.description
                }
                setAppliedCoupon(couponData)
                onCouponApplied(couponData)
                toast({
                    title: '¡Cupón aplicado!',
                    description: getDiscountText(couponData),
                })
            } else {
                setError(data.error || 'Cupón no válido')
                setAppliedCoupon(null)
                onCouponApplied(null)
            }
        } catch (err) {
            console.error('Error validating coupon:', err)
            setError('Error al validar el cupón')
            setAppliedCoupon(null)
            onCouponApplied(null)
        } finally {
            setIsValidating(false)
        }
    }

    const removeCoupon = () => {
        setCode('')
        setAppliedCoupon(null)
        setError(null)
        onCouponApplied(null)
        toast({
            title: 'Cupón removido',
            description: 'El cupón ha sido quitado de tu orden.'
        })
    }

    const getDiscountText = (coupon: CouponData) => {
        if (coupon.discount_type === 'percentage') {
            return `${coupon.discount_value}% de descuento`
        }
        return `$${coupon.discount_value} de descuento`
    }

    return (
        <div className="space-y-3">
            <Label htmlFor="coupon-code" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Código de descuento
            </Label>

            {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-green-600" />
                        <div>
                            <p className="font-medium text-green-700 dark:text-green-400">
                                {appliedCoupon.code}
                            </p>
                            <p className="text-sm text-green-600 dark:text-green-500">
                                {getDiscountText(appliedCoupon)}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeCoupon}
                        disabled={disabled}
                        className="text-green-600 hover:text-green-700 hover:bg-green-100"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="flex gap-2">
                    <Input
                        id="coupon-code"
                        type="text"
                        placeholder="Ingresa tu código"
                        value={code}
                        onChange={(e) => {
                            setCode(e.target.value.toUpperCase())
                            setError(null)
                        }}
                        disabled={disabled || isValidating}
                        className={cn(
                            'flex-1 uppercase',
                            error && 'border-red-500 focus-visible:ring-red-500'
                        )}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                validateCoupon()
                            }
                        }}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={validateCoupon}
                        disabled={disabled || isValidating || !code.trim()}
                    >
                        {isValidating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            'Aplicar'
                        )}
                    </Button>
                </div>
            )}

            {error && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {error}
                </p>
            )}
        </div>
    )
}
