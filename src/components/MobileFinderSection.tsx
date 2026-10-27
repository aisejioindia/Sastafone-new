/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 91mobiles-inspired Comprehensive Mobile Finder Component
 * Recreates the exact layout from ytyh.PNG and brand cards from dgrt.PNG:
 * - Search bar for all products & brands
 * - Left sidebar with OS (Android / iOS) and Popular Features filters
 * - Price Range Slider (₹0 - ₹1,20,000+) & Orange 'Find Mobiles' button
 * - Best of Mobiles tabs (Best Mobiles, Camera, Gaming, Selfie)
 * - Color-coded budget chips (Under ₹10k, ₹15k, ₹20k, ₹25k, ₹30k, ₹50k)
 * - Mobiles By Popular Brands (all 24 brands from dgrt.PNG)
 * - Mobiles By Popular Features (5G, 8GB+ RAM, 256GB+, AMOLED, 120Hz, AI)
 * - Most Popular Mobiles with 91mobiles Spec Score badges (80% - 98%)
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BRANDS, DIWALI_DHAMAKA_PHONES, PHONE_MODELS } from '../data/mockData';
import { PhoneModel } from '../types';
import { formatINR, generateWhatsAppLink } from '../utils/valuation';
import { BrandLogo } from './BrandLogo';
import {
  SlidersHorizontal,
  Search,
  Sparkles,
  Camera,
  Gamepad2,
  BatteryCharging,
  Cpu,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  ShoppingBag,
  Wrench,
  Zap,
  ArrowRight,
  HardDrive,
  Layers,
  ChevronRight,
  X,
  ExternalLink,
  RotateCcw
} from 'lucide-react';

type BestCategory = 'all' | 'camera' | 'gaming' | 'selfie';
type OsFilter = 'all' | 'android' | 'ios';

