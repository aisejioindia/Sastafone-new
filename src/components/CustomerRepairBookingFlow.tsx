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
  RefreshCw
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
  const { user, setIsAuthModalOpen, selectedLocality, setSelectedLocality } = useApp();

  // Wizard Steps: 1: Brand & Model, 2: Select Issues, 3: Address & Slot, 4: Pay & Confirm
  const [step, setStep] = useState<number>(1);

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
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(item => item !== id);
      }
      return [...prev, id];
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

    // Start Server-Side Verified Razorpay Checkout
    startRazorpayCheckout({
      amount: 199,
      jobId: generatedJobId,
      customerName: customerName.trim() || 'Surat Resident',
      customerPhone: customerPhone.trim(),
      description: `सस्ताफोन सूरत ₹199 विज़िट टोकन: ${finalDeviceName}`,
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
            pickupCost: 70, // Standard Surat courier/partner logistics cost
            customerApproved: false,
            deviceNotes: deviceNotes.trim()
          };

          await createJobInFirestore(newJob);

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
        setIsProcessingPayment(false);
        setPaymentError(errorMsg);
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 sm:py-6 pb-24">
      {/* Step Progress Indicator (Mobile-First) */}
      {step < 4 && (
        <div className="mb-5 bg-white p-3.5 rounded-2xl shadow-xs border border-slate-200/80">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-red-600 flex items-center gap-1.5 font-black">
              <Wrench className="w-4 h-4 text-red-600" />
              <span>डोरस्टेप पिकअप व रिपेयर</span>
            </span>
            <span className="text-slate-500 font-mono">चरण {step} / 3</span>
          </div>

          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-red-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-3 text-[11px] font-bold text-center mt-2 text-slate-500">
            <span className={step >= 1 ? 'text-red-600' : ''}>1. फोन मॉडल</span>
            <span className={step >= 2 ? 'text-red-600' : ''}>2. समस्याएं</span>
            <span className={step >= 3 ? 'text-red-600' : ''}>3. पता व स्लॉट</span>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP 1: BRAND + MODEL (SEARCHABLE)                            */}
      {/* ------------------------------------------------------------- */}
      {step === 1 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>अपना मोबाइल ब्रांड व मॉडल चुनें</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              सूरत में ओरिजिनल पार्ट्स व 6 महीने की वारंटी के साथ डोरस्टेप पिकअप
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
                  className={`px-3.5 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer shrink-0 border ${
                    selectedBrand === brand.id
                      ? 'bg-red-600 text-white border-red-600 shadow-md scale-105'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {brand.name}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative mt-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={modelSearch}
                onChange={e => setModelSearch(e.target.value)}
                placeholder="उदा. iPhone 14, S23 Ultra, OnePlus 11R..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 text-sm bg-white text-slate-900 focus:outline-none focus:border-red-600 shadow-2xs font-medium"
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
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedModel === model.name && !customModelInput
                      ? 'bg-red-50 border-red-500 text-red-900 shadow-xs ring-2 ring-red-400/30'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <span className="text-xs font-bold line-clamp-2">{model.name}</span>
                  <span className="text-[10px] text-slate-500 mt-1">सर्टिफाइड पार्ट्स ✓</span>
                </button>
              ))}
            </div>

            {/* Custom Model Input Option if not found */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <label className="text-[11px] font-bold text-slate-600 block mb-1">
                यदि आपका मॉडल ऊपर नहीं है, तो यहाँ लिखें:
              </label>
              <input
                type="text"
                value={customModelInput}
                onChange={e => setCustomModelInput(e.target.value)}
                placeholder="उदा. Vivo Y200e 5G / अन्य कोई मॉडल"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          {/* Continue Button */}
          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <span>समस्याएं चुनें (आगे बढ़ें)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STEP 2: PROBLEMS MULTI-SELECT & LIVE CALCULATION BOX          */}
      {/* ------------------------------------------------------------- */}
      {step === 2 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Selected Device Summary Bar */}
          <div className="bg-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-red-400" />
              <span className="text-xs font-bold">{customModelInput || selectedModel}</span>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-[11px] text-red-300 underline font-bold cursor-pointer"
            >
              बदलें
            </button>
          </div>

          {/* Live Calculation Floating Box (Exact Spec Requirement) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-xl shadow-red-600/25 border border-red-400/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                लाइव एस्टीमेट व समय
              </span>
              <span className="text-xs text-rose-100 font-bold">
                {selectedServices.length} समस्या चुनी गई
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <span className="text-[10px] text-rose-200 block uppercase font-bold">अनुमानित खर्च (Range):</span>
                <span className="text-xl sm:text-2xl font-black text-white">
                  ₹{calculations.minSum} - ₹{calculations.maxSum}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-rose-200 block uppercase font-bold">कुल समय (पिकअप + रिपेयर):</span>
                <span className="text-sm sm:text-base font-black text-white flex items-center gap-1 mt-1">
                  <Clock className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>{calculations.timeFormatted}</span>
                </span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-bold text-amber-200">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>{calculations.warrantyText}</span>
              </span>
              <span className="text-[11px] text-rose-100">
                ₹199 विज़िट टोकन फाइनल बिल में एडजस्ट
              </span>
            </div>
          </div>

          {/* Multi-Select Problems Grid (Loaded from Firestore) */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-200 space-y-2.5">
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              फोन में क्या खराबी है? (एक या अधिक चुनें)
            </h3>

            {isLoadingPrices ? (
              <div className="py-8 text-center text-xs text-slate-500 space-y-2">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-red-600" />
                <span>Firestore से रिपेयर रेट लोड हो रहे हैं...</span>
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
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-red-50/80 border-red-500 text-slate-900 ring-2 ring-red-400/30'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                          isSelected
                            ? 'bg-red-600 border-red-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold truncate">{item.name_hi}</span>
                          <span className="text-[11px] font-black text-red-600 shrink-0">
                            ₹{item.minPrice} - ₹{item.maxPrice}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                          {item.description_hi}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[9px] font-bold text-slate-400">
                          <span>⏱️ {item.serviceMinutes || 30} मिनट रिपेयर</span>
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

          {/* Navigation Controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>पीछे</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex-1 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
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
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-600" />
              <span>सूरत में डोरस्टेप पिकअप का पता व समय</span>
            </h3>

            {paymentError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

            {/* Customer Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  आपका नाम (Full Name):
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="उदा. राहुल पटेल"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-red-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  मोबाइल नंबर (सूरत):
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="9825012345"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:border-red-600"
                />
              </div>
            </div>

            {/* Surat Area Selection */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                सूरत इलाका / क्षेत्र (Area):
              </label>
              <select
                value={area}
                onChange={e => {
                  setArea(e.target.value);
                  setSelectedLocality(`${e.target.value}, Surat`);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 font-bold focus:outline-none focus:border-red-600 cursor-pointer"
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
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                पूरा पता (मकान/दुकान नं, सोसाइटी, लैंडमार्क):
              </label>
              <textarea
                rows={2}
                required
                value={streetAddress}
                onChange={e => setStreetAddress(e.target.value)}
                placeholder="उदा. फ्लैट 302, राजहंस हाइट्स, नियर पाल आरटीओ रोड, सूरत"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-red-600 leading-relaxed"
              />
            </div>

            {/* Date Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center justify-between">
                <span>पिकअप की तारीख:</span>
                <span className="text-[10px] text-red-600 font-semibold">आज या कल का स्लॉट चुनें</span>
              </label>
              <input
                type="date"
                value={pickupDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setPickupDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-bold focus:outline-none focus:border-red-600 cursor-pointer"
              />
            </div>

            {/* Available Slots Grid (Capacity Checked) */}
            <div className="space-y-2 pt-1">
              <label className="text-[11px] font-bold text-slate-700 block">
                पिकअप टाइम स्लॉट चुनें (उपलब्धता अनुसार):
              </label>

              {isLoadingSlots ? (
                <div className="p-3 text-center text-xs text-slate-500">
                  स्लॉट लोड हो रहे हैं...
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
                        className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                          isFull
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                            : isSelected
                            ? 'bg-red-50 border-red-500 text-slate-900 ring-2 ring-red-400/30 cursor-pointer'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className={`w-4 h-4 ${isFull ? 'text-slate-400' : 'text-red-600'}`} />
                          <span className="text-xs font-bold">{slot.window}</span>
                        </div>

                        <div>
                          {isFull ? (
                            <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-600 text-[10px] font-black uppercase">
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
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                कोई अतिरिक्त निर्देश / टेक्नीशियन नोट (वैकल्पिक):
              </label>
              <input
                type="text"
                value={deviceNotes}
                onChange={e => setDeviceNotes(e.target.value)}
                placeholder="उदा. सिम कार्ड निकाल लिया है / बैक कवर साथ में देंगे"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-red-600"
              />
            </div>
          </div>

          {/* ₹199 Token Explainer Card */}
          <div className="p-4 rounded-3xl bg-slate-900 text-white space-y-2 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">डोरस्टेप विज़िट व पिकअप टोकन:</span>
              <span className="text-lg font-black text-amber-400">₹199</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              यह ₹199 टोकन केवल सुरक्षित अपॉइंटमेंट और फेक ऑर्डर्स रोकने के लिए है। जब फोन रिपेयर होगा, तब यह ₹199 आपके फाइनल बिल में से पूरा माइनस (एडजस्ट) हो जाएगा।
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={() => setStep(2)}
              className="px-4 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>पीछे</span>
            </button>

            <button
              type="button"
              disabled={isProcessingPayment}
              onClick={handleProceedToPayment}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm shadow-xl shadow-red-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-70"
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
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-200 text-center space-y-4 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider">
              सत्यापित बुकिंग कन्फर्म • Job Created
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              आपकी रिपेयर बुकिंग सफलतापूर्वक दर्ज हो गई है!
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              ₹199 विज़िट टोकन Razorpay सर्वर द्वारा सत्यापित हो चुका है (आईडी: {completedJob.razorpayPaymentId})
            </p>
          </div>

          {/* Job Card Details */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 text-slate-800 font-medium">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-bold">जॉब आईडी (Job ID):</span>
              <span className="font-mono font-black text-red-600 text-sm">{completedJob.jobId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">डिवाइस:</span>
              <span className="font-bold">{completedJob.model}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">चुनी गई समस्याएं:</span>
              <span className="font-bold text-right truncate max-w-[180px]">{completedJob.services.join(', ')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">पिकअप स्लॉट:</span>
              <span className="font-bold text-blue-700">{completedJob.pickupSlot.date} ({completedJob.pickupSlot.window})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">पता:</span>
              <span className="font-bold text-right truncate max-w-[200px]">{completedJob.address}, {completedJob.area}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-emerald-700 font-bold">
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
                  window.location.hash = '#orders';
                }
              }}
              className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>📦 'My Orders' में लाइव स्टेटस टाइमलाइन देखें</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>

            <a
              href={`https://wa.me/919372802044?text=${encodeURIComponent(
                `नमस्ते Sastafone Surat! मैंने ₹199 टोकन के साथ रिपेयर बुक किया है। जॉब आईडी: ${completedJob.jobId}, फोन: ${completedJob.model}, क्षेत्र: ${completedJob.area}`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>💬 WhatsApp पर अपडेट्स प्राप्त करें</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
