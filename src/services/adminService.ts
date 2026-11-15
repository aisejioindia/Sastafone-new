import { httpsCallable } from 'firebase/functions';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  where,
  limit,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { auth, db, functions } from '../firebase';
import {
  AdminSettings,
  AuditLogEntry,
  CustomerNote,
  CustomerReferral,
  InvoiceRecord,
  Job,
  JobHandoverRecord,
  JobStatus,
  OwnerListing,
  Partner,
  PartnerJob,
  PartnerLedgerEntry,
  PartnerSubmission,
  RepairPrice,
  Slot
} from '../types';

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  discountMinPct: 12,
  discountMaxPct: 15,
  minOrderAmountAfterDiscount: 500,
  minNetMarginRupees: 250,
  visitTokenAmount: 199,
  buyPhoneTokenAmount: 499,
  gstEnabled: false,
  gstPct: 18,
  gstin: '',
  businessLegalName: 'Sastafone Surat',
  businessAddress: 'Surat, Gujarat, India',
  sessionTimeoutMinutes: 30,
  lowPartnerBalanceThreshold: 1000
};

export interface VerifiedClaimsResult {
  role: 'admin' | 'partner' | 'customer';
  admin: boolean;
  partner: boolean;
  partnerId: string | null;
  claimsChanged?: boolean;
}

/**
 * Call Cloud Function to evaluate Google-verified email against ADMIN_EMAILS (or active partners)
 * and force-refresh the client Firebase ID Token so custom claims are immediately up-to-date.
 */
export async function syncAndRefreshUserClaims(reason: string = 'app_auth_sync'): Promise<VerifiedClaimsResult> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return { role: 'customer', admin: false, partner: false, partnerId: null };
  }

  try {
    const callable = httpsCallable<{ reason: string }, VerifiedClaimsResult>(
      functions,
      'syncUserRoleClaims'
    );
    const response = await callable({ reason });
    // Force refresh ID token so Firestore/Storage security rules get latest claims
    const tokenResult = await currentUser.getIdTokenResult(true);
    const claims = tokenResult.claims || {};

    const emailVerified = currentUser.emailVerified === true;
    const isAdmin = emailVerified && claims.admin === true;
    const isPartner = !isAdmin && emailVerified && claims.partner === true && typeof claims.partnerId === 'string';

    return {
      role: isAdmin ? 'admin' : isPartner ? 'partner' : 'customer',
      admin: isAdmin,
      partner: isPartner,
      partnerId: isPartner ? (claims.partnerId as string) : null,
      claimsChanged: response.data?.claimsChanged
    };
  } catch (err) {
    // Fallback: inspect already-minted ID token claims (never trust client-side email arrays!)
    try {
      const tokenResult = await currentUser.getIdTokenResult(true);
      const claims = tokenResult.claims || {};
      const emailVerified = currentUser.emailVerified === true;
      const isAdmin = emailVerified && claims.admin === true;
      const isPartner = !isAdmin && emailVerified && claims.partner === true && typeof claims.partnerId === 'string';
      return {
        role: isAdmin ? 'admin' : isPartner ? 'partner' : 'customer',
        admin: isAdmin,
        partner: isPartner,
        partnerId: isPartner ? (claims.partnerId as string) : null
      };
    } catch {
      return { role: 'customer', admin: false, partner: false, partnerId: null };
    }
  }
}

export async function syncPartnerCustomClaimByEmail(
  partnerId: string,
  email?: string,
  active?: boolean
): Promise<{ synced: boolean; message?: string }> {
  if (!email?.trim()) return { synced: false, message: 'Partner email not provided.' };
  try {
    const callable = httpsCallable<
      { partnerId: string; email: string; active?: boolean },
      { synced: boolean; message?: string }
    >(functions, 'adminManagePartnerClaim');
    const res = await callable({ partnerId, email: email.trim().toLowerCase(), active });
    return res.data;
  } catch (err: any) {
    return { synced: false, message: err?.message || 'Claim sync skipped.' };
  }
}

/**
 * Append immutable audit log entry
 */
