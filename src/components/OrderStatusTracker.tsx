import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Phone,
  Package,
  Clock,
  Check,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Calendar,
  MapPin,
  ShieldCheck,
  MessageCircle,
  RefreshCw,
  Wrench,
  QrCode,
  ArrowRight,
  History
} from 'lucide-react';
import { Job, JobStatus } from '../types';
import {
  fetchRepairJobsByPhoneFromFirestore,
  normalizeIndianPhone
} from '../services/firestoreRepairService';
import { DIRECT_UPI_ID } from '../services/paymentService';
import { buildWhatsappHref } from '../services/siteSettingsService';
import { useApp } from '../context/AppContext';
import { UpiPaymentModal } from './UpiPaymentModal';
import { trackEvent } from '../utils/analytics';

const LAST_TRACKED_PHONE_KEY = 'sastafone_last_track_phone';

const REPAIR_STAGES: { status: JobStatus; label: string; hindi: string; step: number }[] = [
  { status: 'Booked', label: 'Booked', hindi: 'बुक हुआ', step: 1 },
  { status: 'Pickup scheduled', label: 'Pickup Scheduled', hindi: 'पिकअप शेड्यूल', step: 2 },
  { status: 'Picked up', label: 'Picked Up', hindi: 'पिकअप हुआ', step: 3 },
  { status: 'Quote approved', label: 'Quote Approved', hindi: 'क्वोट स्वीकृत', step: 4 },
  { status: 'In repair', label: 'In Repair', hindi: 'रिपेयर चालू', step: 5 },
  { status: 'Ready', label: 'Ready', hindi: 'तैयार', step: 6 },
  { status: 'Delivered', label: 'Delivered', hindi: 'डिलीवर हुआ', step: 7 }
];

function getStageHindi(status: JobStatus | string): string {
  if (status === 'Cancelled') return 'रद्द (Cancelled)';
  if (status === 'Declined') return 'क्वोट अस्वीकृत (Declined)';
  return REPAIR_STAGES.find((s) => s.status === status)?.hindi || status;
}

function getStatusBadgeClasses(status: JobStatus): string {
  if (status === 'Delivered') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  if (status === 'Cancelled' || status === 'Declined') {
    return 'bg-rose-50 text-rose-700 border-rose-200';
  }
  if (status === 'In repair' || status === 'Ready') {
    return 'bg-amber-50 text-amber-800 border-amber-200';
  }
  return 'bg-[#FEF2F2] text-[#D5151B] border-red-200';
}

function formatDateTime(iso: string): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('hi-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return iso;
  }
}

export interface OrderStatusTrackerProps {
  compact?: boolean;
  initialPhone?: string;
  onBookNew?: () => void;
}

