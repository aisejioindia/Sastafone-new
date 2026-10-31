import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  User,
  Phone,
  MapPin,
  Package,
  Clock,
  CheckCircle2,
  ChevronRight,
  LogOut,
  ShieldCheck,
  MessageCircle,
  AlertCircle,
  Star,
  QrCode,
  FileText,
  Sparkles,
  Check,
  Image as ImageIcon,
  Eye,
  HelpCircle
} from 'lucide-react';
import { formatINR, generateWhatsAppLink } from '../utils/valuation';
import { SURAT_LOCALITIES, WHATSAPP_NUMBER } from '../data/mockData';
import confetti from 'canvas-confetti';

export const UserDashboardModal: React.FC = () => {
  const {
    isDashboardOpen,
    setIsDashboardOpen,
    language,
    selectedLocality,
    setSelectedLocality,
    orders,
    user,
    loginUser,
    logoutUser,
    setIsInvoiceModalOpen,
    setSelectedInvoiceOrder,
    buyerCredits,
    buyerPlan,
    unlockedContactIds,
    setIsReviewModalOpen,
    setPrefillReviewOrder
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'surat'>('orders');
  const [phoneInput, setPhoneInput] = useState(user.phone || '');
  const [nameInput, setNameInput] = useState(user.name || '');
  const [otpStep, setOtpStep] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [expandedQrOrderId, setExpandedQrOrderId] = useState<string | null>(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  if (!isDashboardOpen) return null;

  const handleSimulateSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput) return;
    setOtpStep(true);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    loginUser(
      nameInput || 'Surat Customer',
      phoneInput,
      `Surat, Gujarat`,
      undefined,
      undefined,
      'phone'
    );
    setOtpStep(false);
  };

  const handleGoogleSignIn = () => {
    setIsGoogleSigningIn(true);
    setTimeout(() => {
      loginUser(
        'Sanuragi',
        phoneInput || '9825012345',
        `Adajan, Surat, Gujarat`,
        'sanuragi3395@gmail.com',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        'google'
      );
      setIsGoogleSigningIn(false);
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-lg shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : user.isLoggedIn ? (
                user.name.charAt(0).toUpperCase()
              ) : (
                '👤'
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg">
                  {user.isLoggedIn ? user.name : (language === 'hi' ? 'ग्राहक डैशबोर्ड' : 'Customer Dashboard')}
                </h3>
                <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  SURAT EXCLUSIVE
                </span>
              </div>
              <p className="text-xs text-blue-100 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-amber-300" />
                <span>{selectedLocality}</span>
                {user.phone && <span>• +91 {user.phone}</span>}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsDashboardOpen(false)}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 text-center border-b-2 transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            📦 {language === 'hi' ? 'मेरे ऑर्डर्स व रिक्वेस्ट्स' : 'My Orders & Requests'} ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 text-center border-b-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            👤 {language === 'hi' ? 'प्रोफ़ाइल व लॉगिन' : 'Profile & Auth'}
          </button>
          <button
            onClick={() => setActiveTab('surat')}
            className={`py-3 text-center border-b-2 transition-all cursor-pointer ${
              activeTab === 'surat'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            📍 {language === 'hi' ? 'सूरत हब्स' : 'Surat Hubs'}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'orders' && (
            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <Package className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">
                    {language === 'hi' ? 'अभी कोई ऑर्डर नहीं है' : 'No active orders yet'}
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    {language === 'hi'
                      ? 'पुराना फोन बेचें या सर्टिफाइड फोन ऑर्डर करें। सभी स्टेटस यहाँ रियल-टाइम दिखेंगे।'
                      : 'Sell your phone or order a certified device to track doorstep updates here.'}
                  </p>
                </div>
              ) : (
                orders.map(order => (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 bg-white shadow-2xs space-y-2.5 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            order.type === 'sell'
                              ? 'bg-blue-100 text-blue-800'
                              : order.type === 'buy'
                              ? 'bg-amber-100 text-amber-900'
                              : order.type === 'repair'
                              ? 'bg-indigo-100 text-indigo-900'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}>
                            {order.type === 'sell' ? 'SELL PHONE' : order.type === 'buy' ? 'CERTIFIED BUY' : order.type === 'repair' ? 'REPAIR' : 'PASS / UNLOCK'}
                          </span>
                          <span className="text-[11px] font-bold text-slate-500">#{order.orderNumber}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">{order.title}</h4>
                        <p className="text-xs text-slate-500">{order.subtitle}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-base font-black text-slate-900 block">
                          {formatINR(order.amount)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">{order.date}</span>
                      </div>
                    </div>

                    {/* Status timeline badge */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-bold text-slate-800">{order.statusHindi}</span>
                      </div>
                      <span className="text-[10px] text-blue-600 font-bold bg-white px-2 py-0.5 rounded border border-blue-200">
                        {order.timeSlot}
                      </span>
                    </div>

                    {/* Special Repair Visit Charge and Refund Guarantee Info */}
                    {order.type === 'repair' && (
                      <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-950 space-y-1">
                        <div className="flex items-center justify-between font-bold">
                          <span>होम विज़िट चार्ज: ₹{order.visitCharge || 199}</span>
                          <span className="text-[10px] bg-amber-200 text-slate-900 px-2 py-0.5 rounded-md">
                            {order.paymentStatus === 'pay_on_visit' ? 'Pay on Arrival' : 'Paid Online'}
                          </span>
                        </div>
                        <p className="text-[10px] text-amber-900">
                          {order.refundPolicyNote ||
                            '✓ फोन रिपेयर होने पर ₹199 फाइनल बिल में एडजस्ट होगा | ✓ फोन न बनने पर ₹99 रिफंड होगा।'}
                        </p>
                      </div>
                    )}

                    {/* ADMIN & HUB OWNER RETURNED REPORT CARD (INVOICE, DOUBT RESOLUTION, PHOTOS, QR) */}
                    {(order.invoiceSentToCustomer || order.finalQuoteAmount || order.customerDoubtResolved) && (
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-slate-50 border-2 border-blue-400 space-y-3 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-200/80 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                              ✓
                            </span>
                            <div>
                              <h5 className="font-black text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                                <span>सस्ताफोन ओनर व सर्टिफाइड लैब रिपोर्ट</span>
                                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.2 rounded-full">
                                  VERIFIED
                                </span>
                              </h5>
                              <p className="text-[10px] text-blue-800 font-semibold">
                                रसीद / इनवॉइस: <strong className="font-mono text-slate-900">{order.invoiceNumber || 'STP-INV-2026-103'}</strong>
                              </p>
                            </div>
                          </div>

                          {order.finalQuoteAmount && (
                            <div className="text-right">
                              <span className="text-[10px] text-slate-500 block">फाइनल स्वीकृत ऑफर:</span>
                              <div className="flex items-center gap-1.5 justify-end">
                                {order.originalEstimateMax && order.originalEstimateMax > order.finalQuoteAmount && (
                                  <span className="line-through text-slate-400 text-xs font-mono">
                                    {formatINR(order.originalEstimateMax)}
                                  </span>
                                )}
                                <span className="text-base font-black text-emerald-700 font-mono">
                                  {formatINR(order.finalQuoteAmount)}
                                </span>
                              </div>
                              {order.discountOfferedPct ? (
                                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                                  {order.discountOfferedPct}% स्पेशल छूट लागू
                                </span>
                              ) : null}
                            </div>
                          )}
                        </div>

                        {/* Customer Stated Requirement */}
                        {order.customerRequirement && (
                          <div className="p-2.5 rounded-xl bg-white border border-blue-200 text-xs">
                            <span className="text-[10px] font-black text-blue-900 uppercase block mb-0.5">
                              🎯 आपकी आवश्यकता / समस्या:
                            </span>
                            <p className="text-slate-800 font-medium">{order.customerRequirement}</p>
                          </div>
                        )}

                        {/* Admin / Lab Doubt Resolution & Technical Advice */}
                        {order.customerDoubtResolved && (
                          <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-300 text-xs space-y-1">
                            <span className="text-[10px] font-black text-teal-950 uppercase flex items-center gap-1">
                              <HelpCircle className="w-3.5 h-3.5 text-teal-700" />
                              <span>ओनर व सर्टिफाइड लैब रिस्पॉन्स (समाधान):</span>
                            </span>
                            <p className="text-teal-900 font-semibold leading-relaxed">
                              "{order.customerDoubtResolved}"
                            </p>
                          </div>
                        )}

                        {/* Verified Phone Photos Uploaded by Customer / Lab */}
                        {order.phonePhotos && order.phonePhotos.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-600 block">
                              📸 लैब द्वारा सत्यापित आपके फोन की तस्वीरें:
                            </span>
                            <div className="grid grid-cols-3 gap-2">
                              {order.phonePhotos.map((photo, pIdx) => (
                                <div
                                  key={pIdx}
                                  onClick={() => setPreviewPhotoUrl(photo)}
                                  className="relative rounded-xl overflow-hidden border border-slate-300 aspect-video bg-white cursor-pointer shadow-2xs hover:border-blue-500 transition-all group"
                                >
                                  <img src={photo} alt={`Device photo ${pIdx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                  <span className="absolute bottom-1 left-1 bg-black/75 text-white text-[8px] font-bold px-1 py-0.2 rounded">
                                    {pIdx === 0 ? 'डिस्प्ले' : pIdx === 1 ? 'कैमरा व बैक' : 'फ्रेम'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Dynamic Payment QR & Payout status */}
                        <div className="p-3 rounded-2xl bg-slate-900 text-white space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <QrCode className="w-4 h-4 text-amber-400" />
                              <span className="text-xs font-bold">सस्ताफोन पेमेंट स्कैनर:</span>
                            </div>
                            {order.paymentCollected ? (
                              <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>भुगतान प्राप्त (Paid Online)</span>
                              </span>
                            ) : (
                              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                                पहले पेमेंट, फिर फोन हैंडओवर
                              </span>
                            )}
                          </div>

                          {order.paymentCollected ? (
                            <p className="text-[11px] text-emerald-300">
                              ✓ भुगतान सफलता से सत्यापित हुआ। 6 महीने की वारंटी सक्रिय कर दी गई है।
                            </p>
                          ) : (
                            <div className="space-y-2 pt-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-300">
                                  देय राशि: <strong className="text-amber-400 font-mono text-sm">{formatINR(order.finalQuoteAmount || order.amount)}</strong>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setExpandedQrOrderId(expandedQrOrderId === order.id ? null : order.id)}
                                  className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] cursor-pointer transition-all"
                                >
                                  {expandedQrOrderId === order.id ? 'QR छुपाएं' : 'UPI QR कोड देखें'}
                                </button>
                              </div>

                              {expandedQrOrderId === order.id && (
                                <div className="p-3 rounded-xl bg-white text-slate-900 text-center space-y-2 animate-in fade-in">
                                  <div className="w-36 h-36 bg-slate-900 rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden mx-auto">
                                    <div className="w-full h-full bg-white rounded-lg p-1.5 flex flex-col justify-between">
                                      <div className="flex justify-between">
                                        <div className="w-6 h-6 bg-black rounded-xs flex items-center justify-center"><div className="w-2.5 h-2.5 bg-white" /></div>
                                        <div className="w-6 h-6 bg-black rounded-xs flex items-center justify-center"><div className="w-2.5 h-2.5 bg-white" /></div>
                                      </div>
                                      <div className="text-[8px] font-black text-slate-900 tracking-tighter text-center">
                                        Sastaphone Surat<br />
                                        <span className="text-blue-600 font-mono text-[9px]">₹{order.finalQuoteAmount || order.amount}</span>
                                      </div>
                                      <div className="flex justify-between items-end">
                                        <div className="w-6 h-6 bg-black rounded-xs flex items-center justify-center"><div className="w-2.5 h-2.5 bg-white" /></div>
                                        <div className="w-5 h-5 border-2 border-black flex items-center justify-center text-[7px] font-bold">UPI</div>
                                      </div>
                                    </div>
                                  </div>
                                  <p className="text-[10px] text-slate-600 font-bold">
                                    GPay / PhonePe / Paytm से स्कैन करके भुगतान करें
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-mono">
                                    UPI ID: 9372802044@okbizaxis
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions: Invoice / Appointment slip download & WhatsApp support */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => {
                            setSelectedInvoiceOrder(order);
                            setIsInvoiceModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>📄 इनवॉइस / रसीद डाउनलोड</span>
                        </button>

                        <button
                          onClick={() => {
                            setPrefillReviewOrder(order);
                            setIsReviewModalOpen(true);
                            setIsDashboardOpen(false);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                          <span>रिव्यू व स्टार दें</span>
                        </button>
                      </div>

                      {order.technicianName && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <span>
                            टेक्नीशियन: <strong>{order.technicianName}</strong>
                          </span>
                          <a
                            href={`https://wa.me/${WHATSAPP_NUMBER}?text=नमस्ते Sastaphone Surat! मुझे अपने ऑर्डर ${order.orderNumber} के बारे में जानकारी चाहिए।`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-700 font-bold flex items-center gap-1 hover:underline"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-4">
              {user.isLoggedIn ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-blue-900 uppercase">लॉगिन स्टेटस: सक्रिय (Active)</p>
                      {user.authProvider === 'google' ? (
                        <span className="text-[10px] font-black bg-white text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5">
                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                          </svg>
                          <span>Google Verified</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full">
                          📱 Mobile OTP Verified
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-300 shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-base font-black text-slate-900">{user.name}</p>
                        {user.email && (
                          <p className="text-xs text-blue-700 font-semibold">{user.email}</p>
                        )}
                        <p className="text-xs text-slate-600">📱 +91 {user.phone}</p>
                        <p className="text-xs text-slate-600">📍 {user.locality || selectedLocality}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-amber-900 uppercase">
                        सस्ता बाज़ार (P2P Mandi) बायर पास:
                      </p>
                      <span className="text-[11px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                        {buyerCredits} नंबर अनलॉक शेष
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                      <div className="bg-white p-2 rounded-xl border border-amber-200">
                        <span className="text-slate-500 block text-[10px]">सक्रिय बायर प्लान:</span>
                        <strong className="text-slate-900">
                          {buyerPlan === 'pro_299' ? 'प्रो पास (₹299)' : buyerPlan === 'basic_99' ? 'बेसिक पास (₹99)' : 'कोई सक्रिय पास नहीं'}
                        </strong>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-amber-200">
                        <span className="text-slate-500 block text-[10px]">अनलॉक किए गए सेलर:</span>
                        <strong className="text-emerald-700 font-bold">
                          {unlockedContactIds.length} सेलर नंबर
                        </strong>
                      </div>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      बायर पास द्वारा सूरत के किसी भी सेलर का 10-अंकीय नंबर अनलॉक करके डायरेक्ट कॉल या व्हाट्सएप कर सकते हैं।
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                    <p className="font-bold text-slate-800">100% सुरक्षित सस्ताफोन डिजिटल नेटवर्क:</p>
                    <p>आपका डेटा, ऑर्डर्स और अनलॉक पास Sastafone Surat (sastafone.in) द्वारा 256-बिट SSL एन्क्रिप्शन के साथ पूर्णतः सुरक्षित हैं।</p>
                  </div>

                  <button
                    onClick={logoutUser}
                    className="w-full py-2.5 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>लॉगआउट करें</span>
                  </button>
                </div>
              ) : (
                <div className="p-5 rounded-3xl border border-slate-200 bg-white space-y-4 shadow-sm">
                  <div className="text-center space-y-1">
                    <h4 className="font-black text-base text-slate-900">
                      {language === 'hi' ? 'सस्ताफोन में लॉगिन करें' : 'Sign in to Sastaphone'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {language === 'hi'
                        ? 'अपने ऑर्डर्स, विज़िट स्लिप्स और बायर पास एक्सेस करने के लिए लॉगिन करें'
                        : 'Sign in to access your orders, appointment slips, and unlock passes'}
                    </p>
                  </div>

                  {/* 1. Google Sign-in One-Click Button */}
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isGoogleSigningIn}
                      className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isGoogleSigningIn ? (
                        <>
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span>Google से कनेक्ट हो रहा है...</span>
                        </>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
                            <path
                              fill="#4285F4"
                              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                            />
                          </svg>
                          <span>Google से लॉगिन करें (Sign in with Google)</span>
                        </>
                      )}
                    </button>

                    <div className="relative flex py-1 items-center">
                      <div className="grow border-t border-slate-200"></div>
                      <span className="shrink mx-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        या मोबाइल नंबर OTP से लॉगिन करें
                      </span>
                      <div className="grow border-t border-slate-200"></div>
                    </div>
                  </div>

                  {!otpStep ? (
                    <form onSubmit={handleSimulateSendOtp} className="space-y-3">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">आपका नाम:</label>
                        <input
                          type="text"
                          required
                          value={nameInput}
                          onChange={e => setNameInput(e.target.value)}
                          placeholder="उदा. राहुल पटेल"
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">मोबाइल नंबर:</label>
                        <div className="flex">
                          <span className="p-2.5 bg-slate-200 text-xs font-bold rounded-l-xl border border-r-0 border-slate-200 text-slate-700">+91</span>
                          <input
                            type="tel"
                            required
                            maxLength={10}
                            value={phoneInput}
                            onChange={e => setPhoneInput(e.target.value)}
                            placeholder="98250 XXXXX"
                            className="w-full p-2.5 rounded-r-xl border border-slate-200 bg-white text-xs focus:outline-none focus:border-blue-600 font-bold"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all cursor-pointer"
                      >
                        OTP भेजें (Send OTP)
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-3">
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                        +91 {phoneInput} पर 4-अंकीय OTP भेजा गया है (डेमो कोड: <strong>1234</strong>)
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">OTP दर्ज करें:</label>
                        <input
                          type="text"
                          required
                          value={enteredOtp}
                          onChange={e => setEnteredOtp(e.target.value)}
                          placeholder="1234"
                          maxLength={6}
                          className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs tracking-widest text-center font-black focus:outline-none focus:border-blue-600 text-base"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer"
                      >
                        OTP सत्यापित करें व लॉगिन करें
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'surat' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Sastaphone सेवा केवल <strong>सूरत (Surat) और आसपास के क्षेत्रों</strong> के लिए एक्सक्लूसिव है। नीचे अपनी पसंदीदा लोकैलिटी तुरंत चुनें:
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SURAT_LOCALITIES.map(loc => {
                  const isCurrent = selectedLocality.includes(loc.name);
                  return (
                    <button
                      key={loc.id}
                      onClick={() => setSelectedLocality(`${loc.name}, Surat`)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>{loc.name}</span>
                        {isCurrent && <span>✓</span>}
                      </div>
                      <span className={`text-[10px] ${isCurrent ? 'text-blue-100' : 'text-slate-500'}`}>
                        {loc.hindiName} ({loc.pincode})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Photo Zoom Lightbox Preview for Customer */}
      {previewPhotoUrl && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewPhotoUrl(null)}
        >
          <div className="relative max-w-2xl w-full bg-slate-900 rounded-3xl p-3 border border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewPhotoUrl(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/80 hover:bg-black text-white flex items-center justify-center text-sm font-black shadow-md cursor-pointer"
            >
              ✕
            </button>
            <div className="rounded-2xl overflow-hidden bg-black max-h-[75vh] flex items-center justify-center">
              <img src={previewPhotoUrl} alt="Inspection zoom" className="w-full h-auto max-h-[75vh] object-contain" />
            </div>
            <div className="p-3 text-center">
              <p className="text-white font-bold text-xs">
                📸 आपके फोन का लैब वेरिफाइड फोटो
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                सस्ताफोन सूरत सर्टिफाइड हार्डवेयर लैब रिपोर्ट
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
