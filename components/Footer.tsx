import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
             <img src="/logo.png" alt="LaunchLoom" className="w-6 h-6 rounded" />
             <span className="font-bold text-lg">LaunchLoom</span>
          </div>
          <div className="text-[#14B5563] text-sm">
            © {new Date().getFullYear()} LaunchLoom. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;