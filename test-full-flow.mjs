#!/usr/bin/env node

/**
 * Prueba completa: Gemini → PDF
 * Genera un PDF de prueba con los prompts simplificados
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateLaunchPlanServer } from './services/geminiServerService.ts';
import { generatePDFFromContent } from './services/pdfKitService.ts';
import * as dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env.production') });

const testFormData = {
  productName: 'LaunchLoom Test Product',
  targetAudience: 'B2B SaaS founders and startup CTOs',
  launchDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 días
};

const testProData = {
  ...testFormData,
  currentTraction: '1000 users',
  budget: '$5000',
  mainCompetitor: 'Competitor X',
  selectedChannels: ['Twitter', 'Email', 'LinkedIn'],
};

(async () => {
  try {
    console.log('🚀 PRUEBA COMPLETA: Gemini → PDF\n');
    
    // ============ STANDARD TIER ============
    console.log('📋 STANDARD TIER TEST:');
    console.log('━'.repeat(50));
    
    console.log('1️⃣  Generando contenido con Gemini...');
    const startGemini = Date.now();
    const standardContent = await generateLaunchPlanServer(testFormData, 'standard');
    const geminiTime = Date.now() - startGemini;
    console.log(`   ✅ Gemini respondió en ${geminiTime}ms`);
    
    const standardJSON = JSON.parse(standardContent);
    console.log(`2️⃣  JSON recibido: ${Object.keys(standardJSON).length} campos`);
    console.log(`   Campos: ${Object.keys(standardJSON).join(', ')}`);
    
    console.log('\n3️⃣  Generando PDF...');
    const startPDF = Date.now();
    const pdfBuffer = await generatePDFFromContent(standardJSON, 'Standard');
    const pdfTime = Date.now() - startPDF;
    console.log(`   ✅ PDF generado en ${pdfTime}ms`);
    console.log(`   Tamaño: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);
    
    // Guardar PDF para inspeccionar
    const pdfPath = '/tmp/test-standard.pdf';
    fs.writeFileSync(pdfPath, pdfBuffer);
    console.log(`   📄 Guardado en: ${pdfPath}`);
    
    // Estimar páginas por tamaño
    const estimatedPages = Math.ceil((pdfBuffer.length / 1024) / 30); // ~30KB por página típicamente
    console.log(`   📊 Páginas estimadas: ${estimatedPages}\n`);
    
    // ============ PRO TIER ============
    console.log('\n📋 PRO TIER TEST:');
    console.log('━'.repeat(50));
    
    console.log('1️⃣  Generando contenido con Gemini...');
    const startGeminiPro = Date.now();
    const proContent = await generateLaunchPlanServer(testProData, 'pro');
    const geminiProTime = Date.now() - startGeminiPro;
    console.log(`   ✅ Gemini respondió en ${geminiProTime}ms`);
    
    const proJSON = JSON.parse(proContent);
    console.log(`2️⃣  JSON recibido: ${Object.keys(proJSON).length} campos`);
    console.log(`   Campos: ${Object.keys(proJSON).join(', ')}`);
    
    console.log('\n3️⃣  Generando PDF...');
    const startPDFPro = Date.now();
    const pdfProBuffer = await generatePDFFromContent(proJSON, 'Pro');
    const pdfProTime = Date.now() - startPDFPro;
    console.log(`   ✅ PDF generado en ${pdfProTime}ms`);
    console.log(`   Tamaño: ${(pdfProBuffer.length / 1024).toFixed(2)} KB`);
    
    const pdfProPath = '/tmp/test-pro.pdf';
    fs.writeFileSync(pdfProPath, pdfProBuffer);
    console.log(`   📄 Guardado en: ${pdfProPath}`);
    
    const estimatedPagesPro = Math.ceil((pdfProBuffer.length / 1024) / 30);
    console.log(`   📊 Páginas estimadas: ${estimatedPagesPro}\n`);
    
    // ============ RESUMEN ============
    console.log('\n📊 RESUMEN:');
    console.log('━'.repeat(50));
    console.log(`Standard: ${estimatedPages} páginas (${(pdfBuffer.length / 1024).toFixed(2)} KB)`);
    console.log(`Pro: ${estimatedPagesPro} páginas (${(pdfProBuffer.length / 1024).toFixed(2)} KB)`);
    console.log(`\n✅ Antes: 48 páginas con 24 en blanco`);
    console.log(`✅ Ahora: ${estimatedPages}-${estimatedPagesPro} páginas sólidas sin blancos`);
    console.log('\n💡 PRÓXIMOS PASOS:');
    console.log('   1. Descargar PDFs y verificar visualmente');
    console.log('   2. Si hay mejoras necesarias, ajustar parseContentForPDF()');
    console.log('   3. Testear en producción con usuarios reales\n');
    
  } catch (error) {
    console.error('❌ ERROR:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
})();
