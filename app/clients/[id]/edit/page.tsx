'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function EditClientPage({ params }: { params: { id: string } }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [position, setPosition] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive' | 'completed'>('active')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    loadClient()
  }, [params.id])

  const loadClient = async () => {
    try {
      const { data: client, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) {
        console.error('Error loading client:', error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo cargar el cliente',
        })
        return
      }

      if (client) {
        setFullName(client.full_name || '')
        setEmail(client.email || '')
        setPhone(client.phone || '')
        setCompany(client.company || '')
        setPosition(client.position || '')
        setNotes(client.notes || '')
        setStatus(client.status || 'active')
      }
    } catch (error) {
      console.error('Exception loading client:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ocurrió un error al cargar el cliente',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Debes iniciar sesión',
        })
        return
      }

      const { error } = await supabase
        .from('clients')
        .update({
          full_name: fullName,
          email: email,
          phone: phone || null,
          company: company || null,
          position: position || null,
          notes: notes || null,
          status: status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id)
        .eq('coach_id', session.user.id)

      if (error) {
        console.error('Error updating client:', error)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: `No se pudo actualizar el cliente: ${error.message}`,
        })
        return
      }

      toast({
        title: 'Cliente actualizado',
        description: 'Los cambios se han guardado exitosamente',
      })

      router.push(`/clients/${params.id}`)
      router.refresh()
    } catch (error) {
      console.error('Exception updating client:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ocurrió un error al actualizar el cliente',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/clients/${params.id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Cliente
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Editar Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre completo *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Juan Pérez"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="cliente@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+595 972 444 079"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isSaving}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    type="text"
                    placeholder="Empresa ABC"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Cargo</Label>
                  <Input
                    id="position"
                    type="text"
                    placeholder="Gerente"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={status}
                  onValueChange={(value: any) => setStatus(value)}
                  disabled={isSaving}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  placeholder="Notas adicionales sobre el cliente..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  disabled={isSaving}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </Button>
                <Link href={`/clients/${params.id}`} className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSaving}
                    className="w-full"
                  >
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
