
import React, { useState } from 'react';
import { BookText, Book, BookOpen, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { extractTextFromPdf } from '@/services/pdfService';
import { synthesizeSpeech } from '@/services/textToSpeechService';
import Header from '@/components/Header';
import FileUpload from '@/components/FileUpload';
import AudioPlayer from '@/components/AudioPlayer';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setExtractedText('');
    setAudioUrl('');
    setCurrentStep(1);
  };

  const handleExtractText = async () => {
    if (!selectedFile) {
      toast.error('Por favor, selecione um arquivo PDF primeiro');
      return;
    }

    try {
      setIsProcessing(true);
      toast.info('Extraindo texto do PDF...');
      
      const text = await extractTextFromPdf(selectedFile);
      setExtractedText(text);
      setCurrentStep(2);
      
      toast.success('Texto extraído com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Falha ao extrair texto do PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!extractedText) {
      toast.error('Não há texto para converter em áudio');
      return;
    }

    try {
      setIsProcessing(true);
      toast.info('Gerando áudio...');
      
      const url = await synthesizeSpeech(extractedText);
      setAudioUrl(url);
      setCurrentStep(3);
      
      toast.success('Áudio gerado com sucesso!');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Falha ao gerar áudio');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderStep = (stepNumber: number, title: string, icon: React.ReactNode, isActive: boolean, isComplete: boolean) => (
    <div className={`flex flex-col items-center space-y-2 ${isActive ? 'text-audiobook-primary' : isComplete ? 'text-green-500' : 'text-gray-400'}`}>
      <div className={`w-10 h-10 flex items-center justify-center rounded-full border-2 ${
        isActive ? 'border-audiobook-primary bg-audiobook-primary/10' : 
        isComplete ? 'border-green-500 bg-green-500/10' : 'border-gray-200'
      }`}>
        {icon}
      </div>
      <span className="text-xs font-medium">{title}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-audiobook-background">
      <Header />
      
      <main className="flex-1 container max-w-4xl mx-auto py-8 px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Transforme seus PDFs em Audiobooks</h2>
          <p className="text-gray-600">
            Faça upload de um arquivo PDF, extraia o texto e converta-o em áudio para ouvir em qualquer lugar
          </p>
        </div>
        
        <div className="flex justify-between items-center mb-8 px-4">
          {renderStep(1, "Upload PDF", <BookText size={18} />, currentStep === 1, currentStep > 1)}
          
          <div className={`h-0.5 w-16 ${currentStep > 1 ? 'bg-green-500' : 'bg-gray-200'}`} />
          
          {renderStep(2, "Extrair Texto", <Book size={18} />, currentStep === 2, currentStep > 2)}
          
          <div className={`h-0.5 w-16 ${currentStep > 2 ? 'bg-green-500' : 'bg-gray-200'}`} />
          
          {renderStep(3, "Gerar Áudio", <Volume2 size={18} />, currentStep === 3, currentStep > 3)}
        </div>
        
        <div className="space-y-6">
          {currentStep === 1 && (
            <Card>
              <CardContent className="pt-6">
                <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />
                
                <div className="mt-6 flex justify-center">
                  <Button 
                    onClick={handleExtractText}
                    disabled={!selectedFile || isProcessing}
                    className="bg-audiobook-primary hover:bg-audiobook-dark"
                  >
                    Extrair Texto
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {currentStep === 2 && (
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Texto Extraído</h3>
                  <div className="bg-gray-50 p-4 rounded-md border max-h-72 overflow-y-auto">
                    {extractedText ? (
                      <p className="text-sm text-gray-700 whitespace-pre-line">{extractedText}</p>
                    ) : (
                      <p className="text-sm text-gray-500 italic">Nenhum texto extraído</p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(1)}
                  >
                    Voltar
                  </Button>
                  
                  <Button 
                    onClick={handleGenerateAudio}
                    disabled={!extractedText || isProcessing}
                    className="bg-audiobook-primary hover:bg-audiobook-dark"
                  >
                    Gerar Áudio
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {currentStep === 3 && (
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Áudio Gerado</h3>
                  
                  {audioUrl ? (
                    <AudioPlayer 
                      audioUrl={audioUrl} 
                      title={selectedFile?.name || 'Áudio gerado'} 
                    />
                  ) : (
                    <p className="text-sm text-gray-500 italic">Nenhum áudio gerado</p>
                  )}
                </div>
                
                <div className="flex justify-between mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentStep(2)}
                  >
                    Voltar
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedFile(null);
                      setExtractedText('');
                      setAudioUrl('');
                      setCurrentStep(1);
                    }}
                  >
                    Iniciar Novo
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <footer className="py-4 px-6 mt-8 border-t text-center text-sm text-gray-500">
        <p>AudioScribe &copy; {new Date().getFullYear()} - Transforme seus PDFs em audiobooks</p>
      </footer>
    </div>
  );
};

export default Index;
