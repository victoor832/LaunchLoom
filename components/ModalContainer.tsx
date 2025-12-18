import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../context/ModalContext';

const getTierName = (id: string) => {
  const names: Record<string, string> = {
    standard: 'Standard',
    pro: 'Pro+',
  };
  return names[id] || 'Plan';
};

const ModalContainer: React.FC = () => {
  const navigate = useNavigate();
  const { modalState, closePaymentModal } = useModal();

  if (!modalState.isOpen) return null;

  const handleProceed = () => {
    closePaymentModal();
    navigate(`/form/${modalState.tierId}`);
  };

  return (
    <>
      {/* Overlay backdrop - covers entire viewport including navbar */}
      <div 
        className="fixed inset-0 bg-black/60 z-[9999]"
        onClick={closePaymentModal}
      />
      
      {/* Modal - centered and compact */}
      <div className="fixed inset-0 flex items-center justify-center z-[10000] p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5 pointer-events-auto overflow-y-auto max-h-[90vh]">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Confirm Purchase
            </h2>
            <p className="text-base text-gray-600">
              {getTierName(modalState.tierId)} Plan - <span className="font-bold text-teal-primary">${modalState.price}</span>
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200" />

          {/* Message */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-semibold">
              🎉 For the next few days, this plan is also free.
            </p>
          </div>

          {/* Feedback Section */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <p className="text-xs text-gray-700 font-medium">
              Any problem or feedback? Contact the creator:
            </p>
            <div className="space-y-2">
              <a
                href="https://x.com/shipwithvictor"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 text-teal-primary hover:bg-teal-50 hover:border-teal-300 font-medium transition-all text-sm"
              >
                <i className="fab fa-twitter"></i>
                <span>Twitter: @shipwithvictor</span>
              </a>
              <a
                href="mailto:victorca380@gmail.com"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 text-teal-primary hover:bg-teal-50 hover:border-teal-300 font-medium transition-all text-sm"
              >
                <i className="fas fa-envelope"></i>
                <span>Gmail: victorca380@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200" />

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={closePaymentModal}
              className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-100 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleProceed}
              className="flex-1 px-4 py-2 rounded-lg bg-teal-primary text-white font-semibold text-sm hover:bg-teal-600 transition-colors duration-200 shadow-lg"
            >
              Proceed →
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalContainer;
