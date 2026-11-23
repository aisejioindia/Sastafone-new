import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Users,
  Clock,
  ArrowRight,
  MessageCircle,
  MapPin,
  ChevronRight,
  Wrench,
  Smartphone,
  BatteryCharging,
  Zap,
  Droplets,
  Package,
  QrCode
} from 'lucide-react';
import { DIRECT_UPI_ID } from '../services/paymentService';
import { buildWhatsappHref } from '../services/siteSettingsService';
import { getPartnersFromFirestore } from '../services/firestoreRepairService';
import { trackEvent } from '../utils/analytics';
import heroRepairDeskImg from '../assets/images/sastafone_hero_repair_desk_1795441406851.jpg';

const QUICK_REPAIR_SHORTCUTS = [
  { id: 'display', labelEn: 'Screen & Display', labelHi: 'डिस्प्ले / टच', price: '₹1,299+', icon: Smartphone },
  { id: 'battery', labelEn: 'New Battery', labelHi: 'नई बैटरी', price: '₹899+', icon: BatteryCharging },
  { id: 'charging', labelEn: 'Charging Port', labelHi: 'चार्जिंग पोर्ट', price: '₹499+', icon: Zap },
  { id: 'liquid', labelEn: 'Water Damage', labelHi: 'वाटर डैमेज', price: '₹799+', icon: Droplets }
];

