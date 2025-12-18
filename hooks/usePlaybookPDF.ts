/**
 * Client-side hook for PDF generation
 * Communicates with /api/generate-pdf endpoint
 */

import { useState } from 'react';

export interface PlaybookInput {
  productName: string;
  targetAudience: string;
  launchDate: string;
  tier: 'free' | 'standard' | 'pro';
  daysToLaunch: number;
}

interface UsePlaybookPDFReturn {
  isGenerating: boolean;
  error: string | null;
  generatePDF: (input: PlaybookInput) => Promise<void>;
}

export function usePlaybookPDF(): UsePlaybookPDFReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePDF = async (input: PlaybookInput): Promise<void> => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PDF');
      }

      // Get blob from response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${input.productName}-${input.tier}-playbook.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return { isGenerating, error, generatePDF };
}
