
import * as pdfjs from 'pdfjs-dist';

// Configurar o worker do PDF.js - correcting the worker import
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

export interface PageContent {
  pageNum: number;
  text: string;
}

export const extractTextFromPdf = async (file: File): Promise<PageContent[]> => {
  try {
    // Carregar o PDF como um ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Carregar o documento PDF
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    // Número de páginas no PDF
    const numPages = pdf.numPages;
    const pages: PageContent[] = [];
    
    // Extrair texto de cada página, mantendo-os separados
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str)
        .join(' ');
        
      pages.push({
        pageNum: i,
        text: pageText
      });
    }
    
    return pages;
  } catch (error) {
    console.error('Erro ao extrair texto do PDF:', error);
    throw new Error('Falha ao processar o arquivo PDF');
  }
};
