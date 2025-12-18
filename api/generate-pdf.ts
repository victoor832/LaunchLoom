import { VercelRequest, VercelResponse } from '@vercel/node';
import https from 'https';

// Helper function to call Gemini API
async function callGeminiAPI(prompt: string, apiKey: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (parsed.candidates && parsed.candidates[0]?.content?.parts[0]?.text) {
            resolve(parsed.candidates[0].content.parts[0].text);
          } else {
            reject(new Error('No content in Gemini response'));
          }
        } catch (e) {
          reject(new Error(`Failed to parse Gemini response: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Helper function to create a simple PDF from text content
function createPDFFromContent(title: string, content: string): Buffer {
  // Simple PDF structure
  let pdf = '%PDF-1.4\n';
  
  // Object 1: Catalog
  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  
  // Object 2: Pages
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  
  // Object 3: Page
  const obj3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n';
  
  // Object 4: Resources
  const obj4 = '4 0 obj\n<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>\nendobj\n';
  
  // Object 5: Content stream
  let stream = 'BT\n/F1 16 Tf\n50 750 Td\n';
  stream += `(${title.replace(/[()]/g, '\\$&')}) Tj\n`;
  stream += '0 -30 Td\n';
  stream += '/F1 10 Tf\n';
  
  // Add content lines
  const lines = content.split('\n').slice(0, 30); // Limit to first 30 lines
  for (const line of lines) {
    if (line.trim()) {
      stream += `(${line.replace(/[()]/g, '\\$&')}) Tj\n`;
      stream += '0 -15 Td\n';
    }
  }
  stream += 'ET\n';
  
  const obj5 = `5 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}endstream\nendobj\n`;
  
  // Build xref
  const xrefStart = (obj1 + obj2 + obj3 + obj4 + obj5).length + pdf.length;
  const xref = `xref\n0 6\n0000000000 65535 f\n${String(obj1.length + pdf.length).padStart(10, '0')} 00000 n\n${String(obj1.length + obj2.length + pdf.length).padStart(10, '0')} 00000 n\n${String(obj1.length + obj2.length + obj3.length + pdf.length).padStart(10, '0')} 00000 n\n${String(obj1.length + obj2.length + obj3.length + obj4.length + pdf.length).padStart(10, '0')} 00000 n\n${String(obj1.length + obj2.length + obj3.length + obj4.length + obj5.length + pdf.length).padStart(10, '0')} 00000 n\n`;
  
  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart + obj1.length + obj2.length + obj3.length + obj4.length}\n%%EOF`;
  
  const fullPDF = pdf + obj1 + obj2 + obj3 + obj4 + obj5 + xref + trailer;
  return Buffer.from(fullPDF, 'utf8');
}

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

    // For standard and pro tiers, generate with Gemini
    try {
      const apiKey = process.env.VITE_GEMINI_API_KEY || '';
      
      if (!apiKey) {
        console.error('[API] VITE_GEMINI_API_KEY not configured');
        return res.status(500).json({ error: 'API key not configured' });
      }

      console.log(`[API] Calling Gemini API for ${tier} tier...`);

      const prompt = `Create a concise launch playbook for "${productName}" targeting ${targetAudience} launching on ${launchDate}. 

Provide key sections:
1. Pre-Launch (2 weeks before)
2. Launch Day
3. Post-Launch (first week)

For each section, list specific actionable tasks. Keep it brief and practical.`;

      const content = await callGeminiAPI(prompt, apiKey);
      console.log(`[API] Generated ${content.length} characters from Gemini`);

      // Create PDF from generated content
      const pdfBuffer = createPDFFromContent(`Launch Playbook: ${productName}`, content);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${productName}-launch-playbook-${tier}.pdf"`);
      return res.status(200).send(pdfBuffer);

    } catch (error) {
      console.error('[API] Gemini Error:', error);
      return res.status(500).json({ 
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : String(error)
      });
    }

  } catch (error) {
    console.error('[API] Error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate PDF',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};
