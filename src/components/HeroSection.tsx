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
              <span>🇮🇳 सस्ताफोन सूरत (sastaphone.in) • 100% प्रामाणिक व विश्वसनीय सेवा</span>
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

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mb-5 leading-relaxed">
            {language === 'hi'
              ? 'सूरत में पुराना फोन बेचें तुरंत नकद में, ₹199 में घर बैठे रिपेयर (बिल में एडजस्टेड), सर्टिफाइड सेकंड-हैंड फोन डील्स और सस्ता बाज़ार P2P मोबाइल मंडी।'
              : 'Sell old phones for instant cash, get doorstep repair at ₹199, buy certified refurbished phones, or trade directly on SastaBazaar in Surat.'}
          </p>

          {/* PREMIUM LIVE REPAIR & DIRECT PROBLEM SUPPORT BANNER */}
          <div className="max-w-4xl mx-auto mb-6 p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-xl shadow-red-600/20 border border-red-400/40 relative overflow-hidden text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black tracking-wide uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse" />
                  <span>सूरत डोरस्टेप रिपेयर • मात्र ₹199 विज़िट टोकन</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  फोन में कोई भी समस्या हो? 30 मिनट में घर बैठे ठीक कराएं!
                </h3>
                <p className="text-xs text-rose-100 leading-relaxed max-w-xl">
                  डिस्प्ले टूटा हो, बैटरी ड्रेन, कैमरा सेंसर ब्लर या चार्जिंग समस्या — 100% ओरिजिनल पार्ट्स, 90 दिन वारंटी व नो-फिक्स नो-फी (₹99 तुरंत रिफंड) गारंटी।
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('repair');
                    document.getElementById('repair-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-red-600 font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Wrench className="w-4 h-4 text-red-600" />
                  <span>रिपेयर बुक करें</span>
                </button>

                <a
                  href={`https://wa.me/919372802044?text=${encodeURIComponent(
                    'नमस्ते Sastafone Surat! मेरे फोन में समस्या है, मुझे रिपेयरिंग/बाय-बैक के लिए सीधे बात करनी है।'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-950 text-white font-bold text-xs sm:text-sm border border-white/20 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>💬 सीधे कनेक्ट करें</span>
                </a>
              </div>
            </div>
          </div>

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
                setActiveTab('sell');
                setTimeout(() => {
                  document.getElementById('dead-phone-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 80);
              }}
              className="flex items-center gap-1.5 bg-rose-50 text-rose-900 px-3.5 py-1.5 rounded-full border border-rose-300 shadow-2xs hover:bg-rose-100 cursor-pointer font-bold"
            >
              <span>♻️ डेड स्मार्टफोन बेचें (₹600 - ₹1,600 लास्ट)</span>
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
