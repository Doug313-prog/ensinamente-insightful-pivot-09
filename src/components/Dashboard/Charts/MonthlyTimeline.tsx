import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ProcessedData } from '@/types/dashboard';
import { formatCurrency } from '@/utils/excelProcessor';

interface MonthlyTimelineProps {
  data: ProcessedData[];
}

export const MonthlyTimeline = ({ data }: MonthlyTimelineProps) => {
  const monthlyData = data.reduce((acc, item) => {
    const month = item.dataMes;
    if (!acc[month]) {
      acc[month] = { month, sessions: 0, revenue: 0 };
    }
    acc[month].sessions += 1;
    acc[month].revenue += item.valorReceber;
    return acc;
  }, {} as Record<string, { month: string; sessions: number; revenue: number }>);

  const chartData = Object.values(monthlyData)
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  return (
    <Card className="p-6 bg-gradient-card shadow-card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Timeline Mensal
        </h3>
        <p className="text-sm text-muted-foreground">
          Evolução de sessões e faturamento ao longo do tempo
        </p>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="sessionsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              yAxisId="revenue"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value)}
              orientation="left"
            />
            <YAxis 
              yAxisId="sessions"
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
              orientation="right"
            />
            <Tooltip 
              formatter={(value: number, name: string) => {
                if (name === 'revenue') return [formatCurrency(value), 'Faturamento'];
                return [value, 'Sessões'];
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Area
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#revenueGradient)"
            />
            <Line
              yAxisId="sessions"
              type="monotone"
              dataKey="sessions"
              stroke="hsl(var(--secondary))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--secondary))', strokeWidth: 2, r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};