import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BRANDS, PHONE_MODELS, CONDITION_CRITERIA, SASTAPHONE_PHONE, WHATSAPP_NUMBER } from '../data/mockData';
import { Brand, ConditionGrade, PhoneModel, PhoneVariant } from '../types';
import { calculateValuation, formatINR, generateWhatsAppLink } from '../utils/valuation';
import { VideoVerificationModal } from './VideoVerificationModal';
import { BrandLogo } from './BrandLogo';
import { Check, Sparkles, Video, ShieldCheck, CheckCircle2, RotateCcw, Truck } from 'lucide-react';
import confetti from 'canvas-confetti';

export const SellFlowSection: React.FC = () => {
  const {
    language,
    selectedLocality,
    sellSelection,
    updateSellSelection,
    resetSellSelection,
    addOrder,
    setIsDashboardOpen,
    user
  } = useApp();

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('Today, 2:00 PM - 4:00 PM');
  const [addressInput, setAddressInput] = useState(user.address || `Near Main Road, ${selectedLocality}`);
  const [customerNameInput, setCustomerNameInput] = useState(user.name || 'Surat Resident');
  const [customerPhoneInput, setCustomerPhoneInput] = useState(user.phone || '9372802044');
  const [isSuccessBooked, setIsSuccessBooked] = useState(false);

  const quote = calculateValuation(sellSelection);

  const brandModels = sellSelection.brand
    ? PHONE_MODELS.filter(m => m.brandId === sellSelection.brand?.id)
    : [];

  const handleSelectBrand = (brand: Brand) => {
    updateSellSelection({
      brand,
      model: undefined,
      variant: undefined,
      color: undefined,
      condition: 'good'
    });
  };

  const handleSelectModel = (model: PhoneModel) => {
    updateSellSelection({
      model,
      variant: model.variants[0],
      color: model.colors[0],
      condition: sellSelection.condition || 'good'
    });
  };

  const handleSelectVariant = (variant: PhoneVariant) => {
    updateSellSelection({ variant });
  };

  const handleSelectColor = (color: { name: string; hex: string }) => {
    updateSellSelection({ color });
  };

  const handleSelectCondition = (condition: ConditionGrade) => {
    updateSellSelection({ condition });
  };

  const handleConfirmDoorstepBooking = () => {
    if (!sellSelection.model || !sellSelection.brand) return;

    addOrder({
      type: 'sell',
      title: `${sellSelection.model.name} (${sellSelection.variant?.storage || 'Standard'})`,
      subtitle: `${sellSelection.color?.name || ''} • ${CONDITION_CRITERIA[sellSelection.condition || 'good'].label}`,
      amount: quote.maxPrice,
      status: 'technician_assigned',
      statusHindi: 'सूरत टेक्नीशियन असाइन हुआ (आज पिकअप)',
      locality: selectedLocality,
      fullAddress: addressInput || `${selectedLocality}, Surat`,
      customerName: customerNameInput || 'Customer',
      customerPhone: customerPhoneInput || '9372802044',
      timeSlot: selectedSlot,
      technicianName: 'Sanjay Prajapati (Surat Hub #1)',
      technicianPhone: '9372802044',
      videoUploaded: Boolean(sellSelection.verifiedVideo)
    });

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });

    setIsSuccessBooked(true);
    setTimeout(() => {
      setIsBookingModalOpen(false);
      setIsSuccessBooked(false);
      setIsDashboardOpen(true);
    }, 1500);
  };

  return (
    <section id="sell-section" className="py-8 bg-slate-50">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
                100% Clickable Zero-Typing Flow
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {language === 'hi' ? 'सूरत स्पेशल' : 'Surat Special'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {language === 'hi'
                ? 'स्टेप 1: अपना मोबाइल ब्रांड और मॉडल चुनें'
                : 'Step 1: Select Your Mobile Brand & Model'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {language === 'hi'
                ? 'बिना कुछ टाइप किए केवल क्लिक करें। AI तुरंत आपके फोन की वास्तविक मार्केट वैल्यू निकालेगा।'
                : 'Zero typing required. Tap each step to get accurate AI market valuation in seconds.'}
            </p>
          </div>

          {sellSelection.brand && (
            <button
              onClick={resetSellSelection}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-rose-600 text-xs font-bold shadow-2xs hover:border-rose-300 transition-all self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'रीसेट करें' : 'Reset Selection'}</span>
            </button>
          )}
        </div>

        {/* 1. Brand Selection (19 Brands Grid) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs mb-6">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">1</span>
              <span>{language === 'hi' ? 'ब्रांड चुनें (24 प्रमुख ब्रांड्स - 91mobiles डेटा)' : 'Select Brand (24 Brands)'}</span>
            </h3>
            {sellSelection.brand && (
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                ✓ {sellSelection.brand.name}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
            {BRANDS.map(brand => {
              const isSelected = sellSelection.brand?.id === brand.id;
              return (
                <button
                  key={brand.id}
                  onClick={() => handleSelectBrand(brand)}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 scale-102'
                      : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-blue-400 text-slate-800'
                  }`}
                >
                  <BrandLogo brandId={brand.id} size="md" inverted={isSelected} />
                  <span className="text-xs font-bold truncate max-w-full">
                    {brand.name.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Model Selection */}
        {sellSelection.brand && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs mb-6">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">2</span>
                <span>
                  {language === 'hi'
                    ? `${sellSelection.brand.name} का मॉडल चुनें (${brandModels.length} मॉडल्स उपलब्ध)`
                    : `Select ${sellSelection.brand.name} Model (${brandModels.length} models)`}
                </span>
              </h3>
              {sellSelection.model && (
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  ✓ {sellSelection.model.name}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {brandModels.length > 0 ? (
                brandModels.map(model => {
                  const isSelected = sellSelection.model?.id === model.id;
                  return (
                    <div
                      key={model.id}
                      onClick={() => handleSelectModel(model)}
                      role="button"
                      tabIndex={0}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-600 shadow-md ring-2 ring-blue-500/20'
                          : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-xs'
                      }`}
                    >
                      <div className="h-28 w-full rounded-xl overflow-hidden mb-2 bg-slate-100 flex items-center justify-center relative">
                        <img
                          src={model.imageUrl}
                          alt={model.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {model.specScore && (
                          <span className="absolute top-1.5 left-1.5 text-[9px] font-black px-1.5 py-0.5 rounded bg-[#388E3C] text-white shadow-xs">
                            {model.specScore}% Spec
                          </span>
                        )}
                        {model.popular && (
                          <span className="absolute top-1.5 right-1.5 text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-400 text-slate-950">
                            HOT
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-1">{model.name}</h4>
                        {model.processor && (
                          <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{model.processor}</p>
                        )}
                        <p className="text-[11px] text-blue-600 font-bold mt-0.5">
                          {language === 'hi' ? 'एस्टीमेट अप टू' : 'Up to'} {formatINR(model.baseValuation)}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full p-6 text-center text-slate-500 bg-slate-50 rounded-2xl text-xs">
                  {language === 'hi'
                    ? `${sellSelection.brand.name} के मॉडल्स के लिए WhatsApp (9372802044) पर तुरंत रेट पाएं।`
                    : `Contact our Surat Hub on WhatsApp (9372802044) for unlisted ${sellSelection.brand.name} models.`}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. Variant & Color Selection */}
        {sellSelection.model && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs mb-6">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">3</span>
              <span>{language === 'hi' ? 'वेरिएंट और कलर चुनें' : 'Select Storage & Color'}</span>
            </h3>

            <div className="mb-4">
              <label className="text-xs font-bold text-slate-700 block mb-2">
                {language === 'hi' ? 'स्टोरेज वेरिएंट:' : 'Storage Variant:'}
              </label>
              <div className="flex flex-wrap gap-2.5">
                {sellSelection.model.variants.map((v, i) => {
                  const isSelected = sellSelection.variant?.storage === v.storage && (!v.ram || sellSelection.variant?.ram === v.ram);
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelectVariant(v)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                      }`}
                    >
                      {v.ram ? `${v.ram} RAM / ${v.storage}` : v.storage}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                {language === 'hi' ? 'फोन का कलर:' : 'Phone Color:'}
              </label>
              <div className="flex flex-wrap gap-2.5">
                {sellSelection.model.colors.map((c, i) => {
                  const isSelected = sellSelection.color?.name === c.name;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelectColor(c)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/20"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 4. Condition Selection */}
        {sellSelection.model && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs mb-6">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">4</span>
              <span>{language === 'hi' ? 'कंडीशन (हालत) चुनें' : 'Select Phone Condition'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              {(Object.keys(CONDITION_CRITERIA) as ConditionGrade[]).map(grade => {
                const info = CONDITION_CRITERIA[grade];
                const isSelected = sellSelection.condition === grade;
                return (
                  <div
                    key={grade}
                    onClick={() => handleSelectCondition(grade)}
                    role="button"
                    tabIndex={0}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-slate-50/60 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${info.badgeColor}`}>
                          {info.label}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{info.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block mb-2">
                {language === 'hi' ? 'उपलब्ध ओरिजिनल एक्सेसरीज:' : 'Available Original Accessories:'}
              </label>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => updateSellSelection({ hasOriginalBox: !sellSelection.hasOriginalBox })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    sellSelection.hasOriginalBox ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${sellSelection.hasOriginalBox ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>{language === 'hi' ? 'बॉक्स (+₹400)' : 'Box (+₹400)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateSellSelection({ hasValidBill: !sellSelection.hasValidBill })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    sellSelection.hasValidBill ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${sellSelection.hasValidBill ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>{language === 'hi' ? 'बिल (+₹600)' : 'Bill (+₹600)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateSellSelection({ hasOriginalCharger: !sellSelection.hasOriginalCharger })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                    sellSelection.hasOriginalCharger ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  <Check className={`w-3.5 h-3.5 ${sellSelection.hasOriginalCharger ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>{language === 'hi' ? 'ओरिजिनल चार्जर (+₹350)' : 'Charger (+₹350)'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. AI Live Valuation Card */}
        {sellSelection.model && (
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-blue-500/30 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                  OpenRouter AI Valuation Complete
                </span>
              </div>
              <span className="text-[11px] font-semibold bg-white/10 px-2.5 py-1 rounded-full text-blue-200">
                Surat Index: {sellSelection.brand?.name}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div>
                <p className="text-xs text-blue-200 font-medium">
                  {sellSelection.model.name} • {sellSelection.variant?.storage} • {sellSelection.color?.name}
                </p>
                <div className="text-3xl sm:text-4xl md:text-5xl font-black text-amber-400 tracking-tight my-2">
                  {formatINR(quote.minPrice)} - {formatINR(quote.maxPrice)}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {language === 'hi'
                    ? `सूरत (${selectedLocality}) में 2 घंटे के भीतर फ्री होम पिकअप और तुरंत UPI/कैश भुगतान।`
                    : `Free 2-hour doorstep pickup and instant UPI/Cash in ${selectedLocality}, Surat.`}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Price Lock Guaranteed
                  </span>
                  {sellSelection.verifiedVideo ? (
                    <span className="bg-amber-400 text-slate-950 font-black px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Video Verified (+₹300)
                    </span>
                  ) : (
                    <span className="bg-white/10 text-white px-2.5 py-1 rounded-lg font-medium">
                      Doorstep 0-Hassle Visit
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                {!sellSelection.verifiedVideo ? (
                  <button
                    onClick={() => setIsVideoModalOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center justify-between transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-amber-400" />
                      <span>{language === 'hi' ? '10-sec वीडियो वेरिफिकेशन अपलोड करें' : 'Upload 10-Sec Video Verification'}</span>
                    </div>
                    <span className="text-[10px] font-black bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full">
                      +₹300 बोनस
                    </span>
                  </button>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold">वीडियो इंस्पेक्शन अप्रूव्ड (98% स्कोर)</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-200">Bonus Added</span>
                  </div>
                )}

                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Truck className="w-5 h-5 text-slate-900" />
                  <span>
                    {language === 'hi'
                      ? 'सूरत में फ्री पिकअप और कैश बुक करें'
                      : 'Book Free Surat Pickup & Cash'}
                  </span>
                </button>

                <a
                  href={generateWhatsAppLink('sell', {
                    modelName: sellSelection.model.name,
                    variant: sellSelection.variant?.storage,
                    condition: CONDITION_CRITERIA[sellSelection.condition || 'good'].label,
                    quotePrice: quote.maxPrice,
                    locality: selectedLocality
                  })}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>💬</span>
                  <span>
                    {language === 'hi'
                      ? 'WhatsApp पर तुरंत कन्फर्म करें (9372802044)'
                      : 'WhatsApp Direct (9372802044)'}
                  </span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      <VideoVerificationModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onVerified={() => setIsVideoModalOpen(false)}
      />

      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            {isSuccessBooked ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  {language === 'hi' ? 'पिकअप सफलतापूर्वक बुक हुआ!' : 'Surat Pickup Booked!'}
                </h3>
                <p className="text-xs text-slate-600">
                  {language === 'hi'
                    ? `संजय प्रजापति (सूरत हब #1) तय समय पर ${selectedLocality} में आपके पते पर पहुंचेंगे।`
                    : `Technician assigned for doorstep inspection & instant cash payout in ${selectedLocality}.`}
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div>
                    <h3 className="font-black text-slate-900 text-base">
                      {language === 'hi' ? 'सूरत फ्री डोरस्टेप पिकअप' : 'Surat Doorstep Pickup'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {sellSelection.model?.name} • {formatINR(quote.maxPrice)} Cash
                    </p>
                  </div>
                  <button
                    onClick={() => setIsBookingModalOpen(false)}
                    className="text-slate-400 hover:text-slate-700 text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3.5 text-left text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'hi' ? 'सूरत लोकैलिटी (इलाका):' : 'Surat Locality:'}
                    </label>
                    <div className="p-2.5 rounded-xl bg-slate-100 font-bold text-slate-900 flex justify-between items-center">
                      <span>📍 {selectedLocality}</span>
                      <span className="text-[10px] text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-200">Verified Hub</span>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'hi' ? 'पूरा पता:' : 'Complete Address:'}
                    </label>
                    <textarea
                      rows={2}
                      value={addressInput}
                      onChange={e => setAddressInput(e.target.value)}
                      placeholder="Flat/House No., Landmark, Surat..."
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
                        {language === 'hi' ? 'फोन:' : 'Phone:'}
                      </label>
                      <input
                        type="tel"
                        value={customerPhoneInput}
                        onChange={e => setCustomerPhoneInput(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'hi' ? 'पिकअप समय चुनें:' : 'Pickup Time Slot:'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Today (2-4 PM)', 'Today (4-6 PM)', 'Tomorrow (10-12 AM)'].map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                            selectedSlot === slot
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                    💵 <strong>पेमेंट गारंटी:</strong> डोरस्टेप पर फोन चेक करके तुरंत UPI या कैश दिया जाएगा।
                  </div>

                  <button
                    onClick={handleConfirmDoorstepBooking}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all cursor-pointer"
                  >
                    {language === 'hi' ? 'पिकअप कन्फर्म करें' : 'Confirm Surat Pickup'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
