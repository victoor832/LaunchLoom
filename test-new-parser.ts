/**
 * Test PDF generation con el nuevo parser
 */

import fs from 'fs';
import { generatePDFFromContent } from './services/pdfKitService';

(async () => {
  try {
    const jsonStr = fs.readFileSync('/tmp/gemini-response-standard.json', 'utf-8');
    const json = JSON.parse(jsonStr);
    
    console.log('🔄 Generando PDF con el nuevo parser...\n');
    const pdfBuffer = await generatePDFFromContent(json, 'standard');
    
    fs.writeFileSync('/tmp/test-new-parser.pdf', pdfBuffer);
    console.log('\n✅ PDF generado exitosamente');
    
    // Check file
    const stats = fs.statSync('/tmp/test-new-parser.pdf');
    console.log(`📄 Archivo: ${stats.size} bytes`);
    
    // Get page count with file command
    const { execSync } = await import('child_process');
    try {
      const info = execSync('file /tmp/test-new-parser.pdf').toString();
      console.log(`ℹ️  ${info.trim()}`);
    } catch {
      console.log('(file command not available)');
    }
    
  } catch (error) {
    console.error('❌ ERROR:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
})();
