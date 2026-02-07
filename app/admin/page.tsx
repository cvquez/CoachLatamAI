import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, DollarSign, Ticket, Activity } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

async function getStats() {
    const supabase = createClient()

    // Consultas optimizadas (count)
    const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true })
    const { count: coachesCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('user_type', 'coach')
    const { count: activeSubs } = await supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active')
    const { count: couponsCount } = await supabase.from('coupons').select('*', { count: 'exact', head: true }).eq('is_active', true)

    return {
        totalUsers: usersCount || 0,
        totalCoaches: coachesCount || 0,
        activeSubscriptions: activeSubs || 0,
        activeCoupons: couponsCount || 0,
    }
}

export default async function AdminDashboardPage() {
    const stats = await getStats()

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard General</h1>
                <p className="text-slate-400 mt-2">Bienvenido al panel de administración de CoachLatam AI.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Total Users */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-200">
                            Total Usuarios
                        </CardTitle>
                        <Users className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
                        <p className="text-xs text-slate-400 mt-1">
                            {stats.totalCoaches} coaches registrados
                        </p>
                    </CardContent>
                </Card>

                {/* Active Subscriptions */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-200">
                            Suscripciones Activas
                        </CardTitle>
                        <Activity className="h-4 w-4 text-green-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.activeSubscriptions}</div>
                        <p className="text-xs text-slate-400 mt-1">
                            +12% vs mes anterior
                        </p>
                    </CardContent>
                </Card>

                {/* Revenue (Placeholder need payment queries) */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-200">
                            Ingresos Mensuales
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">$ --</div>
                        <p className="text-xs text-slate-400 mt-1">
                            API de Pagos pendiente
                        </p>
                    </CardContent>
                </Card>

                {/* Coupons */}
                <Card className="bg-slate-900 border-slate-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-200">
                            Cupones Activos
                        </CardTitle>
                        <Ticket className="h-4 w-4 text-purple-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{stats.activeCoupons}</div>
                        <p className="text-xs text-slate-400 mt-1">
                            Disponibles para uso
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity Section (Future) */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4 bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-slate-200">Actividad Reciente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-400">No hay actividad reciente registrada.</p>
                    </CardContent>
                </Card>

                <Card className="col-span-3 bg-slate-900 border-slate-800">
                    <CardHeader>
                        <CardTitle className="text-slate-200">Suscripciones Recientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-slate-400">No hay suscripciones recientes.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
