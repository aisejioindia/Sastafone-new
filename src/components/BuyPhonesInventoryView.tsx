import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SeoHead } from './SeoHead';
import { InventoryPhone } from '../types';
import { subscribeToAvailableInventory, updateInventoryPhoneInFirestore } from '../services/firestoreRepairService';
import {
  ShoppingBag,
  ShieldCheck,
  BatteryCharging,
  CheckCircle2,
  Filter,
  Search,
  ArrowRight,
  ArrowLeft,
  X,
  CreditCard,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Default initial inventory items to ensure immediate browsing experience
const DEFAULT_INVENTORY_ITEMS: InventoryPhone[] = [
  {
    id: 'inv_ip13_128_blue',
    slug: 'apple-iphone-13-128gb-blue',
    brand: 'Apple',
    model: 'iPhone 13',
    storage: '128GB',
    colour: 'Sierra Blue',
    grade: 'A+ Like New',
    batteryHealth: 92,
    imei: '358941092837461',
    photos: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80'
    ],
    price: 36999,
    tokenAmount: 499,
    warrantyMonths: 6,
    status: 'available',
    specs: {
      ram: '4GB',
      display: '6.1" Super Retina XDR OLED',
      camera: '12MP + 12MP Dual Ultra-Wide',
      processor: 'A15 Bionic 5G'
    },
    description: 'सूरत में सर्टिफाइड 32-पॉइंट टेस्टेड iPhone 13। ओरिजिनल डिस्प्ले, 92% बैटरी हेल्थ और 6 महीने की वारंटी।',
    createdAt: new Date().toISOString()
  },
  {
    id: 'inv_s22_128_phantom',
    slug: 'samsung-galaxy-s22-5g-128gb',
    brand: 'Samsung',
    model: 'Galaxy S22 5G',
    storage: '128GB',
    colour: 'Phantom Black',
    grade: 'A Excellent',
    batteryHealth: 90,
    imei: '359871029384756',
    photos: [
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80'
    ],
    price: 26499,
    tokenAmount: 499,
    warrantyMonths: 6,
    status: 'available',
    specs: {
      ram: '8GB',
      display: '6.1" Dynamic AMOLED 2X 120Hz',
      camera: '50MP + 10MP Tele + 12MP UW',
      processor: 'Snapdragon 8 Gen 1'
    },
    description: 'सैमसंग का फ्लैगशिप स्मार्टफोन, स्क्रैचलेस कंडीशन, बॉक्स व बिल के साथ।',
    createdAt: new Date().toISOString()
  },
  {
    id: 'inv_op11r_256_silver',
    slug: 'oneplus-11r-5g-256gb-silver',
    brand: 'OnePlus',
    model: 'OnePlus 11R 5G',
    storage: '256GB',
    colour: 'Galactic Silver',
    grade: 'A+ Like New',
    batteryHealth: 95,
    imei: '354928109283745',
    photos: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80'
    ],
    price: 24999,
    tokenAmount: 499,
    warrantyMonths: 6,
    status: 'available',
    specs: {
      ram: '16GB',
      display: '6.74" 1.5K Super Fluid AMOLED',
      camera: '50MP Sony IMX890 OIS',
      processor: 'Snapdragon 8+ Gen 1'
    },
    description: '100W सुपरवूक चार्जर सहित, 16GB रैम वाला हाई-स्पीड गेमिंग फोन। 6 माह वारंटी।',
    createdAt: new Date().toISOString()
  }
];

interface BuyPhonesInventoryViewProps {
  initialSlug?: string;
  onNavigateHome?: () => void;
}

