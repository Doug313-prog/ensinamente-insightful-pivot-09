import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, RotateCcw } from 'lucide-react';
import { FilterState } from '@/types/dashboard';

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  professionals: string[];
  months: string[];
  clients: string[];
}

export const FilterPanel = ({ 
  filters, 
  onFiltersChange, 
  professionals, 
  months, 
  clients 
}: FilterPanelProps) => {
  const handleFilterChange = (field: keyof FilterState, value: string) => {
    const newValue = value === 'all' ? '' : value;
    onFiltersChange({ ...filters, [field]: newValue });
  };

  const clearFilters = () => {
    onFiltersChange({ profissional: '', mes: '', cliente: '' });
  };

  const hasActiveFilters = filters.profissional || filters.mes || filters.cliente;

  return (
    <Card className="p-6 bg-gradient-card shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Filtros</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Profissional
          </label>
          <Select 
            value={filters.profissional || 'all'} 
            onValueChange={(value) => handleFilterChange('profissional', value)}
          >
            <SelectTrigger className="transition-all duration-200 hover:shadow-sm">
              <SelectValue placeholder="Todos os profissionais" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os profissionais</SelectItem>
              {professionals.map(prof => (
                <SelectItem key={prof} value={prof}>{prof}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Mês
          </label>
          <Select 
            value={filters.mes || 'all'} 
            onValueChange={(value) => handleFilterChange('mes', value)}
          >
            <SelectTrigger className="transition-all duration-200 hover:shadow-sm">
              <SelectValue placeholder="Todos os meses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os meses</SelectItem>
              {months.map(month => (
                <SelectItem key={month} value={month}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Cliente
          </label>
          <Select 
            value={filters.cliente || 'all'} 
            onValueChange={(value) => handleFilterChange('cliente', value)}
          >
            <SelectTrigger className="transition-all duration-200 hover:shadow-sm">
              <SelectValue placeholder="Todos os clientes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os clientes</SelectItem>
              {clients.map(client => (
                <SelectItem key={client} value={client}>{client}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearFilters}
            className="transition-all duration-200 hover:bg-muted"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Limpar Filtros
          </Button>
        </div>
      )}
    </Card>
  );
};