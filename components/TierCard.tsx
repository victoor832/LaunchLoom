import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TierConfig } from '../types';
import { useModal } from '../context/ModalContext';

interface TierCardProps {
  config: TierConfig;
}

const TierCard: React.FC<TierCardProps> = ({ config }) => {
  const navigate = useNavigate();
  const { openPaymentModal } = useModal();

  const handleAction = () => {
    if (config.id === 'free') {
      navigate('/free-download');
    } else {
      openPaymentModal(config.price, config.id);
    }
  };

  return (
    <div 
      className={`relative rounded-xl p-8 transition-all duration-200 flex flex-col h-full border ${config.colors.border} ${config.badge ? 'shadow-xl scale-105 z-10' : 'shadow-sm hover:shadow-md bg-white'}`}
      style={{ backgroundColor: config.badge ? undefined : 'white' }}
    >
      {/* Background Tint for Premium Cards if needed, handled by logic or inline styles */}
      {config.badge && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className={`px-4 py-1 rounded-full text-xs font-bold text-white tracking-wide uppercase ${config.id === 'standard' ? 'bg-teal-primary' : 'bg-orange-warm'}`}>
            {config.badge}
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-bold text-neutral-text">{config.name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-4xl font-bold text-neutral-text">${config.price}</span>
{/*           <span className="text-sm text-gray-500">/mo</span> */}
        </div>
        <p className="mt-4 text-sm text-gray-600 leading-relaxed">{config.description}</p>
      </div>

      <ul className="space-y-4 mb-8 flex-1">
        {config.features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <i className={`fas fa-check mt-1 ${config.id === 'pro' ? 'text-orange-warm' : 'text-teal-primary'}`}></i>
            <span className="text-sm text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleAction}
        className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-all shadow-sm ${config.colors.button} ${config.colors.buttonHover}`}
      >
        {config.id === 'free' ? 'Download Free' : config.id === 'standard' ? 'Get Personalized' : 'Get Full Access'}
      </button>
    </div>
  );
};

export default TierCard;