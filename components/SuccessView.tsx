import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TIER_CONFIGS, WHATSAPP_GROUP_LINK } from '../constants';
import { TierId } from '../types';

const SuccessView: React.FC = () => {
  const { tierId } = useParams<{ tierId: string }>();
  const tier = TIER_CONFIGS[tierId as TierId];

  useEffect(() => {
    // Scroll to top when component loads
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!tier) return <div>Unknown Tier</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center">
        
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <i className="fas fa-check text-2xl text-green-600"></i>
        </div>

        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Success!</h2>
        <p className="text-gray-600 mb-8">
          Your personalized {tier.name} launch plan has been downloaded to your device.
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-100">
           <h3 className="font-semibold text-gray-900 mb-2">Next Steps:</h3>
           <ul className="text-left text-sm text-gray-600 space-y-2">
             <li className="flex items-start gap-2">
               <i className="fas fa-file-pdf mt-1 text-teal-primary"></i>
               Open the PDF file in your downloads folder.
             </li>
             <li className="flex items-start gap-2">
               <i className="fas fa-calendar mt-1 text-teal-primary"></i>
               Add the key dates to your calendar.
             </li>
           </ul>
        </div>

        {tier.requiresChat && (
          <div className="mb-8">
            <div className="bg-orange-50 border border-orange-100 rounded-lg p-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                 <i className="fab fa-whatsapp text-green-500 text-xl"></i>
                 <h3 className="font-bold text-gray-900">Pro Access Active</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                You have 7-day access to our private founder group for support.
              </p>
              <a 
                href={WHATSAPP_GROUP_LINK}
                target="_blank"
                rel="noreferrer"
                className="inline-block w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
              >
                Join Support Chat
              </a>
            </div>
          </div>
        )}

        <Link to="/" className="text-teal-primary hover:text-teal-hover font-medium">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default SuccessView;