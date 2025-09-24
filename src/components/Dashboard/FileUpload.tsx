import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export const FileUpload = ({ onFileSelect, isLoading = false }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/vnd.ms-excel' || 
          file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.name.endsWith('.xls') || 
          file.name.endsWith('.xlsx')) {
        onFileSelect(file);
      } else {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione um arquivo Excel (.xls ou .xlsx)",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Card className="bg-gradient-card p-8 shadow-card hover:shadow-hover transition-all duration-300">
      <div className="flex flex-col items-center space-y-6">
        <div className="p-4 bg-gradient-primary rounded-full">
          <FileSpreadsheet className="h-12 w-12 text-primary-foreground" />
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-foreground">
            Carregar Dados Excel
          </h3>
          <p className="text-muted-foreground">
            Faça upload do arquivo Excel com os dados das sessões
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xls,.xlsx"
          onChange={handleFileChange}
          className="hidden"
        />

        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="bg-gradient-primary hover:shadow-elegant transition-all duration-300"
          size="lg"
        >
          <Upload className="mr-2 h-5 w-5" />
          {isLoading ? 'Processando...' : 'Selecionar Arquivo'}
        </Button>
        
        <p className="text-sm text-muted-foreground text-center">
          Formatos suportados: .xls, .xlsx
        </p>
      </div>
    </Card>
  );
};