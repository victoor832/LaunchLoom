import { convert } from 'libreoffice-convert';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';

const convertAsync = promisify(convert) as (
  input: Buffer,
  outputFormat: string,
  filters?: any
) => Promise<Buffer>;

export async function convertWordToPDF(wordBuffer: Buffer): Promise<Buffer> {
  try {
    // Convert DOCX to PDF using libreoffice
    const pdfBuffer = await convertAsync(wordBuffer, '.pdf', undefined);
    return pdfBuffer;
  } catch (error) {
    console.error('Error converting Word to PDF:', error);
    throw new Error('Failed to convert Word document to PDF');
  }
}

export async function convertWordToPDFViaFile(wordBuffer: Buffer): Promise<Buffer> {
  const tmpDir = tmpdir();
  const wordFilePath = path.join(tmpDir, `temp-${Date.now()}.docx`);
  const pdfFilePath = path.join(tmpDir, `temp-${Date.now()}.pdf`);

  try {
    // Write Word buffer to temp file
    fs.writeFileSync(wordFilePath, wordBuffer);

    // Use libreoffice-convert to convert
    const pdfBuffer = await convertAsync(wordBuffer, '.pdf', undefined);

    return pdfBuffer;
  } catch (error) {
    console.error('Error in Word to PDF conversion:', error);
    throw new Error('Failed to convert Word document to PDF');
  } finally {
    // Cleanup temp files
    if (fs.existsSync(wordFilePath)) {
      fs.unlinkSync(wordFilePath);
    }
    if (fs.existsSync(pdfFilePath)) {
      fs.unlinkSync(pdfFilePath);
    }
  }
}
