import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageBreak,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType,
  convertInchesToTwip,
  UnderlineType,
  VerticalAlign,
  Shading,
} from 'docx';
import { Readable } from 'stream';

export interface WordDocumentInput {
  productName: string;
  targetAudience: string;
  launchDate: string;
  tier: 'free' | 'standard' | 'pro';
  daysToLaunch: number;
  generatedContent?: string; // The AI-generated content
}

// Color schemes for different tiers
const COLORS = {
  free: { primary: '0D7F89', accent: 'E5F7FB' },
  standard: { primary: '0D7F89', accent: 'E5F7FB' },
  pro: { primary: 'CC6600', accent: 'FFF3E5' },
};

export async function generateWordDocument(input: WordDocumentInput): Promise<Buffer> {
  const color = COLORS[input.tier];
  const launchDate = new Date(input.launchDate);
  const today = new Date();
  const daysUntil = Math.ceil((launchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // Validate that launch date is in the future
  if (daysUntil <= 0) {
    throw new Error(
      `Invalid launch date: ${launchDate.toLocaleDateString()}. ` +
      `Launch date must be in the future. Days until launch: ${daysUntil}`
    );
  }

  // Parse the AI-generated content if available
  const contentSections = input.generatedContent
    ? (() => {
        console.log(`[WordGen] parseGeneratedContent called with ${input.generatedContent.length} chars`);
        const parsed = parseGeneratedContent(input.generatedContent);
        console.log(`[WordGen] parseGeneratedContent returned ${parsed.length} sections`);
        return parsed;
      })()
    : getDefaultContent(input.tier);

  const sections = [
    // Title Page
    ...createTitlePage(input, color, daysUntil),

    // Table of Contents (conceptual)
    new Paragraph({
      text: 'Table of Contents',
      heading: HeadingLevel.HEADING_1,
      thematicBreak: false,
      spacing: { line: 360, after: 240 },
    }),
    new Paragraph({
      text: 'Overview • Timeline • Key Actions • Success Metrics',
      spacing: { after: 480 },
    }),

    new PageBreak(),

    // Overview Section
    ...createOverviewSection(input, color, daysUntil),

    new PageBreak(),

    // Content Sections
    ...createContentSections(contentSections, color),

    new PageBreak(),

    // Summary & Next Steps
    ...createSummarySection(input, color, daysUntil),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        children: sections as any,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return buffer;
}

function createTitlePage(input: WordDocumentInput, color: any, daysUntil: number): Paragraph[] {
  const tierLabels: Record<string, string> = {
    free: 'Free Plan',
    standard: 'Standard Plan',
    pro: 'Pro+ Plan',
  };

  const launchDate = new Date(input.launchDate);

  return [
    new Paragraph({
      text: '',
      spacing: { after: 600 },
    }),
    new Paragraph({
      text: '',
      spacing: { after: 600 },
    }),
    new Paragraph({
      text: `${input.productName}`,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      run: {
        font: 'Calibri',
        size: 56,
        bold: true,
        color: color.primary,
      },
    }),
    new Paragraph({
      text: '30-Day Launch Playbook',
      heading: HeadingLevel.HEADING_2,
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      run: {
        font: 'Calibri',
        size: 28,
      },
    }),
    new Paragraph({
      text: `${tierLabels[input.tier]}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 480 },
      run: {
        font: 'Calibri',
        size: 16,
        color: color.primary,
      },
    }),
    new Paragraph({
      text: '',
      spacing: { after: 300 },
    }),
    new Paragraph({
      text: `Target Audience: ${input.targetAudience}`,
      spacing: { after: 120 },
      run: { font: 'Calibri', size: 11 },
    }),
    new Paragraph({
      text: `Launch Date: ${launchDate.toLocaleDateString()}`,
      spacing: { after: 120 },
      run: { font: 'Calibri', size: 11 },
    }),
    new Paragraph({
      text: `Timeline: ${daysUntil} days until launch`,
      spacing: { after: 120 },
      run: { font: 'Calibri', size: 11, bold: true, color: color.primary },
    }),
    new Paragraph({
      text: `(${Math.ceil(daysUntil / 7)} weeks, ${daysUntil % 7} days)`,
      spacing: { after: 480 },
      run: { font: 'Calibri', size: 10, italics: true },
    }),
    new Paragraph({
      text: `Generated: ${new Date().toLocaleDateString()}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      run: { font: 'Calibri', size: 10, italics: true },
    }),
  ];
}

function createOverviewSection(input: WordDocumentInput, color: any, daysUntil: number): Paragraph[] {
  const tierDescriptions: Record<string, string> = {
    free: 'This free playbook provides essential guidance for launching your product with core strategies and timelines.',
    standard: 'This comprehensive playbook includes personalized timelines, email templates, social media content, and detailed launch strategies.',
    pro: 'This complete playbook includes everything: detailed timelines, email sequences, social media strategy, Product Hunt tactics, and advanced launch techniques.',
  };

  return [
    new Paragraph({
      text: 'Overview',
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 240 },
      run: { size: 28, bold: true, color: color.primary },
    }),
    new Paragraph({
      text: `Product: ${input.productName}`,
      spacing: { after: 120 },
    }),
    new Paragraph({
      text: `Target Audience: ${input.targetAudience}`,
      spacing: { after: 120 },
    }),
    new Paragraph({
      text: `Launch Window: ${daysUntil} days remaining`,
      spacing: { after: 240 },
    }),
    new Paragraph({
      text: tierDescriptions[input.tier],
      spacing: { after: 240 },
      run: { italics: true },
    }),
    new Paragraph({
      text: 'Key Success Factors:',
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 120 },
    }),
    new Paragraph({
      text: '✓ Clear messaging and value proposition',
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: '✓ Consistent communication across channels',
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: '✓ Targeted outreach to core audience',
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: '✓ Momentum building towards launch date',
      spacing: { after: 240 },
    }),
  ];
}

function createContentSections(sections: ContentSection[], color: any): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  sections.forEach((section, index) => {
    if (index > 0) {
      paragraphs.push(new PageBreak() as any);
    }

    // Section heading
    paragraphs.push(
      new Paragraph({
        text: section.title,
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 240, before: 0 },
        run: { size: 28, bold: true, color: color.primary },
        border: {
          bottom: {
            color: color.primary,
            space: 1,
            style: BorderStyle.SINGLE,
            size: 24,
          },
        },
      })
    );

    // Section description
    if (section.description) {
      paragraphs.push(
        new Paragraph({
          text: section.description,
          spacing: { after: 280 },
          run: { italics: true, size: 11, color: '666666' },
        })
      );
    }

    // Handle different section types
    if (section.title === 'Email Templates') {
      paragraphs.push(...formatEmailTemplates(section, color));
    } else if (section.title === 'Twitter/X Posts') {
      paragraphs.push(...formatTwitterPosts(section, color));
    } else if (section.title === 'LinkedIn Posts') {
      paragraphs.push(...formatLinkedInPosts(section, color));
    } else if (section.title === 'Launch Timeline') {
      paragraphs.push(...formatTimeline(section, color));
    } else if (section.title === 'Success Metrics') {
      paragraphs.push(...formatMetrics(section, color));
    } else if (section.title === 'Content Calendar') {
      paragraphs.push(...formatContentCalendar(section, color));
    } else {
      // Generic format for other sections
      section.subsections?.forEach((subsection) => {
        paragraphs.push(
          new Paragraph({
            text: subsection.title,
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 120 },
            run: { bold: true, size: 12 },
          })
        );

        if (subsection.content) {
          // Use markdown parser for content
          const contentParagraphs = parseMarkdownText(subsection.content);
          contentParagraphs.forEach(para => {
            paragraphs.push(para);
          });
          paragraphs.push(new Paragraph({ text: '', spacing: { after: 100 } }));
        }

        if (subsection.items && subsection.items.length > 0) {
          subsection.items.forEach((item) => {
            paragraphs.push(
              new Paragraph({
                text: item,
                spacing: { after: 80 },
                bullet: { level: 0 },
              })
            );
          });
        }
      });
    }
  });

  return paragraphs;
}

