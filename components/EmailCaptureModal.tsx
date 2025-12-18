import React, { useState } from 'react';

interface EmailCaptureModalProps {
  isOpen: boolean;
  onSubmit: (email: string) => void;
  isLoading?: boolean;
}

const EmailCaptureModal: React.FC<EmailCaptureModalProps> = ({ 
  isOpen, 
  onSubmit,
  isLoading = false 
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    onSubmit(email);
  };

  const handleSkip = () => {
    onSubmit(''); // Skip without email
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md mx-4">
        <div className="mb-6">
          <i className="fas fa-check-circle text-5xl text-teal-primary"></i>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Perfect! Your plan is ready
        </h2>
        <p className="text-gray-600 mb-8">
          Your personalized 30-day launch checklist has been downloaded. Want us to send you exclusive tips?
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-primary text-gray-900"
              disabled={isLoading}
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-teal-primary hover:bg-teal-hover text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner animate-spin mr-2"></i>
                Saving...
              </>
            ) : (
              'Send me tips'
            )}
          </button>

          <button
            type="button"
            onClick={handleSkip}
            disabled={isLoading}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skip for now
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-6">
          We'll never spam you. Unsubscribe anytime.
        </p>
      </div>
    </div>
  );
};

export default EmailCaptureModal;
