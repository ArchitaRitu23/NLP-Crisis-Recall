import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Shield, PhoneCall, FileWarning, Users, Lightbulb } from "lucide-react";
import type { AnalysisResult } from "@/types";

interface CrisisSuggestionsProps {
  result: AnalysisResult;
}

interface Suggestion {
  icon: React.ReactNode;
  title: string;
  description: string;
  priority: "critical" | "high" | "medium";
}

function generateSuggestions(result: AnalysisResult): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const riskScore = result.risk_score;
  const safetyRisk = result.safety_risk;
  const components = result.components;
  const keywords = result.matched_keywords || [];

  // Critical priority (score 4/4)
  if (riskScore >= 4) {
    suggestions.push({
      icon: <AlertTriangle className="h-5 w-5 text-risk-high" />,
      title: "Immediate Product Safety Review",
      description: "This feedback indicates a critical safety hazard. Initiate immediate product safety review and consider issuing a consumer advisory.",
      priority: "critical"
    });

    if (keywords.some(k => ["fire", "smoke", "explosion", "burn", "flames", "thermal runaway"].some(h => k.includes(h)))) {
      suggestions.push({
        icon: <Shield className="h-5 w-5 text-risk-high" />,
        title: "Potential Recall Assessment",
        description: "Thermal runaway or fire-related keywords detected. Conduct urgent risk assessment for potential product recall per CPSC guidelines.",
        priority: "critical"
      });
    }

    if (keywords.some(k => ["injury", "hospital", "hurt", "burn", "shock", "electrocuted"].some(h => k.includes(h)))) {
      suggestions.push({
        icon: <PhoneCall className="h-5 w-5 text-risk-high" />,
        title: "Customer Outreach Required",
        description: "Personal injury indicators detected. Contact the customer immediately to document the incident and provide support.",
        priority: "critical"
      });
    }
  }

  // High priority (score 3/4)
  if (riskScore >= 3) {
    suggestions.push({
      icon: <FileWarning className="h-5 w-5 text-risk-medium" />,
      title: "Incident Documentation",
      description: "Document this incident in the product safety database. Flag for quality assurance team review within 24 hours.",
      priority: "high"
    });

    if (components.includes("Battery & Power")) {
      suggestions.push({
        icon: <Shield className="h-5 w-5 text-risk-medium" />,
        title: "Battery Safety Protocol",
        description: "Battery-related safety concern detected. Review batch information and check for similar reports in production database.",
        priority: "high"
      });
    }

    suggestions.push({
      icon: <Users className="h-5 w-5 text-risk-medium" />,
      title: "Cross-functional Alert",
      description: "Notify product engineering, quality assurance, and legal teams of this high-priority safety signal.",
      priority: "high"
    });
  }

  // Medium priority suggestions
  if (riskScore >= 2 && riskScore < 3) {
    suggestions.push({
      icon: <Lightbulb className="h-5 w-5 text-chart-4" />,
      title: "Monitor for Pattern",
      description: "Add to watchlist and monitor for similar reports. Consider proactive customer communication if pattern emerges.",
      priority: "medium"
    });

    if (components.includes("Display & Touch") || components.includes("Performance & Software")) {
      suggestions.push({
        icon: <FileWarning className="h-5 w-5 text-chart-4" />,
        title: "Software/Firmware Review",
        description: "Check if recent software updates may have caused the reported issue. Consider rolling back or issuing a patch.",
        priority: "medium"
      });
    }
  }

  return suggestions;
}

export function CrisisSuggestions({ result }: CrisisSuggestionsProps) {
  const suggestions = generateSuggestions(result);

  if (suggestions.length === 0 || result.risk_score < 2) {
    return null;
  }

  const priorityStyles = {
    critical: "border-l-4 border-l-risk-high bg-destructive/5",
    high: "border-l-4 border-l-risk-medium bg-warning/5",
    medium: "border-l-4 border-l-chart-4 bg-muted/30"
  };

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-primary" />
          Recommended Actions
          {result.risk_score >= 4 && (
            <span className="ml-2 text-xs font-medium text-risk-high bg-risk-high/10 px-2 py-0.5 rounded-full">
              Critical Priority
            </span>
          )}
          {result.risk_score === 3 && (
            <span className="ml-2 text-xs font-medium text-risk-medium bg-risk-medium/10 px-2 py-0.5 rounded-full">
              High Priority
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className={`rounded-lg p-4 ${priorityStyles[suggestion.priority]}`}
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">{suggestion.icon}</div>
              <div>
                <h4 className="font-semibold text-sm">{suggestion.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {suggestion.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