function formatEmailTemplates(section: ContentSection, color: any): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  section.subsections?.forEach((subsection, index) => {
    if (index > 0) {
      paragraphs.push(new Paragraph({ text: '', spacing: { after: 200 } }));
    }

    // Email subject as a styled heading with icon
    paragraphs.push(
      new Paragraph({
        text: `✉ ${subsection.title}`,
        heading: HeadingLevel.HEADING_3,
        spacing: { after: 80, before: 0 },
        run: { bold: true, size: 14, color: color.primary },
      })
    );

    // Email body in a styled box - parse paragraphs with markdown support
    if (subsection.content) {
      // Replace escaped newlines with actual newlines
      const content = subsection.content.replace(/\\n\\n/g, '\n\n').replace(/\\n/g, '\n');
      
      // Parse markdown text to get formatted paragraphs
      const emailBodyParagraphs = parseMarkdownText(content);

      // Wrap email body in a table for styling
      const emailTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 100, type: WidthType.PERCENTAGE },
                shading: { fill: 'F9F9F9' },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 12, color: color.primary },
                  bottom: { style: BorderStyle.SINGLE, size: 6, color: 'D0D0D0' },
                  left: { style: BorderStyle.SINGLE, size: 6, color: 'D0D0D0' },
                  right: { style: BorderStyle.SINGLE, size: 6, color: 'D0D0D0' },
                },
                children: emailBodyParagraphs as any,
                margins: { top: 200, bottom: 200, left: 240, right: 240 },
              }),
            ],
          }),
        ],
      });

      paragraphs.push(emailTable as any);
      paragraphs.push(new Paragraph({ text: '', spacing: { after: 120 } }));
    }
  });

  return paragraphs;
}

function formatTwitterPosts(section: ContentSection, color: any): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  const tweets = section.subsections?.[0]?.items || [];
  const tweetsPerPage = 4;

  paragraphs.push(
    new Paragraph({
      text: `Total tweets: ${tweets.length}`,
      spacing: { after: 200 },
      run: { italics: true, size: 10, color: '666666' },
    })
  );

  tweets.forEach((tweet, index) => {
    if (index > 0 && index % tweetsPerPage === 0) {
      paragraphs.push(new PageBreak() as any);
    }

    // Tweet box with Twitter-like styling - improved
    const tweetTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 100, type: WidthType.PERCENTAGE },
              shading: { fill: '1DA1F2' },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 0, color: '1DA1F2' },
                bottom: { style: BorderStyle.SINGLE, size: 0, color: '1DA1F2' },
                left: { style: BorderStyle.SINGLE, size: 0, color: '1DA1F2' },
                right: { style: BorderStyle.SINGLE, size: 0, color: '1DA1F2' },
              },
              children: [
                new Paragraph({
                  text: `Post ${index + 1}`,
                  spacing: { after: 60, before: 0 },
                  run: { size: 9, color: 'FFFFFF', bold: true },
                }),
              ],
              margins: { top: 100, bottom: 0, left: 160, right: 160 },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              width: { size: 100, type: WidthType.PERCENTAGE },
              shading: { fill: 'FFFFFF' },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 6, color: 'E1E8ED' },
                bottom: { style: BorderStyle.SINGLE, size: 6, color: 'E1E8ED' },
                left: { style: BorderStyle.SINGLE, size: 6, color: 'E1E8ED' },
                right: { style: BorderStyle.SINGLE, size: 6, color: 'E1E8ED' },
              },
              children: [
                new Paragraph({
                  text: tweet,
                  spacing: { after: 0, before: 120, line: 340 },
                  indent: { left: 160, right: 160 },
                  run: { size: 11, color: '0F1419' },
                }),
              ],
              verticalAlign: VerticalAlign.CENTER,
              margins: { top: 160, bottom: 160, left: 160, right: 160 },
            }),
          ],
        }),
      ],
    });

    paragraphs.push(tweetTable as any);
    paragraphs.push(new Paragraph({ text: '', spacing: { after: 140 } }));
  });

  return paragraphs;
}

