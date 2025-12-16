import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const { clientId, behaviorObservations } = await request.json();

    if (!clientId) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
    }

    let observations = behaviorObservations;

    if (!observations) {
      const { data, error } = await supabase
        .from("behavior_observations")
        .select(`
          *,
          behavior_categories (
            name,
            description,
            color
          )
        `)
        .eq("client_id", clientId)
        .order("observed_at", { ascending: false })
        .limit(30);

      if (error || !data || data.length === 0) {
        return NextResponse.json(
          { error: "No behavior observations found for analysis" },
          { status: 404 }
        );
      }

      observations = data;
    }

    const prompt = `You are an expert behavioral psychologist and coaching analyst specializing in identifying triggers, consequences, and behavior chains.

Analyze the following behavior observations and identify:

1. PRIMARY TRIGGERS: What events, situations, thoughts, or feelings consistently precede each behavior?
2. CONSEQUENCES: What are the immediate and long-term results of each behavior?
3. TRIGGER-BEHAVIOR-CONSEQUENCE CHAINS: Map out the complete chain for each pattern
4. INTERVENTION POINTS: Where can the client interrupt negative patterns?
5. REINFORCEMENT PATTERNS: What consequences are reinforcing unwanted behaviors?

BEHAVIOR OBSERVATIONS:
${observations.map((obs: any, i: number) => `
Observation ${i + 1}:
  Category: ${obs.behavior_categories?.name || 'Unknown'}
  Behavior: ${obs.behavior_title}
  Description: ${obs.behavior_description}
  Context: ${obs.context || 'Not specified'}
  Intensity: ${obs.intensity}/10
  Emotional State: ${obs.emotional_state || 'Not specified'}
  Identified Triggers: ${obs.triggers?.join(", ") || 'None identified'}
  Date: ${new Date(obs.observed_at).toLocaleDateString()}
`).join("\n")}

Return your analysis as a JSON object with this EXACT structure:
{
  "triggerAnalysis": {
    "commonTriggers": [
      {
        "trigger": "string - the specific trigger",
        "frequency": "string - how often it occurs",
        "associatedBehaviors": ["behavior1", "behavior2"],
        "emotionalImpact": "string - emotional response",
        "interventionStrategy": "string - how to address this trigger"
      }
    ],
    "triggerCategories": {
      "environmental": ["trigger1", "trigger2"],
      "emotional": ["trigger1", "trigger2"],
      "interpersonal": ["trigger1", "trigger2"],
      "cognitive": ["trigger1", "trigger2"]
    }
  },
  "consequenceAnalysis": {
    "behaviorConsequences": [
      {
        "behavior": "string - behavior name",
        "immediateConsequences": ["consequence1", "consequence2"],
        "longTermConsequences": ["consequence1", "consequence2"],
        "reinforcementType": "positive|negative|punishment|removal",
        "isHelpful": true|false,
        "alternativeBehavior": "string - suggested alternative"
      }
    ]
  },
  "behaviorChains": [
    {
      "chainTitle": "string - descriptive title",
      "trigger": "string - what starts the chain",
      "thought": "string - cognitive element",
      "emotion": "string - emotional response",
      "behavior": "string - the action taken",
      "shortTermConsequence": "string - immediate result",
      "longTermConsequence": "string - lasting impact",
      "reinforcementFactor": "string - what maintains this chain",
      "breakPoint": "string - optimal intervention point",
      "alternativeChain": "string - healthier alternative sequence"
    }
  ],
  "recommendations": [
    {
      "priority": "high|medium|low",
      "category": "trigger_management|behavior_modification|consequence_restructuring",
      "recommendation": "string - specific actionable recommendation",
      "rationale": "string - why this is important",
      "implementationSteps": ["step1", "step2", "step3"]
    }
  ],
  "summary": {
    "keyInsight": "string - most important finding",
    "primaryPattern": "string - dominant pattern identified",
    "mainChallenge": "string - biggest obstacle",
    "bestOpportunity": "string - easiest win for the client"
  }
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert behavioral psychologist specializing in functional behavior analysis, trigger identification, and consequence mapping. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 3000,
    });

    const analysisText = completion.choices[0].message.content;
    if (!analysisText) {
      throw new Error("No response from AI");
    }

    const analysis = JSON.parse(analysisText);

    const insightsToCreate = [];

    for (const trigger of analysis.triggerAnalysis.commonTriggers) {
      insightsToCreate.push({
        coach_id: user.id,
        client_id: clientId,
        pattern_id: null,
        insight_type: "challenge" as const,
        title: `Trigger: ${trigger.trigger}`,
        description: `Frequency: ${trigger.frequency}. Emotional Impact: ${trigger.emotionalImpact}. Associated with: ${trigger.associatedBehaviors.join(", ")}`,
        recommendations: [trigger.interventionStrategy],
        priority: "high" as const,
        ai_generated: true,
        visibility: "coach_only" as const,
      });
    }

    for (const chain of analysis.behaviorChains.slice(0, 3)) {
      insightsToCreate.push({
        coach_id: user.id,
        client_id: clientId,
        pattern_id: null,
        insight_type: "opportunity" as const,
        title: `Behavior Chain: ${chain.chainTitle}`,
        description: `Trigger → ${chain.trigger} | Thought → ${chain.thought} | Emotion → ${chain.emotion} | Behavior → ${chain.behavior} | Consequence → ${chain.shortTermConsequence}. Break point: ${chain.breakPoint}`,
        recommendations: [chain.alternativeChain],
        priority: "high" as const,
        ai_generated: true,
        visibility: "coach_only" as const,
      });
    }

    for (const rec of analysis.recommendations.filter((r: any) => r.priority === "high")) {
      insightsToCreate.push({
        coach_id: user.id,
        client_id: clientId,
        pattern_id: null,
        insight_type: "opportunity" as const,
        title: rec.recommendation,
        description: `${rec.rationale}. Steps: ${rec.implementationSteps.join(" → ")}`,
        recommendations: rec.implementationSteps,
        priority: rec.priority as "high" | "medium" | "low",
        ai_generated: true,
        visibility: "coach_only" as const,
      });
    }

    if (insightsToCreate.length > 0) {
      const { error: insightError } = await supabase
        .from("behavior_insights")
        .insert(insightsToCreate);

      if (insightError) {
        console.error("Error saving insights:", insightError);
      }
    }

    return NextResponse.json({
      success: true,
      analysis,
      insightsCreated: insightsToCreate.length,
    });
  } catch (error: any) {
    console.error("Error analyzing triggers and consequences:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze triggers and consequences",
        details: error.message
      },
      { status: 500 }
    );
  }
}
