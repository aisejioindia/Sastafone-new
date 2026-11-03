import React from 'react';
import { useApp } from '../context/AppContext';
import { SastafoneLogo } from './SastafoneLogo';
import { MapPin, User, Wrench, Smartphone, ShoppingBag } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    language,
    setLanguage,
    selectedLocality,
    setIsLocationModalOpen,
    orders,
    activeTab,
    setActiveTab,
    user,
    setIsAuthModalOpen
  } = useApp();

  const activeOrdersCount = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;

  const handleNav = (tab: any, path: string) => {
    setActiveTab(tab);
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      {/* Top Surat Service Ribbon (Light Red Tint - No Dark Blue) */}
      <div className="bg-[#FEF2F2] border-b border-red-100 text-gray-800 text-xs px-3 py-1.5 font-medium flex items-center justify-between">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="bg-[#DC2626] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              सूरत
            </span>
            <span className="text-gray-700 text-xs">
              {language === 'hi'
                ? 'Sastafone Surat • डोरस्टेप पिकअप व डिलीवरी फोन रिपेयरिंग'
                : 'Sastafone Surat • Doorstep Mobile Pickup & Delivery Service'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white rounded-full p-0.5 border border-red-200">
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2 py-0.5 text-[11px] rounded-full font-bold transition-colors cursor-pointer ${
                  language === 'hi' ? 'bg-[#DC2626] text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 text-[11px] rounded-full font-bold transition-colors cursor-pointer ${
                  language === 'en' ? 'bg-[#DC2626] text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ENG
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo & Locality Pin */}
        <div className="flex items-center gap-2 sm:gap-3 shrink min-w-0">
          <button
            type="button"
            onClick={() => handleNav('repair', '/')}
            className="text-left cursor-pointer transition-transform hover:opacity-95 shrink-0"
            title="Sastafone Surat"
          >
            <SastafoneLogo size="sm" variant="light" showSubtitle={false} className="sm:hidden" />
            <SastafoneLogo size="md" variant="light" showSubtitle={true} className="hidden sm:flex" />
          </button>

          {/* Surat Locality Dropdown / Pin */}
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-[#FEF2F2] hover:bg-red-100/60 border border-red-200/80 text-gray-800 text-xs font-semibold transition-colors cursor-pointer shrink-0"
            title="सूरत क्षेत्र बदलें"
          >
            <MapPin className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
            <span className="max-w-[70px] sm:max-w-[110px] truncate">{selectedLocality}</span>
            <span className="hidden sm:inline text-[9px] text-[#DC2626] font-bold bg-white px-1 py-0.5 rounded border border-red-200">
              बदलें
            </span>
          </button>
        </div>

        {/* Center Desktop Navigation: Home, Repair, Sell, Buy */}
        <nav className="hidden md:flex items-center bg-gray-50 p-1 rounded-xl border border-gray-200 gap-1">
          <button
            type="button"
            onClick={() => handleNav('repair', '/repair')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'repair'
                ? 'bg-[#DC2626] text-white shadow-xs'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>मोबाइल रिपेयर</span>
            <span className={`text-[9px] px-1 rounded font-bold ${activeTab === 'repair' ? 'bg-white/20 text-white' : 'bg-red-50 text-red-600'}`}>
              ₹199
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleNav('sell', '/sell-phone')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sell'
                ? 'bg-[#DC2626] text-white shadow-xs'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>पुराना फोन बेचें</span>
          </button>

          <button
            type="button"
            onClick={() => handleNav('buy', '/buy-phones')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'buy'
                ? 'bg-[#DC2626] text-white shadow-xs'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200/50'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>सर्टिफाइड फोन खरीदें</span>
          </button>
        </nav>

        {/* Right User Login / Profile Button */}
        <div className="flex items-center gap-2 shrink-0">
          {!user.isLoggedIn ? (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 tap-target"
              title="लॉगिन करें"
            >
              <User className="w-3.5 h-3.5" />
              <span>लॉगिन</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (window.location.pathname !== '/profile') {
                  window.history.pushState({}, '', '/profile');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FEF2F2] hover:bg-red-100/70 border border-red-200 text-gray-900 text-xs font-bold transition-colors cursor-pointer shrink-0 tap-target"
              title="प्रोफाइल व ऑर्डर्स"
            >
              <div className="w-5 h-5 rounded-full bg-[#DC2626] text-white flex items-center justify-center shrink-0 text-[10px]">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="max-w-[70px] sm:max-w-none truncate">
                {user.name ? user.name.split(' ')[0] : 'प्रोफाइल'}
              </span>
              {activeOrdersCount > 0 && (
                <span className="bg-[#DC2626] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {activeOrdersCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
