import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================
// Python NLP Skeleton - Ported from app1.py
// ============================================================

const POSITIVE_WORDS = new Set([
  "good", "great", "excellent", "love", "like", "awesome", "perfect",
  "reliable", "safe", "satisfied", "happy", "smooth", "stable"
]);

const NEGATIVE_WORDS = new Set([
  "bad", "terrible", "awful", "hate", "dislike", "broken", "faulty",
  "dangerous", "unsafe", "angry", "upset", "disappointed", "issue",
  "problem", "worst", "horrible", "fail", "fails", "failure", "bug",
  "crash", "crashes", "freezes", "freezing"
]);

const DEFECT_KEYWORDS = new Set([
  "broken", "faulty", "defect", "defective", "does not work", "stopped working",
  "not working", "malfunction", "fails", "failure", "crack", "cracked", "leak",
  "overheat", "overheats", "overheating", "smell", "burning smell", "smoke",
  "noise", "buzzing", "vibration", "short circuit", "short-circuit",
  // Expanded from updated Python file
  "not turning on", "won't turn on", "doesn't turn on", "dead on arrival", "doa",
  "bricked", "boot loop", "bootloop", "keeps restarting", "random restart", "restart loop",
  "shuts down", "random shutdown",
  "won't charge", "not charging", "stopped charging", "charging issue",
  "charging port loose", "loose charging port", "power issue", "no power",
  "battery drain", "battery drains fast", "drains quickly",
  "black screen", "blank screen", "unresponsive", "not responding",
  "touch not working", "touch stopped working", "ghost touch",
  "screen lines", "green line", "pink line", "flickering", "dead pixels",
  "no sound", "speaker not working", "speaker crackling",
  "mic not working", "microphone not working",
  "camera not working", "camera failed",
  "snapped", "broke off", "fell apart", "wobbly", "rattling",
  "button stuck", "stuck button", "jammed",
  "hinge broke", "hinge cracked",
  "melting", "melted"
]);

const HIGH_RISK_KEYWORDS = new Set([
  // Expanded from updated Python file
  "fire", "caught fire", "on fire", "burst into flames", "flames",
  "smoke", "started smoking", "started to smoke", "smoke coming out", "smoke from",
  "burn", "burning", "burned", "burned my", "burnt my", "serious burn", "second degree burn",
  "explosion", "explode", "exploded", "blew up", "risk of explosion", "thermal runaway",
  "injury", "injured", "hurt", "cut my", "laceration", "bleeding",
  "choking", "choked", "choking hazard",
  "hospital", "went to the hospital", "went to the er", "ambulance",
  "shock", "electric shock", "electrocuted", "electrocution",
  "shocked me", "got shocked", "zap", "zapped", "zapped me", "tingle", "tingling sensation",
  "current leak", "leakage current",
  "fire hazard", "risk of fire", "unsafe to use", "danger to"
]);

const MEDIUM_RISK_KEYWORDS = new Set([
  // Expanded from updated Python file
  "overheat", "overheats", "overheating", "overheating while charging", "overheats during charging",
  "very hot", "too hot", "hot to the touch", "too warm", "gets very warm", "extremely hot",
  "battery swelled", "battery swollen", "swollen battery",
  "swollen", "swelling", "bulging", "puffed", "bloated",
  "venting", "hissing", "popping",
  "battery leak", "leaking battery", "electrolyte", "acid leak", "corrosion",
  "melt", "melted", "melting", "melted plastic", "plastic smell",
  "burning odor", "burnt smell", "smells burnt", "electrical smell",
  "scorch", "scorched", "burn marks", "charred",
  "sparks", "spark", "sparked", "sparking",
  "arcing", "arc", "shorted", "short circuit", "short-circuit",
  "breaker tripped", "fuse blew",
  "charger got hot", "cable got hot", "nearly caught fire"
]);

const COMPONENT_KEYWORDS: Record<string, string[]> = {
  "Battery & Power": [
    "battery", "charging", "charger", "charge", "power", "plug", "socket",
    "adapter", "overheat", "overheating", "drain", "draining"
  ],
  "Display & Touch": [
    "screen", "display", "touch", "touchscreen", "lcd", "oled",
    "dead pixel", "flicker", "flickering", "ghosting"
  ],
  "Performance & Software": [
    "software", "update", "firmware", "lag", "slow", "freeze",
    "freezes", "crash", "crashes", "bug", "bugs", "app"
  ],
  "Connectivity": [
    "wifi", "bluetooth", "network", "signal", "5g", "4g", "lte",
    "mobile data", "connection", "disconnect"
  ],
  "Audio & Camera": [
    "speaker", "microphone", "mic", "sound", "volume", "camera",
    "photo", "video", "recording"
  ],
  "Body & Mechanics": [
    "button", "buttons", "case", "housing", "back cover", "hinge",
    "fold", "flip", "port"
  ],
};

