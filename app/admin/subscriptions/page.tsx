'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Search,
    MoreVertical,
    Loader2,
    RefreshCw,
    Filter
} from 'lucide-react'

interface Subscription {
    id: string
    user_id: string
    paypal_subscription_id: string
    status: string
    start_date: string
    next_billing_date: string | null
    cancelled_at: string | null
    created_at: string
    user?: {
        email: string
        full_name: string
    }
}

export default function AdminSubscriptions() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const { toast } = useToast()
    const supabase = createClient()

    const loadSubscriptions = async () => {
        setIsLoading(true)
        try {
            let query = supabase
                .from('subscriptions')
                .select(`
          *,
          user:users(email, full_name)
        `)
                .order('created_at', { ascending: false })

            if (statusFilter !== 'all') {
                query = query.eq('status', statusFilter)
            }

            const { data, error } = await query

            if (error) {
                console.error('Error loading subscriptions:', error)
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'No se pudieron cargar las suscripciones'
                })
                return
            }

            setSubscriptions(data || [])
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadSubscriptions()
    }, [statusFilter])

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
            active: { variant: 'default', label: 'Activa' },
            cancelled: { variant: 'destructive', label: 'Cancelada' },
            suspended: { variant: 'secondary', label: 'Suspendida' },
            expired: { variant: 'outline', label: 'Expirada' }
        }
        const config = variants[status] || { variant: 'outline', label: status }
        return <Badge variant={config.variant}>{config.label}</Badge>
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-'
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    const filteredSubscriptions = subscriptions.filter(sub => {
        if (!searchQuery) return true
        const searchLower = searchQuery.toLowerCase()
        return (
            sub.user?.email?.toLowerCase().includes(searchLower) ||
            sub.user?.full_name?.toLowerCase().includes(searchLower) ||
            sub.paypal_subscription_id?.toLowerCase().includes(searchLower)
        )
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Suscripciones</h1>
                <p className="text-muted-foreground">
                    Gestiona todas las suscripciones de la plataforma
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por email, nombre o ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Filter className="h-4 w-4 mr-2" />
                                        {statusFilter === 'all' ? 'Todos' : statusFilter}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                                        Todos
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                                        Activas
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter('cancelled')}>
                                        Canceladas
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStatusFilter('suspended')}>
                                        Suspendidas
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button variant="outline" size="sm" onClick={loadSubscriptions}>
                                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center h-32">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    ) : filteredSubscriptions.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No se encontraron suscripciones
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead>PayPal ID</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Inicio</TableHead>
                                    <TableHead>Próximo Cobro</TableHead>
                                    <TableHead className="w-10"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredSubscriptions.map((sub) => (
                                    <TableRow key={sub.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{sub.user?.full_name || 'N/A'}</p>
                                                <p className="text-sm text-muted-foreground">{sub.user?.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {sub.paypal_subscription_id}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(sub.status)}</TableCell>
                                        <TableCell>{formatDate(sub.start_date)}</TableCell>
                                        <TableCell>
                                            {sub.status === 'active'
                                                ? formatDate(sub.next_billing_date)
                                                : formatDate(sub.cancelled_at)}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>Ver detalles</DropdownMenuItem>
                                                    {sub.status === 'active' && (
                                                        <DropdownMenuItem className="text-red-600">
                                                            Cancelar suscripción
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
