import React from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Phone, ShieldCheck, Sparkles, User, ShoppingBag, Wrench, ArrowRight, MessageCircle, Building2, Tag, Star, SlidersHorizontal } from 'lucide-react';
import { SASTAPHONE_PHONE, WHATSAPP_NUMBER } from '../data/mockData';
import { generateWhatsAppLink } from '../utils/valuation';

export const Header: React.FC = () => {
  const {
    language,
    setLanguage,
    selectedLocality,
    setIsLocationModalOpen,
    orders,
    setIsDashboardOpen,
    activeTab,
    setActiveTab,
    setIsBrandCentersModalOpen
  } = useApp();

  const activeOrdersCount = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Surat Service & Redirection Alert Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white text-xs px-3 py-1.5 font-medium flex items-center justify-between">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="bg-amber-400 text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
              Surat Exclusive
            </span>
            <span className="hidden sm:inline">
              {language === 'hi'
                ? '🇮🇳 Sastaphone Surat (sastaphone.in) • सूरत में 2 घंटे में डोरस्टेप फोन पिकअप व होम रिपेयर'
                : '🇮🇳 Sastaphone Surat (sastaphone.in) • Fastest Doorstep Phone Pickup & Repair in Surat'}
            </span>
            <span className="sm:hidden">
              {language === 'hi' ? '🇮🇳 सस्ताफोन सूरत • 2 घंटे में डोरस्टेप सर्विस' : '🇮🇳 Sastaphone Surat Doorstep'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsBrandCentersModalOpen(true)}
              className="hidden md:inline-flex items-center gap-1 text-[11px] text-amber-300 hover:text-white font-bold transition-colors cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>सूरत के ब्रांड सर्विस सेंटर</span>
            </button>

            <div className="flex items-center bg-blue-900/60 rounded-full p-0.5 border border-blue-400/30">
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 py-0.5 text-[11px] rounded-full font-semibold transition-all ${
                  language === 'hi' ? 'bg-amber-400 text-slate-900 shadow-xs' : 'text-blue-100 hover:text-white'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 text-[11px] rounded-full font-semibold transition-all ${
                  language === 'en' ? 'bg-amber-400 text-slate-900 shadow-xs' : 'text-blue-100 hover:text-white'
                }`}
              >
                ENG
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setActiveTab('sell');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 group text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-700 to-amber-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <span className="text-xl font-black tracking-tighter">S📱</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-slate-900 tracking-tight">Sasta<span className="text-blue-600">phone</span></span>
                <span className="text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200 px-1.5 py-0.2 rounded-full">
                  सस्ताफोन
                </span>
              </div>
              <p className="text-[10px] text-blue-700 font-bold">सूरत का नंबर 1 मोबाइल हब (sastaphone.in)</p>
            </div>
          </button>

          {/* Surat Locality Pin Button */}
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs font-semibold transition-all group cursor-pointer"
            title="सूरत में अपनी लोकैलिटी चुनें"
          >
            <MapPin className="w-3.5 h-3.5 text-orange-500 group-hover:animate-bounce" />
            <span className="max-w-[110px] truncate">{selectedLocality}</span>
            <span className="text-[10px] text-blue-600 font-bold bg-white px-1 rounded border border-blue-200">
              {language === 'hi' ? 'बदलें' : 'Change'}
            </span>
          </button>
        </div>

        {/* Center Service Switcher (Desktop) */}
        <nav className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 gap-0.5">
          <button
            onClick={() => setActiveTab('sell')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sell'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>📱</span>
            <span>{language === 'hi' ? 'पुराना फोन बेचें' : 'Sell Phone'}</span>
          </button>

          <button
            onClick={() => setActiveTab('buy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'buy'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'सर्टिफाइड खरीदें' : 'Buy Phone'}</span>
            <span className="bg-amber-400 text-slate-900 text-[9px] px-1 rounded-full font-black">डील्स</span>
          </button>

          <button
            onClick={() => setActiveTab('repair')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'repair'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'घर पर रिपेयर' : 'Repair'}</span>
            <span className="bg-blue-100 text-blue-900 text-[9px] px-1 rounded font-bold">₹199</span>
          </button>

          {/* New SastaBazaar Direct Tab */}
          <button
            onClick={() => setActiveTab('bazaar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'bazaar'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-amber-500" />
            <span>सस्ता बाज़ार</span>
            <span className="bg-emerald-500 text-white text-[9px] px-1 rounded-full font-black">₹99</span>
          </button>

        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          <a
            href={generateWhatsAppLink('general', { locality: selectedLocality })}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow-emerald-500/20 transition-all"
            title="Sastaphone सूरत 24x7 सपोर्ट डेस्क"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>सूरत हेल्पलाइन</span>
          </a>

          <button
            onClick={() => {
              const el = document.getElementById('happy-customers');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition-all cursor-pointer"
            title="सूरत ग्राहकों के रिव्यू व रेटिंग्स"
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>रिव्यू (4.9★)</span>
          </button>

          <button
            onClick={() => setIsDashboardOpen(true)}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition-all cursor-pointer"
          >
            <User className="w-4 h-4" />
            <span className="hidden md:inline">{language === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}</span>
            {activeOrdersCount > 0 && (
              <span className="bg-orange-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {activeOrdersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Subnav for 4 core services */}
      <div className="lg:hidden border-t border-slate-200 bg-white grid grid-cols-4 text-center text-xs font-bold py-1 px-1.5 gap-1">
        <button
          onClick={() => setActiveTab('sell')}
          className={`py-1.5 rounded-lg transition-all text-[11px] ${
            activeTab === 'sell' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📱 बेचें
        </button>
        <button
          onClick={() => setActiveTab('buy')}
          className={`py-1.5 rounded-lg transition-all text-[11px] ${
            activeTab === 'buy' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🛒 खरीदें
        </button>
        <button
          onClick={() => setActiveTab('repair')}
          className={`py-1.5 rounded-lg transition-all text-[11px] ${
            activeTab === 'repair' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🔧 रिपेयर
        </button>
        <button
          onClick={() => setActiveTab('bazaar')}
          className={`py-1.5 rounded-lg transition-all text-[11px] font-black ${
            activeTab === 'bazaar' ? 'bg-amber-500 text-slate-950' : 'text-amber-700 bg-amber-50'
          }`}
        >
          🏷️ सस्ता बाज़ार
        </button>
      </div>
    </header>
  );
};
