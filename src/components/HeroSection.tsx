import React from 'react';
import { useApp } from '../context/AppContext';
import { Smartphone, ShoppingBag, Wrench, ShieldCheck, Zap, Truck, CheckCircle2, Tag, Building2, SlidersHorizontal } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { language, activeTab, setActiveTab, selectedLocality, setIsLocationModalOpen, setIsBrandCentersModalOpen } = useApp();

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 pt-6 pb-8 border-b border-slate-200/60">
      <div className="container mx-auto px-4">
        {/* Surat Badge & Tagline */}
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 text-emerald-900 text-[11px] font-black shadow-2xs">
              <span>🇮🇳 AllIndia.si (aisiindia) का अटूट भरोसा • 100% भारतीय कंपनी</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-blue-200 shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold text-slate-800">
                {language === 'hi'
                  ? `⚡ सूरत's #1 डोरस्टेप सर्विस (${selectedLocality})`
                  : `⚡ Surat's #1 Doorstep Service (${selectedLocality})`}
              </span>
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="text-[11px] text-blue-600 font-bold underline hover:text-blue-800 cursor-pointer"
              >
                {language === 'hi' ? 'बदलें' : 'Change'}
              </button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-3">
            {language === 'hi' ? (
              <>
                पुराना फोन बेचें, खरीदें या <span className="text-blue-600">घर बैठे रिपेयर</span> करवाएं!
              </>
            ) : (
              <>
                Sell, Buy or <span className="text-blue-600">Repair Mobile</span> at Your Doorstep in Surat!
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mb-6 leading-relaxed">
            {language === 'hi'
              ? 'बिना टाइप किए 100% क्लिकेबल AI वैल्यूएशन, ₹199 में डोरस्टेप रिपेयर (बिल में एडजस्टेड) और "सस्ता बाज़ार" डायरेक्ट मोबाइल मंडी।'
              : 'Zero-typing 100% clickable valuation, doorstep repair with ₹199 token, and SastaBazaar direct mobile trade.'}
          </p>

          {/* 4 Main Interactive Service Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto text-left">
            {/* Card 1: Sell Old Phone */}
            <div
              onClick={() => {
                setActiveTab('sell');
                document.getElementById('sell-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              role="button"
              tabIndex={0}
              className={`group p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                activeTab === 'sell'
                  ? 'bg-white border-blue-600 shadow-lg shadow-blue-500/10 ring-2 ring-blue-600/20'
                  : 'bg-white/90 border-slate-200 hover:border-blue-400 hover:shadow-md'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <Smartphone className="w-5 h-5" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
                {language === 'hi' ? 'पुराना फोन बेचें' : 'Sell Phone'}
              </h2>
              <p className="text-[11px] text-slate-500 line-clamp-2 mb-2">
                AI वैल्यूएशन व 2 घंटे में सूरत में होम पिकअप।
              </p>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                Instant Cash
              </span>
            </div>

            {/* Card 2: Buy Old Phone */}
            <div
              onClick={() => {
                setActiveTab('buy');
                document.getElementById('buy-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              role="button"
              tabIndex={0}
              className={`group p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                activeTab === 'buy'
                  ? 'bg-white border-blue-600 shadow-lg shadow-blue-500/10 ring-2 ring-blue-600/20'
                  : 'bg-white/90 border-slate-200 hover:border-blue-400 hover:shadow-md'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
                {language === 'hi' ? 'सर्टिफाइड खरीदें' : 'Buy Refurbished'}
              </h2>
              <p className="text-[11px] text-slate-500 line-clamp-2 mb-2">
                टॉप 10 सेकंड-हैंड डील्स, 6 महीने वारंटी सहित।
              </p>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                दिवाली धमाका
              </span>
            </div>

            {/* Card 3: Repairing to Home Service */}
            <div
              onClick={() => {
                setActiveTab('repair');
                document.getElementById('repair-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              role="button"
              tabIndex={0}
              className={`group p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                activeTab === 'repair'
                  ? 'bg-white border-blue-600 shadow-lg shadow-blue-500/10 ring-2 ring-blue-600/20'
                  : 'bg-white/90 border-slate-200 hover:border-blue-400 hover:shadow-md'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <Wrench className="w-5 h-5" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
                {language === 'hi' ? 'घर पर रिपेयर' : 'Doorstep Repair'}
              </h2>
              <p className="text-[11px] text-slate-500 line-clamp-2 mb-2">
                ₹199 विज़िट टोकन (बिल में एडजस्ट, ₹99 रिफंड)।
              </p>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                30 Mins Doorstep
              </span>
            </div>

            {/* Card 4: SastaBazaar Direct P2P Hook */}
            <div
              onClick={() => {
                setActiveTab('bazaar');
                document.getElementById('bazaar-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              role="button"
              tabIndex={0}
              className={`group p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                activeTab === 'bazaar'
                  ? 'bg-white border-amber-500 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/20'
                  : 'bg-white/90 border-slate-200 hover:border-amber-400 hover:shadow-md'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                <Tag className="w-5 h-5" />
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
                {language === 'hi' ? 'सस्ता बाज़ार' : 'SastaBazaar'}
              </h2>
              <p className="text-[11px] text-slate-500 line-clamp-2 mb-2">
                डायरेक्ट ग्राहक से ग्राहक, 0% ब्रोकरेज व नंबर प्राइवेसी।
              </p>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                ₹99 Direct Ad
              </span>
            </div>
          </div>

          {/* Surat Trust Pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200/80 shadow-2xs">
              <Truck className="w-4 h-4 text-blue-600" />
              {language === 'hi' ? 'सूरत के सभी 17+ हब्स में 2 घंटे में सर्विस' : '2-Hour Surat Coverage'}
            </span>
            <button
              onClick={() => setIsBrandCentersModalOpen(true)}
              className="flex items-center gap-1.5 bg-blue-50 text-blue-800 px-3 py-1.5 rounded-full border border-blue-200 shadow-2xs hover:bg-blue-100 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>सूरत अधिकृत ब्रांड सर्विस सेंटर डायरेक्टरी</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('buy');
                setTimeout(() => {
                  document.getElementById('mobile-finder')?.scrollIntoView({ behavior: 'smooth' });
                }, 80);
              }}
              className="flex items-center gap-1.5 bg-amber-50 text-amber-900 px-3.5 py-1.5 rounded-full border border-amber-300 shadow-2xs hover:bg-amber-100 cursor-pointer font-bold"
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-600" />
              <span>🔍 बजट मोबाइल फाइंडर (Price Slider)</span>
            </button>
            <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-slate-200/80 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              {language === 'hi' ? '100% डेटा वाइप व फेयर यूज़ पॉलिसी' : 'Certified Fair Use Policy'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
