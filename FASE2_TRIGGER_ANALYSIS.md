# FASE 2 - EVALUACION: Análisis de Triggers y Consecuencias con IA

## Resumen

Se ha implementado exitosamente el sistema de análisis avanzado de triggers y consecuencias utilizando IA (GPT-4 Turbo) para identificar patrones de comportamiento, disparadores, consecuencias y puntos de intervención en el proceso de coaching.

## Funcionalidades Implementadas

### 1. Endpoint de IA para Análisis de Triggers y Consecuencias

**Ruta:** `/api/ai/analyze-triggers-consequences/route.ts`

Este endpoint realiza un análisis profundo de las observaciones de comportamiento usando IA para identificar:

#### Análisis de Triggers
- **Common Triggers**: Disparadores más frecuentes con su frecuencia, impacto emocional y comportamientos asociados
- **Trigger Categories**: Clasificación en 4 categorías:
  - **Environmental**: Triggers del entorno físico o situacional
  - **Emotional**: Triggers emocionales internos
  - **Interpersonal**: Triggers relacionados con interacciones sociales
  - **Cognitive**: Triggers de pensamientos y creencias

#### Análisis de Consecuencias
- **Immediate Consequences**: Resultados inmediatos del comportamiento
- **Long-Term Consequences**: Impacto a largo plazo
- **Reinforcement Type**: Tipo de reforzamiento (positivo/negativo/castigo/remoción)
- **Alternative Behaviors**: Comportamientos alternativos sugeridos

#### Cadenas de Comportamiento (Behavior Chains)
Mapeo completo de la secuencia:
1. **Trigger** → Qué inicia la cadena
2. **Thought** → Elemento cognitivo
3. **Emotion** → Respuesta emocional
4. **Behavior** → Acción tomada
5. **Short-term Consequence** → Resultado inmediato
6. **Long-term Consequence** → Impacto duradero
7. **Break Point** → Punto óptimo de intervención
8. **Alternative Chain** → Secuencia alternativa más saludable

#### Recomendaciones
- **Priority**: Alta, media o baja
- **Category**:
  - trigger_management
  - behavior_modification
  - consequence_restructuring
- **Implementation Steps**: Pasos específicos para implementar

### 2. Componente de Visualización

**Archivo:** `/components/behavior/TriggerConsequenceAnalysis.tsx`

Componente React completo con 4 pestañas principales:

#### Pestaña 1: Triggers
- Visualización por categorías con íconos y colores distintivos
- Cards detalladas de cada trigger común con:
  - Frecuencia de ocurrencia
  - Impacto emocional
  - Comportamientos asociados
  - Estrategia de intervención

#### Pestaña 2: Cadenas de Comportamiento
- Visualización paso a paso de la cadena trigger-behavior-consequence
- Código de colores para cada elemento de la cadena
- Identificación clara del punto de quiebre óptimo
- Sugerencia de cadena alternativa saludable
- Factores de reforzamiento

#### Pestaña 3: Consecuencias
- Análisis de cada comportamiento
- Consecuencias inmediatas y a largo plazo
- Tipo de reforzamiento
- Indicador de si el comportamiento es útil o problemático
- Sugerencias de comportamientos alternativos

#### Pestaña 4: Recomendaciones
- Organizadas por prioridad (Alta/Media/Baja)
- Razón detallada de cada recomendación
- Pasos de implementación numerados
- Categorización por tipo de intervención

### 3. Integración en Página de Patterns

**Archivo actualizado:** `/app/clients/[id]/patterns/page.tsx`

Mejoras implementadas:
- Nueva pestaña "Análisis Triggers" como primera pestaña (por defecto)
- Dos botones de análisis:
  - **"Analizar Triggers"** (principal): Ejecuta el análisis de triggers y consecuencias
  - **"Analizar Patrones"** (secundario): Análisis de patrones existente
- Estado de carga durante el análisis
- Integración automática del componente de visualización
- Pantalla inicial con call-to-action cuando no hay análisis

## Estructura de Datos del Análisis

