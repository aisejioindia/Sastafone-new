import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SastafoneLogo } from './SastafoneLogo';
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
    setIsBrandCentersModalOpen,
    user,
    setIsAuthModalOpen
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
                ? '🇮🇳 Sastafone Surat (sastafone.in) • सूरत में 2 घंटे में डोरस्टेप फोन पिकअप व होम रिपेयर'
                : '🇮🇳 Sastafone Surat (sastafone.in) • Fastest Doorstep Phone Pickup & Repair in Surat'}
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
        {/* Brand Logo & Compact Surat Locality Pin */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink min-w-0">
          <button
            onClick={() => {
              setActiveTab('sell');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="group text-left cursor-pointer transition-transform hover:scale-[1.02] shrink-0"
            title="Sastafone Surat - होमपेज"
          >
            <SastafoneLogo size="md" variant="light" showSubtitle={true} />
          </button>

          {/* Compact Surat Locality Pin Button */}
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-1 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-[11px] sm:text-xs font-semibold transition-all group cursor-pointer shrink-0"
            title="सूरत में अपनी लोकैलिटी बदलें"
          >
            <MapPin className="w-3 h-3 text-orange-500 shrink-0 group-hover:animate-bounce" />
            <span className="max-w-[65px] sm:max-w-[110px] truncate">{selectedLocality}</span>
            <span className="hidden sm:inline text-[9px] text-blue-600 font-bold bg-white px-1 rounded border border-blue-200">
              {language === 'hi' ? 'बदलें' : 'Change'}
            </span>
          </button>
        </div>

        {/* Center Service Switcher (Desktop) - 3 Core Services: Sell, Repair, SastaBazaar (With Buy inside) */}
        <nav className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 gap-1">
          <button
            onClick={() => setActiveTab('sell')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sell'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>📱</span>
            <span>{language === 'hi' ? 'पुराना फोन बेचें' : 'Sell Phone'}</span>
          </button>

          <button
            onClick={() => setActiveTab('repair')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'repair'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'घर पर रिपेयर' : 'Repair'}</span>
            <span className="bg-blue-100 text-blue-900 text-[9px] px-1 rounded font-bold">₹199</span>
          </button>

          {/* SastaBazaar Tab - Includes Buy (सर्टिफाइड व डील्स) Inside */}
          <button
            onClick={() => setActiveTab('bazaar')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'bazaar' || activeTab === 'buy'
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === 'hi' ? 'सस्ता बाज़ार (फोन खरीदें व डील्स)' : 'SastaBazaar (Buy Deals)'}</span>
            <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">₹99 / डील्स</span>
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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

          {!user.isLoggedIn ? (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer whitespace-nowrap shrink-0"
              title="100% मुफ़्त लॉगिन • कोई SMS शुल्क नहीं"
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>मुफ़्त लॉगिन</span>
            </button>
          ) : (
            <button
              onClick={() => setIsDashboardOpen(true)}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition-all cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span className="hidden md:inline">{user.name ? user.name.split(' ')[0] : 'डैशबोर्ड'}</span>
              {activeOrdersCount > 0 && (
                <span className="bg-orange-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {activeOrdersCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Subnav for 3 core services: Sell, Repair, SastaBazaar (Buy) */}
      <div className="lg:hidden border-t border-slate-200 bg-white grid grid-cols-3 text-center text-xs font-bold py-1 px-1.5 gap-1">
        <button
          onClick={() => setActiveTab('sell')}
          className={`py-1.5 rounded-lg transition-all text-xs font-bold ${
            activeTab === 'sell' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📱 फोन बेचें
        </button>
        <button
          onClick={() => setActiveTab('repair')}
          className={`py-1.5 rounded-lg transition-all text-xs font-bold ${
            activeTab === 'repair' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🔧 रिपेयर ₹199
        </button>
        <button
          onClick={() => setActiveTab('bazaar')}
          className={`py-1.5 rounded-lg transition-all text-xs font-black ${
            activeTab === 'bazaar' || activeTab === 'buy'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-amber-800 bg-amber-50'
          }`}
        >
          🏷️ सस्ता बाज़ार (खरीदें)
        </button>
      </div>
    </header>
  );
};