function formatLinkedInPosts(section: ContentSection, color: any): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  const posts = section.subsections?.[0]?.items || [];

  posts.forEach((post, index) => {
    if (index > 0) {
      paragraphs.push(new Paragraph({ text: '', spacing: { after: 200 } }));
    }

    // Parse paragraphs from post (separated by \n\n or \n)
    const content = post.replace(/\\n\\n/g, '\n\n').replace(/\\n/g, '\n');
    const postParagraphs = content.split('\n\n').filter(p => p.trim());

    // Create table with all paragraphs
    const tableChildren: Paragraph[] = [];
    
    postParagraphs.forEach((para, paraIndex) => {
      tableChildren.push(
        new Paragraph({
          text: para.replace(/\n/g, ' '),
          spacing: { 
            after: paraIndex === postParagraphs.length - 1 ? 0 : 140,
            before: paraIndex === 0 ? 0 : 0,
            line: 340
          },
          run: { size: 11, color: '1C1C1C' },
        })
      );
    });

    const postTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 100, type: WidthType.PERCENTAGE },
              shading: { fill: 'F5F5F5' },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 12, color: color.primary },
                bottom: { style: BorderStyle.SINGLE, size: 6, color: 'E0E0E0' },
                left: { style: BorderStyle.SINGLE, size: 6, color: 'E0E0E0' },
                right: { style: BorderStyle.SINGLE, size: 6, color: 'E0E0E0' },
              },
              children: tableChildren as any,
              margins: { top: 200, bottom: 200, left: 280, right: 280 },
            }),
          ],
        }),
      ],
    });

    paragraphs.push(postTable as any);
  });

  return paragraphs;
}

function formatTimeline(section: ContentSection, color: any): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  section.subsections?.forEach((subsection, index) => {
    if (index > 0 && index % 5 === 0) {
      paragraphs.push(new PageBreak() as any);
    }

    // Day header with colored background - NO heading style to avoid auto-formatting
    paragraphs.push(
      new Paragraph({
        text: subsection.title,
        spacing: { after: 140, before: 180, line: 400 },
        run: { bold: true, size: 28, color: 'FFFFFF', font: 'Calibri' },
        shading: { fill: color.primary },
        indent: { left: 280, right: 280 },
        alignment: AlignmentType.LEFT,
      })
    );

    // Tasks/items
    if (subsection.items && subsection.items.length > 0) {
      subsection.items.forEach((item) => {
        // Parse Morning/Afternoon/Evening/Metrics sections
        if (item.startsWith('Morning:') || item.startsWith('Afternoon:') || item.startsWith('Evening:') || item.startsWith('Metrics:')) {
          const [period, ...rest] = item.split(':');
          const content = rest.join(':').trim();

          paragraphs.push(
            new Paragraph({
              text: period,
              spacing: { after: 100, before: 120, line: 320 },
              run: { bold: true, size: 20, color: color.primary, font: 'Calibri' },
            })
          );

          // Split by bullet points and create sub-items
          const subItems = content.split('•').filter((s) => s.trim());
          subItems.forEach((subItem) => {
            paragraphs.push(
              new Paragraph({
                text: subItem.trim(),
                spacing: { after: 80 },
                indent: { left: 720 },
                bullet: { level: 1 },
              })
            );
          });
        }
      });
    }
  });

  return paragraphs;
}

function formatMetrics(section: ContentSection, color: any): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  section.subsections?.forEach((subsection) => {
    // Create a metrics table
    const metricsItems = subsection.items || [];
    const phases = ['Pre-Launch', 'Launch Day', 'Post-Launch'];

    phases.forEach((phase) => {
      const phaseMetrics = metricsItems.filter((item) => item.startsWith(phase));

      if (phaseMetrics.length > 0) {
        // Phase header
        paragraphs.push(
          new Paragraph({
            text: phase,
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 120, before: 160 },
            run: { bold: true, size: 13, color: color.primary },
          })
        );

        // Parse metrics
        const metrics = phaseMetrics[0]
          .substring(phase.length + 2)
          .split('•')
          .filter((m) => m.trim());

        metrics.forEach((metric) => {
          paragraphs.push(
            new Paragraph({
              text: metric.trim(),
              spacing: { after: 100 },
              indent: { left: 360 },
              bullet: { level: 0 },
              run: { size: 11 },
            })
          );
        });
      }
    });
  });

  return paragraphs;
}

function formatContentCalendar(section: ContentSection, color: any): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  const ideas = section.subsections?.[0]?.items || [];

  // Create a nice grid-like format
  ideas.forEach((idea, index) => {
    const isEven = index % 2 === 0;

    paragraphs.push(
      new Paragraph({
        text: `${index + 1}. ${idea}`,
        spacing: { after: 120, before: isEven ? 0 : 0 },
        indent: { left: 360 },
        run: { size: 11 },
        border: !isEven
          ? { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'E0E0E0' } }
          : undefined,
      })
    );
  });

  return paragraphs;
}

