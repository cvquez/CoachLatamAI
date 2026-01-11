'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, CheckCircle, Calendar, Clock, User, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';
import { MoodSelector } from '@/components/sessions/MoodSelector';
import { EnergyLevelSlider } from '@/components/sessions/EnergyLevelSlider';
import { ActionItemsManager } from '@/components/sessions/ActionItemsManager';

interface ActionItem {
  item: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface SessionData {
  id: string;
  title: string;
  scheduled_date: string;
  duration: number;
  status: string;
  notes: string;
  clients: {
    id: string;
    full_name: string;
    email: string;
  };
}

export default function CompleteSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const sessionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState<SessionData | null>(null);

  // Form states
  const [notes, setNotes] = useState('');
  const [preMood, setPreMood] = useState('');
  const [postMood, setPostMood] = useState('');
  const [energyStart, setEnergyStart] = useState(5);
  const [energyEnd, setEnergyEnd] = useState(5);
  const [breakthroughMoments, setBreakthroughMoments] = useState<string[]>([]);
  const [newBreakthrough, setNewBreakthrough] = useState('');
  const [challengesDiscussed, setChallengesDiscussed] = useState<string[]>([]);
  const [newChallenge, setNewChallenge] = useState('');
  const [techniquesUsed, setTechniquesUsed] = useState<string[]>([]);
  const [newTechnique, setNewTechnique] = useState('');
  const [sessionFocus, setSessionFocus] = useState<string[]>([]);
  const [newFocus, setNewFocus] = useState('');
  const [coachObservations, setCoachObservations] = useState('');
  const [homeworkAssigned, setHomeworkAssigned] = useState<ActionItem[]>([]);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  async function loadSession() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('sessions')
      .select(`
        *,
        clients:client_id (
          id,
          full_name,
          email
        )
      `)
      .eq('id', sessionId)
      .maybeSingle();