export const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({
  compact = false,
  initialPhone = '',
  onBookNew
}) => {
  const { siteSettings } = useApp();

  const [phoneInput, setPhoneInput] = useState<string>(() => {
    if (initialPhone) return normalizeIndianPhone(initialPhone);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlPhone = params.get('phone');
      if (urlPhone) return normalizeIndianPhone(urlPhone);
      const saved = sessionStorage.getItem(LAST_TRACKED_PHONE_KEY);
      if (saved) return normalizeIndianPhone(saved);
    }
    return '';
  });

  const [searchedPhone, setSearchedPhone] = useState<string>('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);
  const [upiPayJob, setUpiPayJob] = useState<Job | null>(null);

  const runLookup = async (rawPhone: string) => {
    const clean10 = normalizeIndianPhone(rawPhone);
    if (!/^[6-9]\d{9}$/.test(clean10)) {
      setValidationError('कृपया मान्य 10-अंकीय भारतीय मोबाइल नंबर दर्ज करें (जैसे 98XXXXXXXX)।');
      return;
    }

    setValidationError(null);
    setIsLoading(true);
    setSearchedPhone(clean10);

    try {
      sessionStorage.setItem(LAST_TRACKED_PHONE_KEY, clean10);
    } catch {
      // Ignore sessionStorage errors
    }

    trackEvent('order_status_lookup', { phone_last4: clean10.slice(-4) });

    try {
      const res = await fetchRepairJobsByPhoneFromFirestore(clean10);
      setJobs(res.jobs);
      setPermissionDenied(res.permissionDenied);
      setHasSearched(true);
    } catch {
      setJobs([]);
      setPermissionDenied(true);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-lookup if initialPhone or ?phone= param was provided
  useEffect(() => {
    if (initialPhone) {
      const clean = normalizeIndianPhone(initialPhone);
      if (/^[6-9]\d{9}$/.test(clean)) {
        runLookup(clean);
      }
    } else if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlPhone = params.get('phone');
      if (urlPhone) {
        const clean = normalizeIndianPhone(urlPhone);
        if (/^[6-9]\d{9}$/.test(clean)) {
          runLookup(clean);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPhone]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runLookup(phoneInput);
  };

  const whatsappLookupHref = useMemo(() => {
    const numText = searchedPhone || normalizeIndianPhone(phoneInput) || 'N/A';
    return buildWhatsappHref(
      siteSettings.whatsappNumber,
      `नमस्ते Sastafone Surat! कृपया मेरे मोबाइल नंबर (${numText}) से जुड़े रिपेयर ऑर्डर का लाइव स्टेटस बताएं।`
    );
  }, [searchedPhone, phoneInput, siteSettings.whatsappNumber]);

  return (
    <section
      aria-label="Phone Number Order Status Tracker"
      className={compact ? 'container mx-auto px-4 py-6 max-w-5xl' : 'container mx-auto px-4 py-8 max-w-3xl'}
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-xs p-5 sm:p-7 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF2F2] border border-red-200 text-[#D5151B] text-xs font-bold">
              <Package className="w-3.5 h-3.5" />
              <span>बिना लॉगिन लाइव ऑर्डर ट्रैकर</span>
            </span>
            <h2 className="text-lg sm:text-2xl font-bold text-[#132032] tracking-tight">
              मोबाइल नंबर से रिपेयर स्टेटस देखें
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              बुकिंग में दिया गया 10-अंकीय फोन नंबर डालें और अपने फोन के पिकअप, QC और रिपेयर की ताज़ा स्थिति देखें।
            </p>
          </div>

          {onBookNew && !compact && (
            <button
              type="button"
              onClick={onBookNew}
              className="px-4 py-2.5 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0 tap-target"
            >
              <Wrench className="w-4 h-4" />
              <span>नया रिपेयर बुक करें</span>
            </button>
          )}
        </div>

        {/* Phone Number Search Form */}
        <form onSubmit={handleSubmit} className="space-y-2.5">
          <label
            htmlFor="order-tracker-phone"
            className="block text-xs font-bold text-[#132032]"
          >
            पंजीकृत मोबाइल नंबर (10-Digit Mobile Number)
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1 flex items-center rounded-xl border border-gray-300 bg-white focus-within:border-[#D5151B] focus-within:ring-2 focus-within:ring-red-100 transition-all overflow-hidden">
              <span className="px-3 py-3 bg-gray-50 border-r border-gray-200 text-xs font-mono font-bold text-gray-600 flex items-center gap-1.5 shrink-0">
                <Phone className="w-3.5 h-3.5 text-[#D5151B]" />
                <span>+91</span>
              </span>
              <input
                id="order-tracker-phone"
                type="tel"
                inputMode="numeric"
                maxLength={13}
                value={phoneInput}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^\d+\s]/g, '');
                  setPhoneInput(cleaned);
                  if (validationError) setValidationError(null);
                }}
                placeholder="उदा. 9825012345"
                className="w-full px-3.5 py-3 text-sm font-mono font-bold text-[#132032] bg-transparent focus:outline-none placeholder:font-sans placeholder:font-normal placeholder:text-gray-400"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 shrink-0 tap-target"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>खोज रहे हैं...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>स्टेटस देखें (Track Order)</span>
                </>
              )}
            </button>
          </div>

          {validationError && (
            <p className="text-xs font-semibold text-rose-600 flex items-center gap-1.5 pt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{validationError}</span>
            </p>
          )}
        </form>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 space-y-3 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-32" />
              <div className="h-5 bg-red-100 rounded-full w-24" />
            </div>
            <div className="h-3 bg-gray-200 rounded w-2/3" />
            <div className="h-10 bg-gray-200 rounded-xl w-full" />
          </div>
        )}

        {/* Results */}
        {!isLoading && hasSearched && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between gap-2 text-xs text-gray-600">
              <span>
                मोबाइल नंबर <strong className="font-mono text-[#132032]">+91 {searchedPhone}</strong> के लिए परिणाम ({jobs.length})
              </span>
              <button
                type="button"
                onClick={() => runLookup(searchedPhone)}
                className="inline-flex items-center gap-1 font-bold text-[#D5151B] hover:underline cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>रीफ्रेश करें</span>
              </button>
            </div>

            {jobs.length === 0 ? (
              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#FEF2F2] text-[#D5151B] flex items-center justify-center mx-auto">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#132032]">
                    {permissionDenied
                      ? 'ऑनलाइन डेटाबेस तक पहुँच सीमित है — WhatsApp से तुरंत स्टेटस पाएं'
                      : `+91 ${searchedPhone} पर कोई सक्रिय रिपेयर ऑर्डर नहीं मिला`}
                  </h3>
                  <p className="text-xs text-gray-600 max-w-md mx-auto mt-1 leading-relaxed">
                    {permissionDenied
                      ? 'सुरक्षा नियमों के कारण इस नंबर का लाइव रिकॉर्ड सीधे WhatsApp टीम द्वारा कन्फर्म किया जाता है। नीचे बटन दबाकर तुरंत अपडेट पाएं।'
                      : 'कृपया जांच लें कि आपने बुकिंग वाला ही मोबाइल नंबर डाला है, या नीचे WhatsApp पर तुरंत अपना लाइव स्टेटस पूछें।'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
                  <a
                    href={whatsappLookupHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp पर स्टेटस पूछें</span>
                  </a>

                  {onBookNew && (
                    <button
                      type="button"
                      onClick={onBookNew}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>नया रिपेयर बुक करें (₹199)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => {
                  const stageIdx = REPAIR_STAGES.findIndex((s) => s.status === job.status);
                  const isCancelledOrDeclined = job.status === 'Cancelled' || job.status === 'Declined';
                  const hasFinalQuote = typeof job.finalPrice === 'number' && job.finalPrice > 0;
                  const balancePayable = hasFinalQuote
                    ? Math.max(0, (job.finalPrice || 0) - (job.visitFeePaid ? 199 : 0))
                    : null;

                  const jobWhatsappHref = buildWhatsappHref(
                    siteSettings.whatsappNumber,
                    `नमस्ते Sastafone Surat! मुझे मेरे ऑर्डर #${job.jobId} का लाइव अपडेट चाहिए।\n• नाम: ${job.name}\n• मोबाइल: ${job.phone}\n• डिवाइस: ${job.brand} ${job.model}\n• वर्तमान स्थिति: ${getStageHindi(job.status)}`
                  );

                  return (
                    <div
                      key={job.jobId}
                      className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-2xs space-y-4"
                    >
                      {/* Job Top Row */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-gray-100 pb-3.5">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-mono font-bold text-[#D5151B] bg-[#FEF2F2] px-2.5 py-0.5 rounded-full border border-red-200">
                              #{job.jobId}
                            </span>
                            {job.createdAt && (
                              <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatDateTime(job.createdAt)}</span>
                              </span>
                            )}
                          </div>

                          <h3 className="text-base sm:text-lg font-bold text-[#132032]">
                            {job.brand} {job.model}
                          </h3>

                          {job.services && job.services.length > 0 && (
                            <p className="text-xs text-gray-600 flex items-start gap-1.5">
                              <Smartphone className="w-3.5 h-3.5 text-[#D5151B] shrink-0 mt-0.5" />
                              <span>{job.services.join(', ')}</span>
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <span
                            className={`px-3 py-1 rounded-full border text-xs font-bold ${getStatusBadgeClasses(
                              job.status
                            )}`}
                          >
                            {getStageHindi(job.status)}
                          </span>
                        </div>
                      </div>

                      {/* 7-Step Visual Repair Progress Bar */}
                      {!isCancelledOrDeclined ? (
                        <div className="py-1 overflow-x-auto">
                          <div className="flex items-start justify-between min-w-[520px] relative px-2">
                            <div className="absolute left-6 right-6 top-3.5 h-0.5 bg-gray-200">
                              <div
                                className="h-full bg-[#D5151B] transition-all duration-300"
                                style={{
                                  width: `${
                                    (Math.max(0, stageIdx) / (REPAIR_STAGES.length - 1)) * 100
                                  }%`
                                }}
                              />
                            </div>

                            {REPAIR_STAGES.map((stage, idx) => {
                              const isDone = stageIdx >= 0 && idx <= stageIdx;
                              const isCurrent = idx === stageIdx;

                              return (
                                <div
                                  key={stage.status}
                                  className="flex flex-col items-center text-center z-10 w-16"
                                >
                                  <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                      isCurrent
                                        ? 'bg-[#D5151B] text-white ring-4 ring-red-100 scale-110'
                                        : isDone
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-white border-2 border-gray-300 text-gray-400'
                                    }`}
                                  >
                                    {isDone && !isCurrent ? (
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    ) : (
                                      stage.step
                                    )}
                                  </div>
                                  <span
                                    className={`text-[10px] font-bold mt-1.5 leading-tight ${
                                      isCurrent
                                        ? 'text-[#D5151B]'
                                        : isDone
                                        ? 'text-[#132032]'
                                        : 'text-gray-400'
                                    }`}
                                  >
                                    {stage.hindi}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>
                            यह ऑर्डर {job.status === 'Declined' ? 'अस्वीकृत' : 'रद्द'} हो गया है। आपका फोन सुरक्षित वापस किया जा रहा है।
                          </span>
                        </div>
                      )}

                      {/* Slot, Area & Pricing Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/80 space-y-0.5">
                          <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#D5151B]" />
                            <span>पिकअप स्लॉट</span>
                          </span>
                          <p className="font-bold text-[#132032]">
                            {job.pickupSlot?.date || 'Scheduled'} ({job.pickupSlot?.window || 'Doorstep'})
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/80 space-y-0.5">
                          <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#D5151B]" />
                            <span>सूरत क्षेत्र</span>
                          </span>
                          <p className="font-bold text-[#132032] truncate">
                            {job.area || job.pickupSlot?.area || 'Surat'}
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-[#FEF2F2] border border-red-200 space-y-0.5">
                          <span className="text-[11px] font-bold text-[#D5151B]">
                            {hasFinalQuote ? 'फाइनल क्वोट / देय' : 'अनुमानित कीमत'}
                          </span>
                          <p className="font-bold text-[#132032] tabular-nums">
                            {hasFinalQuote
                              ? `₹${job.finalPrice}${
                                  balancePayable !== null && job.visitFeePaid
                                    ? ` (शेष ₹${balancePayable})`
                                    : ''
                                }`
                              : `₹${job.estMin} – ₹${job.estMax}`}
                          </p>
                        </div>
                      </div>

                      {/* Visit Token / Warranty Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold border ${
                              job.visitFeePaid
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {job.visitFeePaid ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>₹199 विज़िट टोकन वेरिफाइड</span>
                              </>
                            ) : (
                              <>
                                <QrCode className="w-3.5 h-3.5" />
                                <span>₹199 टोकन पेमेंट लंबित ({DIRECT_UPI_ID})</span>
                              </>
                            )}
                          </span>

                          {(job.warrantyMonths || (job.finalPrice || job.estMax) >= 1000) && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-50 text-[#132032] border border-gray-200 font-bold">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{job.warrantyMonths || 6} माह वारंटी</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Status History Log */}
                      {job.statusHistory && job.statusHistory.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200/80 space-y-2">
                          <h4 className="text-[11px] font-bold text-[#132032] uppercase tracking-wider flex items-center gap-1.5">
                            <History className="w-3.5 h-3.5 text-[#D5151B]" />
                            <span>स्टेटस इतिहास (Status History)</span>
                          </h4>
                          <div className="space-y-2">
                            {job.statusHistory
                              .slice()
                              .reverse()
                              .map((entry, hIdx) => (
                                <div
                                  key={`${job.jobId}-h-${hIdx}`}
                                  className="flex items-start gap-2.5 text-xs"
                                >
                                  <span
                                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                      hIdx === 0 ? 'bg-[#D5151B]' : 'bg-gray-400'
                                    }`}
                                  />
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center justify-between gap-1">
                                      <span className="font-bold text-[#132032]">
                                        {getStageHindi(entry.status)}
                                      </span>
                                      <span className="text-[11px] text-gray-500">
                                        {formatDateTime(entry.timestamp)}
                                      </span>
                                    </div>
                                    {entry.note && (
                                      <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                                        {entry.note}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Action Footer: Direct UPI ₹199 Modal (if pending) + WhatsApp Live Update */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                        {!job.visitFeePaid && !isCancelledOrDeclined && (
                          <button
                            type="button"
                            onClick={() => setUpiPayJob(job)}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <QrCode className="w-4 h-4" />
                            <span>₹199 Direct UPI पेमेंट करें</span>
                          </button>
                        )}

                        <a
                          href={jobWhatsappHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>WhatsApp पर लाइव अपडेट पूछें</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reusable Direct UPI Payment Modal for pending ₹199 tokens */}
      <UpiPaymentModal
        isOpen={Boolean(upiPayJob)}
        onClose={() => setUpiPayJob(null)}
        amount={199}
        referenceId={upiPayJob?.jobId}
        title="₹199 विज़िट टोकन पेमेंट कन्फर्म करें"
        subtitle={`डायरेक्ट UPI (${DIRECT_UPI_ID}) पर भुगतान कर WhatsApp पर स्क्रीनशॉट भेजें`}
        serviceLabel="डोरस्टेप मोबाइल रिपेयर"
        deviceModel={upiPayJob ? `${upiPayJob.brand} ${upiPayJob.model}` : undefined}
        problemsLabel={upiPayJob?.services?.join(', ')}
        slotLabel={
          upiPayJob
            ? `${upiPayJob.pickupSlot?.date || ''} (${upiPayJob.pickupSlot?.window || ''}) • ${upiPayJob.area}`
            : undefined
        }
        customerName={upiPayJob?.name}
        customerPhone={upiPayJob?.phone}
        customerAddress={upiPayJob?.address}
        whatsappNumber={siteSettings.whatsappNumber}
      />
    </section>
  );
};
