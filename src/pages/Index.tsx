
import React, { useState } from 'react';
import { BookText, Book, BookOpen, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { extractTextFromPdf, PageContent } from '@/services/pdfService';
import { synthesizeSpeech } from '@/services/textToSpeechService';
import Header from '@/components/Header';
import FileUpload from '@/components/FileUpload';
import AudioPlayer from '@/components/AudioPlayer';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedPages, setExtractedPages] = useState<PageContent[]>([]);
  const [audioUrls, setAudioUrls] = useState<{[pageNum: number]: string}>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [processingPage, setProcessingPage] = useState<number | null>(null);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setExtractedPages([]);
    setAudioUrls({});
    setCurrentStep(1);
    setCurrentPage(1);
  };

  const handleExtractText = async () => {
    if (!selectedFile) {
      toast.error('Por favor, selecione um arquivo PDF primeiro');
      return;
    }

    try {
      setIsProcessing(true);
      toast.info('Extraindo texto do PDF...');
      
      const pages = await extractTextFromPdf(selectedFile);
      setExtractedPages(pages);
      setCurrentStep(2);
      
      toast.success(`Texto extraído com sucesso! (${pages.length} páginas)`);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Falha ao extrair texto do PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateAudio = async (pageNum: number) => {
    const page = extractedPages.find(p => p.pageNum === pageNum);
    
    if (!page || !page.text) {
      toast.error('Não há texto para converter em áudio nesta página');
      return;
    }

    try {
      setProcessingPage(pageNum);
      toast.info(`Gerando áudio para a página ${pageNum}...`);
      
      const url = await synthesizeSpeech(page.text);
      setAudioUrls(prev => ({...prev, [pageNum]: url}));
      
      toast.success(`Áudio gerado com sucesso para a página ${pageNum}!`);
      
      if (currentStep === 2) {
        setCurrentStep(3);
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error(`Falha ao gerar áudio para a página ${pageNum}`);
    } finally {
      setProcessingPage(null);
    }
  };

  const handleGenerateAllAudio = async () => {
    if (extractedPages.length === 0) {
      toast.error('Não há páginas para converter em áudio');
      return;
    }

    setIsProcessing(true);
    let successCount = 0;

    try {
      toast.info('Gerando áudio para todas as páginas...');
      
      for (const page of extractedPages) {
        if (!page.text) continue;
        
        setProcessingPage(page.pageNum);
        try {
          const url = await synthesizeSpeech(page.text);
          setAudioUrls(prev => ({...prev, [page.pageNum]: url}));
          successCount++;
        } catch (error) {
          console.error(`Erro ao gerar áudio para página ${page.pageNum}:`, error);
        }
      }
      
      if (successCount > 0) {
        toast.success(`Áudio gerado com sucesso para ${successCount} de ${extractedPages.length} páginas!`);
        setCurrentStep(3);
      } else {
        toast.error('Falha ao gerar áudio para todas as páginas');
      }
    } catch (error) {
      console.error('Erro geral:', error);
      toast.error('Falha ao gerar áudio');
    } finally {
      setIsProcessing(false);
      setProcessingPage(null);
    }
  };

  const handlePageChange = (pageNum: number) => {
    if (pageNum < 1 || pageNum > extractedPages.length) return;
    setCurrentPage(pageNum);
  };

  const renderPagination = () => {
    if (extractedPages.length <= 1) return null;
    
    const totalPages = extractedPages.length;
    
    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => handlePageChange(currentPage - 1)}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          
          {totalPages <= 7 ? (
            // Para poucos resultados, mostra todas as páginas
            Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <PaginationItem key={num}>
                <PaginationLink
                  isActive={currentPage === num}
                  onClick={() => handlePageChange(num)}
                >
                  {num}
                </PaginationLink>
              </PaginationItem>
            ))
          ) : (
            // Para muitos resultados, mostra paginação com elipses
            <>
              {/* Sempre mostra página 1 */}
              <PaginationItem>
                <PaginationLink
                  isActive={currentPage === 1}
                  onClick={() => handlePageChange(1)}
                >
                  1
                </PaginationLink>
              </PaginationItem>
              
              {/* Elipse início */}
              {currentPage > 3 && (
                <PaginationItem>
                  <span className="flex h-9 w-9 items-center justify-center">...</span>
                </PaginationItem>
              )}
              
              {/* Páginas ao redor da atual */}
              {Array.from(
                { length: 3 },
                (_, i) => currentPage - 1 + i
              )
                .filter(num => num > 1 && num < totalPages)
                .map(num => (
                  <PaginationItem key={num}>
                    <PaginationLink
                      isActive={currentPage === num}
                      onClick={() => handlePageChange(num)}
                    >
                      {num}
                    </PaginationLink>
                  </PaginationItem>
                ))}
              
              {/* Elipse fim */}
              {currentPage < totalPages - 2 && (
                <PaginationItem>
                  <span className="flex h-9 w-9 items-center justify-center">...</span>
                </PaginationItem>
              )}
              
              {/* Sempre mostra última página */}
              <PaginationItem>
                <PaginationLink
                  isActive={currentPage === totalPages}
                  onClick={() => handlePageChange(totalPages)}
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}
          
          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageChange(currentPage + 1)}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
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

  const currentPageContent = extractedPages.find(p => p.pageNum === currentPage);

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
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">Texto Extraído</h3>
                    <div className="text-sm text-gray-500">
                      {extractedPages.length} {extractedPages.length === 1 ? 'página' : 'páginas'} encontradas
                    </div>
                  </div>
                  
                  {renderPagination()}
                  
                  <div className="bg-gray-50 p-4 rounded-md border max-h-72 overflow-y-auto mt-4">
                    {currentPageContent ? (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Página {currentPageContent.pageNum}</h4>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => handleGenerateAudio(currentPageContent.pageNum)}
                            disabled={isProcessing || processingPage === currentPageContent.pageNum}
                          >
                            {processingPage === currentPageContent.pageNum ? (
                              <>Gerando...</>
                            ) : audioUrls[currentPageContent.pageNum] ? (
                              <>Regenerar Áudio</>
                            ) : (
                              <>Gerar Áudio</>
                            )}
                          </Button>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-line">{currentPageContent.text}</p>
                      </div>
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
                    onClick={handleGenerateAllAudio}
                    disabled={extractedPages.length === 0 || isProcessing}
                    className="bg-audiobook-primary hover:bg-audiobook-dark"
                  >
                    Gerar Áudio para Todas as Páginas
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {currentStep === 3 && (
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">Áudio Gerado</h3>
                    <div className="text-sm text-gray-500">
                      {Object.keys(audioUrls).length} de {extractedPages.length} páginas convertidas
                    </div>
                  </div>
                  
                  {renderPagination()}
                  
                  {currentPageContent ? (
                    audioUrls[currentPageContent.pageNum] ? (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Página {currentPageContent.pageNum}</h4>
                        <AudioPlayer 
                          audioUrl={audioUrls[currentPageContent.pageNum]} 
                          title={`${selectedFile?.name || 'Documento'} - Página ${currentPageContent.pageNum}`} 
                        />
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-md border text-center mt-4">
                        <p className="text-sm text-gray-500 mb-3">Áudio não gerado para esta página</p>
                        <Button 
                          onClick={() => handleGenerateAudio(currentPageContent.pageNum)}
                          disabled={isProcessing || processingPage === currentPageContent.pageNum}
                          size="sm"
                        >
                          {processingPage === currentPageContent.pageNum ? 'Gerando...' : 'Gerar Áudio'}
                        </Button>
                      </div>
                    )
                  ) : (
                    <p className="text-sm text-gray-500 italic mt-4">Selecione uma página</p>
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
                      setExtractedPages([]);
                      setAudioUrls({});
                      setCurrentStep(1);
                      setCurrentPage(1);
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
