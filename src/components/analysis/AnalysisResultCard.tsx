import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskBadge } from "@/components/ui/risk-badge";
import { SentimentBadge } from "@/components/ui/sentiment-badge";
import { ConfidenceGauge } from "@/components/ui/confidence-gauge";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Cpu, Lightbulb } from "lucide-react";
import type { AnalysisResult } from "@/types";
import { cn } from "@/lib/utils";
import { CrisisSuggestions } from "./CrisisSuggestions";
import { AIRecommendation } from "./AIRecommendation";

interface AnalysisResultCardProps {
  result: AnalysisResult;
  originalText?: string;
  apiKey?: string;
  className?: string;
}

export function AnalysisResultCard({ result, originalText, apiKey, className }: AnalysisResultCardProps) {
  return (
    <Card className={cn("overflow-hidden animate-fade-in", className)}>
      {/* Header with risk score */}
      <div className={cn(
        "px-6 py-4 border-b",
        result.safety_risk === 'high' && "bg-risk-high/10",
        result.safety_risk === 'medium' && "bg-risk-medium/10",
        result.safety_risk === 'low' && "bg-risk-low/10",
        result.safety_risk === 'none' && "bg-risk-none/10"
      )}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Risk Score:</span>
            <span className="text-3xl font-bold text-foreground">{result.risk_score}/4</span>
          </div>
          <div className="flex items-center gap-2">
            <RiskBadge level={result.safety_risk} size="lg" />
            <SentimentBadge sentiment={result.sentiment} size="lg" />
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* Original text */}
        {originalText && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Analyzed Feedback</h4>
            <p className="text-sm bg-muted/50 rounded-lg p-4 border">
              "{originalText}"
            </p>
          </div>
        )}

        {/* Confidence gauges */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="flex flex-col items-center">
            <ConfidenceGauge value={result.sentiment_confidence} label="Sentiment" size="md" />
          </div>
          <div className="flex flex-col items-center">
            <ConfidenceGauge value={result.defect_confidence} label="Defect" size="md" />
          </div>
          <div className="flex flex-col items-center">
            <ConfidenceGauge value={result.safety_confidence} label="Safety" size="md" />
          </div>
          <div className="flex flex-col items-center">
            <ConfidenceGauge value={result.ai_confidence / 100} label="AI" size="md" />
          </div>
        </div>

        {/* Defect status */}
        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border">
          {result.defect_present ? (
            <>
              <XCircle className="h-6 w-6 text-risk-high flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Defect Detected</p>
                <p className="text-sm text-muted-foreground">
                  This feedback indicates a potential product defect
                </p>
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-6 w-6 text-risk-none flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">No Defect Detected</p>
                <p className="text-sm text-muted-foreground">
                  No clear product defect identified in this feedback
                </p>
              </div>
            </>
          )}
        </div>

        {/* Components */}
        {result.components.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Cpu className="h-4 w-4" />
              Affected Components
            </div>
            <div className="flex flex-wrap gap-2">
              {result.components.map((component) => (
                <Badge key={component} variant="secondary" className="text-sm">
                  {component}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Matched keywords */}
        {result.matched_keywords.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Matched Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {result.matched_keywords.map((keyword, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={cn(
                    "text-xs",
                    keyword.startsWith('NOT ') && "border-risk-medium text-risk-medium"
                  )}
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Rationale */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Lightbulb className="h-4 w-4" />
            Analysis Rationale
          </div>
          <p className="text-sm text-foreground leading-relaxed bg-muted/30 rounded-lg p-4 border">
            {result.rationale}
          </p>
        </div>

        {/* Method badge */}
        <div className="flex items-center justify-end pt-2 border-t">
          <Badge variant="outline" className="text-xs">
            Analysis Method: {result.analysis_method.toUpperCase()}
          </Badge>
        </div>
      </CardContent>

      {/* Crisis Suggestions for high-risk items */}
      {result.risk_score >= 3 && (
        <CrisisSuggestions result={result} />
      )}

      {/* AI Recommendation */}
      {apiKey && (
        <div className="px-6 pb-6">
          <AIRecommendation
            analysisResult={result}
            originalText={originalText}
            apiKey={apiKey}
          />
        </div>
      )}
    </Card>
  );
}