```typescript
interface TriggerAnalysisData {
  triggerAnalysis: {
    commonTriggers: Array<{
      trigger: string;
      frequency: string;
      associatedBehaviors: string[];
      emotionalImpact: string;
      interventionStrategy: string;
    }>;
    triggerCategories: {
      environmental: string[];
      emotional: string[];
      interpersonal: string[];
      cognitive: string[];
    };
  };
  consequenceAnalysis: {
    behaviorConsequences: Array<{
      behavior: string;
      immediateConsequences: string[];
      longTermConsequences: string[];
      reinforcementType: string;
      isHelpful: boolean;
      alternativeBehavior: string;
    }>;
  };
  behaviorChains: Array<{
    chainTitle: string;
    trigger: string;
    thought: string;
    emotion: string;
    behavior: string;
    shortTermConsequence: string;
    longTermConsequence: string;
    reinforcementFactor: string;
    breakPoint: string;
    alternativeChain: string;
  }>;
  recommendations: Array<{
    priority: string;
    category: string;
    recommendation: string;
    rationale: string;
    implementationSteps: string[];
  }>;
  summary: {
    keyInsight: string;
    primaryPattern: string;
    mainChallenge: string;
    bestOpportunity: string;
  };
}
```

## Cómo Usar

### Paso 1: Registrar Observaciones de Comportamiento

1. Navega a la página de un cliente
2. Ve a "Patrones de Comportamiento"
3. En la pestaña "Track New", registra observaciones de comportamiento:
   - Categoría del comportamiento
   - Título y descripción
   - Contexto
   - Intensidad (1-10)
   - Estado emocional
   - Triggers identificados

### Paso 2: Ejecutar Análisis de Triggers

1. En la página de Patrones, haz clic en el botón **"Analizar Triggers"**
2. La IA procesará todas las observaciones (hasta 30 más recientes)
3. El análisis toma aproximadamente 10-20 segundos
4. Una vez completado, verás:
   - Resumen ejecutivo con insights clave
   - 4 pestañas de análisis detallado
   - Insights automáticamente guardados en la base de datos

### Paso 3: Revisar Análisis

#### En la pestaña "Triggers":
- Revisa los triggers clasificados por categoría
- Identifica los triggers más frecuentes
- Lee las estrategias de intervención sugeridas

#### En la pestaña "Cadenas":
- Estudia las cadenas completas de comportamiento
- Identifica los puntos de quiebre óptimos
- Revisa las alternativas saludables sugeridas

#### En la pestaña "Consecuencias":
- Analiza qué está reforzando los comportamientos
- Identifica consecuencias problemáticas
- Considera los comportamientos alternativos

#### En la pestaña "Recomendaciones":
- Prioriza las recomendaciones de alta prioridad
- Sigue los pasos de implementación
- Implementa las estrategias en sesiones de coaching

### Paso 4: Aplicar en Sesiones

1. Usa los insights generados para:
   - Preparar preguntas para la próxima sesión
   - Diseñar intervenciones específicas
   - Trabajar en puntos de quiebre identificados
   - Proponer comportamientos alternativos
2. Los insights se guardan automáticamente en `behavior_insights`
3. Puedes compartirlos con el cliente cambiando la visibilidad

## Diseño y UX

### Código de Colores
- **Orange/Red**: Triggers y alertas
- **Blue**: Pensamientos y elementos cognitivos
- **Pink**: Emociones
- **Purple**: Comportamientos
- **Green**: Recomendaciones y alternativas positivas
- **Amber**: Puntos de atención y quiebre

### Íconos
- ⚡ (Zap): Triggers
- 🧠 (Brain): Pensamientos/Cognitivo
- ❤️ (Heart): Emociones
- 📊 (Activity): Comportamientos
- 🎯 (Target): Estrategias de intervención
- ✅ (CheckCircle): Alternativas saludables
- ⚠️ (AlertTriangle): Puntos de quiebre
- 💡 (Lightbulb): Insights clave

### Responsive
- Grid adaptativo para diferentes tamaños de pantalla
- Cards apilables en móvil
- Pestañas scrollables en dispositivos pequeños

## Integración con Base de Datos

### Tablas Utilizadas
- **behavior_observations**: Fuente de datos para el análisis
- **behavior_categories**: Categorización de comportamientos
- **behavior_insights**: Almacenamiento de insights generados

