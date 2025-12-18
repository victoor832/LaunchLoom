import { generatePlaybookStream, PlaybookInput } from './pdfGeneratorServiceV2';
import { Readable } from 'stream';

/**
 * Browser-safe wrapper for PDF generation
 * Converts Node.js stream to Blob for download in browser
 */
export async function generatePlaybookPDF(input: PlaybookInput): Promise<Blob> {
  // Create readable stream from pdfkit
  const stream = generatePlaybookStream(input);

  // Convert stream to Blob
  const chunks: (Uint8Array | Buffer)[] = [];

  return new Promise((resolve, reject) => {
    stream.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    stream.on('end', () => {
      const blob = new Blob(chunks as BlobPart[], { type: 'application/pdf' });
      resolve(blob);
    });

    stream.on('error', (error: Error) => {
      reject(error);
    });
  });
}

/**
 * Download PDF to browser
 */
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Main function to generate and download playbook
 */
export async function generateAndDownloadPlaybook(input: PlaybookInput): Promise<void> {
  try {
    const blob = await generatePlaybookPDF(input);
    const filename = `${input.productName}-${input.tier}-playbook.pdf`;
    downloadPDF(blob, filename);
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
}