export const HeroSection: React.FC = () => {
  const {
    language,
    setActiveTab,
    siteSettings,
    selectedLocality,
    setIsLocationModalOpen
  } = useApp();

  const [activeTechCount, setActiveTechCount] = useState<number>(15);
  const [heroImgFailed, setHeroImgFailed] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    getPartnersFromFirestore()
      .then((partners) => {
        if (!mounted) return;
        const activeCount = partners.filter((p) => p.active !== false).length;
        if (activeCount >= 15) {
          setActiveTechCount(activeCount);
        }
      })
      .catch(() => {
        // Keep default verified Surat network count
      });
    return () => {
      mounted = false;
    };
  }, []);

  const navigatePath = (path: string, tab?: 'repair' | 'sell') => {
    if (tab) {
      setActiveTab(tab);
    }
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
    `नमस्ते Sastafone Surat! मुझे ${selectedLocality} क्षेत्र में डोरस्टेप मोबाइल रिपेयर (Instant WhatsApp Booking) बुक करना है।`
  );

  return (
    <section
      aria-label="Sastafone Doorstep Mobile Repair in Full Surat Area"
      className="bg-white border-b border-gray-100 pt-5 pb-8 sm:pt-9 sm:pb-12 lg:pt-12 lg:pb-14"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Main Responsive 2-Column Hero Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-10 items-stretch">
          {/* Left Column: SEO H1, Value Prop & Dual High-Converting CTAs */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left">
            {/* Clean Unboxed Metadata & Interactive Surat Area Switcher */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-semibold text-gray-500 mb-3.5">
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-[#D5151B] hover:text-[#B31419] font-bold transition-colors duration-150 cursor-pointer py-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5151B] rounded"
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[180px] sm:max-w-none">{selectedLocality}</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              </button>
              <span aria-hidden="true" className="text-gray-300">·</span>
              <span>
                {language === 'hi'
                  ? 'सूरत के सभी 16+ क्षेत्रों में डोरस्टेप सेवा'
                  : 'Covering 16+ Surat Zones'}
              </span>
              <span aria-hidden="true" className="hidden sm:inline text-gray-300">·</span>
              <span className="hidden sm:inline">
                {language === 'hi' ? 'बिना लॉगिन तुरंत बुकिंग' : 'No Login Needed'}
              </span>
            </div>

            {/* Prominent Local-SEO H1 */}
            <h1 className="text-[1.85rem] sm:text-4xl lg:text-[2.85rem] font-extrabold text-[#132032] tracking-tight leading-[1.14] mb-4">
              {language === 'hi' ? (
                <>
                  भरोसेमंद डोरस्टेप{' '}
                  <span className="text-[#D5151B]">Mobile Repair in Full Surat Area</span> — 2 घंटे में रिपेयर
                </>
              ) : (
                <>
                  Fast Doorstep{' '}
                  <span className="text-[#D5151B]">Mobile Repair in Full Surat Area</span> — Repaired in 2 Hours
                </>
              )}
            </h1>

            {/* Concrete Subheadline */}
            <p className="text-sm sm:text-base text-gray-600 max-w-xl leading-relaxed mb-6">
              {language === 'hi'
                ? 'अडाजण, वेसु, पाल, वराछा, कतारगाम, सिटीलाइट व पूरे सूरत में सर्टिफाइड टेक्नीशियन द्वारा घर बैठे पिकअप व डिलीवरी। ₹199 विज़िट टोकन फाइनल बिल में 100% एडजस्ट और ₹1,000+ पर 6 महीने की वारंटी।'
                : 'Certified technicians pick up, repair with quality-tested parts, and deliver back anywhere across Adajan, Vesu, Pal, Varachha, Katargam, and all of Surat. ₹199 visit token is 100% adjusted in your final bill.'}
            </p>

            {/* Two Distinct, High-Converting, Contrasting Touch-Friendly Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:max-w-xl mb-5">
              <button
                type="button"
                onClick={() => navigatePath('/repair/book', 'repair')}
                className="w-full min-h-[54px] px-5 py-3.5 rounded-2xl bg-[#D5151B] hover:bg-[#B31419] active:scale-[0.98] text-white font-bold text-sm sm:text-[15px] shadow-sm transition-all duration-150 inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5151B]"
              >
                <Wrench className="w-4 h-4 shrink-0" />
                <span>Book Pickup</span>
                <span className="text-red-100 font-semibold text-xs tabular-nums">· ₹199</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>

              <a
                href={whatsappDirectHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('whatsapp_click', { source: 'hero_instant_whatsapp' })}
                className="w-full min-h-[54px] px-5 py-3.5 rounded-2xl bg-[#059669] hover:bg-[#047857] active:scale-[0.98] text-white font-bold text-sm sm:text-[15px] shadow-sm transition-all duration-150 inline-flex items-center justify-center gap-2 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#059669]"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>Instant WhatsApp Booking</span>
              </a>
            </div>

            {/* Quiet Secondary Utility Links (Zero Visual Competition) */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-gray-600">
              <button
                type="button"
                onClick={() => navigatePath('/track')}
                className="inline-flex items-center gap-1.5 hover:text-[#D5151B] transition-colors duration-150 cursor-pointer py-1.5 min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5151B] rounded"
              >
                <Package className="w-3.5 h-3.5 text-[#D5151B] shrink-0" />
                <span>{language === 'hi' ? 'फोन नंबर से ऑर्डर ट्रैक करें' : 'Track Order by Phone'}</span>
              </button>

              <span aria-hidden="true" className="text-gray-300">·</span>

              <button
                type="button"
                onClick={() => navigatePath('/sell-phone', 'sell')}
                className="inline-flex items-center gap-1.5 hover:text-[#D5151B] transition-colors duration-150 cursor-pointer py-1.5 min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5151B] rounded"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#132032] shrink-0" />
                <span>{language === 'hi' ? 'पुराना फोन बेचें (तुरंत भुगतान)' : 'Sell Old Phone'}</span>
              </button>

              <span aria-hidden="true" className="hidden sm:inline text-gray-300">·</span>

              <span className="hidden sm:inline-flex items-center gap-1 text-gray-500 font-mono text-[11px]">
                <QrCode className="w-3.5 h-3.5 text-[#D5151B] shrink-0" />
                <span>UPI: {DIRECT_UPI_ID}</span>
              </span>
            </div>
          </div>

          {/* Right Column: App-Like Visual Card + Interactive Touch Quick-Repair Drawer */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="rounded-3xl border border-gray-200 bg-gray-50 overflow-hidden flex flex-col h-full">
              {/* High-Fidelity Repair Workbench Image with Measured Scrim & Fallback */}
              <div className="relative aspect-[4/3] lg:aspect-auto lg:flex-1 min-h-[210px] bg-[#132032] overflow-hidden">
                {!heroImgFailed ? (
                  <img
                    src={heroRepairDeskImg}
                    alt="Sastafone certified technician performing doorstep mobile screen and hardware repair in Surat"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#132032] via-[#1E2E46] to-[#2B171D] text-white">
                    <Wrench className="w-10 h-10 text-[#F87171] mb-2" />
                    <p className="text-sm font-bold">Sastafone Precision Lab — Surat</p>
                    <p className="text-xs text-gray-300 mt-1">11-Point QC & OEM-Grade Parts</p>
                  </div>
                )}

                {/* Measured Contrast Scrim for Overlaid Service Guarantee Caption */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#132032]/90 via-[#132032]/50 to-transparent px-4 pt-10 pb-3.5 text-white">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-medium text-gray-200">
                        {language === 'hi' ? 'सूरत सर्टिफाइड नेटवर्क' : 'Sastafone Certified Lab'}
                      </p>
                      <p className="text-sm font-bold leading-snug">
                        {language === 'hi'
                          ? '11-पॉइंट QC जांच के बाद ही रिपेयर'
                          : '11-Point QC Before Every Repair'}
                      </p>
                    </div>
                    <span className="text-xs font-bold tabular-nums text-white/95 shrink-0">
                      9:00 AM – 9:30 PM
                    </span>
                  </div>
                </div>
              </div>

              {/* Touch-Friendly App-Like Quick Issue Launcher */}
              <div className="p-4 bg-white border-t border-gray-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#132032]">
                    {language === 'hi' ? 'तुरंत समस्या चुनें (Tap to Book)' : 'Quick Issue Estimate'}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigatePath('/repair/book', 'repair')}
                    className="font-bold text-[#D5151B] hover:underline cursor-pointer"
                  >
                    {language === 'hi' ? 'सभी 16 सेवाएं' : 'All 16 Services'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {QUICK_REPAIR_SHORTCUTS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigatePath('/repair/book', 'repair')}
                        className="min-h-[48px] px-3 py-2 rounded-xl bg-gray-50 hover:bg-[#FEF2F2] active:scale-[0.98] border border-gray-200 hover:border-red-200 text-left transition-all duration-150 flex items-center justify-between gap-2 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5151B]"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className="w-4 h-4 text-[#D5151B] shrink-0" />
                          <span className="text-xs font-bold text-[#132032] truncate">
                            {language === 'hi' ? item.labelHi : item.labelEn}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-gray-500 tabular-nums shrink-0">
                          {item.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width Trust Indicators Strip (Service Guarantees & Active Technicians) */}
        <div className="mt-7 sm:mt-9 pt-6 border-t border-gray-200/80 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] text-[#D5151B] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-extrabold text-[#132032] tabular-nums leading-tight">
                {activeTechCount}+ Active
              </p>
              <p className="text-xs font-semibold text-gray-700 mt-0.5">
                {language === 'hi' ? 'सर्टिफाइड टेक्नीशियन' : 'Certified Technicians'}
              </p>
              <p className="text-[11px] text-gray-500">
                {language === 'hi' ? 'सूरत के सभी 16+ क्षेत्रों में' : 'Across all 16+ Surat areas'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-extrabold text-[#132032] tabular-nums leading-tight">
                6-Month
              </p>
              <p className="text-xs font-semibold text-gray-700 mt-0.5">
                {language === 'hi' ? 'सर्विस व पार्ट वारंटी' : 'Service Guarantee'}
              </p>
              <p className="text-[11px] text-gray-500">
                {language === 'hi' ? '₹1,000+ के हर रिपेयर बिल पर' : 'On repair bills of ₹1,000+'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] text-[#D5151B] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-extrabold text-[#132032] tabular-nums leading-tight">
                2-Hour Target
              </p>
              <p className="text-xs font-semibold text-gray-700 mt-0.5">
                {language === 'hi' ? 'डोरस्टेप पिकअप व डिलीवरी' : 'Doorstep Turnaround'}
              </p>
              <p className="text-[11px] text-gray-500">
                {language === 'hi' ? '60-मिनट के सुविधाजनक स्लॉट' : '60-min flexible pickup slots'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 text-[#132032] flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5 text-[#D5151B]" />
            </div>
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-extrabold text-[#132032] tabular-nums leading-tight">
                ₹199 Adjusted
              </p>
              <p className="text-xs font-semibold text-gray-700 mt-0.5">
                {language === 'hi' ? 'शून्य छिपा शुल्क गारंटी' : 'Zero Hidden Fee Policy'}
              </p>
              <p className="text-[11px] text-gray-500">
                {language === 'hi' ? 'QC के बाद मना करने पर ₹99 रिफंड' : '₹99 refund if declined after QC'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
