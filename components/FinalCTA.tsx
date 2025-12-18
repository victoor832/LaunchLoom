import React from 'react';
import { useNavigate } from 'react-router-dom';

const FinalCTA: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black py-20 relative overflow-hidden">
      {/* Decorative rocket icon in background */}
      <div className="absolute right-0 bottom-0 opacity-10 text-8xl">
        <i className="fas fa-rocket"></i>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to launch smoothly?
        </h2>

        <p className="text-xl text-gray-200 mb-10">
          Join thousands of creators who trust LaunchLoom to organize their product launches. 
          Start for free today.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => {
              document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-4 bg-teal-primary hover:bg-teal-hover text-white font-semibold rounded-lg transition-colors shadow-lg shadow-teal-500/30"
          >
            Get Started Free
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalCTA;
