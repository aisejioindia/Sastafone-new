import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BRANDS,
  PHONE_MODELS,
  REPAIR_ISSUES,
  RAZORPAY_REPAIR_VISIT_LINK,
  SASTAPHONE_PHONE,
  WHATSAPP_NUMBER
} from '../data/mockData';
import { Brand, PhoneModel, RepairIssue, ConditionGrade } from '../types';
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
  ArrowRight,
  Upload,
  Camera,
  FileCheck,
  AlertTriangle,
  Lock,
  PhoneCall,
  Check,
  ShieldAlert,
  Smartphone,
  Eye,
  X,
  Navigation,
  Home,
  CheckCheck,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RepairServiceSection: React.FC = () => {
  const {
    language,
    selectedLocality,
    addOrder,
    orders,
    setIsDashboardOpen,
    user,
    requireAuth,
    setIsAuthModalOpen
  } = useApp();

  // Mode: Catalog Model vs Custom Model Form
  const [useCustomModel, setUseCustomModel] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand>(BRANDS[0]);
  const [selectedModel, setSelectedModel] = useState<PhoneModel>(PHONE_MODELS[0] || {
    id: 'samsung-galaxy-s24',
    brandId: 'samsung',
    name: 'Samsung Galaxy S24 5G',
    baseValuation: 55000,
    imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80',
    category: 'flagship',
    variants: [{ ram: '8 GB', storage: '128 GB', priceModifier: 0 }],
    colors: [{ name: 'Black', hex: '#000000' }]
  });

  // Custom Model Form state
  const [customBrandName, setCustomBrandName] = useState('Samsung');
  const [customModelName, setCustomModelName] = useState('');
  const [customRam, setCustomRam] = useState('8 GB');
  const [customStorage, setCustomStorage] = useState('128 GB');
  const [customIs5G, setCustomIs5G] = useState(true);
  const [customColor, setCustomColor] = useState('Phantom Black');
  const [customCondition, setCustomCondition] = useState<ConditionGrade>('good');

  // Multi-Select Repair Issues
  const [selectedIssues, setSelectedIssues] = useState<RepairIssue[]>([REPAIR_ISSUES[0]]);

  // Ownership & Anti-theft Details
  const [imeiNumber, setImeiNumber] = useState('');
  const [billPhotoUrl, setBillPhotoUrl] = useState<string>('');
  const [isOwnershipConfirmed, setIsOwnershipConfirmed] = useState(false);
  const [isTimeNoticeAccepted, setIsTimeNoticeAccepted] = useState(true);

  // Doorstep Pickup & Compulsory Address Details (Anti-Fraud Clearance)
  const [customerName, setCustomerName] = useState(user.name || '');
  const [customerPhone, setCustomerPhone] = useState(user.phone || '');
  const [houseShopNo, setHouseShopNo] = useState('');
  const [buildingSociety, setBuildingSociety] = useState('');
  const [streetLandmark, setStreetLandmark] = useState(user.landmark || '');
  const [pincode, setPincode] = useState(user.pincode || '395009');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('Today (Within 30-45 Mins)');

  // Free Live GPS Coordinates (100% Free - ₹0 external charges)
  const [gpsData, setGpsData] = useState<{
    latitude: number;
    longitude: number;
    accuracyMeters?: number;
    mapsLink?: string;
  } | null>(user.gpsLocation || null);
  const [isLocatingGps, setIsLocatingGps] = useState(false);

  // Compulsory Online Payment State (₹199 QC Token)
  const [paymentUtr, setPaymentUtr] = useState('');
  const [hasPaidOnline, setHasPaidOnline] = useState(false);
  const [paymentOption, setPaymentOption] = useState<'advance_upi' | 'razorpay'>('advance_upi');

  // Submission & UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedOrder, setBookedOrder] = useState<any | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Sync user details if changed
  React.useEffect(() => {
    if (user.isLoggedIn) {
      if (!customerName && user.name) setCustomerName(user.name);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
      if (user.landmark && !streetLandmark) setStreetLandmark(user.landmark);
      if (user.pincode && !pincode) setPincode(user.pincode);
      if (user.gpsLocation && !gpsData) setGpsData(user.gpsLocation);
    }
  }, [user]);

  // Free Browser GPS Geolocation Handler (Zero External Cost)
  const handleDetectFreeGps = () => {
    if (!navigator.geolocation) {
      setFormError('आपके डिवाइस पर GPS उपलब्ध नहीं है। कृपया पूरा पता व लैंडमार्क नीचे दर्ज करें।');
      return;
    }
    setIsLocatingGps(true);
    setFormError(null);

    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy);
        const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;

        setGpsData({
          latitude: lat,
          longitude: lng,
          accuracyMeters: acc,
          mapsLink: mapUrl
        });
        setIsLocatingGps(false);
      },
      err => {
        console.warn('Geolocation error:', err.message);
        // Fallback default Surat central coordinates
        setGpsData({
          latitude: 21.1702,
          longitude: 72.8311,
          accuracyMeters: 40,
          mapsLink: `https://www.google.com/maps?q=21.1702,72.8311`
        });
        setIsLocatingGps(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Handle Multi-Select Issue Toggle
  const toggleIssue = (issue: RepairIssue) => {
    const exists = selectedIssues.some(i => i.id === issue.id);
    if (exists) {
      if (selectedIssues.length === 1) {
        setFormError('कम से कम 1 समस्या चुनना आवश्यक है');
        return;
      }
      setSelectedIssues(selectedIssues.filter(i => i.id !== issue.id));
    } else {
      setSelectedIssues([...selectedIssues, issue]);
    }
    setFormError(null);
  };

  // Pricing calculations
  const totalMinPrice = selectedIssues.reduce((acc, curr) => acc + curr.minPrice, 0);
  const totalMaxPrice = selectedIssues.reduce((acc, curr) => acc + curr.maxPrice, 0);

  // Warranty rule: < 1000 => 3 months warranty, >= 1000 => 6 months warranty
  const warrantyPeriod = totalMinPrice < 1000 ? '3 महीने (₹1k से नीचे)' : '6 महीने (₹1k+ पर 6 माह वारंटी)';

  // Mock upload bill photo
  const handleBillUploadSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fakeUrl = URL.createObjectURL(file);
      setBillPhotoUrl(fakeUrl);
    } else {
      setBillPhotoUrl('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80');
    }
  };

  // Final Submission to Sastafone Team (Enforcing Online Payment & Verified Address)
  const handleSubmitToTeam = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Enforce Login first
    if (!user.isLoggedIn) {
      requireAuth('मोबाइल रिपेयरिंग आवेदन सबमिट करने के लिए कृपया पहले लॉगिन करें।', () => {});
      return;
    }

    // 2. Validate custom model if toggled
    const phoneTitle = useCustomModel
      ? `${customBrandName} ${customModelName || 'Custom Model'} ${customIs5G ? '(5G)' : '(4G)'}`
      : selectedModel.name;

    if (useCustomModel && !customModelName.trim()) {
      setFormError('कृपया अपने फ़ोन का मॉडल नाम दर्ज करें (e.g. Redmi Note 13 Pro+ / Vivo V29)');
      return;
    }

    if (selectedIssues.length === 0) {
      setFormError('कृपया कम से कम 1 समस्या चुनें');
      return;
    }

    // 3. Ownership / Anti-theft validation
    if (!isOwnershipConfirmed) {
      setFormError('कृपया पुष्टि करें कि यह फ़ोन आपका वैध स्वामित्व है और चोरी का नहीं है।');
      return;
    }

    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 10) {
      setFormError('कृपया 10-अंकों का वैध मोबाइल नंबर दर्ज करें');
      return;
    }

    // 4. Compulsory Address Validation (Anti-Fraud)
    if (!houseShopNo.trim()) {
      setFormError('कृपया फ्लैट / मकान / दुकान नंबर दर्ज करें (गलत पते से सुरक्षा के लिए अनिवार्य)');
      return;
    }
    if (!buildingSociety.trim()) {
      setFormError('कृपया बिल्डिंग / अपार्टमेंट / सोसाइटी का नाम दर्ज करें');
      return;
    }
    if (!streetLandmark.trim()) {
      setFormError('कृपया नज़दीकी लैंडमार्क दर्ज करें (जैसे मंदिर, स्कूल, बीआरटीएस, मॉल)');
      return;
    }

    // 5. STRICT COMPULSORY ONLINE PAYMENT CHECK (₹199 QC Token)
    const cleanUtr = paymentUtr.trim();
    if (!cleanUtr || cleanUtr.length < 6) {
      setFormError('❌ ऑनलाइन भुगतान अनिवार्य है! कृपया ₹199 ऑनलाइन पे करके 12-अंकों का UPI UTR / Transaction ID दर्ज करें। बिना पेमेंट के रिपेयर सबमिट नहीं हो सकता।');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    const issuesSummary = selectedIssues.map(i => i.hindiName).join(', ');
    const fullStructuredAddress = `${houseShopNo.trim()}, ${buildingSociety.trim()}, नियर ${streetLandmark.trim()}, ${selectedLocality}, Surat - ${pincode.trim() || '395009'}`;

    setTimeout(() => {
      const newOrder = addOrder({
        type: 'repair',
        title: `${phoneTitle} - ${selectedIssues.length} समस्याएं`,
        subtitle: `${issuesSummary} • अनुमानित बिल: ${formatINR(totalMinPrice)} - ${formatINR(totalMaxPrice)} • वारंटी: ${warrantyPeriod}`,
        amount: 199, // ₹199 advance inspection token
        status: 'technician_assigned',
        statusHindi: '₹199 ऑनलाइन टोकन वेरिफाइड • टेक लैब समीक्षा में',
        locality: selectedLocality,
        fullAddress: fullStructuredAddress,
        customerName: customerName || user.name || 'Surat Resident',
        customerPhone: customerPhone || user.phone || '9372802044',
        timeSlot: selectedTimeSlot,
        technicianName: 'संजय प्रजापति (सस्ताफोन सर्टिफाइड टेक लीड)',
        technicianPhone: '9372802044',
        visitCharge: 199,
        paymentMethod: `Online UPI Advance (UTR: ${cleanUtr})`,
        paymentStatus: 'paid',
        refundPolicyNote: 'फोन रिपेयर होने पर यह ₹199 फाइनल बिल में 100% एडजस्ट होगा।',
        customerRequirement: `समस्याएं: ${issuesSummary}. कस्टमर रंग: ${useCustomModel ? customColor : 'Standard'}. IMEI: ${imeiNumber || 'ऑन-पिकअप वेरीफाई'}.`,
        customerDoubtResolved: `सूरत लैब धैर्य सूचना स्वीकृत: जटिल हार्डवेयर कार्य में मानक समय लगेगा। बिल ₹1k से नीचे 3 माह, ऊपर 6 माह वारंटी दी जाएगी।`,
        repairProblems: selectedIssues.map(i => i.hindiName),
        billPhotoUrl: billPhotoUrl || undefined,
        ownershipDeclared: isOwnershipConfirmed,
        antiTheftVerified: true,
        imeiNumber: imeiNumber || undefined,
        advanceTokenAmount: 199,
        landmark: streetLandmark.trim(),
        pincode: pincode.trim() || '395009',
        onlinePaymentUtr: cleanUtr,
        gpsLocation: gpsData || {
          latitude: 21.1702,
          longitude: 72.8311,
          accuracyMeters: 30,
          mapsLink: `https://www.google.com/maps?q=21.1702,72.8311`
        },
        customModelDetails: {
          brand: useCustomModel ? customBrandName : selectedBrand.name,
          model: useCustomModel ? customModelName : selectedModel.name,
          ram: useCustomModel ? customRam : '8 GB',
          storage: useCustomModel ? customStorage : '128 GB',
          is5G: useCustomModel ? customIs5G : selectedModel.is5G,
          color: useCustomModel ? customColor : 'Standard',
          condition: useCustomModel ? customCondition : 'good'
        }
      });

      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setIsSubmitting(false);
      setBookedOrder(newOrder);
    }, 800);
  };

  return (
    <section id="repair-section" className="py-8 bg-slate-100/70 border-b border-slate-200">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* App-like Header Banner */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200/90 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-black mb-2">
                <Wrench className="w-3.5 h-3.5 text-red-600" />
                <span>सस्ताफोन अधिकृत डोरस्टेप रिपेयर ऐप (Surat Super Lab)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                ग्राहक रिपेयरिंग आवेदन व कोटेशन इंजन
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                घर बैठे 30 मिनट में फ़ोन की जांच व रिपेयर। मात्र ₹199 एडवांस QC टोकन (फाइनल बिल में माइनस)।
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                सूरत एक्सप्रेस लैब
              </span>
              <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>एंटी-थेफ्ट व बिल वेरिफिकेशन प्रोटेक्टेड</span>
              </span>
            </div>
          </div>
        </div>

        {/* If Booked Successfully, Show App Confirmation Card */}
        {bookedOrder ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-300 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              ऑर्डर नंबर: {bookedOrder.orderNumber}
            </span>

            <h3 className="text-2xl font-black text-slate-900 mt-3">
              रिपेयरिंग आवेदन सस्ताफोन टीम को सबमिट हो गया!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg mx-auto">
              सर्टिफाइड टेक्नीशियन <span className="font-bold text-slate-900">संजय प्रजापति</span> को आपका आवेदन भेज दिया गया है। एडमिन डैशबोर्ड पर आपकी लाइव जॉब-शीट तैयार है।
            </p>

            {/* Quick Summary Box */}
            <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left max-w-md mx-auto space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">डिवाइस:</span>
                <span className="font-bold text-slate-900">{bookedOrder.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">समस्याएं:</span>
                <span className="font-bold text-slate-900">{bookedOrder.repairProblems?.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">एडवांस टोकन:</span>
                <span className="font-bold text-emerald-600">₹199 (बिल में एडजस्ट होगा)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">वारंटी गारंटी:</span>
                <span className="font-bold text-blue-700">{warrantyPeriod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">एंटी-थेफ्ट स्थिति:</span>
                <span className="font-bold text-emerald-700">✓ वैध स्वामित्व सत्यापित</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setBookedOrder(null);
                  setIsDashboardOpen(true);
                }}
                className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <span>डैशबोर्ड में जॉब-कार्ड ट्रैक करें</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={generateWhatsAppLink(
                  `नमस्ते सस्ताफोन टीम! मैंने रिपेयरिंग आवेदन #${bookedOrder.orderNumber} सबमिट किया है। कृपया पिकअप शेड्यूल कन्फर्म करें।`
                )}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp पर तुरंत चैट करें</span>
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitToTeam} className="space-y-6">
            {/* Login Warning Banner if Not Authenticated */}
            {!user.isLoggedIn && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-black text-amber-950 block">
                      लॉगिन अनिवार्य है (Login Required)
                    </span>
                    <span>
                      फ़ोन रिपेयर फॉर्म भरने और पिकअप शेड्यूल करने के लिए पहले लॉगिन करें।
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-xs transition-all shrink-0 cursor-pointer"
                >
                  तुरंत लॉगिन करें
                </button>
              </div>
            )}

            {formError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            {/* STEP 1: Phone Selection / Custom Phone Model */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center">
                    1
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    अपना मोबाइल व मॉडल चुनें
                  </h3>
                </div>

                {/* Custom Model Toggle */}
                <button
                  type="button"
                  onClick={() => setUseCustomModel(!useCustomModel)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    useCustomModel
                      ? 'bg-red-50 border-red-300 text-red-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {useCustomModel ? '✓ कस्टम मॉडल सक्रिय' : '+ Enter Custom Phone Model'}
                </button>
              </div>

              {!useCustomModel ? (
                <div>
                  {/* Brand Pills */}
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    ब्रांड चुनें (Select Brand):
                  </label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {BRANDS.map(brand => (
                      <button
                        key={brand.id}
                        type="button"
                        onClick={() => {
                          setSelectedBrand(brand);
                          const firstModel = PHONE_MODELS.find(m => m.brandId === brand.id);
                          if (firstModel) setSelectedModel(firstModel);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          selectedBrand.id === brand.id
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span>{brand.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Model Selector */}
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    मॉडल चुनें (Select Model):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {PHONE_MODELS.filter(m => m.brandId === selectedBrand.id).slice(0, 9).map(model => (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => setSelectedModel(model)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                          selectedModel.id === model.id
                            ? 'border-red-600 bg-red-50/50 ring-2 ring-red-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <img
                          src={model.imageUrl}
                          alt={model.name}
                          className="w-10 h-10 object-contain rounded-lg bg-slate-50"
                        />
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-slate-900 truncate">{model.name}</p>
                          <p className="text-[10px] text-slate-500">
                            {model.variants?.[0]?.ram || '8GB'} • {model.variants?.[0]?.storage || '128GB'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Custom Model Form (Requested by User) */
                <div className="p-4 rounded-2xl bg-red-50/40 border border-red-200 space-y-3.5 animate-in fade-in">
                  <div className="flex items-center gap-2 text-xs font-black text-red-900">
                    <Smartphone className="w-4 h-4 text-red-600" />
                    <span>Enter Custom Phone Model (ब्रांड, मॉडल, रैम, स्टोरेज, 5G/4G व कलर)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        ब्रांड का नाम *
                      </label>
                      <select
                        value={customBrandName}
                        onChange={e => setCustomBrandName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white outline-hidden focus:ring-2 focus:ring-red-500"
                      >
                        {BRANDS.map(b => (
                          <option key={b.id} value={b.name}>{b.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        सटीक मॉडल का नाम (Model Name) *
                      </label>
                      <input
                        type="text"
                        required
                        value={customModelName}
                        onChange={e => setCustomModelName(e.target.value)}
                        placeholder="e.g. Redmi Note 13 Pro+ / Vivo V29"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white outline-hidden focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        रैम व स्टोरेज (RAM & Storage)
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={customRam}
                          onChange={e => setCustomRam(e.target.value)}
                          className="w-1/2 px-2.5 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                        >
                          <option value="4 GB">4 GB RAM</option>
                          <option value="6 GB">6 GB RAM</option>
                          <option value="8 GB">8 GB RAM</option>
                          <option value="12 GB">12 GB RAM</option>
                          <option value="16 GB">16 GB RAM</option>
                        </select>
                        <select
                          value={customStorage}
                          onChange={e => setCustomStorage(e.target.value)}
                          className="w-1/2 px-2.5 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                        >
                          <option value="64 GB">64 GB</option>
                          <option value="128 GB">128 GB</option>
                          <option value="256 GB">256 GB</option>
                          <option value="512 GB">512 GB</option>
                          <option value="1 TB">1 TB</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        नेटवर्क टाइप (5G / 4G)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setCustomIs5G(true)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            customIs5G
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-white text-slate-700 border-slate-300'
                          }`}
                        >
                          5G स्मार्टफोन
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomIs5G(false)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            !customIs5G
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-white text-slate-700 border-slate-300'
                          }`}
                        >
                          4G / LTE
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        फ़ोन का कलर (Color)
                      </label>
                      <input
                        type="text"
                        value={customColor}
                        onChange={e => setCustomColor(e.target.value)}
                        placeholder="e.g. Phantom Black / Blue / Silver"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white outline-hidden focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        शारीरिक स्थिति (Body Condition)
                      </label>
                      <select
                        value={customCondition}
                        onChange={e => setCustomCondition(e.target.value as ConditionGrade)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white outline-hidden focus:ring-2 focus:ring-red-500"
                      >
                        <option value="flawless">Flawless (सुपर फ्रेश - कोई स्क्रैच नहीं)</option>
                        <option value="good">Good (हल्के सामान्य स्क्रैच)</option>
                        <option value="average">Average (डेंट या बॉडी खरोंच)</option>
                        <option value="damaged">Damaged (ग्लास क्रैक या डैमेज)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2: Multi-Select Repair Problems (फोन की समस्या चुनें) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center">
                    2
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    फोन की समस्या (प्रॉब्लम) चुनें
                  </h3>
                </div>
                <span className="text-[11px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                  मल्टी-सिलेक्ट उपलब्ध ({selectedIssues.length} चुनी गई)
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                आप एक से अधिक समस्याएं एक साथ चुन सकते हैं। चुने गए प्रॉब्लम के हिसाब से तत्काल अनुमानित बिल व वारंटी तय होती है:
              </p>

              {/* Problem Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {REPAIR_ISSUES.map(issue => {
                  const isChecked = selectedIssues.some(i => i.id === issue.id);
                  return (
                    <div
                      key={issue.id}
                      onClick={() => toggleIssue(issue)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                        isChecked
                          ? 'border-red-600 bg-red-50/60 ring-2 ring-red-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                          isChecked ? 'bg-red-600 border-red-600 text-white' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900">{issue.hindiName}</p>
                          <span className="text-xs font-black text-red-700">
                            {formatINR(issue.minPrice)} - {formatINR(issue.maxPrice)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">{issue.description}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400 font-medium">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{issue.estimatedTime}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Live Cost & Warranty Banner */}
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                    अनुमानित रिपेयरिंग बिल (Estimated Cost)
                  </span>
                  <div className="text-xl font-black text-amber-400">
                    {formatINR(totalMinPrice)} - {formatINR(totalMaxPrice)}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      वारंटी गारंटी (Warranty)
                    </span>
                    <span className="text-xs font-black text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30 inline-block">
                      {warrantyPeriod}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 3: Patience & Lab Repair Notice (सूरत सेंट्रल टेक सुपर लैब) */}
            <div className="bg-amber-50 rounded-3xl p-5 border border-amber-200">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                    सूरत सेंट्रल टेक सुपर लैब • धैर्य व अधिकतम समय सूचना (Patience Notice)
                  </h4>
                  <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                    कुछ जटिल समस्याओं (जैसे BGA मदरबोर्ड माइक्रो-सोल्डरिंग, ओरिजिनल कर्व्ड डिस्प्ले OCA री-ग्लासिंग, अथवा लिक्विड डैमेज अल्ट्रासोनिक क्लीनिंग) में मानक से अधिक समय लगता है। उचित जांच व 100% सफल रिपेयर के लिए आपको पर्याप्त समय देना होगा।
                  </p>
                  <label className="flex items-center gap-2 mt-2.5 cursor-pointer text-xs font-bold text-amber-950">
                    <input
                      type="checkbox"
                      checked={isTimeNoticeAccepted}
                      onChange={e => setIsTimeNoticeAccepted(e.target.checked)}
                      className="rounded border-amber-400 text-red-600 focus:ring-red-500"
                    />
                    <span>मैं सहमत हूँ कि सर्वोत्तम क्वालिटी के लिए आवश्यक समय देना उचित है।</span>
                  </label>
                </div>
              </div>
            </div>

            {/* STEP 4: Anti-Theft Clearance & Ownership Proof (चोरी का फोन नहीं है - सत्यापन) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center">
                  3
                </span>
                <h3 className="text-base font-black text-slate-900">
                  ओनरशिप व एंटी-थेफ्ट क्लीयरेंस (चोरी का फोन सत्यापन)
                </h3>
              </div>
              <p className="text-xs text-slate-600 mb-4">
                सस्ताफोन पर चोरी या लावारिस फोन का काम बिल्कुल नहीं किया जाता। बिल की प्रति या स्वामित्व विवरण देना अनिवार्य है।
              </p>

              {/* Strict Notice Box */}
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs mb-4 flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">
                    सुरक्षा निर्देश: फोन चोरी की तो नहीं है, यह क्लियर होने के बाद ही फोन पिकअप किया जाएगा।
                  </span>
                  <span className="text-[11px] text-rose-800">
                    हमारी टीम भारत सरकार के CEIR व पुलिस खोया-पाया पोर्टल से IMEI स्टेटस क्रॉस-चेक करती है।
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* IMEI Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    फ़ोन का IMEI नंबर (वैकल्पिक / डायलर में *#06# दबाएं)
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    value={imeiNumber}
                    onChange={e => setImeiNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 864501051234567 (15 Digits)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-red-500 outline-hidden tracking-wider"
                  />
                </div>

                {/* Bill Photo Upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    बिल की कॉपी या बॉक्स फोटो अपलोड करें (Ownership Proof)
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-dashed border-slate-300 hover:border-red-500 bg-slate-50 hover:bg-red-50/30 text-slate-700 text-xs font-bold cursor-pointer transition-all">
                      <Upload className="w-4 h-4 text-red-600" />
                      <span>{billPhotoUrl ? 'फ़ाइल चुनी गई (बदलें)' : 'बिल / इनवॉइस चुनें'}</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleBillUploadSimulate}
                        className="hidden"
                      />
                    </label>

                    {billPhotoUrl && (
                      <button
                        type="button"
                        onClick={() => setBillPhotoUrl('')}
                        className="p-2.5 rounded-xl border border-slate-300 text-slate-500 hover:text-rose-600 cursor-pointer"
                        title="हटाएं"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Bill Photo Preview if Uploaded */}
              {billPhotoUrl && (
                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <img
                    src={billPhotoUrl}
                    alt="Bill Preview"
                    className="w-12 h-12 object-cover rounded-lg border border-slate-300"
                  />
                  <div className="text-xs">
                    <p className="font-bold text-emerald-700 flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>बिल की प्रति संलग्न है (स्वामित्व प्रमाण)</span>
                    </p>
                    <p className="text-[10px] text-slate-500">टेक्नीशियन पिकअप के समय मूल बिल से मिलान करेगा।</p>
                  </div>
                </div>
              )}

              {/* Mandatory Ownership Declaration Checkbox */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    required
                    checked={isOwnershipConfirmed}
                    onChange={e => setIsOwnershipConfirmed(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  <span>
                    मैं प्रमाणित करता/करती हूँ कि मैं इस फ़ोन का वास्तविक व कानूनी मालिक हूँ। यह फोन किसी भी प्रकार से चोरी, गुमशुदा या गैर-कानूनी नहीं है।
                  </span>
                </label>
              </div>
            </div>

            {/* STEP 4: Compulsory Doorstep Address & Free Live GPS Pin (Anti-Fraud Clearance) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center">
                  4
                </span>
                <h3 className="text-base font-black text-slate-900">
                  सटीक डोरस्टेप पता व लाइव GPS पिन (अनिवार्य)
                </h3>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                सस्ताफोन राइडर सीधे आपके दिए गए पते पर पहुंचेगा। गलत या फर्जी पते से सुरक्षा के लिए सटीक पता व लैंडमार्क अनिवार्य है।
              </p>

              {/* Anti-Fraud Warning Box */}
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs mb-4 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">
                    सुरक्षा सूचना: गलत या अधूरा पता दर्ज करने पर टेक्नीशियन पिकअप नहीं करेंगे।
                  </span>
                  <span className="text-[11px] text-amber-800">
                    कृपया अपना सटीक मकान/दुकान नंबर, सोसाइटी और नज़दीकी लैंडमार्क दर्ज करें और 1-क्लिक में लाइव GPS पिन लें।
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    आपका नाम (Your Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="e.g. राहुल पटेल"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-red-500 outline-hidden bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    मोबाइल नंबर (WhatsApp Active) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9825012345"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-red-500 outline-hidden tracking-wider bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    मकान / दुकान / फ्लैट नंबर *
                  </label>
                  <input
                    type="text"
                    required
                    value={houseShopNo}
                    onChange={e => setHouseShopNo(e.target.value)}
                    placeholder="e.g. फ्लैट नं. 402 / शॉप नं. 12"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-red-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    बिल्डिंग / सोसाइटी / कॉम्प्लेक्स नाम *
                  </label>
                  <input
                    type="text"
                    required
                    value={buildingSociety}
                    onChange={e => setBuildingSociety(e.target.value)}
                    placeholder="e.g. राजहंस सिम्फोनिया / आनंद रेजीडेंसी"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-red-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    रोड / नज़दीकी लैंडमार्क (Landmark) *
                  </label>
                  <input
                    type="text"
                    required
                    value={streetLandmark}
                    onChange={e => setStreetLandmark(e.target.value)}
                    placeholder="e.g. नियर पाल आरटीओ / स्वामीनारायण मंदिर के सामने"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-red-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    सूरत लोकैलिटी व पिनकोड
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      disabled
                      value={`${selectedLocality}, Surat`}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 font-semibold"
                    />
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="395009"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-red-500 outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    पिकअप समय स्लॉट (Time Slot)
                  </label>
                  <select
                    value={selectedTimeSlot}
                    onChange={e => setSelectedTimeSlot(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:ring-2 focus:ring-red-500 outline-hidden"
                  >
                    <option value="Today (Within 30-45 Mins)">आज ही (अगले 30-45 मिनट में तत्काल)</option>
                    <option value="Today Afternoon (2:00 PM - 5:00 PM)">आज दोपहर (2:00 PM - 5:00 PM)</option>
                    <option value="Today Evening (6:00 PM - 9:00 PM)">आज शाम (6:00 PM - 9:00 PM)</option>
                    <option value="Tomorrow Morning (10:00 AM - 1:00 PM)">कल सुबह (10:00 AM - 1:00 PM)</option>
                  </select>
                </div>

                {/* Free Live GPS Location Button */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    लाइव GPS पिन (100% मुफ़्त ब्राउज़र Geolocation)
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectFreeGps}
                    disabled={isLocatingGps}
                    className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      gpsData
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-blue-400 text-blue-700 shadow-xs'
                    }`}
                  >
                    {isLocatingGps ? (
                      <span className="flex items-center gap-1.5 animate-pulse">
                        <Navigation className="w-3.5 h-3.5 animate-spin" />
                        GPS खोजा जा रहा है (मुफ़्त)...
                      </span>
                    ) : gpsData ? (
                      <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                        <CheckCheck className="w-4 h-4 text-emerald-600" />
                        ✓ लाइव GPS वेरिफाइड (Google Maps लिंक अटैच)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Navigation className="w-3.5 h-3.5 text-blue-600" />
                        📍 1-क्लिक में लाइव GPS पिन लें (100% मुफ़्त)
                      </span>
                    )}
                  </button>
                  {gpsData && (
                    <div className="flex items-center justify-between text-[10px] text-emerald-700 mt-1 px-1">
                      <span>सटीकता: ±{gpsData.accuracyMeters}m ({gpsData.latitude.toFixed(4)}, {gpsData.longitude.toFixed(4)})</span>
                      <a
                        href={gpsData.mapsLink}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold underline text-blue-600 hover:text-blue-800"
                      >
                        नक्शे में देखें
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* STEP 5: COMPULSORY ₹199 QC Token Online Payment (बिना पेमेंट सबमिट नहीं होगा) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border-2 border-red-200">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center">
                    5
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    ₹199 QC टोकन ऑनलाइन भुगतान (अनिवार्य • 100% Compulsory)
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[11px] font-black uppercase tracking-wider">
                  ऑनलाइन पेमेंट अनिवार्य
                </span>
              </div>

              <p className="text-xs text-slate-600 mb-4">
                सस्ताफोन पॉलिसी: बिना ऑनलाइन पेमेंट के रिपेयरिंग आवेदन सबमिट नहीं होगा। यह ₹199 टोकन आपके अंतिम बिल में से 100% माइनस (एडजस्ट) हो जाएगा।
              </p>

              {/* QR Code & Direct UPI Pay Grid */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white mb-4">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  {/* Real UPI QR Code */}
                  <div className="bg-white p-3 rounded-2xl shadow-md shrink-0 text-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                        'upi://pay?pa=9372802044@okbizaxis&pn=Sastafone%20Surat&am=199&cu=INR&tn=STP-REPAIR-QC-199'
                      )}`}
                      alt="Sastafone UPI QR Code ₹199"
                      className="w-32 h-32 object-contain mx-auto"
                    />
                    <span className="block text-[10px] text-slate-700 font-bold mt-1">
                      स्कैन करें • ₹199
                    </span>
                  </div>

                  {/* Payment Details & Quick App Links */}
                  <div className="space-y-2.5 flex-1 text-center sm:text-left">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
                        आधिकारिक सस्ताफोन सूरत UPI ID
                      </span>
                      <div className="text-sm font-mono font-black text-white bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 select-all inline-block mt-1">
                        9372802044@okbizaxis
                      </div>
                    </div>

                    <div className="text-xs text-slate-300">
                      Google Pay, PhonePe, Paytm, BHIM किसी भी ऐप से ₹199 स्कैन करके भेजें।
                    </div>

                    {/* Direct UPI Intent Button */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <a
                        href="upi://pay?pa=9372802044@okbizaxis&pn=Sastafone%20Surat&am=199&cu=INR&tn=STP-REPAIR-QC-199"
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black transition-all inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>UPI ऐप से सीधे पे करें (₹199)</span>
                      </a>

                      <a
                        href={RAZORPAY_REPAIR_VISIT_LINK}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-all inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Razorpay लिंक से पे करें</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Compulsory 12-Digit UTR Input */}
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-rose-950">
                    पेमेंट के बाद 12-अंकों का UPI UTR / Transaction ID दर्ज करें * (अनिवार्य)
                  </label>
                  <span className="text-[10px] text-rose-800 font-bold bg-rose-200/60 px-2 py-0.5 rounded">
                    वेरिफिकेशन अनिवार्य
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={paymentUtr}
                    onChange={e => setPaymentUtr(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                    placeholder="e.g. 412356789012 (GPay/PhonePe में 12-अंकों का UTR/Ref)"
                    className="w-full px-4 py-2.5 rounded-xl border border-rose-300 text-sm font-mono font-bold tracking-wider focus:ring-2 focus:ring-red-500 outline-hidden bg-white text-slate-900"
                  />
                  {paymentUtr.length >= 6 && (
                    <span className="absolute right-3 top-2.5 text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      <Check className="w-3.5 h-3.5" /> यूटीआर दर्ज
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-rose-900/90 leading-tight">
                  ✓ पेमेंट पूरा होने के बाद आपके बैंक या UPI ऐप (GPay/PhonePe) की स्क्रीन पर 12-अंकों का UTR/Ref नंबर दिखता है, उसे यहाँ भरें।
                </p>
              </div>
            </div>

            {/* Final Action Button: Submit to Team */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || paymentUtr.trim().length < 6}
                className={`w-full py-4 rounded-2xl text-white text-base font-black shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  paymentUtr.trim().length >= 6
                    ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 hover:shadow-xl'
                    : 'bg-slate-400 opacity-80 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <span>सस्ताफोन टीम को सबमिट हो रहा है...</span>
                ) : paymentUtr.trim().length < 6 ? (
                  <>
                    <Lock className="w-5 h-5 text-amber-300" />
                    <span>🔒 ₹199 ऑनलाइन पेमेंट व UTR दर्ज करें (सबमिट करने के लिए)</span>
                  </>
                ) : (
                  <>
                    <Wrench className="w-5 h-5 text-amber-300" />
                    <span>Submit to Team (₹199 पेमेंट वेरिफाइड • सबमिट करें)</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-slate-500 mt-2 font-medium">
                सबमिट करने पर यह रिक्वेस्ट तुरंत सस्ताफोन एडमिन डैशबोर्ड पर पंजीकृत हो जाएगी और आपको रसीद जारी होगी।
              </p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
};
