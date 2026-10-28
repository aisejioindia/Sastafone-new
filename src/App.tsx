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
import { Footer } from './components/Footer';

function MainApp() {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header & Surat Navigation */}
      <Header />

      {/* Hero Section with 4 Core Service Shortcuts */}
      <HeroSection />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Sell Old Phone */}
        {activeTab === 'sell' && (
          <>
            <SellFlowSection />
            <BuyPhonesSection />
            <P2PMarketplaceSection />
            <RepairServiceSection />
          </>
        )}

        {/* Buy Certified Phone Deals */}
        {activeTab === 'buy' && (
          <>
            <BuyPhonesSection />
            <P2PMarketplaceSection />
            <SellFlowSection />
            <RepairServiceSection />
          </>
        )}

        {/* Repair @ Home */}
        {activeTab === 'repair' && (
          <>
            <RepairServiceSection />
            <P2PMarketplaceSection />
            <SellFlowSection />
            <BuyPhonesSection />
          </>
        )}

        {/* OLX-style P2P Direct Mobile Bazaar */}
        {activeTab === 'bazaar' && (
          <>
            <P2PMarketplaceSection />
            <SellFlowSection />
            <BuyPhonesSection />
            <RepairServiceSection />
          </>
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

      {/* Floating Quick Support Chat (AllIndia.si Support) */}
      <WhatsAppFloatingButton />

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
