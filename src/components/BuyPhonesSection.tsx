import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DIWALI_DHAMAKA_PHONES, BRANDS, SASTAPHONE_PHONE, WHATSAPP_NUMBER } from '../data/mockData';
import { RefurbishedPhone, P2PListing } from '../types';
import { formatINR, generateWhatsAppLink } from '../utils/valuation';
import {
  ShieldCheck,
  BatteryCharging,
  Truck,
  CheckCircle2,
  ShoppingBag,
  Sparkles,
  PhoneCall,
  MessageCircle,
  Tag,
  PlusCircle,
  Eye,
  Filter,
  Check,
  Search,
  Lock,
  ChevronRight,
  X
} from 'lucide-react';

export const BuyPhonesSection: React.FC = () => {
  const {
    language,
    selectedLocality,
    p2pListings,
    user,
    requireAuth,
    setIsAuthModalOpen,
    setActiveTab
  } = useApp();

  // Active Sub-Tab: 'bazaar' (User P2P Ads) vs 'certified' (Super Deals)
  const [activeMarketView, setActiveMarketView] = useState<'bazaar' | 'certified'>('bazaar');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected phone modal for detail viewing (NO FORM, direct call & chat!)
  const [viewingPhone, setViewingPhone] = useState<RefurbishedPhone | null>(null);
  const [viewingP2P, setViewingP2P] = useState<P2PListing | null>(null);

  // Filtered P2P Listings
  const filteredP2PListings = p2pListings.filter(l => {
    const matchesBrand = selectedBrand === 'all' || l.brand.toLowerCase().includes(selectedBrand.toLowerCase());
    const matchesSearch = !searchQuery || l.modelName.toLowerCase().includes(searchQuery.toLowerCase()) || l.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  // Filtered Certified Phones
  const filteredCertifiedPhones = DIWALI_DHAMAKA_PHONES.filter(p => {
    const matchesBrand = selectedBrand === 'all' || p.brand.toLowerCase().includes(selectedBrand.toLowerCase());
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  // Handle Post Ad in Sasta Bazar
  const handlePostAdClick = () => {
    if (!user.isLoggedIn) {
      requireAuth('सस्ता बाज़ार में अपना फ़ोन लिस्ट करने के लिए कृपया पहले लॉगिन करें।', () => {
        setActiveTab('bazaar');
      });
      return;
    }
    setActiveTab('bazaar');
    // Scroll or trigger post ad
    const el = document.getElementById('bazaar-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="buy-section" className="py-8 bg-slate-50 border-b border-slate-200">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Marketplace Header */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black mb-2">
                <Tag className="w-3.5 h-3.5 text-amber-600" />
                <span>सूरत सस्ता बाज़ार व सर्टिफाइड मोबाइल मार्ट (No Form • Direct Deals)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                सस्ता बाज़ार व सर्टिफाइड फोन डील्स
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                बिना किसी फॉर्म के डायरेक्ट फोन खरीदें: सत्यापित यूज़र लिस्टिंग और 6 महीने वारंटी वाले सस्ताफोन सर्टिफाइड फोन।
              </p>
            </div>

            {/* Post Ad Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePostAdClick}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-black shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ ₹99 में अपना फ़ोन लिस्ट करें</span>
              </button>
            </div>
          </div>

          {/* Unified View Switcher Tabs */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveMarketView('bazaar')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  activeMarketView === 'bazaar'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>🏷️ सस्ता बाज़ार (यूज़र लिस्टिंग - {filteredP2PListings.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMarketView('certified')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                  activeMarketView === 'certified'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>⭐ सस्ताफोन सुपर डील्स (सर्टिफाइड - {filteredCertifiedPhones.length})</span>
              </button>
            </div>

            {/* Brand Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
              <button
                type="button"
                onClick={() => setSelectedBrand('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedBrand === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                सभी ब्रांड्स
              </button>
              {BRANDS.slice(0, 7).map(b => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBrand(b.name)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    selectedBrand.toLowerCase() === b.name.toLowerCase()
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* TAB 1: SASTA BAZAAR USER LISTINGS */}
        {activeMarketView === 'bazaar' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <span>सूरत निवासियों द्वारा लिस्ट किए गए फोन (Direct Verified Ads)</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                0% ब्रोकरेज • सीधा सेलर से बात करें
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredP2PListings.map(listing => (
                <div
                  key={listing.id}
                  className="bg-white rounded-3xl p-4 border border-slate-200 hover:border-amber-400 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top tags */}
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black uppercase">
                        {listing.brand}
                      </span>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        📍 {listing.locality}
                      </span>
                    </div>

                    {/* Image */}
                    <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100 mb-3">
                      <img
                        src={listing.images[0] || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80'}
                        alt={listing.modelName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold">
                        {listing.condition}
                      </div>
                    </div>

                    {/* Title & Price */}
                    <h4 className="text-sm font-black text-slate-900 leading-snug">
                      {listing.modelName}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">{listing.variant}</p>

                    <div className="mt-2.5 flex items-baseline gap-2">
                      <span className="text-lg font-black text-slate-950">
                        {formatINR(listing.price)}
                      </span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                        वेरिफाइड लिस्टिंग
                      </span>
                    </div>

                    {/* Highlights */}
                    <p className="text-[11px] text-slate-600 mt-2 bg-slate-50 p-2 rounded-xl line-clamp-2">
                      {listing.highlights?.join(' • ') || listing.description}
                    </p>
                  </div>

                  {/* Direct Contact Actions (NO FORM!) */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                    <a
                      href={`tel:${listing.sellerPhone || SASTAPHONE_PHONE}`}
                      className="py-2 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
                      <span>डायरेक्ट कॉल</span>
                    </a>

                    <a
                      href={generateWhatsAppLink(
                        `नमस्ते! मैं सस्ता बाज़ार पर आपका फोन "${listing.modelName}" (₹${listing.price}) देखना चाहता हूँ। क्या यह अभी उपलब्ध है?`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: CERTIFIED REFURBISHED DEALS */}
        {activeMarketView === 'certified' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <span>सस्ताफोन अधिकृत 6-माह वारंटी सर्टिफाइड फोन (Diwali Dhamaka)</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                32-पॉइंट QC पास • 7-दिन रिप्लेसमेंट
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
              {filteredCertifiedPhones.map(phone => (
                <div
                  key={phone.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-red-500 hover:shadow-lg transition-all flex flex-col justify-between p-3 relative group"
                >
                  <div className="absolute top-2 left-2 z-10">
                    <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                      {phone.discountPct}% OFF
                    </span>
                  </div>

                  <div>
                    <div className="h-32 w-full rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden mb-2">
                      <img
                        src={phone.imageUrl}
                        alt={phone.name}
                        className="h-full object-contain p-2 group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 truncate">{phone.name}</h4>
                    <p className="text-[10px] text-slate-500">{phone.variant} • {phone.color}</p>

                    <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-bold text-emerald-700">
                      <BatteryCharging className="w-3 h-3" />
                      <span>बैटरी: {phone.batteryHealth}%</span>
                    </div>

                    <div className="mt-2">
                      <span className="text-xs line-through text-slate-400 block">
                        {formatINR(phone.originalPrice)}
                      </span>
                      <span className="text-sm font-black text-slate-900">
                        {formatINR(phone.offerPrice)}
                      </span>
                    </div>

                    <div className="text-[9px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded mt-1.5 font-bold">
                      🛡️ {phone.warrantyMonths} महीने वारंटी
                    </div>
                  </div>

                  {/* Direct Buy Action (NO FORM!) */}
                  <div className="mt-3 pt-2 border-t border-slate-100 flex gap-1.5">
                    <a
                      href={`tel:${SASTAPHONE_PHONE}`}
                      className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold text-center flex items-center justify-center gap-1"
                    >
                      <PhoneCall className="w-3 h-3 text-amber-400" />
                      <span>कॉल करें</span>
                    </a>

                    <a
                      href={generateWhatsAppLink(
                        `नमस्ते सस्ताफोन टीम! मुझे सर्टिफाइड "${phone.name} (${phone.variant})" (ऑफर: ₹${phone.offerPrice}) खरीदना है। क्या यह सूरत में उपलब्ध है?`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold text-center flex items-center justify-center"
                      title="WhatsApp पर बात करें"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
