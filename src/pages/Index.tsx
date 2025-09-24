import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/Dashboard/FileUpload';
import { FilterPanel } from '@/components/Dashboard/FilterPanel';
import { MetricsCards } from '@/components/Dashboard/MetricsCards';
import { RevenueByProfessional } from '@/components/Dashboard/Charts/RevenueByProfessional';
import { MonthlyTimeline } from '@/components/Dashboard/Charts/MonthlyTimeline';
import { TopClients } from '@/components/Dashboard/Charts/TopClients';
import { SessionSummary } from '@/components/Dashboard/Charts/SessionSummary';
import { processExcelFile, getUniqueValues } from '@/utils/excelProcessor';
import * as XLSX from 'xlsx';
import { generateAllReports, generateProfessionalReport } from '@/utils/pdfGenerator';
import { ProcessedData, FilterState } from '@/types/dashboard';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download } from 'lucide-react';

const Index = () => {
  const [data, setData] = useState<ProcessedData[]>([]);
  const [filteredData, setFilteredData] = useState<ProcessedData[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    profissional: '',
    mes: '',
    cliente: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const processedData = await processExcelFile(file);
      setData(processedData);
      setFilteredData(processedData);
      toast({
        title: "Sucesso!",
        description: `${processedData.length} registros carregados com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar arquivo Excel. Verifique o formato.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    // Se o profissional mudou, limpar o filtro de cliente
    if (newFilters.profissional !== filters.profissional) {
      newFilters.cliente = '';
    }
    
    setFilters(newFilters);
    
    const filtered = data.filter(item => {
      return (
        (!newFilters.profissional || item.profissional === newFilters.profissional) &&
        (!newFilters.mes || item.dataMes === newFilters.mes) &&
        (!newFilters.cliente || item.cliente === newFilters.cliente)
      );
    });
    
    setFilteredData(filtered);
  };

  const handleGenerateReports = () => {
    if (filteredData.length === 0) {
      toast({
        title: "Aviso",
        description: "Nenhum dado disponível para gerar relatórios.",
        variant: "destructive",
      });
      return;
    }

    // Se um cliente específico foi selecionado, gerar apenas relatórios cliente
    // Se não, gerar relatórios consolidados por profissional
    if (filters.cliente) {
      generateAllReports(filteredData);
    } else {
      // Gerar relatórios consolidados por profissional
      const professionalGroups = filteredData.reduce((acc, session) => {
        if (!acc[session.profissional]) {
          acc[session.profissional] = [];
        }
        acc[session.profissional].push(session);
        return acc;
      }, {} as Record<string, ProcessedData[]>);

      Object.entries(professionalGroups).forEach(([profissional, sessions]) => {
        const clients = [...new Set(sessions.map(s => s.cliente))];
        const summary = {
          profissional,
          totalSessions: sessions.length,
          totalValue: sessions.reduce((sum, session) => sum + session.valorReceber, 0),
          clients,
          sessions
        };
        generateProfessionalReport(summary);
      });
    }

    toast({
      title: "Relatórios Gerados!",
      description: "Os relatórios em PDF foram baixados automaticamente.",
    });
  };

  const handleGenerateMonthlyReport = () => {
    if (filteredData.length === 0) {
      toast({
        title: "Aviso",
        description: "Nenhum dado disponível para gerar resumo.",
        variant: "destructive",
      });
      return;
    }

    // Group by professional and client
    const monthlyData = filteredData.reduce((acc, session) => {
      const key = `${session.profissional}|${session.cliente}`;
      if (!acc[key]) {
        acc[key] = {
          profissional: session.profissional,
          cliente: session.cliente,
          totalSessions: 0,
          totalValue: 0
        };
      }
      acc[key].totalSessions += 1;
      acc[key].totalValue += session.valorReceber;
      return acc;
    }, {} as Record<string, { profissional: string; cliente: string; totalSessions: number; totalValue: number }>);

    // Create Excel workbook
    const wb = XLSX.utils.book_new();
    
    // Prepare data for Excel
    const excelData = [
      ['Profissional', 'Cliente', 'Total de Sessões', 'Total dos Valores']
    ];
    
    Object.values(monthlyData).forEach(item => {
      excelData.push([
        item.profissional,
        item.cliente,
        item.totalSessions.toString(),
        `R$ ${item.totalValue.toFixed(2)}`
      ]);
    });
    
    // Add total row
    excelData.push([
      'TOTAL GERAL',
      `${Object.values(monthlyData).length} registros`,
      Object.values(monthlyData).reduce((sum, item) => sum + item.totalSessions, 0).toString(),
      `R$ ${Object.values(monthlyData).reduce((sum, item) => sum + item.totalValue, 0).toFixed(2)}`
    ]);

    const ws = XLSX.utils.aoa_to_sheet(excelData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 25 }, // Profissional
      { wch: 30 }, // Cliente
      { wch: 18 }, // Total de Sessões
      { wch: 20 }  // Total dos Valores
    ];
    
    // Add autofilter to headers
    ws['!autofilter'] = { ref: `A1:D${excelData.length}` };
    
    XLSX.utils.book_append_sheet(wb, ws, 'Resumo Mensal');
    XLSX.writeFile(wb, 'resumo_mensal.xlsx');

    toast({
      title: "Resumo Gerado!",
      description: "O resumo mensal foi baixado como arquivo Excel com filtros.",
    });
  };

  const professionals = getUniqueValues(data, 'profissional');
  const months = getUniqueValues(data, 'dataMes');
  
  // Filtrar clientes baseado no profissional selecionado
  const availableClients = filters.profissional 
    ? getUniqueValues(data.filter(item => item.profissional === filters.profissional), 'cliente')
    : getUniqueValues(data, 'cliente');

  if (data.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              Dashboard Ensinamente
            </h1>
            <p className="text-xl text-muted-foreground">
              Painel de Análise de Desempenho
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            <FileUpload onFileSelect={handleFileUpload} isLoading={isLoading} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Dashboard Ensinamente
            </h1>
            <p className="text-muted-foreground mt-2">
              {filteredData.length} de {data.length} registros sendo exibidos
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleGenerateReports}
              className="bg-gradient-secondary hover:shadow-elegant transition-all duration-300"
            >
              <Download className="mr-2 h-4 w-4" />
              Gerar Relatórios PDF
            </Button>

            <Button
              onClick={handleGenerateMonthlyReport}
              variant="outline"
              className="transition-all duration-200 hover:bg-muted"
            >
              <FileText className="mr-2 h-4 w-4" />
              Resumo Mensal
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="transition-all duration-200 hover:bg-muted"
            >
              <FileText className="mr-2 h-4 w-4" />
              Novo Arquivo
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <FilterPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
            professionals={professionals}
            months={months}
            clients={availableClients}
          />

          <MetricsCards data={filteredData} />

          <RevenueByProfessional data={filteredData} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MonthlyTimeline data={filteredData} />
            </div>
            <TopClients data={filteredData} />
          </div>

          <SessionSummary data={filteredData} />
        </div>
      </div>
    </div>
  );
};

export default Index;