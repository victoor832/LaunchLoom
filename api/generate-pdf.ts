import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, BorderStyle } from 'docx';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

    // For now, return a simple success for free tier
    if (tier === 'free') {
      // Create a minimal PDF response
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${productName}-playbook-free.pdf"`);
      
      // Return empty PDF for free tier (temporary)
      return res.status(200).send(Buffer.from('%PDF-1.4\n%EOF', 'utf8'));
    }

    // For standard and pro tiers
    const apiKey = process.env.VITE_GEMINI_API_KEY || '';
    
    if (!apiKey) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    console.log(`[API] Calling Gemini API...`);
    
    const genAI = new GoogleGenAI({ apiKey });
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Generate a launch playbook for ${productName} targeting ${targetAudience}. Launch date: ${launchDate}. Keep it concise and actionable.`;

    const result = await model.generateContent(prompt);
    const generatedContent = result.response.text();

    if (!generatedContent || generatedContent.length === 0) {
      return res.status(500).json({ error: 'Failed to generate content' });
    }

    console.log(`[API] Generated ${generatedContent.length} characters`);

    // Create a simple text response for now
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${productName}-playbook-${tier}.pdf"`);
    
    // Return a simple PDF with the content
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
(Launch Playbook) Tj
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