// NLP Helper Functions (ported from Python)
function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
}

function classifySentiment(tokens: string[]): { sentiment: string; posCount: number; negCount: number } {
  const posCount = tokens.filter(t => POSITIVE_WORDS.has(t)).length;
  const negCount = tokens.filter(t => NEGATIVE_WORDS.has(t)).length;
  
  let sentiment = "Neutral";
  if (posCount === 0 && negCount === 0) {
    sentiment = "Neutral";
  } else if (posCount > negCount) {
    sentiment = "Positive";
  } else if (negCount > posCount) {
    sentiment = "Negative";
  }
  
  return { sentiment, posCount, negCount };
}

function detectDefect(text: string, tokens: string[]): { present: boolean; matchedKeywords: string[] } {
  const lower = text.toLowerCase();
  const matchedKeywords: string[] = [];
  
  // Direct phrase match for defect keywords
  for (const phrase of DEFECT_KEYWORDS) {
    if (lower.includes(phrase)) {
      matchedKeywords.push(phrase);
    }
  }
  
  // High-risk tokens also indicate defect
  for (const phrase of HIGH_RISK_KEYWORDS) {
    if (lower.includes(phrase) && !matchedKeywords.includes(phrase)) {
      matchedKeywords.push(phrase);
    }
  }
  
  // Fallback: negative words present
  const negCount = tokens.filter(t => NEGATIVE_WORDS.has(t)).length;
  if (negCount >= 1 && matchedKeywords.length === 0) {
    const negFound = tokens.filter(t => NEGATIVE_WORDS.has(t));
    matchedKeywords.push(...negFound.slice(0, 3));
  }
  
  // Regex fallbacks for roots like 'burn', 'smok', 'explo'
  if (/\bburn\w*\b/.test(lower) && !matchedKeywords.some(k => k.includes("burn"))) {
    matchedKeywords.push("burn*");
  }
  if (/\bsmok\w*\b/.test(lower) && !matchedKeywords.some(k => k.includes("smok"))) {
    matchedKeywords.push("smoke*");
  }
  if (/\bexplod\w*\b/.test(lower) && !matchedKeywords.some(k => k.includes("explo"))) {
    matchedKeywords.push("explode*");
  }
  
  return { present: matchedKeywords.length > 0, matchedKeywords };
}

function classifySafetyRisk(text: string, tokens: string[]): { risk: string; matchedKeywords: string[] } {
  const lower = text.toLowerCase();
  const matchedKeywords: string[] = [];
  
  // Check high risk
  for (const phrase of HIGH_RISK_KEYWORDS) {
    if (lower.includes(phrase)) {
      matchedKeywords.push(phrase);
    }
  }
  if (matchedKeywords.length > 0) {
    return { risk: "high", matchedKeywords };
  }
  
  // Check medium risk
  for (const phrase of MEDIUM_RISK_KEYWORDS) {
    if (lower.includes(phrase)) {
      matchedKeywords.push(phrase);
    }
  }
  if (matchedKeywords.length > 0) {
    return { risk: "medium", matchedKeywords };
  }
  
  // Check defect keywords for low risk
  for (const phrase of DEFECT_KEYWORDS) {
    if (lower.includes(phrase)) {
      matchedKeywords.push(phrase);
    }
  }
  if (matchedKeywords.length > 0) {
    return { risk: "low", matchedKeywords };
  }
  
  // Negative words fallback
  const negCount = tokens.filter(t => NEGATIVE_WORDS.has(t)).length;
  if (negCount >= 1) {
    return { risk: "low", matchedKeywords: tokens.filter(t => NEGATIVE_WORDS.has(t)).slice(0, 2) };
  }
  
  // Regex fallback
  if (/\bburn\w*\b/.test(lower) || /\bsmok\w*\b/.test(lower)) {
    return { risk: "medium", matchedKeywords: ["burn/smoke pattern"] };
  }
  
  return { risk: "none", matchedKeywords: [] };
}

function mapComponent(text: string): { component: string; matchedKeywords: string[] } {
  const lower = text.toLowerCase();
  let bestComp = "Other";
  let bestHits = 0;
  let matchedKeywords: string[] = [];
  
  for (const [comp, keywords] of Object.entries(COMPONENT_KEYWORDS)) {
    const hits = keywords.filter(kw => lower.includes(kw));
    if (hits.length > bestHits) {
      bestHits = hits.length;
      bestComp = comp;
      matchedKeywords = hits;
    }
  }
  
  return { component: bestComp, matchedKeywords };
}

