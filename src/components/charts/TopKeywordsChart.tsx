import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KeywordData {
  keyword: string;
  count: number;
  component?: string;
}

interface TopKeywordsChartProps {
  data: KeywordData[];
  title?: string;
}

const COMPONENT_COLORS: Record<string, string> = {
  "Battery & Power": "hsl(var(--risk-high))",
  "Display & Touch": "hsl(var(--primary))",
  "Performance & Software": "hsl(var(--chart-3))",
  "Connectivity": "hsl(var(--chart-4))",
  "Audio & Camera": "hsl(var(--chart-5))",
  "Body & Mechanics": "hsl(var(--muted-foreground))",
  "Other": "hsl(var(--muted))"
};

export function TopKeywordsChart({ data, title = "Top Risk Keywords" }: TopKeywordsChartProps) {
  const sortedData = [...data].sort((a, b) => b.count - a.count).slice(0, 10);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={sortedData} 
              layout="vertical"
              margin={{ top: 5, right: 20, left: 60, bottom: 5 }}
            >
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis 
                type="category" 
                dataKey="keyword" 
                tick={{ fontSize: 11 }}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
                formatter={(value: number, name: string, props: { payload?: KeywordData }) => {
                  const component = props.payload?.component;
                  return [
                    `${value} occurrences${component ? ` (${component})` : ''}`,
                    "Frequency"
                  ];
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {sortedData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.component ? COMPONENT_COLORS[entry.component] || "hsl(var(--primary))" : "hsl(var(--primary))"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
