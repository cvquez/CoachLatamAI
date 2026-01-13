'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Settings, LogOut, Search, Calendar, Users } from 'lucide-react'

interface ClientNavbarProps {
  user: {
    email: string
  }
}

export default function ClientNavbar({ user }: ClientNavbarProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="w-full border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/client-dashboard" className="flex items-center gap-2">
            <span className="text-lg font-semibold text-blue-600">
              CoachLatam
            </span>
            <span className="text-xs text-slate-500">
              CLIENT DASHBOARD
            </span>
          </Link>

          {/* Navegación principal cliente */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/marketplace"
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
            >
              <Search className="h-4 w-4" />
              Marketplace
            </Link>

            <Link
              href="/client-dashboard/sessions"
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
            >
              <Calendar className="h-4 w-4" />
              Mis Sesiones
            </Link>

            <Link
              href="/client-dashboard/coaches"
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
            >
              <Users className="h-4 w-4" />
              Mis Coaches
            </Link>
          </nav>
        </div>

        {/* Menú de cuenta */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-9 w-9 rounded-full bg-blue-600 text-white hover:bg-blue-700"
            >
              {user.email.charAt(0).toUpperCase()}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            {/* Configuración */}
            <DropdownMenuItem asChild>
              <Link
                href="/client-dashboard/settings"
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Cerrar sesión */}
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
