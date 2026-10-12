import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskBadge } from "@/components/ui/risk-badge";
import { SentimentBadge } from "@/components/ui/sentiment-badge";
import { Activity, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Analysis, SafetyRiskLevel, SentimentType } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentAnalysis {
  id: string;
  sentiment: SentimentType;
  safety_risk: SafetyRiskLevel;
  risk_score: number;
  created_at: string;
  feedback?: {
    original_text: string;
  };
}

export function RecentActivity() {
  const [analyses, setAnalyses] = useState<RecentAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentAnalyses = async () => {
      const { data, error } = await supabase
        .from('analyses')
        .select(`
          id,
          sentiment,
          safety_risk,
          risk_score,
          created_at,
          feedback:feedback_items(original_text)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && data) {
        const mapped = data.map((item: any) => ({
          id: item.id,
          sentiment: item.sentiment as SentimentType,
          safety_risk: item.safety_risk as SafetyRiskLevel,
          risk_score: item.risk_score,
          created_at: item.created_at,
          feedback: item.feedback ? { original_text: item.feedback.original_text } : undefined
        }));
        setAnalyses(mapped);
      }
      setIsLoading(false);
    };

    fetchRecentAnalyses();
  }, []);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-4 p-3 rounded-lg bg-muted/30">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : analyses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No analyses yet</p>
            <p className="text-xs text-muted-foreground/70">
              Start by analyzing some customer feedback
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {analyses.map((analysis) => (
              <div 
                key={analysis.id} 
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-transparent hover:border-border transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {analysis.feedback?.original_text?.slice(0, 60) || 'Analysis'}
                    {(analysis.feedback?.original_text?.length || 0) > 60 ? '...' : ''}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <RiskBadge level={analysis.safety_risk} size="sm" />
                    <SentimentBadge sentiment={analysis.sentiment} size="sm" />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
