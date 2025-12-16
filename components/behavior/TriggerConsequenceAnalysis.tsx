"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Zap,
  ArrowRight,
  Brain,
  Heart,
  Activity,
  Target,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface TriggerConsequenceAnalysisProps {
  analysisData: TriggerAnalysisData;
}

const categoryIcons = {
  environmental: Activity,
  emotional: Heart,
  interpersonal: TrendingUp,
  cognitive: Brain,
};

const categoryColors = {
  environmental: "bg-blue-100 text-blue-800 border-blue-200",
  emotional: "bg-pink-100 text-pink-800 border-pink-200",
  interpersonal: "bg-purple-100 text-purple-800 border-purple-200",
  cognitive: "bg-amber-100 text-amber-800 border-amber-200",
};

export function TriggerConsequenceAnalysis({ analysisData }: TriggerConsequenceAnalysisProps) {
  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            Resumen del Análisis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-blue-900">Insight Clave</h4>
              <p className="text-sm text-slate-700">{analysisData.summary.keyInsight}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-blue-900">Patrón Principal</h4>
              <p className="text-sm text-slate-700">{analysisData.summary.primaryPattern}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-blue-900">Desafío Principal</h4>
              <p className="text-sm text-slate-700">{analysisData.summary.mainChallenge}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-blue-900">Mejor Oportunidad</h4>
              <p className="text-sm text-slate-700">{analysisData.summary.bestOpportunity}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="triggers" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="triggers">Triggers</TabsTrigger>
          <TabsTrigger value="chains">Cadenas</TabsTrigger>
          <TabsTrigger value="consequences">Consecuencias</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="triggers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {Object.entries(analysisData.triggerAnalysis.triggerCategories).map(([category, triggers]) => {
              const Icon = categoryIcons[category as keyof typeof categoryIcons];
              const colorClass = categoryColors[category as keyof typeof categoryColors];

              if (!triggers || triggers.length === 0) return null;

              return (
                <Card key={category}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Icon className="h-4 w-4" />
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {triggers.map((trigger: string, i: number) => (
                        <Badge key={i} variant="outline" className={colorClass}>
                          {trigger}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Triggers Comunes Identificados</h3>
            {analysisData.triggerAnalysis.commonTriggers.map((trigger, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-orange-500" />
                        {trigger.trigger}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Frecuencia: {trigger.frequency}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Heart className="h-3 w-3" />
                      Impacto Emocional
                    </h4>
                    <p className="text-sm text-slate-600">{trigger.emotionalImpact}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Activity className="h-3 w-3" />
                      Comportamientos Asociados
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {trigger.associatedBehaviors.map((behavior, i) => (
                        <Badge key={i} variant="secondary">
                          {behavior}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-green-800">
                      <Target className="h-3 w-3" />
                      Estrategia de Intervención
                    </h4>
                    <p className="text-sm text-green-900">{trigger.interventionStrategy}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="chains" className="space-y-4">
          <div className="space-y-4">
            {analysisData.behaviorChains.map((chain, index) => (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="bg-slate-50">
                  <CardTitle className="text-lg">{chain.chainTitle}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-24 text-xs font-semibold text-slate-600">
                        TRIGGER
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <div className="flex-1 bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p className="text-sm text-slate-800">{chain.trigger}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-24 text-xs font-semibold text-slate-600">
                        PENSAMIENTO
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-slate-800">{chain.thought}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-24 text-xs font-semibold text-slate-600">
                        EMOCIÓN
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <div className="flex-1 bg-pink-50 border border-pink-200 rounded-lg p-3">
                        <p className="text-sm text-slate-800">{chain.emotion}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-24 text-xs font-semibold text-slate-600">
                        COMPORTAMIENTO
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <div className="flex-1 bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-sm text-slate-800">{chain.behavior}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-24 text-xs font-semibold text-slate-600">
                        CONSECUENCIA
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-sm text-slate-800">{chain.shortTermConsequence}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-amber-900">
                          <AlertTriangle className="h-4 w-4" />
                          Punto de Quiebre
                        </h4>
                        <p className="text-sm text-amber-900">{chain.breakPoint}</p>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-green-900">
                          <CheckCircle className="h-4 w-4" />
                          Alternativa Saludable
                        </h4>
                        <p className="text-sm text-green-900">{chain.alternativeChain}</p>
                      </div>
                    </div>

                    <div className="bg-slate-100 border border-slate-200 rounded-lg p-4">
                      <h4 className="font-semibold text-sm mb-2 text-slate-700">
                        Factor de Refuerzo
                      </h4>
                      <p className="text-sm text-slate-600">{chain.reinforcementFactor}</p>
                    </div>

                    <div className="bg-slate-100 border border-slate-200 rounded-lg p-4">
                      <h4 className="font-semibold text-sm mb-2 text-slate-700">
                        Consecuencia a Largo Plazo
                      </h4>
                      <p className="text-sm text-slate-600">{chain.longTermConsequence}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="consequences" className="space-y-4">
          {analysisData.consequenceAnalysis.behaviorConsequences.map((consequence, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>{consequence.behavior}</CardTitle>
                  <Badge variant={consequence.isHelpful ? "default" : "destructive"}>
                    {consequence.isHelpful ? "Útil" : "Problemático"}
                  </Badge>
                </div>
                <CardDescription>
                  Tipo de refuerzo: {consequence.reinforcementType}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Consecuencias Inmediatas</h4>
                  <ul className="space-y-1">
                    {consequence.immediateConsequences.map((cons, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-orange-500">•</span>
                        <span>{cons}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Consecuencias a Largo Plazo</h4>
                  <ul className="space-y-1">
                    {consequence.longTermConsequences.map((cons, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-red-500">•</span>
                        <span>{cons}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Separator />

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h4 className="font-semibold text-sm mb-2 text-green-800">
                    Comportamiento Alternativo
                  </h4>
                  <p className="text-sm text-green-900">{consequence.alternativeBehavior}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {["high", "medium", "low"].map((priorityLevel) => {
            const recs = analysisData.recommendations.filter(
              (r) => r.priority === priorityLevel
            );

            if (recs.length === 0) return null;

            return (
              <div key={priorityLevel} className="space-y-3">
                <h3 className="text-lg font-semibold capitalize flex items-center gap-2">
                  {priorityLevel === "high" && <AlertTriangle className="h-5 w-5 text-red-500" />}
                  Prioridad {priorityLevel === "high" ? "Alta" : priorityLevel === "medium" ? "Media" : "Baja"}
                </h3>
                {recs.map((rec, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-base">{rec.recommendation}</CardTitle>
                      <CardDescription>
                        Categoría: {rec.category.replace(/_/g, " ")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Razón</h4>
                        <p className="text-sm text-slate-600">{rec.rationale}</p>
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-semibold text-sm mb-3">Pasos de Implementación</h4>
                        <div className="space-y-2">
                          {rec.implementationSteps.map((step, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                                {i + 1}
                              </div>
                              <p className="text-sm text-slate-700 pt-0.5">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
