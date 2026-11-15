import React from 'react';
import { useApp } from '../context/AppContext';
import { SastafoneLogo } from './SastafoneLogo';
import { MapPin, User, Instagram, ExternalLink, Shield, Wrench } from 'lucide-react';
import { INSTAGRAM_URL, GOOGLE_MAPS_URL } from '../services/siteSettingsService';

export const Header: React.FC = () => {
  const {
    language,
    setLanguage,
    selectedLocality,
    setIsLocationModalOpen,
    orders,
    siteSettings,
    user,
    setIsAuthModalOpen
  } = useApp();

  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'completed' && o.status !== 'cancelled'
  ).length;

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';

  const handleNav = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const instagramHref = siteSettings.instagramUrl || INSTAGRAM_URL;
  const mapsHref = siteSettings.googleMapsUrl || GOOGLE_MAPS_URL;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
      {/* Subtle Light Top Utility Bar */}
      <div className="bg-[#FEF2F2] border-b border-red-100 text-[#132032] text-xs px-3 py-1.5">
        <div className="container mx-auto max-w-6xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#132032] hover:text-[#D5151B] transition-colors duration-150 cursor-pointer truncate"
            >
              <MapPin className="w-3.5 h-3.5 text-[#D5151B] shrink-0" />
              <span className="truncate">{selectedLocality}</span>
              <span className="text-[11px] font-bold text-[#D5151B] ml-1 whitespace-nowrap">
                ({language === 'hi' ? 'बदलें' : 'Change'})
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href={instagramHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sastafone Instagram"
              title="Instagram @sastafone.in"
              className="text-gray-600 hover:text-[#D5151B] transition-colors duration-150"
            >
              <Instagram className="w-3.5 h-3.5" />
            </a>
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Sastafone Google Maps"
              title="Find us on Google Maps"
              className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-gray-600 hover:text-[#D5151B] transition-colors duration-150 whitespace-nowrap"
            >
              <span>Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <div className="flex items-center bg-white rounded-lg p-0.5 border border-red-200">
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2 py-0.5 text-[11px] rounded-md font-bold transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                  language === 'hi' ? 'bg-[#D5151B] text-white' : 'text-gray-600 hover:text-[#132032]'
                }`}
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 text-[11px] rounded-md font-bold transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                  language === 'en' ? 'bg-[#D5151B] text-white' : 'text-gray-600 hover:text-[#132032]'
                }`}
              >
                ENG
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Single-Row Navbar */}
      <div className="container mx-auto max-w-6xl px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        <button
          type="button"
          onClick={() => handleNav('/')}
          className="text-left cursor-pointer transition-opacity duration-150 hover:opacity-90 shrink-0"
          title="Sastafone Surat Home"
        >
          <SastafoneLogo size="md" />
        </button>

        {/* Clean Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {[
            { label: language === 'hi' ? 'रिपेयर (₹199)' : 'Repair (₹199)', path: '/repair' },
            { label: language === 'hi' ? 'फोन बेचें' : 'Sell Phone', path: '/sell-phone' },
            { label: language === 'hi' ? 'फोन खरीदें' : 'Buy Phones', path: '/buy-phones' },
            { label: language === 'hi' ? 'वारंटी' : 'Warranty', path: '/warranty' },
            { label: language === 'hi' ? 'संपर्क' : 'Contact', path: '/contact' }
          ].map((item) => {
            const isActive = currentPath.startsWith(item.path);
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNav(item.path)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#FEF2F2] text-[#D5151B]'
                    : 'text-[#132032] hover:bg-gray-50 hover:text-[#D5151B]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right User Login / Profile Trigger + Admin Control Room (Verified Admin ONLY) */}
        <div className="flex items-center gap-2 shrink-0">
          {user.isLoggedIn && user.isAdmin && user.role === 'admin' && (
            <button
              type="button"
              onClick={() => handleNav('/admin')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#132032] hover:bg-[#1e2f47] text-white text-xs font-bold shadow-xs transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 tap-target"
              title="Open Admin Control Room"
            >
              <Shield className="w-3.5 h-3.5 text-[#D5151B] shrink-0" />
              <span className="hidden sm:inline">Admin Control Room</span>
              <span className="sm:hidden">Admin</span>
            </button>
          )}

          {user.isLoggedIn && user.isPartner && user.role === 'partner' && (
            <button
              type="button"
              onClick={() => handleNav('/partner')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 tap-target"
              title="Open Partner Portal"
            >
              <Wrench className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Partner Portal</span>
              <span className="sm:hidden">Partner</span>
            </button>
          )}

          {!user.isLoggedIn ? (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white text-xs font-bold shadow-xs transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 tap-target"
              title="लॉगिन करें"
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>{language === 'hi' ? 'लॉगिन' : 'Login'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleNav('/profile')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FEF2F2] hover:bg-red-100/70 border border-red-200 text-[#132032] text-xs font-bold transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 tap-target"
              title="प्रोफाइल व ऑर्डर्स"
            >
              <span className="w-5 h-5 rounded-full bg-[#D5151B] text-white flex items-center justify-center shrink-0 text-[10px]">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
              <span className="max-w-[76px] sm:max-w-[110px] truncate">
                {user.name ? user.name.split(' ')[0] : 'प्रोफाइल'}
              </span>
              {activeOrdersCount > 0 && (
                <span className="bg-[#D5151B] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold tabular-nums">
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
