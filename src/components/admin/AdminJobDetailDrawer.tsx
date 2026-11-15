import React, { useMemo, useState } from 'react';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import {
  AdminSettings,
  InvoiceRecord,
  Job,
  JobHandoverRecord,
  JobStatus,
  Partner,
  RealCustomerReview,
  RepairPrice
} from '../../types';
import {
  ADMIN_WHATSAPP_TEMPLATES,
  generateInvoiceForJob,
  recordAuditLog,
  syncPartnerJobProjection
} from '../../services/adminService';
import { uploadImageToStorage } from '../../utils/storageUpload';
import {
  X,
  Phone,
  MessageCircle,
  Clock,
  ShieldCheck,
  UserCheck,
  Calendar,
  Wrench,
  Percent,
  RotateCcw,
  Ban,
  FileText,
  Save,
  Camera,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Star
} from 'lucide-react';

interface AdminJobDetailDrawerProps {
  job: Job;
  partners: Partner[];
  repairPrices: RepairPrice[];
  handovers: JobHandoverRecord[];
  invoices: InvoiceRecord[];
  reviews: RealCustomerReview[];
  adminSettings: AdminSettings;
  googleReviewUrl: string;
  onClose: () => void;
  onOpenQC: (job: Job) => void;
}

const JOB_STATUSES: JobStatus[] = [
  'Booked',
  'Pickup scheduled',
  'Picked up',
  'Quote approved',
  'In repair',
  'Ready',
  'Delivered',
  'Cancelled',
  'Declined'
];

