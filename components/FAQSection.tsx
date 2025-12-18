import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'Can I upgrade later?',
    answer: 'Yes! You can upgrade your plan at any time. Your new plan will take effect immediately, and we\'ll prorate any charges based on your billing cycle.'
  },
  {
    question: 'Is there a refund policy?',
    answer: 'We offer a 14-day money-back guarantee on all paid plans. If you\'re not satisfied, simply contact us and we\'ll process your refund.'
  },
  {
    question: 'What happens after 30 days?',
    answer: 'Your launch plan checklist is yours forever! You can continue using it, share it with your team, and revisit it anytime. Paid plans renew on your billing date.'
  },
  {
    question: 'Do you offer discounts for non-profits?',
    answer: 'Absolutely! Non-profit organizations and open-source projects get 50% off all plans. Contact our support team with proof of your non-profit status.'
  }
];

const FAQSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="py-20 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-text mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {FAQ_ITEMS.map((item, idx) => (
            <FAQItem
              key={idx}
              question={item.question}
              answer={item.answer}
              isOpen={openIdx === idx}
              onToggle={() => setOpenIdx(openIdx === idx ? null : idx)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onToggle }) => {
  return (
    <div
      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-teal-primary/30 transition-colors"
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900">{question}</span>
        <div
          className={`flex-shrink-0 w-6 h-6 rounded-full bg-teal-50 flex items-center justify-center transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <i className="fas fa-chevron-down text-teal-primary text-sm"></i>
        </div>
      </button>

      {isOpen && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 text-gray-600">
          {answer}
        </div>
      )}
    </div>
  );
};

export default FAQSection;
