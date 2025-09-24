import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProcessedData } from '@/types/dashboard';
import { formatCurrency } from '@/utils/excelProcessor';
import { Calculator, Users, Calendar } from 'lucide-react';

interface SessionSummaryProps {
  data: ProcessedData[];
}

export const SessionSummary = ({ data }: SessionSummaryProps) => {
  // Verificar se há dados
  if (!data || data.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-card shadow-card lg:col-span-3">
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Carregue um arquivo Excel para ver as somas dos valores das sessões
            </p>
          </div>
        </Card>
      </div>
    );
  }
  
  // Soma por Profissional
  const sumByProfessional = data.reduce((acc, item) => {
    if (!acc[item.profissional]) {
      acc[item.profissional] = { sessions: 0, total: 0 };
    }
    acc[item.profissional].sessions += 1;
    acc[item.profissional].total += item.valorReceber;
    return acc;
  }, {} as Record<string, { sessions: number; total: number }>);

  // Soma por Cliente
  const sumByClient = data.reduce((acc, item) => {
    if (!acc[item.cliente]) {
      acc[item.cliente] = { sessions: 0, total: 0 };
    }
    acc[item.cliente].sessions += 1;
    acc[item.cliente].total += item.valorReceber;
    return acc;
  }, {} as Record<string, { sessions: number; total: number }>);

  // Soma por Mês
  const sumByMonth = data.reduce((acc, item) => {
    if (!acc[item.dataMes]) {
      acc[item.dataMes] = { sessions: 0, total: 0 };
    }
    acc[item.dataMes].sessions += 1;
    acc[item.dataMes].total += item.valorReceber;
    return acc;
  }, {} as Record<string, { sessions: number; total: number }>);

  const professionalData = Object.entries(sumByProfessional)
    .sort((a, b) => b[1].total - a[1].total);

  const clientData = Object.entries(sumByClient)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 10);

  const monthData = Object.entries(sumByMonth)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Soma por Profissional */}
      <Card className="p-6 bg-gradient-card shadow-card">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Soma por Profissional
          </h3>
          <p className="text-sm text-muted-foreground">
            Total de valores por profissional
          </p>
        </div>
        
        <div className="space-y-3 max-h-80 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Profissional</TableHead>
                <TableHead className="text-xs text-center">Sessões</TableHead>
                <TableHead className="text-xs text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {professionalData.map(([professional, data]) => (
                <TableRow key={professional}>
                  <TableCell className="font-medium text-sm">
                    {professional}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {data.sessions}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-sm">
                    {formatCurrency(data.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Soma por Cliente (Top 10) */}
      <Card className="p-6 bg-gradient-card shadow-card">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Calculator className="h-5 w-5 text-secondary" />
            Soma por Cliente
          </h3>
          <p className="text-sm text-muted-foreground">
            Top 10 clientes por faturamento
          </p>
        </div>
        
        <div className="space-y-3 max-h-80 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Cliente</TableHead>
                <TableHead className="text-xs text-center">Sessões</TableHead>
                <TableHead className="text-xs text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientData.map(([client, data]) => (
                <TableRow key={client}>
                  <TableCell className="font-medium text-sm truncate max-w-32">
                    {client}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {data.sessions}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-sm">
                    {formatCurrency(data.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Soma por Mês */}
      <Card className="p-6 bg-gradient-card shadow-card">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-success" />
            Soma por Mês
          </h3>
          <p className="text-sm text-muted-foreground">
            Faturamento mensal acumulado
          </p>
        </div>
        
        <div className="space-y-3 max-h-80 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Mês</TableHead>
                <TableHead className="text-xs text-center">Sessões</TableHead>
                <TableHead className="text-xs text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthData.map(([month, data]) => (
                <TableRow key={month}>
                  <TableCell className="font-medium text-sm">
                    {month}
                  </TableCell>
                  <TableCell className="text-center text-sm">
                    {data.sessions}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-sm">
                    {formatCurrency(data.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};