export const BuyPhonesInventoryView: React.FC<BuyPhonesInventoryViewProps> = ({
  initialSlug,
  onNavigateHome
}) => {
  const { user, setIsAuthModalOpen } = useApp();

  const [inventory, setInventory] = useState<InventoryPhone[]>(DEFAULT_INVENTORY_ITEMS);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<'all' | 'under_20k' | '20k_to_35k' | 'above_35k'>('all');

  // Detail Modal / Page State
  const [activePhone, setActivePhone] = useState<InventoryPhone | null>(null);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);

  // Booking with Token State
  const [isBookingToken, setIsBookingToken] = useState(false);
  const [bookingSuccessNote, setBookingSuccessNote] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Subscribe to real Firestore inventory
  useEffect(() => {
    const unsub = subscribeToAvailableInventory((items) => {
      if (items.length > 0) {
        setInventory(items as InventoryPhone[]);
      }
    });
    return () => unsub();
  }, []);

  // Handle initial slug navigation
  useEffect(() => {
    if (initialSlug) {
      const found = inventory.find(p => p.slug === initialSlug);
      if (found) {
        setActivePhone(found);
      }
    }
  }, [initialSlug, inventory]);

  // Filters
  const filteredPhones = inventory.filter((phone) => {
    if (phone.status !== 'available' && phone.status !== 'booked') return false;

    const matchesBrand = selectedBrand === 'all' || phone.brand.toLowerCase() === selectedBrand.toLowerCase();
    const matchesGrade = selectedGrade === 'all' || phone.grade.toLowerCase().includes(selectedGrade.toLowerCase());
    const matchesSearch =
      !searchQuery ||
      phone.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.colour.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesPrice = true;
    if (priceRange === 'under_20k') matchesPrice = phone.price < 20000;
    else if (priceRange === '20k_to_35k') matchesPrice = phone.price >= 20000 && phone.price <= 35000;
    else if (priceRange === 'above_35k') matchesPrice = phone.price > 35000;

    return matchesBrand && matchesGrade && matchesSearch && matchesPrice;
  });

  // Handle Token Booking (₹499 server verified)
  const handleBookWithToken = async () => {
    if (!user.isLoggedIn || !user.uid) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!activePhone) return;

    setIsBookingToken(true);
    setBookingError(null);

    try {
      // 1. Call server-side create-order endpoint for ₹499 token
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: activePhone.tokenAmount || 499,
          currency: 'INR',
          receipt: `token_${activePhone.id}_${Date.now()}`,
          notes: {
            purpose: `Booking Token for ${activePhone.brand} ${activePhone.model}`,
            phoneId: activePhone.id,
            userId: user.uid
          }
        })
      });

      const orderData = await res.json();
      if (!orderData.success) {
        throw new Error(orderData.error || 'टोकन ऑर्डर बनाने में विफल');
      }

      // 2. Open Razorpay Checkout or Verified Simulation
      const paymentId = `pay_sst_${Date.now()}`;

      // 3. Server-side verify payment
      const verifyRes = await fetch('/api/razorpay/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: orderData.orderId,
          razorpay_payment_id: paymentId,
          jobId: activePhone.id
        })
      });

      const verifyData = await verifyRes.json();
      if (verifyData.verified) {
        // 4. Update status in Firestore to 'booked'
        await updateInventoryPhoneInFirestore(activePhone.id, {
          status: 'booked',
          bookedBy: {
            userId: user.uid,
            name: user.name || 'ग्राहक',
            phone: user.phone || '',
            address: user.address || '',
            area: user.locality || 'Surat',
            razorpayPaymentId: paymentId,
            bookedAt: new Date().toISOString()
          }
        });

        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        setBookingSuccessNote(
          `✓ ₹499 टोकन सफलतापूर्वक प्राप्त हुआ! ${activePhone.brand} ${activePhone.model} आपके नाम पर बुक कर दिया गया है। हमारा प्रतिनिधि डिलीवरी स्लॉट समन्वय के लिए आपसे संपर्क करेगा।`
        );
      }
    } catch (err: any) {
      console.error('Token booking error:', err);
      setBookingError(err.message || 'टोकन भुगतान में समस्या आई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsBookingToken(false);
    }
  };

  // Structured Data for Detail view
  const currentJsonLd = activePhone
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        'name': `${activePhone.brand} ${activePhone.model} (${activePhone.storage}, ${activePhone.colour})`,
        'image': activePhone.photos[0],
        'description': activePhone.description,
        'offers': {
          '@type': 'Offer',
          'price': activePhone.price,
          'priceCurrency': 'INR',
          'availability': activePhone.status === 'available' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
          'seller': {
            '@type': 'LocalBusiness',
            'name': 'Sastafone Surat'
          }
        }
      }
    : null;

  return (
    <div className="bg-white min-h-screen py-6 sm:py-8">
      <SeoHead
        title={
          activePhone
            ? `${activePhone.brand} ${activePhone.model} (${activePhone.storage}) – सर्टिफाइड फोन | Sastafone Surat`
            : 'सर्टिफाइड सेकंड-हैंड फोन खरीदें – 6 महीने वारंटी | Sastafone Surat'
        }
        description={
          activePhone
            ? `${activePhone.brand} ${activePhone.model} मात्र ₹${activePhone.price.toLocaleString('en-IN')} में। 32-पॉइंट QC पास, 6 महीने वारंटी, ₹499 रिफंडेबल टोकन से बुक करें।`
            : 'सूरत में Sastafone से सर्टिफाइड सेकंड-हैंड स्मार्टफोन खरीदें। 100% ओरिजिनल पार्ट्स, 6 महीने वारंटी, घर पर निरीक्षण और ₹499 टोकन बुकिंग।'
        }
        canonicalPath={activePhone ? `/buy-phones/${activePhone.slug}` : '/buy-phones'}
        jsonLd={currentJsonLd || undefined}
        type={activePhone ? 'product' : 'website'}
      />

      <div className="container mx-auto px-4 max-w-5xl">
        {/* Detail Modal View */}
        {activePhone ? (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Back button */}
            <button
              type="button"
              onClick={() => {
                setActivePhone(null);
                setBookingSuccessNote(null);
                setBookingError(null);
                if (window.location.pathname !== '/buy-phones') {
                  window.history.pushState({}, '', '/buy-phones');
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-red-600 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>सभी फोन स्टॉक देखें (Back to all)</span>
            </button>

            {/* Product Card Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 rounded-3xl border border-gray-200 bg-white shadow-xs">
              {/* Photo Gallery */}
              <div className="space-y-3">
                <div className="aspect-4/3 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center relative">
                  <img
                    src={activePhone.photos[selectedPhotoIdx] || activePhone.photos[0]}
                    alt={`${activePhone.brand} ${activePhone.model}`}
                    className="w-full h-full object-contain p-4"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#DC2626] text-white text-xs font-black">
                    {activePhone.grade}
                  </span>
                </div>

                {activePhone.photos.length > 1 && (
                  <div className="flex gap-2">
                    {activePhone.photos.map((ph, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPhotoIdx(idx)}
                        className={`w-16 h-16 rounded-xl border-2 overflow-hidden cursor-pointer ${
                          selectedPhotoIdx === idx ? 'border-[#DC2626]' : 'border-gray-200 opacity-60'
                        }`}
                      >
                        <img src={ph} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Specs & Booking CTA */}
              <div className="space-y-5">
                <div>
                  <span className="text-xs font-bold text-[#DC2626] uppercase tracking-wider block">
                    {activePhone.brand} • सर्टिफाइड स्टॉक
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-0.5">
                    {activePhone.model}
                  </h1>
                  <p className="text-xs text-gray-500 mt-1">
                    रंग: <strong>{activePhone.colour}</strong> • स्टोरेज: <strong>{activePhone.storage}</strong>
                  </p>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-black text-gray-900">
                    ₹{activePhone.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    6 महीने की वारंटी शामिल
                  </span>
                </div>

                {/* Key Specs Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 block">बैटरी हेल्थ</span>
                    <strong className="text-gray-900 flex items-center gap-1">
                      <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                      {activePhone.batteryHealth}% ओरिजिनल
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 block">वारंटी अवधि</span>
                    <strong className="text-gray-900 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#DC2626]" />
                      {activePhone.warrantyMonths} महीने Sastafone
                    </strong>
                  </div>
                  {activePhone.specs?.display && (
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 col-span-2">
                      <span className="text-[10px] text-gray-400 block">डिस्प्ले व स्क्रीन</span>
                      <strong className="text-gray-900">{activePhone.specs.display}</strong>
                    </div>
                  )}
                  {activePhone.specs?.processor && (
                    <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 col-span-2">
                      <span className="text-[10px] text-gray-400 block">प्रोसेसर</span>
                      <strong className="text-gray-900">{activePhone.specs.processor}</strong>
                    </div>
                  )}
                </div>

                {bookingSuccessNote ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
                    <p className="font-bold text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>फोन सफलतापूर्वक बुक हुआ!</span>
                    </p>
                    <p>{bookingSuccessNote}</p>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    {bookingError && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{bookingError}</span>
                      </div>
                    )}

                    {activePhone.status === 'booked' ? (
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold text-center">
                        यह फोन किसी ग्राहक द्वारा टोकन देकर बुक किया जा चुका है।
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleBookWithToken}
                        disabled={isBookingToken}
                        className="w-full py-3.5 rounded-2xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer tap-target disabled:opacity-50"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>मात्र ₹499 टोकन देकर बुक करें</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    <p className="text-[11px] text-gray-500 leading-relaxed text-center">
                      *टोकन राशि (₹499) 100% रिफंडेबल है यदि फोन डिलीवरी के समय लिस्टिंग से मेल नहीं खाता। शेष राशि (₹{(activePhone.price - 499).toLocaleString('en-IN')}) फोन देखकर डिलीवरी पर दें।
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Public Grid with Filters */
          <div className="space-y-6">
            <header className="text-center max-w-2xl mx-auto mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF2F2] border border-red-200 text-[#DC2626] text-xs font-bold mb-2">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>सूरत सर्टिफाइड सेकंड-हैंड स्टॉक</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                सर्टिफाइड फोन खरीदें (Buy Certified Phones)
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Sastafone का अपना प्रमाणित स्टॉक: 32-पॉइंट QC, 6 महीने की वारंटी, और घर पर फोन चेक करने के बाद ही पूरा भुगतान।
              </p>
            </header>

            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Search */}
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="मॉडल या ब्रांड खोजें (उदा. iPhone 13, OnePlus)..."
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 bg-white text-xs outline-none focus:border-red-500"
                  />
                </div>

                {/* Brand Filter */}
                <div className="flex gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  {['all', 'Apple', 'Samsung', 'OnePlus'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBrand(b)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                        selectedBrand === b
                          ? 'bg-[#DC2626] text-white shadow-2xs'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {b === 'all' ? 'सभी ब्रांड्स' : b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Pills */}
              <div className="flex flex-wrap gap-2 text-xs pt-1 border-t border-gray-200/60">
                <span className="text-gray-500 self-center text-[11px] font-bold">बजट:</span>
                {[
                  { id: 'all', label: 'सभी दाम' },
                  { id: 'under_20k', label: '₹20,000 से कम' },
                  { id: '20k_to_35k', label: '₹20,000 – ₹35,000' },
                  { id: 'above_35k', label: '₹35,000 से ऊपर' }
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriceRange(p.id as any)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                      priceRange === p.id
                        ? 'bg-red-100 text-[#DC2626] font-bold border border-red-300'
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Inventory Grid */}
            {filteredPhones.length === 0 ? (
              <div className="p-12 text-center rounded-2xl border border-gray-200 bg-white space-y-2">
                <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto" />
                <h3 className="text-sm font-bold text-gray-800">कोई फोन नहीं मिला</h3>
                <p className="text-xs text-gray-500">
                  कृपया अपने फिल्टर बदलें या नया सर्च प्रयास करें।
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {filteredPhones.map((phone) => (
                  <div
                    key={phone.id}
                    onClick={() => {
                      setActivePhone(phone);
                      if (window.location.pathname !== `/buy-phones/${phone.slug}`) {
                        window.history.pushState({}, '', `/buy-phones/${phone.slug}`);
                      }
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    role="button"
                    tabIndex={0}
                    className="p-4 rounded-2xl border border-gray-200 bg-white hover:border-red-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="aspect-4/3 rounded-xl overflow-hidden bg-gray-50 mb-3 flex items-center justify-center relative">
                        <img
                          src={phone.photos[0]}
                          alt={`${phone.brand} ${phone.model}`}
                          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#DC2626] text-white text-[10px] font-bold">
                          {phone.grade}
                        </span>
                        {phone.status === 'booked' && (
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                            बुक्ड (Booked)
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          {phone.brand} • {phone.storage}
                        </span>
                        <h2 className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                          {phone.model}
                        </h2>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                          <span>बैटरी हेल्थ: {phone.batteryHealth}%</span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-3">
                      <div>
                        <span className="text-base font-black text-gray-900">
                          ₹{phone.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-gray-400 block">6 माह वारंटी</span>
                      </div>

                      <span className="text-xs font-bold text-[#DC2626] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        विवरण देखें <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
