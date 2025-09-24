import * as XLSX from 'xlsx';
import { SessionData, ProcessedData } from '@/types/dashboard';

export const processExcelFile = (file: File): Promise<ProcessedData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];
        
        console.log('Dados brutos do Excel:', jsonData.slice(0, 2)); // Ver primeiros 2 registros
        console.log('Nomes das colunas:', Object.keys(jsonData[0] || {}));
        
        const processedData = jsonData.map((row: any, index) => {
          console.log(`=== Processando linha ${index + 1} ===`);
          console.log('Linha original:', row);
          
          // Buscar a coluna de valor por diferentes possibilidades
          const valorKey = Object.keys(row).find(key => 
            key.toLowerCase().includes('valor') || 
            key.toLowerCase().includes('receber') ||
            key === 'ValorReceber' ||
            key === 'Valor Receber' ||
            key === 'valor_receber'
          );
          
          const valorOriginal = valorKey ? row[valorKey] : '';
          console.log('Coluna de valor encontrada:', valorKey);
          console.log('Valor original:', valorOriginal);
          
          let valorProcessado = 0;
          if (valorOriginal && typeof valorOriginal === 'string') {
            valorProcessado = parseFloat(
              valorOriginal
                .replace(/[R$\s]/g, '') // Remove R$ e espaços
                .replace(/\./g, '') // Remove pontos (milhares)
                .replace(',', '.') // Converte vírgula decimal para ponto
            ) || 0;
          } else if (typeof valorOriginal === 'number') {
            valorProcessado = valorOriginal;
          }
          
          console.log('Valor processado:', valorProcessado);
          
          return {
            situacao: row.Situacao || row.situacao || row['Situação'] || '',
            profissional: row.Profissional || row.profissional || '',
            dataMes: row.DataMes || row['Data mês'] || row['data_mes'] || row.dataMes || '',
            categoria: row.Categoria || row.categoria || '',
            cliente: row.Cliente || row.cliente || '',
            valorReceber: valorProcessado,
            valorOriginal: String(valorOriginal)
          };
        });
        
        resolve(processedData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsBinaryString(file);
  });
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const getUniqueValues = (data: ProcessedData[], field: keyof ProcessedData): string[] => {
  const values = data.map(item => item[field] as string).filter(Boolean);
  return [...new Set(values)].sort();
};