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
import { Loader2, Sparkles, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        throw error
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Error al iniciar sesión con Google',
      })
      setIsLoading(false)
    }
  }

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

      if (data.session && data.user) {
        console.log('Login successful, checking user type...')

        // ✅ NUEVO: Obtener el tipo de usuario para redirigir correctamente
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('user_type, role, full_name')
          .eq('id', data.user.id)
          .single()

        console.log('User profile:', userProfile)

        if (profileError) {
          console.error('Error fetching user profile:', profileError)
        }

        toast({
          title: '¡Bienvenido!',
          description: `Inicio de sesión exitoso${userProfile?.full_name ? `, ${userProfile.full_name}` : ''}`,
        })

        await new Promise(resolve => setTimeout(resolve, 100))

        const isClient =
          userProfile?.user_type === 'client' ||
          userProfile?.role === 'client'

        if (isClient) {
          window.location.href = '/client-dashboard'
        } else {
          window.location.href = '/dashboard'
        }
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
                CoachLatam
              </span>
              <span className="text-[10px] text-brand-blue-500/70 font-medium tracking-widest uppercase">
                Athernus Powered Coaching
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
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* ⭐ CAMPO DE CONTRASEÑA CON LINK DE FORGOT PASSWORD */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Contraseña</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors"
                    tabIndex={-1}
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* ⭐ Implementación de Google Sign-In */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    O continúa con
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>

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
              <div className="text-sm text-center space-y-2">
                <p className="text-muted-foreground">
                  ¿No tienes una cuenta?
                </p>
                <div className="flex justify-center gap-4">
                  <Link href="/register-client" className="text-blue-600 hover:underline font-medium">
                    Busco un Coach
                  </Link>
                  <span className="text-muted-foreground">|</span>
                  <Link href="/register" className="text-purple-600 hover:underline font-medium">
                    Soy Coach
                  </Link>
                </div>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
