import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SeoHead } from './SeoHead';
import { getSlotsFromFirestore, createSellRequestInFirestore } from '../services/firestoreRepairService';
import { Slot, SellRequest } from '../types';
import {
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Upload,
  Camera,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  Search,
  Check,
  RefreshCw,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

const POPULAR_SELL_BRANDS = [
  'Apple',
  'Samsung',
  'OnePlus',
  'Vivo',
  'Oppo',
  'Xiaomi',
  'Realme',
  'Nothing',
  'Motorola',
  'Google Pixel'
];

const SURAT_AREAS_LIST = [
  'Adajan',
  'Vesu',
  'Pal',
  'Varachha',
  'Katargam',
  'Rander',
  'Piplod',
  'Citylight',
  'Ghod Dod Road',
  'Althan',
  'Udhna',
  'Dindoli',
  'VIP Road',
  'Nanpura'
];

interface SellPhoneFlowProps {
  onRequestCreated?: (requestId: string) => void;
  onNavigateHome?: () => void;
}

export const SellPhoneFlow: React.FC<SellPhoneFlowProps> = ({
  onRequestCreated,
  onNavigateHome
}) => {
  const { user, selectedLocality, setIsAuthModalOpen } = useApp();

  // Step state: 1 (Model) -> 2 (Specs & Age) -> 3 (Condition) -> 4 (Photos & IMEI) -> 5 (Pickup Slot & Address)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form Fields
  const [brand, setBrand] = useState('Apple');
  const [modelSearch, setModelSearch] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [storage, setStorage] = useState('128GB');
  const [age, setAge] = useState('6_to_12_months');
  const [isDeadPhone, setIsDeadPhone] = useState(false);

  // Condition Checklist
  const [screenWorking, setScreenWorking] = useState(true);
  const [touchWorking, setTouchWorking] = useState(true);
  const [bodyScratches, setBodyScratches] = useState<'none' | 'minor' | 'heavy' | 'dented'>('minor');
  const [batteryHealth, setBatteryHealth] = useState('above_85');
  const [cameraWorking, setCameraWorking] = useState(true);
  const [buttonsWorking, setButtonsWorking] = useState(true);
  const [speakerMicWorking, setSpeakerMicWorking] = useState(true);
  const [faceTouchIdWorking, setFaceTouchIdWorking] = useState(true);

  // Photos & Identification
  const [photos, setPhotos] = useState<string[]>([]);
  const [imei, setImei] = useState('');
  const [billPhotoUrl, setBillPhotoUrl] = useState('');

  // Customer & Pickup Details
  const [customerName, setCustomerName] = useState(user.name || '');
  const [customerPhone, setCustomerPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');
  const [selectedArea, setSelectedArea] = useState(selectedLocality.split(',')[0] || 'Adajan');
  
  // Available Slots
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);

  // Sync user profile
  useEffect(() => {
    if (user.isLoggedIn) {
      if (!customerName && user.name) setCustomerName(user.name);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
      if (!address && user.address) setAddress(user.address);
    }
  }, [user]);

  // Load pickup slots
  useEffect(() => {
    const loadSlots = async () => {
      setIsLoadingSlots(true);
      try {
        const fetched = await getSlotsFromFirestore();
        setSlots(fetched);
        if (fetched.length > 0 && !selectedSlotId) {
          const firstAvailable = fetched.find(s => s.booked < s.capacity) || fetched[0];
          setSelectedSlotId(firstAvailable.id);
        }
      } catch (err) {
        console.warn('Failed to load slots for selling:', err);
      } finally {
        setIsLoadingSlots(false);
      }
    };
    loadSlots();
  }, []);

  // Calculate estimated price range
  const calculateEstimate = () => {
    if (isDeadPhone) {
      return { min: 600, max: 1600 };
    }

    let baseMin = 10000;
    let baseMax = 18000;

    if (brand === 'Apple') {
      baseMin = 18000;
      baseMax = 38000;
    } else if (brand === 'Samsung' || brand === 'OnePlus') {
      baseMin = 12000;
      baseMax = 24000;
    } else if (brand === 'Xiaomi' || brand === 'Realme' || brand === 'Vivo' || brand === 'Oppo') {
      baseMin = 6000;
      baseMax = 14000;
    }

    if (storage === '256GB') {
      baseMin += 1500;
      baseMax += 2500;
    } else if (storage === '512GB' || storage === '1TB') {
      baseMin += 3000;
      baseMax += 5000;
    }

    // Condition deductions
    let deductionPct = 0;
    if (!screenWorking) deductionPct += 35;
    if (!touchWorking) deductionPct += 20;
    if (bodyScratches === 'heavy' || bodyScratches === 'dented') deductionPct += 15;
    if (batteryHealth === 'below_75') deductionPct += 10;
    if (!cameraWorking) deductionPct += 10;
    if (!faceTouchIdWorking) deductionPct += 10;

    if (age === '1_to_2_years') deductionPct += 10;
    if (age === 'above_2_years') deductionPct += 20;

    deductionPct = Math.min(deductionPct, 70);

    const min = Math.round(baseMin * (1 - deductionPct / 100));
    const max = Math.round(baseMax * (1 - deductionPct / 100));
    return { min: Math.max(min, 1200), max: Math.max(max, 1800) };
  };

  const { min: estMin, max: estMax } = calculateEstimate();

  // Photo mock uploader
  const handlePhotoUploadMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newUrls: string[] = [];
      for (let i = 0; i < Math.min(e.target.files.length, 6 - photos.length); i++) {
        newUrls.push(URL.createObjectURL(e.target.files[i]));
      }
      setPhotos([...photos, ...newUrls]);
    }
  };

  const handleBillPhotoUploadMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBillPhotoUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmitSellRequest = async () => {
    if (!user.isLoggedIn || !user.uid) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!customerPhone || customerPhone.length < 10) {
      setSubmissionError('कृपया अपना वैध 10-अंकीय मोबाइल नंबर दर्ज करें।');
      return;
    }

    if (!address.trim()) {
      setSubmissionError('कृपया पिकअप का पता दर्ज करें।');
      return;
    }

    const selectedSlotObj = slots.find(s => s.id === selectedSlotId);
    if (!selectedSlotObj) {
      setSubmissionError('कृपया पिकअप का स्लॉट चुनें।');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const payload: Omit<SellRequest, 'id'> = {
        userId: user.uid,
        customerName: customerName || user.name || 'सूरत ग्राहक',
        customerPhone: customerPhone.replace(/\D/g, ''),
        address: address.trim(),
        area: selectedArea,
        brand,
        model: selectedModel || modelSearch.trim() || `${brand} Smartphone`,
        storage,
        age,
        isDeadPhone,
        conditionChecklist: {
          screenWorking,
          touchWorking,
          bodyScratches,
          batteryHealth,
          cameraWorking,
          buttonsWorking,
          speakerMicWorking,
          faceTouchIdWorking
        },
        conditionPhotos: photos,
        imei: imei.trim() || undefined,
        billPhotoUrl: billPhotoUrl || undefined,
        pickupSlot: {
          date: selectedSlotObj.date,
          window: selectedSlotObj.window,
          area: selectedSlotObj.area
        },
        estMin,
        estMax,
        status: 'Submitted',
        statusHistory: [
          {
            status: 'Submitted',
            timestamp: new Date().toISOString(),
            note: 'अनुरोध दर्ज हुआ। Sastafone टेक्नीशियन निरीक्षण हेतु स्लॉट पर पहुंचेगा।'
          }
        ],
        createdAt: new Date().toISOString()
      };

      const docId = await createSellRequestInFirestore(payload);
      setCreatedRequestId(docId);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });

      if (onRequestCreated) {
        onRequestCreated(docId);
      }
    } catch (err: any) {
      console.error('Error creating sell request:', err);
      setSubmissionError('अनुरोध सबमिट करने में समस्या आई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white min-h-screen py-6 sm:py-8">
      <SeoHead
        title="पुराना फोन बेचें – तुरंत नकद व डोरस्टेप पिकअप | Sastafone Surat"
        description="सूरत में पुराना स्मार्टफोन तुरंत बेचें। पारदर्शी ऑनलाइन मूल्यांकन, फ्री ऑन-साइट QC और मौके पर तुरंत बैंक/UPI भुगतान।"
        canonicalPath="/sell-phone"
      />

      <div className="container mx-auto px-4 max-w-3xl">
        {/* Top Header */}
        <header className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF2F2] border border-red-200 text-[#DC2626] text-xs font-bold mb-2">
            <Smartphone className="w-3.5 h-3.5" />
            <span>सूरत डोरस्टेप फोन बाय-बैक</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            पुराना मोबाइल बेचें (Sell Old Phone)
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            सूरत में घर बैठे फ्री पिकअप, तुरंत ऑन-साइट इंस्पेक्शन और तत्काल UPI / कैश भुगतान।
          </p>
        </header>

        {/* Step Progress Bar */}
        <div className="flex items-center justify-between mb-8 max-w-xl mx-auto px-2">
          {[
            { num: 1, label: 'ब्रांड व मॉडल' },
            { num: 2, label: 'स्टोरेज व उम्र' },
            { num: 3, label: 'कंडीशन चेक' },
            { num: 4, label: 'फोटो व विवरण' },
            { num: 5, label: 'पिकअप स्लॉट' }
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center flex-1 relative">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep >= s.num
                    ? 'bg-[#DC2626] text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {currentStep > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className="text-[10px] mt-1 text-gray-600 hidden sm:block text-center">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Live Estimation Floating/Sticky Pill */}
        <div className="mb-6 p-4 rounded-2xl bg-[#FEF2F2] border border-red-200 text-gray-900 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
              अनुमानित बाय-बैक मूल्य (Estimated Value)
            </span>
            <div className="text-lg sm:text-xl font-black text-[#DC2626]">
              ₹{estMin.toLocaleString('en-IN')} – ₹{estMax.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-gray-500">
              *अंतिम मूल्य ऑन-साइट निरीक्षण (QC) के बाद तय होगा
            </span>
          </div>

          <div className="text-right">
            <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              ऑन-स्पॉट भुगतान
            </span>
          </div>
        </div>

        {/* STEP 1: BRAND & MODEL */}
        {currentStep === 1 && (
          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-5 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-2">
                1. फोन का ब्रांड चुनें:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {POPULAR_SELL_BRANDS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBrand(b)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      brand === b
                        ? 'border-[#DC2626] bg-[#FEF2F2] text-[#DC2626]'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-gray-50'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-2">
                2. फोन का मॉडल नाम या सीरीज लिखें:
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={modelSearch}
                  onChange={(e) => {
                    setModelSearch(e.target.value);
                    setSelectedModel(e.target.value);
                  }}
                  placeholder={`उदा. ${brand} iPhone 13, Galaxy S21, OnePlus 11R...`}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-xs sm:text-sm outline-none"
                  required
                />
              </div>
            </div>

            {/* Dead Scrap Option */}
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex items-start gap-3">
              <input
                type="checkbox"
                id="deadCheck"
                checked={isDeadPhone}
                onChange={(e) => setIsDeadPhone(e.target.checked)}
                className="mt-0.5 accent-[#DC2626] w-4 h-4 cursor-pointer"
              />
              <label htmlFor="deadCheck" className="text-xs text-gray-700 cursor-pointer">
                <strong>क्या फोन पूरी तरह बंद / डेड (Dead / Scrap) है?</strong>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  यदि फोन चालू नहीं हो रहा तो भी Sastafone ₹600 से ₹1,600 के बीच पार्ट्स बाय-बैक मूल्य प्रदान करता है।
                </p>
              </label>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!modelSearch.trim()) {
                  setSelectedModel(`${brand} Smartphone`);
                }
                setCurrentStep(2);
              }}
              className="w-full py-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer tap-target"
            >
              <span>अगला कदम (Next)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: STORAGE & AGE */}
        {currentStep === 2 && (
          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-5 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-2">
                स्टोरेज क्षमता (Storage Variant):
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {['64GB', '128GB', '256GB', '512GB', '1TB'].map((stg) => (
                  <button
                    key={stg}
                    type="button"
                    onClick={() => setStorage(stg)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      storage === stg
                        ? 'border-[#DC2626] bg-[#FEF2F2] text-[#DC2626]'
                        : 'border-gray-200 text-gray-700 bg-gray-50'
                    }`}
                  >
                    {stg}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-800 mb-2">
                फोन की उम्र (Phone Age):
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'under_6_months', label: '6 महीने से कम' },
                  { id: '6_to_12_months', label: '6 से 12 महीने' },
                  { id: '1_to_2_years', label: '1 से 2 साल' },
                  { id: 'above_2_years', label: '2 साल से अधिक' }
                ].map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setAge(a.id)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      age === a.id
                        ? 'border-[#DC2626] bg-[#FEF2F2] text-[#DC2626]'
                        : 'border-gray-200 text-gray-700 bg-gray-50'
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs cursor-pointer"
              >
                वापस
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex-2 py-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer tap-target"
              >
                <span>कंडीशन चेक करें</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CONDITION CHECKLIST */}
        {currentStep === 3 && (
          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-4 animate-in fade-in duration-200">
            <h2 className="text-sm font-bold text-gray-900 mb-2">
              फोन की कार्यशील स्थिति (Condition Checklist):
            </h2>

            <div className="space-y-3">
              {/* Screen working */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-xs font-medium text-gray-800">
                  क्या स्क्रीन / डिस्प्ले बिल्कुल सही है?
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setScreenWorking(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${screenWorking ? 'bg-[#DC2626] text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    हाँ
                  </button>
                  <button
                    type="button"
                    onClick={() => setScreenWorking(false)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${!screenWorking ? 'bg-[#DC2626] text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    नहीं
                  </button>
                </div>
              </div>

              {/* Touch working */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-xs font-medium text-gray-800">
                  क्या टच स्क्रीन सही काम कर रही है?
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTouchWorking(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${touchWorking ? 'bg-[#DC2626] text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    हाँ
                  </button>
                  <button
                    type="button"
                    onClick={() => setTouchWorking(false)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${!touchWorking ? 'bg-[#DC2626] text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    नहीं
                  </button>
                </div>
              </div>

              {/* Body Scratches */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="block text-xs font-medium text-gray-800 mb-2">
                  बॉडी व फ्रेम की स्थिति (Scratches / Dents):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'none', label: 'स्क्रैचलेस' },
                    { id: 'minor', label: 'सामान्य निशान' },
                    { id: 'heavy', label: 'अधिक स्क्रैच' },
                    { id: 'dented', label: 'डेंट / मुड़ा हुआ' }
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBodyScratches(b.id as any)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold cursor-pointer ${bodyScratches === b.id ? 'bg-[#DC2626] text-white' : 'bg-white border border-gray-200 text-gray-700'}`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Camera */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-xs font-medium text-gray-800">
                  क्या कैमरा व फ्लैश सही काम कर रहे हैं?
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCameraWorking(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${cameraWorking ? 'bg-[#DC2626] text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    हाँ
                  </button>
                  <button
                    type="button"
                    onClick={() => setCameraWorking(false)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${!cameraWorking ? 'bg-[#DC2626] text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    नहीं
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs cursor-pointer"
              >
                वापस
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="flex-2 py-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer tap-target"
              >
                <span>फोटो व बिल अपलोड</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PHOTOS, IMEI & BILL */}
        {currentStep === 4 && (
          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-5 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-1">
                फोन की 1 से 6 तस्वीरें अपलोड करें (फ्रंट, बैक, साइड्स):
              </label>
              <p className="text-[11px] text-gray-500 mb-3">
                वास्तविक तस्वीरों से तकनीशियन तुरंत और सटीक अंतिम क्वोट दे सकता है।
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                    <img src={url} alt={`Phone condition ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {photos.length < 6 && (
                  <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 hover:border-red-400 flex flex-col items-center justify-center text-gray-500 cursor-pointer bg-gray-50">
                    <Camera className="w-5 h-5 text-gray-400 mb-1" />
                    <span className="text-[9px] font-bold">फोटो जोड़ें</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUploadMock}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  IMEI नंबर (वैकल्पिक / *#06# डायल करें)
                </label>
                <input
                  type="text"
                  value={imei}
                  onChange={(e) => setImei(e.target.value.replace(/\D/g, '').slice(0, 15))}
                  placeholder="15-अंकीय IMEI"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono outline-none focus:border-red-500"
                  maxLength={15}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1">
                  बिल की फोटो (यदि उपलब्ध हो)
                </label>
                <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-600 cursor-pointer hover:bg-gray-50">
                  <Upload className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{billPhotoUrl ? '✓ बिल चुना गया' : 'बिल फोटो चुनें'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBillPhotoUploadMock}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs cursor-pointer"
              >
                वापस
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="flex-2 py-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer tap-target"
              >
                <span>पिकअप स्लॉट व पता</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: ADDRESS & PICKUP SLOT */}
        {currentStep === 5 && (
          <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-5 animate-in fade-in duration-200">
            <h2 className="text-sm font-bold text-gray-900 mb-1">
              पिकअप स्लॉट व पता दर्ज करें:
            </h2>

            {/* Slots selection */}
            <div>
              <label className="block text-xs font-bold text-gray-800 mb-2">
                सुविधाजनक पिकअप स्लॉट चुनें:
              </label>
              {isLoadingSlots ? (
                <div className="p-4 text-center text-xs text-gray-500">स्लॉट लोड हो रहे हैं...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {slots.map((s) => {
                    const isFull = s.booked >= s.capacity;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        disabled={isFull}
                        onClick={() => setSelectedSlotId(s.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isFull
                            ? 'opacity-40 bg-gray-100 cursor-not-allowed border-gray-200'
                            : selectedSlotId === s.id
                            ? 'border-[#DC2626] bg-[#FEF2F2] shadow-2xs'
                            : 'border-gray-200 hover:border-gray-300 bg-white cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-gray-900">
                          <span>{s.date}</span>
                          {isFull && <span className="text-[10px] text-red-600 font-bold">स्लॉट फुल</span>}
                        </div>
                        <p className="text-[11px] text-gray-600">{s.window}</p>
                        <span className="text-[10px] text-gray-400">{s.area}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Address */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">आपका नाम</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="पूरा नाम"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-red-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">मोबाइल नंबर (+91)</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-अंकीय नंबर"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono outline-none focus:border-red-500"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">सूरत क्षेत्र (Area)</label>
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white outline-none focus:border-red-500"
                >
                  {SURAT_AREAS_LIST.map((ar) => (
                    <option key={ar} value={ar}>
                      {ar}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">पूरा पता (मकान/बिल्डिंग/रोड)</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="मकान नं., अपार्टमेंट, गली/रोड, सूरत"
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-red-500"
                  required
                />
              </div>
            </div>

            {submissionError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submissionError}</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs cursor-pointer"
              >
                वापस
              </button>
              <button
                type="button"
                onClick={handleSubmitSellRequest}
                disabled={isSubmitting}
                className="flex-2 py-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50 tap-target"
              >
                {isSubmitting ? (
                  <span>अनुरोध सबमिट हो रहा है...</span>
                ) : (
                  <>
                    <span>फ्री पिकअप बुक करें</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {createdRequestId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-gray-900">
                फोन पिकअप अनुरोध दर्ज हुआ!
              </h2>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono text-gray-700">
                अनुरोध ID: <strong>{createdRequestId}</strong>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Sastafone Certified Technician आपके चुने हुए स्लॉट में ऑन-साइट निरीक्षण हेतु पहुंचेगा। निरीक्षण के तुरंत बाद UPI या बैंक ट्रांसफर से भुगतान किया जाएगा।
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCreatedRequestId(null);
                    if (onNavigateHome) onNavigateHome();
                  }}
                  className="w-full py-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer tap-target"
                >
                  होम पर वापस जाएं
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
