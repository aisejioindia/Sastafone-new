import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { BottomTabBar, TabType } from './components/BottomTabBar';
import { CustomerRepairBookingFlow } from './components/CustomerRepairBookingFlow';
import { MyOrdersTimeline } from './components/MyOrdersTimeline';
import { ProfileView } from './components/ProfileView';
import { AdminControlRoom } from './components/admin/AdminControlRoom';
import { PartnerPortalView } from './components/PartnerPortalView';
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
import { FirebaseAuthModal } from './components/FirebaseAuthModal';
import { InvoiceModal } from './components/InvoiceModal';
import { SeoHead } from './components/SeoHead';
import {
  Wrench,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  Lock,
  ChevronDown,
  HelpCircle
} from 'lucide-react';
import {
  subscribeToCustomerJobs,
  getRepairPricesFromFirestore
} from './services/firestoreRepairService';
import { Job, RepairPrice } from './types';
import { trackEvent } from './utils/analytics';

const HOME_FAQS = [
  {
    q: '₹199 विज़िट टोकन कैसे काम करता है और QC के बाद मना करने पर क्या होगा?',
    a: 'बुकिंग करते समय लिया गया ₹199 विज़िट टोकन आपके फाइनल रिपेयर बिल में पूरी तरह एडजस्ट (माइनस) हो जाता है। यदि 11-पॉइंट QC और अंतिम कोटेशन देखने के बाद आप रिपेयर नहीं कराना चाहते, तो ₹99 रिफंड कर दिए जाते हैं (₹100 पिकअप/निरीक्षण शुल्क रखा जाता है)।'
  },
  {
    q: '6 महीने की वारंटी किस पर और कब मिलती है?',
    a: '₹1,000 या उससे अधिक के हर रिपेयर बिल पर बदले गए स्पेयर पार्ट और सर्विस पर 6 महीने की Sastafone वारंटी मिलती है। साथ ही हर सर्टिफाइड सेकंड-हैंड फोन के साथ 6 महीने की वारंटी शामिल होती है।'
  },
  {
    q: 'डोरस्टेप पिकअप और रिपेयर में कितना समय लगता है?',
    a: 'सूरत के सभी प्रमुख क्षेत्रों में आप 60-मिनट के सुविधाजनक पिकअप स्लॉट चुन सकते हैं। पिकअप और ग्राहक कोट अप्रूवल के बाद अधिकांश सामान्य रिपेयर 2 घंटे के डिलीवरी लक्ष्य (2-hour delivery target) में पूरे किए जाते हैं।'
  },
  {
    q: 'सूरत में किन क्षेत्रों में पिकअप व डिलीवरी सेवा उपलब्ध है?',
    a: 'अडाजण, वेसु, पाल, वराछा, कतारगाम, रांदेर, पिपलोद, सिटीलाइट, घोड़ दौड़ रोड, अलथान, उधना, डिंडोली, मोटा वराछा, जहांगीरपुरा और अमरोली सहित पूरे सूरत में सेवा उपलब्ध है।'
  },
  {
    q: 'रिपेयर के दौरान मेरा फोन और डेटा कैसे सुरक्षित रहता है?',
    a: 'हर डिवाइस को पिकअप पर 11-पॉइंट QC और फोटो लॉगिंग के बाद सीलबंद बैग (Sealed Bag ID) के साथ Sastafone Certified Technician Network को सौंपा जाता है, और किसी भी ग्राहक का निजी फोन नंबर पार्टनर से साझा नहीं किया जाता।'
  }
];

