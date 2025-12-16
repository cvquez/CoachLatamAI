'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { createClient } from '@/lib/supabase/client';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  FileText,
  Edit,
  CheckCircle,
  Video,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';

interface Session {
  id: string;
  title: string;
  description: string;
  scheduled_date: string;
  duration: number;
  status: string;
  session_type: string;
  notes: string;
  ai_summary: string;
  session_number: number;
  pre_session_mood: string;
  post_session_mood: string;
  energy_level_start: number;
  energy_level_end: number;
  session_focus: string[];
  techniques_used: string[];
  insights: any;
  breakthrough_moments: string[];
  challenges_discussed: string[];
  homework_assigned: any;
  client_feedback: string;
  coach_observations: string;
  clients: {
    name: string;
    email: string;
  };
}

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  async function loadSession() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('sessions')
      .select('*, clients(name, email)')
      .eq('id', sessionId)
      .maybeSingle();

    if (error) {
      console.error('Error loading session:', error);
    } else {
      setSession(data);
    }

    setLoading(false);
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'scheduled':
        return 'Programada';
      case 'cancelled':
        return 'Cancelada';
      case 'in-progress':
        return 'En Progreso';
      default:
        return status;
    }
  }

  function getSessionTypeLabel(type: string) {
    switch (type) {
      case 'online':
        return 'En línea';
      case 'in-person':
        return 'Presencial';
      case 'phone':
        return 'Teléfono';
      default:
        return type;
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-600">Cargando...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!session) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-slate-600">Sesión no encontrada</p>
          <Button asChild className="mt-4">
            <Link href="/sessions">Volver a Sesiones</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{session.title}</h1>
              <p className="text-slate-600 mt-1">
                {session.clients?.name} - Sesión {session.session_number || 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {session.status === 'scheduled' && (
              <Button variant="outline" asChild>
                <Link href={`/sessions/${session.id}/results`}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completar Sesión
                </Link>
              </Button>
            )}
            {session.status === 'completed' && (
              <Button variant="outline" asChild>
                <Link href={`/sessions/${session.id}/results`}>
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Resultados
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href={`/sessions/${session.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Detalles de la Sesión</CardTitle>
              <Badge className={getStatusColor(session.status)}>
                {getStatusLabel(session.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">Fecha</p>
                  <p className="font-medium">
                    {format(parseISO(session.scheduled_date), "dd 'de' MMMM, yyyy", {
                      locale: es,
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">Hora y Duración</p>
                  <p className="font-medium">
                    {format(parseISO(session.scheduled_date), 'HH:mm', { locale: es })} -{' '}
                    {session.duration} minutos
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">Cliente</p>
                  <p className="font-medium">{session.clients?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {session.session_type === 'online' ? (
                  <Video className="h-5 w-5 text-slate-500" />
                ) : (
                  <MapPin className="h-5 w-5 text-slate-500" />
                )}
                <div>
                  <p className="text-sm text-slate-600">Tipo de Sesión</p>
                  <p className="font-medium">{getSessionTypeLabel(session.session_type)}</p>
                </div>
              </div>
            </div>

            {session.description && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Descripción</h4>
                  <p className="text-slate-700 whitespace-pre-wrap">{session.description}</p>
                </div>
              </>
            )}

            {session.session_focus && session.session_focus.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Enfoque de la Sesión</h4>
                  <div className="flex flex-wrap gap-2">
                    {session.session_focus.map((focus, index) => (
                      <Badge key={index} variant="secondary">
                        {focus}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {session.status === 'completed' && (
          <>
            {session.pre_session_mood && session.post_session_mood && (
              <Card>
                <CardHeader>
                  <CardTitle>Estado Emocional</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Estado Inicial</p>
                      <Badge variant="outline">{session.pre_session_mood}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Estado Final</p>
                      <Badge variant="outline">{session.post_session_mood}</Badge>
                    </div>
                  </div>
                  {session.energy_level_start && session.energy_level_end && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Energía Inicial</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {session.energy_level_start}/10
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Energía Final</p>
                        <p className="text-2xl font-bold text-green-600">
                          {session.energy_level_end}/10
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {session.breakthrough_moments && session.breakthrough_moments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Momentos de Avance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {session.breakthrough_moments.map((moment, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span className="text-slate-700">{moment}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {session.techniques_used && session.techniques_used.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Técnicas Utilizadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {session.techniques_used.map((technique, index) => (
                      <Badge key={index} variant="outline">
                        {technique}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {session.challenges_discussed && session.challenges_discussed.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Desafíos Discutidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {session.challenges_discussed.map((challenge, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span className="text-slate-700">{challenge}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {session.coach_observations && (
              <Card>
                <CardHeader>
                  <CardTitle>Observaciones del Coach</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap">
                    {session.coach_observations}
                  </p>
                </CardContent>
              </Card>
            )}

            {session.ai_summary && (
              <Card>
                <CardHeader>
                  <CardTitle>Resumen AI</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 whitespace-pre-wrap">{session.ai_summary}</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {session.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 whitespace-pre-wrap">{session.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
