import { Card } from '@/components/ui/card';
import { ProcessedData } from '@/types/dashboard';
import { formatCurrency } from '@/utils/excelProcessor';
import { Trophy, User } from 'lucide-react';

interface TopClientsProps {
  data: ProcessedData[];
}

export const TopClients = ({ data }: TopClientsProps) => {
  const clientData = data.reduce((acc, item) => {
    const client = item.cliente;
    if (!acc[client]) {
      acc[client] = { name: client, revenue: 0, sessions: 0 };
    }
    acc[client].revenue += item.valorReceber;
    acc[client].sessions += 1;
    return acc;
  }, {} as Record<string, { name: string; revenue: number; sessions: number }>);

  const topClients = Object.values(clientData)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return (
    <Card className="p-6 bg-gradient-card shadow-card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Trophy className="h-5 w-5 text-warning" />
          Top Clientes
        </h3>
        <p className="text-sm text-muted-foreground">
          Clientes com maior faturamento
        </p>
      </div>
      
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {topClients.map((client, index) => (
          <div 
            key={client.name} 
            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                ${index === 0 ? 'bg-warning text-warning-foreground' : 
                  index === 1 ? 'bg-muted text-muted-foreground' :
                  index === 2 ? 'bg-accent text-accent-foreground' :
                  'bg-background text-foreground border border-border'}
              `}>
                {index + 1}
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground truncate max-w-48">
                  {client.name}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-foreground">
                {formatCurrency(client.revenue)}
              </p>
              <p className="text-sm text-muted-foreground">
                {client.sessions} sessões
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};