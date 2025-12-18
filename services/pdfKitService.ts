import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export interface PDFSection {
  title?: string;
  content?: string;
  isBold?: boolean;
  isHeading?: boolean;
  isSubheading?: boolean;
}

/**
 * Generate PDF directly from content without LibreOffice dependency
 * This is much lighter and faster than Word → PDF conversion
 */
export async function generatePDFFromContent(
  productName: string,
  content: string,
  tier: 'free' | 'standard' | 'pro'
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      console.log(`[PDF] Starting PDF generation for ${productName} (${tier} tier)`);
      console.log(`[PDF] Content length: ${content.length} characters`);
      
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        bufferPages: true,
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        try {
          const pdfBuffer = Buffer.concat(chunks);
          console.log(`[PDF] PDF generation complete: ${pdfBuffer.length} bytes`);
          resolve(pdfBuffer);
        } catch (bufferError) {
          console.error(`[PDF] Buffer concatenation error:`, bufferError);
          reject(bufferError);
        }
      });
      doc.on('error', (docError) => {
        console.error(`[PDF] PDFDocument error:`, docError);
        reject(docError);
      });

      // Title
      doc
        .fontSize(28)
        .font('Helvetica-Bold')
        .text(`${productName} Launch Playbook`, { align: 'center' })
        .moveDown(0.5);

      // Tier badge
      const tierColor = tier === 'pro' ? '#00AA00' : tier === 'standard' ? '#0066CC' : '#666666';
      doc
        .fontSize(12)
        .fillColor(tierColor)
        .text(`${tier.toUpperCase()} TIER`, { align: 'center' })
        .moveDown(1)
        .fillColor('black');

      // Table of Contents
      doc.fontSize(14).font('Helvetica-Bold').text('Table of Contents', { underline: true });
      doc.moveDown(0.3);

      // Parse content and add to PDF
      try {
        console.log(`[PDF] Parsing content for sections...`);
        const parsed = parseContentForPDF(content);
        console.log(`[PDF] Parsed into ${parsed.sections.length} sections`);
        let pageNum = 2;

        // Add sections
        parsed.sections.forEach((section, index) => {
          try {
            // Skip empty sections
            if (!section.title && !section.content) return;

            // Check if we need a page break
            if (doc.y > doc.page.height - 80) {
              doc.addPage();
              pageNum++;
              doc.fontSize(10).fillColor('#999999').text(`Page ${pageNum}`, { align: 'right' });
              doc.moveUp(0.5);
            }

            if (section.isHeading) {
              // Main heading
              doc
                .fontSize(16)
                .font('Helvetica-Bold')
                .fillColor('#0066CC')
                .text(section.title || '', { underline: true })
                .moveDown(0.4)
                .fillColor('black')
                .font('Helvetica');
            } else if (section.isSubheading) {
              // Subheading
              doc
                .fontSize(13)
                .font('Helvetica-Bold')
                .fillColor('#333333')
                .text(section.title || '')
                .moveDown(0.25)
                .font('Helvetica')
                .fillColor('black');
            } else if (section.content) {
              // Regular content - handle bullets and lists
              const text = section.content;
              
              if (text.startsWith('•') || text.startsWith('- ') || text.match(/^\d+\./)) {
                // List item - indent slightly
                doc.fontSize(11).text(text, { align: 'left', lineGap: 2, indent: 15 });
              } else if (text.trim() === '') {
                // Blank line
                doc.moveDown(0.1);
              } else {
                // Regular paragraph
                doc.fontSize(11).text(text, { align: 'left', lineGap: 3 });
              }
            }

            doc.moveDown(0.2);
          } catch (sectionError) {
            console.warn(`[PDF] Error rendering section ${index}:`, sectionError);
            // Continue with next section even if this one fails
          }
        });
        console.log(`[PDF] Finished rendering sections`);
      } catch (parseError) {
        console.error('[PDF] Error parsing content for PDF:', parseError);
        // If parsing fails, just add raw content as fallback
        try {
          doc.fontSize(11).text(content, { align: 'left', lineGap: 3 });
        } catch (rawError) {
          console.error('[PDF] Error rendering raw content fallback:', rawError);
          // Last resort - add a message
          doc.fontSize(11).text('Unable to render content. Please try again.');
        }
      }

      // Footer with page numbers
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 1; i <= pageCount; i++) {
        doc.switchToPage(i - 1);
        doc.fontSize(10).fillColor('#999999').text(`Page ${i} of ${pageCount}`, 40, doc.page.height - 30, {
          align: 'center',
        });
      }

      doc.end();
    } catch (error) {
      reject(new Error(`Failed to generate PDF: ${error}`));
    }
  });
}

