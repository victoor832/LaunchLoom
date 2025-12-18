import { VercelRequest, VercelResponse } from '@vercel/node';
import 'dotenv/config';
import { generateLaunchPlanServer } from '../services/geminiServerService';
import { generateWordDocument, WordDocumentInput } from '../services/wordGeneratorService';
import { convertWordToPDF } from '../services/pdfConverterService';

export default async (req: VercelRequest, res: VercelResponse) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { productName, targetAudience, launchDate, tier, daysToLaunch } = req.body;

    // Validate required fields
    if (!productName || !targetAudience || !launchDate || !tier || daysToLaunch === undefined) {
      res.status(400).json({ error: 'Missing required fields: productName, targetAudience, launchDate, tier, daysToLaunch' });
      return;
    }

    console.log(`[API] Generating PDF for tier: ${tier}`);
    console.log(`[API] Product: ${productName}, Audience: ${targetAudience}`);

    // Stage 1: Generate content with Gemini
    console.log(`[API] Step 1: Calling Gemini API...`);
    let generatedContent = '';

    if (tier === 'free') {
      // Free tier: static content
      generatedContent = JSON.stringify({
        emailTemplates: [],
        twitterPosts: [],
        linkedinPosts: [],
        timeline: [],
        successMetrics: {}
      });
    } else {
      // Standard/Pro tier: call Gemini
      try {
        const formData: any = {
          productName,
          targetAudience,
          launchDate
        };

        generatedContent = await generateLaunchPlanServer(formData, tier);
      } catch (apiError) {
        console.error('[API] Gemini API Error:', apiError);
        throw new Error(`Failed to generate content from Gemini API: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
      }
    }

    if (!generatedContent || generatedContent.trim().length === 0) {
      throw new Error('Gemini API returned empty content');
    }

    const contentLength = generatedContent.length;
    console.log(`[API] Step 1 Complete: Generated ${contentLength} characters`);

    // Stage 2: Create Word document
    console.log(`[API] Step 2: Creating Word document...`);
    const wordInput: WordDocumentInput = {
      productName,
      targetAudience,
      launchDate,
      tier: tier as 'free' | 'standard' | 'pro',
      daysToLaunch,
      generatedContent
    };

    const wordBuffer = await generateWordDocument(wordInput);
    console.log(`[API] Step 2 Complete: Word document created (${wordBuffer.length} bytes)`);

    // Stage 3: Convert to PDF
    console.log(`[API] Step 3: Converting Word to PDF...`);
    const pdfBuffer = await convertWordToPDF(wordBuffer);
    console.log(`[API] Step 3 Complete: PDF created (${pdfBuffer.length} bytes)`);

    // Send PDF to client
    console.log(`[API] Sending PDF to client...`);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${productName}-launch-playbook-${tier}.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('[API] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: `Failed to generate PDF: ${errorMessage}` });
  }
};
