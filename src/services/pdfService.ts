
import * as pdfjs from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

// Configurar o worker do PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export const extractTextFromPdf = async (file: File): Promise<string> => {
  try {
    // Carregar o PDF como um ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Carregar o documento PDF
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    // Número de páginas no PDF
    const numPages = pdf.numPages;
    let text = '';
    
    // Extrair texto de cada página
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => item.str)
        .join(' ');
        
      text += pageText + '\n\n';
    }
    
    return text;
  } catch (error) {
    console.error('Erro ao extrair texto do PDF:', error);
    throw new Error('Falha ao processar o arquivo PDF');
  }
};
