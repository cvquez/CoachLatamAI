'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Brain, Sparkles } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log('Attempting login with:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('Login response:', { data, error })

      if (error) {
        console.error('Login error:', error)
        let errorMessage = error.message

        if (errorMessage.includes('Invalid login credentials')) {
          errorMessage = 'Email o contraseña incorrectos'
        } else if (errorMessage.includes('Email not confirmed')) {
          errorMessage = 'Por favor verifica tu email antes de iniciar sesión'
        }

        toast({
          variant: 'destructive',
          title: 'Error al iniciar sesión',
          description: errorMessage,
        })
        setIsLoading(false)
        return
      }

      if (data.session) {
        console.log('Login successful, session:', data.session)
        toast({
          title: 'Éxito',
          description: 'Inicio de sesión exitoso',
        })

        await new Promise(resolve => setTimeout(resolve, 100))
        console.log('Redirecting to dashboard...')
        window.location.href = '/dashboard'
      } else {
        console.log('No session in response')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Login catch error:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ocurrió un error al iniciar sesión',
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-blue-500 to-brand-cyan-500 rounded-xl blur-sm opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-brand-blue-500 to-brand-cyan-500 p-2.5 rounded-xl shadow-brand-blue">
                <Sparkles className="h-8 w-8 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-3xl font-bold bg-gradient-to-r from-brand-blue-600 to-brand-cyan-600 bg-clip-text text-transparent">
                CoachLatamAI
              </span>
              <span className="text-[10px] text-brand-blue-500/70 font-medium tracking-widest uppercase">
                AI-Powered Coaching
              </span>
            </div>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder a tu cuenta
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="coach@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                ¿No tienes una cuenta?{' '}
                <Link href="/register" className="text-primary hover:underline">
                  Regístrate aquí
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
