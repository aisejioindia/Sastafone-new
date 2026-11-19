import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  AlertCircle,
  MessageCircle,
  Smartphone,
  RefreshCw,
  Maximize2
} from 'lucide-react';
import { DIRECT_UPI_ID, buildUpiPaymentUri } from '../services/paymentService';
import { buildWhatsappHref } from '../services/siteSettingsService';
import { UpiPaymentModal } from './UpiPaymentModal';

interface PaymentLinkQrCardProps {
  referenceId: string;
  amount?: number;
  serviceLabel: string;
  deviceModel: string;
  problemsLabel: string;
  dynamicPricingLabel: string;
  slotLabel: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  whatsappNumber: string;
  isConfirming?: boolean;
  onConfirmWhatsapp?: (utrNumber: string) => void;
  title?: string;
}

export const PaymentLinkQrCard: React.FC<PaymentLinkQrCardProps> = ({
  referenceId,
  amount = 199,
  serviceLabel,
  deviceModel,
  problemsLabel,
  dynamicPricingLabel,
  slotLabel,
  customerName,
  customerPhone,
  customerAddress,
  whatsappNumber,
  isConfirming = false,
  onConfirmWhatsapp,
  title = `डायरेक्ट UPI पेमेंट (₹${amount}) व WhatsApp कन्फर्मेशन`
}) => {
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const upiUri = buildUpiPaymentUri(referenceId, amount, `Sastafone ${referenceId}`);

  const handleCopyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(DIRECT_UPI_ID);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    } catch {
      setCopiedUpi(false);
    }
  };

  const whatsappMessage = [
    `नमस्ते Sastafone Surat! मैं ₹${amount} UPI टोकन पेमेंट के साथ अपनी बुकिंग कन्फर्म कर रहा/रही हूँ:`,
    `• Ref ID: #${referenceId}`,
    customerName ? `• नाम: ${customerName}` : null,
    customerPhone ? `• मोबाइल: ${customerPhone}` : null,
    `• सर्विस: ${serviceLabel}`,
    `• मॉडल: ${deviceModel}`,
    `• समस्या: ${problemsLabel}`,
    `• अनुमानित कीमत: ${dynamicPricingLabel}`,
    `• पिकअप स्लॉट: ${slotLabel}`,
    customerAddress ? `• पता: ${customerAddress}` : null,
    `• UPI ID: ${DIRECT_UPI_ID}`,
    `• पेमेंट राशि: ₹${amount}`,
    utrNumber.trim() ? `• UPI Ref / UTR: ${utrNumber.trim()}` : '• कृपया मेरा पेमेंट स्क्रीनशॉट देखें'
  ]
    .filter(Boolean)
    .join('\n');

  const whatsappConfirmHref = buildWhatsappHref(whatsappNumber, whatsappMessage);

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-[#D5151B]/30 shadow-xs space-y-4 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#D5151B] text-[11px] font-bold border border-red-200 mb-1">
            <Clock className="w-3 h-3" />
            <span>डायरेक्ट UPI पेमेंट + WhatsApp कन्फर्मेशन</span>
          </span>
          <h4 className="text-base font-bold text-[#132032]">{title}</h4>
        </div>
        <span className="font-mono text-xs font-bold text-[#D5151B] bg-[#FEF2F2] px-3 py-1 rounded-lg border border-red-200 self-start sm:self-auto">
          #{referenceId}
        </span>
      </div>

      {/* Policy Warning Notice */}
      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2 leading-relaxed">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          <strong>महत्वपूर्ण:</strong> नीचे दिए गए QR कोड को स्कैन करें या UPI ID <strong>{DIRECT_UPI_ID}</strong> पर <strong>₹{amount}</strong> भेजकर WhatsApp पर स्क्रीनशॉट/UTR शेयर करें। <strong>टेक्नीशियन का दौरा केवल ₹{amount} पेमेंट की पुष्टि के बाद ही सुनिश्चित होगा।</strong>
        </span>
      </div>

      {/* Summary & Scannable UPI QR Grid (powered by qrcode.react) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {/* Generated Direct UPI QR Code */}
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 border border-gray-200 text-center space-y-2">
          <div className="p-2.5 rounded-xl bg-white border border-gray-200">
            <QRCodeSVG
              value={upiUri}
              size={172}
              level="M"
              fgColor="#132032"
              bgColor="#FFFFFF"
              includeMargin={false}
            />
          </div>
          <span className="text-xs font-bold text-[#132032]">
            ₹{amount} स्कैन कर पे करें
          </span>
          <span className="text-[11px] font-mono font-bold text-[#D5151B] bg-white px-2.5 py-1 rounded-lg border border-red-200">
            {DIRECT_UPI_ID}
          </span>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-[11px] font-bold text-[#132032] hover:text-[#D5151B] inline-flex items-center gap-1 cursor-pointer pt-0.5"
          >
            <Maximize2 className="w-3 h-3" />
            <span>बड़ा UPI पेमेंट पॉपअप खोलें</span>
          </button>
        </div>

        {/* Order Summary + Direct UPI Copy / Deep Link */}
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5">
            <div className="flex justify-between gap-2">
              <span className="text-gray-500">सर्विस:</span>
              <span className="font-bold text-[#132032] text-right">{serviceLabel}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-gray-500">मॉडल:</span>
              <span className="font-bold text-[#132032] text-right">{deviceModel}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-gray-500">समस्या:</span>
              <span className="font-bold text-[#132032] text-right line-clamp-2">{problemsLabel}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-gray-500">डायनेमिक कीमत:</span>
              <span className="font-bold text-[#D5151B] text-right tabular-nums">{dynamicPricingLabel}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-gray-500">पिकअप स्लॉट:</span>
              <span className="font-bold text-[#132032] text-right">{slotLabel}</span>
            </div>
          </div>

          {/* Copy Direct UPI ID */}
          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-gray-50 border border-gray-200">
            <input
              type="text"
              readOnly
              value={DIRECT_UPI_ID}
              aria-label="Direct UPI ID"
              className="flex-1 bg-transparent text-xs font-mono font-bold text-[#132032] outline-none truncate"
            />
            <button
              type="button"
              onClick={handleCopyUpiId}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-[#132032] text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer shrink-0"
            >
              {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUpi ? 'कॉपी हुआ' : 'UPI कॉपी'}</span>
            </button>
          </div>

          {/* Direct UPI App Launch */}
          <a
            href={upiUri}
            className="w-full py-2.5 px-3 rounded-xl bg-[#132032] hover:bg-black text-white font-bold text-xs inline-flex items-center justify-center gap-2 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>UPI ऐप से ₹{amount} पे करें (GPay / PhonePe)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Optional UTR input */}
          <div>
            <label className="text-[10px] font-bold text-gray-600 block mb-1">
              पेमेंट के बाद UPI Ref / UTR नंबर दर्ज करें (वैकल्पिक):
            </label>
            <input
              type="text"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              placeholder="उदा. 432198765432 (12-अंकों का UTR)"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono text-[#132032] focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* Primary WhatsApp Confirmation Action */}
      <div className="pt-2 border-t border-gray-100 space-y-2">
        {onConfirmWhatsapp ? (
          <button
            type="button"
            disabled={isConfirming}
            onClick={() => onConfirmWhatsapp(utrNumber.trim())}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 tap-target disabled:opacity-70"
          >
            {isConfirming ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>WhatsApp पर कन्फर्म हो रहा है...</span>
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4" />
                <span>पेमेंट कर दिया? WhatsApp पर बुकिंग कन्फर्म करें</span>
              </>
            )}
          </button>
        ) : (
          <a
            href={whatsappConfirmHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 tap-target"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp पर ₹{amount} पेमेंट स्क्रीनशॉट व बुकिंग भेजें</span>
          </a>
        )}
        <p className="text-[11px] text-gray-500 text-center flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>कोई लॉगिन या पासवर्ड की जरूरत नहीं — सारा अपडेट सीधे आपके WhatsApp पर मिलेगा।</span>
        </p>
      </div>

      {/* Reusable Fullscreen UPI Payment Modal */}
      <UpiPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        amount={amount}
        referenceId={referenceId}
        title={title}
        serviceLabel={serviceLabel}
        deviceModel={deviceModel}
        problemsLabel={problemsLabel}
        dynamicPricingLabel={dynamicPricingLabel}
        slotLabel={slotLabel}
        customerName={customerName}
        customerPhone={customerPhone}
        customerAddress={customerAddress}
        whatsappNumber={whatsappNumber}
        isSubmitting={isConfirming}
        onConfirmPayment={
          onConfirmWhatsapp
            ? async (modalUtr) => {
                await onConfirmWhatsapp(modalUtr || utrNumber.trim());
                setIsModalOpen(false);
              }
            : undefined
        }
      />
    </div>
  );
};