function createSummarySection(input: WordDocumentInput, color: any, daysUntil: number): Paragraph[] {
  return [
    new Paragraph({
      text: 'Action Plan & Next Steps',
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 240 },
      run: { size: 28, bold: true, color: color.primary },
    }),
    new Paragraph({
      text: 'Immediate Actions (This Week)',
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 120 },
    }),
    new Paragraph({
      text: 'Review this playbook and identify 3-5 key actions',
      bullet: { level: 0 },
      spacing: { after: 80 },
    }),
    new Paragraph({
      text: 'Set up communication channels and templates',
      bullet: { level: 0 },
      spacing: { after: 80 },
    }),
    new Paragraph({
      text: 'Begin audience research and outreach',
      bullet: { level: 0 },
      spacing: { after: 240 },
    }),
    new Paragraph({
      text: 'Timeline Overview',
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 120 },
    }),
    new Paragraph({
      text: `Launch Date: ${new Date(input.launchDate).toLocaleDateString()}`,
      spacing: { after: 80 },
      run: { bold: true, size: 12 },
    }),
    new Paragraph({
      text: `Time Remaining: ${daysUntil} days (${Math.ceil(daysUntil / 7)} weeks)`,
      spacing: { after: 120 },
      run: { size: 12, color: color.primary, bold: true },
    }),
    new Paragraph({
      text: 'This playbook provides day-by-day guidance and actionable strategies to maximize your launch impact. Every day counts—use this timeline to stay on track.',
      spacing: { after: 240 },
    }),
    new Paragraph({
      text: 'Success Metrics',
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 120 },
    }),
    new Paragraph({
      text: 'Track these specific, measurable metrics throughout your launch:',
      spacing: { after: 120 },
    }),
    new Paragraph({
      text: 'Pre-Launch Metrics (Days 1-2)',
      heading: HeadingLevel.HEADING_3,
      spacing: { after: 100 },
      run: { bold: true },
    }),
    new Paragraph({
      text: 'Email waitlist signups: 50+ new subscribers',
      bullet: { level: 0 },
      spacing: { after: 80 },
    }),
    new Paragraph({
      text: 'Social media reach: 5K+ combined impressions from 10+ influencer shares',
      bullet: { level: 0 },
      spacing: { after: 80 },
    }),
    new Paragraph({
      text: 'Landing page click-through rate (CTR): 8%+ (test current vs. optimized version)',
      bullet: { level: 0 },
      spacing: { after: 80 },
    }),
    new Paragraph({
      text: 'Website traffic: 2K+ daily unique visitors by Day 2',
      bullet: { level: 0 },
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: 'Launch Day Metrics (Day of Launch)',
      heading: HeadingLevel.HEADING_3,
      spacing: { after: 100 },
      run: { bold: true },
    }),
    new Paragraph({
      text: 'Launch day signups: 100+ new users (realistic B2C/SaaS target)',
      bullet: { level: 0 },
      spacing: { after: 80 },
    }),
    new Paragraph({
      text: 'Email open rate: 25%+ (industry average: 20-30%)',
      bullet: { level: 0 },
      spacing: { after: 80 },
    }),
    new Paragraph({
      text: 'Email click rate: 3%+ (industry average: 2-5%)',
      bullet: { level: 0 },
      spacing: { after: 80 },
    }),
    new Paragraph({
      text: 'Social media posts: 10+ posts scheduled, 5+ retweets/shares per post',
      bullet: { level: 0 },
      spacing: { after: 80 },
    }),
    new Paragraph({
      text: 'Product review posts: 5+ from early adopters/beta testers',
      bullet: { level: 0 },
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: 'Post-Launch Metrics (Days 2-7)',
      heading: HeadingLevel.HEADING_3,
      spacing: { after: 100 },
      run: { bold: true },
    }),
    new Paragraph({
      text: 'Total signups by Day 7: 500+ (realistic cumulative for launch week)',
      bullet: { level: 0 },
      spacing: { after: 80 },
    }),
    new Paragraph({
      text: 'Follow-up email sequence completion: 40%+ of recipients open Day 2 follow-up',
      bullet: { level: 0 },
      spacing: { after: 80 },
    }),
    new Paragraph({
      text: 'Social media engagement rate: 5%+ (likes, comments, shares relative to impressions)',
      bullet: { level: 0 },
      spacing: { after: 80 },
    }),
    new Paragraph({
      text: 'Website bounce rate: Below 50% (target: 40-45%)',
      bullet: { level: 0 },
      spacing: { after: 80 },
    }),
    new Paragraph({
      text: 'Free trial conversion: 15%+ of signups activate trial (standard SaaS metric)',
      bullet: { level: 0 },
      spacing: { after: 240 },
    }),
  ];
}

interface ContentSection {
  title: string;
  description?: string;
  subsections?: {
    title: string;
    content?: string;
    items?: string[];
  }[];
}

// Convert markdown text to plain text with formatting info
function parseMarkdownText(text: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  
  // First, unescape escaped asterisks and other characters
  let cleanText = text.replace(/\\\*/g, '*').replace(/\\\-/g, '-');
  
  // Split by double newlines to get paragraphs
  const parts = cleanText.split(/\n\n+/).filter(p => p.trim());
  
  parts.forEach((part) => {
    const lines = part.split('\n');
    
    lines.forEach((line) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (!trimmedLine) return;
      
      // Handle bullet points (- or •)
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
        // Extract text and bold parts
        const bulletText = trimmedLine.substring(2);
        
        // Handle both **text** and *text* bold formats
        const runs = parseBoldText(bulletText);
        
        paragraphs.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 80 },
            children: runs.length > 0 ? (runs as any) : [new TextRun(bulletText)],
          })
        );
      } else {
        // Regular paragraph - handle inline bold
        const runs = parseBoldText(trimmedLine);
        
        if (runs.length > 0) {
          paragraphs.push(
            new Paragraph({
              spacing: { after: 100, line: 320 },
              children: runs as any,
            })
          );
        } else {
          paragraphs.push(
            new Paragraph({
              text: trimmedLine,
              spacing: { after: 100, line: 320 },
            })
          );
        }
      }
    });
  });
  
  return paragraphs;
}

