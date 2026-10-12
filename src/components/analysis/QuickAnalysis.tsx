import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Send, Sparkles } from "lucide-react";
import { AnalysisResultCard } from "./AnalysisResultCard";
import type { AnalysisResult } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { runAnalysis } from "@/lib/analysis";

interface QuickAnalysisProps {
  compact?: boolean;
  apiKey?: string;
}

export function QuickAnalysis({ compact = false, apiKey }: QuickAnalysisProps) {
  const [text, setText] = useState("");
  const [useLLM, setUseLLM] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast({
        title: "Empty input",
        description: "Please enter some feedback text to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    if (useLLM && !apiKey) {
      toast({
        title: "API key missing",
        description: "No OpenAI API key found. Using rules-only analysis.",
      });
    }

    const analysisResult = await runAnalysis(text.trim(), { apiKey, useLLM });
    setResult(analysisResult);

    if (useLLM && apiKey && analysisResult.analysis_method === "rules") {
      toast({
        title: "AI unavailable",
        description: "LLM call failed. Using rules-only analysis.",
        variant: "destructive",
      });
    }

    setIsAnalyzing(false);
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Textarea
            placeholder="Enter customer feedback to analyze..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[60px] resize-none"
            disabled={isAnalyzing}
          />
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !text.trim()}
            className="shrink-0"
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        {result && (
          <AnalysisResultCard result={result} originalText={text} apiKey={apiKey} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Analyze Customer Feedback
          </CardTitle>
          <CardDescription>
            Enter customer feedback text to detect defects and safety risks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter customer feedback here... For example: 'My phone battery started swelling after a month of use and I noticed a burning smell coming from the device.'"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[150px] resize-y"
            disabled={isAnalyzing}
          />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="use-llm"
                checked={useLLM}
                onCheckedChange={setUseLLM}
                disabled={isAnalyzing}
              />
              <Label htmlFor="use-llm" className="text-sm cursor-pointer">
                Use AI-enhanced analysis (recommended)
              </Label>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !text.trim()}
              size="lg"
              className="min-w-[140px]"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <AnalysisResultCard result={result} originalText={text} apiKey={apiKey} />
      )}
    </div>
  );
}
