// This file has been deprecated. Use pdfGeneratorService.ts instead.
// The new service provides:
// - generateStandardPDF() for Standard tier
// - generateProPDF() for Pro+ tier  
// - downloadFreeChecklist() for Free tier

export {};
      yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.setTextColor(230, 126, 34); // Orange for Day
    doc.text(`Day ${item.day}: ${item.phase}`, margin, yPos);
    yPos += 7;
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(item.task, margin, yPos);
    yPos += 7;
    
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const descLines = splitText(doc, item.description, contentWidth);
    doc.text(descLines, margin, yPos);
    yPos += (descLines.length * 5) + 5;

    if (item.copy) {
        doc.setFontSize(10);
        doc.setTextColor(43, 156, 168); // Teal for copy
        const copyLines = splitText(doc, `Copy Idea: "${item.copy}"`, contentWidth);
        doc.text(copyLines, margin, yPos);
        yPos += (copyLines.length * 5) + 5;
    }
    
    yPos += 5; // Extra spacing between items
  });

  // Email Templates
  doc.addPage();
  yPos = 20;
  doc.setFontSize(20);
  doc.setTextColor(43, 156, 168);
  doc.text("Email Templates", margin, yPos);
  yPos += 15;

  data.emailTemplates.forEach(email => {
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(email.name, margin, yPos);
    yPos += 8;
    
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(`Subject: ${email.subject}`, margin, yPos);
    yPos += 8;
    
    const bodyLines = splitText(doc, email.body, contentWidth);
    doc.text(bodyLines, margin, yPos);
    yPos += (bodyLines.length * 5) + 15;
  });

  // Tweets
  doc.addPage();
  yPos = 20;
  doc.setFontSize(20);
  doc.setTextColor(43, 156, 168);
  doc.text("Tweet Strategy", margin, yPos);
  yPos += 15;

  data.tweetTemplates.forEach(group => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(14);
    doc.setTextColor(230, 126, 34);
    doc.text(group.phase, margin, yPos);
    yPos += 10;
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    group.tweets.forEach(tweet => {
        const tweetLines = splitText(doc, `• ${tweet}`, contentWidth);
        doc.text(tweetLines, margin, yPos);
        yPos += (tweetLines.length * 5) + 5;
    });
    yPos += 10;
  });

  // PH Playbook
  doc.addPage();
  yPos = 20;
  doc.setFontSize(20);
  doc.setTextColor(43, 156, 168);
  doc.text("Product Hunt Playbook", margin, yPos);
  yPos += 15;
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  data.productHuntPlaybook.forEach(tip => {
    const tipLines = splitText(doc, `• ${tip}`, contentWidth);
    doc.text(tipLines, margin, yPos);
    yPos += (tipLines.length * 6) + 4;
  });

  doc.save(`LaunchLoom-${data.product.replace(/\s+/g, '-')}.pdf`);
};

export const downloadGenericPDF = () => {
  // Simulating a static PDF download for Free Tier
  const doc = new jsPDF();
  doc.setFontSize(22);
  doc.text("LaunchLoom Generic 30-Day Checklist", 20, 30);
  doc.setFontSize(12);
  doc.text("Day 1-5: Prepare...", 20, 50);
  doc.text("Day 6-15: Build Content...", 20, 60);
  doc.text("This is the free generic version.", 20, 80);
  doc.save("LaunchLoom-Generic-Template.pdf");
};
