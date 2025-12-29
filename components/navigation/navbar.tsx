'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Sparkles, LayoutDashboard, Users, Calendar, DollarSign, Settings, LogOut, BarChart3, Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/i18n/LanguageContext'

interface NavbarProps {
  user: {
    name: string
    email: string
    profile_image?: string
  }
}

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clientes', icon: Users },
  { href: '/sessions', label: 'Sesiones', icon: Calendar },
  { href: '/frameworks', label: 'Evaluaciones', icon: BarChart3 },
  { href: '/payments', label: 'Pagos', icon: DollarSign },
]

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const { language, setLanguage, t } = useLanguage()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()

      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente',
      })

      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ocurrió un error al cerrar sesión',
      })
    }
  }

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es')
    toast({
      title: language === 'es' ? 'Language changed' : 'Idioma cambiado',
      description: language === 'es' ? 'Language changed to English' : 'Idioma cambiado a Español',
    })
  }

  const getInitials = (name: string) => {
    // Manejar casos donde name es undefined, null o vacío
    if (!name || name.trim() === '') {
      return '??'
    }
    
    return name
      .trim()
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            {/* Logo profesional y elegante */}
            <Link href="/dashboard" className="flex items-center space-x-2.5 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue-500 to-brand-cyan-500 rounded-xl blur-sm opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-br from-brand-blue-500 to-brand-cyan-500 p-2 rounded-xl shadow-brand-blue">
                  <Sparkles className="h-5 w-5 text-white" strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-brand-blue-600 to-brand-cyan-600 bg-clip-text text-transparent">
                  CoachLatamAI
                </span>
                <span className="text-[9px] text-brand-blue-500/70 font-medium tracking-widest uppercase">
                  AI-Powered Coaching
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
                return (
                  <Button
                    key={link.href}
                    variant="ghost"
                    className={cn(
                      'gap-2 transition-all duration-200',
                      isActive 
                        ? 'bg-brand-blue-50 text-brand-blue-700 hover:bg-brand-blue-100' 
                        : 'text-slate-600 hover:text-brand-blue-600 hover:bg-slate-50'
                    )}
                    asChild
                  >
                    <Link href={link.href}>
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Selector de Idioma elegante */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="gap-2 border border-brand-blue-200 hover:border-brand-blue-400 bg-brand-blue-50/50 hover:bg-brand-blue-100 text-brand-blue-700 transition-all duration-200"
              title={t('nav.change_language')}
            >
              <Languages className="h-4 w-4" />
              <span className="font-semibold text-xs">{language.toUpperCase()}</span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full hover:ring-2 hover:ring-brand-blue-200 transition-all duration-200">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.profile_image} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-brand-blue-500 to-brand-cyan-500 text-white text-sm font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4 text-brand-blue-500" />
                    <span>Configuración</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-700">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
