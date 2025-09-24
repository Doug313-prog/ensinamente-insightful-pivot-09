import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ProcessedData } from '@/types/dashboard';
import { formatCurrency } from '@/utils/excelProcessor';

interface RevenueByProfessionalProps {
  data: ProcessedData[];
}

export const RevenueByProfessional = ({ data }: RevenueByProfessionalProps) => {
  const professionalData = data.reduce((acc, item) => {
    const prof = item.profissional;
    if (!acc[prof]) {
      acc[prof] = { name: prof, revenue: 0, sessions: 0 };
    }
    acc[prof].revenue += item.valorReceber;
    acc[prof].sessions += 1;
    return acc;
  }, {} as Record<string, { name: string; revenue: number; sessions: number }>);

  const chartData = Object.values(professionalData).sort((a, b) => b.revenue - a.revenue);

  return (
    <Card className="p-6 bg-gradient-card shadow-card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          Faturamento por Profissional
        </h3>
        <p className="text-sm text-muted-foreground">
          Distribuição de receita entre profissionais
        </p>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 40, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Faturamento']}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Bar 
              dataKey="revenue" 
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};