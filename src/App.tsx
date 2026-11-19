import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { BottomTabBar, TabType } from './components/BottomTabBar';
import { CustomerRepairBookingFlow } from './components/CustomerRepairBookingFlow';
import { SellPhoneFlow } from './components/SellPhoneFlow';
import { BuyPhonesInventoryView } from './components/BuyPhonesInventoryView';
import { WarrantyPage } from './components/WarrantyPage';
import { SuratAreaPage } from './components/SuratAreaPage';
import { MobileRepairSuratSeoPage } from './components/MobileRepairSuratSeoPage';
import { SellOldPhoneSuratSeoPage } from './components/SellOldPhoneSuratSeoPage';
import { BlogPlaceholderPage } from './components/BlogPlaceholderPage';
import { ContactPage } from './components/ContactPage';
import { LegalPage } from './components/LegalPage';
import { LocationSelectorModal } from './components/LocationSelectorModal';
import { LegalModals } from './components/LegalModals';
import { HappyCustomersSection } from './components/HappyCustomersSection';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { SuratLocalSeoSection } from './components/SuratLocalSeoSection';
import { Footer } from './components/Footer';
import { InvoiceModal } from './components/InvoiceModal';
import { UpiPaymentModal } from './components/UpiPaymentModal';
import { OrderStatusTracker } from './components/OrderStatusTracker';
import { SeoHead } from './components/SeoHead';
import {
  Wrench,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  MessageCircle,
  QrCode
} from 'lucide-react';
import { getRepairPricesFromFirestore } from './services/firestoreRepairService';
import { DIRECT_UPI_ID } from './services/paymentService';
import { buildWhatsappHref } from './services/siteSettingsService';
import { RepairPrice } from './types';
import { trackEvent } from './utils/analytics';

const HOME_FAQS = [
  {
    q: 'क्या बुकिंग के लिए वेबसाइट पर लॉगिन या अकाउंट बनाना जरूरी है?',
    a: 'नहीं! Sastafone Surat पर किसी भी प्रकार के लॉगिन, पासवर्ड या डैशबोर्ड की जरूरत नहीं है। आप सीधे मॉडल व समस्या चुनकर, ₹199 डायरेक्ट UPI पेमेंट (9372802044@idfcfirst) करके WhatsApp पर तुरंत बुकिंग व लाइव अपडेट पा सकते हैं।'
  },
  {
    q: '₹199 विज़िट टोकन कैसे काम करता है और QC के बाद मना करने पर क्या होगा?',
    a: 'बुकिंग करते समय 9372802044@idfcfirst पर दिया गया ₹199 विज़िट टोकन आपके फाइनल रिपेयर बिल में पूरी तरह एडजस्ट (माइनस) हो जाता है। यदि 11-पॉइंट QC और अंतिम कोटेशन देखने के बाद आप रिपेयर नहीं कराना चाहते, तो ₹99 रिफंड कर दिए जाते हैं (₹100 पिकअप/निरीक्षण शुल्क रखा जाता है)।'
  },
  {
    q: '6 महीने की वारंटी किस पर और कब मिलती है?',
    a: '₹1,000 या उससे अधिक के हर रिपेयर बिल पर बदले गए स्पेयर पार्ट और सर्विस पर 6 महीने की Sastafone वारंटी मिलती है। साथ ही हर सर्टिफाइड सेकंड-हैंड फोन के साथ 6 महीने की वारंटी शामिल होती है।'
  },
  {
    q: 'डोरस्टेप पिकअप और रिपेयर में कितना समय लगता है?',
    a: 'सूरत के सभी प्रमुख क्षेत्रों में आप 60-मिनट के सुविधाजनक पिकअप स्लॉट चुन सकते हैं। पिकअप और WhatsApp पर कोट अप्रूवल के बाद अधिकांश सामान्य रिपेयर 2 घंटे के डिलीवरी लक्ष्य (2-hour delivery target) में पूरे किए जाते हैं।'
  },
  {
    q: 'सूरत में किन क्षेत्रों में पिकअप व डिलीवरी सेवा उपलब्ध है?',
    a: 'अडाजण, वेसु, पाल, वराछा, कतारगाम, रांदेर, पिपलोद, सिटीलाइट, घोड़ दौड़ रोड, अलथान, उधना, डिंडोली, मोटा वराछा, जहांगीरपुरा और अमरोली सहित पूरे सूरत में सेवा उपलब्ध है।'
  }
];

