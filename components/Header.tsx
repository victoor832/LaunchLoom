import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleScrollToId = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false); // Close mobile menu after clicking
    
    // If not on home page, navigate to home first
    if (location.pathname !== '/') {
      navigate('/');
      // Wait for page to load, then scroll
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // Already on home, just scroll
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleGetStarted = () => {
    setIsMobileMenuOpen(false);
    document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer" onClick={() => {
            if (location.pathname === '/') {
              const element = document.getElementById('hero');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            } else {
              navigate('/');
              setTimeout(() => {
                const element = document.getElementById('hero');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }
          }}>
            <img src="/logo.png" alt="LaunchLoom" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-xl text-neutral-text">LaunchLoom</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" onClick={(e) => handleScrollToId(e, 'pricing')} className="text-gray-600 hover:text-teal-primary transition-colors text-sm cursor-pointer">Features</a>
            <a href="#" onClick={(e) => handleScrollToId(e, 'pricing')} className="text-gray-600 hover:text-teal-primary transition-colors text-sm cursor-pointer">Pricing</a>
          </nav>
          <button
            onClick={handleGetStarted}
            className="hidden md:block px-6 py-2 bg-neutral-text text-white rounded-lg font-semibold text-sm hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Get Started
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-teal-primary transition-colors"
          >
            <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 text-center">
            <nav className="space-y-3 pt-4">
              <a 
                href="#" 
                onClick={(e) => handleScrollToId(e, 'pricing')} 
                className="block text-gray-600 hover:text-teal-primary transition-colors text-sm"
              >
                Features
              </a>
              <a 
                href="#" 
                onClick={(e) => handleScrollToId(e, 'pricing')} 
                className="block text-gray-600 hover:text-teal-primary transition-colors text-sm"
              >
                Pricing
              </a>
              <button
                onClick={handleGetStarted}
                className="w-full px-6 py-2 bg-neutral-text text-white rounded-lg font-semibold text-sm hover:bg-gray-800 transition-colors"
              >
                Get Started
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;