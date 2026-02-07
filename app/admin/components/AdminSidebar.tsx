'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Ticket,
    BarChart,
    Settings,
    Shield,
    Menu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useState } from 'react'

const navItems = [
    {
        title: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
    },
    {
        title: 'Usuarios',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Suscripciones',
        href: '/admin/subscriptions',
        icon: CreditCard,
    },
    {
        title: 'Cupones',
        href: '/admin/coupons',
        icon: Ticket,
    },
    {
        title: 'Planes',
        href: '/admin/plans',
        icon: BarChart,
    },
    {
        title: 'Auditoría',
        href: '/admin/audit',
        icon: Shield,
    },
    {
        title: 'Configuración',
        href: '/admin/settings',
        icon: Settings,
    },
]

export function AdminSidebar() {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)

    const NavContent = () => (
        <div className="flex flex-col h-full py-4">
            <div className="px-6 mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
                    <Shield className="w-6 h-6 text-purple-400" />
                    Admin
                </h2>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            )}
                            onClick={() => setOpen(false)}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.title}
                        </Link>
                    )
                })}
            </nav>

            <div className="px-6 mt-auto">
                <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                    <p className="text-xs text-slate-400">CoachLatam AI</p>
                    <p className="text-xs text-slate-500 font-mono mt-1">v1.0.0 (Admin)</p>
                </div>
            </div>
        </div>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl h-screen fixed left-0 top-0 z-30">
                <NavContent />
            </aside>

            {/* Mobile Sidebar (Sheet) */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-40">
                        <Menu className="w-6 h-6 text-white" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0 bg-slate-900 border-r-slate-800">
                    <NavContent />
                </SheetContent>
            </Sheet>
        </>
    )
}