function MainApp() {
  const {
    siteSettings,
    isPaymentModalOpen,
    paymentModalRequest,
    closePaymentModal
  } = useApp();

  // Current URL path state
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');

  // Bottom tab state (WhatsApp-first, zero login/dashboard tabs)
  const [currentTab, setCurrentTab] = useState<TabType>('home');

  // Live Firestore repair prices for home section
  const [homeRepairPrices, setHomeRepairPrices] = useState<RepairPrice[]>([]);
  const [isLoadingPrices, setIsLoadingPrices] = useState<boolean>(true);

  // Interactive FAQ state
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  // Listen to browser navigation (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname || '/';
      setCurrentPath(path);

      if (path === '/' || path === '') setCurrentTab('home');
      else if (path.startsWith('/repair')) setCurrentTab('repair');
      else if (path.startsWith('/sell-phone')) setCurrentTab('sell');
      else if (path.startsWith('/contact')) setCurrentTab('contact');
    };

    window.addEventListener('popstate', handlePopState);
    handlePopState();

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // GA4 page_view tracking on route changes
  useEffect(() => {
    trackEvent('page_view', { page_path: currentPath || '/' });
  }, [currentPath]);

  // Fetch live repairPrices from Firestore
  useEffect(() => {
    let active = true;
    setIsLoadingPrices(true);
    getRepairPricesFromFirestore()
      .then((list) => {
        if (!active) return;
        setHomeRepairPrices(list.filter((p) => p.active !== false));
        setIsLoadingPrices(false);
      })
      .catch(() => {
        if (!active) return;
        setIsLoadingPrices(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Navigate helper
  const navigateTo = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check if current route is an area page (/areas/:slug)
  const isAreaRoute = currentPath.startsWith('/areas/');
  const currentAreaSlug = isAreaRoute ? currentPath.replace('/areas/', '').split('/')[0] : '';

  // Check if buy phone detail route (/buy-phones/:slug)
  const isBuyDetailRoute = currentPath.startsWith('/buy-phones/') && currentPath !== '/buy-phones';
  const currentBuySlug = isBuyDetailRoute ? currentPath.replace('/buy-phones/', '').split('/')[0] : '';

  // Legacy dashboard/login routes redirected cleanly to WhatsApp Order Desk
  const isLegacyDashboardRoute =
    currentPath === '/profile' ||
    currentPath === '/admin' ||
    currentPath === '/partner';

  const isTrackOrderRoute = currentPath === '/track' || currentPath === '/orders';

  const whatsappStatusHref = buildWhatsappHref(
    siteSettings.whatsappNumber,
    'नमस्ते Sastafone Surat! मुझे अपने ऑर्डर / रिपेयर स्टेटस की जानकारी चाहिए।'
  );

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#132032] font-sans selection:bg-[#D5151B] selection:text-white pb-20">
      {/* Default Homepage Meta via SeoHead */}
      <SeoHead
        title="Sastafone Surat – Doorstep Mobile Repair, Sell & Buy Certified Phones"
        description="सूरत में बिना लॉगिन के सीधे WhatsApp व डायरेक्ट UPI (9372802044@idfcfirst) से डोरस्टेप फोन रिपेयर पिकअप व डिलीवरी (₹199 विज़िट टोकन), पुराना फोन बेचें और 6 माह वारंटी फोन।"
        canonicalPath="/"
      />

      {/* Top Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* ROUTE: /contact */}
        {currentPath === '/contact' && (
          <div className="step-transition">
            <ContactPage
              onNavigateHome={() => navigateTo('/')}
              onBookRepair={() => navigateTo('/repair')}
            />
          </div>
        )}

        {/* ROUTE: /terms */}
        {currentPath === '/terms' && (
          <div className="step-transition">
            <LegalPage
              type="terms"
              onNavigateHome={() => navigateTo('/')}
              onNavigateContact={() => navigateTo('/contact')}
            />
          </div>
        )}

        {/* ROUTE: /privacy */}
        {currentPath === '/privacy' && (
          <div className="step-transition">
            <LegalPage
              type="privacy"
              onNavigateHome={() => navigateTo('/')}
              onNavigateContact={() => navigateTo('/contact')}
            />
          </div>
        )}

        {/* ROUTE: /refund-policy */}
        {currentPath === '/refund-policy' && (
          <div className="step-transition">
            <LegalPage
              type="refund"
              onNavigateHome={() => navigateTo('/')}
              onNavigateContact={() => navigateTo('/contact')}
            />
          </div>
        )}

        {/* ROUTE: /warranty */}
        {currentPath === '/warranty' && (
          <WarrantyPage
            onNavigateHome={() => navigateTo('/')}
            onNavigateOrders={() => navigateTo('/contact')}
          />
        )}

        {/* ROUTE: /areas/:area */}
        {isAreaRoute && (
          <SuratAreaPage
            areaSlug={currentAreaSlug}
            onBookInArea={() => {
              navigateTo('/repair');
            }}
            onNavigateHome={() => navigateTo('/')}
          />
        )}

        {/* ROUTE: /mobile-repair-surat */}
        {currentPath === '/mobile-repair-surat' && (
          <MobileRepairSuratSeoPage
            onBookRepair={() => navigateTo('/repair')}
            onNavigateHome={() => navigateTo('/')}
          />
        )}

        {/* ROUTE: /sell-old-phone-surat */}
        {currentPath === '/sell-old-phone-surat' && (
          <SellOldPhoneSuratSeoPage
            onGoToSell={() => navigateTo('/sell-phone')}
            onNavigateHome={() => navigateTo('/')}
          />
        )}

        {/* ROUTE: /blog */}
        {currentPath === '/blog' && <BlogPlaceholderPage />}

        {/* ROUTE: /sell-phone */}
        {currentPath === '/sell-phone' && (
          <SellPhoneFlow onNavigateHome={() => navigateTo('/')} />
        )}

        {/* ROUTE: /buy-phones or /buy-phones/:slug */}
        {(currentPath === '/buy-phones' || isBuyDetailRoute) && (
          <BuyPhonesInventoryView
            initialSlug={currentBuySlug || undefined}
            onNavigateHome={() => navigateTo('/')}
          />
        )}

        {/* ROUTE: /repair or /repair/book */}
        {(currentPath === '/repair' || currentPath === '/repair/book') && (
          <div className="step-transition">
            <CustomerRepairBookingFlow />
          </div>
        )}

        {/* ROUTE: /track or /orders -> Zero-Login Phone Number Order Status Tracker */}
        {isTrackOrderRoute && (
          <div className="step-transition">
            <SeoHead
              title="Track Repair Order Status – Sastafone Surat"
              description="बिना लॉगिन के केवल अपना मोबाइल नंबर डालकर Sastafone Surat पर अपने मोबाइल रिपेयर का लाइव स्टेटस देखें।"
              canonicalPath="/track"
            />
            <OrderStatusTracker onBookNew={() => navigateTo('/repair')} />
          </div>
        )}

        {/* Legacy /profile, /admin, /partner -> Clean WhatsApp Direct Order Desk (No Login / No Dashboard) */}
        {isLegacyDashboardRoute && (
          <div className="max-w-lg mx-auto px-4 py-12 text-center step-transition">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <MessageCircle className="w-7 h-7" />
              </div>
              <h1 className="text-xl font-bold text-[#132032]">
                सीधे WhatsApp पर लाइव ऑर्डर स्टेटस पाएं
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                अब किसी वेबसाइट लॉगिन या डैशबोर्ड की जरूरत नहीं है। बुकिंग, ₹199 डायरेक्ट UPI पेमेंट (<strong className="font-mono text-[#132032]">{DIRECT_UPI_ID}</strong>) और रिपेयर का हर अपडेट सीधे आपके WhatsApp पर मिलेगा।
              </p>
              <div className="space-y-2.5 pt-2">
                <a
                  href={whatsappStatusHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors tap-target"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp पर स्टेटस पूछें</span>
                </a>
                <button
                  type="button"
                  onClick={() => navigateTo('/repair')}
                  className="w-full py-3 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer tap-target"
                >
                  नया रिपेयर पिकअप बुक करें (₹199)
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('/')}
                  className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#132032] font-bold text-xs transition-colors cursor-pointer"
                >
                  होम पर लौटें
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ROUTE: / (Home) */}
        {(currentPath === '/' || currentPath === '') && (
          <div className="step-transition">
            {/* Hero Section */}
            <HeroSection />

            {/* How It Works in 4 Clean Steps */}
            <section className="container mx-auto px-4 py-8 max-w-5xl">
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-6">
                  <div>
                    <span className="px-3 py-1 rounded-full bg-[#FEF2F2] text-[#D5151B] text-xs font-bold uppercase tracking-wider border border-red-200">
                      कैसे काम करता है (WhatsApp Fast Booking)
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#132032] mt-2">
                      बिना लॉगिन, 4 आसान चरणों में डोरस्टेप मोबाइल रिपेयर
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Sastafone Certified Technician Network द्वारा सूरत में सीधे WhatsApp व डायरेक्ट UPI सेवा।
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigateTo('/repair')}
                    className="px-5 py-3 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-xs sm:text-sm shadow-xs transition-colors duration-150 cursor-pointer flex items-center justify-center gap-2 shrink-0 tap-target"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>Book Pickup – ₹199</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* 4 Clean Steps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      step: '01',
                      title: 'मॉडल व समस्या चुनें',
                      desc: 'बिना लॉगिन के अपना फोन मॉडल, समस्या और पिकअप स्लॉट चुनें व लाइव अनुमानित खर्च देखें।'
                    },
                    {
                      step: '02',
                      title: 'डायरेक्ट UPI व WhatsApp',
                      desc: `सीधे UPI (${DIRECT_UPI_ID}) पर ₹199 टोकन पेमेंट करें और WhatsApp पर 1 क्लिक में कन्फर्म करें।`
                    },
                    {
                      step: '03',
                      title: 'डोरस्टेप पिकअप व QC',
                      desc: 'सर्टिफाइड पार्टनर आपके पते से फोन पिकअप कर 11-पॉइंट QC और WhatsApp पर फाइनल कोट भेजता है।'
                    },
                    {
                      step: '04',
                      title: '2-घंटे डिलीवरी लक्ष्य',
                      desc: 'रिपेयर व टेस्टिंग के बाद सुरक्षित डिलीवरी और ₹1,000+ बिल पर 6 महीने की वारंटी।'
                    }
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-red-200 transition-colors duration-150"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#FEF2F2] border border-red-200 text-[#D5151B] flex items-center justify-center font-bold text-xs mb-3">
                        {item.step}
                      </div>
                      <h3 className="text-sm font-bold text-[#132032] mb-1">{item.title}</h3>
                      <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Consistent Policy Strip */}
                <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap items-center justify-around gap-4 text-xs font-medium text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Sastafone Certified Technician Network</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-[#D5151B]" />
                    <span>Direct UPI: <strong className="font-mono text-[#132032]">{DIRECT_UPI_ID}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#D5151B]" />
                    <span>₹199 विज़िट टोकन फाइनल बिल में एडजस्टेड</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#132032]" />
                    <span>60-मिनट पिकअप स्लॉट व 2-घंटे डिलीवरी लक्ष्य</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Live Firestore Repair Price Cards */}
            <section className="container mx-auto px-4 py-6 max-w-5xl">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
                <div>
                  <span className="text-xs font-bold text-[#D5151B] uppercase tracking-wider">
                    लाइव रिपेयर रेट लिस्ट
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#132032] mt-1">
                    पारदर्शी रिपेयर कीमतें और समय
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigateTo('/repair')}
                  className="text-xs font-bold text-[#D5151B] hover:text-[#B31419] inline-flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                >
                  <span>सभी {homeRepairPrices.length > 0 ? homeRepairPrices.length : ''} सेवाएं देखें</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {isLoadingPrices ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((sk) => (
                    <div
                      key={sk}
                      className="p-4 rounded-xl border border-gray-200 bg-white space-y-3 animate-pulse"
                    >
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-full" />
                      <div className="h-5 bg-gray-200 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : homeRepairPrices.length === 0 ? (
                <div className="p-6 rounded-xl border border-gray-200 bg-white text-center text-xs text-gray-600">
                  रिपेयर रेट अभी लोड नहीं हुए हैं। कृपया बुकिंग पेज पर जाएं।
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {homeRepairPrices.slice(0, 8).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => navigateTo('/repair')}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') navigateTo('/repair');
                      }}
                      className="p-4 rounded-xl bg-white border border-gray-200 hover:border-[#D5151B]/50 hover:shadow-sm transition-all duration-150 cursor-pointer flex flex-col justify-between gap-3"
                    >
                      <div>
                        <h3 className="text-sm font-bold text-[#132032] leading-snug">
                          {item.name_hi}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {item.description_hi}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-sm font-bold text-[#D5151B] tabular-nums block">
                            ₹{item.minPrice} – ₹{item.maxPrice}
                          </span>
                          <span className="text-[11px] text-gray-500">
                            ~{item.serviceMinutes} मिनट • क्वालिटी पार्ट्स
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#132032] inline-flex items-center gap-0.5 shrink-0">
                          बुक <ArrowRight className="w-3 h-3 text-[#D5151B]" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Phone-Number Order Status Tracker (Zero Login) */}
            <OrderStatusTracker compact onBookNew={() => navigateTo('/repair')} />

            {/* Real Customer Reviews (Hidden until approved reviews exist) */}
            <HappyCustomersSection />

            {/* Interactive FAQ Accordion */}
            <section className="container mx-auto px-4 py-8 max-w-4xl">
              <div className="text-center mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF2F2] border border-red-200 text-[#D5151B] text-xs font-bold">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>अक्सर पूछे जाने वाले सवाल (FAQ)</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#132032] mt-2">
                  Sastafone सेवा से जुड़े सामान्य प्रश्न
                </h2>
              </div>

              <div className="space-y-2.5">
                {HOME_FAQS.map((faq, idx) => {
                  const isOpenFaq = openFaqIdx === idx;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-gray-200 bg-white overflow-hidden transition-colors duration-150"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIdx(isOpenFaq ? null : idx)}
                        aria-expanded={isOpenFaq}
                        className="w-full px-4 sm:px-5 py-4 text-left flex items-center justify-between gap-3 text-sm font-bold text-[#132032] hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-[#D5151B] shrink-0 transition-transform duration-150 ${
                            isOpenFaq ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpenFaq && (
                        <div className="px-4 sm:px-5 pb-4 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Surat Local Areas Directory */}
            <SuratLocalSeoSection />
          </div>
        )}
      </main>

      {/* Mobile-first WhatsApp Bottom Tab Bar */}
      <BottomTabBar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          if (tab === 'home') navigateTo('/');
          else if (tab === 'repair') navigateTo('/repair');
          else if (tab === 'sell') navigateTo('/sell-phone');
          else if (tab === 'contact') navigateTo('/contact');
        }}
        onNavigate={navigateTo}
      />

      {/* Lightweight Public Modals & Reusable Direct UPI Payment Modal */}
      <LocationSelectorModal />
      <LegalModals />
      <InvoiceModal />
      <UpiPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={closePaymentModal}
        amount={paymentModalRequest?.amount || 199}
        referenceId={paymentModalRequest?.targetListingId}
        title={paymentModalRequest?.titleHindi || paymentModalRequest?.title || 'तुरंत UPI पेमेंट कन्फर्मेशन'}
        subtitle={paymentModalRequest?.descriptionHindi || paymentModalRequest?.description || 'स्कैन करें या 9372802044@idfcfirst पर भुगतान करें'}
        serviceLabel={paymentModalRequest?.title}
        deviceModel={paymentModalRequest?.repairDetails?.modelName || paymentModalRequest?.targetListingTitle}
        problemsLabel={paymentModalRequest?.repairDetails?.issueName}
        slotLabel={paymentModalRequest?.repairDetails?.timeSlot}
        customerName={paymentModalRequest?.repairDetails?.customerName}
        customerPhone={paymentModalRequest?.repairDetails?.customerPhone}
        customerAddress={paymentModalRequest?.repairDetails?.address}
        whatsappNumber={siteSettings.whatsappNumber}
      />

      {/* Floating WhatsApp Support Button & Public Footer */}
      <WhatsAppFloatingButton />
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
