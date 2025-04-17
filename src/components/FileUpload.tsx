
import React, { useState, useRef } from 'react';
import { FileUp, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Por favor, selecione um arquivo PDF válido.');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('O arquivo é muito grande. O tamanho máximo é 10MB.');
      return;
    }
    
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-6 transition-all ${
          dragging ? 'border-audiobook-primary bg-audiobook-light/10' : 'border-gray-300 hover:border-audiobook-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept="application/pdf"
        />
        
        <div className="flex flex-col items-center justify-center space-y-3">
          {isProcessing ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 text-audiobook-primary animate-spin mb-2" />
              <p className="text-sm text-gray-500">Processando arquivo...</p>
            </div>
          ) : (
            <>
              {!selectedFile ? (
                <>
                  <FileUp className="h-10 w-10 text-gray-400" />
                  <p className="text-sm text-gray-500 text-center">
                    Arraste e solte seu arquivo PDF aqui, ou <span className="text-audiobook-primary font-medium">clique para selecionar</span>
                  </p>
                  <p className="text-xs text-gray-400">PDF (Máximo 10MB)</p>
                </>
              ) : (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <FileUp className="h-6 w-6 text-audiobook-primary" />
                    <div>
                      <p className="text-sm font-medium truncate max-w-[200px]">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)}MB</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
