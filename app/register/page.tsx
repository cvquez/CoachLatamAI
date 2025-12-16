'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Brain } from 'lucide-react'
import { COACHING_TYPES, COACHING_METHODS } from '@/lib/types/database.types'
import type { CoachingType, CoachingMethod } from '@/lib/types/database.types'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [coachingTypes, setCoachingTypes] = useState<CoachingType[]>([])
  const [coachingMethods, setCoachingMethods] = useState<CoachingMethod[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const toggleCoachingType = (type: CoachingType) => {
    setCoachingTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const toggleCoachingMethod = (method: CoachingMethod) => {
    setCoachingMethods(prev =>
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    )
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (coachingTypes.length === 0 || coachingMethods.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Campos requeridos',
        description: 'Por favor selecciona al menos un tipo de coaching y un método',
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
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (authError) {
        let errorMessage = authError.message

        // Provide more user-friendly error messages
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

        // If user doesn't exist, create it
        if (!existingUser && !checkError) {
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              email,
              name,
              role: 'coach',
              coaching_type: coachingTypes,
              coaching_method: coachingMethods,
              subscription_plan: 'starter',
              subscription_status: 'trial',
            })

          if (insertError) {
            console.error('Error creating user profile:', insertError)
          }
        } else {
          // Update existing user with coaching information
          const { error: updateError } = await supabase
            .from('users')
            .update({
              name,
              coaching_type: coachingTypes,
              coaching_method: coachingMethods,
            })
            .eq('id', authData.user.id)

          if (updateError) {
            console.error('Error updating profile:', updateError)
          }
        }

        // Check if session exists (email confirmation disabled) or if email needs confirmation
        if (authData.session) {
          toast({
            title: 'Cuenta creada',
            description: 'Tu cuenta ha sido creada exitosamente',
          })
          router.push('/dashboard')
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
        title: 'Error',
        description: 'Ocurrió un error al crear la cuenta',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-2xl">
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="bg-slate-900 p-2 rounded-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">CoachHub</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Crear Cuenta</CardTitle>
            <CardDescription>
              Completa el formulario para comenzar tu prueba gratuita
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
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
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-3">
                <Label>Tipo de Coaching (selecciona uno o más)</Label>
                <div className="space-y-3 border rounded-lg p-4">
                  {COACHING_TYPES.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`type-${type.value}`}
                        checked={coachingTypes.includes(type.value)}
                        onCheckedChange={() => toggleCoachingType(type.value)}
                        disabled={isLoading}
                      />
                      <label
                        htmlFor={`type-${type.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {type.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Método de Coaching (selecciona uno o más)</Label>
                <div className="space-y-3 border rounded-lg p-4">
                  {COACHING_METHODS.map((method) => (
                    <div key={method.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`method-${method.value}`}
                        checked={coachingMethods.includes(method.value)}
                        onCheckedChange={() => toggleCoachingMethod(method.value)}
                        disabled={isLoading}
                      />
                      <label
                        htmlFor={`method-${method.value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {method.label}
                      </label>
                    </div>
                  ))}
                </div>
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
                    Creando cuenta...
                  </>
                ) : (
                  'Crear Cuenta'
                )}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                ¿Ya tienes una cuenta?{' '}
                <Link href="/login" className="text-primary hover:underline">
                  Inicia sesión aquí
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
