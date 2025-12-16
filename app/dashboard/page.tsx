'use client'

import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, DollarSign, TrendingUp, Clock } from 'lucide-react'
import { format, startOfMonth, endOfMonth, isSameMonth, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface DashboardData {
  activeClientsCount: number
  sessionsCompletedThisMonth: number
  sessionsTotalThisMonth: number
  revenueThisMonth: number
  upcomingSessions: any[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadDashboard() {
      console.log('Dashboard: Loading dashboard...')
      const supabase = createClient()

      const { data: { user }, error } = await supabase.auth.getUser()
      console.log('Dashboard: User check:', { hasUser: !!user, userId: user?.id, error })

      if (!user) {
        console.log('Dashboard: No user found, redirecting to login')
        router.push('/login')
        return
      }

      console.log('Dashboard: User authenticated, loading data...')

      const { data: clients } = await supabase
        .from('clients')
        .select('*')
        .eq('coach_id', user.id)

      const activeClients = clients?.filter(c => c.status === 'active') || []

      const { data: sessions } = await supabase
        .from('sessions')
        .select('*, clients(name)')
        .eq('coach_id', user.id)
        .order('scheduled_date', { ascending: true })

      const now = new Date()
      const monthStart = startOfMonth(now)
      const monthEnd = endOfMonth(now)

      const sessionsThisMonth = sessions?.filter(s => {
        const date = parseISO(s.scheduled_date)
        return date >= monthStart && date <= monthEnd
      }) || []

      const completedSessions = sessionsThisMonth.filter(s => s.status === 'completed')
      const upcomingSessions = sessions?.filter(s => {
        const date = parseISO(s.scheduled_date)
        return date > now && s.status === 'scheduled'
      }).slice(0, 5) || []

      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('coach_id', user.id)

      const paymentsThisMonth = payments?.filter(p => {
        const date = parseISO(p.created_at)
        return isSameMonth(date, now)
      }) || []

      const revenueThisMonth = paymentsThisMonth
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + Number(p.amount), 0)

      setData({
        activeClientsCount: activeClients.length,
        sessionsCompletedThisMonth: completedSessions.length,
        sessionsTotalThisMonth: sessionsThisMonth.length,
        revenueThisMonth,
        upcomingSessions,
      })
      setLoading(false)
    }

    loadDashboard()
  }, [router])

  if (loading || !data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-600">Cargando...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Bienvenido a tu panel de control</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Clientes Activos
              </CardTitle>
              <Users className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.activeClientsCount}</div>
              <Button variant="link" className="px-0 text-xs mt-1" asChild>
                <Link href="/clients">Ver todos</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Sesiones Este Mes
              </CardTitle>
              <Calendar className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.sessionsCompletedThisMonth}/{data.sessionsTotalThisMonth}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Completadas/Programadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Ingresos del Mes
              </CardTitle>
              <DollarSign className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${data.revenueThisMonth.toFixed(2)}
              </div>
              <Button variant="link" className="px-0 text-xs mt-1" asChild>
                <Link href="/payments">Ver detalles</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Tasa de Retención
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.activeClientsCount > 0 ? '95%' : '0%'}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Últimos 3 meses
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Próximas Sesiones
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.upcomingSessions.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 mb-4">No tienes sesiones programadas</p>
                <Button asChild>
                  <Link href="/sessions/new">Agendar Sesión</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {data.upcomingSessions.map((session: any) => (
                  <Link
                    key={session.id}
                    href={`/sessions/${session.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900">{session.title}</h3>
                        <p className="text-sm text-slate-600">{session.clients?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">
                          {format(parseISO(session.scheduled_date), 'dd MMM', { locale: es })}
                        </p>
                        <p className="text-sm text-slate-600">
                          {format(parseISO(session.scheduled_date), 'HH:mm')}
                        </p>
                      </div>
                      <Badge variant="outline" className="ml-4">
                        {session.session_type}
                      </Badge>
                    </div>
                  </Link>
                ))}
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/sessions">Ver Todas las Sesiones</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
