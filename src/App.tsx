import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { SellFlowSection } from './components/SellFlowSection';
import { BuyPhonesSection } from './components/BuyPhonesSection';
import { RepairServiceSection } from './components/RepairServiceSection';
import { P2PMarketplaceSection } from './components/P2PMarketplaceSection';
import { LocationSelectorModal } from './components/LocationSelectorModal';
import { UserDashboardModal } from './components/UserDashboardModal';
import { LegalModals } from './components/LegalModals';
import { InvoiceModal } from './components/InvoiceModal';
import { AuthorizedServiceCentersModal } from './components/AuthorizedServiceCentersModal';
import { HappyCustomersSection } from './components/HappyCustomersSection';
import { RazorpayPaymentModal } from './components/RazorpayPaymentModal';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { SuratLocalSeoSection } from './components/SuratLocalSeoSection';
import { Footer } from './components/Footer';
import { ProAuditModal } from './components/ProAuditModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { DirectEmailSupportModal } from './components/DirectEmailSupportModal';
import { FirebaseAuthModal } from './components/FirebaseAuthModal';
import { applyPageSeo } from './utils/seoData';
import { Lock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface AuthGatedServiceProps {
  serviceType: 'sell' | 'buy' | 'repair' | 'bazaar';
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const AuthGatedService: React.FC<AuthGatedServiceProps> = ({
  serviceType,
  title,
  subtitle,
  children
}) => {
  const { user, setIsAuthModalOpen, setAuthPromptReason, isAuthModalOpen } = useApp();

  const servicePrompts: Record<string, string> = {
    sell: '📱 पुराना मोबाइल बेचने के लिए कृपया पहले सस्ताफोन में लॉगिन करें।',
    buy: '🛒 सर्टिफाइड फोन डील्स व सस्ता बाज़ार देखने के लिए कृपया लॉगिन करें।',
    repair: '🔧 ₹199 में घर बैठे मोबाइल रिपेयरिंग बुक करने के लिए कृपया पहले लॉगिन करें।',
    bazaar: '🏷️ सस्ता बाज़ार (P2P मार्केटप्लेस) में डील व लिस्टिंग के लिए कृपया पहले लॉगिन करें।'
  };

  const handleOpenLogin = () => {
    setAuthPromptReason(servicePrompts[serviceType]);
    setIsAuthModalOpen(true);
  };

  // Automatically trigger FirebaseAuthModal when user accesses an unauthenticated service section
  React.useEffect(() => {
    if (!user.isLoggedIn && !isAuthModalOpen) {
      setAuthPromptReason(servicePrompts[serviceType]);
      setIsAuthModalOpen(true);
    }
  }, [user.isLoggedIn, serviceType]);

  if (!user.isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-2xl text-center">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-red-200 relative overflow-hidden animate-in fade-in duration-200">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Lock className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-[11px] font-black uppercase tracking-wider">
            लॉगिन अनिवार्य है • Login Required
          </span>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-3 tracking-tight">
            {title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-md mx-auto leading-relaxed">
            {subtitle}। धोखाधड़ी से सुरक्षा व प्रामाणिक सेवाओं के लिए सस्ताफोन में लॉगिन अनिवार्य है।
          </p>

          <div className="my-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 text-slate-700 max-w-sm mx-auto">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% सत्यापित खरीदार व विक्रेता नेटवर्क</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>CEIR व पुलिस एंटी-थेफ्ट सुरक्षा जांच</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>लाइव जॉब-कार्ड, रसीदें व ट्रैकिंग सुविधा</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenLogin}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>सुरक्षित लॉगिन / साइन इन करें</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

function MainApp() {
  const { activeTab, language } = useApp();

  // Dynamic SEO Title & Meta Descriptions updates for Googlebot & Users
  React.useEffect(() => {
    applyPageSeo(activeTab, language);
  }, [activeTab, language]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header & Surat Navigation */}
      <Header />

      {/* Hero Section with 4 Core Service Shortcuts */}
      <HeroSection />

      {/* Main Content Area - Gated with Compulsory Login Check for Core Services */}
      <main className="flex-1">
        {/* Sell Old Phone */}
        {activeTab === 'sell' && (
          <AuthGatedService
            serviceType="sell"
            title="पुराना मोबाइल बेचें (Sell Old Phone)"
            subtitle="सूरत में तुरंत नकद भुगतान व 2 घंटे में फ्री होम पिकअप"
          >
            <SellFlowSection />
            <BuyPhonesSection />
            <P2PMarketplaceSection />
            <RepairServiceSection />
          </AuthGatedService>
        )}

        {/* Buy Certified Phone Deals */}
        {activeTab === 'buy' && (
          <AuthGatedService
            serviceType="buy"
            title="सर्टिफाइड खरीदें व सस्ता बाज़ार (Buy Phone Deals)"
            subtitle="32-पॉइंट टेस्टेड, 6 महीने वारंटी व डायरेक्ट यूज़र डील्स"
          >
            <BuyPhonesSection />
            <P2PMarketplaceSection />
            <SellFlowSection />
            <RepairServiceSection />
          </AuthGatedService>
        )}

        {/* Repair @ Home */}
        {activeTab === 'repair' && (
          <AuthGatedService
            serviceType="repair"
            title="घर बैठे मोबाइल रिपेयरिंग (Doorstep Repair)"
            subtitle="30 मिनट में लाइव रिपेयर, मात्र ₹199 विज़िट टोकन (फाइनल बिल में एडजस्टेबल)"
          >
            <RepairServiceSection />
            <P2PMarketplaceSection />
            <SellFlowSection />
            <BuyPhonesSection />
          </AuthGatedService>
        )}

        {/* OLX-style P2P Direct Mobile Bazaar */}
        {activeTab === 'bazaar' && (
          <AuthGatedService
            serviceType="bazaar"
            title="सस्ता बाज़ार मोबाइल मंडी (P2P Marketplace)"
            subtitle="0% ब्रोकरेज, केवल ₹99 में विज्ञापन व डायरेक्ट सेलर चैट"
          >
            <P2PMarketplaceSection />
            <SellFlowSection />
            <BuyPhonesSection />
            <RepairServiceSection />
          </AuthGatedService>
        )}
      </main>

      {/* Surat Happy Customers Reviews & Testimonials Section */}
      <HappyCustomersSection />

      {/* Modals & Overlays */}
      <LocationSelectorModal />
      <UserDashboardModal />
      <InvoiceModal />
      <AuthorizedServiceCentersModal />
      <RazorpayPaymentModal />
      <LegalModals />
      <ProAuditModal />
      <AdminPortalModal />
      <DirectEmailSupportModal />
      <FirebaseAuthModal />

      {/* Floating Quick Support Chat (Sastaphone Surat Support) */}
      <WhatsAppFloatingButton />

      {/* Surat Local SEO & Google My Business Ranking Directory */}
      <SuratLocalSeoSection />

      {/* Footer & Compliance */}
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
