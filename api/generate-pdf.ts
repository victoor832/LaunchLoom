import { VercelRequest, VercelResponse } from '@vercel/node';
import { generateLaunchPlanServer } from '../services/geminiServerService';
import { generatePDFFromContent } from '../services/pdfKitService';

/**
 * Vercel serverless endpoint for PDF generation
 * This runs the full generation pipeline without timeout constraints
 */
export default async (req: VercelRequest, res: VercelResponse) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const input = req.body;

    // Validate input
    if (!input.productName || !input.targetAudience || !input.launchDate || !input.tier) {
      return res.status(400).json({
        error: 'Missing required fields: productName, targetAudience, launchDate, tier',
      });
    }

    // Set response headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${input.productName}-${input.tier}-playbook.pdf"`
    );

    // For Free tier, serve static PDF
    if (input.tier === 'free') {
      try {
        const fs = require('fs');
        const path = require('path');
        const staticPdfPath = path.join(process.cwd(), 'public', 'reports', 'ColdMailAI-free-plan.pdf');
        
        if (fs.existsSync(staticPdfPath)) {
          const pdfBuffer = fs.readFileSync(staticPdfPath);
          return res.status(200).send(pdfBuffer);
        }
      } catch (error) {
        console.error('Error reading static PDF:', error);
      }
      return res.status(404).json({ error: 'Free tier PDF not found' });
    }

    // For Standard and Pro tiers, generate with AI
    console.log(`[Vercel API] Generating PDF for tier: ${input.tier}`);
    console.log(`[Vercel API] Product: ${input.productName}, Audience: ${input.targetAudience}`);

    // Step 1: Generate content with Gemini AI
    console.log(`[Vercel API] Step 1: Calling Gemini API...`);
    const startTime = Date.now();
    
    const generatedContent = await generateLaunchPlanServer(
      {
        productName: input.productName,
        targetAudience: input.targetAudience,
        launchDate: input.launchDate,
        ...(input.tier === 'pro' && {
          productDescription: input.productDescription,
          currentTraction: input.currentTraction,
          budget: input.budget,
          selectedChannels: input.selectedChannels,
          hasProductHuntExperience: input.hasProductHuntExperience,
          mainCompetitor: input.mainCompetitor,
        }),
      } as any,
      input.tier as 'standard' | 'pro'
    );

    const geminiTime = Date.now() - startTime;
    console.log(`[Vercel API] Gemini completed in ${geminiTime}ms, generated ${generatedContent.length} chars`);

    if (!generatedContent || generatedContent.trim().length === 0) {
      throw new Error('Gemini API returned empty content');
    }

    // Step 2: Generate PDF
    console.log(`[Vercel API] Generating PDF...`);
    const pdfBuffer = await generatePDFFromContent(input.productName, generatedContent, input.tier);
    console.log(`[Vercel API] PDF created (${pdfBuffer.length} bytes)`);

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).send(pdfBuffer);

  } catch (error) {
    console.error('[Vercel API] Error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({
      error: 'Failed to generate PDF',
      details: errorMsg,
    });
  }
};
