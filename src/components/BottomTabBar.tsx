import React from 'react';
import { Home, Wrench, Smartphone, MessageCircle, ShoppingBag, ShieldCheck, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { buildWhatsappHref } from '../services/siteSettingsService';
import { trackEvent } from '../utils/analytics';

export type TabType = 'home' | 'repair' | 'sell' | 'contact';

interface BottomTabBarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  onNavigate?: (path: string) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentTab,
  onTabChange,
  onNavigate
}) => {
  const { siteSettings } = useApp();

  const handleQuickRoute = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const whatsappHref = buildWhatsappHref(
    siteSettings.whatsappNumber,
    'नमस्ते Sastafone Surat! मुझे WhatsApp पर मोबाइल रिपेयर / सेवा बुक करनी है।'
  );

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg pb-safe">
      {/* Direct Quick Action Strip */}
      <div className="bg-[#FEF2F2] border-b border-red-100 px-3 py-1 flex items-center justify-between text-[11px]">
        <button
          type="button"
          onClick={() => handleQuickRoute('/track')}
          className="inline-flex items-center gap-1 font-bold text-[#D5151B] cursor-pointer"
        >
          <Package className="w-3 h-3 text-[#D5151B]" />
          <span>ऑर्डर ट्रैक</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickRoute('/buy-phones')}
          className="inline-flex items-center gap-1 font-bold text-[#132032] hover:text-[#D5151B] cursor-pointer"
        >
          <ShoppingBag className="w-3 h-3 text-[#D5151B]" />
          <span>सर्टिफाइड फोन</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickRoute('/warranty')}
          className="inline-flex items-center gap-1 font-bold text-[#132032] hover:text-[#D5151B] cursor-pointer"
        >
          <ShieldCheck className="w-3 h-3 text-[#D5151B]" />
          <span>वारंटी</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickRoute('/contact')}
          className="font-bold text-[#132032] hover:text-[#D5151B] cursor-pointer"
        >
          संपर्क
        </button>
      </div>

      {/* Main 4 Tabs (Zero Login / Zero Dashboard) */}
      <nav className="flex items-center justify-around h-16 px-1">
        <button
          type="button"
          onClick={() => onTabChange('home')}
          className={`flex-1 flex flex-col items-center justify-center py-2 tap-target transition-colors duration-150 cursor-pointer ${
            currentTab === 'home' ? 'text-[#D5151B]' : 'text-gray-500 hover:text-[#132032]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px] font-bold mt-1">होम</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('repair')}
          className={`flex-1 flex flex-col items-center justify-center py-2 tap-target transition-colors duration-150 cursor-pointer ${
            currentTab === 'repair' ? 'text-[#D5151B]' : 'text-gray-500 hover:text-[#132032]'
          }`}
        >
          <Wrench className="w-5 h-5" />
          <span className="text-[11px] font-bold mt-1">रिपेयर</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('sell')}
          className={`flex-1 flex flex-col items-center justify-center py-2 tap-target transition-colors duration-150 cursor-pointer ${
            currentTab === 'sell' ? 'text-[#D5151B]' : 'text-gray-500 hover:text-[#132032]'
          }`}
        >
          <Smartphone className="w-5 h-5" />
          <span className="text-[11px] font-bold mt-1">फोन बेचें</span>
        </button>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('whatsapp_click', { source: 'bottom_tab' })}
          className="flex-1 flex flex-col items-center justify-center py-2 tap-target transition-colors duration-150 text-emerald-600 hover:text-emerald-700"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-[11px] font-bold mt-1">WhatsApp</span>
        </a>
      </nav>
    </div>
  );
};