### Políticas RLS
- Solo coaches pueden ver y analizar comportamientos de sus clientes
- Los insights pueden ser compartidos con clientes (visibility: client_shared)
- Todos los análisis están vinculados al coach_id

## Requisitos Técnicos

### Variables de Entorno
```env
OPENAI_API_KEY=sk-your-openai-api-key
```

### Modelo de IA
- **GPT-4 Turbo Preview** (`gpt-4-turbo-preview`)
- Formato de respuesta: JSON estructurado
- Temperature: 0.7 (balance entre creatividad y precisión)
- Max tokens: 3000 (análisis detallado)

### Dependencias
- OpenAI SDK (ya instalado)
- React, Next.js 13
- Supabase client
- Lucide React (iconos)
- shadcn/ui components

## Archivos Creados/Modificados

### Nuevos Archivos
```
app/
  api/
    ai/
      analyze-triggers-consequences/
        route.ts                    # Endpoint de análisis de triggers

components/
  behavior/
    TriggerConsequenceAnalysis.tsx  # Componente de visualización
```

### Archivos Modificados
```
app/
  clients/
    [id]/
      patterns/
        page.tsx                     # Integración del análisis
```

## Seguridad y Privacidad

- Todos los análisis son privados del coach por defecto
- Los insights pueden ser compartidos con el cliente de forma controlada
- Los datos de comportamiento nunca salen del servidor excepto para OpenAI (encriptados en tránsito)
- RLS (Row Level Security) protege todos los datos

## Manejo de Errores

### Casos Cubiertos
1. **Sin observaciones**: Mensaje claro indicando que se necesitan observaciones
2. **API key no configurada**: Error 500 con mensaje descriptivo
3. **Error de OpenAI**: Captura y muestra el mensaje de error
4. **Timeout**: Timeout de 3 minutos para análisis largos
5. **Errores de red**: Toast con mensaje de error amigable

## Métricas y Performance

- **Tiempo de análisis**: ~10-20 segundos para 30 observaciones
- **Tokens usados**: ~2000-2500 tokens por análisis
- **Costo estimado**: $0.02-0.03 por análisis (GPT-4 Turbo)
- **Cache**: Los resultados se guardan en la base de datos

## Próximos Pasos Sugeridos

1. **Análisis Comparativo**: Comparar análisis en diferentes momentos para ver evolución
2. **Alertas Automáticas**: Notificar al coach cuando se detecten patrones de escalada
3. **Visualización de Tendencias**: Gráficas de evolución de triggers a lo largo del tiempo
4. **Compartir con Cliente**: Interface para que el cliente vea insights compartidos
5. **Exportar Reportes**: Generar PDFs con análisis completo

## Testing

### Casos de Prueba
1. ✅ Análisis con 30+ observaciones
2. ✅ Análisis con pocas observaciones (<5)
3. ✅ Análisis sin observaciones (error manejado)
4. ✅ Múltiples análisis consecutivos
5. ✅ Análisis en diferentes clientes

### Build
```bash
npm run build
```
✅ Build exitoso sin errores ni warnings

## Soporte

Si encuentras problemas:
1. Verifica que `OPENAI_API_KEY` está configurada
2. Asegúrate de tener observaciones de comportamiento registradas
3. Revisa la consola del navegador para errores
4. Verifica que Supabase está funcionando
5. Confirma que tienes créditos en tu cuenta de OpenAI

## Notas Técnicas

- El análisis usa el sistema de **Análisis Funcional del Comportamiento (ABA)**
- Se basa en el modelo **ABC**: Antecedent-Behavior-Consequence
- Identifica cadenas conductuales completas
- Proporciona intervenciones basadas en evidencia
- Utiliza principios de psicología cognitivo-conductual

## Conclusión

Esta implementación de la FASE 2 proporciona a los coaches una herramienta poderosa basada en IA para:
- Identificar triggers y patrones de comportamiento
- Entender las consecuencias que mantienen los comportamientos
- Encontrar puntos de intervención óptimos
- Diseñar estrategias de cambio efectivas
- Mejorar los resultados del coaching con insights basados en datos

La interfaz intuitiva y visualmente clara hace que el análisis complejo sea fácil de entender y aplicar en el trabajo diario de coaching.
