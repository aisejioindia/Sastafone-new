import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { P2PListing, ChatMessage } from '../types';
import { formatINR } from '../utils/valuation';
import { SURAT_LOCALITIES, BRANDS } from '../data/mockData';
import { SAFE_CHAT_PRESETS, validateChatSecurity } from '../utils/chatSecurity';
import {
  Upload,
  PlusCircle,
  ShieldCheck,
  Lock,
  Unlock,
  Phone,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
  Camera,
  X,
  CreditCard,
  Crown,
  MessageCircle,
  Send,
  Zap,
  KeyRound,
  ShieldAlert,
  Eye,
  Sparkles,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const P2PMarketplaceSection: React.FC = () => {
  const {
    language,
    selectedLocality,
    p2pListings,
    addP2PListing,
    unlockedContactIds,
    unlockContact,
    buyerCredits,
    buyerPlan,
    buyBuyerPass,
    unlockContactWithCredit,
    sellerPostCredits,
    buySellerPostPass,
    chatMessages,
    sendChatMessage,
    user,
    openPaymentModal,
    setActiveTab
  } = useApp();

  // Modal States
  const [isSellerPayModalOpen, setIsSellerPayModalOpen] = useState(false);
  const [selectedSellerPlan, setSelectedSellerPlan] = useState<'single_99' | 'pro_799'>('single_99');

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isBuyerPassModalOpen, setIsBuyerPassModalOpen] = useState(false);
  const [selectedBuyerPlan, setSelectedBuyerPlan] = useState<'basic_99' | 'pro_299'>('basic_99');

  // Contact unlock target
  const [pendingUnlockListing, setPendingUnlockListing] = useState<P2PListing | null>(null);

  // In-app chat modal state
  const [activeChatListing, setActiveChatListing] = useState<P2PListing | null>(null);
  const [chatInputText, setChatInputText] = useState('');
  const [chatSecurityError, setChatSecurityError] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState('');

  // Post Ad Form State
  const [selectedBrand, setSelectedBrand] = useState('Apple');
  const [modelNameInput, setModelNameInput] = useState('');
  const [variantInput, setVariantInput] = useState('8GB RAM / 128GB');
  const [priceInput, setPriceInput] = useState('');
  const [conditionInput, setConditionInput] = useState('Superb (शानदार - कोई बड़ा स्क्रैच नहीं)');
  const [highlightsInput, setHighlightsInput] = useState('बैटरी हेल्थ 90%+, ओरिजिनल बिल व बॉक्स मौजूद');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [localityInput, setLocalityInput] = useState(selectedLocality);
  const [sellerNameInput, setSellerNameInput] = useState(user.name || 'Surat Resident');
  const [sellerPhoneInput, setSellerPhoneInput] = useState(user.phone || '');
  const [uploadedImages, setUploadedImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'
  ]);
  const [imageValidationError, setImageValidationError] = useState<string | null>(null);
  const [isValidatingImage, setIsValidatingImage] = useState(false);

  // Filter state
  const [searchBrand, setSearchBrand] = useState<string>('all');

  const filteredListings = searchBrand === 'all'
    ? p2pListings
    : p2pListings.filter(l => l.brand.toLowerCase().includes(searchBrand.toLowerCase()));

  // Trigger Post Ad (Enforcing: No post without payment)
  const handleInitiatePostAd = () => {
    if (sellerPostCredits <= 0) {
      // Must purchase posting plan first!
      setIsSellerPayModalOpen(true);
    } else {
      // Already has prepaid credit
      setIsPostModalOpen(true);
    }
  };

  // Pay for Seller Posting Pass
  const handlePurchaseSellerPlan = () => {
    buySellerPostPass(selectedSellerPlan);
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 }
    });

    setIsSellerPayModalOpen(false);
    setIsPostModalOpen(true);
  };

  // Image upload with strict mobile validation rule
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageValidationError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (uploadedImages.length + files.length > 6) {
      setImageValidationError('अधिकतम 6 तस्वीरें ही अपलोड की जा सकती हैं (Maximum 6 photos allowed).');
      return;
    }

    setIsValidatingImage(true);

    setTimeout(() => {
      setIsValidatingImage(false);
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = URL.createObjectURL(file);
        newUrls.push(url);
      }
      setUploadedImages(prev => [...prev, ...newUrls].slice(0, 6));
    }, 500);
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Create & Publish Post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadedImages.length === 0) {
      setImageValidationError('कृपया कम से कम 1 वास्तविक मोबाइल फोन की फोटो अपलोड करें।');
      return;
    }

    if (!sellerPhoneInput || sellerPhoneInput.length < 10) {
      alert('कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें।');
      return;
    }

    addP2PListing({
      sellerName: sellerNameInput,
      sellerPhone: sellerPhoneInput,
      brand: selectedBrand,
      modelName: modelNameInput || `${selectedBrand} Smartphone`,
      variant: variantInput,
      price: Number(priceInput) || 15000,
      condition: conditionInput,
      highlights: highlightsInput.split(',').map(s => s.trim()).filter(Boolean),
      description: descriptionInput || `${selectedBrand} ${modelNameInput} सूरत में बिक्री के लिए उपलब्ध है।`,
      images: uploadedImages,
      locality: localityInput,
      planType: selectedSellerPlan,
      isPro: selectedSellerPlan === 'pro_799'
    });

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setIsPostModalOpen(false);
    alert('✓ आपका मोबाइल विज्ञापन सस्ता बाज़ार में लाइव हो चुका है! आपका नंबर प्राइवेसी शील्ड द्वारा सुरक्षित रहेगा।');
  };

  // Buyer Pass Purchase Handling
  const handlePurchaseBuyerPass = () => {
    buyBuyerPass(selectedBuyerPlan);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 }
    });

    const creditsAdded = selectedBuyerPlan === 'basic_99' ? 10 : 50;

    if (pendingUnlockListing) {
      unlockContactWithCredit(pendingUnlockListing.id);
      alert(
        `✓ भुगतान सफल! आपका ${selectedBuyerPlan === 'basic_99' ? '₹99 (10 नंबर)' : '₹299 Pro (50 नंबर)'} बायर पास सक्रिय हो गया है। ${pendingUnlockListing.sellerName} का नंबर अनलॉक कर दिया गया है।`
      );
      setPendingUnlockListing(null);
    } else {
      alert(
        `✓ भुगतान सफल! ${creditsAdded} संपर्क क्रेडिट आपके खाते में जुड़ गए हैं। अब आप किसी भी सेलर से चैट कर सकते हैं और नंबर अनलॉक कर सकते हैं।`
      );
    }

    setIsBuyerPassModalOpen(false);
  };

  // Trigger Phone Unlock (Enforcing: No contact reveal without pass)
  const handleInitiateUnlock = (listing: P2PListing) => {
    if (unlockedContactIds.includes(listing.id)) {
      return;
    }

    if (buyerCredits > 0) {
      const res = unlockContactWithCredit(listing.id);
      if (res.success) {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
    } else {
      // No credit - must buy pass
      setPendingUnlockListing(listing);
      setIsBuyerPassModalOpen(true);
    }
  };

  // Trigger In-App Chat (Enforcing: No chat without payment/pass)
  const handleInitiateChat = (listing: P2PListing) => {
    if (buyerCredits <= 0) {
      // Must take pass before chatting!
      setPendingUnlockListing(listing);
      setIsBuyerPassModalOpen(true);
    } else {
      // Authorized buyer pass holder
      setActiveChatListing(listing);
      setChatSecurityError(null);
      setChatInputText('');
    }
  };

  // Chat message submission with anti-leak security check
  const handleSendCustomMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChatListing) return;

    setChatSecurityError(null);
    const text = chatInputText.trim();
    if (!text) return;

    const check = validateChatSecurity(text);
    if (!check.isValid) {
      setChatSecurityError(check.errorMessage || 'सुरक्षा कारणों से संपर्क जानकारी शेयर करना मना है।');
      return;
    }

    const res = sendChatMessage(activeChatListing.id, text, false);
    if (!res.success) {
      setChatSecurityError(res.error || 'सुरक्षा ब्लॉक लागू हुआ।');
      return;
    }

    setChatInputText('');
  };

  const handleSendPresetMessage = (presetText: string) => {
    if (!activeChatListing) return;
    setChatSecurityError(null);
    sendChatMessage(activeChatListing.id, presetText, true);
    setSelectedPresetId('');
  };

  const handleDropdownSelectPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) return;
    const item = SAFE_CHAT_PRESETS.find(p => p.id === val);
    if (item) {
      handleSendPresetMessage(item.text);
    }
  };

  const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setChatInputText(val);

    if (val.trim()) {
      const liveCheck = validateChatSecurity(val);
      if (!liveCheck.isValid) {
        setChatSecurityError(liveCheck.errorMessage || 'नंबर शेयर करना ब्लॉक है।');
      } else {
        setChatSecurityError(null);
      }
    } else {
      setChatSecurityError(null);
    }
  };

  return (
    <section id="bazaar-section" className="py-8 bg-slate-50 border-b border-slate-200">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Top Header & SastaBazaar Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black">
                <Crown className="w-3.5 h-3.5" />
                <span>सस्ता बाज़ार ⚡ सूरत की अपनी मोबाइल मंडी (0% ब्रोकरेज)</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                अपना फोन, अपनी कीमत • सीधे ग्राहक से डील करें!
              </h2>
              <p className="text-xs sm:text-sm text-blue-200 leading-relaxed">
                बिना किसी बिचौलिये के 6 असली तस्वीरें डालें, अपनी मनचाही कीमत रखें और 100% नंबर प्राइवेसी सुरक्षा के साथ सूरत में बेचें।
              </p>

              {/* Pricing Plans Summary & View-Only Rule Notice */}
              <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
                  <span className="font-bold text-amber-300">सेलर ऐड: ₹99</span>
                  <span className="text-[11px] text-blue-200">(1 पोस्ट - 30 दिन)</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
                  <span className="font-bold text-amber-300">प्रो सेलर: ₹799</span>
                  <span className="text-[11px] text-blue-200">(10 पोस्ट्स)</span>
                </div>
                <div className="flex items-center gap-2 bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-400/30">
                  <span className="font-bold text-emerald-300">बायर पास: ₹99 (10 नंबर/चैट) / ₹299 (50)</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-blue-200 bg-white/5 px-2.5 py-1 rounded-lg">
                  <Eye className="w-3.5 h-3.5 text-amber-300" />
                  <span>देखना बिल्कुल मुफ़्त • पोस्ट या चैट/कॉल के लिए पेमेंट आवश्यक</span>
                </div>
              </div>
            </div>

            {/* Post Ad & Buy Pass CTAs */}
            <div className="shrink-0 flex flex-col gap-2.5">
              <button
                onClick={handleInitiatePostAd}
                className="py-3.5 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2 transition-all hover:scale-105 cursor-pointer"
              >
                <PlusCircle className="w-5 h-5 text-slate-950" />
                <span>+ मोबाइल का विज्ञापन डालें (₹99)</span>
              </button>

              <button
                onClick={() => {
                  setPendingUnlockListing(null);
                  setIsBuyerPassModalOpen(true);
                }}
                className="py-2.5 px-4 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>
                  {buyerCredits > 0
                    ? `बायर पास एक्टिव (${buyerCredits} अनलॉक शेष)`
                    : 'बायर अनलॉक पास खरीदें (₹99)'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* FastSale Offer: Direct Sale to Sastaphone & Get Paid in 2 Hours! */}
        <div className="mb-6 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-slate-950 shadow-xl border border-amber-300/80 relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-slate-950 text-amber-300 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                  <Zap className="w-3.5 h-3.5 fill-amber-300" />
                  <span>FASTSALE स्पेशल ऑफर</span>
                </span>
                <span className="bg-white/90 text-slate-950 text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-2xs">
                  ⚡ 2 घंटे में सूरत में कैश / बैंक ट्रांसफर
                </span>
              </div>

              <h3 className="text-lg sm:text-2xl font-black text-slate-950 tracking-tight leading-snug">
                इंतज़ार नहीं करना? डायरेक्ट Sastaphone को बेचें • 2 घंटे में पैसा पाएं!
              </h3>

              <p className="text-xs sm:text-sm text-slate-900 font-medium leading-relaxed">
                अगर आप बाज़ार में खरीदारों के मैसेज का इंतज़ार या चैट में मोल-भाव नहीं करना चाहते, तो अपना मोबाइल सीधे <strong>Sastaphone</strong> को बेचें। हमारे सर्टिफाइड टेक्नीशियन <strong>2 घंटे में आपके घर आएंगे</strong> और हैंडओवर होते ही <strong>100% पूरा पैसा सीधे आपके बैंक या UPI</strong> में ट्रांसफर होगा!
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-bold text-slate-950">
                <span className="bg-white/60 px-2.5 py-1 rounded-xl shadow-2xs">✓ AI इंस्टेंट गारंटीड कोटेशन</span>
                <span className="bg-white/60 px-2.5 py-1 rounded-xl shadow-2xs">✓ 2 घंटे में होम पिकअप</span>
                <span className="bg-white/60 px-2.5 py-1 rounded-xl shadow-2xs">✓ मौके पर 100% बैंक/UPI पेमेंट</span>
                <span className="bg-white/60 px-2.5 py-1 rounded-xl shadow-2xs">✓ ऑलइंडिया आधिकारिक डेटा वाइप रसीद</span>
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto text-center space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('sell');
                  const el = document.getElementById('sell-flow-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="w-full md:w-auto py-3.5 px-6 rounded-2xl bg-slate-950 hover:bg-slate-900 text-amber-300 hover:text-white font-black text-sm shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                <span>⚡ FastSale: डायरेक्ट Sastaphone को बेचें</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-slate-950 font-black">
                Zero मोल-भाव • 2 घंटे में गारंटीड पेमेंट
              </p>
            </div>
          </div>
        </div>

        {/* Free-Browsing & Paid-Action Rule Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-black text-slate-900">
                  सस्ता बाज़ार नियम (Platform Rules):
                </h4>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  100% वेरिफाइड
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                सूरत के सभी सेकंड-हैंड मोबाइल विज्ञापनों को <strong>देखना बिल्कुल मुफ़्त</strong> है। सेलर से सीधे चैट करने या नंबर देखकर कॉल करने के लिए <strong>बायर पास</strong> और नया ऐड डालने के लिए <strong>सेलर पास</strong> आवश्यक है।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {buyerCredits > 0 ? (
              <span className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{buyerCredits} क्रेडिट उपलब्ध</span>
              </span>
            ) : (
              <button
                onClick={() => {
                  setPendingUnlockListing(null);
                  setIsBuyerPassModalOpen(true);
                }}
                className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>बायर पास लें (₹99 में 10 / ₹299 में 50)</span>
              </button>
            )}
          </div>
        </div>

        {/* Brand Filter Bar */}
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => setSearchBrand('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                searchBrand === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              सभी फोन ({p2pListings.length})
            </button>
            {['Apple', 'Xiaomi', 'Samsung', 'OnePlus', 'Vivo', 'Realme'].map(brand => (
              <button
                key={brand}
                onClick={() => setSearchBrand(brand)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  searchBrand === brand
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>

          <div className="text-xs font-semibold text-slate-500">
            सूरत बाज़ार: <strong className="text-slate-900">{filteredListings.length} मोबाइल लिस्टेड</strong>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filteredListings.map(listing => {
            const isUnlocked = unlockedContactIds.includes(listing.id);
            const listingChats = chatMessages[listing.id] || [];

            return (
              <div
                key={listing.id}
                className="bg-white rounded-3xl border border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Image Carousel / Thumb */}
                  <div className="relative h-52 bg-slate-100 overflow-hidden">
                    <img
                      src={listing.images[0]}
                      alt={listing.modelName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Pro Badge */}
                    {listing.isPro && (
                      <span className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        PRO SELLER
                      </span>
                    )}

                    {/* Photos Count Badge */}
                    <span className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      {listing.images.length} Photos
                    </span>

                    <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-blue-700 font-bold text-[10px] px-2 py-0.5 rounded-md shadow-2xs">
                      📍 {listing.locality}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-black text-slate-900">
                        {formatINR(listing.price)}
                      </span>
                      <span className="text-[11px] text-slate-400">{listing.date}</span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 line-clamp-1">
                      {listing.modelName}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {listing.variant} • {listing.condition}
                    </p>

                    {/* Highlights Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {listing.highlights.slice(0, 2).map((h, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                        >
                          ✓ {h}
                        </span>
                      ))}
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 pt-1">
                      {listing.description}
                    </p>
                  </div>
                </div>

                {/* Seller Contact & Interaction Box */}
                <div className="p-4 pt-0 space-y-2.5">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">सेलर: <strong>{listing.sellerName}</strong></span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                        Surat Verified
                      </span>
                    </div>

                    {/* Number Privacy & Call Action */}
                    <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700">
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        <span>
                          {isUnlocked ? `+91 ${listing.sellerPhone}` : `+91 ${listing.maskedPhone}`}
                        </span>
                      </div>

                      {isUnlocked ? (
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:${listing.sellerPhone}`}
                            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>कॉल</span>
                          </a>
                          <a
                            href={`https://wa.me/91${listing.sellerPhone}?text=नमस्ते! मैंने Sastaphone सूरत बाज़ार में आपका ${listing.modelName} ऐड देखा है।`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>व्हाट्सएप</span>
                          </a>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleInitiateUnlock(listing)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-xs ${
                            buyerCredits > 0
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black ring-2 ring-amber-400/30'
                          }`}
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>
                            {buyerCredits > 0
                              ? `🔓 अनलॉक करें (${buyerCredits} शेष)`
                              : '🔒 Pay to Unlock (₹99)'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Direct Secure In-App Chat Trigger (Gated by Buyer Pass) */}
                  <button
                    onClick={() => handleInitiateChat(listing)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                      buyerCredits > 0
                        ? 'bg-slate-900 hover:bg-slate-800 text-white'
                        : 'bg-slate-800/90 hover:bg-slate-800 text-amber-300 border border-amber-400/30'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>
                      {buyerCredits > 0
                        ? `💬 सेलर से लाइव चैट करें (${buyerCredits} क्रेडिट शेष)`
                        : '🔒 Pay to Chat (₹99 पास आवश्यक)'}
                    </span>
                    {listingChats.length > 0 && buyerCredits > 0 && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mandatory Seller Post Pass Payment Modal (Gated: No post without payment) */}
      {isSellerPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="font-black text-lg text-slate-900">
                💳 सेलर ऐड पोस्टिंग पास (Seller Post Plan)
              </h3>
              <p className="text-xs text-slate-600">
                सस्ता बाज़ार में बिना पेमेंट के कोई भी ऐड पोस्ट नहीं किया जा सकता। कृपया अपना विज्ञापन प्लान चुनें:
              </p>
            </div>

            {/* Plan Choice: Single ₹99 vs Pro ₹799 */}
            <div className="grid grid-cols-2 gap-3 text-left">
              <div
                onClick={() => setSelectedSellerPlan('single_99')}
                role="button"
                tabIndex={0}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedSellerPlan === 'single_99'
                    ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-xs text-slate-900">सिंगल ऐड</span>
                  <span className="text-sm font-black text-blue-600">₹99</span>
                </div>
                <div className="text-base font-black text-slate-900 mb-0.5">
                  1 मोबाइल पोस्ट
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  30 दिन लाइव • 6 फोटो • नंबर प्राइवेसी शील्ड
                </p>
              </div>

              <div
                onClick={() => setSelectedSellerPlan('pro_799')}
                role="button"
                tabIndex={0}
                className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
                  selectedSellerPlan === 'pro_799'
                    ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-400/20'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="absolute -top-2.5 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-2xs">
                  बचत ₹200 (PRO)
                </span>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-xs text-slate-900">प्रो सेलर</span>
                  <span className="text-sm font-black text-amber-600">₹799</span>
                </div>
                <div className="text-base font-black text-slate-900 mb-0.5">
                  10 मोबाइल पोस्ट
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  10 पोस्ट्स कोटा • Pro बैज • टॉप सर्च रैंकिंग
                </p>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-left text-xs text-blue-950 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>100% सुरक्षित भुगतान (AllIndia Network Guarantee):</span>
              </p>
              <p className="text-[11px] text-blue-800">
                पेमेंट होते ही तुरंत फोटो अपलोड और मॉडल विवरण भरने का फॉर्म खुल जाएगा और आपका विज्ञापन सूरत बाज़ार में लाइव हो जाएगा।
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setIsSellerPayModalOpen(false)}
                className="w-1/3 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                कैंसल
              </button>
              <button
                onClick={handlePurchaseSellerPlan}
                className="w-2/3 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-black shadow-lg shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  {selectedSellerPlan === 'single_99'
                    ? '₹99 पे करें व ऐड फॉर्म खोलें'
                    : '₹799 पे करें व 10 ऐड पैक लें'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Buyer Pass Purchase Modal (₹99 for 10 unlocks, ₹299 for 50 unlocks) */}
      {isBuyerPassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
              <KeyRound className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 text-[10px] font-black uppercase tracking-wider">
                🛡️ Security Gatekeeper System
              </span>
              <h3 className="font-black text-lg text-slate-900">
                पे टू अनलॉक (Pay to Unlock Pass)
              </h3>
              <p className="text-xs text-slate-600">
                {pendingUnlockListing
                  ? `सस्ता बाज़ार सुरक्षा गेटकीपर: ${pendingUnlockListing.sellerName} का फोन नंबर और डायरेक्ट चैट लॉक है। संपर्क अनलॉक करने के लिए पास चुनें:`
                  : 'सस्ता बाज़ार सुरक्षा गेटकीपर: सेलर्स के 10-अंकीय फोन नंबर और चैट देखने के लिए पे टू अनलॉक पास आवश्यक है:'}
              </p>
            </div>

            {/* Plan Options Grid */}
            <div className="grid grid-cols-2 gap-3 text-left">
              <div
                onClick={() => setSelectedBuyerPlan('basic_99')}
                role="button"
                tabIndex={0}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedBuyerPlan === 'basic_99'
                    ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-xs text-slate-900">बेसिक अनलॉक</span>
                  <span className="text-sm font-black text-blue-600">₹99</span>
                </div>
                <div className="text-base font-black text-slate-900 mb-0.5">
                  10 फोन नंबर व चैट
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  10 सेलर्स के फोन नंबर अनलॉक व लाइव चैट (₹9.90 / संपर्क)
                </p>
              </div>

              <div
                onClick={() => setSelectedBuyerPlan('pro_299')}
                role="button"
                tabIndex={0}
                className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
                  selectedBuyerPlan === 'pro_299'
                    ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-400/20'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="absolute -top-2.5 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-2xs">
                  बेस्ट वैल्यू (PRO)
                </span>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-xs text-slate-900">प्रो अनलॉक</span>
                  <span className="text-sm font-black text-amber-600">₹299</span>
                </div>
                <div className="text-base font-black text-slate-900 mb-0.5">
                  50 फोन नंबर व चैट
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  50 सेलर्स के फोन नंबर अनलॉक व लाइव चैट (₹5.98 / संपर्क)
                </p>
              </div>
            </div>

            {/* Privacy Shield Info */}
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-left text-xs text-emerald-950 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% भारतीय AllIndia.si सुरक्षित पेमेंट नेटवर्क:</span>
              </p>
              <p className="text-[11px] text-emerald-900">
                पेमेंट होते ही नंबर तुरंत अनमास्क हो जाएगा तथा कॉल और व्हाट्सएप बटन उपलब्ध हो जाएंगे। कोई हिडन चार्ज नहीं।
              </p>
            </div>

            {/* Purchase CTA */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  setIsBuyerPassModalOpen(false);
                  setPendingUnlockListing(null);
                }}
                className="w-1/3 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                कैंसल
              </button>
              <button
                onClick={handlePurchaseBuyerPass}
                className="w-2/3 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-black shadow-lg shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  {selectedBuyerPlan === 'basic_99'
                    ? 'Pay to Unlock ₹99 (10 संपर्क)'
                    : 'Pay to Unlock Pro ₹299 (50 संपर्क)'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Secure In-App Customer Chat Modal with Strict Anti-Bypass Guard */}
      {activeChatListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col h-[90vh] max-h-[720px]">
            {/* Chat Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={activeChatListing.images[0]}
                  alt="phone"
                  className="w-11 h-11 rounded-xl object-cover border border-white/20"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-sm">{activeChatListing.sellerName}</h3>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded">
                      Surat Seller
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium">
                    {activeChatListing.modelName} • {formatINR(activeChatListing.price)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!unlockedContactIds.includes(activeChatListing.id) && (
                  <button
                    onClick={() => handleInitiateUnlock(activeChatListing)}
                    className="py-1.5 px-3 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>
                      {buyerCredits > 0
                        ? `🔓 अनलॉक करें (1 क्रेडिट)`
                        : '🔒 Pay to Unlock (₹99)'}
                    </span>
                  </button>
                )}
                <button
                  onClick={() => setActiveChatListing(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Strict Security Alert Header */}
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-[11px] text-amber-900">
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>सख्त सुरक्षा नियम:</strong> चैट में फ़ोन नंबर या अंक टाइप करना ब्लॉक है। सुरक्षित विकल्पों से बात करें।
                </span>
              </div>
            </div>

            {/* Chat Messages Scrollable Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/70">
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-1">
                <p className="text-[11px] font-bold text-slate-800">
                  🔒 Sastaphone एंटी-बायपास सुरक्षित चैट
                </p>
                <p className="text-[10px] text-slate-500">
                  दिए हुए ड्रॉपडाउन/क्विक विकल्पों का उपयोग करके सेलर से फोन की कंडीशन, बिल व लोकेशन के बारे में तुरंत पूछें।
                </p>
              </div>

              {(chatMessages[activeChatListing.id] || []).map(msg => {
                const isBuyer = msg.sender === 'buyer';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isBuyer ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed shadow-xs ${
                        isBuyer
                          ? 'bg-blue-600 text-white rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <div
                        className={`text-[9px] mt-1 text-right ${
                          isBuyer ? 'text-blue-200' : 'text-slate-400'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Security Error Banner if user tries to type number */}
            {chatSecurityError && (
              <div className="p-3 bg-rose-50 border-t border-rose-300 text-rose-800 text-xs flex items-start gap-2 animate-shake">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">{chatSecurityError}</p>
                  <p className="text-[10px] text-rose-600 mt-0.5">
                    सीधे नंबर देखने के लिए बायर अनलॉक पास का उपयोग करें।
                  </p>
                </div>
              </div>
            )}

            {/* Quick Safe Presets & Input Footer */}
            <div className="p-3 bg-white border-t border-slate-200 space-y-2.5">
              {/* Dropdown Selector for Safe Questions */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between mb-1">
                  <span>सुरक्षित सवाल ड्रॉपडाउन (100% सुरक्षित):</span>
                  <span className="text-[10px] text-blue-600 font-semibold">1-क्लिक भेजें</span>
                </label>
                <select
                  value={selectedPresetId}
                  onChange={handleDropdownSelectPreset}
                  className="w-full p-2 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- सवाल चुनें और सीधे भेजें --</option>
                  {SAFE_CHAT_PRESETS.map(preset => (
                    <option key={preset.id} value={preset.id}>
                      {preset.text}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Tap Question Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                <button
                  type="button"
                  onClick={() => handleSendPresetMessage('क्या यह फोन अभी उपलब्ध (Available) है?')}
                  className="text-[10px] bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 px-2.5 py-1 rounded-full whitespace-nowrap cursor-pointer font-medium"
                >
                  ⚡ क्या फोन उपलब्ध है?
                </button>
                <button
                  type="button"
                  onClick={() => handleSendPresetMessage('क्या ओरिजिनल जीएसटी बिल और बॉक्स साथ में मिलेगा?')}
                  className="text-[10px] bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 px-2.5 py-1 rounded-full whitespace-nowrap cursor-pointer font-medium"
                >
                  ⚡ बिल व बॉक्स है?
                </button>
                <button
                  type="button"
                  onClick={() => handleSendPresetMessage('सूरत में किस इलाके में आकर फोन की जांच कर सकते हैं?')}
                  className="text-[10px] bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 px-2.5 py-1 rounded-full whitespace-nowrap cursor-pointer font-medium"
                >
                  ⚡ सूरत में कहाँ मिले?
                </button>
                <button
                  type="button"
                  onClick={() => handleSendPresetMessage('क्या कैश ऑन हैंड डील में थोड़ी गुंजाइश (डिस्काउंट) हो सकती है?')}
                  className="text-[10px] bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 px-2.5 py-1 rounded-full whitespace-nowrap cursor-pointer font-medium"
                >
                  ⚡ डिस्काउंट संभव है?
                </button>
              </div>

              {/* Custom Text Form */}
              <form onSubmit={handleSendCustomMessage} className="flex gap-2">
                <input
                  type="text"
                  value={chatInputText}
                  onChange={handleChatInputChange}
                  placeholder="अपना सवाल लिखें (नंबर या डिजिट्स टाइप करना मना है)..."
                  className={`flex-1 p-2.5 text-xs rounded-xl border bg-slate-50 focus:bg-white focus:outline-none transition-colors ${
                    chatSecurityError
                      ? 'border-rose-400 bg-rose-50 text-rose-900'
                      : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
                <button
                  type="submit"
                  disabled={Boolean(chatSecurityError) || !chatInputText.trim()}
                  className="p-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Post Mobile Ad Form Modal (Accessible ONLY when sellerPostCredits > 0) */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]">
            <div className="p-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">
                  सस्ता बाज़ार में अपना मोबाइल ऐड पोस्ट करें
                </h3>
                <p className="text-xs text-blue-100">
                  {sellerPostCredits > 0
                    ? `✓ भुगतान सत्यापित: आपके पास ${sellerPostCredits} विज्ञापन क्रेडिट शेष हैं`
                    : 'सीधे सूरत के लोकल खरीदारों से डील करें'}
                </p>
              </div>
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Prepaid Confirmation Badge */}
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-xs">ऐड पोस्टिंग क्रेडिट सक्रिय</span>
                </div>
                <span className="text-[11px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                  {sellerPostCredits} क्रेडिट शेष
                </span>
              </div>

              {/* FastSale Quick Option */}
              <div className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-slate-900 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-[11px]">
                  <Zap className="w-4 h-4 text-orange-600 shrink-0 fill-orange-500" />
                  <span>
                    <strong>FastSale विकल्प:</strong> खरीदार का इंतज़ार किए बिना 2 घंटे में कैश पाएं!
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsPostModalOpen(false);
                    setActiveTab('sell');
                    const el = document.getElementById('sell-flow-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] shrink-0 cursor-pointer shadow-xs"
                >
                  ⚡ FastSale ➔
                </button>
              </div>

              {/* Photos Upload (Up to 6) with Strict AI Phone-Only Validation */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-800">
                    मोबाइल की तस्वीरें (अधिकतम 6 Photos):
                  </label>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {uploadedImages.length}/6 अपलोड की गईं
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-900 flex items-start gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>सख्त AI इमेज नियम:</strong> केवल मोबाइल फोन की असली फोटो (स्क्रीन ऑन, बैक, साइड व बॉक्स) ही अपलोड करें।
                  </p>
                </div>

                {imageValidationError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-[11px] flex items-start gap-2 mb-2 animate-shake">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{imageValidationError}</span>
                  </div>
                )}

                {/* Preview thumbnails */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
                  {uploadedImages.map((img, i) => (
                    <div key={i} className="relative h-16 rounded-xl overflow-hidden border border-slate-300 group">
                      <img src={img} alt="phone-thumb" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center text-[9px] cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {uploadedImages.length < 6 && (
                    <label className="h-16 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 cursor-pointer transition-colors bg-slate-50">
                      <Upload className="w-4 h-4" />
                      <span className="text-[9px] font-bold mt-0.5">+ फोटो</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Brand & Model Name */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ब्रांड चुनें:</label>
                  <select
                    value={selectedBrand}
                    onChange={e => setSelectedBrand(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white"
                  >
                    {BRANDS.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">मॉडल का नाम:</label>
                  <input
                    type="text"
                    required
                    value={modelNameInput}
                    onChange={e => setModelNameInput(e.target.value)}
                    placeholder="उदा. iPhone 15 Pro, Mi 14"
                    className="w-full p-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Price & Variant */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">अपेक्षित कीमत (₹):</label>
                  <input
                    type="number"
                    required
                    value={priceInput}
                    onChange={e => setPriceInput(e.target.value)}
                    placeholder="उदा. 25000"
                    className="w-full p-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">वेरिएंट (RAM/Storage):</label>
                  <input
                    type="text"
                    value={variantInput}
                    onChange={e => setVariantInput(e.target.value)}
                    placeholder="8GB / 128GB"
                    className="w-full p-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Highlights & Locality */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">कंडीशन के मुख्य बिंदु (Highlights):</label>
                <input
                  type="text"
                  value={highlightsInput}
                  onChange={e => setHighlightsInput(e.target.value)}
                  placeholder="बैटरी 95%, बिल व बॉक्स मौजूद, 100% वर्किंग"
                  className="w-full p-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">सूरत इलाका (Locality):</label>
                  <select
                    value={localityInput}
                    onChange={e => setLocalityInput(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 bg-white"
                  >
                    {SURAT_LOCALITIES.map(l => (
                      <option key={l.id} value={`${l.name}, Surat`}>{l.name} ({l.pincode})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">आपका मोबाइल नंबर (सुरक्षित रहेगा):</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={sellerPhoneInput}
                    onChange={e => setSellerPhoneInput(e.target.value)}
                    placeholder="98250 XXXXX"
                    className="w-full p-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              {/* Number Privacy Disclaimer */}
              <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700 text-[11px] flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  प्राइवेसी शील्ड एक्टिव: आपका नंबर पब्लिक नहीं होगा। केवल वेरिफाइड बायर पास धारक ही इसे अनलॉक कर पाएंगे।
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>विज्ञापन तुरंत लाइव करें (1 क्रेडिट उपयोग करें)</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