export async function recordAuditLog(params: {
  action: string;
  targetType: string;
  targetId: string;
  reason?: string;
  before?: any;
  after?: any;
  metadata?: any;
}): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) return;
  try {
    const tokenResult = await currentUser.getIdTokenResult();
    const role = tokenResult.claims?.admin
      ? 'admin'
      : tokenResult.claims?.partner
      ? 'partner'
      : 'customer';

    await addDoc(collection(db, 'auditLogs'), {
      action: params.action,
      actorUid: currentUser.uid,
      actorEmail: currentUser.email || '',
      actorRole: role,
      targetType: params.targetType,
      targetId: params.targetId,
      reason: params.reason || '',
      before: params.before ?? null,
      after: params.after ?? null,
      metadata: params.metadata ?? null,
      createdAt: new Date().toISOString(),
      timestamp: serverTimestamp()
    });
  } catch (err) {
    console.warn('Audit log write notice:', err);
  }
}

/**
 * Subscribe to Admin Settings (settings/admin)
 */
export function subscribeToAdminSettings(onUpdate: (settings: AdminSettings) => void): () => void {
  const ref = doc(db, 'settings', 'admin');
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        onUpdate({ ...DEFAULT_ADMIN_SETTINGS, ...(snap.data() as Partial<AdminSettings>) });
      } else {
        onUpdate(DEFAULT_ADMIN_SETTINGS);
      }
    },
    () => onUpdate(DEFAULT_ADMIN_SETTINGS)
  );
}

export async function saveAdminSettings(updates: Partial<AdminSettings>): Promise<void> {
  const ref = doc(db, 'settings', 'admin');
  const prevSnap = await getDoc(ref);
  const prevData = prevSnap.exists() ? prevSnap.data() : DEFAULT_ADMIN_SETTINGS;
  await setDoc(
    ref,
    {
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: auth.currentUser?.email || auth.currentUser?.uid || 'admin',
      timestamp: serverTimestamp()
    },
    { merge: true }
  );
  await recordAuditLog({
    action: 'admin_settings_updated',
    targetType: 'settings',
    targetId: 'admin',
    before: prevData,
    after: updates
  });
}

/**
 * Sync or create zero-PII partnerJobs projection whenever a job is assigned/updated
 */
export async function syncPartnerJobProjection(
  job: Job,
  partnerId: string,
  extra?: { sealedBagId?: string; handoverImei?: string; handoverTime?: string; handoverDeadline?: string }
): Promise<void> {
  if (!partnerId) return;
  const projRef = doc(db, 'partnerJobs', job.jobId);
  const existing = await getDoc(projRef);
  const prevSubmission = existing.exists() ? existing.data()?.partnerSubmission : undefined;

  const payload: PartnerJob = {
    jobId: job.jobId,
    partnerId,
    brand: job.brand,
    model: job.model,
    services: job.finalServices && job.finalServices.length > 0 ? job.finalServices : job.services || [],
    pickupSlot: {
      date: job.pickupSlot?.date || '',
      window: job.pickupSlot?.window || '',
      area: job.pickupSlot?.area || job.area || ''
    },
    status: job.status,
    ...(extra?.sealedBagId ? { sealedBagId: extra.sealedBagId } : {}),
    ...(extra?.handoverImei ? { handoverImei: extra.handoverImei } : {}),
    ...(extra?.handoverTime ? { handoverTime: extra.handoverTime } : {}),
    ...(extra?.handoverDeadline ? { handoverDeadline: extra.handoverDeadline } : {}),
    ...(prevSubmission ? { partnerSubmission: prevSubmission } : {}),
    updatedAt: new Date().toISOString()
  };

  await setDoc(projRef, payload, { merge: true });
}

/**
 * Admin: Approve Partner's submitted parts cost, mirror onto jobs/{jobId},
 * and atomically deduct from partner advanceBalance + record ledger entry
 */