// TF-IDF-like keyword extraction (simplified)
function extractKeywords(text: string, topN = 5): string[] {
  const tokens = tokenize(text);
  const stopwords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "must", "shall", "can", "need", "dare",
    "i", "you", "he", "she", "it", "we", "they", "my", "your", "his",
    "her", "its", "our", "their", "this", "that", "these", "those",
    "and", "or", "but", "if", "then", "else", "when", "where", "why",
    "how", "what", "which", "who", "whom", "whose", "to", "of", "in",
    "for", "on", "with", "at", "by", "from", "as", "into", "through",
    "during", "before", "after", "above", "below", "between", "under",
    "again", "further", "once", "here", "there", "all", "each", "few",
    "more", "most", "other", "some", "such", "no", "nor", "not", "only",
    "own", "same", "so", "than", "too", "very", "just", "also"
  ]);
  
  // Count frequencies
  const freq: Record<string, number> = {};
  for (const token of tokens) {
    if (token.length > 2 && !stopwords.has(token)) {
      freq[token] = (freq[token] || 0) + 1;
    }
  }
  
  // Sort by frequency and return top N
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word);
}

// Named Entity Recognition (simplified pattern-based)
function extractEntities(text: string): { products: string[]; brands: string[]; dates: string[] } {
  const products: string[] = [];
  const brands: string[] = [];
  const dates: string[] = [];
  
  // Common product patterns
  const productPatterns = [
    /\b(phone|smartphone|tablet|laptop|computer|device|charger|battery|headphone|earbuds?|watch|camera)\b/gi,
    /\b(iphone|ipad|macbook|galaxy|pixel|oneplus|huawei|xiaomi|oppo|vivo)\s*\w*/gi,
  ];
  
  // Brand patterns
  const brandPatterns = [
    /\b(apple|samsung|google|microsoft|sony|lg|huawei|xiaomi|oneplus|motorola|nokia|asus|lenovo|dell|hp)\b/gi,
  ];
  
  // Date patterns
  const datePatterns = [
    /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/g,
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s*\d{0,4}\b/gi,
    /\b(\d+)\s*(days?|weeks?|months?|years?)\s*ago\b/gi,
    /\b(yesterday|today|last\s+week|last\s+month)\b/gi,
  ];
  
  for (const pattern of productPatterns) {
    const matches = text.match(pattern);
    if (matches) products.push(...matches.map(m => m.toLowerCase()));
  }
  
  for (const pattern of brandPatterns) {
    const matches = text.match(pattern);
    if (matches) brands.push(...matches.map(m => m.toLowerCase()));
  }
  
  for (const pattern of datePatterns) {
    const matches = text.match(pattern);
    if (matches) dates.push(...matches);
  }
  
  return {
    products: [...new Set(products)],
    brands: [...new Set(brands)],
    dates: [...new Set(dates)],
  };
}

// Main NLP analysis function (Python skeleton equivalent)
interface NLPAnalysisResult {
  sentiment: { label: string; posCount: number; negCount: number };
  defect: { present: boolean; keywords: string[] };
  safetyRisk: { level: string; keywords: string[] };
  component: { name: string; keywords: string[] };
  entities: { products: string[]; brands: string[]; dates: string[] };
  topKeywords: string[];
  riskScore: number;
  rationale: string;
}

function analyzeWithNLP(text: string): NLPAnalysisResult {
  const tokens = tokenize(text);
  
  const sentiment = classifySentiment(tokens);
  const defect = detectDefect(text, tokens);
  const safetyRisk = classifySafetyRisk(text, tokens);
  const component = mapComponent(text);
  const entities = extractEntities(text);
  const topKeywords = extractKeywords(text, 5);
  
  // Calculate risk score (from Python logic)
  const riskMap: Record<string, number> = { none: 0, low: 1, medium: 2, high: 3 };
  let riskScore = riskMap[safetyRisk.risk] || 0;
  if (defect.present) {
    riskScore += 1;
  }
  
  // Build rationale
  const rationaleParts: string[] = [];
  if (defect.present) {
    rationaleParts.push(`Possible defect detected: ${defect.matchedKeywords.slice(0, 3).join(", ")}.`);
  }
  if (safetyRisk.risk === "medium" || safetyRisk.risk === "high") {
    rationaleParts.push(`Potential ${safetyRisk.risk} safety impact: ${safetyRisk.matchedKeywords.slice(0, 3).join(", ")}.`);
  }
  if (component.component !== "Other") {
    rationaleParts.push(`Affects: ${component.component}.`);
  }
  if (entities.products.length > 0) {
    rationaleParts.push(`Products mentioned: ${entities.products.join(", ")}.`);
  }
  if (rationaleParts.length === 0) {
    rationaleParts.push("Mostly general feedback, low safety concern.");
  }
  
  return {
    sentiment: { label: sentiment.sentiment, posCount: sentiment.posCount, negCount: sentiment.negCount },
    defect: { present: defect.present, keywords: defect.matchedKeywords },
    safetyRisk: { level: safetyRisk.risk, keywords: safetyRisk.matchedKeywords },
    component: { name: component.component, keywords: component.matchedKeywords },
    entities,
    topKeywords,
    riskScore,
    rationale: rationaleParts.join(" "),
  };
}

