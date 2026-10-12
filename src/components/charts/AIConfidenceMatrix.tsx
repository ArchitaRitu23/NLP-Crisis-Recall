import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export interface ConfidenceMatrixPoint {
  risk_score: number;
  ai_confidence: number;
  id: string;
  highlight?: boolean;
}

interface AIConfidenceMatrixProps {
  data: ConfidenceMatrixPoint[];
}

export function AIConfidenceMatrix({ data }: AIConfidenceMatrixProps) {
  const normalPoints = data.filter((point) => !point.highlight);
  const highlightPoints = data.filter((point) => point.highlight);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ScatterChart margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="risk_score"
          type="number"
          domain={[0, 4]}
          ticks={[0, 1, 2, 3, 4]}
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          label={{ value: "Risk Score", position: "insideBottom", offset: -5, fill: "hsl(var(--muted-foreground))" }}
        />
        <YAxis
          dataKey="ai_confidence"
          type="number"
          domain={[0, 100]}
          ticks={[0, 25, 50, 70, 100]}
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          label={{ value: "AI Confidence", angle: -90, position: "insideLeft", fill: "hsl(var(--muted-foreground))" }}
        />
        <Tooltip
          cursor={{ stroke: "hsl(var(--border))" }}
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.5rem",
            boxShadow: "var(--shadow-md)",
          }}
          formatter={(value: number, name: string) => {
            if (name === "ai_confidence") return [`${Math.round(value)}%`, "AI Confidence"];
            return [value, "Risk Score"];
          }}
        />
        <ReferenceLine x={3} stroke="hsl(var(--border))" strokeDasharray="4 4" />
        <ReferenceLine y={70} stroke="hsl(var(--border))" strokeDasharray="4 4" />

        <Scatter data={normalPoints} fill="hsl(210, 70%, 55%)" shape="circle" />
        <Scatter
          data={highlightPoints}
          fill="hsl(0, 72%, 51%)"
          shape="circle"
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