export async function approvePartnerPartsCost(params: {
  jobId: string;
  partner: Partner;
  submission: PartnerSubmission;
  approvalNote?: string;
}): Promise<void> {
  const { jobId, partner, submission, approvalNote } = params;
  const partsCost = Number(submission.totalPartsCost || 0);
  const now = new Date().toISOString();
  const approvedBy = auth.currentUser?.email || auth.currentUser?.uid || 'admin';

  const updatedSubmission: PartnerSubmission = {
    ...submission,
    costApprovedByAdmin: true,
    costApprovedAt: now,
    costApprovedBy: approvedBy,
    adminApprovalNote: approvalNote || ''
  };

  // Update partnerJobs + jobs
  await updateDoc(doc(db, 'partnerJobs', jobId), {
    partnerSubmission: updatedSubmission,
    updatedAt: now
  });

  await updateDoc(doc(db, 'jobs', jobId), {
    partnerFindings: updatedSubmission,
    updatedAt: now
  });

  // Deduct partner rate / parts cost settlement in ledger if > 0
  if (partsCost > 0) {
    const partnerRef = doc(db, 'partners', partner.id);
    await runTransaction(db, async (tx) => {
      const pSnap = await tx.get(partnerRef);
      const currentBal = pSnap.exists() ? Number(pSnap.data()?.advanceBalance || 0) : partner.advanceBalance;
      const newBal = currentBal - partsCost;
      if (pSnap.exists()) {
        tx.update(partnerRef, { advanceBalance: newBal, updatedAt: now });
      }
      const ledgerRef = doc(collection(db, 'ledger'));
      tx.set(ledgerRef, {
        partnerId: partner.id,
        partnerName: partner.name,
        type: 'job_deduction',
        amount: partsCost,
        jobId,
        balanceBefore: currentBal,
        balanceAfter: newBal,
        notes: `पार्ट्स कॉस्ट अप्रूवल (#${jobId}): ₹${partsCost}${approvalNote ? ` — ${approvalNote}` : ''}`,
        timestamp: now,
        serverTime: serverTimestamp()
      });
    });
  }

  await recordAuditLog({
    action: 'partner_parts_cost_approved',
    targetType: 'job',
    targetId: jobId,
    reason: approvalNote || 'Parts cost verified & ledger updated',
    after: { partnerId: partner.id, totalPartsCost: partsCost }
  });
}

/**
 * Create, Void, or Reissue Invoice in Firestore (/invoices) & link to job
 */
