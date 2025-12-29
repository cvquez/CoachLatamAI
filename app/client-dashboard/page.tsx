'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Star
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Booking {
  id: string
  coach_id: string
  status: string
  start_date: string | null
  total_sessions: number
  completed_sessions: number
  session_rate: number
  coach_profile: {
    display_name: string
    avatar_url: string
    specializations: string[]
  }
}

interface Request {
  id: string
  status: string
  coaching_area: string
  created_at: string
  coach_profile: {
    display_name: string
    avatar_url: string
  }
}

export default function ClientDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [requests, setRequests] = useState<Request[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Get user data
      const { data: userInfo } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      setUserData(userInfo)

      // Get bookings
      const { data: bookingsData } = await supabase
        .from('client_bookings')
        .select(`
          *,
          coach_profile:coach_profiles(display_name, avatar_url, specializations)
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })

      setBookings(bookingsData || [])

      // Get coaching requests
      const { data: requestsData } = await supabase
        .from('coaching_requests')
        .select(`
          *,
          coach_profile:coach_profiles(display_name, avatar_url)
        `)
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })

      setRequests(requestsData || [])

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      pending: { variant: 'outline', icon: AlertCircle, label: 'Pendiente' },
      active: { variant: 'default', icon: CheckCircle2, label: 'Activo' },
      completed: { variant: 'secondary', icon: CheckCircle2, label: 'Completado' },
      cancelled: { variant: 'destructive', icon: XCircle, label: 'Cancelado' },
      accepted: { variant: 'default', icon: CheckCircle2, label: 'Aceptado' },
      rejected: { variant: 'destructive', icon: XCircle, label: 'Rechazado' },
    }

    const config = variants[status] || variants.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const stats = {
    activeBookings: bookings.filter(b => b.status === 'active').length,
    totalSessions: bookings.reduce((sum, b) => sum + b.total_sessions, 0),
    completedSessions: bookings.reduce((sum, b) => sum + b.completed_sessions, 0),
    pendingRequests: requests.filter(r => r.status === 'pending').length,
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">¡Hola, {userData?.full_name || 'Cliente'}!</h1>
              <p className="text-blue-100 mt-1">Gestiona tus sesiones de coaching</p>
            </div>
            <Link href="/marketplace">
              <Button variant="secondary">
                Buscar Coaches
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Coaches Activos</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats.activeBookings}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Sesiones Totales</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats.totalSessions}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Completadas</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats.completedSessions}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Solicitudes Pendientes</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{stats.pendingRequests}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mis Coaches */}
          <Card>
            <CardHeader>
              <CardTitle>Mis Coaches</CardTitle>
              <CardDescription>Coaches con los que estás trabajando actualmente</CardDescription>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">Aún no tienes coaches contratados</p>
                  <Link href="/marketplace">
                    <Button>Buscar Coaches</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {booking.coach_profile.display_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{booking.coach_profile.display_name}</p>
                          <p className="text-sm text-slate-600">
                            {booking.completed_sessions} / {booking.total_sessions} sesiones
                          </p>
                          <div className="flex gap-2 mt-1">
                            {booking.coach_profile.specializations?.slice(0, 2).map((spec, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(booking.status)}
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Contactar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Solicitudes */}
          <Card>
            <CardHeader>
              <CardTitle>Mis Solicitudes</CardTitle>
              <CardDescription>Solicitudes enviadas a coaches</CardDescription>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">No has enviado solicitudes aún</p>
                  <Link href="/marketplace">
                    <Button>Explorar Coaches</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {request.coach_profile.display_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{request.coach_profile.display_name}</p>
                          <p className="text-sm text-slate-600">{request.coaching_area}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        {bookings.length === 0 && requests.length === 0 && (
          <Card className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                ¡Comienza tu viaje de crecimiento!
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Explora nuestro marketplace y encuentra el coach perfecto para alcanzar tus metas
              </p>
              <Link href="/marketplace">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Explorar Coaches
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
