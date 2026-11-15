import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Job, JobStatus, InvoiceRecord } from '../types';
import {
  subscribeToCustomerJobs,
  customerApproveQuoteInFirestore,
  customerDeclineQuoteInFirestore,
  submitReviewToFirestore
} from '../services/firestoreRepairService';
import { db } from '../firebase';
import {
  doc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { trackEvent } from '../utils/analytics';
import {
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Phone,
  MessageCircle,
  ChevronRight,
  Sparkles,
  Smartphone,
  Lock,
  ThumbsUp,
  ThumbsDown,
  Wrench,
  Check,
  Star,
  Users,
  FileText,
  Printer
} from 'lucide-react';
import confetti from 'canvas-confetti';

const TIMELINE_STAGES: { status: JobStatus; label: string; hindi: string; icon: string }[] = [
  { status: 'Booked', label: 'Booked', hindi: 'बुक हुआ', icon: '1' },
  { status: 'Pickup scheduled', label: 'Pickup Scheduled', hindi: 'पिकअप शेड्यूल', icon: '2' },
  { status: 'Picked up', label: 'Picked Up', hindi: 'पिकअप हुआ', icon: '3' },
  { status: 'Quote approved', label: 'Quote Approved', hindi: 'क्वोट स्वीकृत', icon: '4' },
  { status: 'In repair', label: 'In Repair', hindi: 'रिपेयर चालू', icon: '5' },
  { status: 'Ready', label: 'Ready', hindi: 'तैयार', icon: '6' },
  { status: 'Delivered', label: 'Delivered', hindi: 'डिलीवर हुआ', icon: '7' }
];

interface MyOrdersTimelineProps {
  onBookNew?: () => void;
}

export const MyOrdersTimeline: React.FC<MyOrdersTimelineProps> = ({ onBookNew }) => {
  const { user, setIsAuthModalOpen, setIsInvoiceModalOpen, setSelectedInvoiceOrder, siteSettings } = useApp();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Referral Discount State
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [referralCount, setReferralCount] = useState<2 | 3>(2);
  const [contacts, setContacts] = useState<{ name: string; phone: string }[]>([
    { name: '', phone: '' },
    { name: '', phone: '' },
    { name: '', phone: '' }
  ]);
  const [referralConsent, setReferralConsent] = useState(false);
  const [referralError, setReferralError] = useState<string | null>(null);
  const [referralAppliedSuccess, setReferralAppliedSuccess] = useState<string | null>(null);

  // Review Form State (Post-Delivery)
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState<Record<string, boolean>>({});

  const [invoicesByJobId, setInvoicesByJobId] = useState<Record<string, InvoiceRecord>>({});

  useEffect(() => {
    if (!user.isLoggedIn || !user.uid) {
      setJobs([]);
      setInvoicesByJobId({});
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribeJobs = subscribeToCustomerJobs(user.uid, (updatedJobs) => {
      setJobs(updatedJobs);
      setIsLoading(false);
      if (updatedJobs.length > 0 && !activeJobId) {
        setActiveJobId(updatedJobs[0].jobId);
      }
    });

    const invQuery = query(collection(db, 'invoices'), where('userId', '==', user.uid));
    const unsubscribeInvoices = onSnapshot(
      invQuery,
      (snap) => {
        const map: Record<string, InvoiceRecord> = {};
        const docs = snap.docs
          .map((d) => ({ ...(d.data() as InvoiceRecord), id: d.id }))
          .filter((inv) => inv.status !== 'voided')
          .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        docs.forEach((inv) => {
          if (inv.jobId && !map[inv.jobId]) {
            map[inv.jobId] = inv;
          }
        });
        setInvoicesByJobId(map);
      },
      () => {
        // Ignore if index or empty
      }
    );

    return () => {
      unsubscribeJobs();
      unsubscribeInvoices();
    };
  }, [user.uid, user.isLoggedIn]);

  if (!user.isLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xs border border-gray-200 space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-50 text-[#D5151B] flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#132032]">
              अपने रिपेयर ऑर्डर्स देखने के लिए लॉगिन करें
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              लाइव स्टेटस ट्रैकिंग, इनवॉइस डाउनलोड व क्वोट अप्रूवल हेतु लॉगिन अनिवार्य है।
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full py-3.5 rounded-2xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <span>लॉगिन करें</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Handle Approve Quote
  const handleApprove = async (jobId: string) => {
    setActionInProgress(jobId);
    try {
      await customerApproveQuoteInFirestore(jobId);
      trackEvent('quote_approved', { job_id: jobId });
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      alert('क्वोट स्वीकार करने में समस्या आई। कृपया पुनः प्रयास करें।');
    } finally {
      setActionInProgress(null);
    }
  };

  // Handle Decline Quote
  const handleDecline = async (jobId: string) => {
    if (!confirm('क्या आप सचमुच यह क्वोट अस्वीकार करना चाहते हैं? आपका ₹99 रिफंड किया जाएगा और ₹100 विज़िट चार्ज कटेगा।')) {
      return;
    }
    setActionInProgress(jobId);
    try {
      await customerDeclineQuoteInFirestore(jobId);
      trackEvent('quote_declined', { job_id: jobId });
    } catch (err) {
      alert('क्वोट अस्वीकार करने में समस्या आई।');
    } finally {
      setActionInProgress(null);
    }
  };

  // Apply Referral Discount
  const handleApplyReferral = async (job: Job) => {
    setReferralError(null);
    setReferralAppliedSuccess(null);

    const neededContacts = contacts.slice(0, referralCount);

    // 1. Check all names and phones are filled
    for (let i = 0; i < neededContacts.length; i++) {
      const c = neededContacts[i];
      if (!c.name.trim() || !c.phone.trim()) {
        setReferralError(`कृपया संपर्क #${i + 1} का पूरा नाम और मोबाइल नंबर दर्ज करें।`);
        return;
      }
      const cleanP = c.phone.replace(/\D/g, '');
      if (!/^[6-9]\d{9}$/.test(cleanP)) {
        setReferralError(`संपर्क #${i + 1} का मोबाइल नंबर अमान्य है। कृपया 10 अंकों का वैध भारतीय नंबर दें।`);
        return;
      }
      if (cleanP === user.phone || cleanP === job.phone) {
        setReferralError('आप अपना स्वयं का नंबर रेफरल में नहीं दे सकते।');
        return;
      }
    }

    // 2. Check duplicates among contacts
    const phoneList = neededContacts.map((c) => c.phone.replace(/\D/g, ''));
    if (new Set(phoneList).size !== phoneList.length) {
      setReferralError('कृपया अलग-अलग व्यक्तियों के संपर्क नंबर दर्ज करें।');
      return;
    }

    if (!referralConsent) {
      setReferralError('कृपया नियम व शर्तों की सहमति पर टिक करें।');
      return;
    }

    const discountAmount = referralCount === 3 ? 300 : 200;
    const currentFinal = job.finalPrice || job.estMax || 1000;

    // Minimum admin margin check (e.g. at least ₹500 final bill)
    if (currentFinal - discountAmount < 500) {
      setReferralError('इस ऑर्डर पर न्यूनतम बिल सीमा के कारण अतिरिक्त रेफरल डिस्काउंट लागू नहीं हो सकता।');
      return;
    }

    try {
      // 1. Save to 'referrals' collection
      await addDoc(collection(db, 'referrals'), {
        jobId: job.jobId,
        referrerUserId: user.uid,
        referrerName: user.name || job.name,
        referrerPhone: user.phone || job.phone,
        contacts: neededContacts,
        discountAmount,
        status: 'applied',
        createdAt: new Date().toISOString(),
        timestamp: serverTimestamp()
      });

      // 2. Update job finalPrice
      const newFinalPrice = Math.max(0, currentFinal - discountAmount);
      const jobRef = doc(db, 'jobs', job.jobId);
      await updateDoc(jobRef, {
        finalPrice: newFinalPrice,
        referralDiscountApplied: discountAmount,
        updatedAt: new Date().toISOString()
      });

      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
      setReferralAppliedSuccess(`✓ ₹${discountAmount} की रेफरल छूट सफलतापूर्वक लागू हो गई है! नया बिल: ₹${newFinalPrice}`);
      setIsReferralOpen(false);
    } catch (err: any) {
      setReferralError('रेफरल डिस्काउंट दर्ज करने में समस्या आई।');
    }
  };

  // Submit Post-Delivery Review
  const handleSubmitJobReview = async (job: Job) => {
    if (!reviewText.trim()) {
      alert('कृपया अपना अनुभव अवश्य लिखें।');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await submitReviewToFirestore({
        jobId: job.jobId,
        userId: user.uid,
        customerName: user.name || job.name,
        phone: user.phone || job.phone,
        rating: reviewRating,
        reviewText: reviewText.trim(),
        serviceType: 'repair',
        phoneModel: `${job.brand} ${job.model}`,
        area: job.area
      });

      trackEvent('review_submitted', { job_id: job.jobId, rating: reviewRating });
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setReviewSubmitted((prev) => ({ ...prev, [job.jobId]: true }));
      setReviewText('');
    } catch (err: any) {
      alert('रिव्यू सबमिट करने में समस्या आई।');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF2F2] border border-red-200 text-[#D5151B] text-xs font-bold mb-1">
            <Package className="w-3.5 h-3.5" />
            <span>लाइव ऑन-स्नैपशॉट ट्रैकिंग</span>
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#132032]">
            मेरे रिपेयर ऑर्डर्स (My Orders)
          </h1>
          <p className="text-xs text-gray-500">
            सूरत में आपके फोन पिकअप, QC निरीक्षण व डिलीवरी की लाइव स्थिति।
          </p>
        </div>

        {onBookNew && (
          <button
            type="button"
            onClick={onBookNew}
            className="px-4 py-2.5 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer tap-target self-start sm:self-auto"
          >
            <Wrench className="w-4 h-4" />
            <span>नया रिपेयर बुक करें</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 shadow-xs">
          <Clock className="w-8 h-8 text-[#D5151B] animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-500 font-medium">ऑर्डर्स लोड हो रहे हैं...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <Package className="w-12 h-12 text-gray-300 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-[#132032]">
              कोई सक्रिय रिपेयर ऑर्डर नहीं है
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              जब आप सूरत में किसी फोन की रिपेयरिंग बुक करेंगे, तो उसकी लाइव स्थिति यहाँ दिखेगी।
            </p>
          </div>

          {onBookNew && (
            <button
              type="button"
              onClick={onBookNew}
              className="px-6 py-3 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              रिपेयरिंग बुक करें (₹199 विज़िट टोकन)
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {jobs.map((job) => {
            const currentStageIdx = TIMELINE_STAGES.findIndex((s) => s.status === job.status);
            const isQuotePendingApproval = job.status === 'Picked up' && !job.customerApproved && job.finalPrice !== undefined;
            const isDelivered = job.status === 'Delivered';

            return (
              <div
                key={job.jobId}
                className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-gray-200/90 space-y-5"
              >
                {/* Top Job Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#D5151B] bg-[#FEF2F2] px-2.5 py-0.5 rounded-full border border-red-200">
                        #{job.jobId}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(job.createdAt).toLocaleDateString('hi-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-[#132032]">
                      {job.brand} {job.model}
                    </h2>

                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <Smartphone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{job.services.join(', ')}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                      {TIMELINE_STAGES.find((s) => s.status === job.status)?.hindi || job.status}
                    </span>

                    {/* View Invoice button */}
                    <button
                      type="button"
                      onClick={() => {
                        const inv = invoicesByJobId[job.jobId];
                        setSelectedInvoiceOrder({
                          id: job.jobId,
                          orderNumber: inv?.invoiceNumber || job.invoiceNumber || job.jobId,
                          invoiceNumber: inv?.invoiceNumber || job.invoiceNumber,
                          type: 'repair',
                          title: `${job.brand} ${job.model}`,
                          subtitle: inv
                            ? inv.services.map((s) => s.name).join(', ')
                            : (job.finalServices && job.finalServices.length > 0
                                ? job.finalServices
                                : job.services
                              ).join(', '),
                          amount: inv ? inv.finalTotal : job.finalPrice || job.estMax || 199,
                          date: inv?.date || new Date(job.createdAt).toLocaleDateString('hi-IN'),
                          timeSlot: `${job.pickupSlot?.date || ''} (${job.pickupSlot?.window || ''})`,
                          status: job.status === 'Delivered' ? 'completed' : 'in_progress',
                          statusHindi: job.status,
                          locality: inv?.area || job.area,
                          customerName: inv?.customerName || job.name,
                          customerPhone: inv?.customerPhone || job.phone,
                          fullAddress: inv?.customerAddress || job.address,
                          paymentMethod: inv?.paymentMethod || 'Razorpay UPI',
                          imei: inv?.imei || job.qc?.imei,
                          invoiceServices: inv?.services,
                          invoiceParts: inv?.parts,
                          subtotalAmount: inv?.subtotal,
                          discountAmount: inv?.discountAmount,
                          discountPct: inv?.discountPct || job.discountPct,
                          discountReason: inv?.discountReason || job.discountReason,
                          visitFeeAdjusted: inv?.visitFeeAdjusted ?? (job.visitFeePaid ? 199 : 0),
                          gstEnabled: inv?.gstEnabled,
                          gstPct: inv?.gstPct,
                          gstAmount: inv?.gstAmount,
                          gstin: inv?.gstin,
                          warrantyMonths: inv?.warrantyMonths ?? job.warrantyMonths
                        });
                        setIsInvoiceModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>इनवॉइस</span>
                    </button>
                  </div>
                </div>

                {/* Status Timeline Bar */}
                {job.status !== 'Cancelled' && job.status !== 'Declined' ? (
                  <div className="py-2 overflow-x-auto">
                    <div className="flex items-center justify-between min-w-[540px] relative px-4">
                      {/* Line */}
                      <div className="absolute left-6 right-6 top-4 h-0.5 bg-gray-200 -z-0">
                        <div
                          className="h-full bg-[#D5151B] transition-all duration-300"
                          style={{
                            width: `${(Math.max(0, currentStageIdx) / (TIMELINE_STAGES.length - 1)) * 100}%`
                          }}
                        />
                      </div>

                      {TIMELINE_STAGES.map((stage, idx) => {
                        const isDone = idx <= currentStageIdx;
                        const isCurrent = idx === currentStageIdx;

                        return (
                          <div key={stage.status} className="flex flex-col items-center text-center z-10 w-14">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isCurrent
                                  ? 'bg-[#D5151B] text-white ring-4 ring-red-100 scale-110'
                                  : isDone
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white border-2 border-gray-300 text-gray-400'
                              }`}
                            >
                              {isDone && !isCurrent ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : stage.icon}
                            </div>
                            <span
                              className={`text-[10px] font-bold mt-1.5 leading-tight ${
                                isCurrent ? 'text-[#D5151B]' : isDone ? 'text-gray-800' : 'text-gray-400'
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
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>ऑर्डर रद्द हुआ। फोन सुरक्षित वापस किया जा रहा है।</span>
                  </div>
                )}

                {/* Final Quote & Referral Box (Light Theme) */}
                {job.finalPrice !== undefined && (
                  <div className="p-5 rounded-2xl bg-[#FEF2F2] border border-red-200 text-[#132032] space-y-4">
                    <div className="flex items-center justify-between border-b border-red-200/80 pb-2">
                      <span className="text-xs font-bold text-red-700">
                        निरीक्षण बाद फाइनल क्वोट (Final Quote)
                      </span>
                      <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4" />
                        <span>6 महीने वारंटी (₹1000+ बिल पर)</span>
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-gray-600">
                        <span>रिपेयरिंग पार्ट्स व सर्विस:</span>
                        <span className="font-bold text-[#132032]">₹{job.finalPrice}</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-600">
                        <span>विज़िट टोकन छूट (Adjusted Token):</span>
                        <span className="text-emerald-700 font-bold">-₹199</span>
                      </div>
                      <div className="flex items-center justify-between text-sm sm:text-base font-bold text-[#132032] pt-2 border-t border-red-200">
                        <span>फाइनल देय राशि (Balance to Pay):</span>
                        <span className="text-xl font-bold text-[#D5151B]">
                          ₹{Math.max(0, job.finalPrice - (job.visitFeePaid ? 199 : 0))}
                        </span>
                      </div>
                    </div>

                    {/* Section I: Referral Discount Box */}
                    {isQuotePendingApproval && (
                      <div className="pt-2 border-t border-red-200 space-y-3">
                        {referralAppliedSuccess && (
                          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                            {referralAppliedSuccess}
                          </div>
                        )}

                        {!referralAppliedSuccess && (
                          <div>
                            <button
                              type="button"
                              onClick={() => setIsReferralOpen(!isReferralOpen)}
                              className="text-xs font-bold text-[#D5151B] hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Users className="w-3.5 h-3.5" />
                              <span>
                                {isReferralOpen ? 'रेफरल फॉर्म बंद करें' : '🎁 दोस्तों को रेफर करें व ₹200-₹300 की छूट पाएं!'}
                              </span>
                            </button>

                            {isReferralOpen && (
                              <div className="mt-3 p-4 rounded-xl bg-white border border-red-200 space-y-3">
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setReferralCount(2)}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                                      referralCount === 2 ? 'bg-[#D5151B] text-white' : 'bg-gray-100 text-gray-700'
                                    }`}
                                  >
                                    2 दोस्त (₹200 छूट)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setReferralCount(3)}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                                      referralCount === 3 ? 'bg-[#D5151B] text-white' : 'bg-gray-100 text-gray-700'
                                    }`}
                                  >
                                    3 दोस्त (₹300 छूट)
                                  </button>
                                </div>

                                <div className="space-y-2">
                                  {[...Array(referralCount)].map((_, idx) => (
                                    <div key={idx} className="grid grid-cols-2 gap-2">
                                      <input
                                        type="text"
                                        placeholder={`दोस्त #${idx + 1} का नाम`}
                                        value={contacts[idx].name}
                                        onChange={(e) => {
                                          const next = [...contacts];
                                          next[idx].name = e.target.value;
                                          setContacts(next);
                                        }}
                                        className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-red-500"
                                      />
                                      <input
                                        type="tel"
                                        placeholder="10-अंकीय मोबाइल"
                                        value={contacts[idx].phone}
                                        onChange={(e) => {
                                          const next = [...contacts];
                                          next[idx].phone = e.target.value;
                                          setContacts(next);
                                        }}
                                        className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-mono outline-none focus:border-red-500"
                                        maxLength={10}
                                      />
                                    </div>
                                  ))}
                                </div>

                                <label className="flex items-center gap-2 text-[11px] text-gray-600 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={referralConsent}
                                    onChange={(e) => setReferralConsent(e.target.checked)}
                                    className="accent-[#D5151B]"
                                  />
                                  <span>मैं पुष्टि करता हूँ कि ये वास्तविक संपर्क हैं और मेरी अनुमति से जोड़े गए हैं।</span>
                                </label>

                                {referralError && (
                                  <p className="text-[11px] text-red-600 font-semibold">{referralError}</p>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleApplyReferral(job)}
                                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                                >
                                  छूट लागू करें (Apply ₹{referralCount === 3 ? 300 : 200} Off)
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Customer Quote Approval Buttons */}
                        <div className="grid grid-cols-2 gap-2.5 pt-2">
                          <button
                            type="button"
                            disabled={actionInProgress === job.jobId}
                            onClick={() => handleApprove(job.jobId)}
                            className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer tap-target disabled:opacity-50"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            <span>क्वोट स्वीकार करें (Approve)</span>
                          </button>

                          <button
                            type="button"
                            disabled={actionInProgress === job.jobId}
                            onClick={() => handleDecline(job.jobId)}
                            className="py-3 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer tap-target disabled:opacity-50"
                          >
                            <ThumbsDown className="w-4 h-4" />
                            <span>अस्वीकार करें (Decline)</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Section J: Post-Delivery Review Box */}
                {isDelivered && (
                  <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                    <h3 className="text-xs font-bold text-[#132032] flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                      <span>आपकी राय हमारे लिए महत्वपूर्ण है (Rate Your Repair)</span>
                    </h3>

                    {reviewSubmitted[job.jobId] ? (
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>धन्यवाद! आपकी समीक्षा सफलतापूर्वक सबमिट हो गई है।</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="p-1 cursor-pointer"
                            >
                              <Star
                                className={`w-6 h-6 ${
                                  star <= reviewRating
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>

                        <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="रिपेयरिंग की गति, गुणवत्ता व टेक्नीशियन के व्यवहार के बारे में बताएं..."
                          rows={2}
                          className="w-full p-2.5 rounded-xl border border-gray-200 text-xs bg-white outline-none focus:border-red-500"
                        />

                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            type="button"
                            disabled={isSubmittingReview}
                            onClick={() => handleSubmitJobReview(job)}
                            className="flex-1 py-2 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-xs cursor-pointer disabled:opacity-50"
                          >
                            {isSubmittingReview ? 'सबमिट हो रहा है...' : 'समीक्षा सबमिट करें'}
                          </button>

                          {siteSettings.googleReviewUrl ? (
                            <a
                              href={siteSettings.googleReviewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => trackEvent('google_review_click', { location: 'my_orders' })}
                              className="py-2 px-3 rounded-xl border border-gray-300 hover:bg-gray-100 text-[#132032] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer text-center"
                            >
                              <span>Review us on Google</span>
                            </a>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
