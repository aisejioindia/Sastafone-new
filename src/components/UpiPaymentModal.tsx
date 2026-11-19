import React, { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  QrCode
} from 'lucide-react';
import { DIRECT_UPI_ID, buildUpiPaymentUri } from '../services/paymentService';
import { buildWhatsappHref, DEFAULT_SITE_SETTINGS } from '../services/siteSettingsService';
import { trackEvent } from '../utils/analytics';

export interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  referenceId?: string;
  title?: string;
  subtitle?: string;
  serviceLabel?: string;
  deviceModel?: string;
  problemsLabel?: string;
  dynamicPricingLabel?: string;
  slotLabel?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  whatsappNumber?: string;
  isSubmitting?: boolean;
  onConfirmPayment?: (utrNumber: string) => void | Promise<void>;
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  referenceId,
  title = 'तुरंत UPI पेमेंट कन्फर्मेशन',
  subtitle = 'स्कैन करें या सीधे UPI ID पर भुगतान कर WhatsApp पर कन्फर्म करें',
  serviceLabel,
  deviceModel,
  problemsLabel,
  dynamicPricingLabel,
  slotLabel,
  customerName,
  customerPhone,
  customerAddress,
  whatsappNumber = DEFAULT_SITE_SETTINGS.whatsappNumber,
  isSubmitting = false,
  onConfirmPayment
}) => {
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [confirmedLocal, setConfirmedLocal] = useState(false);

  const resolvedRef = useMemo(
    () => referenceId || `SST-${Date.now().toString().slice(-6)}`,
    [referenceId]
  );

  const upiUri = useMemo(
    () => buildUpiPaymentUri(resolvedRef, amount, `Sastafone ${resolvedRef}`),
    [resolvedRef, amount]
  );

  const whatsappConfirmHref = useMemo(() => {
    const lines = [
      `नमस्ते Sastafone Support Team! *Payment Confirmed* ✅ — कृपया मेरा ₹${amount} UPI पेमेंट वेरिफाई कर ऑर्डर कन्फर्म करें:`,
      ``,
      `*ऑर्डर विवरण (Order Details):*`,
      `• Order / Ref ID: #${resolvedRef}`,
      customerName ? `• ग्राहक का नाम: ${customerName}` : null,
      customerPhone ? `• मोबाइल नंबर: ${customerPhone}` : null,
      serviceLabel ? `• सेवा (Service): ${serviceLabel}` : null,
      deviceModel ? `• डिवाइस मॉडल: ${deviceModel}` : null,
      problemsLabel ? `• समस्या / विवरण: ${problemsLabel}` : null,
      dynamicPricingLabel ? `• अनुमानित मूल्य: ${dynamicPricingLabel}` : null,
      slotLabel ? `• स्लॉट / लोकेशन: ${slotLabel}` : null,
      customerAddress ? `• पिकअप पता: ${customerAddress}` : null,
      ``,
      `*पेमेंट पुष्टि अनुरोध (Payment Confirmation Request):*`,
      `• भुगतान की गई राशि: ₹${amount}`,
      `• प्राप्तकर्ता UPI ID: ${DIRECT_UPI_ID}`,
      utrNumber.trim()
        ? `• UPI Ref / UTR नंबर: ${utrNumber.trim()}`
        : `• पेमेंट स्क्रीनशॉट इस चैट में संलग्न कर रहा/रही हूँ`,
      `• अनुरोध: कृपया पेमेंट कन्फर्म कर टेक्नीशियन विज़िट / बुकिंग शेड्यूल करें।`
    ]
      .filter((line): line is string => line !== null)
      .join('\n');

    return buildWhatsappHref(whatsappNumber, lines);
  }, [
    amount,
    resolvedRef,
    customerName,
    customerPhone,
    serviceLabel,
    deviceModel,
    problemsLabel,
    dynamicPricingLabel,
    slotLabel,
    customerAddress,
    utrNumber,
    whatsappNumber
  ]);

  if (!isOpen) return null;

  const handleCopyUpi = async () => {
    try {
      await navigator.clipboard.writeText(DIRECT_UPI_ID);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    } catch {
      setCopiedUpi(false);
    }
  };

  const handleConfirmClick = async () => {
    if (onConfirmPayment) {
      await onConfirmPayment(utrNumber.trim());
    }
    setConfirmedLocal(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upi-payment-modal-title"
    >
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-200 p-5 sm:p-6 space-y-4 step-transition relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FEF2F2] border border-red-200 text-[#D5151B] text-[11px] font-bold">
              <QrCode className="w-3 h-3" />
              <span>Direct UPI Checkout • ₹{amount}</span>
            </span>
            <h3
              id="upi-payment-modal-title"
              className="text-lg font-bold text-[#132032] leading-snug"
            >
              {title}
            </h3>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close UPI Payment Modal"
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center shrink-0 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Policy Alert */}
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>नियम:</strong> टेक्नीशियन का दौरा केवल <strong className="font-mono">{DIRECT_UPI_ID}</strong> पर <strong>₹{amount}</strong> पेमेंट की पुष्टि के बाद ही सुनिश्चित होगा।
          </span>
        </div>

        {/* Dynamic QR Code via qrcode.react */}
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2.5">
          <div className="p-3 rounded-2xl bg-white border border-gray-200 shadow-2xs">
            <QRCodeSVG
              value={upiUri}
              size={196}
              level="M"
              fgColor="#132032"
              bgColor="#FFFFFF"
              includeMargin={false}
            />
          </div>

          <div className="text-center space-y-1">
            <p className="text-sm font-bold text-[#132032] tabular-nums">
              देय राशि: <span className="text-[#D5151B]">₹{amount}</span>
            </p>
            <p className="text-[11px] text-gray-500">
              GPay • PhonePe • Paytm • BHIM • Any UPI App
            </p>
          </div>

          {/* Static UPI ID Display + One-Tap Copy */}
          <div className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white border border-red-200">
            <div className="min-w-0 text-left">
              <span className="text-[10px] font-bold text-gray-400 block uppercase">
                आधिकारिक UPI ID
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-[#D5151B] select-all truncate block">
                {DIRECT_UPI_ID}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyUpi}
              className="px-3 py-1.5 rounded-lg bg-[#FEF2F2] hover:bg-red-100 border border-red-200 text-[#D5151B] text-xs font-bold inline-flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
            >
              {copiedUpi ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">कॉपी हुआ</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>कॉपी करें</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Summary Snapshot when provided */}
        {(deviceModel || serviceLabel || slotLabel) && (
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1">
            <div className="flex justify-between gap-2">
              <span className="text-gray-500">Ref ID:</span>
              <span className="font-mono font-bold text-[#D5151B]">#{resolvedRef}</span>
            </div>
            {serviceLabel && (
              <div className="flex justify-between gap-2">
                <span className="text-gray-500">सर्विस:</span>
                <span className="font-bold text-[#132032] text-right">{serviceLabel}</span>
              </div>
            )}
            {deviceModel && (
              <div className="flex justify-between gap-2">
                <span className="text-gray-500">मॉडल:</span>
                <span className="font-bold text-[#132032] text-right">{deviceModel}</span>
              </div>
            )}
            {dynamicPricingLabel && (
              <div className="flex justify-between gap-2">
                <span className="text-gray-500">अनुमानित मूल्य:</span>
                <span className="font-bold text-[#D5151B] text-right tabular-nums">{dynamicPricingLabel}</span>
              </div>
            )}
            {slotLabel && (
              <div className="flex justify-between gap-2">
                <span className="text-gray-500">स्लॉट:</span>
                <span className="font-bold text-[#132032] text-right">{slotLabel}</span>
              </div>
            )}
          </div>
        )}

        {/* Direct UPI App Launch Link */}
        <a
          href={upiUri}
          className="w-full py-2.5 px-4 rounded-xl bg-[#132032] hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <Smartphone className="w-4 h-4" />
          <span>मोबाइल UPI ऐप से ₹{amount} पे करें</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Optional UTR Input for Instant Verification */}
        <div>
          <label className="block text-[11px] font-bold text-gray-700 mb-1">
            UPI Ref / UTR नंबर दर्ज करें (वैकल्पिक, तेज़ पुष्टि के लिए):
          </label>
          <input
            type="text"
            value={utrNumber}
            onChange={(e) => setUtrNumber(e.target.value)}
            placeholder="उदा. 432198765432 (12-अंकों का UTR)"
            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-mono text-[#132032] focus:outline-none focus:border-emerald-600"
          />
        </div>

        {/* Instant Confirmation Buttons */}
        {confirmedLocal && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>रिकॉर्ड अपडेट हो गया! कृपया नीचे WhatsApp पर स्क्रीनशॉट भेजकर स्लॉट लॉक करें।</span>
          </div>
        )}

        <div className="space-y-2.5 pt-1">
          <a
            href={whatsappConfirmHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Payment Confirmed - Send pre-filled WhatsApp confirmation request to Sastafone support"
            onClick={() => {
              trackEvent('whatsapp_click', {
                source: 'upi_payment_modal_confirmed',
                reference_id: resolvedRef,
                amount
              });
              setConfirmedLocal(true);
              if (onConfirmPayment) {
                void Promise.resolve(onConfirmPayment(utrNumber.trim())).catch(() => {});
              }
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors tap-target"
          >
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span>Payment Confirmed (WhatsApp पर पुष्टि भेजें)</span>
          </a>

          {onConfirmPayment && (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmClick}
              className="w-full py-3 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-60 tap-target"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>पुष्टि दर्ज हो रही है...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>₹{amount} पेमेंट हो गया — वेबसाइट पर बुकिंग सेव करें</span>
                </>
              )}
            </button>
          )}
        </div>

        <p className="text-[11px] text-gray-500 text-center flex items-center justify-center gap-1 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>₹199 विज़िट टोकन फाइनल रिपेयर बिल में 100% एडजस्ट होता है।</span>
        </p>
      </div>
    </div>
  );
};
