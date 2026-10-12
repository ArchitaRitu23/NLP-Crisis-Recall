import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export interface CategoryRiskDatum {
  category: string;
  count: number;
  percentage: number;
}

interface CategoryRiskPieChartProps {
  data: CategoryRiskDatum[];
}

const COLORS = [
  "hsl(0, 72%, 51%)",
  "hsl(28, 90%, 55%)",
  "hsl(45, 93%, 57%)",
  "hsl(210, 70%, 55%)",
  "hsl(158, 64%, 40%)",
  "hsl(280, 60%, 55%)",
  "hsl(330, 70%, 50%)",
  "hsl(190, 70%, 45%)",
];

const RADIAN = Math.PI / 180;

function renderCustomLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percentage,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percentage: number;
}) {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percentage < 5) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={13}
      fontWeight={600}
    >
      {`${percentage.toFixed(0)}%`}
    </text>
  );
}

export function CategoryRiskPieChart({ data }: CategoryRiskPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={340}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomLabel}
          outerRadius={120}
          innerRadius={50}
          fill="#8884d8"
          dataKey="count"
          nameKey="category"
          strokeWidth={2}
          stroke="hsl(var(--card))"
        >
          {data.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "0.5rem",
            boxShadow: "var(--shadow-md)",
          }}
          labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
          formatter={(value: number, _name: string, props: { payload: CategoryRiskDatum }) => {
            return [`${value} items (${props.payload.percentage.toFixed(1)}%)`, props.payload.category];
          }}
        />
        <Legend
          formatter={(value: string) => (
            <span style={{ color: "hsl(var(--foreground))", fontSize: "13px" }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
