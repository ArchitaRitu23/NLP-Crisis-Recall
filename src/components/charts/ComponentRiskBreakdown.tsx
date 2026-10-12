import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ComponentRiskData {
  component: string;
  highCount: number;
  mediumCount: number;
  keywords: string[];
}

interface ComponentRiskBreakdownProps {
  data: ComponentRiskData[];
  title?: string;
}

export function ComponentRiskBreakdown({ data, title = "Components with Medium/High Risk" }: ComponentRiskBreakdownProps) {
  const sortedData = [...data]
    .filter(d => d.highCount > 0 || d.mediumCount > 0)
    .sort((a, b) => (b.highCount * 2 + b.mediumCount) - (a.highCount * 2 + a.mediumCount));

  if (sortedData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            No medium or high risk items detected
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedData.map((item) => (
            <div key={item.component} className="border-b border-border pb-3 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{item.component}</span>
                <div className="flex gap-2">
                  {item.highCount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {item.highCount} High
                    </Badge>
                  )}
                  {item.mediumCount > 0 && (
                    <Badge variant="outline" className="text-xs border-risk-medium text-risk-medium">
                      {item.mediumCount} Medium
                    </Badge>
                  )}
                </div>
              </div>
              {item.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs text-muted-foreground">Top terms:</span>
                  {item.keywords.slice(0, 5).map((kw) => (
                    <span key={kw} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
