import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { BottomTabBar, TabType } from './components/BottomTabBar';
import { CustomerRepairBookingFlow } from './components/CustomerRepairBookingFlow';
import { MyOrdersTimeline } from './components/MyOrdersTimeline';
import { ProfileView } from './components/ProfileView';
import { AdminMobileDashboard } from './components/AdminMobileDashboard';
import { SellPhoneFlow } from './components/SellPhoneFlow';
import { BuyPhonesInventoryView } from './components/BuyPhonesInventoryView';
import { WarrantyPage } from './components/WarrantyPage';
import { SuratAreaPage } from './components/SuratAreaPage';
import { MobileRepairSuratSeoPage } from './components/MobileRepairSuratSeoPage';
import { SellOldPhoneSuratSeoPage } from './components/SellOldPhoneSuratSeoPage';
import { BlogPlaceholderPage } from './components/BlogPlaceholderPage';
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
  Smartphone,
  ShoppingBag
} from 'lucide-react';
import { subscribeToCustomerJobs } from './services/firestoreRepairService';
import { Job } from './types';

function MainApp() {
  const { language, activeTab: legacyTab, setActiveTab: setLegacyTab, user, setIsAuthModalOpen } = useApp();

  // Current URL path state
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');

  // Bottom tab state
  const [currentTab, setCurrentTab] = useState<TabType>('home');

  // Admin Dashboard Modal State
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);

  // Active customer jobs count for live badge
  const [activeJobsCount, setActiveJobsCount] = useState<number>(0);

  // Listen to browser navigation (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname || '/';
      setCurrentPath(path);

      if (path === '/' || path === '') setCurrentTab('home');
      else if (path.startsWith('/repair')) setCurrentTab('repair');
      else if (path === '/orders') setCurrentTab('orders');
      else if (path === '/profile') setCurrentTab('profile');
      else if (path === '/admin') {
        if (user.role === 'admin') {
          setIsAdminDashboardOpen(true);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    handlePopState();

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [user.role]);

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
      const active = jobs.filter((j) => j.status !== 'Delivered' && j.status !== 'Declined' && j.status !== 'Cancelled').length;
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

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans selection:bg-[#DC2626] selection:text-white pb-20">
      {/* Default Homepage Meta via SeoHead */}
      <SeoHead
        title="Sastafone Surat – Doorstep Mobile Repair, Sell & Buy Certified Phones"
        description="सूरत में सर्टिफाइड टेक्नीशियन नेटवर्क द्वारा फोन पिकअप व डिलीवरी रिपेयर, ₹199 विज़िट टोकन (बिल में एडजस्टेड), पुराना फोन बेचें और 6 माह वारंटी फोन।"
        canonicalPath="/"
      />

      {/* Top Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1">
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
            onBookInArea={(areaName) => {
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
            onRequestCreated={(id) => {
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
          <div className="animate-in fade-in duration-200">
            <MyOrdersTimeline onBookNew={() => navigateTo('/repair')} />
          </div>
        )}

        {/* ROUTE: /profile */}
        {currentPath === '/profile' && (
          <div className="animate-in fade-in duration-200">
            <ProfileView
              onOpenAdmin={() => setIsAdminDashboardOpen(true)}
              onNavigateToOrders={() => navigateTo('/orders')}
              onNavigateToRepair={() => navigateTo('/repair')}
            />
          </div>
        )}

        {/* ROUTE: /repair or /repair/book */}
        {(currentPath === '/repair' || currentPath === '/repair/book') && (
          <div className="animate-in fade-in duration-200">
            <CustomerRepairBookingFlow
              onJobCreated={(jobId) => {
                navigateTo('/orders');
              }}
              onNavigateToOrders={() => {
                navigateTo('/orders');
              }}
            />
          </div>
        )}

        {/* ROUTE: /admin */}
        {currentPath === '/admin' && (
          <div className="p-8 text-center max-w-md mx-auto">
            {user.role === 'admin' ? (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-gray-900">एडमिन कंट्रोल डेस्क</h2>
                <button
                  type="button"
                  onClick={() => setIsAdminDashboardOpen(true)}
                  className="px-6 py-3 rounded-2xl bg-[#DC2626] text-white font-bold text-xs"
                >
                  डैशबोर्ड खोलें
                </button>
              </div>
            ) : (
              <div className="bg-red-50 p-6 rounded-2xl border border-red-200 space-y-3">
                <Lock className="w-8 h-8 text-[#DC2626] mx-auto" />
                <h3 className="text-base font-bold text-gray-900">
                  एडमिन अधिकार आवश्यक है
                </h3>
                <p className="text-xs text-gray-600">
                  यह पृष्ठ केवल अधिकृत स्टाफ व एडमिन के लिए सुरक्षित है।
                </p>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#DC2626] text-white text-xs font-bold"
                >
                  एडमिन अकाउंट से लॉगिन करें
                </button>
              </div>
            )}
          </div>
        )}

        {/* ROUTE: / (Home) */}
        {(currentPath === '/' || currentPath === '') && (
          <div className="animate-in fade-in duration-200">
            {/* Hero Section */}
            <HeroSection />

            {/* Doorstep Process Highlights */}
            <section className="container mx-auto px-4 py-8 max-w-4xl">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-6">
                  <div>
                    <span className="px-3 py-1 rounded-full bg-red-100 text-[#DC2626] text-xs font-bold uppercase tracking-wider">
                      सूरत एक्सक्लूसिव
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-2">
                      Sastafone डोरस्टेप पिकअप व डिलीवरी फोन रिपेयरिंग
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      सूरत के सभी प्रमुख इलाकों में सर्टिफाइड टेक नेटवर्क द्वारा 60 मिनट स्लॉट पिकअप।
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigateTo('/repair')}
                    className="px-5 py-3 rounded-2xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shrink-0 tap-target"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>रिपेयरिंग बुक करें (₹199)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* 3 Step Process */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="w-9 h-9 rounded-xl bg-red-100 text-[#DC2626] flex items-center justify-center font-black mb-3">
                      1
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">
                      मॉडल व समस्या चुनें
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      सर्च से फोन मॉडल चुनें, समस्याओं पर टिक करें और लाइव अनुमानित खर्च व समय देखें।
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="w-9 h-9 rounded-xl bg-red-100 text-[#DC2626] flex items-center justify-center font-black mb-3">
                      2
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">
                      डोरस्टेप पिकअप व QC
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      टेक्नीशियन आपके पते पर आकर 11-पॉइंट QC इंस्पेक्शन करेगा और अंतिम पारदर्शी क्वोट देगा।
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="w-9 h-9 rounded-xl bg-red-100 text-[#DC2626] flex items-center justify-center font-black mb-3">
                      3
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">
                      स्वीकृति व 6M वारंटी
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      आपके अनुमोदन के बाद रिपेयर शुरू होगा। ₹1000+ के बिल पर 6 महीने वारंटी सहित सुरक्षित डिलीवरी।
                    </p>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap items-center justify-around gap-4 text-xs font-semibold text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Sastafone Certified Technician Network</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
                    <span>₹199 विज़िट टोकन (फाइनल बिल में माइनस)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>60 मिनट पिकअप स्लॉट्स</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Surat Real Customers Reviews (Shown only if min 5 reviews) */}
            <HappyCustomersSection />

            {/* Surat Local Areas Directory */}
            <SuratLocalSeoSection />
          </div>
        )}
      </main>

      {/* Mobile-first PWA Bottom Tab Bar */}
      <BottomTabBar
        activeTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          if (tab === 'home') navigateTo('/');
          else if (tab === 'repair') navigateTo('/repair');
          else if (tab === 'orders') navigateTo('/orders');
          else if (tab === 'profile') navigateTo('/profile');
        }}
        activeOrdersCount={activeJobsCount}
        onShowComingSoon={(feature) => {
          if (feature.toLowerCase().includes('sell')) {
            navigateTo('/sell-phone');
          } else {
            navigateTo('/buy-phones');
          }
        }}
      />

      {/* Admin Mobile Dashboard Modal */}
      <AdminMobileDashboard
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
      />

      {/* Modals & Overlays */}
      <LocationSelectorModal />
      <LegalModals />
      <FirebaseAuthModal />
      <InvoiceModal />

      {/* Floating WhatsApp Support Button */}
      <WhatsAppFloatingButton />

      {/* Footer */}
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
