import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from './components/AdminSidebar'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()

    // Doble verificación (ya lo hace el middleware, pero por seguridad)
    if (!session) {
        redirect('/login')
    }

    // Verificar rol de admin
    const { data: userProfile } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

    const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin'

    if (!isAdmin) {
        redirect('/dashboard?error=unauthorized')
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <AdminSidebar />
            <main className="md:ml-64 min-h-screen">
                <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 mt-12 md:mt-0">
                    {children}
                </div>
            </main>
        </div>
    )
}
