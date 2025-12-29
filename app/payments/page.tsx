'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DollarSign, Plus, Filter, TrendingUp, Calendar } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

interface Payment {
  id: string
  amount: number
  currency: string
  status: string
  payment_method: string
  payment_date: string
  description: string
  invoice_number: string
  created_at: string
  clients: {
    full_name: string
  } | null
  sessions: {
    title: string
  } | null
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const router = useRouter()

  useEffect(() => {
    loadPayments()
  }, [])

  useEffect(() => {
    filterPayments()
  }, [statusFilter, payments])

  async function loadPayments() {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        clients(full_name),
        sessions(title)
      `)
      .eq('coach_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading payments:', error)
    } else {
      setPayments(data || [])
    }

    setLoading(false)
  }

  function filterPayments() {
    if (statusFilter === 'all') {
      setFilteredPayments(payments)
    } else {
      setFilteredPayments(payments.filter(p => p.status === statusFilter))
    }
  }

  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const totalPending = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const thisMonthPaid = payments
    .filter(p => {
      const date = parseISO(p.created_at)
      const now = new Date()
      return p.status === 'paid' && 
             date.getMonth() === now.getMonth() && 
             date.getFullYear() === now.getFullYear()
    })
    .reduce((sum, p) => sum + Number(p.amount), 0)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pagado'
      case 'pending':
        return 'Pendiente'
      case 'failed':
        return 'Fallido'
      case 'refunded':
        return 'Reembolsado'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-600">Cargando pagos...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Pagos</h1>
            <p className="text-slate-600 mt-1">Gestiona tus ingresos y pagos</p>
          </div>
          <Button asChild>
            <Link href="/payments/new">
              <Plus className="h-4 w-4 mr-2" />
              Registrar Pago
            </Link>
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pagado</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ${totalPaid.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                Total de ingresos confirmados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ${thisMonthPaid.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                Ingresos del mes actual
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                ${totalPending.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground">
                Por cobrar
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y tabla */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Historial de Pagos</CardTitle>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="paid">Pagados</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="failed">Fallidos</SelectItem>
                    <SelectItem value="refunded">Reembolsados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">
                  {statusFilter === 'all' 
                    ? 'No hay pagos registrados aún' 
                    : `No hay pagos ${getStatusLabel(statusFilter).toLowerCase()}`}
                </p>
                <Button asChild>
                  <Link href="/payments/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Primer Pago
                  </Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Factura</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.payment_date 
                          ? format(parseISO(payment.payment_date), 'dd/MM/yyyy', { locale: es })
                          : format(parseISO(payment.created_at), 'dd/MM/yyyy', { locale: es })}
                      </TableCell>
                      <TableCell>{payment.clients?.full_name || 'N/A'}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {payment.sessions?.title || payment.description || 'N/A'}
                      </TableCell>
                      <TableCell className="font-semibold">
                        ${Number(payment.amount).toLocaleString('es-ES', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })}
                      </TableCell>
                      <TableCell>{payment.payment_method || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(payment.status)}>
                          {getStatusLabel(payment.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{payment.invoice_number || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <Link href={`/payments/${payment.id}/edit`}>
                            Editar
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
