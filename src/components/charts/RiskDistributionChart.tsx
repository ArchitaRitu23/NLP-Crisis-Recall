import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { RiskDistribution } from '@/types';

interface RiskDistributionChartProps {
  data: RiskDistribution[];
}

const RISK_COLORS: Record<string, string> = {
  none: 'hsl(158, 64%, 40%)',
  low: 'hsl(45, 93%, 57%)',
  medium: 'hsl(38, 92%, 50%)',
  high: 'hsl(0, 72%, 51%)',
};

const RISK_LABELS: Record<string, string> = {
  none: 'No Risk',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export function RiskDistributionChart({ data }: RiskDistributionChartProps) {
  const chartData = data.map(item => ({
    ...item,
    name: RISK_LABELS[item.risk_level] || item.risk_level,
    fill: RISK_COLORS[item.risk_level] || RISK_COLORS.none,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis 
          dataKey="name" 
          className="text-sm fill-muted-foreground"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <YAxis 
          className="text-sm fill-muted-foreground"
          tick={{ fill: 'hsl(var(--muted-foreground))' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
            boxShadow: 'var(--shadow-md)'
          }}
          labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
