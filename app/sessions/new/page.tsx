'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewSessionPage() {
  const [clients, setClients] = useState<any[]>([])
  const [clientId, setClientId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [duration, setDuration] = useState('60')
  const [sessionType, setSessionType] = useState<'online' | 'presencial'>('online')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const searchParams = useSearchParams()

  useEffect(() => {
    const loadClients = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data } = await supabase
        .from('clients')
        .select('id, name, status')
        .eq('coach_id', session.user.id)
        .eq('status', 'active')
        .order('name')

      setClients(data || [])

      const preselectedClientId = searchParams.get('clientId')
      if (preselectedClientId) {
        setClientId(preselectedClientId)
      }
    }

    loadClients()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

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

      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)

      if (scheduledDateTime < new Date()) {
        toast({
          variant: 'destructive',
          title: 'Fecha inválida',
          description: 'No puedes agendar sesiones en el pasado',
        })
        setIsLoading(false)
        return
      }

      const { error } = await supabase
        .from('sessions')
        .insert({
          coach_id: session.user.id,
          client_id: clientId,
          title,
          description: description || null,
          scheduled_date: scheduledDateTime.toISOString(),
          duration: parseInt(duration),
          session_type: sessionType,
          status: 'scheduled',
        })

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo crear la sesión',
        })
        return
      }

      toast({
        title: 'Sesión agendada',
        description: 'La sesión ha sido agendada exitosamente',
      })

      router.push('/sessions')
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Ocurrió un error al crear la sesión',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/sessions">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Sesiones
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Agendar Nueva Sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="client">Cliente *</Label>
                <Select
                  value={clientId}
                  onValueChange={setClientId}
                  disabled={isLoading}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {clients.length === 0 && (
                  <p className="text-sm text-slate-600">
                    No tienes clientes activos.{' '}
                    <Link href="/clients/new" className="text-primary hover:underline">
                      Agregar cliente
                    </Link>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título de la sesión *</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Sesión de coaching"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Hora *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duración *</Label>
                  <Select
                    value={duration}
                    onValueChange={setDuration}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="45">45 minutos</SelectItem>
                      <SelectItem value="60">60 minutos</SelectItem>
                      <SelectItem value="90">90 minutos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <Select
                    value={sessionType}
                    onValueChange={(value: any) => setSessionType(value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="presencial">Presencial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción / Objetivo</Label>
                <Textarea
                  id="description"
                  placeholder="Objetivo de la sesión..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  disabled={isLoading}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={isLoading || clients.length === 0}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Agendar Sesión'
                  )}
                </Button>
                <Link href="/sessions" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
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
