import React from 'react';
import { FEATURE_COMPARISON, TIER_CONFIGS } from '../constants';

const FeatureComparison: React.FC = () => {
  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-neutral-text mb-4">
            Detailed Feature Breakdown
          </h2>
          <p className="text-lg text-gray-600">
            See exactly what's included in each plan.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Feature</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-900">
                  {TIER_CONFIGS.free.name}
                </th>
                <th className="text-center py-4 px-6 font-semibold text-teal-primary">
                  {TIER_CONFIGS.standard.name}
                </th>
                <th className="text-center py-4 px-6 font-semibold text-orange-warm">
                  {TIER_CONFIGS.pro.name}
                </th>
              </tr>
            </thead>
            <tbody>
              {FEATURE_COMPARISON.map((row, rowIdx) => (
                <React.Fragment key={rowIdx}>
                  {/* Category Header */}
                  <tr className="bg-gray-200 border-t-2 border-t-gray-300">
                    <td colSpan={4} className="px-6 py-4 font-bold text-sm uppercase tracking-widest text-gray-900 bg-gray-200">
                      {row.category}
                    </td>
                  </tr>

                  {/* Features in Category */}
                  {row.features.map((feature, featureIdx) => (
                    <tr key={featureIdx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900 font-medium">{feature.name}</td>
                      <td className="px-6 py-4 text-center text-gray-900">
                        <FeatureValue value={feature.free} />
                      </td>
                      <td className="px-6 py-4 text-center text-teal-primary font-semibold">
                        <FeatureValue value={feature.standard} />
                      </td>
                      <td className="px-6 py-4 text-center text-orange-warm font-semibold">
                        <FeatureValue value={feature.pro} />
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const FeatureValue: React.FC<{ value: string | boolean }> = ({ value }) => {
  if (typeof value === 'boolean') {
    return value ? (
      <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal-100">
        <i className="fas fa-check text-teal-primary"></i>
      </div>
    ) : (
      <span className="text-gray-500">—</span>
    );
  }
  return <span>{value}</span>;
};

export default FeatureComparison;
