import React from 'react';
import TierCard from './TierCard';
import { TIER_CONFIGS } from '../constants';

const TierSelector: React.FC = () => {
  return (
    <div id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-text mb-4">
            Your 30-Day Launch Plan
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the checklist that fits your launch scale. From hobby projects to full-scale agency deployments. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <TierCard config={TIER_CONFIGS.free} />
          <TierCard config={TIER_CONFIGS.standard} />
          {/* Pro+ tier hidden - available soon */}
          {/* <TierCard config={TIER_CONFIGS.pro} /> */}
        </div>
      </div>
    </div>
  );
};

export default TierSelector;