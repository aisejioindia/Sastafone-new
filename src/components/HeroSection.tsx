import React from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Truck,
  Clock,
  QrCode,
  ArrowRight,
  MessageCircle
} from 'lucide-react';
import { DIRECT_UPI_ID } from '../services/paymentService';
import { buildWhatsappHref } from '../services/siteSettingsService';
import { trackEvent } from '../utils/analytics';

export const HeroSection: React.FC = () => {
  const { language, setActiveTab, siteSettings } = useApp();

  const handleNavigate = (tab: 'repair' | 'sell', path: string) => {
    setActiveTab(tab);
    if (tab === 'repair') {
      trackEvent('book_repair_start', { source: 'hero_cta' });
    }
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappDirectHref = buildWhatsappHref(
    siteSettings.whatsappNumber,
    'नमस्ते Sastafone Surat! मुझे अपने मोबाइल का डोरस्टेप रिपेयर / सेवा WhatsApp पर बुक करनी है।'
  );

  return (
    <section className="bg-white border-b border-gray-100 pt-8 pb-10 sm:pt-12 sm:pb-14">
      <div className="container mx-auto px-4 max-w-4xl text-center">
        {/* Single Clear Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#132032] tracking-tight leading-tight mb-4">
          {language === 'hi' ? (
            <>
              सूरत में <span className="text-[#D5151B]">डोरस्टेप मोबाइल रिपेयर</span> — सीधे WhatsApp पर बुकिंग
            </>
          ) : (
            <>
              Doorstep Mobile Repair in <span className="text-[#D5151B]">Surat</span> — Instant WhatsApp Booking
            </>
          )}
        </h1>

        {/* Single Clear Sub-Line */}
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed mb-7">
          {language === 'hi'
            ? 'कोई लॉगिन या अकाउंट की जरूरत नहीं — मॉडल व समस्या चुनें, ₹199 डायरेक्ट UPI पेमेंट करें और सीधे WhatsApp पर लाइव अपडेट पाएं।'
            : 'No login or account needed — select your phone issue, pay ₹199 via Direct UPI, and get live updates straight on WhatsApp.'}
        </p>

        {/* Clean Action CTAs: Repair + Direct WhatsApp + Sell */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <button
            type="button"
            onClick={() => handleNavigate('repair', '/repair/book')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-sm shadow-sm transition-all duration-150 inline-flex items-center justify-center gap-2 cursor-pointer tap-target"
          >
            <span>Book Pickup – ₹199</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href={whatsappDirectHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('whatsapp_click', { source: 'hero_cta' })}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all duration-150 inline-flex items-center justify-center gap-2 tap-target"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{language === 'hi' ? 'सीधे WhatsApp पर बुक करें' : 'Book on WhatsApp'}</span>
          </a>

          <button
            type="button"
            onClick={() => handleNavigate('sell', '/sell-phone')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-[#FEF2F2] border border-gray-200 hover:border-red-200 text-[#132032] font-bold text-sm transition-all duration-150 inline-flex items-center justify-center gap-2 cursor-pointer tap-target"
          >
            <span>{language === 'hi' ? 'पुराना फोन बेचें' : 'Sell Old Phone'}</span>
          </button>
        </div>

        {/* Clean 4-Item Trust Strip with Line Icons Only (No Emojis) */}
        <div className="pt-6 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left sm:text-center">
          <div className="flex sm:flex-col items-center gap-2.5 sm:gap-1.5">
            <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] text-[#D5151B] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#132032]">6-Month Warranty</p>
              <p className="text-[11px] text-gray-500">On bills of ₹1000+</p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center gap-2.5 sm:gap-1.5">
            <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] text-[#D5151B] flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#132032]">Doorstep Pickup</p>
              <p className="text-[11px] text-gray-500">Pickup & delivery in Surat</p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center gap-2.5 sm:gap-1.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#132032]">No Login • WhatsApp Live</p>
              <p className="text-[11px] text-gray-500">2-Hour delivery target</p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center gap-2.5 sm:gap-1.5">
            <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] text-[#D5151B] flex items-center justify-center shrink-0">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#132032]">Direct UPI Payment</p>
              <p className="text-[11px] text-gray-500 font-mono">{DIRECT_UPI_ID}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
