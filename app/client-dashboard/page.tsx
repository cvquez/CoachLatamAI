'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  Star,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  Search,
  Users,
  CalendarDays,
  Target
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Coach {
  id: string
  full_name: string
  email: string
  phone?: string
  avatar_url?: string
  start_date: string
  status: string
}

interface Session {
  id: string
  scheduled_date: string
  status: string
  session_type: string
  duration: number
  notes: string
  coach_id: string
  coach_full_name?: string
  coach_avatar_url?: string
}

export default function ClientDashboardPage() {
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [recentSessions, setRecentSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const [stats, setStats] = useState({
    totalCoaches: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    avgRating: '-'
  })
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      console.log('🔍 Loading dashboard for user:', user.id)

      // Obtener perfil del usuario
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      setUserData(profile)

      // ⭐ OBTENER MIS COACHES (SIN JOIN - queries separadas)
      console.log('🔍 Buscando coaches en tabla clients...')
      
      // Paso 1: Obtener relaciones
      const { data: clientRelations, error: relError } = await supabase
        .from('clients')
        .select('id, coach_id, status, start_date, created_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      console.log('📊 Client relations:', clientRelations)
      console.log('❌ Error:', relError)

      if (clientRelations && clientRelations.length > 0) {
        // Paso 2: Obtener IDs de coaches
        const coachIds = clientRelations.map(rel => rel.coach_id)
        console.log('🔍 Coach IDs:', coachIds)

        // Paso 3: Obtener datos de coaches por separado
        const { data: coachData, error: coachError } = await supabase
          .from('users')
          .select('id, full_name, email, phone')
          .in('id', coachIds)

        console.log('📊 Coach data:', coachData)
        console.log('❌ Coach error:', coachError)

        if (coachData && coachData.length > 0) {
          // Paso 4: Combinar relaciones con datos de coaches
          const coachesData = clientRelations.map(rel => {
            const coach = coachData.find(c => c.id === rel.coach_id)
            return {
              id: rel.coach_id,
              full_name: coach?.full_name || 'Coach',
              email: coach?.email || '',
              phone: coach?.phone || '',
              avatar_url: '',
              start_date: rel.start_date || rel.created_at,
              status: rel.status
            }
          })

          console.log('✅ Coaches encontrados:', coachesData)
          setCoaches(coachesData)
          setStats(prev => ({ ...prev, totalCoaches: coachesData.length }))
        } else {
          console.log('⚠️ No se pudieron obtener datos de coaches')
        }
      } else {
        console.log('⚠️ No se encontraron relaciones de coaches')
      }

      // ⭐ OBTENER MIS SESIONES (SIN JOIN - queries separadas)
      console.log('🔍 Buscando sesiones...')
      
      // Paso 1: Obtener todos los client_ids donde user_id = current user
      const { data: myClientRecords } = await supabase
        .from('clients')
        .select('id, coach_id')
        .eq('user_id', user.id)

      console.log('📊 My client records:', myClientRecords)

      if (myClientRecords && myClientRecords.length > 0) {
        const clientIds = myClientRecords.map(r => r.id)
        
        // Paso 2: Obtener sesiones
        const { data: sessions, error: sessError } = await supabase
          .from('sessions')
          .select('*')
          .in('client_id', clientIds)
          .order('scheduled_date', { ascending: false })
          .limit(5)

        console.log('📊 Sessions:', sessions)
        console.log('❌ Error:', sessError)

        if (sessions && sessions.length > 0) {
          // Paso 3: Obtener IDs de coaches de las sesiones
          const sessionCoachIds = [...new Set(sessions.map(s => s.coach_id))]
          
          const { data: sessionCoachData } = await supabase
            .from('users')
            .select('id, full_name')
            .in('id', sessionCoachIds)

          console.log('📊 Session coach data:', sessionCoachData)

          // Paso 4: Combinar sesiones con datos de coaches
          const sessionsData = sessions.map(s => {
            const coach = sessionCoachData?.find(c => c.id === s.coach_id)
            return {
              ...s,
              coach_full_name: coach?.full_name || 'Coach',
              coach_avatar_url: ''
            }
          })

          console.log('✅ Sessions con coaches:', sessionsData)
          setRecentSessions(sessionsData)

          // Calcular estadísticas
          const completed = sessions.filter(s => s.status === 'completed').length
          const upcoming = sessions.filter(s => 
            s.status === 'scheduled' && new Date(s.scheduled_date) > new Date()
          ).length
          
          setStats(prev => ({
            ...prev,
            completedSessions: completed,
            upcomingSessions: upcoming
          }))
        }
      }

    } catch (error) {
      console.error('💥 Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      scheduled: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      no_show: 'bg-gray-100 text-gray-800'
    }

    const labels = {
      scheduled: 'Programada',
      'in-progress': 'En progreso',
      completed: 'Completada',
      cancelled: 'Cancelada',
      no_show: 'No asistió'
    }

    return (
      <Badge className={styles[status as keyof typeof styles] || styles.scheduled}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    )
  }

  const formatSessionDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "d 'de' MMMM, yyyy - HH:mm", { locale: es })
    } catch {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            ¡Hola, {userData?.full_name?.split(' ')[0] || 'Usuario'}! 👋
          </h1>
          <p className="text-slate-600">
            Aquí está el resumen de tu progreso de coaching
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalCoaches}</p>
                  <p className="text-sm text-slate-600">Coaches Activos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completedSessions}</p>
                  <p className="text-sm text-slate-600">Sesiones Completadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <CalendarDays className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.upcomingSessions}</p>
                  <p className="text-sm text-slate-600">Próximas Sesiones</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.avgRating}</p>
                  <p className="text-sm text-slate-600">Calificación Promedio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contenido Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mis Coaches */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Mis Coaches
                  </CardTitle>
                  <CardDescription>
                    Coaches con los que estás trabajando actualmente
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {coaches.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">Aún no tienes coaches contratados</p>
                  <Link href="/marketplace">
                    <Button>
                      <Search className="w-4 h-4 mr-2" />
                      Buscar Coaches
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {coaches.map((coach) => (
                    <div 
                      key={coach.id}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={coach.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {getInitials(coach.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {coach.full_name}
                          </p>
                          <p className="text-sm text-slate-600">
                            {coach.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Activo
                        </Badge>
                        {coach.start_date && (
                          <p className="text-xs text-slate-500 mt-1">
                            Desde {format(new Date(coach.start_date), "MMM yyyy", { locale: es })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mis Sesiones */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Mis Sesiones
                  </CardTitle>
                  <CardDescription>
                    Tus sesiones más recientes
                  </CardDescription>
                </div>
                {recentSessions.length > 0 && (
                  <Link href="/client-dashboard/sessions">
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      Ver todas
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {recentSessions.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">No tienes sesiones programadas aún</p>
                  <Link href="/marketplace">
                    <Button>
                      <Search className="w-4 h-4 mr-2" />
                      Explorar Coaches
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentSessions.map((session) => (
                    <Link 
                      key={session.id}
                      href={`/client-dashboard/sessions/${session.id}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={session.coach_avatar_url} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                              {getInitials(session.coach_full_name || 'C')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-slate-900">
                              {session.coach_full_name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Calendar className="h-3 w-3" />
                              {formatSessionDate(session.scheduled_date)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(session.status)}
                          <ArrowRight className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-none">
          <CardContent className="py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                ¡Continúa tu viaje de crecimiento!
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Explora nuestro marketplace y encuentra más coaches que te ayuden a alcanzar tus metas
              </p>
              <Link href="/marketplace">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Search className="w-5 h-5 mr-2" />
                  Explorar Coaches
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
