import 'dotenv/config';
import express, { Request, Response } from 'express';
import { generateLaunchPlanServer } from './services/geminiServerService';
import { generatePDFFromContent } from './services/pdfKitService';
import cors from 'cors';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration - must be first middleware
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow all origins including requests without origin (like mobile apps)
    callback(null, true);
  },
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  maxAge: 3600,
  preflightContinue: false
};

app.use(cors(corsOptions));

// Additional CORS headers as fallback
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Max-Age', '3600');
  next();
});

app.use(express.json());

/**
 * POST /api/generate-pdf
 * New flow: AI Content → Word Document → PDF
 *
 * Body:
 * {
 *   productName: string
 *   targetAudience: string
 *   launchDate: string
 *   tier: 'free' | 'standard' | 'pro'
 *   daysToLaunch: number
 * }
 */
app.post('/api/generate-pdf', async (req: Request, res: Response) => {
  try {
    const input = req.body;

    // Validate input
    if (!input.productName || !input.targetAudience || !input.launchDate || !input.tier) {
      return res.status(400).json({
        error: 'Missing required fields: productName, targetAudience, launchDate, tier',
      });
    }

    if (!['free', 'standard', 'pro'].includes(input.tier)) {
      return res.status(400).json({ error: 'Invalid tier. Must be free, standard, or pro.' });
    }

    // Validate launch date is in the future
    const launchDate = new Date(input.launchDate);
    const today = new Date();
    const daysToLaunch = Math.ceil((launchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysToLaunch <= 0) {
      return res.status(400).json({
        error: `Tu fecha de lanzamiento ya pasó (${launchDate.toLocaleDateString()}). Este playbook te sirve para análisis post-launch o recalcula una fecha futura.`,
      });
    }

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${input.productName}-${input.tier}-playbook.pdf"`
    );

    // For Free tier, serve static PDF
    if (input.tier === 'free') {
      const staticPdfPath = join(process.cwd(), 'public', 'reports', 'ColdMailAI-free-plan.pdf');
      
      if (!existsSync(staticPdfPath)) {
        return res.status(404).json({ error: 'Free tier PDF not found' });
      }

      const fileStream = createReadStream(staticPdfPath);
      fileStream.pipe(res);
      
      fileStream.on('error', (error: Error) => {
        console.error('File streaming error:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to serve PDF' });
        }
      });
      
      return;
    }

    // For Standard and Pro tiers, generate with new flow
    console.log(`[API] Generating PDF for tier: ${input.tier}`);
    console.log(`[API] Product: ${input.productName}, Audience: ${input.targetAudience}`);

    // Send initial response headers to keep connection alive
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${input.productName}-${input.tier}-playbook.pdf"`
    );
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Step 1: Generate content with Gemini AI
    console.log(`[API] Step 1: Calling Gemini API...`);
    const generatedContent = await generateLaunchPlanServer(
      {
        productName: input.productName,
        targetAudience: input.targetAudience,
        launchDate: input.launchDate,
        // Add Pro+ fields if present
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

    if (!generatedContent || generatedContent.trim().length === 0) {
      throw new Error('Gemini API returned empty content');
    }

    console.log(`[API] Step 1 Complete: Generated ${generatedContent.length} characters`);

    // Step 2: Generate PDF directly from content (no Word intermediate step)
    console.log(`[API] Step 2: Generating PDF from content...`);
    const pdfBuffer = await generatePDFFromContent(input.productName, generatedContent, input.tier);
    console.log(`[API] Step 2 Complete: PDF created (${pdfBuffer.length} bytes)`);

    // Send PDF to client
    console.log(`[API] Sending PDF to client...`);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Disposition', `attachment; filename="${input.productName}-${input.tier}-playbook.pdf"`);
    res.set('Access-Control-Allow-Origin', '*');
    res.send(pdfBuffer);

  } catch (error) {
    console.error('[API] Error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to generate PDF',
        details: errorMsg 
      });
    }
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '2.0-pdfkit-direct',
    cors: 'enabled',
    buildTime: new Date().toISOString()
  });
});

// Start server with increased timeout for Gemini API calls (which can be slow)
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`📄 PDF API server running on http://0.0.0.0:${PORT}`);
  console.log(`✨ New flow: Gemini → PDF (direct generation)`);
  console.log(`POST /api/generate-pdf - Generate playbook (Free returns static, Standard/Pro generates from AI)`);
  console.log(`GET /api/health - Health check`);
});

// Increase timeout for long-running requests (Gemini API calls can be slow)
server.setTimeout(120000); // 120 seconds
