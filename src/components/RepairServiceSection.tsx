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
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BrandLogo } from './BrandLogo';

export const RepairServiceSection: React.FC = () => {
  const {
    language,
    selectedLocality,
    addOrder,
    setIsDashboardOpen,
    user,
    setIsBrandCentersModalOpen,
    setIsReviewModalOpen: openGlobalReviewModal,
    setPrefillReviewOrder,
    openPaymentModal
  } = useApp();

  const [selectedBrand, setSelectedBrand] = useState<Brand>(BRANDS[0]);
  const [selectedModel, setSelectedModel] = useState<PhoneModel>(PHONE_MODELS[0]);
  const [selectedIssue, setSelectedIssue] = useState<RepairIssue>(REPAIR_ISSUES[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('Today (Within 30-45 Mins)');
  const [addressInput, setAddressInput] = useState(user.address || `Near Main Road, ${selectedLocality}`);
  const [customerNameInput, setCustomerNameInput] = useState(user.name || 'Surat Resident');
  const [customerPhoneInput, setCustomerPhoneInput] = useState(user.phone || '9372802044');

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

  const brandModels = PHONE_MODELS.filter(m => m.brandId === selectedBrand.id);

  const handleBrandChange = (brand: Brand) => {
    setSelectedBrand(brand);
    const models = PHONE_MODELS.filter(m => m.brandId === brand.id);
    if (models.length > 0) {
      setSelectedModel(models[0]);
    }
  };

  const handleOpenAppointmentPayment = () => {
    setIsModalOpen(false);
    openPaymentModal({
      type: 'appointment_199',
      title: `${selectedModel.name} - ${selectedIssue.hindiName}`,
      titleHindi: `घर पर रिपेयर अपॉइंटमेंट (₹199 विज़िट टोकन)`,
      amount: 199,
      description: `${selectedIssue.name} • ₹199 विज़िट टोकन (₹99 रिफंडेबल)`,
      descriptionHindi: `₹199 विज़िट टोकन: फोन रिपेयर होने पर फाइनल बिल में माइनस होगा। यदि फोन नहीं बन सका तो ₹99 तुरंत रिफंड होगा।`,
      refundNote: `फोन रिपेयर होने पर ₹199 फाइनल बिल में एडजस्ट होगा। यदि फोन ठीक नहीं हो सका तो ₹99 तुरंत रिफंड किया जाएगा।`,
      repairDetails: {
        modelName: selectedModel.name,
        issueName: selectedIssue.hindiName,
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
    handleOpenAppointmentPayment();
  };

  const handleConfirmAndPay = () => {
    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);

      addOrder({
        type: 'repair',
        title: `${selectedModel.name} - ${selectedIssue.hindiName}`,
        subtitle: `${selectedIssue.name} • ₹199 विज़िट चार्ज (रिपेयर पर बिल में एडजस्ट)`,
        amount: 199,
        status: 'technician_assigned',
        statusHindi: 'टेक्नीशियन होम विज़िट के लिए असाइन हुआ',
        locality: selectedLocality,
        fullAddress: addressInput || `${selectedLocality}, Surat`,
        customerName: customerNameInput || 'Customer',
        customerPhone: customerPhoneInput || '9825012345',
        timeSlot: selectedTimeSlot,
        technicianName: 'Sanjay Prajapati (AllIndia Doorstep Lead)',
        technicianPhone: 'ऑफ़िशियल हब',
        visitCharge: 199,
        paymentMethod:
          paymentOption === 'razorpay_direct'
            ? 'ऑलइंडिया पे (AllIndia Pay 100% सिक्योर)'
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
      issueFixed: selectedIssue.hindiName,
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
                const isSelected = selectedModel.id === model.id;
                return (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModel(model)}
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
            </div>
          </div>
        </div>

        {/* 2. Problem Selector */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs mb-6">
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              2. फोन की समस्या (प्रॉब्लम) चुनें:
            </h3>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Doorstep / Lab Diagnosis
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {REPAIR_ISSUES.map(issue => {
              const isSelected = selectedIssue.id === issue.id;
              return (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  role="button"
                  tabIndex={0}
                  className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-slate-50/70 hover:bg-white border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 font-bold">
                        🔧
                      </span>
                      {issue.popular && (
                        <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                          POPULAR
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 mb-0.5">
                      {issue.hindiName}
                    </h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{issue.name}</p>
                    <p className="text-[11px] text-slate-600 mt-2 leading-tight">{issue.description}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">अनुमानित रिपेयर चार्ज</span>
                      <span className="text-xs font-black text-blue-700">
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
        </div>

        {/* 3. AI Demo Price Card & Razorpay Link integration */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-blue-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI लाइव डेमो एस्टीमेशन</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black">
                {selectedModel.name}
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                समस्या: {selectedIssue.hindiName} ({selectedIssue.name})
              </p>

              <div className="my-3 p-3.5 rounded-2xl bg-white/10 border border-white/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-blue-200">डोरस्टेप विज़िट व डायग्नोस्टिक:</span>
                  <span className="text-base font-black text-amber-300">₹199</span>
                </div>
                <div className="flex items-center justify-between text-xs text-blue-200">
                  <span>पार्ट्स व रिपेयरिंग चार्ज (अलग रहेगा):</span>
                  <span className="font-bold text-white">
                    {formatINR(selectedIssue.minPrice)} - {formatINR(selectedIssue.maxPrice)}
                  </span>
                </div>
                <div className="pt-2 border-t border-white/10 text-[11px] text-amber-200 space-y-1">
                  <p className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>फोन रिपेयर होने पर ₹199 फाइनल बिल में एडजस्ट होगा (Visit Free)!</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-blue-100">
                    <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
                    <span>यदि फोन रिपेयर नहीं हो सका, तो ₹99 तुरंत रिफंड (Refund) होगा।</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
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
                  issue: `${selectedIssue.hindiName} (${selectedIssue.name})`,
                  locality: selectedLocality
                })}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>सूरत डेस्क से WhatsApp पर बात करें</span>
              </a>
            </div>
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
                  subtitle: `${selectedIssue.name} (${selectedIssue.hindiName})`,
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
                  value={`${selectedModel.name} - ${selectedIssue.hindiName}`}
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
                    <p className="text-xs text-blue-100">
                      {selectedModel.name} • {selectedIssue.hindiName}
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
                      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1.5">
                        <div className="flex items-center justify-between font-bold text-sm">
                          <span>विज़िट व डायग्नोसिस चार्ज:</span>
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

                        {/* AllIndia Pay Instant Gateway Option */}
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
                                <span>ऑलइंडिया पे (AllIndia Pay - त्वरित UPI)</span>
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
                            <span>ऑलइंडिया पे (AllIndia Pay):</span>
                            <span className="text-emerald-700 font-bold flex items-center gap-1 text-[10px] bg-emerald-100 px-2 py-0.5 rounded-full">
                              ✓ 100% सुरक्षित UPI
                            </span>
                          </p>
                          <p className="text-[10px] text-blue-800">
                            ऑलइंडिया नेटवर्क द्वारा सुरक्षित 256-बिट एन्क्रिप्टेड भुगतान। फोन रिपेयर होने पर यह ₹199 बिल में एडजस्ट होगा, न बनने पर ₹99 तुरंत रिफंड।
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
    </section>
  );
};
