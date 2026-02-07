import { createClient } from '@/lib/supabase/server'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Ticket, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Coupon = {
    id: string
    code: string
    description: string
    discount_type: 'percentage' | 'fixed'
    discount_value: number
    current_uses: number
    max_uses: number | null
    valid_until: string | null
    is_active: boolean
    created_at: string
}

async function getCoupons() {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching coupons:', error)
        return []
    }

    return data as Coupon[]
}

export default async function AdminCouponsPage() {
    const coupons = await getCoupons()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Cupones de Descuento</h1>
                    <p className="text-slate-400 mt-2">Gestiona códigos promocionales.</p>
                </div>
                <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    <Link href="/admin/coupons/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Crear Cupón
                    </Link>
                </Button>
            </div>

            <Card className="bg-slate-900 border-slate-800">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-950/50">
                            <TableRow className="hover:bg-transparent border-slate-800">
                                <TableHead className="text-slate-400 pl-6">Código</TableHead>
                                <TableHead className="text-slate-400">Descuento</TableHead>
                                <TableHead className="text-slate-400">Usos</TableHead>
                                <TableHead className="text-slate-400">Estado</TableHead>
                                <TableHead className="text-slate-400">Vence</TableHead>
                                <TableHead className="text-right text-slate-400 pr-6">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {coupons.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Ticket className="w-8 h-8 text-slate-700" />
                                            <p>No hay cupones creados.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                coupons.map((coupon) => (
                                    <TableRow key={coupon.id} className="hover:bg-slate-800/50 border-slate-800">
                                        <TableCell className="pl-6 font-mono font-medium text-purple-400">
                                            {coupon.code}
                                        </TableCell>
                                        <TableCell className="text-slate-200">
                                            {coupon.discount_type === 'percentage'
                                                ? `${coupon.discount_value}% OFF`
                                                : `$${coupon.discount_value} OFF`}
                                        </TableCell>
                                        <TableCell className="text-slate-300">
                                            {coupon.current_uses} / {coupon.max_uses || '∞'}
                                        </TableCell>
                                        <TableCell>
                                            {coupon.is_active ? (
                                                <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                                                    Activo
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-slate-800 text-slate-500">
                                                    Inactivo
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-slate-400">
                                            {coupon.valid_until
                                                ? new Date(coupon.valid_until).toLocaleDateString()
                                                : 'Nunca'}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
                                                    <DropdownMenuItem className="text-slate-200 focus:bg-slate-800 cursor-pointer">
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-400 focus:bg-red-900/20 cursor-pointer">
                                                        Desactivar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
