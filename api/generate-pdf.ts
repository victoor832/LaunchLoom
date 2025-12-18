import { VercelRequest, VercelResponse } from '@vercel/node';

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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productName, targetAudience, launchDate, tier, daysToLaunch } = req.body;

    // Validate required fields
    if (!productName || !targetAudience || !launchDate || !tier || daysToLaunch === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log(`[API] Received request for ${tier} tier: ${productName}`);

    // Import services here to catch any errors
    try {
      const { generateLaunchPlanServer } = await import('../services/geminiServerService');
      const { generateWordDocument } = await import('../services/wordGeneratorService');
      const { convertWordToPDF } = await import('../services/pdfConverterService');

      // Generate content
      let generatedContent = '';

      if (tier === 'free') {
        generatedContent = '{}';
      } else {
        generatedContent = await generateLaunchPlanServer(
          { productName, targetAudience, launchDate } as any,
          tier as 'standard' | 'pro'
        );
      }

      // Create Word document
      const wordBuffer = await generateWordDocument({
        productName,
        targetAudience,
        launchDate,
        tier: tier as 'free' | 'standard' | 'pro',
        daysToLaunch,
        generatedContent
      });

      // Convert to PDF
      const pdfBuffer = await convertWordToPDF(wordBuffer);

      // Send PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${productName}-playbook-${tier}.pdf"`);
      res.send(pdfBuffer);
    } catch (importError) {
      console.error('[API] Import/Service Error:', importError);
      return res.status(500).json({ 
        error: 'Service error',
        details: importError instanceof Error ? importError.message : String(importError)
      });
    }
  } catch (error) {
    console.error('[API] Unexpected Error:', error);
    return res.status(500).json({ 
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};
