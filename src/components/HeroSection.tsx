import React from 'react';
import { useApp } from '../context/AppContext';
import { Wrench, Smartphone, ShoppingBag, ShieldCheck, Clock, CheckCircle2, ArrowRight, MapPin } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { language, selectedLocality, setIsLocationModalOpen, setActiveTab } = useApp();

  const handleNavigate = (tab: any, path: string) => {
    setActiveTab(tab);
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="bg-white border-b border-gray-100 pt-6 pb-10">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Top Tag & Surat Locality Pill */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF2F2] border border-red-200 text-[#DC2626] text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sastafone Certified Technician Network</span>
            </span>

            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-medium cursor-pointer transition-colors"
            >
              <MapPin className="w-3 h-3 text-[#DC2626]" />
              <span>सूरत ({selectedLocality})</span>
              <span className="text-[10px] text-[#DC2626] font-bold underline ml-0.5">बदलें</span>
            </button>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-3">
            {language === 'hi' ? (
              <>
                सूरत में <span className="text-[#DC2626]">डोरस्टेप मोबाइल रिपेयरिंग</span>, फोन बेचें व खरीदें
              </>
            ) : (
              <>
                Doorstep Mobile Repair, Sell & Buy in <span className="text-[#DC2626]">Surat</span>
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {language === 'hi'
              ? 'सूरत के सभी इलाकों में सर्टिफाइड टेक नेटवर्क द्वारा सुरक्षित पिकअप और डिलीवरी। ₹199 विज़िट टोकन फाइनल बिल में एडजस्टेड और ₹1000+ के बिल पर 6 महीने वारंटी।'
              : 'Doorstep pickup & delivery across Surat. ₹199 visit fee adjusted in final bill, quality-checked parts and 6-month warranty on bills of ₹1000+.'}
          </p>
        </div>

        {/* Featured Action Banner (Light Red Theme) */}
        <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-[#FEF2F2] border border-red-200 text-gray-900 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-xl">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-white text-[#DC2626] text-[10px] font-extrabold uppercase border border-red-200">
                पिकअप व डिलीवरी सेवा
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                घर बैठे फोन रिपेयरिंग स्लॉट बुक करें
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                स्क्रीन, बैटरी, कैमरा, चार्जिंग या मदरबोर्ड — 11-पॉइंट ऑन-साइट QC के बाद पारदर्शी कोटेशन और सुरक्षित रिपेयरिंग।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleNavigate('repair', '/repair')}
                className="px-5 py-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-sm shadow-xs transition-colors flex items-center gap-2 cursor-pointer tap-target"
              >
                <Wrench className="w-4 h-4" />
                <span>रिपेयरिंग बुक करें (₹199)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* 3 Core Interactive Service Cards (No SastaBazaar) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Repair */}
          <div
            onClick={() => handleNavigate('repair', '/repair')}
            role="button"
            tabIndex={0}
            className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-red-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              मोबाइल रिपेयरिंग (Repair)
            </h3>
            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              सूरत में डोरस्टेप पिकअप। ₹199 टोकन फाइनल बिल में एडजस्टेड; QC बाद मना करने पर ₹99 रिफंड।
            </p>
            <span className="text-xs font-bold text-[#DC2626] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              स्लॉट चुनें <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 2: Sell Old Phone */}
          <div
            onClick={() => handleNavigate('sell', '/sell-phone')}
            role="button"
            tabIndex={0}
            className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-red-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              पुराना फोन बेचें (Sell Phone)
            </h3>
            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              फोन मॉडल व कंडीशन दर्ज करें, अनुमानित भाव देखें और डोरस्टेप पिकअप व तुरंत भुगतान पाएं।
            </p>
            <span className="text-xs font-bold text-[#DC2626] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              भाव चेक करें <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 3: Buy Certified Phones */}
          <div
            onClick={() => handleNavigate('buy', '/buy-phones')}
            role="button"
            tabIndex={0}
            className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-red-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">
              सर्टिफाइड फोन खरीदें (Buy)
            </h3>
            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              क्वालिटी-चेक्ड सेकंड-हैंड स्मार्टफोन, पारदर्शी ग्रेडिंग और 6 महीने वारंटी के साथ उपलब्ध।
            </p>
            <span className="text-xs font-bold text-[#DC2626] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              स्टॉक देखें <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-around gap-4 text-xs font-medium text-gray-600">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Sastafone Certified Technician Network</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span>₹1000+ के बिल पर 6 महीने वारंटी</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500 shrink-0" />
            <span>सूरत डोरस्टेप पिकअप व डिलीवरी</span>
          </div>
        </div>
      </div>
    </section>
  );
};