export async function generateInvoiceForJob(params: {
  job: Job;
  adminSettings: AdminSettings;
  replacesInvoiceId?: string;
  customDiscountAmount?: number;
  customDiscountPct?: number;
  customDiscountReason?: string;
}): Promise<InvoiceRecord> {
  const { job, adminSettings, replacesInvoiceId } = params;
  const now = new Date();
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const seq = String(Math.floor(1000 + Math.random() * 9000));
  const invoiceNumber = `SST-${ym}-${seq}`;

  const rawServices =
    job.qc?.servicesBreakdown && job.qc.servicesBreakdown.length > 0
      ? job.qc.servicesBreakdown.map((s) => ({ name: s.name, price: Number(s.price || 0) }))
      : (job.finalServices || job.services || ['Mobile Repair Service']).map((name, idx, arr) => ({
          name,
          price: idx === 0 ? Number(job.finalPrice || job.estMax || 0) : 0,
          ...(arr.length > 1 ? {} : {})
        }));

  const parts = (job.partnerFindings?.partsUsed || []).map((p) => ({
    name: p.name,
    cost: Number(p.cost || 0)
  }));
  const partsCost = parts.reduce((sum, p) => sum + p.cost, 0);

  const subtotalFromServices = rawServices.reduce((s, r) => s + Number(r.price || 0), 0);
  const baseTotal = Number(job.finalPrice || subtotalFromServices || job.estMax || 0);
  const discountPct = params.customDiscountPct ?? job.discountPct ?? job.qc?.discountPct ?? 0;
  const discountAmount = params.customDiscountAmount ?? (
    subtotalFromServices > baseTotal ? subtotalFromServices - baseTotal : Math.round((subtotalFromServices * discountPct) / 100)
  );

  const taxableBase = Math.max(0, baseTotal);
  const gstEnabled = Boolean(adminSettings.gstEnabled);
  const gstPct = gstEnabled ? Number(adminSettings.gstPct || 18) : 0;
  const gstAmount = gstEnabled ? Math.round((taxableBase * gstPct) / 100) : 0;
  const visitFeeAdjusted = job.visitFeePaid ? Number(adminSettings.visitTokenAmount || 199) : 0;
  const finalTotal = Math.max(0, taxableBase + gstAmount);

  const warrantyMonths = finalTotal >= 1000 ? 6 : 0;
  const expiry = new Date(now);
  expiry.setMonth(expiry.getMonth() + warrantyMonths);

  const invoicePayload: Omit<InvoiceRecord, 'id'> = {
    invoiceNumber,
    userId: job.userId,
    jobId: job.jobId,
    type: 'repair',
    status: 'active',
    ...(replacesInvoiceId ? { replacesInvoiceId } : {}),
    date: now.toISOString(),
    customerName: job.name,
    customerPhone: job.phone,
    customerAddress: job.address,
    area: job.area,
    brand: job.brand,
    model: job.model,
    imei: job.qc?.imei || 'Verified',
    services: rawServices,
    parts,
    partsCost,
    subtotal: subtotalFromServices || baseTotal,
    discountPct,
    discountAmount,
    discountReason: params.customDiscountReason || job.discountReason || job.qc?.discountReason || '',
    visitFeeAdjusted,
    gstEnabled,
    gstPct,
    gstAmount,
    gstin: gstEnabled ? adminSettings.gstin : '',
    finalTotal,
    paymentStatus: job.paymentStatus === 'refunded' ? 'refunded' : job.visitFeePaid ? 'paid' : 'pending',
    paymentMethod: job.razorpayPaymentId ? `Razorpay (${job.razorpayPaymentId})` : 'Digital / Cash on Delivery',
    razorpayPaymentId: job.razorpayPaymentId || '',
    warrantyMonths,
    warrantyExpiry: warrantyMonths > 0 ? expiry.toISOString() : '',
    warrantyTerms:
      warrantyMonths >= 6
        ? '₹1,000+ बिल पर बदले गए पार्ट्स पर 6 महीने की Sastafone वारंटी (फिजिकल/लिक्विड डैमेज छोड़कर)।'
        : '₹1,000 से कम बिल पर 7 दिन टेस्टिंग गारंटी।',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  const docRef = await addDoc(collection(db, 'invoices'), {
    ...invoicePayload,
    timestamp: serverTimestamp()
  });

  await updateDoc(doc(db, 'jobs', job.jobId), {
    invoiceId: docRef.id,
    invoiceNumber,
    updatedAt: now.toISOString()
  });

  await recordAuditLog({
    action: replacesInvoiceId ? 'invoice_reissued' : 'invoice_created',
    targetType: 'invoice',
    targetId: docRef.id,
    reason: replacesInvoiceId ? `Reissued replacing ${replacesInvoiceId}` : `Generated for job ${job.jobId}`,
    after: { invoiceNumber, finalTotal, gstAmount }
  });

  return { id: docRef.id, ...invoicePayload };
}

export async function voidInvoiceInFirestore(invoiceId: string, reason: string): Promise<void> {
  const now = new Date().toISOString();
  const actor = auth.currentUser?.email || auth.currentUser?.uid || 'admin';
  await updateDoc(doc(db, 'invoices', invoiceId), {
    status: 'voided',
    voidReason: reason,
    voidedAt: now,
    voidedBy: actor,
    updatedAt: now
  });
  await recordAuditLog({
    action: 'invoice_voided',
    targetType: 'invoice',
    targetId: invoiceId,
    reason
  });
}

/**
 * Subscriptions for Admin Control Room collections
 */
export function subscribeToCollection<T>(
  collectionName: string,
  orderField: string | null,
  onUpdate: (items: T[]) => void
): () => void {
  const col = collection(db, collectionName);
  const q = orderField ? query(col, orderBy(orderField, 'desc')) : query(col);
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as T));
      onUpdate(list);
    },
    (err) => {
      console.warn(`Subscription warning (${collectionName}):`, err.message);
      onUpdate([]);
    }
  );
}

/**
 * Partner Portal: Subscribe ONLY to partnerJobs assigned to this partnerId (Zero PII)
 */
export function subscribeToPartnerAssignedJobs(
  partnerId: string,
  onUpdate: (jobs: PartnerJob[]) => void
): () => void {
  if (!partnerId) {
    onUpdate([]);
    return () => {};
  }
  const q = query(collection(db, 'partnerJobs'), where('partnerId', '==', partnerId));
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) => ({ ...(d.data() as PartnerJob), jobId: d.id }));
      list.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
      onUpdate(list);
    },
    (err) => {
      console.warn('Partner jobs subscription warning:', err.message);
      onUpdate([]);
    }
  );
}