/**
 * Convert camelCase or snake_case keys to readable titles
 */
function formatKeyName(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1') // Add space before capitals
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/\b\w/g, char => char.toUpperCase()) // Title case
    .trim();
}

/**
 * Parse AI-generated content into structured PDF sections
 * Maintains hierarchy: headings > subheadings > lists > content
 */
function parseContentForPDF(content: string) {
  const sections: PDFSection[] = [];

  try {
    // Try to parse as JSON first
    const json = JSON.parse(content);
    
    // Flatten and process JSON into sections
    const processValue = (value: any, keyName: string, isTopLevel: boolean): void => {
      if (keyName && keyName !== 'undefined' && keyName !== 'null') {
        // Add section title
        sections.push({
          title: keyName,
          isHeading: isTopLevel,
          isSubheading: !isTopLevel,
        });
      }

      if (typeof value === 'string' && value.trim()) {
        sections.push({ content: value.trim() });
      } else if (Array.isArray(value)) {
        // Process array items
        value.forEach((item) => {
          if (typeof item === 'string') {
            sections.push({ content: `• ${item}` });
          } else if (typeof item === 'object' && item !== null) {
            const texts: string[] = [];
            Object.values(item).forEach((v) => {
              if (typeof v === 'string' && v.trim()) {
                texts.push(v);
              }
            });
            if (texts.length > 0) {
              sections.push({ content: `• ${texts.join(' — ')}` });
            }
          }
        });
      } else if (typeof value === 'object' && value !== null) {
        // Process nested object
        Object.entries(value).forEach(([k, v]) => {
          if (k && k !== 'undefined' && k !== 'null') {
            processValue(v, formatKeyName(k), false);
          }
        });
      }
    };

    // Start processing from top level
    Object.entries(json).forEach(([key, value]) => {
      processValue(value, formatKeyName(key), true);
      sections.push({ content: '' }); // Add spacing
    });
    
    if (sections.length === 0) {
      throw new Error('No content extracted from JSON');
    }
  } catch (jsonError) {
    // If not JSON, treat as markdown or plain text
    const lines = content.split('\n');
    let currentSection: PDFSection = {};

    lines.forEach((line) => {
      const trimmed = line.trim();

      if (!trimmed) return;

      // Detect headings
      if (trimmed.startsWith('##')) {
        if (currentSection.title || currentSection.content) {
          sections.push(currentSection);
        }
        currentSection = {
          title: trimmed.replace(/^#+\s*/, ''),
          isHeading: true,
        };
      } else if (trimmed.match(/^#{1,2}\s/)) {
        if (currentSection.title || currentSection.content) {
          sections.push(currentSection);
        }
        currentSection = {
          title: trimmed.replace(/^#+\s*/, ''),
          isHeading: trimmed.startsWith('##'),
          isSubheading: !trimmed.startsWith('##'),
        };
      } else if (trimmed.match(/^\d+\.\s/) || trimmed.match(/^-\s/)) {
        // Bullet point
        if (currentSection.content) {
          currentSection.content += '\n' + trimmed;
        } else {
          currentSection.content = trimmed;
        }
      } else {
        // Regular content
        if (currentSection.content) {
          currentSection.content += '\n' + trimmed;
        } else {
          currentSection.content = trimmed;
        }
      }
    });

    if (currentSection.title || currentSection.content) {
      sections.push(currentSection);
    }
  }

  return { sections };
}
