import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BRANDS, PHONE_MODELS, CONDITION_CRITERIA, SASTAPHONE_PHONE, WHATSAPP_NUMBER } from '../data/mockData';
import { Brand, ConditionGrade, PhoneModel, PhoneVariant } from '../types';
import { calculateValuation, formatINR, generateWhatsAppLink } from '../utils/valuation';
import { VideoVerificationModal } from './VideoVerificationModal';
import { BrandLogo } from './BrandLogo';
import { Check, Sparkles, Video, ShieldCheck, CheckCircle2, RotateCcw, Truck, Navigation, CheckCheck, AlertCircle } from 'lucide-react';
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
    user,
    requireAuth,
    setIsAuthModalOpen
  } = useApp();

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isCustomModelModalOpen, setIsCustomModelModalOpen] = useState(false);

  // Phone Images & Ownership Proof
  const [frontPhotoUrl, setFrontPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80');
  const [backPhotoUrl, setBackPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80');
  const [billPhotoUrl, setBillPhotoUrl] = useState<string>('');
  const [isOwnershipConfirmed, setIsOwnershipConfirmed] = useState<boolean>(true);
  const [bookedSellOrder, setBookedSellOrder] = useState<any | null>(null);

  // Custom model form state
  const [customBrandName, setCustomBrandName] = useState('Samsung');
  const [customModelName, setCustomModelName] = useState('');
  const [customRam, setCustomRam] = useState('8GB');
  const [customStorage, setCustomStorage] = useState('128GB');
  const [customNetworkType, setCustomNetworkType] = useState<'5G' | '4G'>('5G');
  const [customColor, setCustomColor] = useState('Black');
  const [customCondition, setCustomCondition] = useState<ConditionGrade>('good');
  const [customEstimatedPrice, setCustomEstimatedPrice] = useState<number>(22000);
  const [customHasOriginalBox, setCustomHasOriginalBox] = useState<boolean>(true);
  const [customHasOriginalCharger, setCustomHasOriginalCharger] = useState<boolean>(true);
  const [customHasValidBill, setCustomHasValidBill] = useState<boolean>(false);
  const [customError, setCustomError] = useState<string | null>(null);

  const [selectedSlot, setSelectedSlot] = useState('Today, 2:00 PM - 4:00 PM');
  const [addressInput, setAddressInput] = useState(user.address || '');
  const [customerNameInput, setCustomerNameInput] = useState(user.name || 'Surat Resident');
  const [customerPhoneInput, setCustomerPhoneInput] = useState(user.phone || '9372802044');
  const [isSuccessBooked, setIsSuccessBooked] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [gpsData, setGpsData] = useState<{
    latitude: number;
    longitude: number;
    accuracyMeters?: number;
    mapsLink?: string;
  } | null>(user.gpsLocation || null);
  const [isLocatingGps, setIsLocatingGps] = useState(false);

  const handleDetectFreeGps = () => {
    if (!navigator.geolocation) {
      setBookingError('आपके डिवाइस पर GPS उपलब्ध नहीं है। कृपया पूरा पता नीचे दर्ज करें।');
      return;
    }
    setIsLocatingGps(true);
    setBookingError(null);
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy);
        setGpsData({
          latitude: lat,
          longitude: lng,
          accuracyMeters: acc,
          mapsLink: `https://www.google.com/maps?q=${lat},${lng}`
        });
        setIsLocatingGps(false);
      },
      err => {
        console.warn('Geolocation:', err.message);
        setGpsData({
          latitude: 21.1702,
          longitude: 72.8311,
          accuracyMeters: 30,
          mapsLink: `https://www.google.com/maps?q=21.1702,72.8311`
        });
        setIsLocatingGps(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const quote = calculateValuation(sellSelection);

  const brandModels = sellSelection.brand
    ? PHONE_MODELS.filter(m => m.brandId === sellSelection.brand?.id)
    : [];

  const handleSelectBrand = (brand: Brand) => {
    setCustomBrandName(brand.name);
    updateSellSelection({
      brand,
      model: undefined,
      variant: undefined,
      color: undefined,
      condition: 'good',
      isCustomModel: false
    });
  };

  const handleApplyCustomModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customModelName.trim()) {
      setCustomError('कृपया मोबाइल का मॉडल नाम लिखें (e.g. Realme 12 Pro+ / Vivo V29e)');
      return;
    }
    setCustomError(null);

    const is5G = customNetworkType === '5G';
    const baseVal = Number(customEstimatedPrice) || 20000;
    const cleanBrand = customBrandName.trim() || 'Other';
    const cleanModel = customModelName.trim();
    const networkTag = customNetworkType === '5G' ? '(5G)' : '(4G)';

    const customBrandObj = sellSelection.brand || BRANDS.find(b => b.name.toLowerCase() === cleanBrand.toLowerCase()) || {
      id: cleanBrand.toLowerCase().replace(/\s+/g, '-'),
      name: cleanBrand,
      logoText: cleanBrand.slice(0, 2).toUpperCase(),
      badgeColor: 'bg-slate-700'
    };

    const customModelObj: PhoneModel = {
      id: `custom-${Date.now()}`,
      brandId: customBrandObj.id,
      name: `${cleanBrand} ${cleanModel} ${networkTag}`,
      baseValuation: baseVal,
      imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&auto=format&fit=crop&q=80',
      variants: [
        { storage: customStorage, ram: customRam, priceModifier: 0 }
      ],
      colors: [
        { name: customColor || 'Black', hex: '#1e293b' }
      ],
      category: baseVal >= 45000 ? 'flagship' : baseVal >= 18000 ? 'midrange' : 'budget',
      is5G: is5G,
      specScore: 92,
      processor: `${customRam} RAM • ${networkTag} • ${customStorage}`
    };

    updateSellSelection({
      isCustomModel: true,
      customDetails: {
        modelName: cleanModel,
        brandName: cleanBrand,
        ram: customRam,
        storage: customStorage,
        is5G: is5G,
        color: customColor,
        condition: customCondition,
        expectedPrice: baseVal
      },
      brand: customBrandObj,
      model: customModelObj,
      variant: customModelObj.variants[0],
      color: customModelObj.colors[0],
      condition: customCondition,
      hasOriginalBox: customHasOriginalBox,
      hasOriginalCharger: customHasOriginalCharger,
      hasValidBill: customHasValidBill
    });

    setIsCustomModelModalOpen(false);

    // Smooth scroll down to valuation summary
    setTimeout(() => {
      const el = document.getElementById('sell-valuation-result');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
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

    if (!user.isLoggedIn) {
      requireAuth('पुराना फोन बेचने के लिए कृपया पहले लॉगिन करें।', () => {
        setIsBookingModalOpen(true);
      });
      return;
    }

    if (!customerNameInput.trim()) {
      setBookingError('कृपया अपना नाम दर्ज करें');
      return;
    }

    if (!customerPhoneInput.trim() || customerPhoneInput.replace(/\D/g, '').length < 10) {
      setBookingError('कृपया मान्य 10-अंकों का मोबाइल नंबर दर्ज करें');
      return;
    }

    if (!addressInput.trim() || addressInput.trim().length < 8) {
      setBookingError('गलत पते से सुरक्षा: कृपया पूरा सटीक पता (मकान/दुकान नं., बिल्डिंग व लैंडमार्क) दर्ज करें।');
      return;
    }

    setBookingError(null);

    const newOrder = addOrder({
      type: 'sell',
      title: `${sellSelection.model.name} (${sellSelection.variant?.storage || 'Standard'})`,
      subtitle: `${sellSelection.color?.name || ''} • ${CONDITION_CRITERIA[sellSelection.condition || 'good'].label} • एस्टीमेट: ${formatINR(quote.maxPrice)}`,
      amount: quote.maxPrice,
      status: 'technician_assigned',
      statusHindi: 'सूरत पिकअप असाइन हुआ • एडमिन जॉब-कार्ड लाइव',
      locality: selectedLocality,
      fullAddress: addressInput || `${selectedLocality}, Surat`,
      customerName: customerNameInput || user.name || 'Surat Resident',
      customerPhone: customerPhoneInput || user.phone || '9372802044',
      timeSlot: selectedSlot,
      technicianName: 'संजय प्रजापति (सस्ताफोन हब ओनर)',
      technicianPhone: '9372802044',
      videoUploaded: Boolean(sellSelection.verifiedVideo),
      phonePhotos: [frontPhotoUrl, backPhotoUrl].filter(Boolean),
      billPhotoUrl: billPhotoUrl || undefined,
      ownershipDeclared: isOwnershipConfirmed,
      antiTheftVerified: true,
      gpsLocation: gpsData || undefined,
      customerRequirement: `ब्रांड: ${sellSelection.brand.name}. मॉडल: ${sellSelection.model.name}. स्टोरेज: ${sellSelection.variant?.storage}. स्थिति: ${sellSelection.condition}. ओरिजिनल बॉक्स: ${sellSelection.hasOriginalBox ? 'हाँ' : 'नहीं'}. चार्जर: ${sellSelection.hasOriginalCharger ? 'हाँ' : 'नहीं'}. बिल: ${sellSelection.hasValidBill ? 'हाँ' : 'नहीं'}.`
    });

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });

    setBookedSellOrder(newOrder);
    setIsSuccessBooked(true);
  };

  return (
    <section id="sell-section" className="py-8 bg-slate-50">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold tracking-wider">
                {language === 'hi' ? '3 आसान स्टेप्स में सेल' : '3 Easy Steps Buyback'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {language === 'hi' ? 'सूरत स्पेशल • तुरंत नकद' : 'Surat Special • Instant Cash'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {language === 'hi'
                ? 'स्टेप 1: अपना मोबाइल ब्रांड और मॉडल चुनें'
                : 'Step 1: Select Your Mobile Brand & Model'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {language === 'hi'
                ? 'ब्रांड व मॉडल चुनें या अपना अनलिस्टेड फोन दर्ज करें। तुरंत सटीक वैल्यूएशन और होम पिकअप पाएं।'
                : 'Select brand and model, or enter unlisted phone details. Get fast valuation & doorstep pickup.'}
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

        {/* Dead Smartphone Buyback Card (Smartphones only: 600-1200 / 1600 for 256GB+) */}
        <div id="dead-phone-section" className="mb-6 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 text-white shadow-xl border border-rose-500/30 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                  <span>♻️ डेड स्मार्टफोन खरीद सेवा</span>
                </span>
                <span className="bg-white/10 text-rose-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-white/20">
                  सिर्फ स्मार्टफोन • तुरंत नकद भुगतान
                </span>
              </div>

              <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-snug">
                पूरा बंद, टूटा हुआ या डेड स्मार्टफोन बेचें • सूरत में तुरंत कैश!
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                अगर आपका स्मार्टफोन बिल्कुल ऑन नहीं हो रहा, मदरबोर्ड डेड है या पानी में खराब है, तो भी हम उसे सबसे अच्छी कीमत में खरीदते हैं:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
                <div className="p-3 rounded-2xl bg-white/10 border border-white/15 space-y-1">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-white">📱 डेड स्मार्टफोन (Dead Smartphone)</span>
                    <span className="text-amber-400 font-black">₹600 - ₹1,200</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    ऑन न होने वाले स्मार्टफोन पर मौके पर त्वरित नकद भुगतान।
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white/10 border border-white/15 space-y-1">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-white">⚡ 256GB+ हाई स्टोरेज डेड फोन</span>
                    <span className="text-emerald-400 font-black">₹1,600 लास्ट कैश</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    हाई स्टोरेज मदरबोर्ड पार्ट्स रिकवरी के लिए सर्वाधिक नकद राशि।
                  </p>
                </div>
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto text-center space-y-2">
              <a
                href={generateWhatsAppLink('sell', {
                  modelName: 'Dead Smartphone (डेड स्मार्टफोन)',
                  condition: 'Dead Smartphone (₹600 - ₹1,600 लास्ट)',
                  locality: selectedLocality,
                  quotePrice: 1200
                })}
                target="_blank"
                rel="noreferrer"
                className="w-full md:w-auto py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-105 cursor-pointer"
              >
                <span>💬 डेड स्मार्टफोन पिकअप बुक करें</span>
              </a>
              <p className="text-[10px] text-slate-400">सूरत में 2 घंटे में टेक्नीशियन विज़िट व इंस्टेंट पेमेंट</p>
            </div>
          </div>
        </div>

        {/* 1. Brand Selection (24 Brands Grid + Custom Entry) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">1</span>
              <span>{language === 'hi' ? 'ब्रांड चुनें (24 प्रमुख ब्रांड्स - 91mobiles डेटा)' : 'Select Brand (24 Brands)'}</span>
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCustomModelModalOpen(true)}
                className="text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3 py-1 rounded-full cursor-pointer transition-all shadow-xs flex items-center gap-1.5"
              >
                <span>✍️</span>
                <span>{language === 'hi' ? '+ अन्य / कस्टम मॉडल' : '+ Other / Custom Model'}</span>
              </button>
              {sellSelection.brand && (
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  ✓ {sellSelection.brand.name}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
            {BRANDS.map(brand => {
              const isSelected = sellSelection.brand?.id === brand.id && !sellSelection.isCustomModel;
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

            {/* Other / Custom Model Tile in Brand Grid */}
            <button
              type="button"
              onClick={() => {
                setCustomBrandName('');
                setIsCustomModelModalOpen(true);
              }}
              className={`p-2.5 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                sellSelection.isCustomModel
                  ? 'bg-amber-100 text-amber-950 border-amber-500 shadow-md ring-2 ring-amber-400/20 scale-102'
                  : 'bg-amber-50/70 hover:bg-amber-100 border-amber-300 hover:border-amber-500 text-amber-900'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-amber-200/80 flex items-center justify-center text-base">
                ✍️
              </div>
              <span className="text-[11px] font-black leading-tight text-center">
                {language === 'hi' ? '+ अन्य मॉडल' : '+ Other Model'}
              </span>
              <span className="text-[9px] text-amber-700 font-bold">
                कस्टम फ़ॉर्म
              </span>
            </button>
          </div>

          {/* Quick Helper Banner below brands */}
          <div className="mt-3.5 p-3 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-amber-950">
            <div className="flex items-center gap-2">
              <span className="text-base shrink-0">📱</span>
              <span className="leading-snug">
                {language === 'hi'
                  ? 'आपका मोबाइल ब्रांड या मॉडल लिस्ट में नहीं मिला? कोई बात नहीं!'
                  : 'Mobile brand or model not in list? Enter it manually!'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsCustomModelModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs cursor-pointer shadow-xs transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>✍️</span>
              <span>{language === 'hi' ? 'अपना मॉडल, RAM व कंडीशन खुद भरें' : 'Enter Custom Model & RAM'}</span>
            </button>
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomModelModalOpen(true)}
                  className="text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1 rounded-full cursor-pointer transition-all"
                >
                  ✍️ {language === 'hi' ? '+ अनलिस्टेड दर्ज करें' : '+ Custom Entry'}
                </button>
                {sellSelection.model && (
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    ✓ {sellSelection.model.name}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {/* Custom Model Card in Grid */}
              <div
                onClick={() => setIsCustomModelModalOpen(true)}
                role="button"
                tabIndex={0}
                className={`p-3 rounded-2xl border-2 border-dashed text-left cursor-pointer transition-all flex flex-col justify-between ${
                  sellSelection.isCustomModel
                    ? 'bg-amber-50 border-amber-500 shadow-md ring-2 ring-amber-400/20'
                    : 'bg-amber-50/50 border-amber-300 hover:border-amber-500 hover:bg-amber-100/50'
                }`}
              >
                <div className="h-28 w-full rounded-xl bg-amber-100/70 border border-amber-200 flex flex-col items-center justify-center p-2 text-center mb-2">
                  <span className="text-2xl mb-1">✍️</span>
                  <span className="text-xs font-black text-amber-950">
                    + अनलिस्टेड मॉडल
                  </span>
                  <span className="text-[10px] text-amber-700 font-semibold">
                    (RAM, Storage, 5G खुद भरें)
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-amber-950 flex items-center justify-between">
                    <span className="truncate">{sellSelection.isCustomModel ? 'कस्टम मॉडल' : 'अन्य मॉडल'}</span>
                    <span className="text-[9px] font-black bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
                      फ़ॉर्म
                    </span>
                  </h4>
                  <p className="text-[10px] text-amber-800 mt-0.5 truncate">
                    {sellSelection.isCustomModel ? sellSelection.model?.name : 'सूची में नहीं तो खुद लिखें'}
                  </p>
                </div>
              </div>
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
                <div className="col-span-full p-6 text-center text-slate-700 bg-amber-50/60 rounded-2xl border border-amber-200/80 text-xs space-y-2">
                  <p className="font-bold">
                    {language === 'hi'
                      ? `${sellSelection.brand.name} के मॉडल्स को आप यहाँ सीधे दर्ज करके लाइव रेट पा सकते हैं:`
                      : `You can directly enter your ${sellSelection.brand.name} model below for live rate:`}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomBrandName(sellSelection.brand?.name || '');
                      setIsCustomModelModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs cursor-pointer shadow-xs inline-flex items-center gap-1.5 transition-all"
                  >
                    <span>✍️</span>
                    <span>{language === 'hi' ? `${sellSelection.brand.name} का मॉडल, RAM व स्टोरेज दर्ज करें` : `Enter ${sellSelection.brand.name} Model Details`}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. Variant & Color Selection */}
        {sellSelection.model && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">3</span>
                <span>{language === 'hi' ? 'वेरिएंट और कलर चुनें' : 'Select Storage & Color'}</span>
              </h3>
              {sellSelection.isCustomModel && (
                <button
                  type="button"
                  onClick={() => setIsCustomModelModalOpen(true)}
                  className="text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3 py-1 rounded-full cursor-pointer transition-all flex items-center gap-1"
                >
                  <span>✏️</span>
                  <span>{language === 'hi' ? 'कस्टम मॉडल बदलें' : 'Edit Custom Model'}</span>
                </button>
              )}
            </div>

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
          <div id="sell-valuation-result" className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-blue-500/30 relative overflow-hidden">
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

                {sellSelection.condition === 'dead' && (
                  <div className="my-2 p-2.5 rounded-xl bg-rose-500/25 border border-rose-400/40 text-rose-200 text-xs space-y-0.5">
                    <p className="font-bold flex items-center gap-1.5 text-white">
                      <span>♻️ डेड व बंद फोन गारंटी रेट:</span>
                    </p>
                    <p className="text-[11px] text-rose-200">
                      {sellSelection.variant?.storage.includes('256') || sellSelection.variant?.storage.includes('512') || sellSelection.variant?.storage.includes('1 TB') || sellSelection.variant?.storage.includes('1TB')
                        ? 'हाई स्टोरेज (256GB+) होने पर ₹1,600 लास्ट नकद भुगतान मिलेगा!'
                        : 'सामान्य डेड फोन पर ₹600 से ₹1,200 लास्ट नकद भुगतान मौके पर मिलेगा!'}
                    </p>
                  </div>
                )}

                {/* Doorstep Spot Hike Bonus Notice */}
                <div className="my-2.5 p-3 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-amber-500/20 border border-emerald-400/40 text-emerald-200 text-xs">
                  <div className="flex items-center gap-2 text-white font-bold mb-1">
                    <span className="text-base">🤝</span>
                    <span className="text-amber-300 font-black">
                      सूरत डोरस्टेप स्पॉट बोनस (Spot Inspection Hike)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-relaxed">
                    फोन की स्थिति व ओरिजिनल बिल/कंडीशन जांचने के बाद हमारे सूरत एग्जीक्यूटिव द्वारा मौके पर{' '}
                    <strong className="text-emerald-300 underline font-black">
                      +₹500 से +₹{formatINR(quote.potentialSpotHike || 1200)} तक अतिरिक्त बोनस कैश
                    </strong>{' '}
                    बढ़ाया जा सकता है ताकि आपको पूरा संतोष मिले!
                  </p>
                </div>

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
                      ? 'WhatsApp पर तुरंत कन्फर्म करें (सूरत डेस्क)'
                      : 'WhatsApp Direct (Surat Official Desk)'}
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
              <div className="text-center py-5 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                    ऑर्डर: {bookedSellOrder?.orderNumber || 'STP-SURAT'}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-2">
                    फ़ोन सेल आवेदन टीम को सबमिट हो गया!
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    सस्ताफोन एडमिन टीम को आपका डेटा व फ़ोटो प्राप्त हो गए हैं। आप नीचे दिए गए बटन से सीधे टीम को कॉल कर सकते हैं:
                  </p>
                </div>

                {/* Direct Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  <a
                    href={`tel:${SASTAPHONE_PHONE}`}
                    className="w-full py-3.5 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>📞 सस्ताफोन टीम को डायरेक्ट कॉल करें (+91 {SASTAPHONE_PHONE})</span>
                  </a>

                  <a
                    href={generateWhatsAppLink(
                      `नमस्ते सस्ताफोन! मैंने अपना फ़ोन ${sellSelection.model?.name} सेल करने के लिए ऑर्डर #${bookedSellOrder?.orderNumber || ''} सबमिट किया है।`
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>💬 WhatsApp पर तुरंत बातचीत करें</span>
                  </a>

                  <button
                    onClick={() => {
                      setIsBookingModalOpen(false);
                      setIsSuccessBooked(false);
                      setIsDashboardOpen(true);
                    }}
                    className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                  >
                    डैशबोर्ड में ट्रैक करें
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div>
                    <h3 className="font-black text-slate-900 text-base">
                      {language === 'hi' ? 'सूरत फ्री डोरस्टेप पिकअप' : 'Surat Doorstep Pickup'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {sellSelection.model?.name} • {formatINR(quote.maxPrice)} अनुमानित कैश
                    </p>
                  </div>
                  <button
                    onClick={() => setIsBookingModalOpen(false)}
                    className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-left text-xs max-h-[75vh] overflow-y-auto pr-1">
                  {bookingError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'hi' ? 'सूरत लोकैलिटी (इलाका):' : 'Surat Locality:'}
                    </label>
                    <div className="p-2 rounded-xl bg-slate-100 font-bold text-slate-900 flex justify-between items-center text-xs">
                      <span>📍 {selectedLocality}</span>
                      <span className="text-[10px] text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-200">Verified Hub</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700">
                        {language === 'hi' ? 'सटीक डोरस्टेप पता (मकान/दुकान नं. व लैंडमार्क):' : 'Doorstep Address & Landmark:'} *
                      </label>
                      <span className="text-[9px] text-rose-700 font-bold bg-rose-100 px-1.5 py-0.2 rounded">
                        फर्जी पता वर्जित
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      required
                      value={addressInput}
                      onChange={e => setAddressInput(e.target.value)}
                      placeholder="उदा: फ्लैट 402, राजहंस सिम्फोनिया, नियर पाल आरटीओ, सूरत..."
                      className="w-full p-2 rounded-xl border border-slate-300 focus:outline-none focus:border-red-600 text-xs font-medium"
                    />

                    {/* Free Live GPS Pin Button */}
                    <div className="mt-1.5">
                      <button
                        type="button"
                        onClick={handleDetectFreeGps}
                        disabled={isLocatingGps}
                        className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          gpsData
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : 'bg-slate-50 hover:bg-slate-100 border-blue-300 text-blue-700'
                        }`}
                      >
                        {isLocatingGps ? (
                          <span className="flex items-center gap-1.5 animate-pulse">
                            <Navigation className="w-3.5 h-3.5 animate-spin" />
                            GPS लोकेशन खोजी जा रही है (मुफ़्त)...
                          </span>
                        ) : gpsData ? (
                          <span className="flex items-center gap-1 text-emerald-700 font-bold">
                            <CheckCheck className="w-4 h-4 text-emerald-600" />
                            ✓ लाइव GPS पिन वेरिफाइड (Google Maps लिंक अटैच)
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <Navigation className="w-3.5 h-3.5 text-blue-600" />
                            📍 1-क्लिक में लाइव GPS पिन लें (100% मुफ़्त)
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        {language === 'hi' ? 'नाम:' : 'Name:'} *
                      </label>
                      <input
                        type="text"
                        value={customerNameInput}
                        onChange={e => setCustomerNameInput(e.target.value)}
                        className="w-full p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-red-600 text-xs"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        {language === 'hi' ? 'फोन (WhatsApp):' : 'Phone:'} *
                      </label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={customerPhoneInput}
                        onChange={e => setCustomerPhoneInput(e.target.value.replace(/\D/g, ''))}
                        className="w-full p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-red-600 text-xs"
                      />
                    </div>
                  </div>

                  {/* Photo Uploads for Phone & Bill */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <label className="font-bold text-slate-800 block text-[11px]">
                      📸 फोन व बिल की फोटो अपलोड करें (Full Image & Data):
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="p-2 rounded-xl border border-dashed border-slate-300 hover:border-red-500 bg-white text-center cursor-pointer">
                        <span className="text-[10px] font-bold text-slate-700 block">📱 फोन स्क्रीन फोटो</span>
                        <span className="text-[9px] text-slate-400">स्क्रीन ऑन रखें</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            if (e.target.files?.[0]) setFrontPhotoUrl(URL.createObjectURL(e.target.files[0]));
                          }}
                          className="hidden"
                        />
                      </label>

                      <label className="p-2 rounded-xl border border-dashed border-slate-300 hover:border-red-500 bg-white text-center cursor-pointer">
                        <span className="text-[10px] font-bold text-slate-700 block">🧾 बिल / इनवॉइस</span>
                        <span className="text-[9px] text-slate-400">स्वामित्व प्रमाण</span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={e => {
                            if (e.target.files?.[0]) setBillPhotoUrl(URL.createObjectURL(e.target.files[0]));
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Anti-Theft Declaration */}
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-[11px]">
                    <label className="flex items-start gap-2 cursor-pointer font-bold">
                      <input
                        type="checkbox"
                        checked={isOwnershipConfirmed}
                        onChange={e => setIsOwnershipConfirmed(e.target.checked)}
                        className="mt-0.5 rounded border-amber-400 text-red-600"
                      />
                      <span>
                        मैं पुष्टि करता/करती हूँ कि यह फोन चोरी का नहीं है और मेरा वैध स्वामित्व है।
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'hi' ? 'पिकअप समय चुनें:' : 'Pickup Time Slot:'}
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {['Today (2-4 PM)', 'Today (4-6 PM)', 'Tomorrow (10-12 AM)'].map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                            selectedSlot === slot
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmDoorstepBooking}
                    className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                  >
                    Submit to Team (सस्ताफोन टीम को सबमिट करें)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Custom / Unlisted Model Entry Modal */}
      {isCustomModelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4 sticky top-0 bg-white z-10">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center text-base">
                    ✍️
                  </div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">
                    {language === 'hi' ? 'अनलिस्टेड मोबाइल मॉडल दर्ज करें' : 'Enter Custom Phone Model'}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {language === 'hi'
                    ? 'ब्रांड, मॉडल, RAM, स्टोरेज, 5G/4G व कंडीशन खुद भरकर तुरंत लाइव एस्टीमेट पाएं'
                    : 'Enter brand, model, RAM, storage, 5G/4G & condition for instant valuation'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomModelModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold cursor-pointer transition-all"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyCustomModel} className="space-y-4 text-xs text-left">
              {customError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{customError}</span>
                </div>
              )}

              {/* 1. Mobile Brand */}
              <div>
                <label className="font-bold text-slate-800 block mb-1.5 flex items-center justify-between">
                  <span>{language === 'hi' ? '1. मोबाइल ब्रांड (कंपनी):' : '1. Phone Brand:'}</span>
                  <span className="text-[11px] font-semibold text-blue-600">
                    चयनित: {customBrandName || 'कस्टम'}
                  </span>
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {['Samsung', 'Apple', 'OnePlus', 'Vivo', 'Oppo', 'Realme', 'Xiaomi', 'Motorola', 'iQOO', 'Poco', 'Google', 'Infinix', 'Tecno', 'Nothing', 'Other'].map(b => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setCustomBrandName(b === 'Other' ? '' : b)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        customBrandName === b
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={customBrandName}
                  onChange={e => setCustomBrandName(e.target.value)}
                  placeholder={language === 'hi' ? 'या कोई अन्य ब्रांड नाम लिखें (e.g. Lava, Itel, Nokia, Sharp)...' : 'Or type custom brand name...'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 font-semibold text-xs bg-slate-50/50"
                />
              </div>

              {/* 2. Exact Model Name */}
              <div>
                <label className="font-bold text-slate-800 block mb-1.5">
                  {language === 'hi' ? '2. मॉडल का पूरा नाम (Model Name):' : '2. Exact Model Name:'}
                </label>
                <input
                  type="text"
                  required
                  value={customModelName}
                  onChange={e => setCustomModelName(e.target.value)}
                  placeholder="उदा: Realme 12 Pro+ / Vivo V30e / Moto Edge 50 Fusion / Infinix Note 40"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-xs font-bold text-slate-900"
                />
              </div>

              {/* 3. Connectivity / Network (5G / 4G Smartphone) */}
              <div>
                <label className="font-bold text-slate-800 block mb-1.5">
                  {language === 'hi' ? '3. नेटवर्क टाइप (5G / 4G स्मार्टफोन):' : '3. Smartphone Network Connectivity:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomNetworkType('5G')}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      customNetworkType === '5G'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <span>⚡ 5G स्मार्टफोन</span>
                    <span className="hidden sm:inline font-normal">(हाई स्पीड)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomNetworkType('4G')}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      customNetworkType === '4G'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <span>📶 4G LTE स्मार्टफोन</span>
                  </button>
                </div>
              </div>

              {/* 4. RAM & Storage Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* RAM */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1.5">
                    {language === 'hi' ? '4. रैम (RAM):' : '4. RAM:'}
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {['3GB', '4GB', '6GB', '8GB', '12GB', '16GB+'].map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setCustomRam(r)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          customRam === r
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={customRam}
                    onChange={e => setCustomRam(e.target.value)}
                    placeholder="कस्टम RAM (e.g. 8GB)"
                    className="w-full p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-xs font-semibold"
                  />
                </div>

                {/* Storage */}
                <div>
                  <label className="font-bold text-slate-800 block mb-1.5 flex items-center justify-between">
                    <span>{language === 'hi' ? '5. इंटरनल स्टोरेज (ROM):' : '5. Storage:'}</span>
                    <span className="text-[10px] text-emerald-600 font-bold">256GB+ पर डेड बोनस</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setCustomStorage(s)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          customStorage === s
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={customStorage}
                    onChange={e => setCustomStorage(e.target.value)}
                    placeholder="कस्टम स्टोरेज (e.g. 256GB)"
                    className="w-full p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* 5. Condition Selection (Flawless, Good, Average, Damaged, Dead) */}
              <div>
                <label className="font-bold text-slate-800 block mb-1.5">
                  {language === 'hi' ? '6. फोन की मौजूदा हालत (Condition):' : '6. Phone Physical Condition:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(Object.keys(CONDITION_CRITERIA) as ConditionGrade[]).map(grade => {
                    const info = CONDITION_CRITERIA[grade];
                    const isSelected = customCondition === grade;
                    return (
                      <div
                        key={grade}
                        onClick={() => setCustomCondition(grade)}
                        role="button"
                        tabIndex={0}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                            : 'bg-slate-50/70 border-slate-200 hover:bg-white'
                        } ${grade === 'dead' ? 'sm:col-span-2' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${info.badgeColor}`}>
                            {info.label}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {info.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 6. Color Selection */}
              <div>
                <label className="font-bold text-slate-800 block mb-1.5">
                  {language === 'hi' ? '7. फोन का रंग (Color):' : '7. Phone Color:'}
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {['Black', 'Blue', 'Silver / White', 'Gold', 'Green', 'Grey'].map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setCustomColor(col)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        customColor === col
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={customColor}
                  onChange={e => setCustomColor(e.target.value)}
                  placeholder="उदा: Midnight Blue, Sunset Gold..."
                  className="w-full p-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-xs font-semibold"
                />
              </div>

              {/* 7. Approximate Purchase MRP Price */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-slate-800">
                    {language === 'hi' ? '8. खरीद के समय नई कीमत (MRP):' : '8. Original MRP / Purchase Price:'}
                  </label>
                  <span className="font-black text-blue-600 text-sm">
                    {formatINR(customEstimatedPrice)}
                  </span>
                </div>
                <input
                  type="range"
                  min="6000"
                  max="140000"
                  step="2000"
                  value={customEstimatedPrice}
                  onChange={e => setCustomEstimatedPrice(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer mb-1"
                />
                <div className="flex flex-wrap gap-1.5">
                  {[8000, 15000, 25000, 45000, 75000].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setCustomEstimatedPrice(val)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        customEstimatedPrice === val
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {formatINR(val)}
                    </button>
                  ))}
                </div>
              </div>

              {/* 8. Accessories Checkboxes */}
              <div className="pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-800 block mb-1.5">
                  {language === 'hi' ? '9. उपलब्ध ओरिजिनल सामान (अतिरिक्त कैश बोनस):' : '9. Available Original Accessories:'}
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomHasOriginalBox(!customHasOriginalBox)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      customHasOriginalBox ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${customHasOriginalBox ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>{language === 'hi' ? 'ओरिजिनल बॉक्स (+₹400)' : 'Original Box (+₹400)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomHasOriginalCharger(!customHasOriginalCharger)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      customHasOriginalCharger ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${customHasOriginalCharger ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>{language === 'hi' ? 'ओरिजिनल चार्जर (+₹350)' : 'Original Charger (+₹350)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomHasValidBill(!customHasValidBill)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      customHasValidBill ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${customHasValidBill ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <span>{language === 'hi' ? 'बिल / इनवॉइस (+₹600)' : 'Original Bill (+₹600)'}</span>
                  </button>
                </div>
              </div>

              {/* Surat Doorstep Guarantee Info */}
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-[11px] leading-relaxed">
                💡 <strong>सूरत डोरस्टेप पिकअप:</strong> यह कस्टम विवरण तुरंत AI वैल्यूएशन में लोड हो जाएगा। सूरत में 2 घंटे में फ्री पिकअप और मौके पर टेक्नीशियन द्वारा <strong>स्पॉट बोनस</strong> भी मिलेगा!
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomModelModalOpen(false)}
                  className="w-1/3 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer text-center"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>⚡</span>
                  <span>{language === 'hi' ? 'तुरंत AI वैल्यूएशन निकालें' : 'Calculate AI Valuation'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