function MainApp() {
  const { user, setIsAuthModalOpen, authClaimsLoading } = useApp();

  // Current URL path state
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');

  // Bottom tab state
  const [currentTab, setCurrentTab] = useState<TabType>('home');

  // Active customer jobs count for live badge
  const [activeJobsCount, setActiveJobsCount] = useState<number>(0);

  // Live Firestore repair prices for home section
  const [homeRepairPrices, setHomeRepairPrices] = useState<RepairPrice[]>([]);
  const [isLoadingPrices, setIsLoadingPrices] = useState<boolean>(true);

  // Interactive FAQ state
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const isVerifiedAdmin = Boolean(user.isLoggedIn && user.isAdmin && user.role === 'admin');
  const isVerifiedPartner = Boolean(user.isLoggedIn && user.isPartner && user.role === 'partner');

  // Listen to browser navigation (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname || '/';
      setCurrentPath(path);

      if (path === '/' || path === '') setCurrentTab('home');
      else if (path.startsWith('/repair')) setCurrentTab('repair');
      else if (path === '/orders') setCurrentTab('orders');
      else if (path === '/profile') setCurrentTab('profile');
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

  // Subscribe to customer jobs for live badge in bottom bar
  useEffect(() => {
    if (!user.isLoggedIn || !user.uid) {
      setActiveJobsCount(0);
      return;
    }
    const unsubscribe = subscribeToCustomerJobs(user.uid, (jobs: Job[]) => {
      const active = jobs.filter(
        (j) => j.status !== 'Delivered' && j.status !== 'Declined' && j.status !== 'Cancelled'
      ).length;
      setActiveJobsCount(active);
    });
    return () => unsubscribe();
  }, [user.isLoggedIn, user.uid]);

  // Check if current route is an area page (/areas/:slug)
  const isAreaRoute = currentPath.startsWith('/areas/');
  const currentAreaSlug = isAreaRoute ? currentPath.replace('/areas/', '').split('/')[0] : '';

  // Check if buy phone detail route (/buy-phones/:slug)
  const isBuyDetailRoute = currentPath.startsWith('/buy-phones/') && currentPath !== '/buy-phones';
  const currentBuySlug = isBuyDetailRoute ? currentPath.replace('/buy-phones/', '').split('/')[0] : '';

  const isInsideControlRoom = currentPath === '/admin' && isVerifiedAdmin && !authClaimsLoading;
  const isInsidePartnerPortal = currentPath === '/partner' && isVerifiedPartner && !authClaimsLoading;
  const isFullScreenDesk = isInsideControlRoom || isInsidePartnerPortal;

  return (
    <div
      className={`min-h-screen flex flex-col bg-white text-[#132032] font-sans selection:bg-[#D5151B] selection:text-white ${
        isFullScreenDesk ? '' : 'pb-20'
      }`}
    >
      {/* Default Homepage Meta via SeoHead */}
      <SeoHead
        title="Sastafone Surat – Doorstep Mobile Repair, Sell & Buy Certified Phones"
        description="सूरत में Sastafone Certified Technician Network द्वारा डोरस्टेप फोन रिपेयर पिकअप व डिलीवरी (₹199 विज़िट टोकन), पुराना फोन बेचें और 6 माह वारंटी फोन।"
        canonicalPath="/"
      />

      {/* Top Header (Hidden inside full-screen Admin Control Room / Partner Portal) */}
      {!isFullScreenDesk && <Header />}

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
            onNavigateOrders={() => navigateTo('/orders')}
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
          <SellPhoneFlow
            onRequestCreated={() => {
              navigateTo('/orders');
            }}
            onNavigateHome={() => navigateTo('/')}
          />
        )}

        {/* ROUTE: /buy-phones or /buy-phones/:slug */}
        {(currentPath === '/buy-phones' || isBuyDetailRoute) && (
          <BuyPhonesInventoryView
            initialSlug={currentBuySlug || undefined}
            onNavigateHome={() => navigateTo('/')}
          />
        )}

        {/* ROUTE: /orders */}
        {currentPath === '/orders' && (
          <div className="step-transition">
            <MyOrdersTimeline onBookNew={() => navigateTo('/repair')} />
          </div>
        )}

        {/* ROUTE: /profile */}
        {currentPath === '/profile' && (
          <div className="step-transition">
            <ProfileView
              onOpenAdmin={() => navigateTo('/admin')}
              onOpenPartner={() => navigateTo('/partner')}
              onNavigateToOrders={() => navigateTo('/orders')}
              onNavigateToRepair={() => navigateTo('/repair')}
            />
          </div>
        )}

        {/* ROUTE: /repair or /repair/book */}
        {(currentPath === '/repair' || currentPath === '/repair/book') && (
          <div className="step-transition">
            <CustomerRepairBookingFlow
              onJobCreated={() => {
                navigateTo('/orders');
              }}
              onNavigateToOrders={() => {
                navigateTo('/orders');
              }}
            />
          </div>
        )}

        {/* ROUTE: /admin (Email-locked Admin Control Room; plain 403 Access Denied + noindex for non-admins) */}
        {currentPath === '/admin' && (
          <>
            <SeoHead
              title={isVerifiedAdmin ? 'Admin Control Room | Sastafone' : '403 Access Denied | Sastafone'}
              description="Restricted Sastafone administration desk"
              canonicalPath="/admin"
              noindex
            />
            {authClaimsLoading ? (
              <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center gap-3">
                <div className="w-8 h-8 border-2 border-[#D5151B] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-medium text-gray-500">Verifying session access...</p>
              </div>
            ) : isVerifiedAdmin ? (
              <AdminControlRoom onNavigatePublicHome={() => navigateTo('/')} />
            ) : (
              <div className="min-h-[60vh] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white p-6 rounded-2xl border border-gray-200 shadow-xs text-center space-y-3">
                  <div className="w-11 h-11 rounded-xl bg-[#FEF2F2] text-[#D5151B] flex items-center justify-center mx-auto">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h1 className="text-lg font-bold text-[#132032]">403 — Access Denied</h1>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    You do not have permission to view this page.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    {!user.isLoggedIn && (
                      <button
                        type="button"
                        onClick={() => setIsAuthModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Sign In
                      </button>
                    )}
                    {isVerifiedPartner && (
                      <button
                        type="button"
                        onClick={() => navigateTo('/partner')}
                        className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Open Partner Portal
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => navigateTo('/')}
                      className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#132032] text-xs font-bold transition-colors cursor-pointer"
                    >
                      Back to Home
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ROUTE: /partner (Zero-PII Technician Partner Portal) */}
        {currentPath === '/partner' && (
          <>
            <SeoHead
              title="Partner Portal | Sastafone"
              description="Sastafone Certified Technician Partner Portal"
              canonicalPath="/partner"
              noindex
            />
            {authClaimsLoading ? (
              <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center gap-3">
                <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-medium text-gray-500">Verifying partner access...</p>
              </div>
            ) : isVerifiedPartner ? (
              <PartnerPortalView />
            ) : (
              <div className="min-h-[60vh] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white p-6 rounded-2xl border border-gray-200 shadow-xs text-center space-y-3">
                  <div className="w-11 h-11 rounded-xl bg-[#FEF2F2] text-[#D5151B] flex items-center justify-center mx-auto">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h1 className="text-lg font-bold text-[#132032]">403 — Partner Access Required</h1>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    This portal is restricted to verified Sastafone technician partners.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    {!user.isLoggedIn && (
                      <button
                        type="button"
                        onClick={() => setIsAuthModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Partner Sign In
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => navigateTo('/')}
                      className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#132032] text-xs font-bold transition-colors cursor-pointer"
                    >
                      Back to Home
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
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
                      कैसे काम करता है (How It Works)
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#132032] mt-2">
                      4 आसान चरणों में डोरस्टेप मोबाइल रिपेयर
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Sastafone Certified Technician Network द्वारा सूरत के सभी प्रमुख क्षेत्रों में पारदर्शी सेवा।
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
                      desc: 'अपना फोन मॉडल व समस्या चुनें, लाइव अनुमानित खर्च देखें और ₹199 विज़िट टोकन बुक करें।'
                    },
                    {
                      step: '02',
                      title: 'डोरस्टेप पिकअप व QC',
                      desc: 'सर्टिफाइड पार्टनर आपके पते से फोन पिकअप कर 11-पॉइंट QC और फोटो लॉगिंग करता है।'
                    },
                    {
                      step: '03',
                      title: 'पारदर्शी कोट अप्रूवल',
                      desc: 'आपकी मंज़ूरी के बाद ही रिपेयर शुरू होता है। मना करने पर ₹99 रिफंड (₹100 रखा जाता है)।'
                    },
                    {
                      step: '04',
                      title: '2-घंटे डिलीवरी लक्ष्य',
                      desc: 'रिपेयर और टेस्टिंग के बाद सुरक्षित डिलीवरी व ₹1,000+ बिल पर 6 महीने की वारंटी।'
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
                    लाइव रिपेयर रेट लिस्ट (Firestore Live)
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

      {/* Mobile-first PWA Bottom Tab Bar (Hidden inside Admin Control Room / Partner Portal) */}
      {!isFullScreenDesk && (
        <BottomTabBar
          currentTab={currentTab}
          onTabChange={(tab) => {
            setCurrentTab(tab);
            if (tab === 'home') navigateTo('/');
            else if (tab === 'repair') navigateTo('/repair');
            else if (tab === 'orders') navigateTo('/orders');
            else if (tab === 'profile') navigateTo('/profile');
          }}
          onNavigate={navigateTo}
          activeOrdersCount={activeJobsCount}
        />
      )}

      {/* Modals & Overlays */}
      <LocationSelectorModal />
      <LegalModals />
      <FirebaseAuthModal />
      <InvoiceModal />

      {/* Floating WhatsApp Support Button & Public Footer */}
      {!isFullScreenDesk && <WhatsAppFloatingButton />}
      {!isFullScreenDesk && <Footer />}
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
