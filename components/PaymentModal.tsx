import React from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  price: number;
  tierId: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  price,
  tierId,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const getTierName = (id: string) => {
    const names: Record<string, string> = {
      standard: 'Standard',
      pro: 'Pro+',
    };
    return names[id] || 'Plan';
  };

  return (
    <>
      {/* Overlay backdrop - positioned to cover entire viewport */}
      <div 
        className="fixed top-0 left-0 right-0 bottom-0 bg-black/60 z-40 pointer-events-auto"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 p-4 w-full max-w-md pointer-events-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full p-8 space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Confirm Purchase
            </h2>
            <p className="text-lg text-gray-600">
              {getTierName(tierId)} Plan - <span className="font-bold text-teal-primary text-xl">${price}</span>
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200" />

          {/* Message */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-5">
            <p className="text-base text-blue-900 font-semibold">
              🎉 For the next few days, this plan is also free.
            </p>
          </div>

          {/* Feedback Section */}
          <div className="bg-gray-50 rounded-xl p-5 space-y-4">
            <p className="text-sm text-gray-700 font-medium">
              Any problem or feedback? Contact the creator:
            </p>
            <div className="space-y-3">
              <a
                href="https://x.com/shipwithvictor"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white border border-gray-200 text-teal-primary hover:bg-teal-50 hover:border-teal-300 font-medium transition-all"
              >
                <i className="fab fa-twitter text-lg"></i>
                <span>Twitter: @shipwithvictor</span>
              </a>
              <a
                href="mailto:victorca380@gmail.com"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white border border-gray-200 text-teal-primary hover:bg-teal-50 hover:border-teal-300 font-medium transition-all"
              >
                <i className="fas fa-envelope text-lg"></i>
                <span>Gmail: victorca380@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200" />

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-bold text-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-3 rounded-lg bg-teal-primary text-white font-bold text-lg hover:bg-teal-600 transition-colors duration-200 shadow-lg"
            >
              Proceed →
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentModal;
