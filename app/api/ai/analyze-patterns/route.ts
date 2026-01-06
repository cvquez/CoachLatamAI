import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('🔍 DEBUG - User authenticated:', user?.id, user?.email);
    
    if (authError || !user) {
      console.error('❌ DEBUG - Auth error:', authError);
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { clientId } = body;

    console.log('🔍 DEBUG - ClientId requested:', clientId);

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId es requerido' },
        { status: 400 }
      );
    }

    // ✅ VERIFICAR SI EL USUARIO ES COACH O CLIENTE
    let hasAccess = false;
    let isCoach = false;

    // Verificar si es el propio cliente
    const { data: clientRecord, error: clientError } = await supabase
      .from('clients')
      .select('user_id')
      .eq('id', clientId)
      .single();

    console.log('🔍 DEBUG - Client record:', clientRecord);
    console.log('🔍 DEBUG - Client error:', clientError);

    if (clientRecord && clientRecord.user_id === user.id) {
      hasAccess = true;
      isCoach = false;
      console.log('✅ DEBUG - Access granted: User is the client');
    }

    // Si no es el cliente, verificar si es su coach
    if (!hasAccess) {
      const { data: relationship, error: relError } = await supabase
        .from('coach_client_relationships')
        .select('id')
        .eq('coach_id', user.id)
        .eq('client_id', clientId)
        .eq('status', 'active')
        .single();

      console.log('🔍 DEBUG - Relationship found:', relationship);
      console.log('🔍 DEBUG - Relationship error:', relError);

      if (relationship) {
        hasAccess = true;
        isCoach = true;
        console.log('✅ DEBUG - Access granted: User is the coach');
      }
    }

    if (!hasAccess) {
      console.error('❌ DEBUG - Access denied. User:', user.id, 'ClientId:', clientId);
      return NextResponse.json(
        { error: 'No tienes acceso a este cliente' },
        { status: 403 }
      );
    }

    // Obtener sesiones del cliente
    const { data: sessions } = await supabase
      .from('coaching_sessions')
      .select('*')
      .eq('client_id', clientId)
      .eq('status', 'completed')
      .order('scheduled_date', { ascending: false })
      .limit(10);

    console.log('🔍 DEBUG - Sessions found:', sessions?.length || 0);

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({
        patterns: {
          recurring: 0,
          escalating: 0,
          improving: 0,
          cyclical: 0
        },
        insights: [],
        message: 'No hay suficientes sesiones completadas para analizar patrones'
      });
    }

    // Análisis básico de patrones
    const patterns = {
      recurring: 0,
      escalating: 0,
      improving: 0,
      cyclical: 0
    };

    const insights = [
      {
        type: 'info',
        title: 'Análisis en desarrollo',
        description: 'El análisis de patrones está en desarrollo. Por ahora mostramos datos básicos de tus sesiones.'
      }
    ];

    // Análisis simple basado en ratings
    const ratings = sessions
      .map(s => s.client_rating)
      .filter(r => r !== null && r !== undefined);

    if (ratings.length >= 3) {
      const recentRatings = ratings.slice(0, 3);
      const avgRecent = recentRatings.reduce((a, b) => a + b, 0) / recentRatings.length;
      
      if (avgRecent > 4) {
        patterns.improving++;
        insights.push({
          type: 'positive',
          title: 'Tendencia positiva',
          description: 'Las últimas sesiones muestran calificaciones altas, indicando progreso positivo.'
        });
      }
    }

    console.log('✅ DEBUG - Analysis completed successfully');

    return NextResponse.json({
      patterns,
      insights,
      sessionsAnalyzed: sessions.length,
      lastAnalyzed: new Date().toISOString(),
      userRole: isCoach ? 'coach' : 'client'
    });

  } catch (error) {
    console.error('❌ DEBUG - Error analyzing patterns:', error);
    return NextResponse.json(
      { error: 'Error al analizar patrones' },
      { status: 500 }
    );
  }
}