    if (error) {
      console.error('Error loading session:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la sesión',
        variant: 'destructive',
      });
      return;
    }

    if (!data) {
      toast({
        title: 'Error',
        description: 'Sesión no encontrada',
        variant: 'destructive',
      });
      router.push('/sessions');
      return;
    }

    setSession(data);
    setNotes(data.notes || '');
    setLoading(false);
  }

  const addBreakthroughMoment = () => {
    if (newBreakthrough.trim()) {
      setBreakthroughMoments([...breakthroughMoments, newBreakthrough]);
      setNewBreakthrough('');
    }
  };

  const removeBreakthroughMoment = (index: number) => {
    setBreakthroughMoments(breakthroughMoments.filter((_, i) => i !== index));
  };

  const addChallenge = () => {
    if (newChallenge.trim()) {
      setChallengesDiscussed([...challengesDiscussed, newChallenge]);
      setNewChallenge('');
    }
  };

  const removeChallenge = (index: number) => {
    setChallengesDiscussed(challengesDiscussed.filter((_, i) => i !== index));
  };

  const addTechnique = () => {
    if (newTechnique.trim()) {
      setTechniquesUsed([...techniquesUsed, newTechnique]);
      setNewTechnique('');
    }
  };

  const removeTechnique = (index: number) => {
    setTechniquesUsed(techniquesUsed.filter((_, i) => i !== index));
  };

  const addFocus = () => {
    if (newFocus.trim()) {
      setSessionFocus([...sessionFocus, newFocus]);
      setNewFocus('');
    }
  };

  const removeFocus = (index: number) => {
    setSessionFocus(sessionFocus.filter((_, i) => i !== index));
  };

  async function handleComplete(e: React.FormEvent) {
    e.preventDefault();

    if (!notes.trim()) {
      toast({
        title: 'Error',
        description: 'Las notas del coach son obligatorias',
        variant: 'destructive',
      });
      return;
    }

    if (!preMood || !postMood) {
      toast({
        title: 'Error',
        description: 'Debes seleccionar el estado emocional inicial y final',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      // Preparar datos para actualizar (solo campos que existen)
      const updateData: any = {
        status: 'completed',
        notes: notes,
        pre_session_mood: preMood,
        post_session_mood: postMood,
        energy_level_start: energyStart,
        energy_level_end: energyEnd,
        updated_at: new Date().toISOString(),
      };

      // Agregar arrays solo si no están vacíos
      if (breakthroughMoments.length > 0) {
        updateData.breakthrough_moments = breakthroughMoments;
      }
      if (challengesDiscussed.length > 0) {
        updateData.challenges_discussed = challengesDiscussed;
      }
      if (techniquesUsed.length > 0) {
        updateData.techniques_used = techniquesUsed;
      }
      if (sessionFocus.length > 0) {
        updateData.session_focus = sessionFocus;
      }
      if (coachObservations.trim()) {
        updateData.coach_observations = coachObservations;
      }
      if (homeworkAssigned.length > 0) {
        updateData.homework_assigned = homeworkAssigned;
      }

      console.log('Updating session with data:', updateData);

      const { error } = await supabase
        .from('sessions')
        .update(updateData)
        .eq('id', sessionId);

      if (error) {
        console.error('Error completing session:', error);
        toast({
          title: 'Error',
          description: `No se pudo completar la sesión: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Sesión completada',
        description: 'Los resultados se han guardado exitosamente',
      });

      router.push(`/sessions/${sessionId}`);
      router.refresh();
    } catch (error: any) {
      console.error('Exception completing session:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Ocurrió un error al completar la sesión',
      });
    } finally {
      setSaving(false);
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

  const sessionDate = new Date(session.scheduled_date);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/sessions/${sessionId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Completar Sesión</h1>
            <p className="text-slate-600 mt-1">
              {session.title} - {session.clients?.full_name}
            </p>
          </div>
        </div>

        {/* Session Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información de la Sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-blue-50 rounded-lg">
                  <Calendar className="h-5 w-5 text-brand-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Fecha</p>
                  <p className="font-medium text-slate-900">
                    {format(sessionDate, "d 'de' MMMM, yyyy", { locale: es })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-blue-50 rounded-lg">
                  <Clock className="h-5 w-5 text-brand-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Hora y Duración</p>
                  <p className="font-medium text-slate-900">
                    {format(sessionDate, 'HH:mm')} - {session.duration} min
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-blue-50 rounded-lg">
                  <User className="h-5 w-5 text-brand-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Cliente</p>
                  <p className="font-medium text-slate-900">
                    {session.clients?.full_name}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form */}
        <form onSubmit={handleComplete} className="space-y-6">
          {/* Notas del Coach */}
          <Card>
            <CardHeader>
              <CardTitle>Notas del Coach *</CardTitle>
              <CardDescription>
                Resumen general de la sesión, temas tratados y principales conclusiones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Registra aquí las notas principales de la sesión..."
                rows={6}
                required
                disabled={saving}
              />
            </CardContent>
          </Card>

          {/* Estado Emocional */}
          <Card>
            <CardHeader>
              <CardTitle>Estado Emocional del Cliente *</CardTitle>
              <CardDescription>
                ¿Cómo llegó el cliente a la sesión y cómo se fue?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <MoodSelector
                label="Estado Inicial"
                value={preMood}
                onChange={setPreMood}
              />

              <MoodSelector
                label="Estado Final"
                value={postMood}
                onChange={setPostMood}
              />
            </CardContent>
          </Card>

          {/* Nivel de Energía */}
          <Card>
            <CardHeader>
              <CardTitle>Nivel de Energía del Cliente</CardTitle>
              <CardDescription>
                Evalúa la energía con la que el cliente llegó y se fue de la sesión
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <EnergyLevelSlider
                label="Energía Inicial"
                value={energyStart}
                onChange={setEnergyStart}
              />

              <EnergyLevelSlider
                label="Energía Final"
                value={energyEnd}
                onChange={setEnergyEnd}
              />
            </CardContent>
          </Card>

          {/* Focos de la Sesión */}
          <Card>
            <CardHeader>
              <CardTitle>Focos de la Sesión</CardTitle>
              <CardDescription>
                Principales temas o áreas trabajadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {sessionFocus.map((focus, index) => (
                    <Badge key={index} variant="secondary" className="gap-2">
                      {focus}
                      <button
                        type="button"
                        onClick={() => removeFocus(index)}
                        className="hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newFocus}
                    onChange={(e) => setNewFocus(e.target.value)}
                    placeholder="Ej: Liderazgo, Comunicación, Toma de decisiones..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addFocus();
                      }
                    }}
                    disabled={saving}
                  />
                  <Button type="button" onClick={addFocus} size="icon" disabled={saving}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Momentos de Avance */}
          <Card>
            <CardHeader>
              <CardTitle>Momentos de Avance (Breakthroughs)</CardTitle>
              <CardDescription>
                Insights, revelaciones o avances significativos del cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {breakthroughMoments.map((moment, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-green-600 mt-1">✓</span>
                    <p className="flex-1 text-slate-700">{moment}</p>
                    <button
                      type="button"
                      onClick={() => removeBreakthroughMoment(index)}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                <div className="flex gap-2">
                  <Input
                    value={newBreakthrough}
                    onChange={(e) => setNewBreakthrough(e.target.value)}
                    placeholder="Describe un momento de avance o insight del cliente..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addBreakthroughMoment();
                      }
                    }}
                    disabled={saving}
                  />
                  <Button type="button" onClick={addBreakthroughMoment} size="icon" disabled={saving}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Desafíos Discutidos */}
          <Card>
            <CardHeader>
              <CardTitle>Desafíos Discutidos</CardTitle>
              <CardDescription>
                Obstáculos, preocupaciones o situaciones difíciles abordadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {challengesDiscussed.map((challenge, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <span className="text-orange-600 mt-1">•</span>
                    <p className="flex-1 text-slate-700">{challenge}</p>
                    <button
                      type="button"
                      onClick={() => removeChallenge(index)}
                      className="text-slate-400 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                <div className="flex gap-2">
                  <Input
                    value={newChallenge}
                    onChange={(e) => setNewChallenge(e.target.value)}
                    placeholder="Describe un desafío o situación difícil discutida..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addChallenge();
                      }
                    }}
                    disabled={saving}
                  />
                  <Button type="button" onClick={addChallenge} size="icon" disabled={saving}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Técnicas Utilizadas */}
          <Card>
            <CardHeader>
              <CardTitle>Técnicas Utilizadas</CardTitle>
              <CardDescription>
                Herramientas, metodologías o técnicas aplicadas durante la sesión
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {techniquesUsed.map((technique, index) => (
                    <Badge key={index} variant="outline" className="gap-2">
                      {technique}
                      <button
                        type="button"
                        onClick={() => removeTechnique(index)}
                        className="hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newTechnique}
                    onChange={(e) => setNewTechnique(e.target.value)}
                    placeholder="Ej: Rueda de la vida, Preguntas poderosas, Visualización..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTechnique();
                      }
                    }}
                    disabled={saving}
                  />
                  <Button type="button" onClick={addTechnique} size="icon" disabled={saving}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tareas y Compromisos */}
          <Card>
            <CardHeader>
              <CardTitle>Tareas y Compromisos para el Cliente</CardTitle>
              <CardDescription>
                Acciones que el cliente se comprometió a realizar antes de la próxima sesión
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActionItemsManager
                label=""
                items={homeworkAssigned}
                onChange={setHomeworkAssigned}
              />
            </CardContent>
          </Card>

          {/* Observaciones del Coach */}
          <Card>
            <CardHeader>
              <CardTitle>Observaciones del Coach</CardTitle>
              <CardDescription>
                Reflexiones personales, patrones observados, sugerencias para futuras sesiones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={coachObservations}
                onChange={(e) => setCoachObservations(e.target.value)}
                placeholder="Comparte tus observaciones y reflexiones como coach..."
                rows={4}
                disabled={saving}
              />
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={saving || !notes.trim() || !preMood || !postMood}
              className="flex-1 bg-gradient-to-r from-brand-green-500 to-brand-green-600 hover:from-brand-green-600 hover:to-brand-green-700"
              size="lg"
            >
              {saving ? (
                <>
                  <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Completar Sesión
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/sessions/${sessionId}`)}
              disabled={saving}
              size="lg"
            >
              Cancelar
            </Button>
          </div>

          {(!notes.trim() || !preMood || !postMood) && (
            <p className="text-sm text-amber-600 text-center">
              * Las notas del coach y el estado emocional (inicial y final) son obligatorios
            </p>
          )}
        </form>
      </div>
    </DashboardLayout>
  );
}