/**
 * Slot Bulk Generator & CRUD
 */
export async function createOrUpdateSlot(slot: Slot): Promise<void> {
  await setDoc(doc(db, 'slots', slot.id), slot, { merge: true });
  await recordAuditLog({
    action: 'slot_saved',
    targetType: 'slot',
    targetId: slot.id,
    after: slot
  });
}

export async function deleteSlotInFirestore(slotId: string): Promise<void> {
  await deleteDoc(doc(db, 'slots', slotId));
  await recordAuditLog({
    action: 'slot_deleted',
    targetType: 'slot',
    targetId: slotId
  });
}

export async function createRepairPriceInFirestore(item: RepairPrice): Promise<void> {
  await setDoc(doc(db, 'repairPrices', item.id), item, { merge: true });
  await recordAuditLog({
    action: 'repair_price_saved',
    targetType: 'repairPrice',
    targetId: item.id,
    after: item
  });
}

export async function deleteRepairPriceInFirestore(id: string): Promise<void> {
  await deleteDoc(doc(db, 'repairPrices', id));
  await recordAuditLog({
    action: 'repair_price_deleted',
    targetType: 'repairPrice',
    targetId: id
  });
}

/**
 * Customer Notes CRUD
 */
export async function addCustomerNote(params: {
  phone: string;
  userId?: string;
  customerName?: string;
  note: string;
}): Promise<void> {
  const actor = auth.currentUser?.email || auth.currentUser?.uid || 'admin';
  const docRef = await addDoc(collection(db, 'customerNotes'), {
    ...params,
    createdBy: actor,
    createdAt: new Date().toISOString(),
    timestamp: serverTimestamp()
  });
  await recordAuditLog({
    action: 'customer_note_added',
    targetType: 'customer',
    targetId: params.phone || params.userId || docRef.id,
    reason: params.note
  });
}

/**
 * CSV & Print/PDF Export Helpers
 */
export function escapeCsvCell(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
  return `"${str.replace(/"/g, '""')}"`;
}

export function downloadCsvFile(filename: string, headers: string[], rows: Record<string, any>[]): void {
  const csvRows = rows.map((row) => headers.map((h) => escapeCsvCell(row[h])).join(','));
  const csv = '\uFEFF' + [headers.join(','), ...csvRows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Admin-only WhatsApp Message Templates
 */
export const ADMIN_WHATSAPP_TEMPLATES = [
  {
    id: 'pickup_assigned',
    label: 'Pickup Scheduled',
    build: (job: Job) =>
      `नमस्ते ${job.name}! Sastafone Surat से आपका रिपेयर ऑर्डर #${job.jobId} (${job.brand} ${job.model}) पिकअप के लिए शेड्यूल हो गया है। स्लॉट: ${job.pickupSlot?.date} (${job.pickupSlot?.window})।`
  },
  {
    id: 'quote_ready',
    label: 'Quote Ready for Approval',
    build: (job: Job) =>
      `नमस्ते ${job.name}! आपके ${job.brand} ${job.model} (#${job.jobId}) की 11-पॉइंट QC जांच पूरी हो गई है। फाइनल कोट: ₹${job.finalPrice || job.estMax} (₹199 विज़िट टोकन घटने के बाद देय: ₹${Math.max(0, (job.finalPrice || job.estMax) - (job.visitFeePaid ? 199 : 0))})। कृपया https://sastafone.in/orders पर अप्रूव करें।`
  },
  {
    id: 'ready_delivery',
    label: 'Ready for Delivery',
    build: (job: Job) =>
      `नमस्ते ${job.name}! आपका ${job.brand} ${job.model} (#${job.jobId}) रिपेयर होकर टेस्टिंग में पास हो गया है और डिलीवरी के लिए तैयार है।`
  },
  {
    id: 'delivered_review',
    label: 'Delivered + Review Request',
    build: (job: Job, googleReviewUrl?: string) =>
      `धन्यवाद ${job.name}! आपका ${job.brand} ${job.model} (#${job.jobId}) सुरक्षित डिलीवर हो गया है।${
        googleReviewUrl ? ` कृपया अपना अनुभव Google पर साझा करें: ${googleReviewUrl}` : ' कृपया https://sastafone.in/orders पर अपनी रेटिंग साझा करें।'
      }`
  }
];
