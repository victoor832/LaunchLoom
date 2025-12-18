import { VercelRequest, VercelResponse } from '@vercel/node';

// For now, return a placeholder PDF for all tiers
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
    const { productName, targetAudience, launchDate, tier, daysToLaunch } = req.body;

    // Validate required fields
    if (!productName || !targetAudience || !launchDate || !tier) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log(`[API] Processing ${tier} tier for: ${productName}`);

    // TODO: Integrate with Gemini API to generate real content
    // For now, return a placeholder PDF

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${productName}-playbook-${tier}.pdf"`);
    
    // Return a simple PDF placeholder
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
<< /Length 200 >>
stream
BT
/F1 16 Tf
50 750 Td
(${productName} - Launch Playbook) Tj
0 -30 Td
/F1 12 Tf
(Target: ${targetAudience}) Tj
0 -20 Td
(Launch Date: ${launchDate}) Tj
0 -20 Td
(Tier: ${tier}) Tj
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
567
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
