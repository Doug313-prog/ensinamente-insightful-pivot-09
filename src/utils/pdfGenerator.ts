import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { ProcessedData, ProfessionalSummary } from '@/types/dashboard';
import { formatCurrency } from './excelProcessor';

// Dados bancários por profissional - texto completo formatado
const bankingData: Record<string, string> = {
  'Bianca': `Bianca Pinhão Leber - Psicologia 
Banco 0260     Nu Pagamento S.A -Instituição de pagamentos
Agência 0001      Conta 60443377-6
CNPJ: 47.935.047/0001-00
PIX : 47.935.047/0001-00  CNPJ`,

  'Gabriela': `Gabriela Franco – Psicologia
PIX:  56.140.094/0001-59  CNPJ
CNPJ:56.140.04/0001-59
Razão Social: Gabriela Franco de Oliveira Eiras serviços de Psicologia LTDA
Instituição: 301- Dock IP S.A
Agência:0001   Conta 501451`,

  'Livia': `Livia Meireles Soares- Fonoaudiologia
Banco C6      Agência: 001
Conta : 22115395-0
PIX: 48.392.017/0001-68`,

  'Marcos': `Marcos Paulo Jeremias- Psicopedagogia
Banco Itaú    Agência 5917
Conta : 02839-0
PIX: 373.588.778-37`,

  'Vanda': `Vanda Russi de Oliveira - Pedagogia
Nubank     Agência :001
Conta: 1820330-8
PIX : 135.171.518-66`,

  'Ieda': `Ieda Rivelino Pinhão- Pedagogia
Nubank     Agência :001
Conta: 346645206-2
CPF: 125.268.738-94
PIX: irpinhao@gmail.com`,

  'Samya': `Samya de Freitas Bitar - Psicologia
Nu Pagamentos S.A. Banco 0260  Agência: 001
Conta: 61619228-6
PIX: 29.712.611/0001-44 CNPJ`,

  'Fernanda J': `Fernanda de Fatima Peralta- Psicopedagogia
Nu Pagamentos S.A. Banco 0260  Agência: 001
Conta: 79839218-6
PIX: 13.490.812/0001-04 CNPJ`,

  'Fernanda P': `Fernanda  Peralta- Psicopedagogia
Nu Pagamentos S.A. Banco 0260  Agência: 001
Conta: 19768042-5
PIX: 308.827.288-81`,

  'Priscila': `Priscila Henriques - Psicologia
Banco 336   C6  S.A.
Agência: 001  Conta : 17779470-4
PIX : 46.039.518/0001-30 CNPJ`
};

const getFirstName = (fullName: string): string => {
  const lowerName = fullName.toLowerCase();
  
  // Handle special cases for professionals with same first name
  // Fernanda J (Fernanda de Fatima) - check for "de fatima" or just "fatima" in name
  if (lowerName.includes('fernanda') && (lowerName.includes('de fatima') || lowerName.includes('de fátima') || (lowerName.includes('fatima') && !lowerName.includes('peralta')))) {
    return 'Fernanda J';
  }
  
  // Fernanda P (just Fernanda Peralta)
  if (lowerName.includes('fernanda') && lowerName.includes('peralta') && !lowerName.includes('fatima') && !lowerName.includes('fátima')) {
    return 'Fernanda P';
  }
  
  // Default case for any other Fernanda
  if (lowerName.includes('fernanda')) {
    return 'Fernanda P';
  }
  
  return fullName.split(' ')[0];
};

