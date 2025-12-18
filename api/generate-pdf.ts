import { VercelRequest, VercelResponse } from '@vercel/node';
import { readFileSync } from 'fs';
import { join } from 'path';
import https from 'https';

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
    const { productName, targetAudience, launchDate, tier } = req.body;

    // Validate required fields
    if (!productName || !targetAudience || !launchDate || !tier) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log(`[API] Processing ${tier} tier for: ${productName}`);

    // For free tier, download from GitHub
    if (tier === 'free') {
      try {
        console.log('[API] Downloading free tier PDF from GitHub...');
        
        const githubUrl = 'https://raw.githubusercontent.com/victoor832/LaunchLoom/main/public/reports/ColdMailAI-free-plan.pdf';
        
        return new Promise((resolve) => {
          https.get(githubUrl, (response) => {
            if (response.statusCode !== 200) {
              console.error('[API] GitHub returned status:', response.statusCode);
              res.status(500).json({ error: 'Failed to download free plan PDF' });
              resolve(undefined);
              return;
            }

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${productName}-free-plan.pdf"`);
            response.pipe(res);
          }).on('error', (error) => {
            console.error('[API] GitHub download error:', error);
            res.status(500).json({ error: 'Failed to download free plan PDF' });
            resolve(undefined);
          });
        });
      } catch (error) {
        console.error('[API] Error downloading PDF:', error);
        return res.status(500).json({ error: 'Failed to serve free plan PDF' });
      }
    }

    // For standard and pro tiers, return placeholder for now
    console.log('[API] Standard/Pro tier - placeholder response');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${productName}-playbook-${tier}.pdf"`);
    
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
endobj
5 0 obj
<< /Length 100 >>
stream
BT
/F1 12 Tf
50 750 Td
(Playbook - Coming Soon) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000214 00000 n
0000000317 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
467
%%EOF`;

    return res.status(200).send(Buffer.from(pdfContent, 'utf8'));

  } catch (error) {
    console.error('[API] Error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate PDF',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};
