import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { fetchAIRecommendation } from "@/lib/openai";
import type { CategoryRiskDatum } from "@/components/charts/CategoryRiskPieChart";
import type { AnalysisResult } from "@/types";

interface AIRecommendationProps {
    /** For dashboard: category distribution data */
    categoryData?: CategoryRiskDatum[];
    /** For single feedback: the analysis result */
    analysisResult?: AnalysisResult;
    /** For single feedback: the original text */
    originalText?: string;
    /** OpenAI API key */
    apiKey: string;
}

export function AIRecommendation({
    categoryData,
    analysisResult,
    originalText,
    apiKey,
}: AIRecommendationProps) {
    const [recommendation, setRecommendation] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!apiKey) {
            setError("Please provide an OpenAI API key in the setup section above to generate recommendations.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setRecommendation(null);

        try {
            const result = await fetchAIRecommendation({
                apiKey,
                categoryData,
                analysisResult,
                originalText,
            });
            setRecommendation(result);
        } catch (err) {
            console.error("AI Recommendation failed:", err);
            setError("Failed to generate recommendation. Please check your API key and try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const hasData = (categoryData && categoryData.length > 0) || analysisResult;

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Recommendation
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {!hasData ? (
                    <div className="flex flex-col items-center justify-center py-6 text-muted-foreground text-sm">
                        <AlertTriangle className="h-8 w-8 mb-2 opacity-50" />
                        No analysis data available yet. Upload feedback or run an analysis to generate recommendations.
                    </div>
                ) : (
                    <>
                        {!recommendation && !isLoading && !error && (
                            <p className="text-sm text-muted-foreground">
                                Click the button below to generate AI-powered safety recommendations
                                {categoryData
                                    ? " based on the category risk distribution."
                                    : " based on this feedback analysis."}
                            </p>
                        )}

                        <Button
                            onClick={handleGenerate}
                            disabled={isLoading || !apiKey}
                            className="w-full"
                            variant={recommendation ? "outline" : "default"}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating Recommendation...
                                </>
                            ) : recommendation ? (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Regenerate Recommendation
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Generate Recommendation
                                </>
                            )}
                        </Button>

                        {error && (
                            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        {recommendation && (
                            <div className="rounded-lg border bg-muted/30 p-4 space-y-2 animate-fade-in">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-semibold text-foreground">AI-Generated Recommendations</span>
                                </div>
                                <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                                    {recommendation}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
