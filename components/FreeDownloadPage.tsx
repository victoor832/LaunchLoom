import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FreeDownloadPage: React.FC = () => {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const downloadPDF = async () => {
      try {
        const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        // Northflank URL
        const northflankApiUrl = 'https://p01--launchloom--4zv2kh7sbk9r.code.run';
        const apiUrl = isDevelopment ? 'http://localhost:3000/api/generate-pdf' : `${northflankApiUrl}/api/generate-pdf`;
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productName: 'ColdMailAI',
            targetAudience: 'Sales Teams',
            launchDate: new Date().toISOString().split('T')[0],
            tier: 'free',
            daysToLaunch: 30
          })
        });

        if (!response.ok) throw new Error('Failed to download PDF');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'ColdMailAI-free-plan.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setDownloading(false);
        setTimeout(() => navigate('/'), 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to download PDF');
        setDownloading(false);
      }
    };

    downloadPDF();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-primary to-teal-hover flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 max-w-md w-full text-center">
        {downloading ? (
          <>
            <div className="mb-6">
              <div className="inline-block">
                <div className="w-12 h-12 border-4 border-teal-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Downloading Your Free Plan</h2>
            <p className="text-gray-600">Your PDF is being prepared. This should only take a few seconds...</p>
          </>
        ) : error ? (
          <>
            <div className="mb-6 text-red-500">
              <i className="fas fa-exclamation-circle text-4xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Download Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-teal-primary hover:bg-teal-hover text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </>
        ) : (
          <>
            <div className="mb-6 text-green-500">
              <i className="fas fa-check-circle text-4xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Download Complete!</h2>
            <p className="text-gray-600 mb-6">Your Free Plan PDF has been downloaded. Redirecting...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FreeDownloadPage;
