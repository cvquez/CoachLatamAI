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
import { Loader2, UserCircle, Sparkles } from 'lucide-react'
import Image from 'next/image'

export default function RegisterClientPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !email || !password) {
      toast({
        variant: 'destructive',
        title: 'Campos requeridos',
        description: 'Por favor completa todos los campos obligatorios',
      })
      return
    }

    setIsLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
          },
          emailRedirectTo: `${window.location.origin}/client-dashboard`,
        },
      })

      if (authError) {
        let errorMessage = authError.message

        if (authError.message.includes('User already registered')) {
          errorMessage = 'Este email ya está registrado. Por favor inicia sesión.'
        } else if (authError.message.includes('Password should be at least')) {
          errorMessage = 'La contraseña debe tener al menos 6 caracteres'
        }

        toast({
          variant: 'destructive',
          title: 'Error al registrarse',
          description: errorMessage,
        })
        return
      }

      if (authData.user) {
        // Wait a bit for the trigger to create the user record
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Check if user exists in public.users table
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('id')
          .eq('id', authData.user.id)
          .maybeSingle()

        // If user doesn't exist, create it as CLIENT
        if (!existingUser && !checkError) {
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              email,
              full_name: name,
              role: 'coach', // Keep role as coach for compatibility with existing system
              user_type: 'client', // CRITICAL: This marks user as CLIENT (not coach)
              subscription_plan: 'starter',
              subscription_status: 'active',
            })

          if (insertError) {
            console.error('Error creating user profile:', insertError)
            toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Hubo un problema al crear tu perfil',
            })
            return
          }

          console.log('✅ Cliente creado exitosamente con user_type=client')
        } else if (existingUser) {
          // If user exists but registered as coach by mistake, update to client
          const { error: updateError } = await supabase
            .from('users')
            .update({
              user_type: 'client',
              full_name: name,
            })
            .eq('id', authData.user.id)

          if (updateError) {
            console.error('Error updating user type:', updateError)
          }

          // Delete coach_profile if it exists
          const { error: deleteProfileError } = await supabase
            .from('coach_profiles')
            .delete()
            .eq('user_id', authData.user.id)

          if (!deleteProfileError) {
            console.log('✅ Coach profile eliminado (usuario convertido a cliente)')
          }
        }

        // Check if session exists
        if (authData.session) {
          toast({
            title: '¡Bienvenido!',
            description: 'Tu cuenta de cliente ha sido creada exitosamente',
          })
          router.push('/client-dashboard')
          router.refresh()
        } else {
          toast({
            title: 'Cuenta creada',
            description: 'Por favor verifica tu email para activar tu cuenta',
          })
          router.push('/login')
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
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
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      
      <Card className="w-full max-w-lg relative z-10 border-purple-500/20 bg-slate-900/90 backdrop-blur-xl">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
            <UserCircle className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Registro de Cliente
          </CardTitle>
          <CardDescription className="text-slate-300">
            Encuentra y conecta con los mejores coaches
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-200">Nombre Completo *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-200">Teléfono (opcional)</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+595 981 123 456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Contraseña *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400"
              />
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="text-sm text-slate-300">
                  <p className="font-semibold text-blue-300 mb-1">Beneficios de registrarte:</p>
                  <ul className="space-y-1 text-slate-400">
                    <li>✓ Busca entre cientos de coaches certificados</li>
                    <li>✓ Lee reseñas de otros clientes</li>
                    <li>✓ Gestiona tus sesiones desde un solo lugar</li>
                    <li>✓ Seguimiento de tu progreso personal</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold h-12"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                <>
                  <UserCircle className="mr-2 h-4 w-4" />
                  Crear Cuenta de Cliente
                </>
              )}
            </Button>

            <div className="text-center text-sm text-slate-400">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold">
                Inicia sesión
              </Link>
            </div>

            <div className="text-center text-sm text-slate-400">
              ¿Eres coach?{' '}
              <Link href="/register" className="text-purple-400 hover:text-purple-300 font-semibold">
                Regístrate como coach
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
