import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  CreditCard,
  Clock,
  AlertCircle,
  MessageCircle,
  RefreshCw
} from 'lucide-react';
import { buildPaymentLinkUrl } from '../services/web3formsService';
import { buildWhatsappHref } from '../services/siteSettingsService';

interface PaymentLinkQrCardProps {
  referenceId: string;
  amount?: number;
  serviceLabel: string;
  deviceModel: string;
  problemsLabel: string;
  dynamicPricingLabel: string;
  slotLabel: string;
  whatsappNumber: string;
  isProcessingRazorpay?: boolean;
  onPayViaRazorpay?: () => void;
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
  whatsappNumber,
  isProcessingRazorpay = false,
  onPayViaRazorpay,
  title = 'विज़िट कन्फर्म करने के लिए पेमेंट लिंक व QR कोड'
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const paymentUrl = buildPaymentLinkUrl(referenceId, amount);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(paymentUrl, {
      width: 220,
      margin: 2,
      color: {
        dark: '#132032',
        light: '#FFFFFF'
      }
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl('');
      });

    return () => {
      active = false;
    };
  }, [paymentUrl]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(paymentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const whatsappPaymentShare = buildWhatsappHref(
    whatsappNumber,
    `नमस्ते Sastafone Surat! मैंने बुकिंग/इंक्वायरी सबमिट की है।\nRef ID: ${referenceId}\nसर्विस: ${serviceLabel}\nमॉडल: ${deviceModel}\nसमस्या: ${problemsLabel}\nअनुमानित कीमत: ${dynamicPricingLabel}\nस्लॉट: ${slotLabel}\n₹${amount} विज़िट टोकन पेमेंट लिंक: ${paymentUrl}`
  );

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-[#D5151B]/30 shadow-xs space-y-4 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#D5151B] text-[11px] font-bold border border-red-200 mb-1">
            <Clock className="w-3 h-3" />
            <span>पेमेंट पुष्टि लंबित (Visit Hold)</span>
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
          <strong>महत्वपूर्ण:</strong> आपकी जानकारी Web3Forms द्वारा सफलतापूर्वक प्राप्त हो गई है। <strong>टेक्नीशियन का दौरा केवल ₹{amount} पेमेंट की पुष्टि के बाद ही सुनिश्चित होगा।</strong>
        </span>
      </div>

      {/* Summary & Scannable QR Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {/* Generated QR Code */}
        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 border border-gray-200 text-center space-y-2">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`Sastafone ₹${amount} Payment QR Code`}
              className="w-44 h-44 rounded-xl bg-white p-2 border border-gray-200"
            />
          ) : (
            <div className="w-44 h-44 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
              <QrCode className="w-16 h-16 text-[#132032] opacity-40" />
            </div>
          )}
          <span className="text-[11px] font-bold text-[#132032]">
            ₹{amount} टोकन पेमेंट QR स्कैन करें
          </span>
          <span className="text-[10px] text-gray-500">
            Razorpay / UPI • फाइनल बिल में 100% एडजस्टेड
          </span>
        </div>

        {/* Captured Order Summary + Link Controls */}
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

          {/* Direct Payment Link Copy Box */}
          <div className="flex items-center gap-1.5 p-2 rounded-xl bg-gray-50 border border-gray-200">
            <input
              type="text"
              readOnly
              value={paymentUrl}
              aria-label="Payment Link"
              className="flex-1 bg-transparent text-[11px] font-mono text-gray-700 outline-none truncate"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-[#132032] text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'कॉपी हुआ' : 'कॉपी'}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 px-3 rounded-xl bg-[#132032] hover:bg-black text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>पेमेंट लिंक खोलें (₹{amount})</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href={whatsappPaymentShare}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Primary Verified Razorpay Confirmation Action */}
      {onPayViaRazorpay && (
        <div className="pt-2 border-t border-gray-100">
          <button
            type="button"
            disabled={isProcessingRazorpay}
            onClick={onPayViaRazorpay}
            className="w-full py-3.5 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 tap-target disabled:opacity-70"
          >
            {isProcessingRazorpay ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Razorpay पेमेंट सत्यापित हो रहा है...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>अभी ₹{amount} पेमेंट कन्फर्म करें व टेक्नीशियन विज़िट पक्का करें</span>
              </>
            )}
          </button>
          <p className="text-[11px] text-gray-500 text-center mt-2 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>पेमेंट सत्यापन पूरा होते ही आपका पिकअप स्लॉट ऑटोमैटिक कन्फर्म हो जाएगा।</span>
          </p>
        </div>
      )}
    </div>
  );
};