// Helper function to parse bold text in various formats (**text** or *text*)
function parseBoldText(text: string): TextRun[] {
  const runs: TextRun[] = [];
  
  // Step 1: Replace **text** with markers (double asterisks first - highest priority)
  let processed = text.replace(/\*\*([^*]*?)\*\*/g, '{BOLD}$1{/BOLD}');
  
  // Step 2: Replace remaining *text* with markers (single asterisks)
  // Only match single asterisks that are not already part of bold markers
  // Pattern: * followed by anything except { or *, followed by *
  processed = processed.replace(/\*([^\*{][^*{]*?)\*/g, '{BOLD}$1{/BOLD}');
  
  // Split by bold markers
  const parts = processed.split(/(\{BOLD\}|\{\/BOLD\})/);
  let isBold = false;
  
  for (const part of parts) {
    if (part === '{BOLD}') {
      isBold = true;
    } else if (part === '{/BOLD}') {
      isBold = false;
    } else if (part.length > 0) {
      runs.push(
        new TextRun({
          text: part,
          bold: isBold,
        })
      );
    }
  }
  
  // If no runs were created, return empty array to fall back to plain text
  return runs.length > 0 ? runs : [];
}

function parseGeneratedContent(content: string): ContentSection[] {
  // Try to parse as JSON first
  try {
    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const jsonStr = content.substring(jsonStart, jsonEnd + 1);
      console.log(`[Parser] Found JSON from index ${jsonStart} to ${jsonEnd}, length: ${jsonStr.length}`);
      const data = JSON.parse(jsonStr);
      console.log(`[Parser] Successfully parsed JSON, calling parseJsonContent...`);
      const sections = parseJsonContent(data);
      if (sections.length > 0) {
        console.log(`[Parser] parseJsonContent returned ${sections.length} sections`);
        return sections;
      }
      console.log(`[Parser] parseJsonContent returned 0 sections, falling back to markdown`);
    }
  } catch (error) {
    console.warn('[Parser] Failed to parse JSON, error:', error instanceof Error ? error.message : String(error));
  }

  // Fallback to markdown parsing
  console.log('[Parser] Falling back to markdown parsing...');
  return parseMarkdownContent(content);
}

function stringifyComplexObject(obj: any, indent: number = 0): string {
  if (!obj) return '';
  
  if (typeof obj === 'string') return obj.trim();
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj);
  
  const prefix = '  '.repeat(indent);
  
  // Handle arrays
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '';
    
    const items = obj
      .map((item) => {
        if (!item) return ''; // Skip null/undefined items
        
        if (typeof item === 'string') {
          const trimmed = item.trim();
          return trimmed ? `• ${trimmed}` : '';
        }
        
        if (typeof item === 'object') {
          return stringifyComplexObject(item, indent + 1);
        }
        
        const str = String(item).trim();
        return str ? `• ${str}` : '';
      })
      .filter((line) => line) // Remove empty lines
      .join('\n');
    
    return items;
  }
  
  // Handle objects
  if (typeof obj === 'object') {
    const entries = Object.entries(obj)
      .map(([key, value]) => {
        if (!value && value !== 0 && value !== false) return ''; // Skip null/undefined/empty values
        
        const displayKey = key
          .charAt(0)
          .toUpperCase() + key
          .slice(1)
          .replace(/([A-Z])/g, ' $1')
          .trim();
        
        // Handle arrays
        if (Array.isArray(value)) {
          if (value.length === 0) return '';
          
          const items = value
            .filter((v) => v) // Filter out null/undefined
            .map((v) => {
              if (typeof v === 'string') {
                const trimmed = v.trim();
                return trimmed ? `${trimmed}` : '';
              }
              return stringifyComplexObject(v, indent + 1);
            })
            .filter((item) => item) // Remove empty strings
            .join('\n');
          
          if (!items.trim()) return '';
          return `${prefix}${displayKey}:\n${prefix}  ${items}`;
        }
        
        // Handle nested objects
        if (typeof value === 'object' && value !== null) {
          const nested = stringifyComplexObject(value, indent + 1);
          if (!nested.trim()) return '';
          return `${prefix}${displayKey}:\n${nested}`;
        }
        
        // Handle primitives
        const str = String(value).trim();
        if (!str) return '';
        return `${prefix}${displayKey}: ${str}`;
      })
      .filter((line) => line) // Remove empty lines
      .join('\n');
    
    return entries;
  }
  
  return String(obj);
}

function cleanContent(content: string): string {
  if (!content) return content;
  
  // Remove common footer text
  const textToRemove = [
    /---\s*\n\s*Good luck.*?(?=\n|$)/gi,
    /Good luck.*?success\./gi,
    /Remember:.*?(?=\n|$)/gi,
    /---\s*$/gm,
  ];
  
  let cleaned = content;
  textToRemove.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  
  // Remove multiple blank lines
  cleaned = cleaned.replace(/\n\n\n+/g, '\n\n');
  
  return cleaned.trim();
}

