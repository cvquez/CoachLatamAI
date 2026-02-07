'use client'

import { z } from 'zod'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Lock, Loader2, CheckCircle, Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isValidToken, setIsValidToken] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    // Verificar que hay una sesión válida (token de reset)
    checkResetToken()
  }, [])

  async function checkResetToken() {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        setIsValidToken(true)
      } else {
        toast({
          variant: 'destructive',
          title: 'Link inválido o expirado',
          description: 'Por favor solicita un nuevo link de recuperación',
        })
        setTimeout(() => router.push('/forgot-password'), 3000)
      }
    } catch (error) {
      console.error('Error checking token:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo validar el link de recuperación',
      })
    } finally {
      setIsChecking(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones
    // Validaciones con Zod
    const passwordSchema = z.object({
      password: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
        .regex(/[^a-zA-Z0-9]/, 'La contraseña debe contener al menos un símbolo'),
      confirmPassword: z.string()
    }).refine((data) => data.password === data.confirmPassword, {
      message: "Las contraseñas no coinciden",
      path: ["confirmPassword"],
    })

    const result = passwordSchema.safeParse({ password, confirmPassword })

    if (!result.success) {
      toast({
        variant: 'destructive',
        title: 'Error de validación',
        description: result.error.errors[0].message,
      })
      return
    }

    setIsLoading(true)

    try {
      // Actualizar contraseña
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        console.error('Error updating password:', error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'No se pudo actualizar la contraseña',
        })
        return
      }

      // Éxito
      toast({
        title: 'Contraseña actualizada',
        description: 'Tu contraseña ha sido restablecida exitosamente',
      })

      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        router.push('/login')
      }, 2000)

    } catch (error) {
      console.error('Exception:', error)
      toast({
        variant: 'destructive',
        title: 'Error inesperado',
        description: 'Por favor intenta nuevamente',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white">Verificando link de recuperación...</p>
        </div>
      </div>
    )
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="w-full max-w-md border-red-500/20 bg-slate-900/90">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Link inválido o expirado</h2>
            <p className="text-slate-400">Serás redirigido en unos momentos...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <Card className="w-full max-w-md relative z-10 border-purple-500/20 bg-slate-900/90 backdrop-blur-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Nueva contraseña
          </CardTitle>
          <CardDescription className="text-slate-300">
            Establece una nueva contraseña para tu cuenta
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-6">
            {/* Nueva contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">
                Nueva contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-200">
                Confirmar contraseña
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Validación visual */}
            {password && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-slate-600'}`} />
                  <span className={password.length >= 8 ? 'text-green-400' : 'text-slate-500'}>
                    Al menos 8 caracteres
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${/\d/.test(password) && /[^a-zA-Z0-9]/.test(password) ? 'bg-green-500' : 'bg-slate-600'}`} />
                  <span className={/\d/.test(password) && /[^a-zA-Z0-9]/.test(password) ? 'text-green-400' : 'text-slate-500'}>
                    Añade números y símbolos
                  </span>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold h-12"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando contraseña...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Restablecer contraseña
                </>
              )}
            </Button>
          </form>

          {/* Información de seguridad */}
          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-slate-300">
              🔒 <strong>Consejo de seguridad:</strong>
            </p>
            <ul className="text-xs text-slate-400 mt-2 space-y-1 ml-4">
              <li>• Usa una combinación de letras, números y símbolos</li>
              <li>• No uses la misma contraseña en otros sitios</li>
              <li>• Evita información personal fácil de adivinar</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