export const AdminJobDetailDrawer: React.FC<AdminJobDetailDrawerProps> = ({
  job,
  partners,
  repairPrices,
  handovers,
  invoices,
  reviews,
  adminSettings,
  googleReviewUrl,
  onClose,
  onOpenQC
}) => {
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Reschedule state
  const [reschedDate, setReschedDate] = useState(job.pickupSlot?.date || '');
  const [reschedWindow, setReschedWindow] = useState(
    job.pickupSlot?.window || '10:00 AM - 01:00 PM (Morning Slot)'
  );

  // Add/Remove services & Discount (12-15% configurable rule)
  const [selectedServiceNames, setSelectedServiceNames] = useState<string[]>(
    job.finalServices && job.finalServices.length > 0 ? job.finalServices : job.services || []
  );
  const [discountPct, setDiscountPct] = useState<number>(
    job.discountPct ?? job.qc?.discountPct ?? adminSettings.discountMinPct ?? 12
  );
  const [discountReason, setDiscountReason] = useState<string>(
    job.discountReason || job.qc?.discountReason || ''
  );

  // Refund & Cancel
  const [refundAmount, setRefundAmount] = useState<number>(99);
  const [refundReason, setRefundReason] = useState<string>('');
  const [cancelReason, setCancelReason] = useState<string>('');
  const [internalNotes, setInternalNotes] = useState<string>(job.internalNotes || '');

  // Sealed Bag Handover inline
  const [sealedBagId, setSealedBagId] = useState<string>(`BAG-${job.jobId.slice(-4)}`);
  const [handoverImei, setHandoverImei] = useState<string>(job.qc?.imei || '');
  const [isUploadingAdminFile, setIsUploadingAdminFile] = useState(false);

  // Selected WhatsApp template
  const [waTemplateId, setWaTemplateId] = useState(ADMIN_WHATSAPP_TEMPLATES[0].id);

  const assignedPartner = partners.find((p) => p.id === job.partnerId);
  const jobHandovers = useMemo(
    () => handovers.filter((h) => h.jobId === job.jobId),
    [handovers, job.jobId]
  );
  const activeInvoice = useMemo(
    () =>
      invoices.find((i) => i.id === job.invoiceId) ||
      invoices.find((i) => i.jobId === job.jobId && i.status !== 'voided'),
    [invoices, job.invoiceId, job.jobId]
  );
  const customerReview = useMemo(
    () => reviews.find((r) => r.jobId === job.jobId),
    [reviews, job.jobId]
  );

  const cleanPhone = (job.phone || '').replace(/\D/g, '').slice(-10);

  // Recompute sum of high prices from matched repairPrices
  const matchedPricesSum = useMemo(() => {
    let total = 0;
    selectedServiceNames.forEach((srvName) => {
      const match = repairPrices.find(
        (p) =>
          p.name_hi === srvName ||
          p.id === srvName ||
          srvName.toLowerCase().includes(p.id.toLowerCase())
      );
      if (match) total += Number(match.maxPrice || 0);
    });
    return total > 0 ? total : Number(job.estMax || job.finalPrice || 1000);
  }, [selectedServiceNames, repairPrices, job.estMax, job.finalPrice]);

  const computedDiscountedFinal = Math.max(
    adminSettings.minOrderAmountAfterDiscount || 0,
    Math.round(matchedPricesSum * (1 - discountPct / 100))
  );

  const updateJob = async (
    updates: Record<string, any>,
    auditAction: string,
    reason?: string
  ) => {
    setBusyAction(auditAction);
    setFeedback(null);
    const now = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'jobs', job.jobId), {
        ...updates,
        updatedAt: now
      });
      await recordAuditLog({
        action: auditAction,
        targetType: 'job',
        targetId: job.jobId,
        reason,
        after: updates
      });
      setFeedback('✓ बदलाव सफलतापूर्वक सेव हो गए।');
    } catch (err: any) {
      setFeedback(err?.message || 'अपडेट करने में त्रुटि हुई।');
    } finally {
      setBusyAction(null);
    }
  };

  const handleAssignPartner = async (partnerId: string) => {
    const partner = partners.find((p) => p.id === partnerId);
    const now = new Date().toISOString();
    const nextHistory = [
      ...(job.statusHistory || []),
      {
        status: partnerId ? 'Pickup scheduled' : job.status,
        timestamp: now,
        note: partner ? `पार्टनर असाइन: ${partner.name}` : 'पार्टनर असाइनमेंट हटाया गया'
      }
    ];
    await updateJob(
      {
        partnerId: partnerId || '',
        status: partnerId && job.status === 'Booked' ? 'Pickup scheduled' : job.status,
        statusHistory: nextHistory
      },
      'job_partner_assigned',
      partner ? `Assigned ${partner.name}` : 'Unassigned partner'
    );
    if (partnerId) {
      await syncPartnerJobProjection(job, partnerId);
    }
  };

  const handleStatusChange = async (nextStatus: JobStatus) => {
    const now = new Date().toISOString();
    const nextHistory = [
      ...(job.statusHistory || []),
      {
        status: nextStatus,
        timestamp: now,
        note: `Admin status update: ${nextStatus}`
      }
    ];
    await updateJob(
      {
        status: nextStatus,
        statusHistory: nextHistory,
        ...(nextStatus === 'Delivered' ? { deliveredAt: now } : {})
      },
      'job_status_changed',
      `${job.status} -> ${nextStatus}`
    );
    if (job.partnerId) {
      await syncPartnerJobProjection({ ...job, status: nextStatus }, job.partnerId);
    }
  };

  const handleReschedule = async () => {
    if (!reschedDate) return;
    const now = new Date().toISOString();
    const nextSlot = {
      date: reschedDate,
      window: reschedWindow,
      area: job.pickupSlot?.area || job.area
    };
    const nextHistory = [
      ...(job.statusHistory || []),
      {
        status: job.status,
        timestamp: now,
        note: `स्लॉट रीशेड्यूल: ${reschedDate} (${reschedWindow})`
      }
    ];
    await updateJob(
      { pickupSlot: nextSlot, statusHistory: nextHistory },
      'job_rescheduled',
      `${reschedDate} ${reschedWindow}`
    );
    if (job.partnerId) {
      await syncPartnerJobProjection({ ...job, pickupSlot: nextSlot }, job.partnerId);
    }
  };

  const handleApplyServicesAndDiscount = async () => {
    const minD = adminSettings.discountMinPct ?? 12;
    const maxD = adminSettings.discountMaxPct ?? 15;
    if ((discountPct < minD || discountPct > maxD) && !discountReason.trim()) {
      setFeedback(`छूट ${minD}%–${maxD}% सीमा से बाहर होने पर कारण लिखना अनिवार्य है।`);
      return;
    }
    if (!discountReason.trim()) {
      setFeedback('कृपया डिस्काउंट/प्राइस अपडेट का कारण दर्ज करें (Audit Log हेतु)।');
      return;
    }

    const now = new Date().toISOString();
    const nextHistory = [
      ...(job.statusHistory || []),
      {
        status: job.status,
        timestamp: now,
        note: `सेवाएं व कोट अपडेट: ₹${computedDiscountedFinal} (${discountPct}% छूट — ${discountReason.trim()})`
      }
    ];

    await updateJob(
      {
        finalServices: selectedServiceNames,
        finalPrice: computedDiscountedFinal,
        discountPct,
        discountReason: discountReason.trim(),
        statusHistory: nextHistory
      },
      'job_services_discount_updated',
      `${discountPct}% discount (${discountReason.trim()})`
    );

    if (job.partnerId) {
      await syncPartnerJobProjection(
        { ...job, finalServices: selectedServiceNames },
        job.partnerId
      );
    }
  };

  const handleCreateHandover = async () => {
    if (!job.partnerId || !sealedBagId.trim() || !handoverImei.trim()) {
      setFeedback('हैंडओवर के लिए पार्टनर असाइन होना, Sealed Bag ID और IMEI आवश्यक है।');
      return;
    }
    setBusyAction('create_handover');
    const now = new Date();
    const deadline = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    try {
      await addDoc(collection(db, 'handovers'), {
        jobId: job.jobId,
        partnerId: job.partnerId,
        partnerName: assignedPartner?.name || 'Partner',
        sealedBagId: sealedBagId.trim(),
        imei: handoverImei.trim(),
        handoverPhotos: job.qc?.conditionPhotoUrls || [],
        handoverTime: now.toISOString(),
        deliveryDeadline: deadline.toISOString(),
        status: 'active',
        timestamp: serverTimestamp()
      });

      await syncPartnerJobProjection(job, job.partnerId, {
        sealedBagId: sealedBagId.trim(),
        handoverImei: handoverImei.trim(),
        handoverTime: now.toISOString(),
        handoverDeadline: deadline.toISOString()
      });

      await recordAuditLog({
        action: 'sealed_bag_handover_created',
        targetType: 'job',
        targetId: job.jobId,
        after: { sealedBagId: sealedBagId.trim(), partnerId: job.partnerId, imei: handoverImei.trim() }
      });

      setFeedback(`✓ सीलबंद बैग #${sealedBagId.trim()} हैंडओवर दर्ज। 2-घंटे लक्ष्य सक्रिय।`);
    } finally {
      setBusyAction(null);
    }
  };

  const handleRecordRefund = async () => {
    if (refundAmount <= 0 || !refundReason.trim()) {
      setFeedback('कृपया रिफंड रकम और कारण दर्ज करें।');
      return;
    }
    const now = new Date().toISOString();
    const nextHistory = [
      ...(job.statusHistory || []),
      {
        status: job.status,
        timestamp: now,
        note: `रिफंड दर्ज: ₹${refundAmount} (${refundReason.trim()})`
      }
    ];
    await updateJob(
      {
        paymentStatus: refundAmount >= (job.finalPrice || 199) ? 'refunded' : 'partially_refunded',
        refundAmount,
        refundReason: refundReason.trim(),
        refundedAt: now,
        statusHistory: nextHistory
      },
      'job_refund_recorded',
      `₹${refundAmount} — ${refundReason.trim()}`
    );
  };

  const handleCancelJob = async () => {
    if (!cancelReason.trim()) {
      setFeedback('कृपया ऑर्डर रद्द करने का कारण लिखें।');
      return;
    }
    const now = new Date().toISOString();
    const nextHistory = [
      ...(job.statusHistory || []),
      {
        status: 'Cancelled',
        timestamp: now,
        note: `एडमिन द्वारा रद्द: ${cancelReason.trim()}`
      }
    ];
    await updateJob(
      {
        status: 'Cancelled',
        statusHistory: nextHistory
      },
      'job_cancelled',
      cancelReason.trim()
    );
  };

  const handleUploadAdminProof = async (field: 'idPhotoUrl' | 'billPhotoUrl', file: File) => {
    setIsUploadingAdminFile(true);
    try {
      const url = await uploadImageToStorage(file, `admin/${job.jobId}`);
      await updateJob(
        {
          qc: {
            ...(job.qc || { checklist: {}, imei: '', billPhotoUrl: '', conditionPhotoUrls: [] }),
            [field]: url
          }
        },
        `admin_uploaded_${field}`,
        `Uploaded private ${field} to /admin/${job.jobId}`
      );
    } catch (err: any) {
      setFeedback(err?.message || 'फ़ाइल अपलोड करने में समस्या आई।');
    } finally {
      setIsUploadingAdminFile(false);
    }
  };

  const handleCreateInvoice = async () => {
    setBusyAction('create_invoice');
    try {
      const inv = await generateInvoiceForJob({ job, adminSettings });
      setFeedback(`✓ इनवॉइस #${inv.invoiceNumber} सफलतापूर्वक बन गया है।`);
    } finally {
      setBusyAction(null);
    }
  };

  const currentWaTemplate =
    ADMIN_WHATSAPP_TEMPLATES.find((t) => t.id === waTemplateId) || ADMIN_WHATSAPP_TEMPLATES[0];
  const waHref = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
    currentWaTemplate.build(job, googleReviewUrl)
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-3xl bg-white h-full overflow-y-auto shadow-2xl border-l border-gray-200 flex flex-col">
        {/* Top Bar */}
        <div className="sticky top-0 z-20 p-4 sm:p-5 bg-white border-b border-gray-200 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#D5151B] font-mono text-xs font-bold border border-red-200">
                #{job.jobId}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-[#132032] text-xs font-bold">
                {job.status}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#132032] mt-1">
              {job.brand} {job.model} • {job.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Close detail"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-5 text-xs flex-1">
          {feedback && (
            <div className="p-3 rounded-xl bg-[#FEF2F2] border border-red-200 text-[#132032] font-bold flex items-center justify-between">
              <span>{feedback}</span>
              <button type="button" onClick={() => setFeedback(null)} className="text-gray-500">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 1. Customer & Quick Comms + WhatsApp Templates */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase block">Customer Details</span>
                <p className="text-sm font-bold text-[#132032]">{job.name}</p>
                <p className="font-mono text-gray-700">+91 {job.phone}</p>
                <p className="text-gray-600 mt-0.5">{job.address} • <strong>{job.area}</strong></p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`tel:+91${cleanPhone}`}
                  className="px-3.5 py-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-100 text-[#132032] font-bold flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-[#D5151B]" />
                  <span>Call</span>
                </a>
                <a
                  href={`https://wa.me/91${cleanPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* WhatsApp Templates */}
            <div className="pt-3 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <select
                value={waTemplateId}
                onChange={(e) => setWaTemplateId(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold"
              >
                {ADMIN_WHATSAPP_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    Template: {t.label}
                  </option>
                ))}
              </select>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  recordAuditLog({
                    action: 'whatsapp_template_opened',
                    targetType: 'job',
                    targetId: job.jobId,
                    reason: currentWaTemplate.label
                  })
                }
                className="px-4 py-2 rounded-xl bg-[#132032] hover:bg-black text-white font-bold text-center shrink-0"
              >
                Send Template via WhatsApp
              </a>
            </div>
          </div>

          {/* 2. Assignment, Status, Reschedule */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl border border-gray-200 space-y-2.5">
              <span className="font-bold text-[#132032] flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#D5151B]" />
                <span>Assign Partner & Status</span>
              </span>

              <select
                value={job.partnerId || ''}
                onChange={(e) => handleAssignPartner(e.target.value)}
                disabled={busyAction !== null}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-semibold"
              >
                <option value="">-- पार्टनर चुनें --</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.area}) • Bal: ₹{p.advanceBalance}
                  </option>
                ))}
              </select>

              <select
                value={job.status}
                onChange={(e) => handleStatusChange(e.target.value as JobStatus)}
                disabled={busyAction !== null}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-bold text-[#132032]"
              >
                {JOB_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    Status: {st}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => onOpenQC(job)}
                className="w-full py-2 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold cursor-pointer"
              >
                Open 11-Point QC Screen
              </button>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200 space-y-2.5">
              <span className="font-bold text-[#132032] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#D5151B]" />
                <span>Pickup Slot & Reschedule</span>
              </span>
              <input
                type="date"
                value={reschedDate}
                onChange={(e) => setReschedDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono"
              />
              <select
                value={reschedWindow}
                onChange={(e) => setReschedWindow(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
              >
                <option value="10:00 AM - 01:00 PM (Morning Slot)">10:00 AM - 01:00 PM</option>
                <option value="02:00 PM - 05:00 PM (Afternoon Slot)">02:00 PM - 05:00 PM</option>
                <option value="05:00 PM - 08:00 PM (Evening Express Slot)">05:00 PM - 08:00 PM</option>
              </select>
              <button
                type="button"
                onClick={handleReschedule}
                disabled={busyAction !== null}
                className="w-full py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#132032] font-bold cursor-pointer"
              >
                Reschedule Slot
              </button>
            </div>
          </div>

          {/* 3. Services, Quote, Discount (12-15% Rule) & Approval Record */}
          <div className="p-4 rounded-2xl bg-[#FEF2F2]/60 border border-red-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#132032] flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-[#D5151B]" />
                <span>Services & Discount ({adminSettings.discountMinPct}–{adminSettings.discountMaxPct}% Rule)</span>
              </span>
              <span className="text-[11px] font-bold text-gray-600 tabular-nums">
                Est: ₹{job.estMin}–₹{job.estMax}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {repairPrices.map((srv) => {
                const isSelected = selectedServiceNames.includes(srv.name_hi);
                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() =>
                      setSelectedServiceNames((prev) =>
                        isSelected ? prev.filter((s) => s !== srv.name_hi) : [...prev, srv.name_hi]
                      )
                    }
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer ${
                      isSelected
                        ? 'bg-[#D5151B] text-white border-[#D5151B]'
                        : 'bg-white text-gray-700 border-gray-200'
                    }`}
                  >
                    {srv.name_hi.split('(')[0]} (₹{srv.maxPrice})
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Discount % ({adminSettings.discountMinPct}–{adminSettings.discountMaxPct}%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={discountPct}
                  onChange={(e) => setDiscountPct(Number(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-200 bg-white font-mono font-bold"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  Reason (Mandatory) *
                </label>
                <input
                  type="text"
                  value={discountReason}
                  onChange={(e) => setDiscountReason(e.target.value)}
                  placeholder="उदा. मानक 12% कॉम्बो छूट / लॉयल ग्राहक..."
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-200 bg-white"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-red-200">
              <div className="tabular-nums">
                <span className="text-gray-600">Updated Quote: </span>
                <strong className="text-base text-[#D5151B]">₹{computedDiscountedFinal}</strong>
                {job.customerApproved && (
                  <span className="ml-2 text-emerald-700 font-bold">
                    ✓ Customer Approved {job.approvedAt ? `(${new Date(job.approvedAt).toLocaleString('en-IN')})` : ''}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleApplyServicesAndDiscount}
                disabled={busyAction !== null}
                className="px-4 py-2 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold cursor-pointer"
              >
                Save Services & Discount
              </button>
            </div>
          </div>

          {/* 4. QC Checklist, IMEI, Admin-only Files (ID / Bill) & Sealed Bag Handover */}
          <div className="p-4 rounded-2xl border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#132032] flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#D5151B]" />
                <span>QC Record, IMEI & Admin-Only Proofs</span>
              </span>
              <span className="font-mono text-gray-700">
                IMEI: <strong>{job.qc?.imei || 'Not Logged'}</strong>
              </span>
            </div>

            {/* Admin-only storage uploads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#132032]">Customer ID Proof (/admin/**)</span>
                  <label className="text-[#D5151B] font-bold cursor-pointer flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{isUploadingAdminFile ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUploadAdminProof('idPhotoUrl', f);
                      }}
                    />
                  </label>
                </div>
                {job.qc?.idPhotoUrl ? (
                  <a href={job.qc.idPhotoUrl} target="_blank" rel="noreferrer" className="block">
                    <img
                      src={job.qc.idPhotoUrl}
                      alt="Customer ID"
                      className="h-24 w-full object-cover rounded-lg border border-gray-200"
                    />
                  </a>
                ) : (
                  <p className="text-[11px] text-gray-400">No ID photo uploaded yet</p>
                )}
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#132032]">Original Bill Photo</span>
                  <label className="text-[#D5151B] font-bold cursor-pointer flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{isUploadingAdminFile ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUploadAdminProof('billPhotoUrl', f);
                      }}
                    />
                  </label>
                </div>
                {job.qc?.billPhotoUrl ? (
                  <a href={job.qc.billPhotoUrl} target="_blank" rel="noreferrer" className="block">
                    <img
                      src={job.qc.billPhotoUrl}
                      alt="Bill"
                      className="h-24 w-full object-cover rounded-lg border border-gray-200"
                    />
                  </a>
                ) : (
                  <p className="text-[11px] text-gray-400">No bill photo uploaded yet</p>
                )}
              </div>
            </div>

            {job.qc?.conditionPhotoUrls && job.qc.conditionPhotoUrls.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pt-1">
                {job.qc.conditionPhotoUrls.map((url, idx) => (
                  <a key={idx} href={url} target="_blank" rel="noreferrer" className="shrink-0">
                    <img
                      src={url}
                      alt={`Condition ${idx + 1}`}
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                    />
                  </a>
                ))}
              </div>
            )}

            {/* Sealed Bag Handover */}
            <div className="pt-3 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Sealed Bag ID</label>
                <input
                  type="text"
                  value={sealedBagId}
                  onChange={(e) => setSealedBagId(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Handover IMEI</label>
                <input
                  type="text"
                  value={handoverImei}
                  onChange={(e) => setHandoverImei(e.target.value)}
                  placeholder="15-digit IMEI"
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-200 font-mono"
                />
              </div>
              <button
                type="button"
                onClick={handleCreateHandover}
                disabled={busyAction !== null}
                className="py-2 px-3 rounded-xl bg-[#132032] hover:bg-black text-white font-bold cursor-pointer"
              >
                Log Sealed Handover (2h)
              </button>
            </div>
            {jobHandovers.length > 0 && (
              <div className="text-[11px] text-gray-600 space-y-1">
                {jobHandovers.map((h) => (
                  <p key={h.id}>
                    Bag <strong>#{h.sealedBagId}</strong> → {h.partnerName} • Deadline:{' '}
                    {new Date(h.deliveryDeadline).toLocaleTimeString('en-IN')}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* 5. Partner Findings & Parts Entered */}
          {job.partnerFindings && (
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#132032] flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-emerald-700" />
                  <span>Partner Findings & Parts Used</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-800">
                  {job.partnerFindings.costApprovedByAdmin ? '✓ Cost Approved' : 'Pending Cost Approval'}
                </span>
              </div>
              <p><strong>Faults Found:</strong> {job.partnerFindings.faultsFound}</p>
              <p><strong>Tags:</strong> {job.partnerFindings.tags?.join(', ')}</p>
              <p><strong>Time Taken:</strong> {job.partnerFindings.timeTakenMinutes} min • <strong>Remarks:</strong> {job.partnerFindings.remarks}</p>
              <p>
                <strong>Parts Cost:</strong> ₹{job.partnerFindings.totalPartsCost} (
                {job.partnerFindings.partsUsed?.map((p) => `${p.name}: ₹${p.cost}`).join(', ') || 'None'})
              </p>
            </div>
          )}

          {/* 6. Payments, Invoice, Warranty, Review, Refunds & Cancellation */}
          <div className="p-4 rounded-2xl border border-gray-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-bold text-[#132032] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#D5151B]" />
                  <span>Payments, Invoice & Warranty</span>
                </span>
                <p className="text-[11px] text-gray-600 mt-0.5">
                  Razorpay ID: <span className="font-mono">{job.razorpayPaymentId || 'Not Linked'}</span> • Visit Token:{' '}
                  <strong>{job.visitFeePaid ? 'Paid (₹199)' : 'Unpaid'}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={handleCreateInvoice}
                disabled={busyAction !== null}
                className="px-3.5 py-2 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold cursor-pointer"
              >
                {activeInvoice ? `Invoice #${activeInvoice.invoiceNumber}` : 'Create Invoice'}
              </button>
            </div>

            {customerReview && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#132032] inline-flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                    Customer Review ({customerReview.rating}/5)
                  </span>
                  <p className="text-gray-700 mt-0.5">"{customerReview.reviewText}"</p>
                </div>
                <span className="font-bold uppercase text-[10px]">{customerReview.status}</span>
              </div>
            )}

            {/* Refund & Cancel Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                  <span>Record Refund</span>
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(Number(e.target.value) || 0)}
                    className="w-20 px-2 py-1.5 rounded-lg border border-gray-200 font-mono"
                    placeholder="₹"
                  />
                  <input
                    type="text"
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Refund reason..."
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={handleRecordRefund}
                    disabled={busyAction !== null}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
                  >
                    Refund
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 flex items-center gap-1">
                  <Ban className="w-3.5 h-3.5 text-gray-700" />
                  <span>Cancel Job</span>
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Cancellation reason..."
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={handleCancelJob}
                    disabled={busyAction !== null}
                    className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-black text-white font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 7. Internal Notes & Full Status Timeline */}
          <div className="p-4 rounded-2xl border border-gray-200 space-y-3">
            <span className="font-bold text-[#132032] block">Internal Admin Notes</span>
            <div className="flex gap-2">
              <textarea
                rows={2}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="गोपनीय एडमिन नोट्स (केवल एडमिन को दिखेंगे)..."
                className="flex-1 p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#D5151B]"
              />
              <button
                type="button"
                onClick={() => updateJob({ internalNotes }, 'job_internal_note_saved', 'Updated internal notes')}
                disabled={busyAction !== null}
                className="px-4 py-2 rounded-xl bg-[#132032] hover:bg-black text-white font-bold flex items-center gap-1 self-end cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Note</span>
              </button>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <span className="font-bold text-gray-500 uppercase text-[10px] block mb-2">
                Status History Timeline
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(job.statusHistory || []).map((entry, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-[#D5151B] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#132032]">{entry.status}</span>{' '}
                      <span className="text-gray-400 font-mono">
                        ({new Date(entry.timestamp).toLocaleString('en-IN')})
                      </span>
                      {entry.note && <p className="text-gray-600">{entry.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
