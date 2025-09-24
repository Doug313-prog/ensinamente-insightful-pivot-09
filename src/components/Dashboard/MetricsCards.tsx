import { Card } from '@/components/ui/card';
import { Users, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { ProcessedData } from '@/types/dashboard';
import { formatCurrency } from '@/utils/excelProcessor';

interface MetricsCardsProps {
  data: ProcessedData[];
}

export const MetricsCards = ({ data }: MetricsCardsProps) => {
  const totalSessions = data.length;
  const totalRevenue = data.reduce((sum, item) => sum + item.valorReceber, 0);
  const uniqueClients = new Set(data.map(item => item.cliente)).size;
  const uniqueProfessionals = new Set(data.map(item => item.profissional)).size;
  const averageSessionValue = totalSessions > 0 ? totalRevenue / totalSessions : 0;

  const metrics = [
    {
      title: 'Total de Sessões',
      value: totalSessions.toString(),
      icon: Calendar,
      color: 'bg-gradient-primary',
      textColor: 'text-primary-foreground'
    },
    {
      title: 'Faturamento Total',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: 'bg-gradient-secondary',
      textColor: 'text-secondary-foreground'
    },
    {
      title: 'Clientes Únicos',
      value: uniqueClients.toString(),
      icon: Users,
      color: 'bg-success',
      textColor: 'text-success-foreground'
    },
    {
      title: 'Valor Médio/Sessão',
      value: formatCurrency(averageSessionValue),
      icon: TrendingUp,
      color: 'bg-warning',
      textColor: 'text-warning-foreground'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card 
            key={metric.title} 
            className="p-6 bg-gradient-card shadow-card hover:shadow-hover transition-all duration-300 border-0"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {metric.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${metric.color}`}>
                <Icon className={`h-6 w-6 ${metric.textColor}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};