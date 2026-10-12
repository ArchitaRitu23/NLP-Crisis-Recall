import type { AnalysisResult } from "@/types";
import type { CategoryRiskDatum } from "@/components/charts/CategoryRiskPieChart";

export interface LLMEnhancement {
  ai_confidence: number;
  rationale: string;
}

function clampConfidence(value: number): number {
  if (Number.isNaN(value)) return 70;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function extractJson(content: string): Record<string, unknown> | null {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(content.slice(start, end + 1));
  } catch {
    return null;
  }
}

export async function fetchLLMEnhancement(
  text: string,
  base: AnalysisResult,
  apiKey: string,
): Promise<LLMEnhancement> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are a product safety analyst. Return JSON only with keys ai_confidence (0-100) and rationale (1-3 sentences). Do not change the base analysis; only add a clearer rationale and confidence.",
        },
        {
          role: "user",
          content: `Review text: ${text}

Base analysis (do not change these values):
- risk_score: ${base.risk_score}/4
- safety_risk: ${base.safety_risk}
- sentiment: ${base.sentiment}
- defect_present: ${base.defect_present}
- components: ${base.components.join(", ")}
- matched_keywords: ${(base.matched_keywords || []).join(", ")}

Return JSON only.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("OpenAI response missing content");
  }

  const parsed = extractJson(content);
  if (!parsed) {
    throw new Error("Failed to parse OpenAI JSON response");
  }

  const ai_confidence = clampConfidence(Number(parsed.ai_confidence));
  const rationale = typeof parsed.rationale === "string" ? parsed.rationale.trim() : "";
  if (!rationale) {
    throw new Error("OpenAI response missing rationale");
  }

  return { ai_confidence, rationale };
}

export interface AIRecommendationOptions {
  apiKey: string;
  categoryData?: CategoryRiskDatum[];
  analysisResult?: AnalysisResult;
  originalText?: string;
}

export async function fetchAIRecommendation(
  options: AIRecommendationOptions,
): Promise<string> {
  const { apiKey, categoryData, analysisResult, originalText } = options;

  let userPrompt: string;

  if (categoryData && categoryData.length > 0) {
    // Dashboard mode: recommend based on category risk distribution
    const categoryBreakdown = categoryData
      .map((d) => `- ${d.category}: ${d.count} high-risk items (${d.percentage.toFixed(1)}%)`)
      .join("\n");

    userPrompt = `You are analyzing product safety feedback data. Here is the distribution of HIGH-RISK feedback by product category:

${categoryBreakdown}

Based on this distribution:

**Category Action Plans**:
For EACH high-risk category listed, provide a **crisp, 3-bullet point specific action plan** for the product safety manager.
Do not provide general summaries. Focus purely on what needs to be done.

Format:
### [Category Name]
- [Action 1]
- [Action 2]
- [Action 3]`;
  } else if (analysisResult) {
    // Single feedback mode: recommend based on one analysis
    userPrompt = `You are a product safety analyst reviewing a single piece of customer feedback.

Feedback text: "${originalText || "N/A"}"

Analysis results:
- Risk Score: ${analysisResult.risk_score}/4
- Safety Risk Level: ${analysisResult.safety_risk}
- Sentiment: ${analysisResult.sentiment}
- Defect Detected: ${analysisResult.defect_present}
- Affected Components: ${analysisResult.components.join(", ")}
- Matched Keywords: ${(analysisResult.matched_keywords || []).join(", ")}
- Analysis Rationale: ${analysisResult.rationale}

Provide a **crisp action plan** for the safety manager.
Do not include risk assessment or investigation strategy unless critical.

**Immediate Action Plan**:
1. [Step 1]
2. [Step 2]
3. [Step 3]`;
  } else {
    throw new Error("Either categoryData or analysisResult must be provided");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.4,
      max_tokens: 800,
      messages: [
        {
          role: "system",
          content:
            "You are an expert product safety consultant. Provide clear, actionable, and well-structured safety recommendations. Use bullet points and clear headings. Do not use markdown code blocks. Keep responses focused and practical.",
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${response.status}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("OpenAI response missing content");
  }

  return content.trim();
}