// ============================================================
// Main Edge Function Handler
// ============================================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, use_llm = true } = await req.json();
    
    if (!text || typeof text !== 'string') {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Run NLP analysis (Python skeleton)
    const nlpResult = analyzeWithNLP(text);

    let aiEnhancedRationale = '';
    let aiSentiment = nlpResult.sentiment.label.toLowerCase();
    let aiSentimentConfidence = 0.7;

    if (use_llm) {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      
      if (LOVABLE_API_KEY) {
        try {
          // Provide NLP results to AI for enhanced analysis
          const nlpContext = `
NLP Analysis Results:
- Sentiment: ${nlpResult.sentiment.label} (positive words: ${nlpResult.sentiment.posCount}, negative words: ${nlpResult.sentiment.negCount})
- Defect Detected: ${nlpResult.defect.present ? "Yes" : "No"}${nlpResult.defect.keywords.length > 0 ? ` (keywords: ${nlpResult.defect.keywords.join(", ")})` : ""}
- Safety Risk Level: ${nlpResult.safetyRisk.level.toUpperCase()}${nlpResult.safetyRisk.keywords.length > 0 ? ` (triggers: ${nlpResult.safetyRisk.keywords.join(", ")})` : ""}
- Affected Component: ${nlpResult.component.name}
- Entities Found: Products: [${nlpResult.entities.products.join(", ")}], Brands: [${nlpResult.entities.brands.join(", ")}]
- Top Keywords: ${nlpResult.topKeywords.join(", ")}
- Preliminary Risk Score: ${nlpResult.riskScore}/4
`;

          const llmResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages: [
                {
                  role: "system",
                  content: `You are an expert crisis analyst for consumer electronics. You are given the results of an NLP analysis of customer feedback. Your job is to:
1. Validate or refine the sentiment classification
2. Assess the severity and urgency based on the NLP-extracted features
3. Provide a concise, actionable rationale for decision-makers

${nlpContext}

Respond with ONLY valid JSON in this exact format:
{
  "sentiment": "positive" | "neutral" | "negative",
  "confidence": 0.0-1.0,
  "severity_assessment": "critical" | "high" | "moderate" | "low" | "informational",
  "rationale": "Brief 2-3 sentence analysis incorporating the NLP findings and your expert assessment"
}`
                },
                {
                  role: "user",
                  content: `Analyze this customer feedback using the NLP results provided:\n\n"${text}"`
                }
              ],
              temperature: 0.3,
              max_tokens: 400
            }),
          });

          if (llmResponse.ok) {
            const llmData = await llmResponse.json();
            const content = llmData.choices?.[0]?.message?.content;
            
            if (content) {
              try {
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  const parsed = JSON.parse(jsonMatch[0]);
                  aiSentiment = parsed.sentiment || aiSentiment;
                  aiSentimentConfidence = parsed.confidence || 0.7;
                  aiEnhancedRationale = parsed.rationale || '';
                }
              } catch (parseError) {
                console.error('Failed to parse LLM response:', parseError);
              }
            }
          } else if (llmResponse.status === 429) {
            console.warn('Rate limited, using NLP results only');
          } else if (llmResponse.status === 402) {
            console.warn('Payment required, using NLP results only');
          }
        } catch (llmError) {
          console.error('LLM error:', llmError);
        }
      }
    }

    // Build final rationale combining NLP and AI
    const finalRationale = aiEnhancedRationale || nlpResult.rationale;

    const riskScoreMap: Record<string, number> = { none: 0, low: 1, medium: 2, high: 4 };

    const result = {
      sentiment: aiSentiment,
      sentiment_confidence: aiSentimentConfidence,
      defect_present: nlpResult.defect.present,
      defect_confidence: nlpResult.defect.present ? 0.85 : 0.7,
      safety_risk: nlpResult.safetyRisk.level,
      safety_confidence: nlpResult.safetyRisk.level !== 'none' ? 0.85 : 0.7,
      components: [nlpResult.component.name],
      risk_score: nlpResult.riskScore,
      rationale: finalRationale,
      matched_keywords: [...new Set([...nlpResult.defect.keywords, ...nlpResult.safetyRisk.keywords, ...nlpResult.topKeywords])],
      analysis_method: use_llm ? 'hybrid' : 'rules',
      // Additional NLP features
      nlp_features: {
        entities: nlpResult.entities,
        top_keywords: nlpResult.topKeywords,
        sentiment_breakdown: {
          positive_count: nlpResult.sentiment.posCount,
          negative_count: nlpResult.sentiment.negCount,
        }
      }
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
