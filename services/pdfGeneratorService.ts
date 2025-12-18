import { jsPDF, TextOptionsLight } from 'jspdf';

/**
 * LAUNCHLOOM PDF GENERATOR - PROFESSIONAL TIER-SPECIFIC PDFs
 * 
 * Free:  6-8 pages  (static jsPDF)
 * Standard: 14-18 pages (Gemini HTML via html2pdf.js)
 * Pro:  25-30 pages (Gemini HTML + Call notes + Press list)
 */

// Color utilities
interface RGB { r: number; g: number; b: number; }

const setTextColor = (doc: jsPDF, color: RGB) => {
  doc.setTextColor(color.r, color.g, color.b);
};

const setDrawColor = (doc: jsPDF, color: RGB) => {
  doc.setDrawColor(color.r, color.g, color.b);
};

// Color palette (WCAG AA)
const C = {
  teal: { r: 13, g: 127, b: 137 },
  orange: { r: 204, g: 102, b: 0 },
  dark: { r: 31, g: 41, b: 55 },
  green: { r: 16, g: 185, b: 129 },
  gray: { r: 150, g: 150, b: 150 }
};

/**
 * Generate Free Tier PDF (static teaser)
 * 6-8 pages: Cover + Quick Start (Days 1-5) + Phases overview
 */
