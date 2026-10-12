import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export interface ProductRiskStackedDatum {
  product: string;
  risk0: number;
  risk1: number;
  risk2: number;
  risk3: number;
  risk4: number;
}

interface MultiProductRiskStackedBarProps {
  data: ProductRiskStackedDatum[];
}

const RISK_COLORS: Record<string, string> = {
  risk0: "hsl(158, 64%, 40%)",
  risk1: "hsl(87, 60%, 50%)",
  risk2: "hsl(45, 93%, 57%)",
  risk3: "hsl(28, 90%, 55%)",
  risk4: "hsl(0, 72%, 51%)",
};

export function MultiProductRiskStackedBar({ data }: MultiProductRiskStackedBarProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="product"
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          interval={0}
          angle={-15}
          textAnchor="end"
          height={50}
        />
        <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.5rem",
            boxShadow: "var(--shadow-md)",
          }}
          labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
        />
        <Legend />
        <Bar dataKey="risk0" stackId="risk" name="Risk 0" fill={RISK_COLORS.risk0} radius={[0, 0, 0, 0]} />
        <Bar dataKey="risk1" stackId="risk" name="Risk 1" fill={RISK_COLORS.risk1} />
        <Bar dataKey="risk2" stackId="risk" name="Risk 2" fill={RISK_COLORS.risk2} />
        <Bar dataKey="risk3" stackId="risk" name="Risk 3" fill={RISK_COLORS.risk3} />
        <Bar dataKey="risk4" stackId="risk" name="Risk 4" fill={RISK_COLORS.risk4} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
