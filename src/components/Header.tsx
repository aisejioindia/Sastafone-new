import React from 'react';
import { useApp } from '../context/AppContext';
import { SastafoneLogo } from './SastafoneLogo';
import { MapPin, Instagram, ExternalLink, MessageCircle, Phone } from 'lucide-react';
import {
  INSTAGRAM_URL,
  GOOGLE_MAPS_URL,
  buildWhatsappHref,
  normalizeTelHref
} from '../services/siteSettingsService';
import { trackEvent } from '../utils/analytics';

export const Header: React.FC = () => {
  const {
    language,
    setLanguage,
    selectedLocality,
    setIsLocationModalOpen,
    siteSettings
  } = useApp();

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
  const whatsappHref = buildWhatsappHref(
    siteSettings.whatsappNumber,
    'नमस्ते Sastafone Surat! मुझे मोबाइल रिपेयर / सेवा बुक करनी है।'
  );
  const telHref = normalizeTelHref(siteSettings.supportPhone);

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
            { label: language === 'hi' ? 'ऑर्डर ट्रैक' : 'Track Order', path: '/track' },
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

        {/* Direct WhatsApp + Call CTA (No Website Login Needed) */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={telHref}
            onClick={() => trackEvent('call_click', { source: 'header' })}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 hover:bg-[#FEF2F2] border border-gray-200 text-[#132032] hover:text-[#D5151B] text-xs font-bold transition-colors duration-150 whitespace-nowrap shrink-0 tap-target"
            title={`Call ${siteSettings.supportPhone}`}
          >
            <Phone className="w-3.5 h-3.5 text-[#D5151B] shrink-0" />
            <span>{language === 'hi' ? 'कॉल' : 'Call'}</span>
          </a>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('whatsapp_click', { source: 'header' })}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors duration-150 whitespace-nowrap shrink-0 tap-target"
            title="सीधे WhatsApp पर बुक करें"
          >
            <MessageCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{language === 'hi' ? 'WhatsApp बुकिंग' : 'WhatsApp'}</span>
          </a>
        </div>
      </div>
    </header>
  );
};
