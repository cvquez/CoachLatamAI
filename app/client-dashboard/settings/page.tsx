'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Loader2, User, Mail, HelpCircle, MessageSquare } from 'lucide-react'

export default function ClientSettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  // Datos del perfil
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    loadUserData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadUserData() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) return

      // Obtener datos del usuario
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (userError) {
        console.error('Error loading user:', userError)
        throw userError
      }

      if (userData) {
        setUser(userData)
        setFullName(userData.full_name || '')
        setEmail(userData.email || '')
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo cargar la información del perfil',
      })
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
          full_name: fullName,
        })
        .eq('id', authUser.id)

      if (userError) throw userError

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

  // Contactar soporte (igual que coach)
  function handleContactSupport() {
    const supportEmail = 'info@athernus.com'
    const subject = encodeURIComponent('Solicitud de Soporte - CoachLatam (Cliente)')
    const body = encodeURIComponent(`
Nombre: ${fullName || 'No disponible'}
Email: ${email || 'No disponible'}

Describe tu consulta aquí:


`)
    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
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
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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

      {/* Separador */}
      <Separator className="my-8" />

      {/* Soporte */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Soporte
          </CardTitle>
          <CardDescription>
            ¿Necesitas ayuda? Contáctanos y te responderemos a la brevedad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 mb-1">
                Equipo de Soporte Athernus
              </h4>
              <p className="text-sm text-slate-600 mb-3">
                Nuestro equipo está disponible para ayudarte con cualquier consulta o problema que tengas.
              </p>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Mail className="h-4 w-4 text-blue-600" />
                <span className="font-medium">info@athernus.com</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleContactSupport}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            size="lg"
          >
            <Mail className="h-5 w-5 mr-2" />
            Contactar Soporte
          </Button>

          <div className="pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              Tiempo de respuesta estimado: 24-48 horas
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