function parseJsonContent(data: any): ContentSection[] {
  const sections: ContentSection[] = [];

  // Detect tier based on data structure
  const isPro = !!(data.competitorAnalysis || data.budgetBreakdown || data.executiveSummary);
  const isStandard = !!(data.emailTemplates || data.twitterPosts || data.blogOutlines);

  console.log(`[Parser] Detected tier: ${isPro ? 'PRO+' : isStandard ? 'STANDARD' : 'UNKNOWN'}`);

  // ==================== EXECUTIVE SUMMARY (PRO+ only) ====================
  if (data.executiveSummary) {
    sections.push({
      title: 'Executive Summary',
      description: 'Personalized launch strategy overview',
      subsections: [
        {
          title: 'Overview',
          content: cleanContent(data.executiveSummary),
        },
      ],
    });
  }

  // ==================== COMPETITOR ANALYSIS (PRO+ only) ====================
  if (data.competitorAnalysis) {
    const comp = data.competitorAnalysis;
    let content = '';

    // Handle array of competitors
    if (Array.isArray(comp.competitors) && comp.competitors.length > 0) {
      content = `**Identified Competitors:**\n${comp.competitors.map((c: string) => `- ${c}`).join('\n')}\n\n`;
    }

    // Handle individual competitor objects (competitor1, competitor2, etc.)
    let competitorDetails = '';
    for (let i = 1; i <= 5; i++) {
      const compKey = `competitor${i}`;
      if (comp[compKey]) {
        const c = comp[compKey];
        competitorDetails += `**${c.name || 'Competitor'}**\n`;
        if (c.strengths) {
          competitorDetails += `Strengths:\n${Array.isArray(c.strengths) ? c.strengths.map((s: string) => `- ${s}`).join('\n') : c.strengths}\n\n`;
        }
        if (c.weaknesses) {
          competitorDetails += `Weaknesses:\n${Array.isArray(c.weaknesses) ? c.weaknesses.map((w: string) => `- ${w}`).join('\n') : c.weaknesses}\n\n`;
        }
        if (c.yourAdvantage) {
          competitorDetails += `Your Advantage: ${c.yourAdvantage}\n\n`;
        }
      }
    }

    if (comp.messagingFramework) {
      competitorDetails += `**Positioning Framework:**\n${comp.messagingFramework}`;
    }

    content += competitorDetails;

    if (content.trim()) {
      sections.push({
        title: 'Competitor Analysis',
        description: 'Market competition analysis and positioning',
        subsections: [
          {
            title: 'Market Positioning',
            content: cleanContent(content),
          },
        ],
      });
    }
  }

  // ==================== BUDGET BREAKDOWN (PRO+ only) ====================
  if (data.budgetBreakdown) {
    const budget = data.budgetBreakdown;
    const totalBudget = budget.totalBudget || budget.total || 'N/A';
    
    let budgetContent = `**Total Budget:** ${totalBudget}\n\n`;

    // Iterate through all budget categories
    for (const [key, value] of Object.entries(budget)) {
      if (key === 'totalBudget' || key === 'total') continue;
      if (!value) continue;

      if (typeof value === 'object') {
        const allocation = (value as any).allocation || (value as any).amount || '';
        const description = (value as any).description || (value as any).rationale || '';
        const tactics = (value as any).tactics || [];

        budgetContent += `**${key.replace(/([A-Z])/g, ' $1').trim()}:** ${allocation}\n`;
        if (description) {
          budgetContent += `${description}\n`;
        }
        if (Array.isArray(tactics) && tactics.length > 0) {
          budgetContent += tactics.map((t: string) => `- ${t}`).join('\n') + '\n';
        }
        budgetContent += '\n';
      }
    }

    if (budgetContent.trim()) {
      sections.push({
        title: 'Budget Breakdown',
        description: 'Recommended budget allocation with ROI projections',
        subsections: [
          {
            title: 'Budget Allocation',
            content: cleanContent(budgetContent),
          },
        ],
      });
    }
  }

  // ==================== EMAIL CONTENT ====================
  // PRO+: Email Sequences (personalized)
  if (data.emailSequences && Array.isArray(data.emailSequences) && data.emailSequences.length > 0) {
    sections.push({
      title: 'Email Sequences',
      description: `${data.emailSequences.length} personalized email campaigns`,
      subsections: data.emailSequences.slice(0, 15).map((email: any, index: number) => {
        const subject = email.subject || `Email ${index + 1}`;
        const body = email.body || email.content || '';
        return {
          title: subject,
          content: cleanContent(body),
          items: email.tone ? [`Tone: ${email.tone}`] : [],
        };
      }),
    });
  } 
  // STANDARD: Email Templates (copy-paste ready)
  else if (data.emailTemplates && Array.isArray(data.emailTemplates) && data.emailTemplates.length > 0) {
    sections.push({
      title: 'Email Templates',
      description: `${data.emailTemplates.length} ready-to-use email templates`,
      subsections: data.emailTemplates
        .filter((email: any) => email && email.body) // Filter out empty templates
        .map((email: any, index: number) => ({
          title: `Email ${index + 1}: ${email.subject || (email.type ? `${email.type} Email` : 'Template')}`,
          content: cleanContent(email.body),
          items: email.audience ? [`Audience: ${email.audience}`] : [],
        })),
    });
  }

  // ==================== TWITTER/X CONTENT ====================
  // PRO+: Twitter Strategy object
  if (data.twitterStrategy && typeof data.twitterStrategy === 'object' && Object.keys(data.twitterStrategy).length > 0) {
    const twitterContent = `**Voice & Tone:**\n${data.twitterStrategy.voiceAndTone || 'N/A'}\n\n**Posts:**\n`;
    
    const posts = data.twitterStrategy.posts || [];
    const postsList = Array.isArray(posts) 
      ? posts
          .filter((p: any) => p) // Filter out null/undefined
          .slice(0, 30)
          .map((p: any) => {
            if (typeof p === 'string') return p;
            if (p.day && p.content) return `Day ${p.day}: ${p.content}`;
            if (p.content) return p.content;
            return '';
          })
          .filter((p: string) => p) // Remove empty strings
          .join('\n')
      : '';

    if (postsList.trim()) {
      sections.push({
        title: 'Twitter/X Strategy',
        description: 'Optimized Twitter posting strategy and content',
        subsections: [
          {
            title: 'Strategy & Posts',
            content: cleanContent(twitterContent + postsList),
          },
        ],
      });
    }
  }
  // STANDARD: Twitter Posts array (simple strings)
  else if (data.twitterPosts && Array.isArray(data.twitterPosts) && data.twitterPosts.length > 0) {
    const filteredPosts = data.twitterPosts
      .filter((t: any) => t && (typeof t === 'string' ? t.trim() : String(t).trim())) // Filter out falsy values
      .slice(0, 30);
    
    if (filteredPosts.length > 0) {
      sections.push({
        title: 'Twitter/X Posts',
        description: `${filteredPosts.length} ready-to-post tweets`,
        subsections: [
          {
            title: 'Social Media Posts',
            items: filteredPosts.map((t: any) => typeof t === 'string' ? t : String(t)),
          },
        ],
      });
    }
  }

  // ==================== LINKEDIN CONTENT ====================
  // PRO+: LinkedIn Strategy object
  if (data.linkedinStrategy && typeof data.linkedinStrategy === 'object' && Object.keys(data.linkedinStrategy).length > 0) {
    const linkedinContent = `**Positioning:**\n${data.linkedinStrategy.positioning || 'N/A'}\n\n**Posts:**\n`;
    
    const posts = data.linkedinStrategy.posts || [];
    const postsList = Array.isArray(posts)
      ? posts
          .filter((p: any) => p) // Filter out null/undefined
          .slice(0, 15)
          .map((p: any) => {
            if (typeof p === 'string') return p;
            if (p.day && p.content) return `Day ${p.day}: ${p.content}`;
            if (p.content) return p.content;
            return '';
          })
          .filter((p: string) => p) // Remove empty strings
          .join('\n')
      : '';

    if (postsList.trim()) {
      sections.push({
        title: 'LinkedIn Strategy',
        description: 'Professional thought leadership content',
        subsections: [
          {
            title: 'Strategy & Content',
            content: cleanContent(linkedinContent + postsList),
          },
        ],
      });
    }
  }
  // STANDARD: LinkedIn Posts array (simple strings)
  else if (data.linkedinPosts && Array.isArray(data.linkedinPosts) && data.linkedinPosts.length > 0) {
    const filteredPosts = data.linkedinPosts
      .filter((p: any) => p && (typeof p === 'string' ? p.trim() : String(p).trim())) // Filter out falsy values
      .map(cleanContent)
      .slice(0, 10);
    
    if (filteredPosts.length > 0) {
      sections.push({
        title: 'LinkedIn Posts',
        description: `${filteredPosts.length} professional LinkedIn posts`,
        subsections: [
          {
            title: 'LinkedIn Content',
            items: filteredPosts,
          },
        ],
      });
    }
  }

  // ==================== BLOG OUTLINES (STANDARD tier) ====================
  if (data.blogOutlines && Array.isArray(data.blogOutlines) && data.blogOutlines.length > 0) {
    const filteredBlogs = data.blogOutlines
      .filter((blog: any) => blog && (blog.title || blog.outline || blog.content)) // Filter out empty blogs
      .slice(0, 10);
    
    if (filteredBlogs.length > 0) {
      sections.push({
        title: 'Blog Content Strategy',
        description: `${filteredBlogs.length} blog post outlines`,
        subsections: filteredBlogs.map((outline: any, index: number) => ({
          title: outline.title || `Blog Post ${index + 1}`,
          content: cleanContent(outline.outline || outline.content || stringifyComplexObject(outline)),
        })),
      });
    }
  }

  // ==================== CHANNEL-SPECIFIC TACTICS (PRO+ only) ====================
  if (data.channelSpecificTactics && typeof data.channelSpecificTactics === 'object' && Object.keys(data.channelSpecificTactics).length > 0) {
    const tacticsSubs: any[] = [];
    
    for (const [channel, tactics] of Object.entries(data.channelSpecificTactics)) {
      if (!tactics) continue;
      
      let tacticContent = '';
      
      // Handle if tactics is a string
      if (typeof tactics === 'string') {
        tacticContent = tactics;
      }
      // Handle if tactics is an object
      else if (typeof tactics === 'object') {
        tacticContent = stringifyComplexObject(tactics);
      }
      
      if (tacticContent.trim()) {
        tacticsSubs.push({
          title: `${channel.charAt(0).toUpperCase() + channel.slice(1)} Strategy`,
          content: cleanContent(tacticContent),
        });
      }
    }
    
    if (tacticsSubs.length > 0) {
      sections.push({
        title: 'Channel-Specific Tactics',
        description: 'Optimized strategies for each marketing channel',
        subsections: tacticsSubs,
      });
    }
  }

  // ==================== PRODUCT HUNT STRATEGY ====================
  if (data.productHuntStrategy && typeof data.productHuntStrategy === 'object' && Object.keys(data.productHuntStrategy).length > 0) {
    let phContent = '';
    
    if (typeof data.productHuntStrategy === 'string') {
      phContent = data.productHuntStrategy;
    } else {
      phContent = stringifyComplexObject(data.productHuntStrategy);
    }
    
    if (phContent.trim()) {
      sections.push({
        title: 'Product Hunt Strategy',
        description: 'Complete Product Hunt launch plan',
        subsections: [
          {
            title: 'Launch Strategy',
            content: cleanContent(phContent),
          },
        ],
      });
    }
  }
  // STANDARD: Product Hunt Template
  else if (data.productHuntTemplate && typeof data.productHuntTemplate === 'object' && Object.keys(data.productHuntTemplate).length > 0) {
    let phContent = stringifyComplexObject(data.productHuntTemplate);
    
    if (phContent.trim()) {
      sections.push({
        title: 'Product Hunt Strategy',
        description: 'Product Hunt launch template and checklist',
        subsections: [
          {
            title: 'Preparation & Execution',
            content: cleanContent(phContent),
          },
        ],
      });
    }
  }

  // ==================== INFLUENCER STRATEGY ====================
  if (data.influencerStrategy && typeof data.influencerStrategy === 'object' && Object.keys(data.influencerStrategy).length > 0) {
    let influencerContent = '';
    
    if (typeof data.influencerStrategy === 'string') {
      influencerContent = data.influencerStrategy;
    } else {
      influencerContent = stringifyComplexObject(data.influencerStrategy);
    }
    
    if (influencerContent.trim()) {
      sections.push({
        title: 'Influencer Strategy',
        description: 'Multi-tier influencer outreach plan',
        subsections: [
          {
            title: 'Influencer Tiers',
            content: cleanContent(influencerContent),
          },
        ],
      });
    }
  }
  // STANDARD: Influencers array or template
  else if (data.influencers && Array.isArray(data.influencers) && data.influencers.length > 0) {
    const influencersContent = data.influencers
      .filter((inf: any) => inf) // Filter out null/undefined
      .map((inf: any, idx: number) => {
        if (typeof inf === 'string') return `${idx + 1}. ${inf}`;
        return stringifyComplexObject(inf);
      })
      .join('\n\n');
    
    if (influencersContent.trim()) {
      sections.push({
        title: 'Influencer Outreach',
        description: 'Target influencers and outreach strategy',
        subsections: [
          {
            title: 'Outreach Templates',
            content: cleanContent(influencersContent),
          },
        ],
      });
    }
  }

  // ==================== PRESS RELEASE (STANDARD tier) ====================
  if (data.pressReleaseTemplate && data.pressReleaseTemplate) {
    const pressContent = typeof data.pressReleaseTemplate === 'string' 
      ? data.pressReleaseTemplate 
      : stringifyComplexObject(data.pressReleaseTemplate);
    
    if (pressContent.trim()) {
      sections.push({
        title: 'Press Release',
        description: 'Ready-to-send press release template',
        subsections: [
          {
            title: 'Press Release Template',
            content: cleanContent(pressContent),
          },
        ],
      });
    }
  }

  // ==================== TIMELINE ====================
  if (data.timeline && Array.isArray(data.timeline) && data.timeline.length > 0) {
    const filteredTimeline = data.timeline.filter((day: any) => day && (day.day || day.dayNumber || day.actions)); // Filter out empty days
    
    if (filteredTimeline.length > 0) {
      const timelineContent = filteredTimeline
        .map((day: any) => {
          const dayNum = day.day || day.dayNumber || '';
          const phase = day.phase || day.title || 'Action Items';
          const actions = day.actions || [];
          
          let actionsList = '';
          if (Array.isArray(actions)) {
            actionsList = actions
              .filter((a: any) => a && (typeof a === 'string' ? a.trim() : String(a).trim())) // Filter out empty actions
              .map((a: any) => `- ${typeof a === 'string' ? a : String(a)}`)
              .join('\n');
          } else if (typeof actions === 'string') {
            actionsList = actions;
          } else if (typeof actions === 'object') {
            actionsList = stringifyComplexObject(actions);
          }

          return `**Day ${dayNum}: ${phase}**\n${actionsList}`;
        })
        .filter((line: string) => line && line.trim()) // Remove empty days
        .join('\n\n');

      if (timelineContent.trim()) {
        sections.push({
          title: 'Launch Timeline',
          description: 'Day-by-day action plan (30 days)',
          subsections: [
            {
              title: 'Action Plan & Next Steps',
              content: cleanContent(timelineContent),
            },
          ],
        });
      }
    }
  }

  // ==================== SUCCESS METRICS ====================
  if (data.successMetrics && typeof data.successMetrics === 'object' && Object.keys(data.successMetrics).length > 0) {
    let metricsContent = '';
    
    if (typeof data.successMetrics === 'string') {
      metricsContent = data.successMetrics;
    } else {
      metricsContent = stringifyComplexObject(data.successMetrics);
    }
    
    if (metricsContent.trim()) {
      sections.push({
        title: 'Success Metrics',
        description: 'Key performance indicators to track',
        subsections: [
          {
            title: 'Performance Tracking',
            content: cleanContent(metricsContent),
          },
        ],
      });
    }
  }

  // ==================== FALLBACK: Return sections or empty ====================
  console.log(`[Parser] Total sections generated: ${sections.length}`);
  return sections.length > 0 ? sections : [];
}

