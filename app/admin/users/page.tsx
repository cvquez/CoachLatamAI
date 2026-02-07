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
import { Input } from '@/components/ui/input'
import { Search, MoreHorizontal } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'

// Tipos
type User = {
    id: string
    email: string
    full_name: string
    role: string
    user_type: string
    subscription_status: string | null
    created_at: string
}

async function getUsers(query: string = '', page: number = 1) {
    const supabase = createClient()
    const itemsPerPage = 10
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    let dbQuery = supabase
        .from('users')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

    if (query) {
        dbQuery = dbQuery.ilike('email', `%${query}%`)
    }

    const { data, count, error } = await dbQuery

    if (error) {
        console.error('Error fetching users:', error)
        return { data: [], count: 0 }
    }

    return { data: data as User[], count: count || 0 }
}

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: { q?: string; page?: string }
}) {
    const query = searchParams.q || ''
    const page = Number(searchParams.page) || 1
    const { data: users, count } = await getUsers(query, page)
    const totalPages = Math.ceil(count / 10)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
                    <p className="text-slate-400 mt-2">Gestión de usuarios registrados y sus roles.</p>
                </div>
                {/* Futuro: Botón para invitar usuario */}
            </div>

            <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <form className="flex-1 relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                name="q"
                                placeholder="Buscar por email..."
                                className="pl-9 bg-slate-950/50 border-slate-800 text-white w-full md:w-[300px]"
                                defaultValue={query}
                            />
                        </form>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-slate-800">
                        <Table>
                            <TableHeader className="bg-slate-950/50">
                                <TableRow className="hover:bg-transparent border-slate-800">
                                    <TableHead className="text-slate-400">Nombre / Email</TableHead>
                                    <TableHead className="text-slate-400">Rol</TableHead>
                                    <TableHead className="text-slate-400">Tipo</TableHead>
                                    <TableHead className="text-slate-400">Suscripción</TableHead>
                                    <TableHead className="text-slate-400">Fecha Registro</TableHead>
                                    <TableHead className="text-right text-slate-400">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                            No se encontraron usuarios.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id} className="hover:bg-slate-800/50 border-slate-800">
                                            <TableCell>
                                                <div className="font-medium text-slate-200">{user.full_name || 'Sin nombre'}</div>
                                                <div className="text-sm text-slate-500">{user.email}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="border-slate-700 text-slate-300">
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="capitalize text-slate-300">{user.user_type}</div>
                                            </TableCell>
                                            <TableCell>
                                                {user.subscription_status === 'active' ? (
                                                    <Badge className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20">
                                                        Activa
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="bg-slate-800 text-slate-400">
                                                        {user.subscription_status || 'Inactiva'}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-slate-400">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4 text-slate-400" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800">
                                                        <DropdownMenuLabel className="text-slate-400">Acciones</DropdownMenuLabel>
                                                        <DropdownMenuItem className="text-slate-200 focus:bg-slate-800 focus:text-white cursor-pointer">
                                                            Ver detalles
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-slate-200 focus:bg-slate-800 focus:text-white cursor-pointer">
                                                            Editar rol
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-slate-800" />
                                                        <DropdownMenuItem className="text-red-400 focus:bg-red-900/20 focus:text-red-300 cursor-pointer">
                                                            Desactivar usuario
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-end space-x-2 py-4">
                        <div className="flex-1 text-sm text-slate-400">
                            Total: {count} usuarios
                        </div>
                        <div className="space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page <= 1}
                                asChild
                            >
                                <Link href={`/admin/users?page=${page - 1}&q=${query}`}>
                                    Anterior
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= totalPages}
                                asChild
                            >
                                <Link href={`/admin/users?page=${page + 1}&q=${query}`}>
                                    Siguiente
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