export const MobileFinderSection: React.FC = () => {
  const { language, selectedLocality, setActiveTab, updateSellSelection } = useApp();

  // Search input state
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Price range slider state (matches ytyh.PNG: ₹0 to ₹120,000+)
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(120000);
  const [sliderValue, setSliderValue] = useState<number>(120000);

  // Active filters
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<BestCategory>('all');
  const [selectedOs, setSelectedOs] = useState<OsFilter>('all');
  const [selectedBudgetChip, setSelectedBudgetChip] = useState<number | null>(null);

  // Popular feature toggles
  const [activeFeature, setActiveFeature] = useState<string>('all');

  // Build unified catalog of phones combining refurbished deals and catalog models
  const unifiedPhoneCatalog = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      brandId: string;
      brandName: string;
      price: number;
      originalPrice?: number;
      imageUrl: string;
      specScore: number;
      processor: string;
      display: string;
      camera: string;
      battery: string;
      is5G: boolean;
      isAi: boolean;
      category: 'flagship' | 'midrange' | 'budget';
      isRefurbishedDeal?: boolean;
      batteryHealth?: number;
    }> = [];

    // Add refurbished phones
    DIWALI_DHAMAKA_PHONES.forEach(p => {
      const brand = BRANDS.find(b => b.name.toLowerCase().includes(p.brand.toLowerCase())) || BRANDS[0];
      list.push({
        id: p.id,
        name: p.name,
        brandId: brand.id,
        brandName: p.brand,
        price: p.offerPrice,
        originalPrice: p.originalPrice,
        imageUrl: p.imageUrl,
        specScore: p.offerPrice > 35000 ? 94 : p.offerPrice > 20000 ? 88 : 82,
        processor: p.keySpecs[0] || 'High Performance Processor',
        display: p.keySpecs[2] || 'Super AMOLED 120Hz Display',
        camera: p.keySpecs[1] || '50MP OIS Camera',
        battery: `${p.batteryHealth}% Battery Health Certified`,
        is5G: p.name.includes('5G') || ['Apple', 'OnePlus', 'Nothing'].includes(p.brand),
        isAi: p.name.includes('14') || p.name.includes('S22') || p.name.includes('AI'),
        category: p.offerPrice > 40000 ? 'flagship' : p.offerPrice > 18000 ? 'midrange' : 'budget',
        isRefurbishedDeal: true,
        batteryHealth: p.batteryHealth
      });
    });

    // Add phone models from 91mobiles comprehensive catalog
    PHONE_MODELS.forEach(m => {
      // Don't duplicate if already in refurbished
      if (list.some(p => p.name.toLowerCase().includes(m.name.toLowerCase().slice(0, 10)))) {
        return;
      }

      const brand = BRANDS.find(b => b.id === m.brandId) || { id: m.brandId, name: m.brandId };
      list.push({
        id: m.id,
        name: m.name,
        brandId: m.brandId,
        brandName: brand.name,
        price: m.baseValuation,
        imageUrl: m.imageUrl,
        specScore: m.specScore || (m.category === 'flagship' ? 95 : m.category === 'midrange' ? 86 : 79),
        processor: m.processor || 'Fast Octa-core Gaming Processor',
        display: m.display || 'FHD+ 120Hz Smooth AMOLED Display',
        camera: m.camera || '50MP High-Resolution Camera',
        battery: m.battery || '5000 mAh Fast Charging Battery',
        is5G: m.is5G ?? (m.name.includes('5G') || m.category !== 'budget'),
        isAi: m.isAi ?? (m.category === 'flagship'),
        category: m.category,
        isRefurbishedDeal: false
      });
    });

    return list;
  }, []);

  // Filtered phone list
  const filteredPhones = useMemo(() => {
    return unifiedPhoneCatalog.filter(phone => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = phone.name.toLowerCase().includes(q);
        const matchesBrand = phone.brandName.toLowerCase().includes(q);
        const matchesProcessor = phone.processor.toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesProcessor) return false;
      }

      // Price filter
      const effectiveMax = selectedBudgetChip !== null ? selectedBudgetChip : sliderValue;
      if (phone.price > effectiveMax) return false;
      if (phone.price < minPrice) return false;

      // Brand filter
      if (selectedBrand !== 'all' && phone.brandId.toLowerCase() !== selectedBrand.toLowerCase()) {
        return false;
      }

      // OS filter
      if (selectedOs === 'ios' && phone.brandId !== 'apple') return false;
      if (selectedOs === 'android' && phone.brandId === 'apple') return false;

      // Best category filter
      if (selectedCategory === 'camera') {
        const isCameraKing = phone.name.includes('Pro') || phone.camera.includes('50MP') || phone.camera.includes('200MP') || phone.camera.includes('1-inch') || phone.camera.includes('OIS');
        if (!isCameraKing) return false;
      }
      if (selectedCategory === 'gaming') {
        const isGamingKing = phone.processor.includes('Gen') || phone.processor.includes('Dimensity') || phone.specScore >= 88 || phone.name.includes('GT') || phone.name.includes('POCO');
        if (!isGamingKing) return false;
      }
      if (selectedCategory === 'selfie') {
        const isSelfieKing = phone.camera.includes('Selfie') || phone.camera.includes('32MP') || phone.camera.includes('50MP AF') || phone.name.includes('Civi') || phone.name.includes('Vivo');
        if (!isSelfieKing) return false;
      }

      // Popular feature filters
      if (activeFeature === '5g' && !phone.is5G) return false;
      if (activeFeature === 'ram' && !phone.processor.includes('Gen') && phone.price < 15000) return false;
      if (activeFeature === 'storage' && phone.price < 18000) return false;
      if (activeFeature === 'amoled' && !phone.display.toLowerCase().includes('amoled') && !phone.display.toLowerCase().includes('oled')) return false;
      if (activeFeature === '120hz' && !phone.display.includes('120Hz') && !phone.display.includes('144Hz') && !phone.display.includes('165Hz')) return false;
      if (activeFeature === 'ai' && !phone.isAi) return false;

      return true;
    });
  }, [
    unifiedPhoneCatalog,
    searchQuery,
    sliderValue,
    selectedBudgetChip,
    minPrice,
    selectedBrand,
    selectedOs,
    selectedCategory,
    activeFeature
  ]);

  const handleApplyBudgetChip = (amount: number) => {
    if (selectedBudgetChip === amount) {
      setSelectedBudgetChip(null);
      setSliderValue(120000);
    } else {
      setSelectedBudgetChip(amount);
      setSliderValue(amount);
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setMinPrice(0);
    setMaxPrice(120000);
    setSliderValue(120000);
    setSelectedBrand('all');
    setSelectedCategory('all');
    setSelectedOs('all');
    setSelectedBudgetChip(null);
    setActiveFeature('all');
  };

  return (
    <section id="mobile-finder" className="py-8 bg-slate-50 border-b border-slate-200">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Top 91mobiles Style Header Bar */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF6600] to-orange-500 text-white flex items-center justify-center font-black text-sm shadow-md shadow-orange-500/20 shrink-0">
              91
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 text-base sm:text-lg">
                  91mobiles x Sastaphone <span className="text-[#FF6600]">Mobile Finder</span>
                </span>
                <span className="text-[10px] font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                  LIVE SPECS
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                सूरत के लिए प्रमाणित कीमतें, 91-स्पेक स्कोर और सभी 24 ब्रांड्स का पूरा डेटा
              </p>
            </div>
          </div>

          {/* Quick Search Bar */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for products or brands (उदा. S24 Ultra, iPhone 16, Vivo V40)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white text-xs font-medium focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-slate-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 2-Column Responsive Layout: Left Sidebar + Right Content Area (Exactly as in ytyh.PNG) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ======================================================== */}
          {/* LEFT SIDEBAR: Operating System & Popular Feature Filters */}
          {/* ======================================================== */}
          <div className="lg:col-span-3 space-y-4">
            {/* 1. Operating System Block */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Operating System</span>
                <span className="text-[10px] text-slate-400 font-normal">OS</span>
              </h3>
              <div className="space-y-1.5 text-xs">
                <button
                  onClick={() => setSelectedOs('all')}
                  className={`w-full p-2.5 rounded-xl text-left font-bold transition-all flex items-center justify-between cursor-pointer ${
                    selectedOs === 'all'
                      ? 'bg-orange-50 text-orange-700 border border-orange-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>All Operating Systems</span>
                  <span className="text-[11px] text-slate-400">{unifiedPhoneCatalog.length}</span>
                </button>

                <button
                  onClick={() => setSelectedOs('android')}
                  className={`w-full p-2.5 rounded-xl text-left font-bold transition-all flex items-center justify-between cursor-pointer ${
                    selectedOs === 'android'
                      ? 'bg-orange-50 text-orange-700 border border-orange-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>Android Mobiles</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => setSelectedOs('ios')}
                  className={`w-full p-2.5 rounded-xl text-left font-bold transition-all flex items-center justify-between cursor-pointer ${
                    selectedOs === 'ios'
                      ? 'bg-orange-50 text-orange-700 border border-orange-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>iOS (Apple) Mobiles</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* 2. Popular Features Sidebar Block */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Popular Features</span>
                <span className="text-[10px] text-slate-400 font-normal">Filters</span>
              </h3>

              <div className="space-y-1 text-xs">
                {[
                  { id: 'ai', label: 'AI Smartphones', icon: '🤖' },
                  { id: '5g', label: '5G Mobiles', icon: '📶' },
                  { id: 'camera', label: 'Best Camera Phones', icon: '📸' },
                  { id: 'gaming', label: 'Best Gaming Phones', icon: '🎮' },
                  { id: 'amoled', label: 'AMOLED Display', icon: '📺' },
                  { id: '120hz', label: '120Hz Refresh Rate', icon: '⚡' },
                  { id: 'ram', label: '8GB & Above RAM', icon: '🧠' },
                  { id: 'storage', label: '256GB & Above Storage', icon: '💾' }
                ].map(item => {
                  const isSelected = activeFeature === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveFeature(isSelected ? 'all' : item.id)}
                      className={`w-full p-2.5 rounded-xl text-left font-semibold transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-orange-500 text-white font-bold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Surat Assurance Box */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 text-xs text-blue-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>सूरत हब 100% वारंटी</span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                फाइंडर में मिलने वाले सभी डिवाइस 32-पॉइंट टेस्टेड हैं। 6 महीने की रिप्लेसमेंट वारंटी और आपके घर पर डिलीवरी उपलब्ध है।
              </p>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT MAIN AREA: Mobile Finder, Brands, Features & Results */}
          {/* ======================================================== */}
          <div className="lg:col-span-9 space-y-6">
            {/* 1. Mobile Finder Card with Range Slider & Orange Action Button */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm">
              <div className="border-l-4 border-[#FF6600] pl-3 mb-4">
                <h3 className="font-black text-slate-900 text-base sm:text-lg">
                  Mobile Finder
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  बजट चुनें और तुरंत अपनी पसंद के मोबाइल फ़िल्टर करें
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                {/* Price Display Boxes */}
                <div className="md:col-span-4 flex items-center gap-2">
                  <div className="flex-1 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-center">
                    <span className="text-[10px] text-slate-400 block font-bold">Min</span>
                    <span className="text-sm font-black text-slate-900">₹0</span>
                  </div>
                  <span className="text-xs text-slate-400 font-bold">to</span>
                  <div className="flex-1 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-center">
                    <span className="text-[10px] text-slate-400 block font-bold">Max</span>
                    <span className="text-sm font-black text-blue-700">
                      {formatINR(sliderValue)}
                    </span>
                  </div>
                </div>

                {/* Green Slider Bar */}
                <div className="md:col-span-5 space-y-1.5">
                  <input
                    type="range"
                    min={7000}
                    max={120000}
                    step={2000}
                    value={sliderValue}
                    onChange={e => {
                      setSelectedBudgetChip(null);
                      setSliderValue(Number(e.target.value));
                    }}
                    className="w-full h-2 bg-emerald-500/30 rounded-lg appearance-none cursor-pointer accent-[#FF6600]"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1">
                    <span>₹0</span>
                    <span>₹30,000</span>
                    <span>₹70,000</span>
                    <span>₹1,20,000+</span>
                  </div>
                </div>

                {/* Orange Find Mobiles Button (as in ytyh.PNG) */}
                <div className="md:col-span-3">
                  <button
                    onClick={() => {
                      const el = document.getElementById('finder-results');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-[#FF6600] hover:bg-orange-600 text-white font-black text-sm shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Find Mobiles</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Best of Mobiles (Categories & Budget Chips) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="border-l-4 border-[#FF6600] pl-3">
                <h3 className="font-black text-slate-900 text-sm sm:text-base">
                  Best of Mobiles
                </h3>
              </div>

              {/* 4 Category Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'all', label: 'Best Mobiles', icon: <Smartphone className="w-4 h-4 text-blue-600" /> },
                  { id: 'camera', label: 'Best Camera Phones', icon: <Camera className="w-4 h-4 text-rose-500" /> },
                  { id: 'gaming', label: 'Best Gaming Phones', icon: <Gamepad2 className="w-4 h-4 text-purple-600" /> },
                  { id: 'selfie', label: 'Best Selfie Phones', icon: <Sparkles className="w-4 h-4 text-amber-500" /> }
                ].map(cat => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id as BestCategory)}
                      className={`p-3 rounded-2xl border text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm font-bold'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200 font-semibold'
                      }`}
                    >
                      {cat.icon}
                      <span className="text-xs truncate">{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Pastel Colored Budget Blocks (Matching ytyh.PNG Exactly!) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {[
                  { label: 'Best Phones Under ₹10,000', amount: 10000, bg: 'bg-[#EAFBF1] text-[#0A6C35] border-[#B7F0CD]' },
                  { label: 'Best Phones Under ₹15,000', amount: 15000, bg: 'bg-[#EBF3FE] text-[#1E40AF] border-[#BFDBFE]' },
                  { label: 'Best Phones Under ₹20,000', amount: 20000, bg: 'bg-[#F2FBF7] text-[#047857] border-[#A7F3D0]' },
                  { label: 'Best Phones Under ₹25,000', amount: 25000, bg: 'bg-[#FDF2F4] text-[#BE123C] border-[#FECDD3]' },
                  { label: 'Best Phones Under ₹30,000', amount: 30000, bg: 'bg-[#FEF7EC] text-[#B45309] border-[#FDE68A]' }
                ].map(chip => {
                  const isSelected = selectedBudgetChip === chip.amount;
                  return (
                    <button
                      key={chip.amount}
                      onClick={() => handleApplyBudgetChip(chip.amount)}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        chip.bg
                      } ${isSelected ? 'ring-2 ring-slate-900 scale-102 font-black' : 'hover:scale-102 font-bold'}`}
                    >
                      <span className="text-[11px] leading-tight">{chip.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Mobiles By Popular Brands (Exact Squircle Cards from dgrt.PNG) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-l-4 border-[#FF6600] pl-3">
                <h3 className="font-black text-slate-900 text-sm sm:text-base">
                  Mobiles By Popular Brands
                </h3>
                {selectedBrand !== 'all' && (
                  <button
                    onClick={() => setSelectedBrand('all')}
                    className="text-xs font-bold text-orange-600 hover:underline cursor-pointer"
                  >
                    View All Brands (सभी देखें)
                  </button>
                )}
              </div>

              {/* Clean White Squircle Brand Cards (from dgrt.PNG) */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
                {BRANDS.map(brand => {
                  const isSelected = selectedBrand.toLowerCase() === brand.id.toLowerCase();
                  return (
                    <button
                      key={brand.id}
                      onClick={() => setSelectedBrand(isSelected ? 'all' : brand.id)}
                      className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-orange-50 border-[#FF6600] shadow-sm ring-2 ring-orange-500/20'
                          : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center p-1">
                        <BrandLogo brandId={brand.id} size="md" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 truncate max-w-full text-center">
                        {brand.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Mobiles By Popular Features Bar (from ytyh.PNG) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="border-l-4 border-[#FF6600] pl-3">
                <h3 className="font-black text-slate-900 text-sm sm:text-base">
                  Mobiles By Popular Features
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-center">
                {[
                  { id: '5g', label: '5G Phones', icon: '📶', sub: 'High Speed 5G' },
                  { id: 'ram', label: '8GB & Above RAM', icon: '🧠', sub: 'Fast Multitasking' },
                  { id: 'storage', label: '256 GB & Above', icon: '💾', sub: 'Heavy Storage' },
                  { id: 'amoled', label: 'AMOLED Display', icon: '📺', sub: 'Vivid Colors' },
                  { id: '120hz', label: '120Hz Refresh', icon: '⚡', sub: 'Ultra Smooth' },
                  { id: 'ai', label: 'AI Smartphones', icon: '🤖', sub: 'Next-Gen Intelligence' }
                ].map(feat => {
                  const isSelected = activeFeature === feat.id;
                  return (
                    <button
                      key={feat.id}
                      onClick={() => setActiveFeature(isSelected ? 'all' : feat.id)}
                      className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      <span className="text-xl mb-0.5">{feat.icon}</span>
                      <span className="text-xs font-bold truncate max-w-full">{feat.label}</span>
                      <span className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                        {feat.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Results Section: Most Popular Mobiles List with 91-Spec Scores */}
            <div id="finder-results" className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    Most Popular Mobiles ({filteredPhones.length})
                  </h3>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Surat Verified
                  </span>
                </div>

                {(selectedBrand !== 'all' || activeFeature !== 'all' || selectedCategory !== 'all' || selectedBudgetChip !== null || searchQuery) && (
                  <button
                    onClick={handleReset}
                    className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>फ़िल्टर हटाएं (Clear All)</span>
                  </button>
                )}
              </div>

              {filteredPhones.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    कोई मॉडल इस फ़िल्टर में नहीं मिला
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    कृपया बजट बढ़ाएं या अन्य फ़िल्टर रीसेट करें। आप हमारे सूरत हेल्पलाइन (9372802044) पर भी संपर्क कर सकते हैं।
                  </p>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 rounded-xl bg-[#FF6600] text-white font-bold text-xs cursor-pointer"
                  >
                    सभी फ़िल्टर साफ़ करें
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPhones.map(phone => (
                    <div
                      key={phone.id}
                      className="bg-white rounded-3xl border border-slate-200 hover:border-orange-400 hover:shadow-lg transition-all p-4 flex flex-col justify-between group"
                    >
                      {/* Top Row: 91mobiles Spec Score Badge & Brand */}
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            {/* 91mobiles Spec Score Badge as in ytyh.PNG */}
                            <div className="px-2 py-1 rounded-lg bg-[#388E3C] text-white text-center flex items-center gap-1 shadow-2xs">
                              <span className="text-xs font-black">{phone.specScore}%</span>
                              <span className="text-[9px] font-bold uppercase tracking-tighter opacity-90">
                                Spec
                              </span>
                            </div>
                            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                              {phone.brandName}
                            </span>
                          </div>

                          <span className="text-xs font-bold text-slate-400">
                            {phone.is5G ? '5G Ready' : '4G VoLTE'}
                          </span>
                        </div>

                        {/* Middle: Image & Specs Row */}
                        <div className="flex gap-4 mb-3">
                          <div className="w-24 h-28 rounded-2xl bg-slate-50 overflow-hidden shrink-0 flex items-center justify-center p-1 border border-slate-100">
                            <img
                              src={phone.imageUrl}
                              alt={phone.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              loading="lazy"
                            />
                          </div>

                          <div className="flex-1 space-y-1">
                            <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                              {phone.name}
                            </h4>

                            {/* 4-point spec list */}
                            <ul className="text-[11px] text-slate-600 space-y-0.5 pt-0.5">
                              <li className="line-clamp-1">
                                <strong>Screen:</strong> {phone.display}
                              </li>
                              <li className="line-clamp-1">
                                <strong>CPU:</strong> {phone.processor}
                              </li>
                              <li className="line-clamp-1">
                                <strong>Camera:</strong> {phone.camera}
                              </li>
                              <li className="line-clamp-1">
                                <strong>Battery:</strong> {phone.battery}
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Row: Price & Actions */}
                      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base sm:text-lg font-black text-slate-900">
                              {formatINR(phone.price)}
                            </span>
                            {phone.originalPrice && (
                              <span className="text-xs text-slate-400 line-through">
                                {formatINR(phone.originalPrice)}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-emerald-700 font-semibold block">
                            सूरत में तुरंत कैश / होम डिलीवरी
                          </span>
                        </div>

                        {/* Interactive Buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              // Switch to sell tab and prefill this brand/model
                              const brand = BRANDS.find(b => b.id === phone.brandId) || BRANDS[0];
                              const model = PHONE_MODELS.find(m => m.id === phone.id) || PHONE_MODELS[0];
                              updateSellSelection({
                                brand,
                                model,
                                variant: model.variants[0],
                                color: model.colors[0],
                                condition: 'good'
                              });
                              setActiveTab('sell');
                              setTimeout(() => {
                                document.getElementById('sell-section')?.scrollIntoView({ behavior: 'smooth' });
                              }, 100);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-all cursor-pointer"
                            title="इस फोन को बेचने पर मिलने वाली कीमत जांचें"
                          >
                            📱 बेचें
                          </button>

                          <button
                            onClick={() => {
                              const buySection = document.getElementById('buy-section');
                              if (buySection) {
                                buySection.scrollIntoView({ behavior: 'smooth' });
                              } else {
                                setActiveTab('buy');
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#FF6600] hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>खरीदें</span>
                          </button>

                          <a
                            href={generateWhatsAppLink('general', {
                              modelName: phone.name,
                              locality: selectedLocality,
                              quotePrice: phone.price
                            })}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                            title="WhatsApp पर जानकारी लें"
                          >
                            💬
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
