import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { StandardFormData, ProFormData, TierId, GeneratedChecklist } from '../types';
import { TIER_CONFIGS } from '../constants';
import { saveEmailToSupabase } from '../services/emailService';
import GeneratingModal from './GeneratingModal';
import EmailCaptureModal from './EmailCaptureModal';

type FormData = StandardFormData | ProFormData;

const PersonalizationForm: React.FC = () => {
  const { tierId } = useParams<{ tierId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showGeneratingModal, setShowGeneratingModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedChecklist, setGeneratedChecklist] = useState<GeneratedChecklist | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>();

  // Validate Tier
  const currentTier = TIER_CONFIGS[tierId as TierId];
  if (!currentTier || !currentTier.requiresForm) {
    return <div className="text-center p-10">Invalid Tier Access</div>;
  }

  const isPro = tierId === 'pro';
  const selectedChannels = watch('selectedChannels') as string[] | undefined;

  const onSubmit = async (data: FormData) => {
    // For Free tier, navigate to download page
    if (tierId === 'free') {
      navigate('/free-download');
      return;
    }

    setIsLoading(true);
    setFormData(data);
    setShowGeneratingModal(true);
    setGenerationProgress(0);
    setError(null);

    try {
      // Simulate progress - más lento y distribuido
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 75) {
            // After 75%, slow down significantly (waiting for API)
            const slowIncrement = 0.1 + Math.random() * 0.4; // 0.1-0.5%
            return Math.min(prev + slowIncrement, 99);
          }
          // Before 75%, normal slow progress (0.5-2%)
          const increment = 0.5 + Math.random() * 1.5;
          return Math.min(prev + increment, 75);
        });
      }, 500); // 500ms interval instead of 200ms

      // Call API server for PDF generation (Gemini → Word → PDF pipeline)
      console.log(`[Form] Calling API server to generate PDF for ${tierId} tier`);
      
      // Calculate days to launch
      const launchDate = new Date(data.launchDate);
      const today = new Date();
      const daysToLaunch = Math.ceil((launchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Validate launch date is in the future
      if (daysToLaunch <= 0) {
        throw new Error(
          `Tu fecha de lanzamiento ya pasó (${launchDate.toLocaleDateString()}). ` +
          `Este playbook te sirve para análisis post-launch o recalcula una fecha futura.`
        );
      }
      
      // Build request body
      const requestBody: any = {
        productName: data.productName,
        targetAudience: data.targetAudience,
        launchDate: data.launchDate,
        tier: tierId,
        daysToLaunch,
      };

      // Add Pro+ fields if applicable
      if (isPro) {
        const proData = data as ProFormData;
        requestBody.productDescription = proData.productDescription;
        requestBody.currentTraction = proData.currentTraction;
        requestBody.budget = proData.budget;
        requestBody.selectedChannels = proData.selectedChannels;
        requestBody.hasProductHuntExperience = proData.hasProductHuntExperience;
        requestBody.mainCompetitor = proData.mainCompetitor || ''; // Can be empty for auto-detection
      }

      // Determine API URL based on environment
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const apiUrl = isDevelopment ? 'http://localhost:3000/api/generate-pdf' : '/api/generate-pdf';
      
      console.log(`[Form] Using API URL: ${apiUrl}`);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API error: ${response.statusText}`);
      }

      // Get PDF as blob
      const pdfBlob = await response.blob();
      console.log(`[Form] ✓ PDF received from server: ${pdfBlob.size} bytes`);

      // Download PDF
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${data.productName}-launch-playbook-${tierId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      // Wait a moment before showing email modal
      await new Promise((resolve) => setTimeout(resolve, 800));
      setShowGeneratingModal(false);
      setShowEmailModal(true);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`[Form] Generation failed for ${tierId} tier:`, err);
      setError(`Failed to generate your ${tierId === 'pro' ? 'strategy' : 'plan'}: ${errorMsg}. Check browser console for details.`);
      setShowGeneratingModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (email: string) => {
    try {
      if (email && formData) {
        // Save email to Supabase
        await saveEmailToSupabase(email, tierId as string, formData.productName);
      }
      
      // Close modal and navigate to success
      setShowEmailModal(false);
      navigate(`/success/${tierId}`, { state: { checklist: generatedChecklist } });
    } catch (err) {
      console.error('Error saving email:', err);
      setError('Failed to save email. But your plan is ready!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className={`h-2 w-full ${currentTier.id === 'pro' ? 'bg-orange-warm' : 'bg-teal-primary'}`}></div>
        
        <div className="p-8 sm:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {isPro ? 'Build Your Complete Launch Strategy' : "Let's customize your checklist"}
            </h2>
            <p className="mt-2 text-gray-600">
              {isPro 
                ? 'Tell us everything about your product so we can create a comprehensive, personalized launch strategy.'
                : 'Tell us about your product so AI can build your strategy.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Product Name */}
            <div>
              <label htmlFor="productName" className="block text-sm font-medium text-gray-700">Product Name *</label>
              <input
                id="productName"
                type="text"
                className={`mt-1 block w-full px-3 py-2 border ${errors.productName ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:ring-teal-primary focus:border-teal-primary sm:text-sm`}
                placeholder="e.g. LaunchLoom"
                {...register('productName', { required: 'Product name is required' })}
              />
              {errors.productName && <p className="mt-1 text-xs text-red-500">{errors.productName.message}</p>}
            </div>

            {/* Target Audience */}
            <div>
              <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700">Target Audience *</label>
              <select
                id="targetAudience"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-primary focus:border-teal-primary sm:text-sm rounded-md"
                {...register('targetAudience', { required: true })}
              >
                <option value="">Select your audience</option>
                <option value="B2B">B2B (Business to Business)</option>
                <option value="B2C">B2C (Business to Consumer)</option>
                <option value="D2C">D2C (Direct to Consumer)</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>

            {/* Launch Date */}
            <div>
              <label htmlFor="launchDate" className="block text-sm font-medium text-gray-700">Launch Date *</label>
              <input
                id="launchDate"
                type="date"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-primary focus:border-teal-primary sm:text-sm"
                {...register('launchDate', { required: 'Launch date is required' })}
              />
              {errors.launchDate && <p className="mt-1 text-xs text-red-500">{errors.launchDate.message}</p>}
            </div>

            {/* Current Users */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Current User Base *</label>
              <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {['0', '<100', '100-1K', '1K+'].map((opt) => (
                  <label key={opt} className="cursor-pointer">
                    <input
                      type="radio"
                      value={opt}
                      {...register('currentUsers', { required: true })}
                      className="sr-only peer"
                    />
                    <div className="text-sm font-medium text-center py-2 border rounded-md hover:bg-gray-50 peer-checked:bg-teal-50 peer-checked:border-teal-primary peer-checked:text-teal-primary transition-all">
                      {opt}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* PRO+ ONLY FIELDS */}
            {isPro && (
              <>
                {/* Product Description */}
                <div className="pt-4 border-t-2 border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tell us about your product</h3>
                  
                  <div className="mb-6">
                    <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700">
                      Product Description (minimum 200 characters) *
                    </label>
                    <textarea
                      id="productDescription"
                      placeholder="Describe what your product does, who it's for, and what problem it solves. This helps us identify real competitors and personalize your strategy."
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-primary focus:border-teal-primary sm:text-sm"
                      rows={4}
                      {...register('productDescription', { 
                        required: 'Product description is required',
                        minLength: { value: 200, message: 'Description must be at least 200 characters' }
                      })}
                    />
                    {(errors as any).productDescription && <p className="mt-1 text-xs text-red-500">{(errors as any).productDescription.message}</p>}
                  </div>
                </div>

                {/* Current Traction */}
                <div className="pt-4 border-t-2 border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tell us about your current progress</h3>
                  
                  <div className="mb-6">
                    <label htmlFor="currentTraction" className="block text-sm font-medium text-gray-700">
                      Current Traction (subscribers, users, revenue) *
                    </label>
                    <textarea
                      id="currentTraction"
                      placeholder="e.g. 500 beta subscribers, $0 MRR, 200 waitlist"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-primary focus:border-teal-primary sm:text-sm"
                      rows={3}
                      {...register('currentTraction', { required: 'Please describe your current traction' })}
                    />
                    {(errors as any).currentTraction && <p className="mt-1 text-xs text-red-500">{(errors as any).currentTraction.message}</p>}
                  </div>

                  {/* Budget */}
                  <div className="mb-6">
                    <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                      Launch Budget ($) *
                    </label>
                    <input
                      id="budget"
                      type="text"
                      placeholder="e.g. 500, 2000, 10000+"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-primary focus:border-teal-primary sm:text-sm"
                      {...register('budget', { required: 'Please enter your budget' })}
                    />
                    {(errors as any).budget && <p className="mt-1 text-xs text-red-500">{(errors as any).budget.message}</p>}
                  </div>

                  {/* Main Competitor */}
                  <div className="mb-6">
                    <label htmlFor="mainCompetitor" className="block text-sm font-medium text-gray-700">
                      Main Competitor (optional - leave blank to auto-detect)
                    </label>
                    <input
                      id="mainCompetitor"
                      type="text"
                      placeholder="e.g. Stripe, Notion, None. Or leave blank to auto-detect from your product description."
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-primary focus:border-teal-primary sm:text-sm"
                      {...register('mainCompetitor')}
                    />
                    {(errors as any).mainCompetitor && <p className="mt-1 text-xs text-red-500">{(errors as any).mainCompetitor.message}</p>}
                  </div>

                  {/* Selected Channels */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Distribution Channels (select all applicable) *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {['Twitter', 'Email', 'Product Hunt', 'LinkedIn', 'Partnerships', 'Paid Ads', 'Blog', 'Webinars'].map((channel) => (
                        <label key={channel} className="flex items-center">
                          <input
                            type="checkbox"
                            value={channel}
                            {...register('selectedChannels', { validate: (val) => val && val.length > 0 || 'Select at least one channel' })}
                            className="h-4 w-4 text-teal-primary focus:ring-teal-primary border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">{channel}</span>
                        </label>
                      ))}
                    </div>
                    {(errors as any).selectedChannels && <p className="mt-2 text-xs text-red-500">{(errors as any).selectedChannels.message}</p>}
                  </div>

                  {/* Product Hunt Experience */}
                  <div className="mb-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('hasProductHuntExperience')}
                        className="h-4 w-4 text-teal-primary focus:ring-teal-primary border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">I have Product Hunt launch experience</span>
                    </label>
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address *</label>
              <input
                id="email"
                type="email"
                placeholder="Where should we send your strategy?"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-teal-primary focus:border-teal-primary sm:text-sm"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${isPro ? 'bg-orange-warm hover:bg-orange-dark' : 'bg-teal-primary hover:bg-teal-hover'} focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <i className="fas fa-circle-notch fa-spin"></i> Generating {isPro ? 'Strategy' : 'Plan'}...
                </span>
              ) : (
                isPro ? 'Generate My Strategy' : 'Generate My Checklist'
              )}
            </button>
            
            <p className="text-xs text-center text-gray-400">
              Powered by LaunchLomo. Takes ~{isPro ? '15-20' : '3-5'} seconds.
            </p>
          </form>
        </div>
      </div>

      {/* Generating Modal */}
      <GeneratingModal isOpen={showGeneratingModal} progress={generationProgress} />

      {/* Email Capture Modal */}
      <EmailCaptureModal
        isOpen={showEmailModal}
        onSubmit={handleEmailSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default PersonalizationForm;