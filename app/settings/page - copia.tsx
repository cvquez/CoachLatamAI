'use client'

import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Loader2, User, CreditCard } from 'lucide-react'
import SubscriptionManagement from '@/components/subscription/SubscriptionManagement' // ← NUEVO IMPORT
import { Separator } from '@/components/ui/separator' // Si no existe, crearlo o usar <hr>

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  // Campos del formulario
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [coachingTypes, setCoachingTypes] = useState<string[]>([])
  const [coachingMethods, setCoachingMethods] = useState<string[]>([])

  useEffect(() => {
    loadUserData()
  }, [])

  async function loadUserData() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        return
      }

      // Obtener datos del usuario
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      // Obtener perfil de coach
      const { data: coachProfile } = await supabase
        .from('coach_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single()

      if (userData) {
        setUser(userData)
        setName(userData.full_name || '')
        setEmail(userData.email || '')
      }

      if (coachProfile) {
        setCoachingTypes(coachProfile.coaching_types || [])
        setCoachingMethods(coachProfile.coaching_methods || [])
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) return

      // Actualizar usuario
      const { error: userError } = await supabase
        .from('users')
        .update({
          full_name: name,
        })
        .eq('id', authUser.id)

      if (userError) throw userError

      // Actualizar perfil de coach
      const { error: profileError } = await supabase
        .from('coach_profiles')
        .update({
          coaching_types: coachingTypes,
          coaching_methods: coachingMethods,
        })
        .eq('user_id', authUser.id)

      if (profileError) throw profileError

      toast({
        title: 'Cambios guardados',
        description: 'Tu información ha sido actualizada exitosamente',
      })

      await loadUserData()
    } catch (error: any) {
      console.error('Error saving:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'No se pudieron guardar los cambios',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Configuración</h1>
          <p className="text-slate-600 mt-2">Gestiona tu perfil y preferencias</p>
        </div>

        {/* Información Personal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Personal
            </CardTitle>
            <CardDescription>
              Actualiza tu información básica
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-slate-50"
              />
              <p className="text-sm text-slate-500">
                El email no se puede cambiar por razones de seguridad
              </p>
            </div>

            <div className="space-y-2">
              <Label>Tipos de Coaching</Label>
              <div className="text-sm text-slate-600">
                {coachingTypes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {coachingTypes.map((type) => (
                      <span
                        key={type}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">-</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Métodos de Coaching</Label>
              <div className="text-sm text-slate-600">
                {coachingMethods.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {coachingMethods.map((method) => (
                      <span
                        key={method}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full"
                      >
                        {method}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">-</p>
                )}
              </div>
            </div>

            <div className="pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ========================================= */}
        {/* NUEVA SECCIÓN: SUSCRIPCIÓN */}
        {/* ========================================= */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-slate-600" />
            <h2 className="text-xl font-semibold text-slate-900">Suscripción</h2>
          </div>
          
          <SubscriptionManagement />
        </div>
      </div>
    </DashboardLayout>
  )
}