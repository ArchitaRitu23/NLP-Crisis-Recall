import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RiskScoreHistogramProps {
  data: { score: number; count: number }[];
  title?: string;
}

const SCORE_COLORS: Record<number, string> = {
  0: "hsl(var(--muted))",
  1: "hsl(var(--risk-low))",
  2: "hsl(var(--risk-medium))",
  3: "hsl(var(--risk-medium))",
  4: "hsl(var(--risk-high))"
};

export function RiskScoreHistogram({ data, title = "Crisis Score Distribution" }: RiskScoreHistogramProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="score" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `Score ${value}`}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
                formatter={(value: number) => [`${value} items`, "Count"]}
                labelFormatter={(label) => `Risk Score: ${label}/4`}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SCORE_COLORS[entry.score] || SCORE_COLORS[0]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