export const generateProfessionalReport = (summary: ProfessionalSummary): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = 30;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório Ensinamente', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;
  doc.setFontSize(14);
  doc.text(`Profissional: ${summary.profissional}`, margin, yPosition);
  
  yPosition += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total de Sessões: ${summary.totalSessions}`, margin, yPosition);
  
  yPosition += 8;
  doc.text(`Valor Total: ${formatCurrency(summary.totalValue)}`, margin, yPosition);
  
  yPosition += 15;
  doc.setFont('helvetica', 'bold');
  doc.text('Sessões por Cliente:', margin, yPosition);
  
  // Group sessions by client
  const sessionsByClient = summary.sessions.reduce((acc, session) => {
    if (!acc[session.cliente]) {
      acc[session.cliente] = [];
    }
    acc[session.cliente].push(session);
    return acc;
  }, {} as Record<string, ProcessedData[]>);

  yPosition += 10;
  doc.setFont('helvetica', 'normal');

  Object.entries(sessionsByClient).forEach(([client, sessions]) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;
    }

    doc.setFont('helvetica', 'bold');
    doc.text(`Cliente: ${client}`, margin, yPosition);
    yPosition += 8;

    const clientTotal = sessions.reduce((sum, session) => sum + session.valorReceber, 0);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total: ${formatCurrency(clientTotal)}`, margin + 10, yPosition);
    yPosition += 8;

    sessions.forEach((session, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 30;
      }
      
      doc.text(
        `${index + 1}. Sessão (${session.dataMes}) - ${formatCurrency(session.valorReceber)}`,
        margin + 15,
        yPosition
      );
      yPosition += 6;
    });

    yPosition += 5;
  });

  // Save PDF
  const fileName = `relatorio_${summary.profissional.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(fileName);
};

export const generateClientReports = (data: ProcessedData[]): void => {
  // Group by professional and then by client
  const professionalClients = data.reduce((acc, session) => {
    const key = `${session.profissional}|${session.cliente}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(session);
    return acc;
  }, {} as Record<string, ProcessedData[]>);

  Object.entries(professionalClients).forEach(([key, sessions]) => {
    const [profissional, cliente] = key.split('|');
    
    const summary: ProfessionalSummary = {
      profissional,
      totalSessions: sessions.length,
      totalValue: sessions.reduce((sum, session) => sum + session.valorReceber, 0),
      clients: [cliente],
      sessions
    };

    // Generate report with professional + client name
    generateClientReport(summary, cliente);
  });
};

export const generateClientReport = (summary: ProfessionalSummary, cliente: string): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = 30;

  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório Ensinamente', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 12;
  doc.setFontSize(12);
  doc.text(`Profissional: ${summary.profissional}`, margin, yPosition);
  
  yPosition += 8;
  doc.text(`Cliente: ${cliente}`, margin, yPosition);
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total de Sessões: ${summary.totalSessions}`, margin, yPosition);
  
  yPosition += 6;
  doc.text(`Valor Total: ${formatCurrency(summary.totalValue)}`, margin, yPosition);
  
  yPosition += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Detalhamento das Sessões:', margin, yPosition);
  
  yPosition += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  summary.sessions.forEach((session, index) => {
    if (yPosition > 275) {
      doc.addPage();
      yPosition = 30;
    }
    
    doc.text(
      `${index + 1}. Sessão (${session.dataMes}) - ${formatCurrency(session.valorReceber)} - Situação: ${session.situacao}`,
      margin,
      yPosition
    );
    yPosition += 7;
  });

  // Add banking information section
  const firstName = getFirstName(summary.profissional);
  const banking = bankingData[firstName];
  
  if (banking) {
    yPosition += 10;
    
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 30;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Dados Bancários:', margin, yPosition);
    yPosition += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    // Split banking text into lines and display each line
    const bankingLines = banking.split('\n');
    bankingLines.forEach((line) => {
      if (line.trim()) {
        if (yPosition > 275) {
          doc.addPage();
          yPosition = 30;
        }
        doc.text(line, margin, yPosition);
        yPosition += 5;
      }
    });
  }

  // Save PDF with first name + client format
  const firstProfName = getFirstName(summary.profissional).replace(/[^a-zA-Z0-9]/g, '_');
  const clientName = cliente.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `${firstProfName}_${clientName}.pdf`;
  doc.save(fileName);
};

// Keep old function for backward compatibility
export const generateAllReports = (data: ProcessedData[]): void => {
  generateClientReports(data);
};