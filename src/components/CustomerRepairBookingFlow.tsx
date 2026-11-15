import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  RepairPrice,
  Slot,
  Job
} from '../types';
import {
  getRepairPricesFromFirestore,
  getAvailableSlots,
  createJobInFirestore
} from '../services/firestoreRepairService';
import { startRazorpayCheckout } from '../services/paymentService';
import { SURAT_LOCALITIES, BRANDS } from '../data/mockData';
import { COMPREHENSIVE_PHONE_MODELS } from '../data/phonesDatabase';
import { buildWhatsappHref } from '../services/siteSettingsService';
import { trackEvent } from '../utils/analytics';
import {
  Smartphone,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  MapPin,
  Calendar,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  Sparkles,
  Zap,
  Lock,
  Phone,
  User,
  Wrench,
  CreditCard,
  Building,
  RefreshCw,
  MessageCircle,
  Package
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CustomerRepairBookingFlowProps {
  onJobCreated?: (jobId: string) => void;
  onNavigateToOrders?: () => void;
}

export const CustomerRepairBookingFlow: React.FC<CustomerRepairBookingFlowProps> = ({
  onJobCreated,
  onNavigateToOrders
}) => {
  const { user, setIsAuthModalOpen, selectedLocality, setSelectedLocality, siteSettings } = useApp();

  // Wizard Steps: 1: Brand & Model, 2: Select Issues, 3: Address & Slot, 4: Pay & Confirm
  const [step, setStep] = useState<number>(1);

  useEffect(() => {
    trackEvent('book_repair_start');
  }, []);

  // Firestore Data State
  const [repairPrices, setRepairPrices] = useState<RepairPrice[]>([]);
  const [isLoadingPrices, setIsLoadingPrices] = useState<boolean>(true);

  // Step 1: Device Selection
  const [selectedBrand, setSelectedBrand] = useState<string>('apple');
  const [modelSearch, setModelSearch] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('Apple iPhone 14');
  const [customModelInput, setCustomModelInput] = useState<string>('');

  // Step 2: Problem Multi-Select
  const [selectedIssueIds, setSelectedIssueIds] = useState<string[]>(['display']);

  // Step 3: Address & Slot
  const [customerName, setCustomerName] = useState<string>(user.name || '');
  const [customerPhone, setCustomerPhone] = useState<string>(user.phone || '');
  const [streetAddress, setStreetAddress] = useState<string>(user.address || '');
  const [area, setArea] = useState<string>(selectedLocality.split(',')[0].trim() || 'Adajan');
  const [pickupDate, setPickupDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [selectedSlotWindow, setSelectedSlotWindow] = useState<string>('');
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [deviceNotes, setDeviceNotes] = useState<string>('');

  // Step 4: Payment & Completion
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [completedJob, setCompletedJob] = useState<Job | null>(null);

  // Load live repair prices from Firestore
  useEffect(() => {
    let isMounted = true;
    async function loadPrices() {
      setIsLoadingPrices(true);
      const prices = await getRepairPricesFromFirestore();
      if (isMounted) {
        setRepairPrices(prices);
        setIsLoadingPrices(false);
      }
    }
    loadPrices();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update customer details when auth changes
  useEffect(() => {
    if (user.isLoggedIn) {
      if (!customerName && user.name) setCustomerName(user.name);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
      if (!streetAddress && user.address) setStreetAddress(user.address);
    }
  }, [user]);

  // Load available slots from Firestore when area or date changes
  useEffect(() => {
    let isMounted = true;
    async function loadSlots() {
      setIsLoadingSlots(true);
      const slots = await getAvailableSlots(area, pickupDate);
      if (isMounted) {
        setAvailableSlots(slots);
        // Default select first available slot
        const firstAvailable = slots.find(s => s.capacity - s.booked > 0);
        if (firstAvailable) {
          setSelectedSlotWindow(firstAvailable.window);
        } else if (slots.length > 0) {
          setSelectedSlotWindow(slots[0].window);
        }
        setIsLoadingSlots(false);
      }
    }
    loadSlots();
    return () => {
      isMounted = false;
    };
  }, [area, pickupDate]);

  // Filter phone models for quick selection
  const filteredModels = useMemo(() => {
    const list = COMPREHENSIVE_PHONE_MODELS.filter(m => m.brandId === selectedBrand);
    if (!modelSearch.trim()) return list.slice(0, 12);
    const searchLower = modelSearch.toLowerCase().trim();
    return COMPREHENSIVE_PHONE_MODELS.filter(
      m => m.name.toLowerCase().includes(searchLower) || m.brandId.toLowerCase().includes(searchLower)
    ).slice(0, 16);
  }, [selectedBrand, modelSearch]);

  // Selected repair price objects
  const selectedServices = useMemo(() => {
    return repairPrices.filter(p => selectedIssueIds.includes(p.id));
  }, [repairPrices, selectedIssueIds]);

  // Live calculation:
  // - Estimated min sum to max sum
  // - Total turnaround time = 60 min (pickup + delivery) + sum of serviceMinutes
  // - Warranty: 6 months if estimate >= 1000, else 3 months
  const calculations = useMemo(() => {
    const minSum = selectedServices.reduce((acc, curr) => acc + curr.minPrice, 0);
    const maxSum = selectedServices.reduce((acc, curr) => acc + curr.maxPrice, 0);
    const serviceMins = selectedServices.reduce((acc, curr) => acc + (curr.serviceMinutes || 30), 0);
    const totalMinutes = 60 + serviceMins; // 60 mins courier/pickup + repair

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const timeFormatted = mins > 0 ? `approx ${hours} hr ${mins} min` : `approx ${hours} hr`;

    const warrantyText = minSum >= 1000 ? '6 महीने की लिखित वारंटी' : '3 महीने की वारंटी';

    return {
      minSum,
      maxSum,
      totalMinutes,
      timeFormatted,
      warrantyText
    };
  }, [selectedServices]);

  const toggleIssue = (id: string) => {
    setSelectedIssueIds(prev => {
      const next = prev.includes(id)
        ? (prev.length === 1 ? prev : prev.filter(item => item !== id))
        : [...prev, id];
      trackEvent('repair_service_selected', { count: next.length, last_id: id });
      return next;
    });
  };

  // Payment & Submit Handler
  const handleProceedToPayment = async () => {
    if (!user.isLoggedIn) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!customerPhone || customerPhone.replace(/\D/g, '').length < 10) {
      setPaymentError('कृपया मान्य 10-अंकों का मोबाइल नंबर दर्ज करें।');
      return;
    }
    if (!streetAddress.trim()) {
      setPaymentError('कृपया पिकअप का पूरा पता दर्ज करें।');
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError(null);

    const generatedJobId = `JOB-STP-${Date.now().toString().slice(-6)}`;
    const brandObj = BRANDS.find(b => b.id === selectedBrand);
    const finalDeviceName = customModelInput.trim() || selectedModel;

    trackEvent('visit_fee_initiated', {
      job_id: generatedJobId,
      brand: brandObj?.name || selectedBrand,
      model: finalDeviceName,
      services_count: selectedServices.length
    });

    // Start Server-Side Verified Razorpay Checkout
    startRazorpayCheckout({
      amount: 199,
      jobId: generatedJobId,
      customerName: customerName.trim() || 'Surat Resident',
      customerPhone: customerPhone.trim(),
      description: `Sastafone Surat ₹199 विज़िट टोकन: ${finalDeviceName}`,
      onSuccess: async (paymentId: string) => {
        try {
          // Create the job in Firestore ONLY AFTER PAYMENT IS VERIFIED!
          const newJob: Omit<Job, 'createdAt' | 'statusHistory'> = {
            jobId: generatedJobId,
            userId: user.uid || `anon_${customerPhone}`,
            name: customerName.trim() || 'Surat Resident',
            phone: customerPhone.trim(),
            address: streetAddress.trim(),
            area,
            brand: brandObj?.name || selectedBrand,
            model: finalDeviceName,
            services: selectedServices.map(s => s.name_hi),
            serviceDetails: selectedServices,
            estMin: calculations.minSum,
            estMax: calculations.maxSum,
            estMinutes: calculations.totalMinutes,
            pickupSlot: {
              date: pickupDate,
              window: selectedSlotWindow || '10:00 AM - 01:00 PM',
              area
            },
            status: 'Booked',
            visitFeePaid: true,
            razorpayPaymentId: paymentId,
            pickupCost: 70,
            customerApproved: false,
            deviceNotes: deviceNotes.trim()
          };

          await createJobInFirestore(newJob);

          trackEvent('visit_fee_paid', {
            job_id: generatedJobId,
            payment_id: paymentId,
            amount: 199
          });

          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });

          setCompletedJob({
            ...newJob,
            createdAt: new Date().toISOString(),
            statusHistory: [
              {
                status: 'Booked',
                timestamp: new Date().toISOString(),
                note: 'बुकिंग दर्ज की गई। ₹199 विज़िट टोकन वेरिफाइड।'
              }
            ]
          });

          setIsProcessingPayment(false);
          setStep(4);
          if (onJobCreated) onJobCreated(generatedJobId);
        } catch (err: any) {
          console.error('Error saving verified job to Firestore:', err);
          setPaymentError(`भुगतान सफल रहा, किंतु जॉब सेव करने में त्रुटि: ${err.message}`);
          setIsProcessingPayment(false);
        }
      },
      onFailure: (errorMsg: string) => {
        trackEvent('visit_fee_failed', { job_id: generatedJobId, reason: errorMsg });
        setIsProcessingPayment(false);
        setPaymentError(errorMsg);
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6 pb-28 sm:pb-12">
      {/* Step Progress Indicator (Mobile-First) */}
      {step < 4 && (
        <div className="mb-5 bg-white p-3.5 rounded-2xl shadow-xs border border-gray-200">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-[#D5151B] flex items-center gap-1.5 font-bold">
              <Wrench className="w-4 h-4 text-[#D5151B]" />
              <span>डोरस्टेप पिकअप व रिपेयर</span>
            </span>
            <span className="text-gray-500 font-mono tabular-nums">चरण {step} / 3</span>
          </div>

          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#D5151B] h-full rounded-full transition-all duration-200"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-3 text-[11px] font-bold text-center mt-2 text-gray-500">
            <span className={step >= 1 ? 'text-[#D5151B]' : ''}>1. फोन मॉडल</span>
            <span className={step >= 2 ? 'text-[#D5151B]' : ''}>2. समस्याएं</span>
            <span className={step >= 3 ? 'text-[#D5151B]' : ''}>3. पता व स्लॉट</span>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP 1: BRAND + MODEL (SEARCHABLE)                            */}
      {/* ------------------------------------------------------------- */}
      {step === 1 && (
        <div className="space-y-4 step-transition">
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200">
            <h2 className="text-lg sm:text-xl font-bold text-[#132032] tracking-tight flex items-center gap-2">
              <span>अपना मोबाइल ब्रांड व मॉडल चुनें</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              सूरत में गुणवत्ता-जांचे गए पार्ट्स व ₹1000+ बिल पर 6 महीने की वारंटी
            </p>

            {/* Brand Chips Carousel */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-3 mt-1">
              {BRANDS.map(brand => (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => {
                    setSelectedBrand(brand.id);
                    setModelSearch('');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer shrink-0 border ${
                    selectedBrand === brand.id
                      ? 'bg-[#D5151B] text-white border-[#D5151B] shadow-xs'
                      : 'bg-gray-50 hover:bg-gray-100 text-[#132032] border-gray-200'
                  }`}
                >
                  {brand.name}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative mt-2">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={modelSearch}
                onChange={e => setModelSearch(e.target.value)}
                placeholder="उदा. iPhone 14, S23 Ultra, OnePlus 11R..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm bg-white text-[#132032] focus:outline-none focus:border-[#D5151B] font-medium"
              />
            </div>

            {/* Models Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-3 max-h-60 overflow-y-auto p-1">
              {filteredModels.map(model => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    setSelectedModel(model.name);
                    setCustomModelInput('');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer flex flex-col justify-between ${
                    selectedModel === model.name && !customModelInput
                      ? 'bg-[#FEF2F2] border-[#D5151B] text-[#132032] ring-1 ring-[#D5151B]'
                      : 'bg-white hover:bg-gray-50 border-gray-200 text-[#132032]'
                  }`}
                >
                  <span className="text-xs font-bold line-clamp-2">{model.name}</span>
                  <span className="text-[10px] text-gray-500 mt-1">सर्टिफाइड पार्ट्स ✓</span>
                </button>
              ))}
            </div>

            {/* Custom Model Input Option if not found */}
            <div className="mt-4 pt-3 border-t border-gray-100">
              <label className="text-[11px] font-bold text-gray-600 block mb-1">
                यदि आपका मॉडल ऊपर नहीं है, तो यहाँ लिखें:
              </label>
              <input
                type="text"
                value={customModelInput}
                onChange={e => setCustomModelInput(e.target.value)}
                placeholder="उदा. Vivo Y200e 5G / अन्य कोई मॉडल"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#132032] focus:outline-none focus:border-[#D5151B]"
              />
            </div>
          </div>

          {/* Sticky Mobile / Standard Desktop Continue Button */}
          <div className="sticky bottom-16 sm:static z-30 bg-white/95 backdrop-blur-xs border-t border-gray-200 sm:border-0 p-3 -mx-4 sm:mx-0 sm:p-0">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-sm shadow-xs transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 tap-target"
            >
              <span>समस्याएं चुनें (आगे बढ़ें)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP 2: PROBLEMS MULTI-SELECT & LIVE CALCULATION BOX          */}
      {/* ------------------------------------------------------------- */}
      {step === 2 && (
        <div className="space-y-4 step-transition">
          {/* Selected Device Summary Bar */}
          <div className="bg-[#FEF2F2] border border-red-200 text-[#132032] p-3.5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#D5151B]" />
              <span className="text-xs font-bold">{customModelInput || selectedModel}</span>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-[11px] text-[#D5151B] underline font-bold cursor-pointer"
            >
              बदलें
            </button>
          </div>

          {/* Live Calculation Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#D5151B] text-white shadow-sm border border-[#B31419]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-100">
                लाइव एस्टीमेट व समय
              </span>
              <span className="text-xs text-red-100 font-bold">
                {selectedServices.length} समस्या चुनी गई
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <span className="text-[10px] text-red-100 block uppercase font-bold">अनुमानित खर्च:</span>
                <span className="text-xl sm:text-2xl font-bold text-white tabular-nums">
                  ₹{calculations.minSum} – ₹{calculations.maxSum}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-red-100 block uppercase font-bold">कुल समय (पिकअप + रिपेयर):</span>
                <span className="text-sm sm:text-base font-bold text-white flex items-center gap-1 mt-1">
                  <Clock className="w-4 h-4 text-red-100 shrink-0" />
                  <span>{calculations.timeFormatted}</span>
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/20 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-1.5 font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>{calculations.warrantyText}</span>
              </span>
              <span className="text-[11px] text-red-100">
                ₹199 विज़िट टोकन फाइनल बिल में एडजस्ट
              </span>
            </div>
          </div>

          {/* Multi-Select Problems Grid (Loaded from Firestore) */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-gray-200 space-y-2.5">
            <h3 className="text-sm font-bold text-[#132032] tracking-tight">
              फोन में क्या खराबी है? (एक या अधिक चुनें)
            </h3>

            {isLoadingPrices ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 py-2">
                {[1, 2, 3, 4, 5, 6].map((sk) => (
                  <div key={sk} className="p-3 rounded-xl border border-gray-200 space-y-2 animate-pulse">
                    <div className="flex justify-between gap-2">
                      <div className="h-3.5 bg-gray-200 rounded w-3/5" />
                      <div className="h-3.5 bg-red-100 rounded w-1/4" />
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded w-4/5" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[380px] overflow-y-auto p-1">
                {repairPrices.map(item => {
                  const isSelected = selectedIssueIds.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleIssue(item.id)}
                      className={`p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-[#FEF2F2] border-[#D5151B] text-[#132032] ring-1 ring-[#D5151B]'
                          : 'bg-white hover:bg-gray-50 border-gray-200 text-[#132032]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                          isSelected
                            ? 'bg-[#D5151B] border-[#D5151B] text-white'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold truncate">{item.name_hi}</span>
                          <span className="text-[11px] font-bold text-[#D5151B] shrink-0 tabular-nums">
                            ₹{item.minPrice}–₹{item.maxPrice}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">
                          {item.description_hi}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] font-medium text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            {item.serviceMinutes || 30} मिनट
                          </span>
                          <span>•</span>
                          <span className="text-emerald-700 font-bold">{item.warrantyMonths || 3}M वारंटी</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Navigation Controls (Sticky on Mobile) */}
          <div className="sticky bottom-16 sm:static z-30 bg-white/95 backdrop-blur-xs border-t border-gray-200 sm:border-0 p-3 -mx-4 sm:mx-0 sm:p-0 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-3.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#132032] font-bold text-xs transition-all duration-150 cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>पीछे</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex-1 py-3.5 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-sm shadow-xs transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 tap-target"
            >
              <span>पिकअप स्लॉट व पता दर्ज करें</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP 3: ADDRESS, AREA & REAL-TIME PICKUP SLOTS               */}
      {/* ------------------------------------------------------------- */}
      {step === 3 && (
        <div className="space-y-4 step-transition">
          <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-200 space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-[#132032] tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#D5151B]" />
              <span>सूरत में डोरस्टेप पिकअप का पता व समय</span>
            </h3>

            {paymentError && (
              <div className="p-3 rounded-xl bg-[#FEF2F2] border border-red-200 text-[#D5151B] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

            {/* Customer Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  आपका नाम (Full Name):
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="उदा. राहुल पटेल"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#132032] focus:outline-none focus:border-[#D5151B]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  मोबाइल नंबर (सूरत):
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="9825012345"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-mono text-[#132032] focus:outline-none focus:border-[#D5151B]"
                />
              </div>
            </div>

            {/* Surat Area Selection */}
            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1">
                सूरत इलाका / क्षेत्र (Area):
              </label>
              <select
                value={area}
                onChange={e => {
                  setArea(e.target.value);
                  setSelectedLocality(`${e.target.value}, Surat`);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs bg-white text-[#132032] font-bold focus:outline-none focus:border-[#D5151B] cursor-pointer"
              >
                {SURAT_LOCALITIES.map(loc => (
                  <option key={loc.id} value={loc.name}>
                    {loc.hindiName} ({loc.name}) - {loc.pincode}
                  </option>
                ))}
              </select>
            </div>

            {/* Street Address */}
            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1">
                पूरा पता (मकान/दुकान नं, सोसाइटी, लैंडमार्क):
              </label>
              <textarea
                rows={2}
                required
                value={streetAddress}
                onChange={e => setStreetAddress(e.target.value)}
                placeholder="उदा. फ्लैट 302, राजहंस हाइट्स, नियर पाल आरटीओ रोड, सूरत"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#132032] focus:outline-none focus:border-[#D5151B] leading-relaxed"
              />
            </div>

            {/* Date Selector */}
            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1 flex items-center justify-between">
                <span>पिकअप की तारीख:</span>
                <span className="text-[10px] text-[#D5151B] font-bold">आज या कल का स्लॉट चुनें</span>
              </label>
              <input
                type="date"
                value={pickupDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setPickupDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs text-[#132032] font-bold focus:outline-none focus:border-[#D5151B] cursor-pointer"
              />
            </div>

            {/* Available Slots Grid (Capacity Checked) */}
            <div className="space-y-2 pt-1">
              <label className="text-[11px] font-bold text-gray-700 block">
                पिकअप टाइम स्लॉट चुनें (उपलब्धता अनुसार):
              </label>

              {isLoadingSlots ? (
                <div className="space-y-2 py-1">
                  {[1, 2, 3].map((sk) => (
                    <div key={sk} className="h-11 rounded-xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {availableSlots.map(slot => {
                    const capacityLeft = slot.capacity - slot.booked;
                    const isFull = capacityLeft <= 0;
                    const isSelected = selectedSlotWindow === slot.window;

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={isFull}
                        onClick={() => setSelectedSlotWindow(slot.window)}
                        className={`w-full p-3 rounded-xl border text-left transition-all duration-150 flex items-center justify-between ${
                          isFull
                            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                            : isSelected
                            ? 'bg-[#FEF2F2] border-[#D5151B] text-[#132032] ring-1 ring-[#D5151B] cursor-pointer'
                            : 'bg-white hover:bg-gray-50 border-gray-200 text-[#132032] cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className={`w-4 h-4 ${isFull ? 'text-gray-400' : 'text-[#D5151B]'}`} />
                          <span className="text-xs font-bold">{slot.window}</span>
                        </div>

                        <div>
                          {isFull ? (
                            <span className="px-2 py-0.5 rounded-md bg-gray-200 text-gray-600 text-[10px] font-bold uppercase">
                              स्लॉट फुल (Full)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              {capacityLeft} स्लॉट खाली ✓
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Device notes */}
            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1">
                कोई अतिरिक्त निर्देश / टेक्नीशियन नोट (वैकल्पिक):
              </label>
              <input
                type="text"
                value={deviceNotes}
                onChange={e => setDeviceNotes(e.target.value)}
                placeholder="उदा. सिम कार्ड निकाल लिया है / बैक कवर साथ में देंगे"
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs text-[#132032] focus:outline-none focus:border-[#D5151B]"
              />
            </div>
          </div>

          {/* ₹199 Token Explainer Card (Light Theme) */}
          <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-red-200 text-[#132032] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#132032]">डोरस्टेप विज़िट व पिकअप टोकन:</span>
              <span className="text-lg font-bold text-[#D5151B] tabular-nums">₹199</span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              यह ₹199 विज़िट शुल्क आपके फाइनल बिल में पूरा एडजस्ट होगा। यदि QC के बाद आप रिपेयर रद्द करते हैं तो ₹99 रिफंड होगा (₹100 विज़िट शुल्क रखा जाएगा)।
            </p>
          </div>

          {/* Action Buttons (Sticky Mobile CTA) */}
          <div className="sticky bottom-16 sm:static z-30 bg-white/95 backdrop-blur-xs border-t border-gray-200 sm:border-0 p-3 -mx-4 sm:mx-0 sm:p-0 flex items-center gap-3">
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={() => setStep(2)}
              className="px-4 py-3.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#132032] font-bold text-xs transition-all duration-150 cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>पीछे</span>
            </button>

            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={handleProceedToPayment}
              className="flex-1 py-3.5 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-sm shadow-xs transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 tap-target disabled:opacity-70"
            >
              {isProcessingPayment ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Razorpay सुरक्षित सत्यापन चालू...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>₹199 टोकन भुगतान करें व बुक करें</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP 4: CONFIRMATION SCREEN WITH JOB ID & LIVE TIMELINE LINK */}
      {/* ------------------------------------------------------------- */}
      {step === 4 && completedJob && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-emerald-200 text-center space-y-4 step-transition">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
              सत्यापित बुकिंग कन्फर्म
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#132032] mt-2">
              आपकी रिपेयर बुकिंग सफलतापूर्वक दर्ज हो गई है!
            </h2>
            <p className="text-xs text-gray-600 mt-1">
              ₹199 विज़िट टोकन Razorpay द्वारा सत्यापित हो चुका है (आईडी: {completedJob.razorpayPaymentId})
            </p>
          </div>

          {/* Job Card Details */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-left text-xs space-y-2 text-[#132032] font-medium">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <span className="text-gray-500 font-bold">जॉब आईडी (Job ID):</span>
              <span className="font-mono font-bold text-[#D5151B] text-sm">{completedJob.jobId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">डिवाइस:</span>
              <span className="font-bold">{completedJob.model}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">चुनी गई समस्याएं:</span>
              <span className="font-bold text-right truncate max-w-[180px]">{completedJob.services.join(', ')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">पिकअप स्लॉट:</span>
              <span className="font-bold text-[#132032]">{completedJob.pickupSlot.date} ({completedJob.pickupSlot.window})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">पता:</span>
              <span className="font-bold text-right truncate max-w-[200px]">{completedJob.address}, {completedJob.area}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 text-emerald-700 font-bold">
              <span>वारंटी:</span>
              <span>{calculations.warrantyText}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                if (onNavigateToOrders) {
                  onNavigateToOrders();
                } else {
                  window.history.pushState({}, '', '/orders');
                }
              }}
              className="w-full py-3.5 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-xs sm:text-sm shadow-xs transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 tap-target"
            >
              <Package className="w-4 h-4" />
              <span>&apos;My Orders&apos; में लाइव स्टेटस टाइमलाइन देखें</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href={buildWhatsappHref(
                siteSettings.whatsappNumber,
                `नमस्ते Sastafone Surat! मैंने ₹199 टोकन के साथ रिपेयर बुक किया है। जॉब आईडी: ${completedJob.jobId}, फोन: ${completedJob.model}, क्षेत्र: ${completedJob.area}`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all duration-150"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp पर अपडेट्स प्राप्त करें</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
