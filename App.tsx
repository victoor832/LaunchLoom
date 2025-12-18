import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Header';
import Footer from './components/Footer';
import ModalContainer from './components/ModalContainer';
import TierSelector from './components/TierSelector';
import FeatureComparison from './components/FeatureComparison';
import FAQSection from './components/FAQSection';
import TrustMetrics from './components/TrustMetrics';
import FinalCTA from './components/FinalCTA';
import PersonalizationForm from './components/PersonalizationForm';
import SuccessView from './components/SuccessView';
import FreeDownloadPage from './components/FreeDownloadPage';
import { ModalProvider } from './context/ModalContext';

// Landing Page Component
const LandingPage: React.FC = () => (
  <>
    {/* Hero Section */}
    <div id="hero" className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-neutral-text tracking-tight mb-6">
          Your 30-Day <span className="text-teal-primary">Launch Plan</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
          Choose the checklist that fits your launch scale. From hobby projects to full-scale agency deployments. Cancel anytime.
        </p>
          <button
            onClick={() => {
              document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-4 bg-teal-primary hover:bg-teal-hover text-white font-semibold rounded-lg transition-colors shadow-lg shadow-teal-500/30"
          >
            Get Started
          </button>
      </div>
    </div>

    {/* Trust Metrics */}
    <TrustMetrics />

    {/* Pricing Section */}
    <TierSelector />

    {/* Feature Comparison Table */}
    <FeatureComparison />

    {/* FAQ Section */}
    <FAQSection />

    {/* Final CTA */}
    <FinalCTA />
  </>
);

const App: React.FC = () => {
  return (
    <ModalProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen font-sans">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/form/:tierId" element={<PersonalizationForm />} />
              <Route path="/free-download" element={<FreeDownloadPage />} />
              <Route path="/success/:tierId" element={<SuccessView />} />
            </Routes>
          </main>
          <Footer />
          <ModalContainer />
          <Analytics />
        </div>
      </BrowserRouter>
    </ModalProvider>
  );
};

export default App;