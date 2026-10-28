import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DIWALI_DHAMAKA_PHONES } from '../data/mockData';
import { RefurbishedPhone } from '../types';
import { formatINR, generateWhatsAppLink } from '../utils/valuation';
import { ShieldCheck, BatteryCharging, Truck, CheckCircle2, ShoppingBag, Sparkles, X, MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const BuyPhonesSection: React.FC = () => {
  const { language, selectedLocality, addOrder, setIsDashboardOpen, user } = useApp();
  const [selectedPhone, setSelectedPhone] = useState<RefurbishedPhone | null>(null);
  const [addressInput, setAddressInput] = useState(user.address || `Near Main Road, ${selectedLocality}`);
  const [customerNameInput, setCustomerNameInput] = useState(user.name || 'Surat Resident');
  const [customerPhoneInput, setCustomerPhoneInput] = useState(user.phone || '9372802044');
  const [isSuccessBooked, setIsSuccessBooked] = useState(false);

  // Custom phone demand state
  const [isCustomBuyModalOpen, setIsCustomBuyModalOpen] = useState(false);
  const [customBuyBrand, setCustomBuyBrand] = useState('Apple');
  const [customBuyModel, setCustomBuyModel] = useState('');
  const [customBuyBudget, setCustomBuyBudget] = useState('₹15,000 - ₹30,000');
  const [customBuyStorage, setCustomBuyStorage] = useState('128GB');
  const [customBuySuccess, setCustomBuySuccess] = useState(false);

  const handleOpenBuyModal = (phone: RefurbishedPhone) => {
    setSelectedPhone(phone);
  };

  const handleConfirmOrder = () => {
    if (!selectedPhone) return;

    addOrder({
      type: 'buy',
      title: `${selectedPhone.name} (${selectedPhone.variant})`,
      subtitle: `${selectedPhone.color} • ${selectedPhone.grade} • ${selectedPhone.warrantyMonths}M Warranty`,
      amount: selectedPhone.offerPrice,
      status: 'technician_assigned',
      statusHindi: 'ऑर्डर कन्फर्म (सूरत में आज डिलीवरी)',
      locality: selectedLocality,
      fullAddress: addressInput || `${selectedLocality}, Surat`,
      customerName: customerNameInput || 'Customer',
      customerPhone: customerPhoneInput || '9372802044',
      timeSlot: 'Today, Within 3 Hours',
      technicianName: 'Sanjay Prajapati (Surat Express Logistics)',
      technicianPhone: '9372802044'
    });

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });

    setIsSuccessBooked(true);
    setTimeout(() => {
      setSelectedPhone(null);
      setIsSuccessBooked(false);
      setIsDashboardOpen(true);
    }, 1500);
  };

  return (
    <section id="buy-section" className="py-8 bg-white border-b border-slate-200">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Heading & Promo Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'hi' ? '💥 दिवाली धमाका / बिगेस्ट डिस्काउंट' : '💥 Diwali Dhamaka / Biggest Discount Deals'}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {language === 'hi'
                ? 'टॉप 10 सर्टिफाइड सेकंड-हैंड फोन डील्स'
                : 'Top 10 Certified Second-Hand Phone Deals'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {language === 'hi'
                ? '32-पॉइंट क्वालिटी चेक पास, 6 महीने की वारंटी, 7 दिन रिप्लेसमेंट और सूरत में फ्री डिलीवरी।'
                : '32-point inspection passed, 6-month warranty, 7-day easy replacement, free Surat doorstep delivery.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 self-start md:self-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>{language === 'hi' ? '5x2 ग्रिड: 10 डील्स लाइव' : '5x2 Grid: 10 Live Deals'}</span>
          </div>
        </div>

        {/* 5x2 Grid Layout (Exactly matches the blueprint) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {DIWALI_DHAMAKA_PHONES.map(phone => (
            <div
              key={phone.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all flex flex-col justify-between p-3 relative group"
            >
              {/* Discount Tag */}
              <div className="absolute top-2 left-2 z-10">
                <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                  {phone.discountPct}% OFF
                </span>
              </div>

              {/* Stock Tag */}
              <div className="absolute top-2 right-2 z-10">
                <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[9px] font-bold px-1.5 py-0.5 rounded">
                  {phone.stockCount} left
                </span>
              </div>

              {/* Phone Image */}
              <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-100 mb-2.5 relative flex items-center justify-center">
                <img
                  src={phone.imageUrl}
                  alt={phone.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {/* Brand & Name */}
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                  {phone.brand}
                </span>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">
                  {phone.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {phone.variant} • {phone.color}
                </p>

                {/* Key Specs Pills */}
                <div className="flex items-center gap-1.5 my-2">
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                    <BatteryCharging className="w-3 h-3 text-emerald-600" />
                    {phone.batteryHealth}%
                  </span>
                  <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded">
                    6M Warranty
                  </span>
                </div>

                {/* Pricing: Strikethrough MRP + Offer Price */}
                <div className="pt-1.5 border-t border-slate-100">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm sm:text-base font-black text-slate-900">
                      {formatINR(phone.offerPrice)}
                    </span>
                    <span className="text-[11px] text-slate-400 line-through">
                      {formatINR(phone.originalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 grid grid-cols-1 gap-1.5">
                <button
                  onClick={() => handleOpenBuyModal(phone)}
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'अभी खरीदें' : 'Buy Now'}</span>
                </button>

                <a
                  href={generateWhatsAppLink('buy', {
                    phoneName: `${phone.name} (${phone.variant})`,
                    quotePrice: phone.offerPrice,
                    locality: selectedLocality
                  })}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold text-[11px] text-center flex items-center justify-center gap-1 transition-all"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Phone Demand Card (Unlisted model buy request) */}
        <div className="mt-6 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold border border-indigo-500/30">
              <span>🔍 कोई खास मॉडल नहीं मिला?</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              {language === 'hi'
                ? 'अपनी पसंद का मॉडल, RAM व स्टोरेज बताएं - सूरत में 24 घंटे में अरेंज करेंगे!'
                : 'Need a specific phone? Tell us your model & budget - sourced in Surat within 24 hours!'}
            </h3>
            <p className="text-xs text-slate-300">
              iPhone 13, 14, Samsung S23 Ultra, OnePlus 11R, Vivo X100 या कोई भी मॉडल 6 महीने की वारंटी के साथ उपलब्ध कराया जाएगा।
            </p>
          </div>
          <button
            onClick={() => {
              setCustomBuySuccess(false);
              setIsCustomBuyModalOpen(true);
            }}
            className="shrink-0 w-full md:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>✍️ अनलिस्टेड फोन डिमांड दर्ज करें</span>
          </button>
        </div>
      </div>

      {/* Buy Now / Doorstep Booking Modal */}
      {selectedPhone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            {isSuccessBooked ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  {language === 'hi' ? 'ऑर्डर सफलतापूर्वक बुक हुआ!' : 'Order Placed Successfully!'}
                </h3>
                <p className="text-xs text-slate-600">
                  {language === 'hi'
                    ? `सूरत में आज ही 3 घंटे के भीतर ${selectedLocality} में डिलीवरी होगी। डिलीवरी पर नकद (COD) या UPI दें।`
                    : `Doorstep delivery scheduled in ${selectedLocality}, Surat with 6-month warranty card.`}
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      <img src={selectedPhone.imageUrl} alt={selectedPhone.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{selectedPhone.name}</h3>
                      <p className="text-xs text-blue-600 font-bold">{formatINR(selectedPhone.offerPrice)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPhone(null)}
                    className="text-slate-400 hover:text-slate-700 text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-left text-xs">
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>Sastaphone Certified Guarantee:</span>
                    </p>
                    <p className="text-[11px] text-blue-800">
                      ✓ 6 महीने की फुल वारंटी + 7 दिन आसान रिप्लेसमेंट<br />
                      ✓ बैटरी हेल्थ {selectedPhone.batteryHealth}% + ओरिजिनल चार्जर और बिल
                    </p>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'hi' ? 'सूरत डिलीवरी लोकेशन:' : 'Surat Delivery Locality:'}
                    </label>
                    <div className="p-2 rounded-xl bg-slate-100 font-bold text-slate-900 flex justify-between items-center">
                      <span>📍 {selectedLocality}</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold">Free Doorstep Delivery</span>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'hi' ? 'पूरा पता:' : 'Complete Delivery Address:'}
                    </label>
                    <textarea
                      rows={2}
                      value={addressInput}
                      onChange={e => setAddressInput(e.target.value)}
                      placeholder="House/Office No., Street, Landmark..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        {language === 'hi' ? 'नाम:' : 'Name:'}
                      </label>
                      <input
                        type="text"
                        value={customerNameInput}
                        onChange={e => setCustomerNameInput(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        {language === 'hi' ? 'मोबाइल नंबर:' : 'Mobile Number:'}
                      </label>
                      <input
                        type="tel"
                        value={customerPhoneInput}
                        onChange={e => setCustomerPhoneInput(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-xs"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px]">
                    📦 <strong>पेमेंट का तरीका:</strong> कैश ऑन डिलीवरी (COD) या डिलीवरी के समय UPI पेमेंट।
                  </div>

                  <button
                    onClick={handleConfirmOrder}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all cursor-pointer"
                  >
                    {language === 'hi' ? 'सूरत में ऑर्डर बुक करें' : 'Confirm Order in Surat'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Custom Buy Request Modal */}
      {isCustomBuyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            {customBuySuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  डिमांड सफलतापूर्वक दर्ज हुई!
                </h3>
                <p className="text-xs text-slate-600">
                  सूरत टीम आपके लिए यह फोन 24 घंटे में बेस्ट रेट और 6 महीने की वारंटी के साथ अरेंज करेगी।
                </p>
                <button
                  onClick={() => setIsCustomBuyModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
                >
                  ठीक है (Close)
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div>
                    <h3 className="font-black text-slate-900 text-base">
                      ✍️ अनलिस्टेड फोन डिमांड दर्ज करें
                    </h3>
                    <p className="text-xs text-slate-500">
                      जो मॉडल आप खरीदना चाहते हैं, उसका विवरण भरें
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCustomBuyModalOpen(false)}
                    className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!customBuyModel.trim()) return;
                    setCustomBuySuccess(true);
                  }}
                  className="space-y-3.5 text-xs text-left"
                >
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      पसंदीदा ब्रांड:
                    </label>
                    <select
                      value={customBuyBrand}
                      onChange={e => setCustomBuyBrand(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold"
                    >
                      {['Apple', 'Samsung', 'OnePlus', 'Vivo', 'Realme', 'Xiaomi', 'iQOO', 'Motorola', 'Google', 'Nothing', 'Oppo'].map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                      <option value="Other">अन्य (Other)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      मॉडल का नाम:
                    </label>
                    <input
                      type="text"
                      required
                      value={customBuyModel}
                      onChange={e => setCustomBuyModel(e.target.value)}
                      placeholder="उदा: iPhone 13 / Galaxy S23 / OnePlus 11R"
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        स्टोरेज:
                      </label>
                      <select
                        value={customBuyStorage}
                        onChange={e => setCustomBuyStorage(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold"
                      >
                        {['128GB', '256GB', '512GB', '64GB'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        आपका बजट:
                      </label>
                      <select
                        value={customBuyBudget}
                        onChange={e => setCustomBuyBudget(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-semibold"
                      >
                        {['₹8,000 - ₹15,000', '₹15,000 - ₹30,000', '₹30,000 - ₹50,000', '₹50,000+'].map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                    ⭐ <strong>सूरत वारंटी:</strong> हमारे द्वारा उपलब्ध कराए गए सभी फोनों पर 6 महीने की वारंटी और 7 दिन टेस्टिंग वारंटी मिलती है।
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="submit"
                      className="py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      डिमांड सबमिट करें
                    </button>

                    <a
                      href={generateWhatsAppLink('buy', {
                        phoneName: `${customBuyBrand} ${customBuyModel || 'Phone'} (${customBuyStorage})`,
                        locality: selectedLocality
                      })}
                      target="_blank"
                      rel="noreferrer"
                      className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs text-center flex items-center justify-center gap-1 transition-all"
                    >
                      <span>💬 WhatsApp पर मांगें</span>
                    </a>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
