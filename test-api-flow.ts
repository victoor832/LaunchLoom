/**
 * Test que simula exactamente el flujo del API en producción
 */

import { generateLaunchPlanServer } from './services/geminiServerService';
import { generatePDFFromContent } from './services/pdfKitService';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const testData = {
  productName: 'Test Product',
  targetAudience: 'SaaS founders',
  launchDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  currentUsers: '0' as const,
  email: 'test@example.com',
};

(async () => {
  try {
    console.log('🔄 Simulando flujo completo del API...\n');
    
    // Step 1: Gemini genera contenido
    console.log('Step 1: Llamando Gemini...');
    const startGemini = Date.now();
    const generatedContent = await generateLaunchPlanServer(testData, 'standard');
    const geminiTime = Date.now() - startGemini;
    
    console.log(`✅ Gemini respondió en ${geminiTime}ms`);
    console.log(`   Content length: ${generatedContent.length} caracteres`);
    
    // Guardar JSON para inspeccionar
    fs.writeFileSync('/tmp/api-flow-content.json', generatedContent);
    console.log('   Guardado en /tmp/api-flow-content.json\n');
    
    // Step 2: Generar PDF exactamente como el API
    console.log('Step 2: Generando PDF (como hace el API)...');
    console.log('   Llamando: generatePDFFromContent(productName, content, tier)');
    
    const startPDF = Date.now();
    const pdfBuffer = await generatePDFFromContent(testData.productName, generatedContent, 'standard');
    const pdfTime = Date.now() - startPDF;
    
    console.log(`✅ PDF generado en ${pdfTime}ms`);
    console.log(`   Tamaño: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
    
    // Guardar PDF
    fs.writeFileSync('/tmp/api-flow-output.pdf', pdfBuffer);
    console.log('   Guardado en /tmp/api-flow-output.pdf\n');
    
    // Obtener número de páginas
    const childProcess = require('child_process');
    const result = childProcess.spawnSync('pdfinfo', ['/tmp/api-flow-output.pdf'], { encoding: 'utf-8' });
    const pages = result.stdout.match(/Pages:\s*(\d+)/)?.[1] || '?';
    
    console.log(`📊 RESULTADO: ${pages} páginas`);
    console.log(`⏱️  Tiempo total: ${geminiTime + pdfTime}ms\n`);
    
  } catch (error) {
    console.error('❌ ERROR:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
})();
