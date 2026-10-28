import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OrderItem, OrderStatus, P2PListing } from '../types';
import { formatINR } from '../utils/valuation';
import {
  ShieldCheck,
  X,
  Wrench,
  Smartphone,
  ShoppingBag,
  Tag,
  CheckCircle2,
  Clock,
  QrCode,
  CreditCard,
  Percent,
  Check,
  ExternalLink,
  MessageCircle,
  Phone,
  MapPin,
  Lock,
  Unlock,
  AlertCircle,
  Award,
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  FileText,
  Save,
  AlertTriangle,
  XCircle,
  CheckSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

export type StatusCategory = 'all' | 'pending' | 'in_progress' | 'completed' | 'cancelled';

export const AdminPortalModal: React.FC = () => {
  const {
    isAdminModalOpen,
    setIsAdminModalOpen,
    orders,
    p2pListings,
    user,
    loginAsAdmin,
    switchToCustomerRole,
    setOrderAdminQuote,
    confirmOrderPaymentAndHandover,
    setIsProAuditModalOpen,
    setSelectedAuditOrder,
    updateOrder
  } = useApp();

  const [adminTab, setAdminTab] = useState<'repairs' | 'sells' | 'buys' | 'bazaar'>('repairs');
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const AUTH_ADMIN_EMAIL = 'sastafone@sastafone.in';
  const AUTH_ADMIN_PASSWORD = 'Siya@1413';

  // Status Filter & Search State
  const [statusFilter, setStatusFilter] = useState<StatusCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Internal Notes State per order
  const [internalNotesState, setInternalNotesState] = useState<Record<string, string>>({
    'ord-103': 'ग्राहक ने दोपहर 12 बजे तक फ्री रहने को बोला है। BGA लेबोरेटरी से कैमरा लेंस सफायर ग्लास निकाल लिया गया है। 12% स्पेशल डिस्काउंट (₹1,600) अप्रूव्ड।'
  });
  const [noteSavedMap, setNoteSavedMap] = useState<Record<string, boolean>>({});

  // Quote Adjustment state per order
  const [customQuoteInputs, setCustomQuoteInputs] = useState<Record<string, number>>({
    'ord-103': 1600 // Pre-filled with user's example ₹1,600!
  });
  const [quoteNotes, setQuoteNotes] = useState<Record<string, string>>({
    'ord-103': 'सैमसंग S24 Ultra कैमरा सेंसर री-अलाइनमेंट व नया सफायर लेंस फिटिंग (12% स्पेशल छूट व 6 महीने वारंटी सहित)'
  });

  const [activeQrOrder, setActiveQrOrder] = useState<OrderItem | null>(null);

  if (!isAdminModalOpen) return null;

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const inputEmail = adminEmailInput.trim().toLowerCase();
    const inputPass = adminPasswordInput.trim();

    if (inputEmail === AUTH_ADMIN_EMAIL && inputPass === AUTH_ADMIN_PASSWORD) {
      setLoginError('');
      loginAsAdmin(AUTH_ADMIN_EMAIL);
      confetti({ particleCount: 60, spread: 70 });
    } else {
      if (inputEmail !== AUTH_ADMIN_EMAIL && inputPass !== AUTH_ADMIN_PASSWORD) {
        setLoginError('अमान्य ईमेल ID और पासवर्ड! केवल sastafone@sastafone.in और सही पासवर्ड द्वारा ही एडमिन एक्सेस संभव है।');
      } else if (inputEmail !== AUTH_ADMIN_EMAIL) {
        setLoginError('गलत एडमिन ID! केवल अधिकृत sastafone@sastafone.in ही मान्य है।');
      } else {
        setLoginError('गलत पासवर्ड! केवल सही पासवर्ड दर्ज करने पर ही पोर्टल खुलेगा।');
      }
    }
  };

  const handleAdminLogout = () => {
    switchToCustomerRole();
    setAdminPasswordInput('');
    setLoginError('');
  };

  // Helper to normalize status into 4 core buckets: pending, in_progress, completed, cancelled
  const getNormalizedStatus = (status: OrderStatus): 'pending' | 'in_progress' | 'completed' | 'cancelled' => {
    if (status === 'completed') return 'completed';
    if (status === 'cancelled') return 'cancelled';
    if (status === 'in_progress' || status === 'technician_assigned' || status === 'in_inspection') return 'in_progress';
    return 'pending';
  };

  // Status Change Handler
  const handleUpdateStatus = (orderId: string, newStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled') => {
    const statusLabels: Record<string, string> = {
      pending: 'पेंडिंग (समीक्षा बाकी)',
      in_progress: 'प्रगति पर (काम चालू है)',
      completed: 'सम्पन्न (हैंडओवर पूर्ण)',
      cancelled: 'रद्द (कैंसिल्ड)'
    };

    updateOrder(orderId, {
      status: newStatus,
      statusHindi: statusLabels[newStatus],
      phoneHandedOver: newStatus === 'completed',
      paymentCollected: newStatus === 'completed' ? true : undefined
    });

    if (newStatus === 'completed') {
      confetti({ particleCount: 80, spread: 70 });
    }
  };

  // Internal Notes Save Handler
  const handleSaveInternalNote = (orderId: string) => {
    const currentText = internalNotesState[orderId] ?? (orders.find(o => o.id === orderId)?.internalNotes || '');
    updateOrder(orderId, { internalNotes: currentText });
    setNoteSavedMap(prev => ({ ...prev, [orderId]: true }));
    setTimeout(() => {
      setNoteSavedMap(prev => ({ ...prev, [orderId]: false }));
    }, 2500);
  };

  // Filter Orders based on activeTab, statusFilter, and searchQuery
  const filterOrders = (type: 'repair' | 'sell' | 'buy') => {
    return orders
      .filter(o => o.type === type)
      .filter(o => {
        if (statusFilter === 'all') return true;
        const norm = getNormalizedStatus(o.status);
        return norm === statusFilter;
      })
      .filter(o => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          o.orderNumber.toLowerCase().includes(q) ||
          o.title.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q) ||
          (o.fullAddress && o.fullAddress.toLowerCase().includes(q))
        );
      });
  };

  const currentTabOrders = orders.filter(o => {
    if (adminTab === 'repairs') return o.type === 'repair';
    if (adminTab === 'sells') return o.type === 'sell';
    if (adminTab === 'buys') return o.type === 'buy';
    return false;
  });

  // Calculate status counts for the active tab
  const totalCount = currentTabOrders.length;
  const pendingCount = currentTabOrders.filter(o => getNormalizedStatus(o.status) === 'pending').length;
  const inProgressCount = currentTabOrders.filter(o => getNormalizedStatus(o.status) === 'in_progress').length;
  const completedCount = currentTabOrders.filter(o => getNormalizedStatus(o.status) === 'completed').length;
  const cancelledCount = currentTabOrders.filter(o => getNormalizedStatus(o.status) === 'cancelled').length;

  const filteredRepairs = filterOrders('repair');
  const filteredSells = filterOrders('sell');
  const filteredBuys = filterOrders('buy');

  const handleApplyPresetDiscount = (order: OrderItem, pct: number) => {
    const maxVal = order.originalEstimateMax || 1899;
    let calculated = Math.round(maxVal * (1 - pct / 100));
    if (pct === 12 && maxVal === 1899) {
      calculated = 1600; // Exact user example ₹1,600!
    }
    setCustomQuoteInputs(prev => ({
      ...prev,
      [order.id]: calculated
    }));
  };

  const handleConfirmQuoteAndGenerateQr = (order: OrderItem) => {
    const quoteAmount = customQuoteInputs[order.id] || (order.originalEstimateMax ? Math.round(order.originalEstimateMax * 0.88) : 1600);
    const originalMax = order.originalEstimateMax || 1899;
    const discountPct = Math.round(((originalMax - quoteAmount) / originalMax) * 100);
    const notes = quoteNotes[order.id] || 'सूरत हब सर्टिफाइड रिपेयर व 6 महीने की वारंटी';

    setOrderAdminQuote(order.id, quoteAmount, discountPct, notes);
    setActiveQrOrder({
      ...order,
      finalQuoteAmount: quoteAmount,
      discountOfferedPct: discountPct,
      adminNotes: notes,
      paymentQrGenerated: true
    });

    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
  };

  const handleLaunchProAudit = (order: OrderItem) => {
    setSelectedAuditOrder(order);
    setIsProAuditModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white flex flex-wrap items-center justify-between gap-3 shrink-0 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md font-black text-lg">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin & Shopkeeper Portal
                </span>
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  सूरत सेंट्रल हब लाइव
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                सस्ताफोन एडमिन व ओनर कंट्रोल रूम
              </h3>
              <p className="text-[11px] text-slate-300">
                लॉगिन: <strong>{user.role === 'admin' ? (user.email || 'sastafone@sastafone.in') : 'अनलॉगिन (सुरक्षित)'}</strong> • रोल: {user.role === 'admin' ? 'ओनर / सुपर एडमिन ✓' : 'लॉगिन पासवर्ड अपेक्षित'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user.role === 'admin' ? (
              <button
                type="button"
                onClick={handleAdminLogout}
                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/40 text-rose-200 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                title="एडमिन पोर्टल लॉक करें और कस्टमर मोड पर लौटें"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>लॉगआउट / लॉक करें</span>
              </button>
            ) : (
              <span className="text-[11px] font-bold text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-xl border border-amber-400/20 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>पासवर्ड प्रोटेक्टेड</span>
              </span>
            )}

            <button
              onClick={() => setIsAdminModalOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* If user is not logged in as Admin, show strict password login form */}
        {user.role !== 'admin' ? (
          <div className="p-6 sm:p-12 text-center max-w-md mx-auto space-y-4 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto text-2xl shadow-inner border border-amber-300">
              🔒
            </div>
            <h3 className="text-xl font-black text-slate-900">
              सस्ताफोन ओनर व एडमिन लॉगिन
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              सूरत हब के ग्राहक आवेदन (Sell, Buy, Repair, SastaBazaar) देखने, स्टेटस ट्रैक करने और इंटरनल नोट्स लिखने के लिए केवल अधिकृत ओनर क्रेडेंशियल दर्ज करें:
            </p>

            <form onSubmit={handleAdminLogin} className="space-y-3.5 text-left pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  अधिकृत एडमिन ईमेल ID:
                </label>
                <input
                  type="email"
                  required
                  value={adminEmailInput}
                  onChange={e => {
                    setAdminEmailInput(e.target.value);
                    if (loginError) setLoginError('');
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-slate-50 font-medium focus:outline-none focus:border-blue-600"
                  placeholder="sastafone@sastafone.in"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  सुरक्षित एक्सेस पासवर्ड:
                </label>
                <input
                  type="password"
                  required
                  value={adminPasswordInput}
                  onChange={e => {
                    setAdminPasswordInput(e.target.value);
                    if (loginError) setLoginError('');
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-slate-50 focus:outline-none focus:border-blue-600"
                  placeholder="गुप्त पासवर्ड दर्ज करें"
                />
              </div>

              {loginError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <Unlock className="w-4 h-4" />
                <span>पासवर्ड सत्यापित करें व लॉगिन करें</span>
              </button>
            </form>

            <div className="pt-2 text-[11px] text-slate-400">
              सुरक्षित 256-बिट ऑथेंटिकेशन • अनधिकृत एक्सेस पूर्णतः प्रतिबंधित है
            </div>
          </div>
        ) : (
          /* Admin Main Portal Body */
          <div className="flex-1 overflow-y-auto flex flex-col">
            {/* Top Navigation Sub-Tabs */}
            <div className="bg-slate-100 p-2 sm:px-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => {
                    setAdminTab('repairs');
                    setStatusFilter('all');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    adminTab === 'repairs'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>रिपेयरिंग जॉब्स ({orders.filter(o => o.type === 'repair').length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAdminTab('sells');
                    setStatusFilter('all');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    adminTab === 'sells'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>फोन खरीद रिक्वेस्ट ({orders.filter(o => o.type === 'sell').length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAdminTab('buys');
                    setStatusFilter('all');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    adminTab === 'buys'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>सर्टिफाइड ऑर्डर्स ({orders.filter(o => o.type === 'buy').length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminTab('bazaar')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    adminTab === 'bazaar'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5 text-amber-500" />
                  <span>सस्ता बाज़ार लिस्टिंग्स ({p2pListings.length})</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                <span className="hidden sm:inline">सूरत हब:</span>
                <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  रिंग रोड / पाल / अडाजण हब
                </span>
              </div>
            </div>

            {/* STATUS TRACKING DASHBOARD BAR (For repairs, sells, buys) */}
            {adminTab !== 'bazaar' && (
              <div className="bg-slate-50 p-4 border-b border-slate-200 shrink-0 space-y-3">
                {/* 4 Status KPI Tiles */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      statusFilter === 'all'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 block font-semibold">कुल आवेदन</span>
                    <span className="text-base font-black">{totalCount}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusFilter('pending')}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      statusFilter === 'pending'
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm font-black'
                        : 'bg-white hover:bg-amber-50/50 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] block font-bold">🟡 Pending (लंबित)</span>
                      <span className="text-xs font-black bg-amber-100 text-amber-900 px-1.5 rounded-full">
                        {pendingCount}
                      </span>
                    </div>
                    <span className="text-base font-black">{pendingCount} रिक्वेस्ट</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusFilter('in_progress')}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      statusFilter === 'in_progress'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white hover:bg-blue-50/50 border-blue-200 text-blue-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] block font-bold">🔵 In Progress (प्रगति पर)</span>
                      <span className="text-xs font-black bg-blue-100 text-blue-900 px-1.5 rounded-full">
                        {inProgressCount}
                      </span>
                    </div>
                    <span className="text-base font-black">{inProgressCount} जॉब्स</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusFilter('completed')}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      statusFilter === 'completed'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white hover:bg-emerald-50/50 border-emerald-200 text-emerald-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] block font-bold">🟢 Completed (सम्पन्न)</span>
                      <span className="text-xs font-black bg-emerald-100 text-emerald-900 px-1.5 rounded-full">
                        {completedCount}
                      </span>
                    </div>
                    <span className="text-base font-black">{completedCount} डिलिवर्ड</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusFilter('cancelled')}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer col-span-2 sm:col-span-1 ${
                      statusFilter === 'cancelled'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-white hover:bg-rose-50/50 border-rose-200 text-rose-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] block font-bold">🔴 Cancelled (रद्द)</span>
                      <span className="text-xs font-black bg-rose-100 text-rose-900 px-1.5 rounded-full">
                        {cancelledCount}
                      </span>
                    </div>
                    <span className="text-base font-black">{cancelledCount}</span>
                  </button>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
                  <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="ऑर्डर नंबर, फोन मॉडल, ग्राहक या फोन खोजें..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-blue-600"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 text-xs font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-[11px]">
                    <span className="text-slate-500 font-bold flex items-center gap-1">
                      <Filter className="w-3.5 h-3.5 text-slate-600" />
                      <span>स्टेटस फ़िल्टर:</span>
                    </span>
                    {(['all', 'pending', 'in_progress', 'completed', 'cancelled'] as StatusCategory[]).map(cat => (
                      <button
                        key={cat}
                        onClick={() => setStatusFilter(cat)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer shrink-0 ${
                          statusFilter === cat
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {cat === 'all'
                          ? 'सभी'
                          : cat === 'pending'
                          ? '🟡 Pending'
                          : cat === 'in_progress'
                          ? '🔵 In Progress'
                          : cat === 'completed'
                          ? '🟢 Completed'
                          : '🔴 Cancelled'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 1: REPAIRS ORDERS */}
            {adminTab === 'repairs' && (
              <div className="p-4 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>🔧 ग्राहक रिपेयरिंग आवेदन, स्टेटस ट्रैकिंग व कोटेशन इंजन</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                        {filteredRepairs.length} प्रदर्शित
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      प्रत्येक आवेदन का स्टेटस बदलें (Pending, In Progress, Completed, Cancelled), गुप्त इंटरनल नोट्स लिखें और 10%-12% ऑफ वाला QR कोड बनाएं।
                    </p>
                  </div>
                </div>

                {filteredRepairs.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-1">
                    <p className="font-bold">चयनित फ़िल्टर के लिए कोई रिपेयरिंग आवेदन नहीं मिला।</p>
                    <p className="text-[11px] text-slate-400">कृपया स्टेटस फ़िल्टर या सर्च क्वेरी बदलें।</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredRepairs.map(order => {
                      const maxVal = order.originalEstimateMax || 1899;
                      const minVal = order.originalEstimateMin || 699;
                      const currentQuote = customQuoteInputs[order.id] || order.finalQuoteAmount || (order.id === 'ord-103' ? 1600 : Math.round(maxVal * 0.88));
                      const isAuditDone = Boolean(order.proAudit);
                      const isPaid = order.paymentCollected || order.paymentStatus === 'paid';
                      const isHandedOver = order.phoneHandedOver;
                      const normStatus = getNormalizedStatus(order.status);
                      const noteText = internalNotesState[order.id] ?? (order.internalNotes || '');
                      const isNoteSaved = noteSavedMap[order.id];

                      return (
                        <div
                          key={order.id}
                          className={`p-4 sm:p-5 rounded-3xl border-2 transition-all shadow-xs ${
                            order.id === 'ord-103'
                              ? 'bg-gradient-to-r from-amber-50/60 via-blue-50/50 to-slate-50 border-amber-400'
                              : normStatus === 'completed'
                              ? 'bg-emerald-50/40 border-emerald-300'
                              : normStatus === 'cancelled'
                              ? 'bg-rose-50/40 border-rose-200'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          {/* Order Top Summary */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-200">
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="text-xs font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded-md">
                                  {order.orderNumber}
                                </span>
                                <span className="text-xs font-bold text-slate-500">
                                  {order.date} • {order.timeSlot}
                                </span>
                                {order.id === 'ord-103' && (
                                  <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                                    ⭐ उदाहरण मॉडल: कैमरा सेंसर ब्लर
                                  </span>
                                )}
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  normStatus === 'completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : normStatus === 'in_progress'
                                    ? 'bg-blue-100 text-blue-800'
                                    : normStatus === 'cancelled'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-900'
                                }`}>
                                  {order.statusHindi || normStatus.toUpperCase()}
                                </span>
                              </div>

                              <h5 className="text-base sm:text-lg font-black text-slate-950">
                                {order.title}
                              </h5>
                              <p className="text-xs text-blue-900 font-semibold mt-0.5">
                                {order.subtitle}
                              </p>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-[10px] text-slate-500 block">अनुमानित रेंज:</span>
                              <span className="text-sm font-black text-slate-800 font-mono">
                                {formatINR(minVal)} - {formatINR(maxVal)}
                              </span>
                              <span className="text-[10px] text-emerald-700 block font-semibold">
                                विज़िट टोकन: ₹199 (एडजस्टेबल)
                              </span>
                            </div>
                          </div>

                          {/* Customer & Location Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 py-3 text-xs bg-slate-50/80 p-3 rounded-2xl my-3 border border-slate-200/80">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold">ग्राहक नाम व संपर्क:</span>
                              <span className="font-bold text-slate-800 flex items-center gap-1">
                                <span>{order.customerName}</span>
                                <a
                                  href={`tel:${order.customerPhone}`}
                                  className="text-blue-600 hover:underline inline-flex items-center gap-0.5 font-mono text-[11px]"
                                >
                                  <Phone className="w-3 h-3" />
                                  {order.customerPhone}
                                </a>
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold">सूरत पता:</span>
                              <span className="text-slate-700 text-[11px] font-medium flex items-center gap-1 line-clamp-1">
                                <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                                {order.fullAddress}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold">असाइंड टेक्नीशियन:</span>
                              <span className="font-bold text-slate-800 text-[11px]">
                                {order.technicianName || 'Sanjay Prajapati'}
                              </span>
                            </div>
                          </div>

                          {/* 1. STATUS CONTROLLER TOOLBAR (Requested by User) */}
                          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1.5 mb-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black text-slate-900 flex items-center gap-1">
                                <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                                <span>एडमिन स्टेटस ट्रैकर:</span>
                              </span>
                              <span className="text-[10px] text-slate-500 font-semibold">
                                वर्तमान: <strong className="text-slate-900 capitalize">{normStatus.replace('_', ' ')}</strong>
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(order.id, 'pending')}
                                className={`py-1.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                  normStatus === 'pending'
                                    ? 'bg-amber-400 text-slate-950 font-black shadow-xs ring-2 ring-amber-500/40'
                                    : 'bg-slate-100 hover:bg-amber-50 text-slate-700 border border-slate-200'
                                }`}
                              >
                                <span>🟡 Pending</span>
                                {normStatus === 'pending' && <Check className="w-3.5 h-3.5" />}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(order.id, 'in_progress')}
                                className={`py-1.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                  normStatus === 'in_progress'
                                    ? 'bg-blue-600 text-white font-black shadow-xs ring-2 ring-blue-500/40'
                                    : 'bg-slate-100 hover:bg-blue-50 text-slate-700 border border-slate-200'
                                }`}
                              >
                                <span>🔵 In Progress</span>
                                {normStatus === 'in_progress' && <Check className="w-3.5 h-3.5" />}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(order.id, 'completed')}
                                className={`py-1.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                  normStatus === 'completed'
                                    ? 'bg-emerald-600 text-white font-black shadow-xs ring-2 ring-emerald-500/40'
                                    : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 border border-slate-200'
                                }`}
                              >
                                <span>🟢 Completed</span>
                                {normStatus === 'completed' && <Check className="w-3.5 h-3.5" />}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                className={`py-1.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                  normStatus === 'cancelled'
                                    ? 'bg-rose-600 text-white font-black shadow-xs ring-2 ring-rose-500/40'
                                    : 'bg-slate-100 hover:bg-rose-50 text-slate-700 border border-slate-200'
                                }`}
                              >
                                <span>🔴 Cancelled</span>
                                {normStatus === 'cancelled' && <Check className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          {/* 2. INTERNAL NOTES SECTION (Requested by User) */}
                          <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/90 space-y-2 mb-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black text-amber-950 flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-amber-800" />
                                <span>स्टाफ व एडमिन इंटरनल नोट्स (Internal Notes - ग्राहक से गुप्त):</span>
                              </span>
                              {isNoteSaved && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  <span>नोट सेव हुआ!</span>
                                </span>
                              )}
                            </div>

                            <textarea
                              rows={2}
                              value={noteText}
                              onChange={e => {
                                const val = e.target.value;
                                setInternalNotesState(prev => ({ ...prev, [order.id]: val }));
                              }}
                              placeholder="टेक्नीशियन या एडमिन का निजी नोट लिखें (उदा. कस्टमर 3 बजे मिलेगा, पार्ट रिंग रोड से मंगवाया, डिस्काउंट कारण आदि)..."
                              className="w-full p-2.5 rounded-xl border border-amber-300 text-xs bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                            />

                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-400">
                                {order.internalNotes ? '✓ पहले से नोट सहेजा हुआ है' : 'कोई नोट नहीं लिखा गया'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleSaveInternalNote(order.id)}
                                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                              >
                                <Save className="w-3 h-3" />
                                <span>नोट सेव करें</span>
                              </button>
                            </div>
                          </div>

                          {/* Pro-Audit Hardware Testing Box */}
                          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                                <Award className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                                  <span>हार्डवेयर Pro-Audit स्टेटस:</span>
                                  {isAuditDone ? (
                                    <span className="text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded-full text-[10px]">
                                      ✓ 100% पास (IMEI: {order.proAudit?.imei})
                                    </span>
                                  ) : (
                                    <span className="text-amber-800 bg-amber-100 px-2 py-0.2 rounded-full text-[10px]">
                                      जांच बाकी (Pending Test)
                                    </span>
                                  )}
                                </p>
                                <p className="text-[11px] text-slate-600">
                                  {isAuditDone
                                    ? `ऑडिट निष्कर्ष: ${order.proAudit?.technicianNotes}`
                                    : 'IMEI, 9-पॉइंट टच, कैमरा ऑटोफोकस, माइक व LCI वाटर मार्कर जांचें।'}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleLaunchProAudit(order)}
                              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer shadow-xs"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-300" />
                              <span>{isAuditDone ? 'ऑडिट रिपोर्ट देखें / अपडेट' : 'Pro-Audit टेस्ट शुरू करें'}</span>
                            </button>
                          </div>

                          {/* Price Quotation & Discount Section (User's Exact 12% off -> 1600 requirement) */}
                          <div className="p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-300 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <h6 className="font-black text-xs sm:text-sm text-slate-950 flex items-center gap-1.5">
                                  <Percent className="w-4 h-4 text-amber-700" />
                                  <span>फाइनल कोटेड प्राइस व डिस्काउंट तय करें:</span>
                                </h6>
                                <p className="text-[11px] text-slate-600">
                                  अधिकतम अनुमान ₹{maxVal} में से ग्राहक को 10% या 12% ऑफ देकर ₹1,600 जैसा आकर्षक रेट तय करें।
                                </p>
                              </div>

                              {/* Preset Buttons */}
                              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                                <span className="text-[10px] text-slate-500 font-bold">शॉर्टकट:</span>
                                <button
                                  type="button"
                                  onClick={() => handleApplyPresetDiscount(order, 12)}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-black border transition-all cursor-pointer ${
                                    currentQuote === 1600
                                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                      : 'bg-white hover:bg-emerald-50 text-emerald-800 border-emerald-300'
                                  }`}
                                  title="12% कम करके ₹1,600 करें"
                                >
                                  12% Off (₹1,600) ⭐
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleApplyPresetDiscount(order, 10)}
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 transition-all cursor-pointer"
                                >
                                  10% Off (₹1,700)
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                              <div className="sm:col-span-5">
                                <label className="text-[10px] font-bold text-slate-600 block mb-1">
                                  फाइनल कस्टमर पेयेबल अमाउंट (₹):
                                </label>
                                <div className="relative">
                                  <span className="absolute left-3 top-2 text-slate-500 font-bold text-sm">₹</span>
                                  <input
                                    type="number"
                                    value={currentQuote}
                                    onChange={e => {
                                      const val = parseInt(e.target.value) || 0;
                                      setCustomQuoteInputs(prev => ({ ...prev, [order.id]: val }));
                                    }}
                                    className="w-full pl-7 pr-3 py-2 rounded-xl border-2 border-amber-400 font-black text-sm bg-white text-slate-950"
                                  />
                                </div>
                              </div>

                              <div className="sm:col-span-7">
                                <label className="text-[10px] font-bold text-slate-600 block mb-1">
                                  ग्राहक को दिखने वाला नोट / वारंटी विवरण:
                                </label>
                                <input
                                  type="text"
                                  value={quoteNotes[order.id] || ''}
                                  onChange={e => {
                                    const val = e.target.value;
                                    setQuoteNotes(prev => ({ ...prev, [order.id]: val }));
                                  }}
                                  className="w-full p-2 rounded-xl border border-slate-300 text-xs bg-white"
                                  placeholder="कैमरा सेंसर री-अलाइनमेंट व नया ग्लास फिटिंग (6 महीने वारंटी)"
                                />
                              </div>
                            </div>

                            {/* Action Buttons: Confirm & Generate QR */}
                            <div className="pt-2 border-t border-amber-200 flex flex-wrap items-center justify-between gap-3">
                              <div className="text-[11px] text-slate-700">
                                फाइनल ग्राहक बिल: <strong className="text-emerald-700 font-black text-sm font-mono">{formatINR(currentQuote)}</strong>{' '}
                                (टोकन ₹199 पहले से एडजस्टेड)
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleConfirmQuoteAndGenerateQr(order)}
                                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-md flex items-center gap-1.5 cursor-pointer"
                                >
                                  <QrCode className="w-4 h-4 text-slate-900" />
                                  <span>फाइनल प्राइस सेट करें व पेमेंट QR बनाएं</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Live Generated QR Code Box & Handover Rule */}
                          {(order.paymentQrGenerated || activeQrOrder?.id === order.id) && (
                            <div className="mt-4 p-4 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-2 border-amber-400 space-y-4 animate-in fade-in duration-200">
                              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="space-y-1.5 text-center md:text-left">
                                  <div className="inline-flex items-center gap-1.5 bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                                    <span>💳 लाइव डायनेमिक UPI QR कोड तैयार</span>
                                  </div>
                                  <h6 className="text-lg font-black text-white">
                                    स्कैन एंड पे: ₹{currentQuote.toLocaleString('en-IN')}
                                  </h6>
                                  <p className="text-xs text-blue-200">
                                    UPI ID: <strong className="font-mono text-amber-300">9372802044@okbizaxis</strong> (सस्ताफोन सूरत हब)
                                  </p>
                                  <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-[11px] font-bold flex items-center gap-1.5">
                                    <span>⚠️ सख्त नियम:</span>
                                    <span>पहले ऑनलाइन/कैश पेमेंट प्राप्त करें, इसके बाद ही फोन हैंडओवर किया जाएगा!</span>
                                  </div>
                                </div>

                                {/* Stylized QR Code Visual */}
                                <div className="shrink-0 bg-white p-3 rounded-2xl shadow-xl text-center border-2 border-amber-400">
                                  <div className="w-36 h-36 bg-slate-900 rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden mx-auto">
                                    <div className="w-full h-full bg-white rounded-lg p-1.5 flex flex-col justify-between">
                                      <div className="flex justify-between">
                                        <div className="w-7 h-7 bg-black rounded-xs flex items-center justify-center"><div className="w-3 h-3 bg-white" /></div>
                                        <div className="w-7 h-7 bg-black rounded-xs flex items-center justify-center"><div className="w-3 h-3 bg-white" /></div>
                                      </div>
                                      <div className="text-[9px] font-black text-slate-900 tracking-tighter text-center">
                                        Sastaphone<br />
                                        <span className="text-blue-600 font-mono text-[10px]">₹{currentQuote}</span>
                                      </div>
                                      <div className="flex justify-between items-end">
                                        <div className="w-7 h-7 bg-black rounded-xs flex items-center justify-center"><div className="w-3 h-3 bg-white" /></div>
                                        <div className="w-6 h-6 border-2 border-black flex items-center justify-center text-[8px] font-bold">UPI</div>
                                      </div>
                                    </div>
                                  </div>
                                  <span className="text-[10px] text-slate-700 font-bold mt-1 block">
                                    GPay / PhonePe / Paytm
                                  </span>
                                </div>
                              </div>

                              {/* Handover & Payment Confirmation Actions */}
                              <div className="pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-2.5">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      confirmOrderPaymentAndHandover(order.id, true, isHandedOver || false);
                                      handleUpdateStatus(order.id, 'in_progress');
                                    }}
                                    className={`px-4 py-2 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                                      isPaid
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                    }`}
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>{isPaid ? '✓ ₹' + currentQuote + ' पेमेंट प्राप्त हुआ' : 'पेमेंट वेरिफाइड करें (Mark Paid)'}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!isPaid) {
                                        alert('कृपया पहले पेमेंट प्राप्त करें! (First Payment, Then Handover)');
                                        return;
                                      }
                                      confirmOrderPaymentAndHandover(order.id, true, true);
                                      handleUpdateStatus(order.id, 'completed');
                                    }}
                                    className={`px-4 py-2 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                                      isHandedOver
                                        ? 'bg-blue-500 text-white'
                                        : isPaid
                                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                                        : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                    }`}
                                  >
                                    <Sparkles className="w-4 h-4 text-slate-900" />
                                    <span>{isHandedOver ? '✓ फोन हैंडओवर पूरा हुआ (Completed)' : 'फोन ग्राहक को हैंडओवर करें (Mark Completed)'}</span>
                                  </button>
                                </div>

                                <a
                                  href={`https://wa.me/91${order.customerPhone}?text=${encodeURIComponent(
                                    `नमस्ते ${order.customerName}! आपके ${order.title} का काम पूरा हो गया है। आपका स्पेशल डिस्काउंटेड बिल ₹${currentQuote} है। कृपया पेमेंट करके फोन प्राप्त करें। Sastaphone Surat: 9372802044`
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1"
                                >
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>ग्राहक को WhatsApp पर बिल व QR भेजें</span>
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: SELL PHONE SUBMISSIONS WITH STATUS & NOTES */}
            {adminTab === 'sells' && (
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>📱 फोन बेचने के ग्राहक आवेदन (Sell Requests)</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                        {filteredSells.length} प्रदर्शित
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      स्टेटस अपडेट करें (Pending, In Progress, Completed, Cancelled) और पिकअप व इंस्पेक्शन के इंटरनल नोट्स लिखें।
                    </p>
                  </div>
                </div>

                {filteredSells.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    चयनित फ़िल्टर के लिए कोई सेल रिक्वेस्ट नहीं मिली।
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredSells.map(order => {
                      const normStatus = getNormalizedStatus(order.status);
                      const noteText = internalNotesState[order.id] ?? (order.internalNotes || '');
                      const isNoteSaved = noteSavedMap[order.id];

                      return (
                        <div key={order.id} className="p-4 rounded-3xl bg-white border-2 border-slate-200 shadow-xs space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded-md">
                                  {order.orderNumber}
                                </span>
                                <span className="text-xs text-slate-500">{order.date}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  normStatus === 'completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : normStatus === 'in_progress'
                                    ? 'bg-blue-100 text-blue-800'
                                    : normStatus === 'cancelled'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-900'
                                }`}>
                                  {order.statusHindi || normStatus.toUpperCase()}
                                </span>
                              </div>
                              <h5 className="font-black text-slate-900 text-base">{order.title}</h5>
                              <p className="text-xs text-slate-600">{order.subtitle}</p>
                              <p className="text-[11px] text-slate-500 mt-1">
                                📍 {order.customerName} ({order.customerPhone}) • {order.fullAddress}
                              </p>
                            </div>

                            <div className="text-right shrink-0 space-y-1">
                              <span className="text-xs text-slate-400 block font-semibold">बाय-बैक ऑफर मूल्य:</span>
                              <span className="text-xl font-black text-emerald-700 font-mono">
                                {formatINR(order.amount)}
                              </span>
                              <div className="flex items-center gap-1.5 justify-end">
                                <a
                                  href={`tel:${order.customerPhone}`}
                                  className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100"
                                >
                                  कॉल करें
                                </a>
                                <a
                                  href={`https://wa.me/91${order.customerPhone}?text=${encodeURIComponent(
                                    `नमस्ते ${order.customerName}! आपके फोन ${order.title} का बाय-बैक पिकअप कन्फर्म करने के लिए संपर्क कर रहे हैं। Sastaphone Surat: 9372802044`
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold hover:bg-emerald-200"
                                >
                                  WhatsApp
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Status Tracker */}
                          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                            <span className="text-[10px] font-black text-slate-600 block">स्टेटस बदलें:</span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                              {(['pending', 'in_progress', 'completed', 'cancelled'] as const).map(st => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => handleUpdateStatus(order.id, st)}
                                  className={`py-1 px-2 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                                    normStatus === st
                                      ? st === 'completed' ? 'bg-emerald-600 text-white font-black' : st === 'cancelled' ? 'bg-rose-600 text-white font-black' : st === 'in_progress' ? 'bg-blue-600 text-white font-black' : 'bg-amber-400 text-slate-950 font-black'
                                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  {st === 'pending' ? '🟡 Pending' : st === 'in_progress' ? '🔵 In Progress' : st === 'completed' ? '🟢 Completed' : '🔴 Cancelled'}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Internal Notes */}
                          <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5" />
                                <span>पिकअप व फोन स्थिति इंटरनल नोट्स:</span>
                              </span>
                              {isNoteSaved && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                  ✓ सेव हुआ
                                </span>
                              )}
                            </div>
                            <textarea
                              rows={1}
                              value={noteText}
                              onChange={e => setInternalNotesState(prev => ({ ...prev, [order.id]: e.target.value }))}
                              placeholder="फोन कंडीशन, बिल/बॉक्स, स्पॉट बोनस या कैंसलेशन कारण लिखें..."
                              className="w-full p-2 rounded-xl border border-amber-300 text-xs bg-white text-slate-900"
                            />
                            <div className="text-right">
                              <button
                                type="button"
                                onClick={() => handleSaveInternalNote(order.id)}
                                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-2xs"
                              >
                                नोट सेव करें
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: BUY CERTIFIED ORDERS WITH STATUS & NOTES */}
            {adminTab === 'buys' && (
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-black text-slate-900">
                    🛍️ सर्टिफाइड रीफर्बिश्ड फोन खरीद ऑर्डर्स
                  </h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
                    {filteredBuys.length} प्रदर्शित
                  </span>
                </div>

                {filteredBuys.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    चयनित फ़िल्टर के लिए कोई खरीद ऑर्डर नहीं मिला।
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredBuys.map(order => {
                      const normStatus = getNormalizedStatus(order.status);
                      const noteText = internalNotesState[order.id] ?? (order.internalNotes || '');
                      const isNoteSaved = noteSavedMap[order.id];

                      return (
                        <div key={order.id} className="p-4 rounded-3xl bg-white border-2 border-slate-200 shadow-xs space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded-md">
                                  {order.orderNumber}
                                </span>
                                <span className="text-xs text-slate-500">{order.date}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  normStatus === 'completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : normStatus === 'in_progress'
                                    ? 'bg-blue-100 text-blue-800'
                                    : normStatus === 'cancelled'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-900'
                                }`}>
                                  {order.statusHindi || normStatus.toUpperCase()}
                                </span>
                              </div>
                              <h5 className="font-bold text-slate-900 text-base">{order.title}</h5>
                              <p className="text-xs text-slate-500">
                                📍 {order.customerName} ({order.customerPhone}) • {order.fullAddress}
                              </p>
                            </div>
                            <span className="text-lg font-black text-slate-900 font-mono">
                              {formatINR(order.amount)}
                            </span>
                          </div>

                          {/* Status Tracker */}
                          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                            <span className="text-[10px] font-black text-slate-600 block">स्टेटस बदलें:</span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                              {(['pending', 'in_progress', 'completed', 'cancelled'] as const).map(st => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => handleUpdateStatus(order.id, st)}
                                  className={`py-1 px-2 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                                    normStatus === st
                                      ? st === 'completed' ? 'bg-emerald-600 text-white font-black' : st === 'cancelled' ? 'bg-rose-600 text-white font-black' : st === 'in_progress' ? 'bg-blue-600 text-white font-black' : 'bg-amber-400 text-slate-950 font-black'
                                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  {st === 'pending' ? '🟡 Pending' : st === 'in_progress' ? '🔵 In Progress' : st === 'completed' ? '🟢 Completed' : '🔴 Cancelled'}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Internal Notes */}
                          <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5" />
                                <span>डिलीवरी व डिस्पैच नोट्स:</span>
                              </span>
                              {isNoteSaved && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                  ✓ सेव हुआ
                                </span>
                              )}
                            </div>
                            <textarea
                              rows={1}
                              value={noteText}
                              onChange={e => setInternalNotesState(prev => ({ ...prev, [order.id]: e.target.value }))}
                              placeholder="पैकेजिंग, ट्रैकिंग या वारंटी इनवॉइस नोट लिखें..."
                              className="w-full p-2 rounded-xl border border-amber-300 text-xs bg-white text-slate-900"
                            />
                            <div className="text-right">
                              <button
                                type="button"
                                onClick={() => handleSaveInternalNote(order.id)}
                                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-2xs"
                              >
                                नोट सेव करें
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: SASTABAZAAR LISTINGS */}
            {adminTab === 'bazaar' && (
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-black text-slate-900">
                      🏷️ सस्ता बाज़ार P2P लिस्टिंग्स (सूरत कम्युनिटी)
                    </h4>
                    <p className="text-xs text-slate-500">
                      ग्राहकों द्वारा पोस्ट किए गए मोबाइल विज्ञापनों का रिव्यु व सुरक्षा अनुमोदन।
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {p2pListings.map(listing => (
                    <div key={listing.id} className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                          {listing.brand}
                        </span>
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                          ✓ वेरिफाइड
                        </span>
                      </div>

                      <h5 className="font-black text-slate-900 text-sm">{listing.modelName}</h5>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{listing.description}</p>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between font-bold">
                        <span className="text-slate-900 text-sm font-mono">{formatINR(listing.price)}</span>
                        <span className="text-[10px] text-slate-500">{listing.sellerName} ({listing.locality})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
