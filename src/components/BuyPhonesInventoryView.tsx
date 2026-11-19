import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SeoHead } from './SeoHead';
import { InventoryPhone } from '../types';
import { subscribeToAvailableInventory } from '../services/firestoreRepairService';
import { DIRECT_UPI_ID } from '../services/paymentService';
import { buildWhatsappHref } from '../services/siteSettingsService';
import { trackEvent } from '../utils/analytics';
import { buildPaymentLinkUrl, submitToWeb3Forms } from '../services/web3formsService';
import { PaymentLinkQrCard } from './PaymentLinkQrCard';
import {
  ShoppingBag,
  ShieldCheck,
  BatteryCharging,
  CheckCircle2,
  Search,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Smartphone,
  QrCode,
  MessageCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BuyPhonesInventoryViewProps {
  initialSlug?: string;
  onNavigateHome?: () => void;
}

export const BuyPhonesInventoryView: React.FC<BuyPhonesInventoryViewProps> = ({
  initialSlug,
  onNavigateHome
}) => {
  const { selectedLocality, siteSettings } = useApp();

  const [inventory, setInventory] = useState<InventoryPhone[]>([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedGrade] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<'all' | 'under_20k' | '20k_to_35k' | 'above_35k'>('all');

  // Detail Modal / Page State
  const [activePhone, setActivePhone] = useState<InventoryPhone | null>(null);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);

  // Guest WhatsApp + Direct UPI Booking State (No Login Needed)
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [isBookingToken, setIsBookingToken] = useState(false);
  const [pendingBuyQrRef, setPendingBuyQrRef] = useState<string | null>(null);
  const [bookingSuccessNote, setBookingSuccessNote] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Subscribe to real Firestore inventory
  useEffect(() => {
    const unsub = subscribeToAvailableInventory((items) => {
      setInventory((items || []) as InventoryPhone[]);
      setIsLoadingInventory(false);
    });
    return () => unsub();
  }, []);

  // Handle initial slug navigation
  useEffect(() => {
    if (initialSlug && inventory.length > 0) {
      const found = inventory.find(p => p.slug === initialSlug);
      if (found) {
        setActivePhone(found);
      }
    }
  }, [initialSlug, inventory]);

  // Filters
  const filteredPhones = inventory.filter((phone) => {
    if (phone.status !== 'available' && phone.status !== 'booked') return false;

    const matchesBrand = selectedBrand === 'all' || phone.brand.toLowerCase() === selectedBrand.toLowerCase();
    const matchesGrade = selectedGrade === 'all' || phone.grade.toLowerCase().includes(selectedGrade.toLowerCase());
    const matchesSearch =
      !searchQuery ||
      phone.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.colour.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesPrice = true;
    if (priceRange === 'under_20k') matchesPrice = phone.price < 20000;
    else if (priceRange === '20k_to_35k') matchesPrice = phone.price >= 20000 && phone.price <= 35000;
    else if (priceRange === 'above_35k') matchesPrice = phone.price > 35000;

    return matchesBrand && matchesGrade && matchesSearch && matchesPrice;
  });

  // Generate Direct UPI QR (9372802044@idfcfirst) & Send Web3Forms Inquiry (No Login Needed)
  const handleGenerateBuyQr = async () => {
    if (!activePhone) return;
    setBookingError(null);

    if (!buyerName.trim() || buyerPhone.replace(/\D/g, '').length < 10) {
      setBookingError('कृपया अपना नाम और 10 अंकों का WhatsApp / मोबाइल नंबर दर्ज करें।');
      return;
    }

    setIsBookingToken(true);
    const tokenAmt = activePhone.tokenAmount || 499;
    const refId = `BUY-${activePhone.id.slice(-6)}-${Date.now().toString().slice(-4)}`;

    trackEvent('buy_phone_token_initiated', {
      phone_id: activePhone.id,
      model: `${activePhone.brand} ${activePhone.model}`,
      amount: tokenAmt
    });

    await submitToWeb3Forms({
      formType: 'buy_phone',
      subject: `Buy Phone Inquiry (Direct UPI ₹${tokenAmt}): ${activePhone.brand} ${activePhone.model}`,
      name: buyerName.trim(),
      phone: buyerPhone.trim(),
      service: 'सर्टिफाइड फोन खरीदें (Buy Phone Reservation)',
      brand: activePhone.brand,
      model: `${activePhone.model} (${activePhone.storage}, ${activePhone.colour})`,
      problems: `Grade: ${activePhone.grade}, Battery: ${activePhone.batteryHealth}%`,
      dynamicPricing: `₹${activePhone.price.toLocaleString('en-IN')} (₹${tokenAmt} UPI Token)`,
      visitTokenAmount: tokenAmt,
      area: selectedLocality || 'Surat',
      referenceId: refId,
      paymentStatus: `Pending Direct UPI (${DIRECT_UPI_ID}) Confirmation`,
      paymentLink: buildPaymentLinkUrl(refId, tokenAmt)
    });

    setPendingBuyQrRef(refId);
    setIsBookingToken(false);
  };

  // Confirm Direct UPI Payment + Open WhatsApp Summary
  const handleConfirmDirectBuyWhatsapp = async (utrNumber: string) => {
    if (!activePhone || !pendingBuyQrRef) return;
    setIsBookingToken(true);
    const tokenAmt = activePhone.tokenAmount || 499;

    await submitToWeb3Forms({
      formType: 'buy_phone',
      subject: `WhatsApp + UPI Buy Phone Confirmation [${pendingBuyQrRef}]: ${activePhone.brand} ${activePhone.model}`,
      name: buyerName.trim() || 'Sastafone Customer',
      phone: buyerPhone.trim(),
      service: 'सर्टिफाइड फोन खरीदें (Buy Phone Reservation)',
      brand: activePhone.brand,
      model: `${activePhone.model} (${activePhone.storage}, ${activePhone.colour})`,
      problems: `Grade: ${activePhone.grade}, Battery: ${activePhone.batteryHealth}%`,
      dynamicPricing: `₹${activePhone.price.toLocaleString('en-IN')} (₹${tokenAmt} Token -> ${DIRECT_UPI_ID})`,
      visitTokenAmount: tokenAmt,
      area: selectedLocality || 'Surat',
      referenceId: pendingBuyQrRef,
      paymentStatus: utrNumber
        ? `UPI Payment Submitted (UTR: ${utrNumber}) -> ${DIRECT_UPI_ID}`
        : `WhatsApp Confirmation Ready -> ${DIRECT_UPI_ID}`,
      paymentId: utrNumber || `UPI-${DIRECT_UPI_ID}`,
      paymentLink: buildPaymentLinkUrl(pendingBuyQrRef, tokenAmt)
    });

    trackEvent('buy_phone_reserved', {
      phone_id: activePhone.id,
      payment_id: utrNumber || DIRECT_UPI_ID,
      amount: tokenAmt
    });

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    setBookingSuccessNote(
      `बुकिंग अनुरोध #${pendingBuyQrRef} दर्ज हो गया है! कृपया नीचे दिए गए बटन से WhatsApp पर ₹${tokenAmt} UPI (${DIRECT_UPI_ID}) पेमेंट स्क्रीनशॉट भेजकर डिलीवरी स्लॉट कन्फर्म करें।`
    );
    setIsBookingToken(false);
  };

  // Structured Data for Detail view
  const currentJsonLd = activePhone
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': `${activePhone.brand} ${activePhone.model} (${activePhone.storage}, ${activePhone.colour})`,
        'image': activePhone.photos[0],
        'description': activePhone.description,
        'offers': {
          '@type': 'Offer',
          'price': activePhone.price,
          'priceCurrency': 'INR',
          'availability': activePhone.status === 'available' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
          'seller': {
            '@type': 'LocalBusiness',
            'name': 'Sastafone Surat'
          }
        }
      }
    : null;

  return (
    <div className="bg-white min-h-screen py-6 sm:py-8">
      <SeoHead
        title={
          activePhone
            ? `${activePhone.brand} ${activePhone.model} (${activePhone.storage}) – सर्टिफाइड फोन | Sastafone Surat`
            : 'सर्टिफाइड सेकंड-हैंड फोन खरीदें – 6 महीने वारंटी | Sastafone Surat'
        }
        description={
          activePhone
            ? `${activePhone.brand} ${activePhone.model} मात्र ₹${activePhone.price.toLocaleString('en-IN')} में। 32-पॉइंट QC पास, 6 महीने वारंटी, ₹499 रिफंडेबल टोकन से बुक करें।`
            : 'सूरत में Sastafone से सर्टिफाइड सेकंड-हैंड स्मार्टफोन खरीदें। 100% ओरिजिनल पार्ट्स, 6 महीने वारंटी, घर पर निरीक्षण और ₹499 टोकन बुकिंग।'
        }
        canonicalPath={activePhone ? `/buy-phones/${activePhone.slug}` : '/buy-phones'}
        jsonLd={currentJsonLd || undefined}
        type={activePhone ? 'product' : 'website'}
      />

      <div className="container mx-auto px-4 max-w-5xl">
        {/* Detail Modal View */}
        {activePhone ? (
          <div className="space-y-6 step-transition">
            {/* Back button */}
            <button
              type="button"
              onClick={() => {
                setActivePhone(null);
                setBookingSuccessNote(null);
                setBookingError(null);
                if (window.location.pathname !== '/buy-phones') {
                  window.history.pushState({}, '', '/buy-phones');
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#D5151B] cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>सभी फोन स्टॉक देखें (Back to all)</span>
            </button>

            {/* Product Card Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 rounded-3xl border border-gray-200 bg-white shadow-xs">
              {/* Photo Gallery */}
              <div className="space-y-3">
                <div className="aspect-4/3 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center relative">
                  {activePhone.photos?.[selectedPhotoIdx] || activePhone.photos?.[0] ? (
                    <img
                      src={activePhone.photos[selectedPhotoIdx] || activePhone.photos[0]}
                      alt={`${activePhone.brand} ${activePhone.model}`}
                      className="w-full h-full object-contain p-4"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400 gap-2 p-6">
                      <Smartphone className="w-12 h-12 text-gray-300" />
                      <span className="text-xs font-medium">{activePhone.brand} {activePhone.model}</span>
                    </div>
                  )}
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#D5151B] text-white text-xs font-bold">
                    {activePhone.grade}
                  </span>
                </div>

                {activePhone.photos && activePhone.photos.length > 1 && (
                  <div className="flex gap-2">
                    {activePhone.photos.map((ph, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPhotoIdx(idx)}
                        className={`w-16 h-16 rounded-xl border-2 overflow-hidden cursor-pointer ${
                          selectedPhotoIdx === idx ? 'border-[#D5151B]' : 'border-gray-200 opacity-60'
                        }`}
                      >
                        <img src={ph} alt={`${activePhone.model} ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Specs & Booking CTA */}
              <div className="space-y-5">
                <div>
                  <span className="text-xs font-bold text-[#D5151B] uppercase tracking-wider block">
                    {activePhone.brand} • सर्टिफाइड स्टॉक
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#132032] tracking-tight mt-0.5">
                    {activePhone.model}
                  </h1>
                  <p className="text-xs text-gray-500 mt-1">
                    रंग: <strong>{activePhone.colour}</strong> • स्टोरेज: <strong>{activePhone.storage}</strong>
                  </p>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-bold text-[#132032]">
                    ₹{activePhone.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    6 महीने की वारंटी शामिल
                  </span>
                </div>

                {/* Key Specs Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 block">बैटरी हेल्थ</span>
                    <strong className="text-[#132032] flex items-center gap-1">
                      <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                      {activePhone.batteryHealth}% ओरिजिनल
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 block">वारंटी अवधि</span>
                    <strong className="text-[#132032] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#D5151B]" />
                      {activePhone.warrantyMonths} महीने Sastafone
                    </strong>
                  </div>
                  {activePhone.specs?.display && (
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 col-span-2">
                      <span className="text-[10px] text-gray-400 block">डिस्प्ले व स्क्रीन</span>
                      <strong className="text-[#132032]">{activePhone.specs.display}</strong>
                    </div>
                  )}
                  {activePhone.specs?.processor && (
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 col-span-2">
                      <span className="text-[10px] text-gray-400 block">प्रोसेसर</span>
                      <strong className="text-[#132032]">{activePhone.specs.processor}</strong>
                    </div>
                  )}
                </div>

                {bookingSuccessNote ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-3">
                    <p className="font-bold text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>बुकिंग अनुरोध दर्ज हुआ!</span>
                    </p>
                    <p>{bookingSuccessNote}</p>
                    <a
                      href={buildWhatsappHref(
                        siteSettings.whatsappNumber,
                        `नमस्ते Sastafone Surat! मुझे सर्टिफाइड फोन बुक करना है:\n• Ref ID: ${pendingBuyQrRef || activePhone.id}\n• नाम: ${buyerName} (${buyerPhone})\n• फोन: ${activePhone.brand} ${activePhone.model} (${activePhone.storage}, ${activePhone.colour})\n• कीमत: ₹${activePhone.price.toLocaleString('en-IN')}\n• ₹${activePhone.tokenAmount || 499} टोकन UPI ID: ${DIRECT_UPI_ID}`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp पर पेमेंट स्क्रीनशॉट व बुकिंग भेजें</span>
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    {bookingError && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{bookingError}</span>
                      </div>
                    )}

                    {activePhone.status === 'booked' ? (
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold text-center">
                        यह फोन किसी ग्राहक द्वारा टोकन देकर बुक किया जा चुका है।
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={buyerName}
                            onChange={(e) => setBuyerName(e.target.value)}
                            placeholder="आपका नाम *"
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#D5151B]"
                          />
                          <input
                            type="tel"
                            value={buyerPhone}
                            onChange={(e) => setBuyerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            placeholder="WhatsApp / मोबाइल नंबर *"
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-mono outline-none focus:border-[#D5151B]"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleGenerateBuyQr}
                          disabled={isBookingToken}
                          className="w-full py-3.5 rounded-2xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer tap-target disabled:opacity-50"
                        >
                          <QrCode className="w-4 h-4" />
                          <span>₹{activePhone.tokenAmount || 499} UPI QR ({DIRECT_UPI_ID}) पाएं व बुक करें</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        <a
                          href={buildWhatsappHref(
                            siteSettings.whatsappNumber,
                            `नमस्ते Sastafone Surat! मुझे यह सर्टिफाइड फोन खरीदना है: ${activePhone.brand} ${activePhone.model} (${activePhone.storage}, ₹${activePhone.price.toLocaleString('en-IN')})। कृपया उपलब्धता बताएं।`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>सीधे WhatsApp पर पूछें (बिना लॉगिन)</span>
                        </a>

                        {pendingBuyQrRef && (
                          <PaymentLinkQrCard
                            referenceId={pendingBuyQrRef}
                            amount={activePhone.tokenAmount || 499}
                            serviceLabel="सर्टिफाइड फोन खरीदें"
                            deviceModel={`${activePhone.brand} ${activePhone.model} (${activePhone.storage})`}
                            problemsLabel={`Grade: ${activePhone.grade} • Battery ${activePhone.batteryHealth}%`}
                            dynamicPricingLabel={`₹${activePhone.price.toLocaleString('en-IN')}`}
                            slotLabel={selectedLocality || 'Surat Delivery'}
                            customerName={buyerName.trim()}
                            customerPhone={buyerPhone.trim()}
                            whatsappNumber={siteSettings.whatsappNumber}
                            isConfirming={isBookingToken}
                            onConfirmWhatsapp={handleConfirmDirectBuyWhatsapp}
                            title={`₹${activePhone.tokenAmount || 499} डायरेक्ट UPI टोकन QR व WhatsApp कन्फर्म`}
                          />
                        )}
                      </div>
                    )}

                    <p className="text-[11px] text-gray-500 leading-relaxed text-center">
                      *टोकन राशि (₹499) सीधे <strong className="font-mono text-[#132032]">{DIRECT_UPI_ID}</strong> पर स्वीकार्य है व 100% रिफंडेबल है। शेष राशि (₹{(activePhone.price - 499).toLocaleString('en-IN')}) फोन देखकर डिलीवरी पर दें।
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Public Grid with Filters */
          <div className="space-y-6">
            <header className="text-center max-w-2xl mx-auto mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF2F2] border border-red-200 text-[#D5151B] text-xs font-bold mb-2">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>सूरत सर्टिफाइड सेकंड-हैंड स्टॉक</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#132032] tracking-tight">
                सर्टिफाइड फोन खरीदें (Buy Certified Phones)
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Sastafone का अपना प्रमाणित स्टॉक: 32-पॉइंट QC, 6 महीने की वारंटी, और घर पर फोन चेक करने के बाद ही पूरा भुगतान।
              </p>
            </header>

            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="मॉडल या ब्रांड खोजें (उदा. iPhone 13, OnePlus)..."
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 bg-white text-xs outline-none focus:border-[#D5151B]"
                  />
                </div>

                {/* Brand Filter */}
                <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  {['all', 'Apple', 'Samsung', 'OnePlus'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBrand(b)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                        selectedBrand === b
                          ? 'bg-[#D5151B] text-white shadow-2xs'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {b === 'all' ? 'सभी ब्रांड्स' : b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Pills */}
              <div className="flex flex-wrap gap-2 text-xs pt-1 border-t border-gray-200/60">
                <span className="text-gray-500 self-center text-[11px] font-bold">बजट:</span>
                {[
                  { id: 'all', label: 'सभी दाम' },
                  { id: 'under_20k', label: '₹20,000 से कम' },
                  { id: '20k_to_35k', label: '₹20,000 – ₹35,000' },
                  { id: 'above_35k', label: '₹35,000 से ऊपर' }
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriceRange(p.id as any)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      priceRange === p.id
                        ? 'bg-red-100 text-[#D5151B] font-bold border border-red-300'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Inventory Grid */}
            {isLoadingInventory ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {[1, 2, 3].map((sk) => (
                  <div key={sk} className="p-4 rounded-2xl border border-gray-200 bg-white space-y-3 animate-pulse">
                    <div className="aspect-4/3 rounded-xl bg-gray-100" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-5 bg-gray-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredPhones.length === 0 ? (
              <div className="p-10 text-center rounded-2xl border border-gray-200 bg-white space-y-3">
                <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
                <h3 className="text-sm font-bold text-[#132032]">
                  {inventory.length === 0
                    ? 'अभी सर्टिफाइड स्टॉक अपडेट हो रहा है'
                    : 'इस फ़िल्टर में कोई फोन उपलब्ध नहीं है'}
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  {inventory.length === 0
                    ? 'हम केवल 32-पॉइंट QC पास वास्तविक फोन ही सूचीबद्ध करते हैं। नया स्टॉक जुड़ते ही यहाँ दिखेगा।'
                    : 'कृपया अपने फिल्टर बदलें या नया सर्च प्रयास करें।'}
                </p>
                {onNavigateHome && (
                  <button
                    type="button"
                    onClick={onNavigateHome}
                    className="px-4 py-2 rounded-xl bg-[#FEF2F2] text-[#D5151B] font-bold text-xs border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    होम पर जाएं
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {filteredPhones.map((phone) => (
                  <div
                    key={phone.id}
                    onClick={() => {
                      setActivePhone(phone);
                      if (window.location.pathname !== `/buy-phones/${phone.slug}`) {
                        window.history.pushState({}, '', `/buy-phones/${phone.slug}`);
                      }
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    role="button"
                    tabIndex={0}
                    className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-red-300 hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="aspect-4/3 rounded-xl overflow-hidden bg-gray-50 mb-3 flex items-center justify-center relative">
                        {phone.photos?.[0] ? (
                          <img
                            src={phone.photos[0]}
                            alt={`${phone.brand} ${phone.model}`}
                            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <Smartphone className="w-10 h-10 text-gray-300" />
                        )}
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#D5151B] text-white text-[10px] font-bold">
                          {phone.grade}
                        </span>
                        {phone.status === 'booked' && (
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                            बुक्ड (Booked)
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          {phone.brand} • {phone.storage}
                        </span>
                        <h2 className="text-sm font-bold text-[#132032] group-hover:text-[#D5151B] transition-colors">
                          {phone.model}
                        </h2>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                          <span>बैटरी हेल्थ: {phone.batteryHealth}%</span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-3">
                      <div>
                        <span className="text-base font-bold text-[#132032] tabular-nums">
                          ₹{phone.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-gray-400 block">6 माह वारंटी</span>
                      </div>

                      <span className="text-xs font-bold text-[#D5151B] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        विवरण देखें <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
