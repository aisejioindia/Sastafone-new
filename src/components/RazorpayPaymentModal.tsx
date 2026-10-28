/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  RAZORPAY_PAYMENT_LINK,
  PAYMENT_TIERS,
  openRazorpayPaymentLink,
  createPaymentOrderItem
} from '../services/paymentService';
import { formatINR } from '../utils/valuation';
import {
  ShieldCheck,
  Lock,
  ExternalLink,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  X,
  CreditCard,
  QrCode,
  FileText,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const RazorpayPaymentModal: React.FC = () => {
  const {
    isPaymentModalOpen,
    closePaymentModal,
    paymentModalRequest,
    user,
    addOrder,
    unlockContactWithCredit,
    buyBuyerPass,
    buySellerPostPass,
    setIsInvoiceModalOpen,
    setSelectedInvoiceOrder,
    setIsDashboardOpen
  } = useApp();

  const [enteredUtr, setEnteredUtr] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<import('../types').OrderItem | null>(null);
  const [hasOpenedRazorpay, setHasOpenedRazorpay] = useState(false);

  if (!isPaymentModalOpen || !paymentModalRequest) {
    return null;
  }

  const tier = PAYMENT_TIERS[paymentModalRequest.type] || PAYMENT_TIERS.basic_99;
  const amount = paymentModalRequest.amount || tier.amount;

  const handlePayOnRazorpay = () => {
    setHasOpenedRazorpay(true);
    openRazorpayPaymentLink(RAZORPAY_PAYMENT_LINK);
  };

  const handleConfirmPayment = () => {
    setIsVerifying(true);

    setTimeout(() => {
      // 1. Create order record
      const order = createPaymentOrderItem(
        paymentModalRequest,
        user,
        enteredUtr.trim() || undefined
      );
      addOrder(order);

      // 2. Perform functional entitlement updates
      if (paymentModalRequest.type === 'appointment_199') {
        // Handled via order creation (technician_assigned, visitCharge 199, status 'paid')
      } else if (paymentModalRequest.type === 'basic_99') {
        // If triggered from a specific listing, unlock that seller contact directly
        if (paymentModalRequest.targetListingId) {
          buyBuyerPass('basic_99');
          unlockContactWithCredit(paymentModalRequest.targetListingId);
        } else {
          // Regular basic pass or seller post
          buyBuyerPass('basic_99');
          buySellerPostPass('single_99');
        }
      } else if (paymentModalRequest.type === 'pro_299') {
        buyBuyerPass('pro_299');
        if (paymentModalRequest.targetListingId) {
          unlockContactWithCredit(paymentModalRequest.targetListingId);
        }
      } else if (paymentModalRequest.type === 'seller_pro_799') {
        buySellerPostPass('pro_799');
      }

      // 3. Trigger celebration
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.55 }
      });

      setIsVerifying(false);
      setIsSuccess(true);
      setConfirmedOrder(order);
    }, 900);
  };

  const handleOpenInvoice = () => {
    if (confirmedOrder) {
      setSelectedInvoiceOrder(confirmedOrder);
      closePaymentModal();
      setIsInvoiceModalOpen(true);
    }
  };

  const handleGoToDashboard = () => {
    closePaymentModal();
    setIsDashboardOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-wide">SASTAPHONE PAY</span>
                <span className="text-[10px] bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 px-1.5 py-0.5 rounded font-mono font-bold">
                  256-BIT SSL
                </span>
              </div>
              <p className="text-[11px] text-blue-100">सुरक्षित डिजिटल भुगतान गेटवे • Sastaphone Surat Official</p>
            </div>
          </div>

          <button
            onClick={closePaymentModal}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {!isSuccess ? (
            <>
              {/* Product Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/60 border border-blue-100">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white uppercase tracking-wider mb-1.5">
                      {tier.badge}
                    </span>
                    <h3 className="font-black text-slate-900 text-base sm:text-lg leading-snug">
                      {paymentModalRequest.titleHindi || tier.titleHindi}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      {paymentModalRequest.descriptionHindi || tier.descriptionHindi}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">देय राशि</span>
                    <span className="text-2xl sm:text-3xl font-black text-blue-700 tracking-tight">
                      {formatINR(amount)}
                    </span>
                  </div>
                </div>

                {/* Specific context detail */}
                {paymentModalRequest.targetSellerName && (
                  <div className="mt-3 pt-3 border-t border-blue-200/60 flex items-center justify-between text-xs text-slate-700">
                    <span className="font-medium">सेलर: <strong>{paymentModalRequest.targetSellerName}</strong></span>
                    <span className="text-emerald-700 font-bold">✓ भुगतान बाद नंबर तुरंत दिखेगा</span>
                  </div>
                )}

                {paymentModalRequest.repairDetails && (
                  <div className="mt-3 pt-3 border-t border-blue-200/60 text-xs space-y-1 text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">डिवाइस:</span>
                      <strong className="text-slate-900">{paymentModalRequest.repairDetails.modelName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">समस्या:</span>
                      <strong className="text-blue-700">{paymentModalRequest.repairDetails.issueName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">विज़िट स्लॉट:</span>
                      <strong className="text-amber-800">{paymentModalRequest.repairDetails.timeSlot}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Benefits list */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>शामिल सुविधाएं व गारंटी (Included Benefits):</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {tier.benefits.map((b, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-medium text-[11px]">{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Refund Guarantee Badge */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block">सस्ताफोन व ऑलइंडिया भरोसा गारंटी</strong>
                  <span className="text-[11px] text-amber-800 leading-relaxed">
                    {paymentModalRequest.refundNote || tier.refundPolicyHindi}
                  </span>
                </div>
              </div>

              {/* Action 1: Razorpay Payment Link Button */}
              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  onClick={handlePayOnRazorpay}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-blue-500/25 transition-all transform active:scale-[0.99] cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-amber-300" />
                  <span>Razorpay पर सुरक्षित भुगतान करें ({formatINR(amount)})</span>
                  <ExternalLink className="w-4 h-4 text-blue-200 ml-1" />
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>Razorpay सुरक्षित लिंक:</span>
                  <a
                    href={RAZORPAY_PAYMENT_LINK}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline font-mono font-medium truncate max-w-[200px]"
                  >
                    rzp.io/rzp/7i9TRrRg
                  </a>
                </div>
              </div>

              {/* Action 2: Verification / Activation Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    भुगतान पुष्टि व तत्काल सक्रियण (Instant Activation)
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    ऑटो-सिंक
                  </span>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={enteredUtr}
                    onChange={e => setEnteredUtr(e.target.value)}
                    placeholder="UPI Ref / UTR / Order ID (वैकल्पिक)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                  <p className="text-[10px] text-slate-500">
                    * भुगतान पूर्ण होने के बाद तुरंत एक्टिवेट करने के लिए नीचे दिए गए बटन पर क्लिक करें।
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={isVerifying}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>पुष्टि की जा रही है (Verifying Gateway)...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      <span>✓ मैंने भुगतान कर दिया है / तुरंत एक्टिवेट करें</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Success View */
            <div className="py-6 px-2 text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                  भुगतान सफलतापूर्वक सत्यापित • PAID
                </span>
                <h3 className="font-black text-slate-900 text-xl sm:text-2xl mt-2">
                  {formatINR(amount)} का भुगतान सफल!
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                  {paymentModalRequest.type === 'appointment_199'
                    ? 'आपकी घर पर रिपेयर अपॉइंटमेंट बुक हो गई है और ऑलइंडिया टेक्नीशियन असाइन कर दिया गया है।'
                    : 'आपके पास और संपर्क अनलॉक क्रेडिट सक्रिय हो चुके हैं। अब आप सीधे सेलर से संपर्क कर सकते हैं।'}
                </p>
              </div>

              {confirmedOrder && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left max-w-md mx-auto text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">ऑर्डर संख्या (Order ID):</span>
                    <strong className="font-mono text-slate-900">{confirmedOrder.orderNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">भुगतान तरीका:</span>
                    <span className="font-medium text-emerald-700">Razorpay Sastaphone Pay</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">स्थिति:</span>
                    <span className="font-bold text-blue-700">{confirmedOrder.statusHindi}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleOpenInvoice}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <FileText className="w-4 h-4 text-blue-200" />
                  <span>आधिकारिक रसीद व इनवॉइस देखें</span>
                </button>

                <button
                  type="button"
                  onClick={handleGoToDashboard}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>डैशबोर्ड खोलें</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
