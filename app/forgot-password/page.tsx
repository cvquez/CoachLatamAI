'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        variant: 'destructive',
        title: 'Email requerido',
        description: 'Por favor ingresa tu email',
      })
      return
    }

    setIsLoading(true)

    try {
      // Supabase envía el email automáticamente
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        console.error('Error sending reset email:', error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo enviar el email. Verifica tu dirección.',
        })
        return
      }

      // Éxito
      setEmailSent(true)
      toast({
        title: 'Email enviado',
        description: 'Revisa tu bandeja de entrada para restablecer tu contraseña',
      })
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
            <Mail className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            ¿Olvidaste tu contraseña?
          </CardTitle>
          <CardDescription className="text-slate-300">
            Te enviaremos un email con instrucciones para restablecerla
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!emailSent ? (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold h-12"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando email...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar instrucciones
                  </>
                )}
              </Button>

              <div className="text-center">
                <Link 
                  href="/login" 
                  className="text-sm text-slate-400 hover:text-slate-300 inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al login
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Confirmación de email enviado */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-300 mb-2">
                  Email enviado
                </h3>
                <p className="text-slate-300 mb-4">
                  Hemos enviado las instrucciones a:
                </p>
                <p className="text-white font-semibold mb-4">
                  {email}
                </p>
                <p className="text-sm text-slate-400">
                  Revisa tu bandeja de entrada (y la carpeta de spam) y sigue las instrucciones del email.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
                  onClick={() => {
                    setEmailSent(false)
                    setEmail('')
                  }}
                >
                  Probar con otro email
                </Button>

                <Link href="/login" className="block">
                  <Button
                    variant="ghost"
                    className="w-full text-slate-400 hover:text-slate-300"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al login
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Ayuda adicional */}
          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-slate-300">
              💡 <strong>¿No recibes el email?</strong>
            </p>
            <ul className="text-xs text-slate-400 mt-2 space-y-1 ml-4">
              <li>• Revisa tu carpeta de spam</li>
              <li>• Verifica que el email sea correcto</li>
              <li>• Espera unos minutos e intenta de nuevo</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
