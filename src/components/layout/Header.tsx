import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Bell, User, Search } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function NetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div
      className="flex items-center gap-1.5 text-xs font-semibold"
      aria-live="polite"
      aria-label={isOnline ? 'Online' : 'Offline — using cached data'}
    >
      {isOnline ? (
        <Wifi className="h-3.5 w-3.5 text-white" aria-hidden="true" />
      ) : (
        <WifiOff className="h-3.5 w-3.5 text-red-300" aria-hidden="true" />
      )}
      <span className="hidden sm:inline text-white">{isOnline ? 'Online' : 'Offline'}</span>
    </div>
  );
}

export function Header() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [isScrolled, setIsScrolled] = useState(false);
  const [topHeaderHeight, setTopHeaderHeight] = useState(0);
  const topHeaderRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Measure the height of the top government header
    const updateHeight = () => {
      if (topHeaderRef.current) {
        setTopHeaderHeight(topHeaderRef.current.offsetHeight);
      }
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);

    // Efficient scroll listener
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (fontSize === 'sm') {
      html.style.fontSize = '14px';
    } else if (fontSize === 'lg') {
      html.style.fontSize = '18px';
    } else {
      html.style.fontSize = '16px';
    }
  }, [fontSize]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header 
      className="w-full bg-white flex flex-col z-50 sticky top-0 font-sans transition-transform duration-300 ease-in-out"
      style={{ transform: isScrolled ? `translateY(-${topHeaderHeight}px)` : 'translateY(0)' }}
    >
      <div 
        ref={topHeaderRef}
        className={`transition-opacity duration-300 ease-in-out ${isScrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        {/* Top Utility Bar (Government Standard) */}
      <div className="bg-[#1a233a] text-white py-1 px-4 sm:px-6 text-xs flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="font-semibold tracking-wide">भारत सरकार</span>
          <span className="hidden sm:inline text-gray-300">|</span>
          <span className="font-semibold tracking-wide hidden sm:inline">GOVERNMENT OF INDIA</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron" aria-label="Skip to main content">Skip to Main Content</button>
          <div className="flex items-center gap-1 bg-gray-800 px-2 py-0.5 rounded">
            <button 
              onClick={() => setFontSize('sm')}
              className={`text-[10px] px-1 hover:bg-gray-700 rounded ${fontSize === 'sm' ? 'text-saffron font-bold' : ''}`}
              aria-label="Decrease font size"
            >A-</button>
            <button 
              onClick={() => setFontSize('md')}
              className={`text-xs px-1 hover:bg-gray-700 rounded ${fontSize === 'md' ? 'text-saffron font-bold' : ''}`}
              aria-label="Default font size"
            >A</button>
            <button 
              onClick={() => setFontSize('lg')}
              className={`text-sm px-1 hover:bg-gray-700 rounded ${fontSize === 'lg' ? 'text-saffron font-bold' : ''}`}
              aria-label="Increase font size"
            >A+</button>
          </div>
          <LanguageSelector />
        </div>
      </div>

      {/* Main Branding Bar */}
      <div className="px-4 sm:px-6 py-3 flex justify-between items-center bg-white">
        <div className="flex items-center gap-4">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
            alt="State Emblem of India" 
            className="h-16 sm:h-20 w-auto object-contain shrink-0"
          />
          
          <div className="flex flex-col justify-center">
            <div className="mb-1.5">
              <h1 className="text-lg sm:text-xl font-bold text-black leading-tight">
                कृषि एवं किसान कल्याण विभाग
              </h1>
              <h2 className="text-xs sm:text-sm font-medium text-black uppercase tracking-wide">
                Department of Agriculture & Farmers Welfare
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] sm:text-xs font-bold text-black leading-tight">भारत सरकार</p>
                <p className="text-[10px] sm:text-xs font-medium text-black uppercase tracking-tight">Government<br/>of India</p>
              </div>
              <div className="w-px h-8 bg-gray-400"></div>
              <div className="text-left">
                <p className="text-[10px] sm:text-xs font-bold text-black leading-tight">कृषि एवं किसान कल्याण मंत्रालय</p>
                <p className="text-[10px] sm:text-xs font-medium text-black uppercase tracking-tight">Ministry of Agriculture &<br/>Farmers Welfare</p>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-3 xl:gap-5">
          <img src="https://agriwelfare.gov.in/public/images/kissan3.png" alt="Kisan Helpline Centre" className="h-8 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity" onError={(e) => (e.currentTarget.style.display = 'none')} />
          <img src="https://agriwelfare.gov.in/public/images/150-years-of-celebrating-the-mahatma.png" alt="150 Years of Mahatma" className="h-10 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity" />
          <img src="https://agriwelfare.gov.in/public/images/jal-shakti-abhiyan-sanchay-jal-behtar-kal.png" alt="Jal Shakti Abhiyan" className="h-10 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity" />
          <img src="https://agriwelfare.gov.in/public/images/azadi-ka-amrit-mahotsav.png" alt="Azadi Ka Amrit Mahotsav" className="h-10 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity" />
          <img src="https://agriwelfare.gov.in/public/banner/logo_G20.png" alt="G20 India 2023" className="h-8 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity" />
          <img src="https://agriwelfare.gov.in/public/banner/AWG-g20.jpg" alt="G20 Agriculture Working Group" className="h-10 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity" />
        </div>
      </div>
      </div>

      {/* Navigation & Controls Bar */}
      <div className={`bg-[var(--color-goi-green)] text-white px-4 sm:px-6 py-2 flex items-center justify-between border-t-4 border-[var(--color-goi-saffron)] transition-shadow duration-300 ${isScrolled ? 'shadow-md' : 'shadow-sm'}`}>
        <div className="flex items-center">
          {user && (
            <div className="flex items-center">
              <div className="bg-white/20 p-1.5 rounded-full mr-3">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">{user.name}</span>
                <span className="text-xs text-white uppercase tracking-wider font-semibold">{user.role}</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 shrink-0 bg-white/10 px-3 py-1.5 rounded text-sm">
           <NetworkStatus />
           <div className="w-px h-4 bg-white/30"></div>
           <button aria-label="Search" className="hover:text-[var(--color-goi-saffron)] transition-colors">
              <Search className="w-4 h-4" />
           </button>
           <button aria-label="Notifications" className="hover:text-[var(--color-goi-saffron)] transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
           </button>
           {user ? (
             <button 
               onClick={handleLogout}
               className="hover:text-[var(--color-goi-saffron)] transition-colors ml-2 font-semibold text-xs bg-white/10 px-2 py-1 rounded"
             >
               LOGOUT
             </button>
           ) : (
             <button aria-label="User Profile" className="hover:text-[var(--color-goi-saffron)] transition-colors ml-2">
                <User className="w-4 h-4" />
             </button>
           )}
        </div>
      </div>
    </header>
  );
}
