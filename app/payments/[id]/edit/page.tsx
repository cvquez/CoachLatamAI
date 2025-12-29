'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface Client {
  id: string
  full_name: string
}

interface Session {
  id: string
  title: string
}

export default function EditPaymentPage() {
  const params = useParams()
  const router = useRouter()
  const paymentId = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [formData, setFormData] = useState({
    client_id: '',
    session_id: 'none',
    amount: '',
    currency: 'USD',
    status: 'pending',
    payment_method: '',
    payment_date: '',
    description: '',
    invoice_number: '',
    notes: '',
  })

  useEffect(() => {
    loadPaymentData()
    loadClients()
  }, [paymentId])

  useEffect(() => {
    if (formData.client_id) {
      loadClientSessions(formData.client_id)
    }
  }, [formData.client_id])

  async function loadPaymentData() {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .maybeSingle()

    if (error || !data) {
      toast.error('Pago no encontrado')
      router.push('/payments')
      return
    }

    setFormData({
      client_id: data.client_id || '',
      session_id: data.session_id || 'none',
      amount: data.amount?.toString() || '',
      currency: data.currency || 'USD',
      status: data.status || 'pending',
      payment_method: data.payment_method || '',
      payment_date: data.payment_date ? new Date(data.payment_date).toISOString().split('T')[0] : '',
      description: data.description || '',
      invoice_number: data.invoice_number || '',
      notes: data.notes || '',
    })

    setLoading(false)
  }

  async function loadClients() {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from('clients')
      .select('id, full_name')
      .eq('coach_id', user.id)
      .order('full_name')

    setClients(data || [])
  }

  async function loadClientSessions(clientId: string) {
    const supabase = createClient()

    const { data } = await supabase
      .from('sessions')
      .select('id, title')
      .eq('client_id', clientId)
      .order('scheduled_date', { ascending: false })

    setSessions(data || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('payments')
        .update({
          client_id: formData.client_id || null,
          session_id: formData.session_id === 'none' ? null : formData.session_id,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          status: formData.status,
          payment_method: formData.payment_method || null,
          payment_date: formData.payment_date ? new Date(formData.payment_date).toISOString() : null,
          description: formData.description || null,
          invoice_number: formData.invoice_number || null,
          notes: formData.notes || null,
        })
        .eq('id', paymentId)

      if (error) throw error

      toast.success('Pago actualizado exitosamente')
      router.push('/payments')
    } catch (error) {
      console.error('Error updating payment:', error)
      toast.error('Error al actualizar el pago')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', paymentId)

      if (error) throw error

      toast.success('Pago eliminado exitosamente')
      router.push('/payments')
    } catch (error) {
      console.error('Error deleting payment:', error)
      toast.error('Error al eliminar el pago')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-600">Cargando pago...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Editar Pago</h1>
              <p className="text-slate-600 mt-1">Modifica los detalles del pago</p>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente este pago de la base de datos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                  disabled={deleting}
                >
                  {deleting ? 'Eliminando...' : 'Eliminar Pago'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cliente */}
              <div className="space-y-2">
                <Label htmlFor="client">Cliente</Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) => setFormData({ ...formData, client_id: value, session_id: 'none' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sesión */}
              {formData.client_id && (
                <div className="space-y-2">
                  <Label htmlFor="session">Sesión (opcional)</Label>
                  <Select
                    value={formData.session_id || 'none'}
                    onValueChange={(value) => setFormData({ ...formData, session_id: value === 'none' ? '' : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una sesión" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ninguna</SelectItem>
                      {sessions.map((session) => (
                        <SelectItem key={session.id} value={session.id}>
                          {session.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                {/* Monto */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Monto *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                {/* Moneda */}
                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => setFormData({ ...formData, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - Dólar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="PYG">PYG - Guaraní</SelectItem>
                      <SelectItem value="ARS">ARS - Peso Argentino</SelectItem>
                      <SelectItem value="BRL">BRL - Real Brasileño</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Estado */}
                <div className="space-y-2">
                  <Label htmlFor="status">Estado *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="paid">Pagado</SelectItem>
                      <SelectItem value="failed">Fallido</SelectItem>
                      <SelectItem value="refunded">Reembolsado</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fecha de pago */}
                <div className="space-y-2">
                  <Label htmlFor="payment_date">Fecha de Pago</Label>
                  <Input
                    id="payment_date"
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                  />
                </div>

                {/* Método de pago */}
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Método de Pago</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Efectivo">Efectivo</SelectItem>
                      <SelectItem value="Transferencia">Transferencia Bancaria</SelectItem>
                      <SelectItem value="Tarjeta de Crédito">Tarjeta de Crédito</SelectItem>
                      <SelectItem value="Tarjeta de Débito">Tarjeta de Débito</SelectItem>
                      <SelectItem value="PayPal">PayPal</SelectItem>
                      <SelectItem value="Mercado Pago">Mercado Pago</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Número de factura */}
                <div className="space-y-2">
                  <Label htmlFor="invoice_number">Número de Factura</Label>
                  <Input
                    id="invoice_number"
                    placeholder="FAC-001"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                  />
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  placeholder="Sesión de coaching ejecutivo"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Notas */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notas Adicionales</Label>
                <Textarea
                  id="notes"
                  placeholder="Información adicional sobre el pago..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Botones */}
              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
