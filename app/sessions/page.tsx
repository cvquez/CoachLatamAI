'use client'

import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar as CalendarIcon } from 'lucide-react'
import Link from 'next/link'
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, startOfWeek, endOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadSessions() {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: sessionsData } = await supabase
        .from('sessions')
        .select('*, clients(name)')
        .eq('coach_id', user.id)
        .order('scheduled_date', { ascending: true })

      setSessions(sessionsData || [])
      setLoading(false)
    }

    loadSessions()
  }, [router])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-600">Cargando...</div>
        </div>
      </DashboardLayout>
    )
  }

  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const getSessionsForDay = (day: Date) => {
    return sessions.filter(s => isSameDay(parseISO(s.scheduled_date), day))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'no_show':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Programada'
      case 'completed':
        return 'Completada'
      case 'cancelled':
        return 'Cancelada'
      case 'no_show':
        return 'No asistió'
      default:
        return status
    }
  }

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Sesiones</h1>
            <p className="text-slate-600 mt-1">Gestiona tu calendario de sesiones</p>
          </div>
          <Button asChild>
            <Link href="/sessions/new">
              <Plus className="h-4 w-4 mr-2" />
              Agendar Sesión
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {format(now, 'MMMM yyyy', { locale: es })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-slate-600">
                {weekDays.map(day => (
                  <div key={day} className="py-2">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, idx) => {
                  const daySessions = getSessionsForDay(day)
                  const isToday = isSameDay(day, now)
                  const isCurrentMonth = isSameMonth(day, now)

                  return (
                    <div
                      key={idx}
                      className={`
                        min-h-24 p-2 border rounded-lg
                        ${!isCurrentMonth && 'bg-slate-50 text-slate-400'}
                        ${isToday && 'border-blue-500 bg-blue-50'}
                      `}
                    >
                      <div className="text-sm font-medium mb-1">
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {daySessions.slice(0, 2).map((s: any) => (
                          <Link key={s.id} href={`/sessions/${s.id}`}>
                            <div
                              className={`
                                text-xs p-1 rounded truncate
                                ${s.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'}
                                hover:opacity-80 cursor-pointer
                              `}
                            >
                              {format(parseISO(s.scheduled_date), 'HH:mm')} {s.clients?.name}
                            </div>
                          </Link>
                        ))}
                        {daySessions.length > 2 && (
                          <div className="text-xs text-slate-600 pl-1">
                            +{daySessions.length - 2} más
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Todas las Sesiones</CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 mb-4">No tienes sesiones programadas</p>
                <Button asChild>
                  <Link href="/sessions/new">Agendar Primera Sesión</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((s: any) => (
                  <Link key={s.id} href={`/sessions/${s.id}`}>
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex-1">
                        <h3 className="font-medium text-slate-900">{s.title}</h3>
                        <p className="text-sm text-slate-600">{s.clients?.name}</p>
                      </div>
                      <div className="text-right mr-4">
                        <p className="text-sm font-medium text-slate-900">
                          {format(parseISO(s.scheduled_date), 'dd MMM yyyy', { locale: es })}
                        </p>
                        <p className="text-sm text-slate-600">
                          {format(parseISO(s.scheduled_date), 'HH:mm')} - {s.duration} min
                        </p>
                      </div>
                      <Badge className={getStatusColor(s.status)}>
                        {getStatusLabel(s.status)}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
