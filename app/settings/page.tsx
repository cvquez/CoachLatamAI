'use client'

import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, CreditCard } from 'lucide-react'
import { COACHING_TYPES, COACHING_METHODS } from '@/lib/types/database.types'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadSettings() {
      const supabase = createClient()

      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/login')
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()

      setUser(userData)
      setLoading(false)
    }

    loadSettings()
  }, [router])

  if (loading || !user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-600">Cargando...</div>
        </div>
      </DashboardLayout>
    )
  }

  const coachingTypeLabels = user?.coaching_type?.map(
    (type: string) => COACHING_TYPES.find(t => t.value === type)?.label
  ).filter(Boolean).join(', ') || '-'

  const coachingMethodLabels = user?.coaching_method?.map(
    (method: string) => COACHING_METHODS.find(m => m.value === method)?.label
  ).filter(Boolean).join(', ') || '-'

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Configuración</h1>
          <p className="text-slate-600 mt-1">Gestiona tu perfil y preferencias</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Nombre</label>
              <p className="text-slate-900">{user?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Email</label>
              <p className="text-slate-900">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Tipos de Coaching</label>
              <p className="text-slate-900">{coachingTypeLabels}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Métodos de Coaching</label>
              <p className="text-slate-900">{coachingMethodLabels}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Suscripción
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Plan Actual</label>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-slate-900 font-semibold capitalize">{user?.subscription_plan}</p>
                <Badge variant={user?.subscription_status === 'active' ? 'default' : 'secondary'}>
                  {user?.subscription_status}
                </Badge>
              </div>
            </div>
            <div className="pt-4 border-t">
              <h4 className="font-medium text-slate-900 mb-2">Límites del Plan</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Clientes activos: {
                  user?.subscription_plan === 'starter' ? '10' :
                  user?.subscription_plan === 'professional' ? '30' :
                  'Ilimitados'
                }</li>
                <li>• Funciones de IA incluidas</li>
                <li>• Métricas y análisis</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
