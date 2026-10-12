import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { ComponentBreakdown } from '@/types';

interface ComponentPieChartProps {
  data: ComponentBreakdown[];
}

const COLORS = [
  'hsl(210, 100%, 18%)',
  'hsl(210, 80%, 30%)',
  'hsl(210, 60%, 45%)',
  'hsl(38, 92%, 50%)',
  'hsl(158, 64%, 40%)',
  'hsl(0, 72%, 51%)',
  'hsl(270, 60%, 50%)',
];

export function ComponentPieChart({ data }: ComponentPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          innerRadius={50}
          fill="#8884d8"
          dataKey="count"
          nameKey="component"
          label={({ component, percent }) => 
            `${component.split(' ')[0]} ${(percent * 100).toFixed(0)}%`
          }
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '0.5rem',
            boxShadow: 'var(--shadow-md)'
          }}
          formatter={(value: number) => [value, 'Count']}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
