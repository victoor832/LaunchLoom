import PDFDocument from 'pdfkit';

export interface PDFSection {
  title?: string;
  content?: string;
  isBold?: boolean;
  isHeading?: boolean;
  isSubheading?: boolean;
}

/**
 * Generate PDF directly from content without LibreOffice dependency
 */
export async function generatePDFFromContent(
  productNameOrContent: string | Record<string, any>,
  contentOrTier?: string,
  tier?: 'free' | 'standard' | 'pro'
): Promise<Buffer> {
  // Handle both old and new signatures
  let productName: string;
  let content: string;
  let finalTier: 'free' | 'standard' | 'pro';

  if (typeof productNameOrContent === 'object') {
    productName = (productNameOrContent.productName || productNameOrContent.product || 'Launch Playbook');
    content = JSON.stringify(productNameOrContent);
    finalTier = (contentOrTier as any) || 'standard';
  } else {
    productName = productNameOrContent;
    content = contentOrTier || '';
    finalTier = tier || 'standard';
  }

  return new Promise((resolve, reject) => {
    try {
      console.log(`[PDF] Starting PDF generation for ${productName} (${finalTier} tier)`);
      
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        bufferPages: true,
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        console.log(`[PDF] PDF complete: ${pdfBuffer.length} bytes`);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Title
      doc
        .fontSize(28)
        .font('Helvetica-Bold')
        .text(`${productName} Launch Playbook`, { align: 'center' })
        .moveDown(0.5);

      // Tier badge
      const tierColor = finalTier === 'pro' ? '#00AA00' : finalTier === 'standard' ? '#0066CC' : '#666666';
      doc
        .fontSize(12)
        .fillColor(tierColor)
        .text(`${finalTier.toUpperCase()} TIER`, { align: 'center' })
        .moveDown(1)
        .fillColor('black');

      // Parse and render
      const parsed = parseContentForPDF(content);
      console.log(`[PDF] Parsed into ${parsed.sections.length} sections`);
      
      parsed.sections.forEach((section) => {
        if (!section.title && !section.content) return;

        if (section.isHeading) {
          doc
            .fontSize(16)
            .font('Helvetica-Bold')
            .fillColor('#0066CC')
            .text(section.title || '', { underline: true })
            .moveDown(0.4)
            .fillColor('black')
            .font('Helvetica');
        } else if (section.isSubheading) {
          doc
            .fontSize(13)
            .font('Helvetica-Bold')
            .fillColor('#333333')
            .text(section.title || '')
            .moveDown(0.25)
            .font('Helvetica')
            .fillColor('black');
        } else if (section.content) {
          doc.fontSize(11).text(section.content, { align: 'left', lineGap: 3 });
        }

        doc.moveDown(0.2);

        // Page break if needed
        if (doc.y > doc.page.height - 60) {
          doc.addPage();
        }
      });

      // Footer
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 1; i <= pageCount; i++) {
        doc.switchToPage(i - 1);
        doc.fontSize(10).fillColor('#999999').text(`Page ${i} of ${pageCount}`, 40, doc.page.height - 30, {
          align: 'center',
        });
      }

      doc.end();
    } catch (error) {
      reject(new Error(`PDF generation failed: ${error}`));
    }
  });
}

function formatKeyName(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
    .trim();
}

function parseContentForPDF(content: string) {
  const sections: PDFSection[] = [];

  try {
    const json = JSON.parse(content);
    console.log(`[PDF] Parsed JSON with ${Object.keys(json).length} keys`);

    Object.entries(json).forEach(([key, value]) => {
      if (!key || !value) return;

      const keyName = formatKeyName(key);
      sections.push({ title: keyName, isHeading: true });

      // String content
      if (typeof value === 'string' && value.trim()) {
        const paragraphs = value
          .split('\n\n')
          .map(p => p.trim())
          .filter(p => p.length > 5);

        paragraphs.forEach((para) => {
          sections.push({ content: para });
        });
      }
      // Array content
      else if (Array.isArray(value)) {
        value.slice(0, 50).forEach((item, idx) => {
          if (!item) return;

          if (typeof item === 'string') {
            sections.push({
              content: `${idx + 1}. ${item.trim().replace(/^\d+\.\s*/, '')}`,
            });
          } else if (typeof item === 'object') {
            // Email with subject/body
            if (item.subject && item.body) {
              sections.push({
                content: `${idx + 1}. ${item.subject}`,
                isBold: true,
              });
              sections.push({
                content: String(item.body).trim(),
              });
            }
            // Social media post
            else if (item.platform) {
              sections.push({
                title: `${item.platform} (Post ${idx + 1})`,
                isSubheading: true,
              });
              Object.entries(item).forEach(([k, v]) => {
                if (k !== 'platform' && v) {
                  sections.push({
                    content: String(v).trim(),
                  });
                }
              });
            }
            // Generic object
            else {
              const content = Object.entries(item)
                .map(([k, v]) => {
                  const val = String(v).trim();
                  return val ? `${formatKeyName(k)}: ${val}` : '';
                })
                .filter(s => s.length > 0)
                .join('\n');

              if (content.length > 5) {
                sections.push({
                  content: `${idx + 1}. ${content}`,
                });
              }
            }
          }
        });
      }
      // Nested object
      else if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          if (!subKey || !subValue) return;

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
            const validItems = subValue
              .filter(v => typeof v === 'string' && v.trim().length > 0)
              .slice(0, 20);

            if (validItems.length > 0) {
              sections.push({
                title: subKeyName,
                isSubheading: true,
              });
              validItems.forEach((item, i) => {
                sections.push({
                  content: `${i + 1}. ${item.trim()}`,
                });
              });
            }
          }
        });
      }

      // Add spacing
      sections.push({ content: '' });
    });

    // Remove consecutive empty sections
    const filtered: PDFSection[] = [];
    let lastEmpty = false;
    sections.forEach((s) => {
      if (!s.content && !s.title) {
        if (!lastEmpty) filtered.push(s);
        lastEmpty = true;
      } else {
        filtered.push(s);
        lastEmpty = false;
      }
    });

    if (filtered.length === 0) throw new Error('No content extracted');
    return { sections: filtered };
  } catch (error) {
    console.error('[PDF] JSON parse failed, using raw:', error);
    return {
      sections: [
        { title: 'Content', isHeading: true },
        { content: content.slice(0, 5000) },
      ],
    };
  }
}
