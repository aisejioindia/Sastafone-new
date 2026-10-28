import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BRANDS,
  PHONE_MODELS,
  REPAIR_ISSUES,
  RAZORPAY_REPAIR_VISIT_LINK,
  SASTAPHONE_SUPER_LABS,
  CUSTOMER_REPAIR_REVIEWS
} from '../data/mockData';
import { Brand, PhoneModel, RepairIssue, CustomerRepairReview } from '../types';
import { formatINR, generateWhatsAppLink } from '../utils/valuation';
import {
  Wrench,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Sparkles,
  Truck,
  CreditCard,
  QrCode,
  Wallet,
  ArrowRight,
  RotateCcw,
  ExternalLink,
  Building2,
  Cpu,
  Video,
  Star,
  Share2,
  ThumbsUp,
  MapPin,
  AlertTriangle,
  ShieldAlert,
  CheckSquare,
  Square,
  FileText,
  Receipt,
  BadgePercent,
  Check,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BrandLogo } from './BrandLogo';

export const RepairServiceSection: React.FC = () => {
  const {
    language,
    selectedLocality,
    addOrder,
    orders,
    setIsDashboardOpen,
    user,
    setIsBrandCentersModalOpen,
    setIsReviewModalOpen: openGlobalReviewModal,
    setPrefillReviewOrder,
    openPaymentModal,
    setIsProAuditModalOpen,
    setSelectedAuditOrder,
    setIsAdminModalOpen
  } = useApp();

  const [selectedBrand, setSelectedBrand] = useState<Brand>(BRANDS[0]);
  const [selectedModel, setSelectedModel] = useState<PhoneModel>(PHONE_MODELS[0]);
  const [selectedIssues, setSelectedIssues] = useState<RepairIssue[]>([REPAIR_ISSUES[0]]);
  const [hasAcceptedFraudTerms, setHasAcceptedFraudTerms] = useState(false);
  const [fraudTermsError, setFraudTermsError] = useState(false);
  const [showBillBreakdown, setShowBillBreakdown] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('Today (Within 30-45 Mins)');
  const [addressInput, setAddressInput] = useState(user.address || `Near Main Road, ${selectedLocality}`);
  const [customerNameInput, setCustomerNameInput] = useState(user.name || 'Surat Resident');
  const [customerPhoneInput, setCustomerPhoneInput] = useState(user.phone || '9372802044');

  // Multi-Issue & Pricing Calculations
  const hasStrictDiagnostic = selectedIssues.some(i => i.isStrictDiagnostic);
  const isMakeoverSelected = selectedIssues.some(i => i.isMakeoverCombo);
  const makeoverCombo = REPAIR_ISSUES.find(i => i.isMakeoverCombo) || REPAIR_ISSUES[0];

  const toggleIssue = (issue: RepairIssue) => {
    if (issue.isMakeoverCombo) {
      if (isMakeoverSelected) {
        // Unselect makeover, fall back to screen
        setSelectedIssues([REPAIR_ISSUES[1]]);
      } else {
        // Select makeover combo exclusively
        setSelectedIssues([issue]);
      }
      return;
    }

    // If regular issue clicked while makeover was active, switch to regular selection
    const baseList = isMakeoverSelected ? [] : selectedIssues;
    const isAlreadySelected = baseList.some(i => i.id === issue.id);

    if (isAlreadySelected) {
      if (baseList.length === 1) {
        return; // कम से कम 1 समस्या चुनी होनी चाहिए
      }
      setSelectedIssues(baseList.filter(i => i.id !== issue.id));
    } else {
      setSelectedIssues([...baseList, issue]);
    }
  };

  const selectMakeoverCombo = () => {
    if (makeoverCombo) {
      setSelectedIssues([makeoverCombo]);
    }
  };

  const rawMinTotal = selectedIssues.reduce((sum, item) => sum + item.minPrice, 0);
  const rawMaxTotal = selectedIssues.reduce((sum, item) => sum + item.maxPrice, 0);

  // Combo Discount Logic:
  // यदि 'मेरा फोन नया जैसा बनाओ' मेगा कॉम्बो है, तो वह पहले से ही कॉम्बो रेट में है।
  // यदि अलग-अलग 2 समस्याएं हैं: 10% छूट
  // यदि अलग-अलग 3+ समस्याएं हैं: 15% छूट
  const comboDiscountPct = isMakeoverSelected ? 0 : selectedIssues.length >= 3 ? 0.15 : selectedIssues.length === 2 ? 0.10 : 0;
  const comboDiscountMin = Math.round(rawMinTotal * comboDiscountPct);
  const comboDiscountMax = Math.round(rawMaxTotal * comboDiscountPct);

  const estimatedMinTotal = Math.max(199, rawMinTotal - comboDiscountMin);
  const estimatedMaxTotal = Math.max(199, rawMaxTotal - comboDiscountMax);

  const issuesSummaryHindi = selectedIssues.map(i => i.hindiName).join(' + ');
  const issuesSummaryEng = selectedIssues.map(i => i.name).join(' + ');
  const primaryIssue = selectedIssues[0] || REPAIR_ISSUES[0];

  // Appointment Visit Charge States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState<'details' | 'payment'>('details');
  const [paymentOption, setPaymentOption] = useState<'razorpay_direct' | 'upi_instant' | 'pay_at_doorstep'>('razorpay_direct');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isSuccessBooked, setIsSuccessBooked] = useState(false);

  // Customer Review Submission State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewName, setReviewName] = useState(user.name || 'Happy Surat Customer');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewsList, setReviewsList] = useState<CustomerRepairReview[]>(CUSTOMER_REPAIR_REVIEWS);
  const [isCustomRepairModalOpen, setIsCustomRepairModalOpen] = useState(false);
  const [customRepairBrand, setCustomRepairBrand] = useState('Realme');
  const [customRepairModelName, setCustomRepairModelName] = useState('');
  const [customRepairSpecs, setCustomRepairSpecs] = useState('8GB RAM / 128GB (5G)');
  const [isCustomRepairModelActive, setIsCustomRepairModelActive] = useState(false);

  const brandModels = PHONE_MODELS.filter(m => m.brandId === selectedBrand.id);

  const handleBrandChange = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsCustomRepairModelActive(false);
    const models = PHONE_MODELS.filter(m => m.brandId === brand.id);
    if (models.length > 0) {
      setSelectedModel(models[0]);
    }
  };

  const handleApplyCustomRepairModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRepairModelName.trim()) return;
    const customPhone: PhoneModel = {
      id: `custom-repair-${Date.now()}`,
      brandId: customRepairBrand.toLowerCase(),
      name: `${customRepairBrand} ${customRepairModelName} ${customRepairSpecs ? `(${customRepairSpecs})` : ''}`,
      baseValuation: 20000,
      imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&auto=format&fit=crop&q=80',
      variants: [{ storage: '128GB', priceModifier: 0 }],
      colors: [{ name: 'Default', hex: '#334155' }],
      category: 'midrange'
    };
    setSelectedModel(customPhone);
    setIsCustomRepairModelActive(true);
    setIsCustomRepairModalOpen(false);
  };

  const handleOpenAppointmentPayment = () => {
    if (hasStrictDiagnostic && !hasAcceptedFraudTerms) {
      setFraudTermsError(true);
      return;
    }
    setFraudTermsError(false);
    setIsModalOpen(false);

    const titleIssueText = selectedIssues.length > 1
      ? `${selectedIssues.length} समस्याएं (${selectedIssues[0].hindiName} + अन्य)`
      : selectedIssues[0].hindiName;

    openPaymentModal({
      type: 'appointment_199',
      title: `${selectedModel.name} - ${titleIssueText}`,
      titleHindi: `घर पर रिपेयर अपॉइंटमेंट (₹199 विज़िट टोकन)`,
      amount: 199,
      description: `${issuesSummaryEng} • ₹199 विज़िट टोकन (₹99 रिफंडेबल)`,
      descriptionHindi: `₹199 विज़िट टोकन: फोन रिपेयर होने पर फाइनल बिल में माइनस होगा। यदि फोन नहीं बन सका तो ₹99 तुरंत रिफंड होगा।`,
      refundNote: `फोन रिपेयर होने पर ₹199 फाइनल बिल में एडजस्ट होगा। यदि फोन ठीक नहीं हो सका तो ₹99 तुरंत रिफंड किया जाएगा।`,
      repairDetails: {
        modelName: selectedModel.name,
        issueName: `${titleIssueText} (${formatINR(estimatedMinTotal)} - ${formatINR(estimatedMaxTotal)})`,
        locality: selectedLocality,
        address: addressInput || `${selectedLocality}, Surat`,
        timeSlot: selectedTimeSlot,
        customerName: customerNameInput || user.name || 'Surat Resident',
        customerPhone: customerPhoneInput || user.phone || '9825012345'
      }
    });
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasStrictDiagnostic && !hasAcceptedFraudTerms) {
      setFraudTermsError(true);
      return;
    }
    setFraudTermsError(false);
    handleOpenAppointmentPayment();
  };

  const handleConfirmAndPay = () => {
    if (hasStrictDiagnostic && !hasAcceptedFraudTerms) {
      setFraudTermsError(true);
      setBookingStep('details');
      return;
    }
    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);

      const titleIssueText = selectedIssues.length > 1
        ? `${selectedIssues.length} समस्याएं (${selectedIssues[0].hindiName} + अन्य)`
        : selectedIssues[0].hindiName;

      addOrder({
        type: 'repair',
        title: `${selectedModel.name} - ${titleIssueText}`,
        subtitle: `${issuesSummaryHindi} • अनुमानित बिल: ${formatINR(estimatedMinTotal)} - ${formatINR(estimatedMaxTotal)} • ₹199 विज़िट टोकन`,
        amount: 199,
        status: 'technician_assigned',
        statusHindi: 'टेक्नीशियन होम विज़िट के लिए असाइन हुआ',
        locality: selectedLocality,
        fullAddress: addressInput || `${selectedLocality}, Surat`,
        customerName: customerNameInput || 'Customer',
        customerPhone: customerPhoneInput || '9825012345',
        timeSlot: selectedTimeSlot,
        technicianName: 'Sanjay Prajapati (Sastaphone Doorstep Lead)',
        technicianPhone: 'ऑफ़िशियल हब',
        visitCharge: 199,
        paymentMethod:
          paymentOption === 'razorpay_direct'
            ? 'सस्ताफोन पे (Sastaphone Pay 100% सिक्योर)'
            : paymentOption === 'upi_instant'
            ? 'ऑनलाइन UPI (GPay / PhonePe / Paytm)'
            : 'Pay at Doorstep (Cash/UPI)',
        paymentStatus: paymentOption === 'pay_at_doorstep' ? 'pay_on_visit' : 'paid',
        refundPolicyNote: 'फोन रिपेयर होने पर ₹199 फाइनल बिल में माइनस होगा। फोन रिपेयर न होने पर ₹99 तुरंत रिफंड होगा।'
      });

      confetti({
        particleCount: 90,
        spread: 65,
        origin: { y: 0.6 }
      });

      setIsSuccessBooked(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setIsSuccessBooked(false);
        setBookingStep('details');
        setIsDashboardOpen(true);
      }, 1600);
    }, 1200);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    const newRev: CustomerRepairReview = {
      id: 'rev-' + Date.now(),
      customerName: reviewName,
      locality: selectedLocality,
      phoneModel: selectedModel.name,
      issueFixed: issuesSummaryHindi,
      rating: reviewRating,
      comment: reviewComment || 'फोन बहुत बढ़िया से रिपेयर हुआ। समय पर सर्विस मिली!',
      date: 'Just now',
      verifiedRepair: true
    };
    setReviewsList([newRev, ...reviewsList]);
    setIsReviewModalOpen(false);
    confetti({ particleCount: 60, spread: 50 });
  };

  return (
    <section id="repair-section" className="py-8 bg-slate-50 border-b border-slate-200">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-black mb-2">
            <Wrench className="w-3.5 h-3.5 text-blue-600" />
            <span>घर बैठे मोबाइल रिपेयरिंग (Doorstep in 30 Mins)</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
            सूरत में अपने घर पर 30 मिनट में रिपेयर करवाएं
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            स्क्रीन क्रैक, बैटरी ड्रेन, हीटिंग व हैंगिंग प्रॉब्लम का लाइव समाधान। केवल ₹199 में होम विज़िट बुक करें (रिपेयरिंग पर यह ₹199 बिल में एडजस्ट होगा)।
          </p>

          {/* Visit Fee & Razorpay Badge */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <a
              href={RAZORPAY_REPAIR_VISIT_LINK}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 p-2 px-3.5 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white text-xs font-bold shadow-md hover:scale-105 transition-all"
            >
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>Razorpay गेटवे से ₹199 बुक करें (Official Link)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => setIsBrandCentersModalOpen(true)}
              className="inline-flex items-center gap-1.5 p-2 px-3 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-bold shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>सूरत के आधिकारिक ब्रांड सर्विस सेंटर देखें</span>
            </button>
          </div>
        </div>

        {/* 1. Brand & Model Picker */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs mb-6">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            1. अपना फोन ब्रांड चुनें (Samsung, Moto, Vivo, Oppo, Tecno, Realme, Xiaomi, OnePlus, iQOO, Apple, CMF, Lava आदि):
          </h3>
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
            {BRANDS.map(brand => {
              const isSelected = selectedBrand.id === brand.id;
              return (
                <button
                  key={brand.id}
                  onClick={() => handleBrandChange(brand)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <BrandLogo brandId={brand.id} size="sm" inverted={isSelected} />
                  <span>{brand.name}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              मॉडल (September 2026 तक के लेटेस्ट मॉडल्स):
            </h3>
            <div className="flex flex-wrap gap-2">
              {brandModels.map(model => {
                const isSelected = selectedModel.id === model.id && !isCustomRepairModelActive;
                return (
                  <button
                    key={model.id}
                    onClick={() => {
                      setIsCustomRepairModelActive(false);
                      setSelectedModel(model);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {model.name}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setIsCustomRepairModalOpen(true)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                  isCustomRepairModelActive
                    ? 'bg-amber-400 text-slate-950 border-amber-500 font-black'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                }`}
              >
                <span>✍️</span>
                <span>
                  {isCustomRepairModelActive
                    ? `✓ कस्टम मॉडल: ${selectedModel.name}`
                    : '+ अन्य / अनलिस्टेड मॉडल दर्ज करें'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Problem Selector (Multi-Selection Enabled + Strict Anti-Fraud Diagnostic) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-slate-900">
                  2. फोन की समस्या (प्रॉब्लम) चुनें:
                </h3>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  मल्टी-सिलेक्ट उपलब्ध
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                जितनी भी समस्याएं हैं उन सभी पर टिक करें — एक साथ रिपेयर पर 15% तक कॉम्बो छूट और पारदर्शी बिल मिलेगा।
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-black bg-slate-900 text-white px-3 py-1 rounded-full shadow-2xs">
                {selectedIssues.length} चुनी गई समस्या{selectedIssues.length > 1 ? 'एं' : ''}
              </span>
              {selectedIssues.length > 1 && (
                <button
                  type="button"
                  onClick={() => setSelectedIssues([REPAIR_ISSUES[0]])}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  रीसेट
                </button>
              )}
            </div>
          </div>

          {/* VIP Showcase Banner: मेरा फोन बिल्कुल नया जैसा बनाओ (6-इन-1 मेगा मेकओवर कॉम्बो) */}
          <div className={`mb-5 p-4 sm:p-5 rounded-3xl border-2 transition-all relative overflow-hidden ${
            isMakeoverSelected
              ? 'bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-blue-500/15 border-amber-500 shadow-lg ring-2 ring-amber-400/40'
              : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white border-amber-400/30 shadow-md'
          }`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-[11px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <span>🌟 सुपर-पॉपुलर कॉम्बो</span>
                  </span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    isMakeoverSelected
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-white/10 text-amber-200 border-white/20'
                  }`}>
                    शो-रूम कंडीशन • 6 पार्ट्स व सर्विसेज एक साथ
                  </span>
                </div>

                <h4 className={`text-base sm:text-lg font-black tracking-tight ${
                  isMakeoverSelected ? 'text-slate-950' : 'text-white'
                }`}>
                  🌟 मेरा फोन बिल्कुल नया जैसा बनाओ (ऑल-इन-वन मेगा मेकओवर कॉम्बो)
                </h4>

                <p className={`text-xs leading-relaxed ${
                  isMakeoverSelected ? 'text-slate-700' : 'text-slate-300'
                }`}>
                  अगर आपका फोन पुराना, टूटा या सुस्त हो गया है, तो अलग-अलग कराने की बजाय यह पूरा कम्प्लीट पैकेज चुनें:
                </p>

                {/* 6 Included Items Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                  <div className={`p-2 rounded-xl flex items-center gap-1.5 font-bold ${
                    isMakeoverSelected ? 'bg-white text-slate-900 border border-amber-200 shadow-2xs' : 'bg-white/10 text-white'
                  }`}>
                    <span className="text-emerald-400">✓</span>
                    <span>1. नया डिस्प्ले व टच स्क्रीन</span>
                  </div>
                  <div className={`p-2 rounded-xl flex items-center gap-1.5 font-bold ${
                    isMakeoverSelected ? 'bg-white text-slate-900 border border-amber-200 shadow-2xs' : 'bg-white/10 text-white'
                  }`}>
                    <span className="text-emerald-400">✓</span>
                    <span>2. नई 100% ओरिजिनल बैटरी</span>
                  </div>
                  <div className={`p-2 rounded-xl flex items-center gap-1.5 font-bold ${
                    isMakeoverSelected ? 'bg-white text-slate-900 border border-amber-200 shadow-2xs' : 'bg-white/10 text-white'
                  }`}>
                    <span className="text-emerald-400">✓</span>
                    <span>3. नया बैक पैनल / बॉडी कवर</span>
                  </div>
                  <div className={`p-2 rounded-xl flex items-center gap-1.5 font-bold ${
                    isMakeoverSelected ? 'bg-white text-slate-900 border border-amber-200 shadow-2xs' : 'bg-white/10 text-white'
                  }`}>
                    <span className="text-emerald-400">✓</span>
                    <span>4. नया कैमरा लेंस ग्लास</span>
                  </div>
                  <div className={`p-2 rounded-xl flex items-center gap-1.5 font-bold ${
                    isMakeoverSelected ? 'bg-white text-slate-900 border border-amber-200 shadow-2xs' : 'bg-white/10 text-white'
                  }`}>
                    <span className="text-emerald-400">✓</span>
                    <span>5. 9D प्रीमियम टेम्पर्ड ग्लास</span>
                  </div>
                  <div className={`p-2 rounded-xl flex items-center gap-1.5 font-bold ${
                    isMakeoverSelected ? 'bg-white text-slate-900 border border-amber-200 shadow-2xs' : 'bg-white/10 text-white'
                  }`}>
                    <span className="text-emerald-400">✓</span>
                    <span>6. डीप क्लीनिंग व थर्मल सर्विस</span>
                  </div>
                </div>

                {/* Price Comparison */}
                <div className={`pt-1 flex flex-wrap items-center gap-2 sm:gap-4 text-xs ${
                  isMakeoverSelected ? 'text-slate-800' : 'text-slate-200'
                }`}>
                  <span className="line-through text-slate-400 text-[11px]">
                    अलग-अलग कुल: ₹3,394 - ₹7,894
                  </span>
                  <span className="font-black text-amber-500 text-sm bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/30">
                    कॉम्बो डील: केवल {formatINR(makeoverCombo.minPrice)} - {formatINR(makeoverCombo.maxPrice)}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                    🎉 सीधी ₹1,500 से ₹3,400 की बचत!
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex flex-col gap-2 w-full lg:w-auto">
                <button
                  type="button"
                  onClick={selectMakeoverCombo}
                  className={`py-3 px-5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                    isMakeoverSelected
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400'
                      : 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 hover:scale-102'
                  }`}
                >
                  <span>{isMakeoverSelected ? '✓ मेकओवर कॉम्बो चुना हुआ है' : '🌟 यह पूरा कॉम्बो चुनें (₹2,499 से शुरू)'}</span>
                </button>
                <p className={`text-[10px] text-center ${isMakeoverSelected ? 'text-slate-500' : 'text-slate-400'}`}>
                  सूरत में 45-60 मिनट में होम विज़िट पर कम्प्लीट मेकओवर
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              {isMakeoverSelected
                ? 'या अलग-अलग पार्ट्स चुनने के लिए नीचे से सिलेक्ट करें:'
                : 'अलग-अलग पार्ट्स या स्पेसिफिक खराबी चुनें:'}
            </h4>
            <span className="text-[11px] text-slate-400">
              प्रत्येक पार्ट का अलग-अलग पारदर्शी रेट
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {REPAIR_ISSUES.map(issue => {
              const isSelected = selectedIssues.some(i => i.id === issue.id);
              const isStrict = issue.isStrictDiagnostic;
              const isCombo = issue.isMakeoverCombo;

              return (
                <div
                  key={issue.id}
                  onClick={() => toggleIssue(issue)}
                  role="button"
                  tabIndex={0}
                  className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between relative select-none ${
                    isCombo
                      ? isSelected
                        ? 'bg-gradient-to-br from-amber-50 to-emerald-50 border-amber-500 ring-2 ring-amber-500/40 shadow-md col-span-1 sm:col-span-2'
                        : 'bg-amber-50/40 hover:bg-amber-50/70 border-amber-300 hover:border-amber-400 col-span-1 sm:col-span-2'
                      : isStrict
                      ? isSelected
                        ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-500/30 shadow-md'
                        : 'bg-rose-50/40 hover:bg-rose-50/70 border-rose-200 hover:border-rose-300'
                      : isSelected
                      ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-slate-50/70 hover:bg-white border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shadow-2xs ${
                          isCombo
                            ? 'bg-gradient-to-br from-amber-500 to-yellow-500 text-slate-950 font-black'
                            : isStrict
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-blue-600 border border-slate-200'
                        }`}>
                          {isCombo
                            ? '🌟'
                            : isStrict
                            ? '⚠️'
                            : issue.category === 'screen'
                            ? '📱'
                            : issue.category === 'battery'
                            ? '🔋'
                            : issue.category === 'body'
                            ? '🔲'
                            : issue.category === 'camera'
                            ? '📷'
                            : issue.category === 'protection'
                            ? '🛡️'
                            : issue.category === 'service'
                            ? '✨'
                            : issue.category === 'charging'
                            ? '⚡'
                            : issue.category === 'audio'
                            ? '🔊'
                            : issue.category === 'network'
                            ? '📶'
                            : '🔧'}
                        </span>
                        {issue.popular && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            isCombo ? 'bg-amber-200 text-amber-950 font-black' : 'bg-amber-100 text-amber-900'
                          }`}>
                            {isCombo ? 'ALL-IN-ONE' : 'POPULAR'}
                          </span>
                        )}
                      </div>

                      {/* Checkbox indicator */}
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                        isSelected
                          ? isCombo
                            ? 'bg-amber-600 text-white'
                            : isStrict
                            ? 'bg-amber-600 text-white'
                            : 'bg-blue-600 text-white'
                          : 'border-2 border-slate-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h4 className={`font-bold text-xs sm:text-sm leading-snug ${
                        isCombo ? 'text-amber-950 font-black' : isStrict ? 'text-amber-950 font-black' : isSelected ? 'text-blue-950 font-black' : 'text-slate-900'
                      }`}>
                        {issue.hindiName}
                      </h4>
                    </div>

                    <p className="text-[10px] text-slate-500 line-clamp-1">{issue.name}</p>
                    <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">{issue.description}</p>

                    {/* If Makeover Combo, show the 6 items inside the card too */}
                    {isCombo && issue.comboItems && (
                      <div className="mt-2.5 p-2 rounded-xl bg-amber-100/60 border border-amber-200 space-y-1 text-[10px] text-amber-950 font-medium">
                        <p className="font-bold text-[11px] text-amber-900">📦 कॉम्बो में शामिल 6 सर्विसेज:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                          {issue.comboItems.map((item, i) => (
                            <span key={i} className="flex items-center gap-1">
                              <span className="text-emerald-600">✓</span>
                              <span className="truncate">{item}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        {isCombo ? 'कॉम्बो पैकेज चार्ज' : 'अलग से अनुमानित चार्ज'}
                      </span>
                      <span className={`text-xs font-black ${isCombo ? 'text-amber-900 font-black text-sm' : isStrict ? 'text-amber-800' : 'text-blue-700'}`}>
                        {formatINR(issue.minPrice)} - {formatINR(issue.maxPrice)}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {issue.estimatedTime}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Combo Savings Notice */}
          <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                <BadgePercent className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-900">
                  {comboDiscountPct > 0 ? (
                    <span className="text-emerald-700">
                      🎉 {Math.round(comboDiscountPct * 100)}% कॉम्बो मल्टी-प्रॉब्लम छूट लागू ({selectedIssues.length} समस्याएं चुनी गईं)
                    </span>
                  ) : (
                    <span>मल्टी-प्रॉब्लम कॉम्बो डिस्काउंट उपलब्ध</span>
                  )}
                </p>
                <p className="text-[11px] text-slate-600">
                  एक ही बार फोन खुलने पर लेबर व टेस्टिंग चार्ज कम हो जाता है (2 समस्याओं पर 10%, 3+ पर 15% छूट)।
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowBillBreakdown(!showBillBreakdown)}
              className="text-xs font-bold text-blue-700 bg-white hover:bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>{showBillBreakdown ? 'विस्तृत बिल छुपाएं' : 'लाइव आइटम बिल देखें'}</span>
            </button>
          </div>

          {/* Strict Anti-Fraud / "पता नहीं क्या हुआ / अचानक बंद फोन" Protection Protocol Box */}
          {hasStrictDiagnostic && (
            <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-400 text-slate-900 space-y-3 animate-in fade-in duration-200 shadow-sm">
              <div className="flex items-start gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-amber-950 flex items-center gap-2">
                    <span>⚠️ 'पता नहीं क्या हुआ / अचानक बंद फोन' - सख्त शॉपकीपर व टेक्नीशियन सुरक्षा नियम</span>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                      Anti-Fraud Guard
                    </span>
                  </h4>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    सूरत मोबाइल टेक्नीशियन सुरक्षा व ईमानदार ग्राहक पॉलिसी (समय की बर्बादी व झूठे आरोपों से बचाव)
                  </p>
                </div>
              </div>

              <div className="bg-white/90 p-3.5 rounded-xl border border-amber-200 text-xs text-slate-700 space-y-2">
                <p className="leading-relaxed">
                  काफी बार ग्राहक फोन पानी में गिरने (लिक्विड डैमेज), पहले किसी लोकल दुकान पर खुला होने, या शॉर्ट सर्किट की बात छुपाकर <em>"पता नहीं क्या हुआ, बस अचानक बंद हो गया... आप देख लो मुझे बता देना कितना खर्चा होगा"</em> कहते हैं और बाद में शॉपकीपर पर पुरानी खराबी का दोष मढ़ते हैं या बिना काम कराए समय खराब करते हैं। इसके लिए हमारे सख्त नियम हैं:
                </p>

                <ul className="space-y-1.5 text-[11px] list-disc list-inside text-slate-800">
                  <li>
                    <strong>1. हाई-टेक माइक्रोस्कोप व थर्मल वीडियो जांच:</strong> फोन खोलने से पहले और खोलते ही मदरबोर्ड की स्थिति, पानी के जंग (ऑक्सीडेशन), और पहले से जली/छेड़ी गई आईसी का डिजिटल फोटो/वीडियो रिकॉर्ड लिया जाएगा। पहले की छिपी खराबी के लिए टेक्नीशियन जिम्मेदार नहीं होगा।
                  </li>
                  <li>
                    <strong>2. एडवांस ₹199 टोकन (टाइम-पास सुरक्षा):</strong> केवल फॉल्ट पूछकर समय बर्बाद करने से रोकने के लिए ₹199 टोकन अनिवार्य है। <strong>यदि आप फोन बनवाते हैं, तो यह ₹199 आपके फाइनल बिल में 100% एडजस्ट (माफ) हो जाएगा (यानी जांच मुफ़्त)!</strong>
                  </li>
                  <li>
                    <strong>3. डेटा व ईएमएमसी सेफ्टी रिस्क:</strong> अचानक बंद या मदरबोर्ड शॉर्ट फोन में इंटरनल मेमोरी करप्ट होने का जोखिम रहता है। डेटा बैकअप की जिम्मेदारी ग्राहक की स्वयं की होगी।
                  </li>
                </ul>
              </div>

              {/* Mandatory Customer Digital Undertaking Checkbox */}
              <label
                className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  hasAcceptedFraudTerms
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-xs ring-1 ring-emerald-400'
                    : fraudTermsError
                    ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-400 text-rose-950'
                    : 'bg-white border-amber-300 text-slate-900 hover:border-amber-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={hasAcceptedFraudTerms}
                  onChange={e => {
                    setHasAcceptedFraudTerms(e.target.checked);
                    if (e.target.checked) setFraudTermsError(false);
                  }}
                  className="mt-0.5 w-4 h-4 text-emerald-600 rounded shrink-0 cursor-pointer"
                />
                <span className="text-xs font-bold leading-snug">
                  ✓ मैं प्रमाणित करता/करती हूँ कि मैंने फोन में कोई पूर्व वाटर (पानी) डैमेज या अन्य दुकान की छेड़छाड़ नहीं छिपाई है और मैं ₹199 डायग्नोस्टिक व नो-डेटा-लॉस सुरक्षा शर्तों से पूर्णतः सहमत हूँ।
                </span>
              </label>

              {fraudTermsError && !hasAcceptedFraudTerms && (
                <p className="text-xs text-rose-700 font-bold flex items-center gap-1.5 animate-bounce">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>आगे बढ़ने से पहले कृपया ऊपर दी गई अंडरटेकिंग को स्वीकार (चेक) करें।</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* 3. AI Demo Price Card & Itemized Bill Breakdown */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-blue-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 space-y-4">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI डायनेमिक मल्टी-प्रॉब्लम एस्टीमेटर</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black">
                  {selectedModel.name}
                </h3>
                <p className="text-xs text-blue-100 mt-0.5">
                  चयनित: <strong>{selectedIssues.length} समस्याएं</strong> ({issuesSummaryHindi})
                </p>
              </div>

              {/* Selected Problems Badges */}
              <div className="flex flex-wrap gap-1.5">
                {selectedIssues.map(issue => (
                  <span
                    key={issue.id}
                    className="text-[11px] font-bold bg-white/15 border border-white/25 px-2.5 py-1 rounded-xl flex items-center gap-1"
                  >
                    <span>✓</span>
                    <span>{issue.hindiName}</span>
                    <span className="text-amber-300 font-mono text-[10px]">
                      ({formatINR(issue.minPrice)})
                    </span>
                  </span>
                ))}
              </div>

              {/* Live Itemized Bill Calculation Box */}
              <div className="p-4 rounded-2xl bg-white/10 border border-white/20 space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-white/15 font-bold">
                  <span className="text-blue-100 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-amber-300" />
                    <span>आइटमवाइज़ रिपेयर बिल ब्रेकडाउन</span>
                  </span>
                  <span className="text-[11px] text-amber-300 font-semibold">
                    सूरत डोरस्टेप व लैब रेट
                  </span>
                </div>

                {/* Line items for each selected problem or Makeover Combo */}
                {isMakeoverSelected ? (
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xl bg-amber-400/15 border border-amber-300/30 text-amber-200">
                      <p className="font-bold text-xs text-amber-300 flex items-center gap-1.5 mb-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>6-in-1 कम्प्लीट मेकओवर पैकेज (सभी 6 शामिल):</span>
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-blue-100">
                        <div className="flex items-center justify-between">
                          <span>1. नया डिस्प्ले व टच स्क्रीन</span>
                          <span className="text-emerald-400 font-bold">✓ शामिल</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>2. नई 100% ओरिजिनल बैटरी</span>
                          <span className="text-emerald-400 font-bold">✓ शामिल</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>3. नया बैक पैनल / बॉडी कवर</span>
                          <span className="text-emerald-400 font-bold">✓ शामिल</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>4. नया कैमरा लेंस ग्लास</span>
                          <span className="text-emerald-400 font-bold">✓ शामिल</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>5. 9D प्रीमियम टेम्पर्ड ग्लास</span>
                          <span className="text-emerald-400 font-bold">✓ शामिल</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>6. डीप क्लीनिंग व थर्मल सर्विस</span>
                          <span className="text-emerald-400 font-bold">✓ शामिल</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-blue-200 text-[11px]">
                      <span>अलग-अलग पार्ट्स का कुल मूल्य:</span>
                      <span className="line-through text-slate-300 font-mono">₹3,394 - ₹7,894</span>
                    </div>

                    <div className="flex items-center justify-between text-emerald-300 font-bold text-xs bg-emerald-500/20 p-2 rounded-xl border border-emerald-400/30">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                        <span>मेकओवर कॉम्बो महा-बचत:</span>
                      </span>
                      <span>- ₹895 से ₹3,395 तक की सीधी छूट</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                      {selectedIssues.map((issue, idx) => (
                        <div key={issue.id} className="flex items-center justify-between text-blue-100 text-[11px]">
                          <span className="truncate pr-2">
                            {idx + 1}. {issue.hindiName}
                          </span>
                          <span className="font-mono text-white shrink-0">
                            {formatINR(issue.minPrice)} - {formatINR(issue.maxPrice)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Subtotal */}
                    <div className="pt-2 border-t border-white/15 flex items-center justify-between text-blue-200 text-xs">
                      <span>पार्ट्स व कंपोनेंट सबटोटल:</span>
                      <span className="font-bold text-white">
                        {formatINR(rawMinTotal)} - {formatINR(rawMaxTotal)}
                      </span>
                    </div>

                    {/* Combo Discount line if 2+ issues */}
                    {comboDiscountPct > 0 && (
                      <div className="flex items-center justify-between text-emerald-300 font-bold text-xs bg-emerald-500/20 p-2 rounded-xl border border-emerald-400/30">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                          <span>मल्टी-प्रॉब्लम कॉम्बो डिस्काउंट ({Math.round(comboDiscountPct * 100)}%):</span>
                        </span>
                        <span>- {formatINR(comboDiscountMin)} से {formatINR(comboDiscountMax)}</span>
                      </div>
                    )}

                    {/* Upsell recommendation to Full Makeover if 3+ items selected */}
                    {selectedIssues.length >= 3 && !isMakeoverSelected && (
                      <div className="p-2 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-between gap-2 text-[11px] text-amber-200">
                        <span>💡 टिप: 'मेरा फोन नया जैसा बनाओ' कॉम्बो में 6 चीजें ₹2,499 से मिल रही हैं!</span>
                        <button
                          type="button"
                          onClick={selectMakeoverCombo}
                          className="px-2 py-1 rounded bg-amber-400 text-slate-950 font-black text-[10px] shrink-0 cursor-pointer hover:bg-amber-300"
                        >
                          कॉम्बो चुनें
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Doorstep Token */}
                <div className="flex items-center justify-between text-xs text-blue-200">
                  <span>डोरस्टेप विज़िट व डायग्नोस्टिक टोकन:</span>
                  <span className="text-base font-black text-amber-300">₹199</span>
                </div>

                {/* Net Estimated Total */}
                <div className="pt-2.5 border-t border-white/20 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-blue-100 font-bold block">कुल अनुमानित रिपेयर बिल:</span>
                    <span className="text-[10px] text-amber-200">
                      (कॉम्बो छूट व पार्ट्स सहित)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-black text-amber-300 tracking-tight">
                      {formatINR(estimatedMinTotal)} - {formatINR(estimatedMaxTotal)}
                    </span>
                  </div>
                </div>

                {/* Guarantees */}
                <div className="pt-2 border-t border-white/10 text-[11px] text-amber-200 space-y-1">
                  <p className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>फोन रिपेयर होने पर ₹199 फाइनल बिल में एडजस्ट होगा (Visit Free)!</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-blue-100">
                    <RotateCcw className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>यदि फोन रिपेयर नहीं हो सका, तो ₹99 तुरंत रिफंड होगा।</span>
                  </p>
                </div>
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="lg:col-span-5 space-y-3 lg:pt-8">
              <button
                onClick={() => {
                  if (hasStrictDiagnostic && !hasAcceptedFraudTerms) {
                    setFraudTermsError(true);
                    return;
                  }
                  setFraudTermsError(false);
                  setBookingStep('details');
                  setIsModalOpen(true);
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Truck className="w-5 h-5 text-slate-950" />
                <span>₹199 में होम विज़िट बुक करें ({selectedLocality})</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAppointmentPayment}
                className="w-full py-2.5 px-4 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-amber-300" />
                <span>Razorpay सिक्योर लिंक से ₹199 सीधे पे करें</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <a
                href={generateWhatsAppLink('repair', {
                  modelName: selectedModel.name,
                  issue: `${issuesSummaryHindi} | कुल अनुमानित: ${formatINR(estimatedMinTotal)} - ${formatINR(estimatedMaxTotal)}${hasStrictDiagnostic ? ' [सख्त डायग्नोस्टिक अंडरटेकिंग स्वीकृत]' : ''}`,
                  locality: selectedLocality
                })}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-900/20"
              >
                <MessageCircle className="w-4 h-4" />
                <span>सूरत डेस्क से WhatsApp पर बात करें ({selectedIssues.length} प्रॉब्लम)</span>
              </a>

              {hasStrictDiagnostic && !hasAcceptedFraudTerms && (
                <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-400/40 text-[11px] text-rose-200 flex items-start gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>'पता नहीं क्या हुआ' विकल्प के लिए ऊपर दी गई डिजिटल अंडरटेकिंग टिक करना आवश्यक है।</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Technician & Admin Live Pro-Audit & Quotation Action Panel */}
        <div className="mb-8 p-4 sm:p-5 rounded-3xl bg-slate-900 text-white border-2 border-amber-400/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-black text-xl shrink-0 shadow-md">
              🛡️
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Technician Pro-Audit
                </span>
                <span className="text-xs text-amber-300 font-bold">
                  सख्त हार्डवेयर टेस्टिंग गाइड
                </span>
                <span className="text-[10px] bg-white/10 text-emerald-300 px-2 py-0.5 rounded-full border border-white/20">
                  IMEI • टच • OIS कैमरा • LCI वाटर चेक
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-black text-white mt-1">
                प्रमाणित हार्डवेयर टेस्टिंग व एडमिन फाइनल कोटेशन / QR कोड इंजन
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                रिपेयर कन्फर्म करने से पहले फोन के सभी हार्डवेयर की स्टेप-बाय-स्टेप लाइव टेस्टिंग करें, 10%-12% ऑफ देकर ₹1,600 जैसा स्पेशल प्राइस तय करें और पेमेंट QR कोड जनरेट करें।
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                const currentOrSampleOrder = orders.find(o => o.type === 'repair') || orders[0];
                setSelectedAuditOrder(currentOrSampleOrder);
                setIsProAuditModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md hover:scale-102"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>Pro-Audit चेकलिस्ट खोलें</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAdminModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md hover:scale-102"
            >
              <QrCode className="w-4 h-4 text-slate-900" />
              <span>एडमिन प्राइसिंग व पेमेंट QR</span>
            </button>
          </div>
        </div>

        {/* 4. Dedicated Trust & Central Super Cleanroom Lab Section (As Requested by User) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md mb-8">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                सूरत सेंट्रल टेक सुपर लैब (Top Repair Hubs & Patience Notice)
              </h3>
              <p className="text-xs text-slate-500">
                कम्प्यूटर-कंट्रोल्ड BGA माइक्रोस्कोप सोल्डरिंग व कर्व्ड ओएलईडी लेमिनेशन
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 text-amber-950 text-xs space-y-2 mb-6">
            <p className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>ग्राहक विश्वास व धैर्य (Trust & Patience Assurance):</span>
            </p>
            <p className="leading-relaxed">
              कुछ जटिल समस्याएं—जैसे <strong>मदरबोर्ड आईसी लेवल शॉर्ट सर्किट, डेड फोन रिकवरी, या एडवांस्ड कर्व्ड डिस्प्ले लेमिनेशन</strong>—डोरस्टेप पर जल्दबाजी में ठीक नहीं की जा सकतीं। ऐसे मामलों में आपका फोन पूरी सुरक्षा और लिखित पावती (Receipt) के साथ हमारे <strong>सूरत के टॉप सेंट्रल सुपर रिपेयर सेंटर</strong> में ले जाकर क्लीनरूम वातावरण में बनाया जाता है। इसके लिए आपको थोड़ा धैर्य (Patience) और विश्वास रखना होगा।
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-semibold text-slate-800">
              <span className="flex items-center gap-1">
                <Video className="w-3.5 h-3.5 text-blue-600" />
                ✓ 24x7 CCTV सिक्योर लैब्स
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ✓ 100% ओरिजिनल पार्ट्स व सील पैक
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                ✓ जीरो डेटा ब्रीच गारंटी
              </span>
            </div>
          </div>

          {/* Super Labs Directory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SASTAPHONE_SUPER_LABS.map(lab => (
              <div
                key={lab.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">{lab.name}</h4>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    ISO Certified
                  </span>
                </div>
                <p className="text-xs text-blue-600 font-semibold">{lab.tagline}</p>
                <p className="text-[11px] text-slate-600 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{lab.fullAddress}</span>
                </p>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600">
                  <span>लीड इंजीनियर: <strong>{lab.technicianLead}</strong></span>
                  <span className="text-blue-700 font-bold">{lab.averageTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Happy Customer Reviews & Social Media Share Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black mb-1">
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>हैप्पी कस्टमर रिव्यू व सोशल मीडिया शेयर</span>
              </div>
              <h3 className="text-lg sm:text-2xl font-black text-slate-900">
                सूरत के संतुष्ट ग्राहकों के अनुभव
              </h3>
              <p className="text-xs text-slate-500">
                जब आपका फोन बन जाए, तो अपना अनुभव शेयर करें और ₹100 का एक्स्ट्रा डिस्काउंट कूपन पाएं!
              </p>
            </div>

            <button
              onClick={() => {
                setPrefillReviewOrder({
                  id: 'temp-repair',
                  orderNumber: 'STP-SURAT-' + Math.floor(1000 + Math.random() * 9000),
                  type: 'repair',
                  title: `${selectedModel.name}`,
                  subtitle: issuesSummaryHindi,
                  amount: 199,
                  status: 'completed',
                  statusHindi: 'सफलतापूर्वक रिपेयर हुआ',
                  locality: selectedLocality,
                  fullAddress: addressInput,
                  customerName: customerNameInput,
                  customerPhone: customerPhoneInput,
                  date: 'Today',
                  timeSlot: selectedTimeSlot
                });
                openGlobalReviewModal(true);
              }}
              className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto flex items-center gap-1.5 cursor-pointer"
            >
              <Star className="w-4 h-4 fill-amber-300 text-amber-300" />
              <span>+ अपना रिव्यू व फीडबैक दें</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reviewsList.map(rev => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400">{rev.date}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{rev.phoneModel}</h4>
                  <p className="text-[11px] text-blue-700 font-semibold mb-2">✓ {rev.issueFixed}</p>
                  <p className="text-xs text-slate-600 italic leading-relaxed">"{rev.comment}"</p>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="font-bold text-slate-800 block">{rev.customerName}</span>
                    <span className="text-slate-500">📍 {rev.locality}</span>
                  </div>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`मेरा ${rev.phoneModel} Sastaphone Surat द्वारा सफलतापूर्वक रिपेयर हुआ! सूरत में घर बैठे बेहतरीन सर्विस: https://sastaphone.in`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold flex items-center gap-1"
                    title="WhatsApp पर शेयर करें"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>शेयर</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Submission Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                अपना रिपेयर फीडबैक व रिव्यू दर्ज करें
              </h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-3.5 text-xs text-left">
              <div>
                <label className="font-bold text-slate-700 block mb-1">रेटिंग दें:</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">आपका नाम:</label>
                <input
                  type="text"
                  required
                  value={reviewName}
                  onChange={e => setReviewName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">फोन का मॉडल व ठीक हुई समस्या:</label>
                <input
                  type="text"
                  readOnly
                  value={`${selectedModel.name} - ${issuesSummaryHindi}`}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-700"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">आपका अनुभव / कमेंट:</label>
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="टेक्नीशियन का व्यवहार कैसा था? क्या फोन सही से चल रहा है?..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>रिव्यू सबमिट करने पर आपको ₹100 डिस्काउंट कूपन कोड मिलेगा!</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                रिव्यू सबमिट करें व सोशल शेयर करें
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Repair Appointment Booking & Razorpay Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            {isSuccessBooked ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  अपॉइंटमेंट सफलतापूर्वक बुक हुआ!
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  सूरत हब के सर्टिफाइड टेक्नीशियन संजय प्रजापति {selectedTimeSlot} पर आपके घर पहुंचेंगे। ₹199 रिपेयर होने पर बिल में एडजस्ट होगा (यदि नहीं बना तो ₹99 रिफंड)।
                </p>
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs font-bold text-emerald-900">
                  ✓ आधिकारिक इनवॉइस स्लिप डैशबोर्ड में डाउनलोड के लिए तैयार है!
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base">
                      {bookingStep === 'details' ? 'डोरस्टेप रिपेयर अपॉइंटमेंट' : '₹199 विज़िट चार्ज पेमेंट'}
                    </h3>
                    <p className="text-xs text-blue-100 line-clamp-1">
                      {selectedModel.name} • {selectedIssues.length} समस्याएं ({issuesSummaryHindi})
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-5 overflow-y-auto space-y-4 flex-1">
                  {bookingStep === 'details' ? (
                    <form onSubmit={handleProceedToPayment} className="space-y-3.5 text-left text-xs">
                      {/* Selected Problems Summary */}
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between font-bold text-xs">
                          <span className="text-slate-800">चयनित समस्याएं ({selectedIssues.length}):</span>
                          <span className="text-blue-700 font-mono">
                            {formatINR(estimatedMinTotal)} - {formatINR(estimatedMaxTotal)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {selectedIssues.map(issue => (
                            <span key={issue.id} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-md font-semibold text-slate-700">
                              ✓ {issue.hindiName}
                            </span>
                          ))}
                        </div>
                        {comboDiscountPct > 0 && (
                          <p className="text-[10px] text-emerald-700 font-bold">
                            🎉 {Math.round(comboDiscountPct * 100)}% कॉम्बो मल्टी-रिपेयर छूट लागू है।
                          </p>
                        )}
                      </div>

                      {/* Strict Anti-Fraud Undertaking check if required */}
                      {hasStrictDiagnostic && (
                        <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                          hasAcceptedFraudTerms ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-amber-50 border-amber-300 text-amber-950'
                        }`}>
                          <div className="flex items-center gap-1.5 font-bold">
                            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>सख्त एंटी-फ्रॉड डायग्नोस्टिक अंडरटेकिंग</span>
                          </div>
                          <p className="text-[11px] text-slate-700 leading-tight">
                            फोन में पूर्व वाटर डैमेज, अनधिकृत छेड़छाड़ या डेड फोन की स्थिति छुपाई नहीं गई है। फोन रिपेयर होने पर ₹199 टोकन 100% माफ होगा।
                          </p>
                          <label className="flex items-start gap-2 pt-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={hasAcceptedFraudTerms}
                              onChange={e => {
                                setHasAcceptedFraudTerms(e.target.checked);
                                if (e.target.checked) setFraudTermsError(false);
                              }}
                              className="mt-0.5 w-4 h-4 text-emerald-600 rounded shrink-0 cursor-pointer"
                            />
                            <span className="text-[11px] font-bold text-slate-900 leading-snug">
                              मैं इस घोषणा व नो-डेटा-लॉस सुरक्षा शर्तों से पूर्णतः सहमत हूँ।
                            </span>
                          </label>
                        </div>
                      )}

                      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1.5">
                        <div className="flex items-center justify-between font-bold text-sm">
                          <span>विज़िट व डायग्नोसिस टोकन:</span>
                          <span className="text-base text-amber-800">₹199</span>
                        </div>
                        <ul className="text-[11px] text-amber-900 space-y-1 list-disc list-inside">
                          <li>
                            <strong>फोन रिपेयर होने पर:</strong> यह ₹199 आपके फाइनल रिपेयरिंग बिल में से <strong>घटा (Adjust)</strong> दिया जाएगा।
                          </li>
                          <li>
                            <strong>फोन न बन पाने पर:</strong> आपको <strong>₹99 तुरंत रिफंड</strong> मिल जाएगा।
                          </li>
                        </ul>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">सूरत इलाका (Locality):</label>
                        <div className="p-2.5 rounded-xl bg-slate-100 font-bold text-slate-900 flex items-center justify-between">
                          <span>📍 {selectedLocality}</span>
                          <span className="text-[10px] text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-200 font-bold">
                            Active Surat Hub
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">पूरा पता (घर / दुकान नं., लैंडमार्क):</label>
                        <textarea
                          rows={2}
                          required
                          value={addressInput}
                          onChange={e => setAddressInput(e.target.value)}
                          placeholder="उदा. फ्लैट 302, आनंद महल रोड, अडाजण, सूरत..."
                          className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">आपका नाम:</label>
                          <input
                            type="text"
                            required
                            value={customerNameInput}
                            onChange={e => setCustomerNameInput(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-xs"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">मोबाइल नंबर:</label>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            value={customerPhoneInput}
                            onChange={e => setCustomerPhoneInput(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 text-xs font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">होम विज़िट समय चुनें:</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['Today (30 Mins)', 'Today (4-6 PM)', 'Tomorrow Morning'].map(slot => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedTimeSlot(slot)}
                              className={`p-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                                selectedTimeSlot === slot
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                  : 'bg-slate-50 text-slate-700 border-slate-200'
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                      >
                        <span>आगे बढ़ें और ₹199 पेमेंट विकल्प चुनें</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-4 text-xs">
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] text-slate-500 block">होम विज़िट टोकन चार्ज:</span>
                          <span className="text-xl font-black text-slate-900">₹199</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full block">
                            ₹199 Bill Adjustment
                          </span>
                          <span className="text-[10px] text-amber-700 font-semibold">
                            ₹99 Refund Guarantee
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="font-bold text-slate-700 block">
                          ₹199 भुगतान का तरीका चुनें (Select Payment Option):
                        </label>

                        {/* Sastaphone Pay Instant Gateway Option */}
                        <div
                          onClick={() => setPaymentOption('razorpay_direct')}
                          role="button"
                          tabIndex={0}
                          className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                            paymentOption === 'razorpay_direct'
                              ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-700 text-white flex items-center justify-center font-black text-xs shadow-xs">
                              ₹
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                <span>सस्ताफोन पे (Sastaphone Pay - त्वरित UPI)</span>
                                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded font-bold">Fast</span>
                              </p>
                              <p className="text-[10px] text-slate-500">100% सुरक्षित डिजिटल पेमेंट • तुरंत बुकिंग कन्फर्मेशन</p>
                            </div>
                          </div>
                          <input
                            type="radio"
                            name="payment"
                            checked={paymentOption === 'razorpay_direct'}
                            onChange={() => setPaymentOption('razorpay_direct')}
                            className="text-blue-600"
                          />
                        </div>

                        {/* UPI Instant */}
                        <div
                          onClick={() => setPaymentOption('upi_instant')}
                          role="button"
                          tabIndex={0}
                          className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                            paymentOption === 'upi_instant'
                              ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                              <Wallet className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-xs">अन्य UPI (GPay / PhonePe / Paytm)</p>
                              <p className="text-[10px] text-slate-500">तुरंत कन्फर्मेशन और 30-मिनट में टेक्नीशियन</p>
                            </div>
                          </div>
                          <input
                            type="radio"
                            name="payment"
                            checked={paymentOption === 'upi_instant'}
                            onChange={() => setPaymentOption('upi_instant')}
                            className="text-blue-600"
                          />
                        </div>

                        {/* Pay at Doorstep */}
                        <div
                          onClick={() => setPaymentOption('pay_at_doorstep')}
                          role="button"
                          tabIndex={0}
                          className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                            paymentOption === 'pay_at_doorstep'
                              ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                              : 'bg-white border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                              <Truck className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-xs">घर पर आने के बाद दें (Cash / UPI at Doorstep)</p>
                              <p className="text-[10px] text-slate-500">टेक्नीशियन के घर पहुंचने पर ₹199 दें</p>
                            </div>
                          </div>
                          <input
                            type="radio"
                            name="payment"
                            checked={paymentOption === 'pay_at_doorstep'}
                            onChange={() => setPaymentOption('pay_at_doorstep')}
                            className="text-blue-600"
                          />
                        </div>
                      </div>

                      {paymentOption === 'razorpay_direct' && (
                        <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-200 space-y-1.5">
                          <p className="font-bold text-blue-950 flex items-center justify-between">
                            <span>सस्ताफोन पे (Sastaphone Pay):</span>
                            <span className="text-emerald-700 font-bold flex items-center gap-1 text-[10px] bg-emerald-100 px-2 py-0.5 rounded-full">
                              ✓ 100% सुरक्षित UPI
                            </span>
                          </p>
                          <p className="text-[10px] text-blue-800">
                            सस्ताफोन नेटवर्क द्वारा सुरक्षित 256-बिट एन्क्रिप्टेड भुगतान। फोन रिपेयर होने पर यह ₹199 बिल में एडजस्ट होगा, न बनने पर ₹99 तुरंत रिफंड।
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setBookingStep('details')}
                          className="w-1/3 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
                        >
                          वापस (Back)
                        </button>

                        <button
                          type="button"
                          disabled={isProcessingPayment}
                          onClick={handleConfirmAndPay}
                          className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isProcessingPayment ? (
                            <span>प्रोसेसिंग हो रही है...</span>
                          ) : (
                            <span>
                              {paymentOption === 'pay_at_doorstep'
                                ? 'अपॉइंटमेंट बुक करें (Pay ₹199 on Visit)'
                                : '₹199 पे करें व स्लॉट कन्फर्म करें'}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Custom Repair Phone Model Modal */}
      {isCustomRepairModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  ✍️ अनलिस्टेड मोबाइल रिपेयर दर्ज करें
                </h3>
                <p className="text-xs text-slate-500">
                  अगर आपका फोन लिस्ट में नहीं है, तो ब्रांड व मॉडल खुद भरें
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomRepairModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyCustomRepairModel} className="space-y-3.5 text-xs text-left">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  मोबाइल ब्रांड (कंपनी):
                </label>
                <div className="flex gap-2">
                  <select
                    value={customRepairBrand}
                    onChange={e => setCustomRepairBrand(e.target.value)}
                    className="w-1/2 p-2.5 rounded-xl border border-slate-200 bg-white font-semibold"
                  >
                    {BRANDS.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                    <option value="Other">अन्य (Other)</option>
                  </select>
                  <input
                    type="text"
                    value={customRepairBrand}
                    onChange={e => setCustomRepairBrand(e.target.value)}
                    placeholder="या ब्रांड टाइप करें"
                    className="w-1/2 p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  मॉडल का नाम (Exact Model Name):
                </label>
                <input
                  type="text"
                  required
                  value={customRepairModelName}
                  onChange={e => setCustomRepairModelName(e.target.value)}
                  placeholder="उदा: Realme 11 Pro 5G / Vivo Y200 / Poco X6"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  रैम / स्टोरेज / नेटवर्क (वैकल्पिक):
                </label>
                <input
                  type="text"
                  value={customRepairSpecs}
                  onChange={e => setCustomRepairSpecs(e.target.value)}
                  placeholder="उदा: 8GB RAM / 128GB (5G)"
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-[11px]">
                🔧 <strong>सूरत डोरस्टेप रिपेयर:</strong> हमारे टेक्नीशियन ओरिजिनल OEM पार्ट्स और 90 दिन वारंटी के साथ आपके घर आएंगे।
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                ✓ यह मॉडल सेट करें व रिपेयर बुक करें
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
