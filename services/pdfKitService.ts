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
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        bufferPages: true,
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
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
        const parsed = parseContentForPDF(content);
        let pageNum = 2;

        // Add sections
        parsed.sections.forEach((section, index) => {
          // Check if we need a page break
          if (doc.y > doc.page.height - 100) {
            doc.addPage();
            pageNum++;
            doc.fontSize(10).fillColor('#999999').text(`Page ${pageNum}`, { align: 'right' });
            doc.moveUp(0.5);
          }

          if (section.isHeading) {
            doc
              .fontSize(16)
              .font('Helvetica-Bold')
              .fillColor('#0066CC')
              .text(section.title, { underline: true })
              .moveDown(0.3)
              .fillColor('black')
              .font('Helvetica');
          } else if (section.isSubheading) {
            doc
              .fontSize(13)
              .font('Helvetica-Bold')
              .text(section.title)
              .moveDown(0.2)
              .font('Helvetica');
          } else {
            // Regular text
            doc.fontSize(11).text(section.content || '', { align: 'left', lineGap: 3 });
          }

          doc.moveDown(0.3);
        });
      } catch (parseError) {
        console.error('Error parsing content for PDF:', parseError);
        // If parsing fails, just add raw content
        doc.fontSize(11).text(content, { align: 'left', lineGap: 3 });
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
 * Parse AI-generated content into structured PDF sections
 */
function parseContentForPDF(content: string) {
  const sections: PDFSection[] = [];
  const lines = content.split('\n');

  let currentSection: PDFSection = {};

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) return;

    // Detect headings (lines with # or ALL CAPS or starting with numbers followed by .)
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
      // Bullet point or numbered item
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

  return { sections };
}