export const generateFreePDF = (productName: string, launchDate: string): void => {
  const doc = new jsPDF();
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  const m = 15; // margin
  let y = m;
  let page = 1;

  const newPage = () => {
    doc.setFontSize(8);
    setTextColor(doc, C.gray);
    doc.text(`Page ${page}`, w - m - 10, h - 8);
    doc.addPage();
    y = m;
    page++;
  };

  const heading = (text: string) => {
    if (y > h - 35) newPage();
    doc.setFontSize(18);
    setTextColor(doc, C.teal);
    doc.setFont(undefined, 'bold');
    doc.text(text, m, y);
    y += 10;
  };

  const subheading = (text: string) => {
    if (y > h - 30) newPage();
    doc.setFontSize(12);
    setTextColor(doc, C.orange);
    doc.setFont(undefined, 'bold');
    doc.text(text, m, y);
    y += 6;
  };

  const body = (text: string, ind = 0) => {
    if (y > h - 15) newPage();
    doc.setFontSize(10);
    setTextColor(doc, C.dark);
    doc.setFont(undefined, 'normal');
    const lines = doc.splitTextToSize(text, w - m * 2 - ind);
    const textLines: string | string[] = lines;
    doc.text(textLines, m + ind, y);
    y += (Array.isArray(lines) ? lines.length : 1) * 4 + 1;
  };

  const sep = () => {
    if (y > h - 15) newPage();
    setDrawColor(doc, C.teal);
    doc.setLineWidth(0.3);
    doc.line(m, y, w - m, y);
    y += 4;
  };

  // PAGE 1: COVER
  heading('🚀 YOUR 30-DAY LAUNCH PLAYBOOK');
  y += 5;
  
  doc.setFontSize(10);
  setTextColor(doc, C.dark);
  doc.setFont(undefined, 'normal');
  
  const today = new Date();
  const launchObj = new Date(launchDate);
  const daysLeft = Math.ceil((launchObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  body(`Product: ${productName}`);
  body(`Launch Date: ${launchDate}`);
  body(`Days to Launch: ${daysLeft}`);
  body(`Tier: FREE`);
  body(`Generated: ${today.toLocaleDateString()}`);
  
  y += 8;
  sep();
  
  doc.setFontSize(11);
  setTextColor(doc, C.teal);
  doc.setFont(undefined, 'bold');
  doc.text('📌 THIS PLAYBOOK IS ACTIONABLE', m, y);
  y += 8;
  
  doc.setFontSize(10);
  setTextColor(doc, C.dark);
  doc.setFont(undefined, 'normal');
  const items = ['✓ Follow EXACTLY', '✓ No improvisation', '✓ Update daily', '✓ Celebrate progress'];
  items.forEach(item => {
    body(item, 2);
  });

  // PAGE 2: TABLE OF CONTENTS
  newPage();
  heading('📋 WHAT\'S INSIDE');
  y += 2;
  
  body('Section 1: Quick Start (Days 1-5)');
  body('The first 5 days determine your launch success.');
  y += 3;
  
  body('Section 2: Phases (Days 6-30)');
  body('Day-by-day tasks grouped by strategic goal.');
  y += 5;
  
  sep();
  subheading('🎯 KEY MILESTONES:');
  y += 2;
  
  const milestones = [
    'Day 5:  Warm email list ready (50+ contacts)',
    'Day 10: First feedback (5+ responses)',
    'Day 15: Social proof (testimonials)',
    'Day 20: Launch ready (all systems tested)',
    'Day 30: Results (revenue + followers)'
  ];
  
  milestones.forEach(milestone => {
    doc.setFontSize(9);
    setTextColor(doc, C.teal);
    doc.setFont(undefined, 'bold');
    doc.text(milestone, m + 2, y);
    y += 5;
  });

  // PAGE 3: QUICK START HEADER
  newPage();
  heading('⚡ QUICK START (MOST IMPORTANT)');
  body('The first 5 days separate failed from successful launches.');
  y += 3;
  doc.setFontSize(14);
  setTextColor(doc, C.teal);
  doc.setFont(undefined, 'bold');
  doc.text('🎯 GOAL: Foundation + Product Validation', m, y);
  y += 8;
  sep();

  // Days 1-2
  const dayTemplate = (
    dayNum: number,
    emoji: string,
    title: string,
    time: string,
    difficulty: string,
    why: string,
    steps: string[],
    checkpoint: string
  ) => {
    if (y > h - 40) newPage();
    
    doc.setFontSize(11);
    setTextColor(doc, C.orange);
    doc.setFont(undefined, 'bold');
    doc.text(`${emoji} DAY ${dayNum}: ${title}`, m, y);
    y += 5;
    
    doc.setFontSize(9);
    setTextColor(doc, C.dark);
    doc.setFont(undefined, 'normal');
    doc.text(`⏱️ ${time}  •  💪 ${difficulty}`, m, y);
    y += 4;
    doc.text(`❓ Why: ${why}`, m, y);
    y += 5;
    
    doc.setFont(undefined, 'bold');
    doc.text('✅ STEPS:', m, y);
    y += 4;
    
    doc.setFont(undefined, 'normal');
    steps.forEach((step, i) => {
      doc.text(`${i + 1}. ${step}`, m + 2, y);
      y += 4;
    });
    
    doc.setFont(undefined, 'bold');
    setTextColor(doc, C.green);
    doc.text('✓ CHECKPOINT:', m, y);
    y += 3;
    
    doc.setFont(undefined, 'normal');
    setTextColor(doc, C.dark);
    doc.text(checkpoint, m + 2, y);
    y += 5;
    
    sep();
  };

  dayTemplate(
    1,
    '🔴',
    'BUILD WARM EMAIL LIST',
    '30 min',
    'Easy',
    'Cold emails fail. Warm relationships convert.',
    [
      'Open LinkedIn/Twitter',
      'List 50 people who might use ' + productName,
      'Create spreadsheet: Name | Email | Pain Point',
      'Note specifically WHY each person needs this'
    ],
    'Do you have 50 people with documented pain points?'
  );

  dayTemplate(
    2,
    '🟠',
    'SEND WARM-UP MESSAGES',
    '60 min',
    'Easy',
    'Personal connection beats cold pitches.',
    [
      'Send personalized DM to 10 from your list',
      'Reference their work/recent post specifically',
      'Ask for feedback, never ask for money',
      'Track who replies'
    ],
    'Did 10 people get messages? Did 3+ reply?'
  );

  // PAGE 4: Days 3-5
  newPage();
  
  dayTemplate(
    3,
    '🟡',
    'CREATE LANDING PAGE (LIVE)',
    '2 hours',
    'Medium',
    'You need web presence TODAY.',
    [
      'Open Framer/Webflow/Carrd',
      'Use template (don\'t build from scratch)',
      'Add: headline + 3 benefits + email signup',
      'Deploy to domain'
    ],
    'Is domain live? Does email capture work?'
  );

  dayTemplate(
    4,
    '🟢',
    'WRITE FIRST 5 TWEETS',
    '60 min',
    'Easy',
    'Early tweets build social credibility.',
    [
      'Write 5 tweets about ' + productName,
      'Mix: problem awareness + solution',
      'Schedule for Days 4-8 (one per day)',
      'Set reminder to reply to every comment'
    ],
    'Are 5 tweets written and scheduled?'
  );

  dayTemplate(
    5,
    '🔵',
    'COLLECT FIRST FEEDBACK',
    '90 min',
    'Easy',
    'Early feedback guides your product.',
    [
      'Reply to EVERY person who messaged you',
      'Ask them 3 questions',
      'Schedule 15-min calls with 2-3 people',
      'Document themes'
    ],
    'Did you schedule 2-3 calls and find patterns?'
  );

  // PAGE 5: Success metrics
  newPage();
  heading('📊 QUICK START METRICS');
  y += 4;
  
  doc.setFontSize(10);
  setTextColor(doc, C.teal);
  doc.setFont(undefined, 'bold');
  doc.text('Day 5 Success Criteria:', m, y);
  y += 6;
  
  const checks = [
    '☐ Email list with 50+ names',
    '☐ 10 warm-up messages sent',
    '☐ Landing page live & working',
    '☐ 5 tweets scheduled',
    '☐ 2-3 calls booked'
  ];
  
  doc.setFontSize(9);
  checks.forEach(check => {
    doc.text(check, m, y);
    y += 5;
  });
  
  y += 5;
  doc.setFont(undefined, 'bold');
  setTextColor(doc, C.orange);
  doc.text('Status: ████████████████ 100% COMPLETE', m, y);
  y += 6;
  setTextColor(doc, C.teal);
  doc.text('👉 Next: Start Phase 1 (Days 6-12)', m, y);

  // PAGE 6-7: Phases overview
  newPage();
  heading('PHASE 1: VALIDATION (Days 6-12)');
  y += 3;
  
  setTextColor(doc, C.teal);
  doc.setFont(undefined, 'bold');
  doc.setFontSize(10);
  doc.text('🎯 Goal: Validate demand + Build content', m, y);
  y += 6;
  
  sep();
  
  const phases = [
    {
      title: 'TASK 1.1: Send to Warm List (Days 6-7)',
      desc: 'Email all 50 people early access link',
      metric: '📊 20+ test, 5+ feedback'
    },
    {
      title: 'TASK 1.2: Gather Feedback (Days 8-9)',
      desc: 'Analyze replies, update product',
      metric: '📊 Product improved, 3+ validated'
    },
    {
      title: 'TASK 1.3: Build Momentum (Days 10-12)',
      desc: 'Document wins, prepare Phase 2',
      metric: '📊 Ready for next phase'
    }
  ];
  
  phases.forEach(p => {
    doc.setFontSize(11);
    setTextColor(doc, C.orange);
    doc.setFont(undefined, 'bold');
    doc.text(p.title, m, y);
    y += 4;
    
    doc.setFontSize(9);
    setTextColor(doc, C.dark);
    doc.setFont(undefined, 'normal');
    doc.text('✅ ' + p.desc, m + 2, y);
    y += 4;
    
    doc.setFont(undefined, 'bold');
    setTextColor(doc, C.teal);
    doc.text(p.metric, m + 2, y);
    y += 5;
    
    sep();
  });

  // PHASE 2
  heading('PHASE 2: LAUNCH PREP (Days 13-20)');
  y += 3;
  
  doc.setFontSize(10);
  setTextColor(doc, C.teal);
  doc.setFont(undefined, 'bold');
  doc.text('🎯 Goal: Everything ready for Day 21', m, y);
  y += 6;
  
  sep();
  
  const phase2 = [
    { title: 'TASK 2.1: Test Everything (13-15)', desc: 'All systems working', metric: '✓ Tested' },
    { title: 'TASK 2.2: Write Announcements (16-18)', desc: 'Email + tweets + PH copy', metric: '✓ Ready' },
    { title: 'TASK 2.3: Final Prep (19-20)', desc: 'Schedule, reminder, supporters', metric: '✓ Set' }
  ];
  
  phase2.forEach(p => {
    if (y > h - 20) newPage();
    doc.setFontSize(11);
    setTextColor(doc, C.orange);
    doc.setFont(undefined, 'bold');
    doc.text(p.title, m, y);
    y += 4;
    doc.setFontSize(9);
    setTextColor(doc, C.dark);
    doc.setFont(undefined, 'normal');
    doc.text('✅ ' + p.desc, m + 2, y);
    y += 4;
    doc.setFont(undefined, 'bold');
    setTextColor(doc, C.teal);
    doc.text(p.metric, m + 2, y);
    y += 5;
  });

  // PHASE 3
  if (y > h - 40) newPage();
  heading('PHASE 3: LAUNCH & SCALE (Days 21-30)');
  y += 3;
  doc.setFontSize(10);
  setTextColor(doc, C.teal);
  doc.setFont(undefined, 'bold');
  doc.text('🎯 Goal: Maximum visibility + revenue', m, y);
  y += 6;
  
  sep();
  
  const phase3 = [
    { title: 'TASK 3.1: Launch Day (Day 21)', desc: 'Email + PH + Twitter + replies', metric: '100+ engaged, 10+ signups' },
    { title: 'TASK 3.2: Follow-up (Days 22-25)', desc: 'Email, testimonials, updates', metric: '3+ testimonials, 20+ signups' },
    { title: 'TASK 3.3: Optimize (Days 26-30)', desc: 'Analyze, scale, prepare next', metric: 'Revenue $200+, 50+ followers' }
  ];
  
  phase3.forEach(p => {
    if (y > h - 20) newPage();
    doc.setFontSize(11);
    setTextColor(doc, C.orange);
    doc.setFont(undefined, 'bold');
    doc.text(p.title, m, y);
    y += 4;
    doc.setFontSize(9);
    setTextColor(doc, C.dark);
    doc.setFont(undefined, 'normal');
    doc.text('✅ ' + p.desc, m + 2, y);
    y += 4;
    doc.setFont(undefined, 'bold');
    setTextColor(doc, C.teal);
    doc.text('📊 ' + p.metric, m + 2, y);
    y += 5;
  });

  // Final footer
  doc.setFontSize(8);
  setTextColor(doc, C.gray);
  doc.text(`Page ${page}`, w - m - 10, h - 8);

  // Download
  doc.save(`${productName}-launch-playbook-free.pdf`);
  console.log('[PDF] Free tier PDF generated successfully');
};

/**
 * Standard/Pro: Use Gemini HTML via html2pdf.js
 */
export const generateStandardPDF = (html: string, productName: string): void => {
  downloadHTMLAsPDF(html, `${productName}-launch-playbook-standard.pdf`);
};

export const generateProPDF = (html: string, productName: string): void => {
  downloadHTMLAsPDF(html, `${productName}-launch-playbook-pro.pdf`);
};

/**
 * Download HTML as PDF (fallback chain)
 */
const downloadHTMLAsPDF = (html: string, filename: string): void => {
  const html2pdf = (window as any).html2pdf;
  
  if (html2pdf) {
    console.log('[PDF] Using html2pdf.js');
    try {
      const element = document.createElement('div');
      element.innerHTML = html;
      
      html2pdf()
        .set({
          margin: 10,
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
        })
        .from(element)
        .save();
      
      console.log('[PDF] HTML to PDF successful');
    } catch (error) {
      console.error('[PDF] html2pdf failed:', error);
      printFallback(html);
    }
  } else {
    console.log('[PDF] html2pdf not available, using print fallback');
    printFallback(html);
  }
};

/**
 * Fallback: Print dialog
 */
const printFallback = (html: string): void => {
  const w = window.open('', '', 'height=600,width=800');
  if (w) {
    w.document.write(html);
    w.document.close();
    w.print();
  } else {
    downloadHTMLFallback(html);
  }
};

/**
 * Last resort: Download as HTML
 */
const downloadHTMLFallback = (html: string): void => {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'launch-playbook.html';
  a.click();
  URL.revokeObjectURL(url);
};

// Backward compatibility
export const downloadFreeChecklist = generateFreePDF;
