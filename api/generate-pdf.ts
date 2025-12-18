import { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import { join } from 'path';
import { generateLaunchPlanServer } from '../services/geminiServerService';
import { generateWordDocument, WordDocumentInput } from '../services/wordGeneratorService';
import { convertWordToPDF } from '../services/pdfConverterService';

export default async (req: VercelRequest, res: VercelResponse) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productName, targetAudience, launchDate, tier, daysToLaunch, productDescription, currentTraction, budget, selectedChannels, hasProductHuntExperience, mainCompetitor } = req.body;

    // Validate required fields
    if (!productName || !targetAudience || !launchDate || !tier) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log(`[API] Processing ${tier} tier for: ${productName}`);

    // For free tier, serve static PDF
    if (tier === 'free') {
      try {
        const pdfPath = join(process.cwd(), 'public', 'reports', 'ColdMailAI-free-plan.pdf');
        const pdfBuffer = readFileSync(pdfPath);
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${productName}-free-plan.pdf"`);
        return res.status(200).send(pdfBuffer);
      } catch (error) {
        console.error('[API] Error reading static PDF:', error);
        return res.status(500).json({ error: 'Failed to serve free plan PDF' });
      }
    }

    // For standard and pro tiers, generate with AI
    console.log(`[API] Generating content for ${tier} tier...`);

    try {
      // Build form data for Gemini
      const formData: any = {
        productName,
        targetAudience,
        launchDate,
      };

      // Add Pro+ fields if applicable
      if (tier === 'pro') {
        formData.productDescription = productDescription;
        formData.currentTraction = currentTraction;
        formData.budget = budget;
        formData.selectedChannels = selectedChannels;
        formData.hasProductHuntExperience = hasProductHuntExperience;
        formData.mainCompetitor = mainCompetitor;
      }

      // Step 1: Generate content with Gemini
      console.log(`[API] Step 1: Calling Gemini API...`);
      const generatedContent = await generateLaunchPlanServer(formData, tier as 'standard' | 'pro');

      if (!generatedContent || generatedContent.trim().length === 0) {
        throw new Error('Gemini API returned empty content');
      }

      console.log(`[API] Step 1 Complete: Generated ${generatedContent.length} characters`);

      // Step 2: Create Word document
      console.log(`[API] Step 2: Creating Word document...`);
      const wordInput: WordDocumentInput = {
        productName,
        targetAudience,
        launchDate,
        tier: tier as 'free' | 'standard' | 'pro',
        daysToLaunch: daysToLaunch || 0,
        generatedContent,
      };

      const wordBuffer = await generateWordDocument(wordInput);
      console.log(`[API] Step 2 Complete: Word document created (${wordBuffer.length} bytes)`);

      // Step 3: Convert to PDF
      console.log(`[API] Step 3: Converting Word to PDF...`);
      const pdfBuffer = await convertWordToPDF(wordBuffer);
      console.log(`[API] Step 3 Complete: PDF created (${pdfBuffer.length} bytes)`);

      // Send PDF to client
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${productName}-launch-playbook-${tier}.pdf"`);
      return res.status(200).send(pdfBuffer);

    } catch (error) {
      console.error('[API] Generation Error:', error);
      throw error;
    }

  } catch (error) {
    console.error('[API] Error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate PDF',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};