function parseMarkdownContent(content: string): ContentSection[] {
  // Parse the AI-generated content into structured sections
  // This is a basic parser; you can enhance it based on your AI output format
  const sections: ContentSection[] = [];

  // Split by common section markers
  const parts = content.split(/(?:^|\n)#{1,2}\s+/);

  parts.forEach((part) => {
    if (!part.trim()) return;

    const lines = part.split('\n');
    const title = lines[0]?.trim() || 'Section';
    const restContent = lines.slice(1).join('\n').trim();

    sections.push({
      title,
      description: restContent.slice(0, 200), // First 200 chars as description
      subsections: parseSubsections(restContent),
    });
  });

  return sections.length > 0 ? sections : getDefaultContent('standard');
}

function parseSubsections(content: string): ContentSection['subsections'] {
  const subsections = [];
  const lines = content.split('\n').filter((line) => line.trim());

  let currentSubsection: any = null;

  lines.forEach((line) => {
    if (line.startsWith('-') || line.startsWith('•')) {
      // Bullet point
      if (currentSubsection) {
        currentSubsection.items.push(line.replace(/^[-•]\s*/, ''));
      }
    } else if (line.startsWith('###')) {
      // Subsection title
      if (currentSubsection) {
        subsections.push(currentSubsection);
      }
      currentSubsection = {
        title: line.replace(/^#+\s*/, ''),
        items: [],
      };
    }
  });

  if (currentSubsection) {
    subsections.push(currentSubsection);
  }

  return subsections.filter((s) => s.items.length > 0);
}

function getDefaultContent(tier: string): ContentSection[] {
  const commonSections: ContentSection[] = [
    {
      title: 'Pre-Launch Strategy',
      description: 'Build momentum before your official launch date',
      subsections: [
        {
          title: 'Build Your Warm Email List',
          items: [
            'Export contacts from Gmail, LinkedIn, Twitter',
            'Create a spreadsheet with names and emails',
            'Aim for 50-200 warm contacts',
            'Segment by interest and role',
          ],
        },
        {
          title: 'Set Up Communication Channels',
          items: [
            'Create email sequences',
            'Set up social media templates',
            'Plan content calendar',
            'Prepare customer testimonials',
          ],
        },
      ],
    },
    {
      title: 'Launch Week Strategy',
      description: 'Maximize impact during your launch window',
      subsections: [
        {
          title: 'Day 1-2: Announcement',
          items: [
            'Send launch email to warm list',
            'Post across all social channels',
            'Reach out to key influencers',
            'Update website and landing page',
          ],
        },
        {
          title: 'Day 3-5: Momentum Building',
          items: [
            'Share customer stories',
            'Host live Q&A sessions',
            'Send follow-up emails',
            'Engage with comments and questions',
          ],
        },
        {
          title: 'Day 6-7: Final Push',
          items: [
            'Share launch metrics and success',
            'Thank early supporters',
            'Plan post-launch communication',
            'Document lessons learned',
          ],
        },
      ],
    },
  ];

  if (tier === 'free') {
    return commonSections;
  }

  if (tier === 'standard') {
    return [
      ...commonSections,
      {
        title: 'Email Templates & Sequences',
        subsections: [
          {
            title: 'Initial Outreach Email',
            content: 'Use this template for your first contact with the warm list.',
          },
          {
            title: 'Follow-Up Sequence',
            content: 'A 3-email sequence to maintain engagement after initial contact.',
          },
        ],
      },
      {
        title: 'Social Media Content',
        subsections: [
          {
            title: 'Twitter/X Strategy',
            items: ['Daily launch updates', 'User testimonials', 'Behind-the-scenes content'],
          },
          {
            title: 'LinkedIn Strategy',
            items: ['Professional launch announcement', 'Founder story', 'Impact metrics'],
          },
        ],
      },
    ];
  }

  // Pro tier
  return [
    ...commonSections,
    {
      title: 'Comprehensive Email Strategy',
      subsections: [
        {
          title: 'Full Email Sequence (5+ emails)',
          content: 'Complete email funnel from awareness to purchase',
        },
        {
          title: 'Segmentation Strategy',
          content: 'Personalized messages for different audience segments',
        },
      ],
    },
    {
      title: 'Multi-Channel Social Strategy',
      subsections: [
        {
          title: 'Twitter/X Master Plan',
          items: ['Daily content calendar', 'Engagement tactics', 'Influencer partnerships'],
        },
        {
          title: 'LinkedIn Professional Network',
          items: ['B2B outreach strategy', 'Thought leadership content', 'Partnership opportunities'],
        },
        {
          title: 'Other Channels',
          items: ['Facebook/Instagram strategy', 'TikTok if applicable', 'Community platforms'],
        },
      ],
    },
    {
      title: 'Product Hunt Strategy',
      subsections: [
        {
          title: 'Preparation Phase',
          items: ['Perfect your product page', 'Gather early supporters', 'Prepare launch message'],
        },
        {
          title: 'Launch Day Tactics',
          items: ['Respond to all comments', 'Share maker stories', 'Optimize product updates'],
        },
        {
          title: 'Post-Launch',
          items: ['Analyze feedback', 'Implement quick improvements', 'Thank supporters'],
        },
      ],
    },
    {
      title: 'Advanced Analytics & Tracking',
      subsections: [
        {
          title: 'Key Metrics to Monitor',
          content: 'Track ROI, engagement, and conversion metrics across all channels',
        },
      ],
    },
  ];
}
