import React, { useState } from 'react';

interface GeneratingModalProps {
  isOpen: boolean;
  progress: number; // 0-100
}

const GeneratingModal: React.FC<GeneratingModalProps> = ({ isOpen, progress }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md mx-4">
        <div className="mb-8">
          <i className="fas fa-rocket text-5xl text-teal-primary animate-bounce"></i>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Generating Your Plan
        </h2>
        <p className="text-gray-600 mb-8">
          Our AI is creating your personalized 30-day launch checklist...
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-teal-primary to-teal-hover h-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        <p className="text-lg font-semibold text-teal-primary">{Math.round(progress)}%</p>

        <div className="mt-8 flex items-center justify-center gap-2 text-gray-600">
          <i className="fas fa-spinner animate-spin"></i>
          <span className="text-sm">Estimated time: 3-5 seconds</span>
        </div>
      </div>
    </div>
  );
};

export default GeneratingModal;
