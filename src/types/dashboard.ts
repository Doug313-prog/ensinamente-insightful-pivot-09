export interface SessionData {
  Situacao: string;
  Profissional: string;
  DataMes: string;
  Categoria: string;
  Cliente: string;
  ValorReceber: string;
}

export interface ProcessedData {
  situacao: string;
  profissional: string;
  dataMes: string;
  categoria: string;
  cliente: string;
  valorReceber: number;
  valorOriginal: string;
}

export interface FilterState {
  profissional: string;
  mes: string;
  cliente: string;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface ProfessionalSummary {
  profissional: string;
  totalSessions: number;
  totalValue: number;
  clients: string[];
  sessions: ProcessedData[];
}