import React from 'react';

const TrustMetrics: React.FC = () => {
  return (
    <div className="bg-white py-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <i key={i} className="fas fa-star text-yellow-400 text-lg"></i>
              ))}
            </div>
            <p className="text-gray-700 font-medium">
              Trusted by <span className="font-bold text-neutral-text">20+ Founders</span>
            </p>
          </div>

          <div className="flex justify-center gap-8 md:gap-16 opacity-50 grayscale">
            <div className="flex flex-col items-center gap-2">
              <i className="fab fa-product-hunt text-2xl text-[#4B5563]"></i>
              <span className="text-xs text-[#4B5563]">Product Hunt</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <i className="fab fa-twitter text-2xl text-[#4B5563]"></i>
              <span className="text-xs text-[#4B5563]">Twitter</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <i className="fab fa-linkedin text-2xl text-[#4B5563]"></i>
              <span className="text-xs text-[#4B5563]">LinkedIn</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <i className="fab fa-reddit text-2xl text-[#4B5563]"></i>
              <span className="text-xs text-[#4B5563]">Reddit</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustMetrics;
