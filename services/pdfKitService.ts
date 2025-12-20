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
 * Handles both JSON and markdown, maximizing content display
 */
function parseContentForPDF(content: string) {
  const sections: PDFSection[] = [];

  try {
    // Try to parse as JSON first
    const json = JSON.parse(content);
    
    console.log(`[PDF] Parsed JSON with ${Object.keys(json).length} top-level keys`);
    
    // Sort keys to put important sections first
    const sortedKeys = Object.keys(json).sort((a, b) => {
      const priority: {[key: string]: number} = {
        'executiveSummary': 1,
        'marketAnalysis': 2,
        'targetAudience': 3,
        'marketOpportunity': 4,
        'productPositioning': 5,
        'goToMarketStrategy': 6,
        'competitorAnalysis': 7,
        'budgetBreakdown': 8,
      };
      return (priority[a] || 100) - (priority[b] || 100);
    });
    
    // Process each field in the JSON object
    sortedKeys.forEach((key) => {
      if (!key || key === 'undefined' || key === 'null') return;

      const value = json[key];
      const keyName = formatKeyName(key);
      
      // Add section header
      sections.push({
        title: keyName,
        isHeading: true,
      });

      // Process the value based on its type
      if (typeof value === 'string' && value.trim()) {
        // Split long strings into readable paragraphs, but keep them compact
        const paragraphs = value
          .split('\n\n')
          .map(p => p.trim())
          .filter(p => p.length > 0);
        
        paragraphs.forEach((para) => {
          // Don't add empty paragraphs or placeholder text
          if (para && para !== '...' && para.length > 5) {
            sections.push({
              content: para,
            });
          }
        });
      } else if (Array.isArray(value)) {
        // Array - render as bullet list, but filter out empty/placeholder items
        const validItems = value
          .filter(item => {
            if (!item) return false;
            if (typeof item === 'string') {
              return item.trim().length > 0 && 
                     item !== '...' && 
                     !item.match(/^\.\.\./);
            }
            return true;
          })
          .slice(0, 50); // Limit to 50 items max per section
        
        if (validItems.length > 0) {
          validItems.forEach((item, idx) => {
            if (typeof item === 'string' && item.trim()) {
              // Use numbered list for clarity
              const num = idx + 1;
              sections.push({
                content: `${num}. ${item.trim().replace(/^[\d]+\.\s*/, '')}`,
              });
            } else if (typeof item === 'object' && item !== null) {
              // Object in array - stringify it nicely
              const str = Object.entries(item)
                .map(([k, v]) => {
                  const val = String(v).trim();
                  return val && val !== '...' ? `${val}` : '';
                })
                .filter(s => s.length > 0)
                .join(' | ');
              if (str && str.length > 5) {
                sections.push({
                  content: `${idx + 1}. ${str}`,
                });
              }
            }
          });
        }
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Nested object - add as items
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (subKey && subValue) {
            const subKeyName = formatKeyName(subKey);
            if (typeof subValue === 'string' && subValue.trim()) {
              sections.push({
                title: subKeyName,
                isSubheading: true,
              });
              sections.push({
                content: subValue.trim(),
              });
            } else if (Array.isArray(subValue)) {
              const validSub = subValue
                .filter(v => typeof v === 'string' && v.trim().length > 0)
                .slice(0, 20);
              
              if (validSub.length > 0) {
                sections.push({
                  title: subKeyName,
                  isSubheading: true,
                });
                validSub.forEach((item, idx) => {
                  sections.push({
                    content: `${idx + 1}. ${item.trim()}`,
                  });
                });
              }
            }
          }
        });
      }

      // Add spacing after section (but less than before)
      sections.push({ content: '' });
    });
    
    // Filter out consecutive empty sections
    const filtered: PDFSection[] = [];
    let lastWasEmpty = false;
    sections.forEach(section => {
      if (!section.content && !section.title) {
        if (!lastWasEmpty) {
          filtered.push(section);
          lastWasEmpty = true;
        }
      } else {
        filtered.push(section);
        lastWasEmpty = false;
      }
    });
    
    if (filtered.length === 0) {
      throw new Error('No content extracted from JSON');
    }
    
    console.log(`[PDF] Created ${filtered.length} sections from JSON (filtered from ${sections.length})`);
    return { sections: filtered };
  } catch (jsonError) {
    console.warn(`[PDF] JSON parsing failed, trying markdown/text format`);
    
    // Fallback: treat as markdown or plain text
    const lines = content.split('\n');
    let currentSection: PDFSection = {};

    lines.forEach((line) => {
      const trimmed = line.trim();

      if (!trimmed) {
        if (currentSection.content || currentSection.title) {
          sections.push(currentSection);
          currentSection = {};
        }
        return;
      }

      // Detect headings - multiple styles
      if (trimmed.startsWith('# ')) {
        if (currentSection.title || currentSection.content) {
          sections.push(currentSection);
        }
        currentSection = {
          title: trimmed.replace(/^#+\s*/, ''),
          isHeading: true,
        };
      } else if (trimmed.startsWith('## ')) {
        if (currentSection.title || currentSection.content) {
          sections.push(currentSection);
        }
        currentSection = {
          title: trimmed.replace(/^#+\s*/, ''),
          isSubheading: true,
        };
      } else if (trimmed.match(/^[\d•\-\*]\s/)) {
        // List item
        if (currentSection.content) {
          currentSection.content += '\n' + trimmed;
        } else {
          currentSection.content = trimmed;
        }
      } else {
        // Regular text
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
