import React, { useMemo, useState } from 'react';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import {
  AdminSettings,
  Job,
  JobHandoverRecord,
  Partner,
  PartnerJob,
  PartnerLedgerEntry,
  RepairPrice
} from '../../types';
import {
  approvePartnerPartsCost,
  downloadCsvFile,
  recordAuditLog,
  syncPartnerCustomClaimByEmail
} from '../../services/adminService';
import { addPartnerLedgerEntry } from '../../services/firestoreRepairService';
import { uploadImageToStorage } from '../../utils/storageUpload';
import {
  Users,
  Plus,
  Edit3,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Download,
  Printer,
  PackageCheck,
  Camera,
  X
} from 'lucide-react';

interface AdminPartnersModuleProps {
  partners: Partner[];
  jobs: Job[];
  partnerJobs: PartnerJob[];
  ledger: PartnerLedgerEntry[];
  handovers: JobHandoverRecord[];
  repairPrices: RepairPrice[];
  adminSettings: AdminSettings;
}

export const AdminPartnersModule: React.FC<AdminPartnersModuleProps> = ({
  partners,
  jobs,
  partnerJobs,
  ledger,
  handovers,
  repairPrices,
  adminSettings
}) => {
  const [subTab, setSubTab] = useState<'directory' | 'approvals' | 'ledger' | 'handovers'>('directory');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Add / Edit Partner modal state
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [pName, setPName] = useState('');
  const [pArea, setPArea] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pEmail, setPEmail] = useState('');
  const [pBalance, setPBalance] = useState<number>(3000);
  const [pThreshold, setPThreshold] = useState<number>(1000);
  const [pActive, setPActive] = useState(true);
  const [pRateCard, setPRateCard] = useState<Record<string, number>>({});

  // Ledger Top-up / Adjustment modal
  const [ledgerPartnerId, setLedgerPartnerId] = useState('');
  const [ledgerType, setLedgerType] = useState<'advance_topup' | 'job_deduction' | 'incentive' | 'penalty'>('advance_topup');
  const [ledgerAmount, setLedgerAmount] = useState<number>(2000);
  const [ledgerNotes, setLedgerNotes] = useState('');
  const [statementMonth, setStatementMonth] = useState(new Date().toISOString().slice(0, 7));

  // Pending partner findings approvals
  const [approvalNotes, setApprovalNotes] = useState<Record<string, string>>({});

  // Handover return photo upload
  const [uploadingHandoverId, setUploadingHandoverId] = useState<string | null>(null);

  const partnerMetrics = useMemo(() => {
    const map: Record<string, { jobsDone: number; avgMins: number; overdueCount: number }> = {};
    partners.forEach((p) => {
      const pJobs = jobs.filter((j) => j.partnerId === p.id);
      const doneJobs = pJobs.filter((j) => j.status === 'Delivered' || j.status === 'Ready');
      const durations: number[] = [];
      pJobs.forEach((j) => {
        if (j.partnerFindings?.timeTakenMinutes) {
          durations.push(j.partnerFindings.timeTakenMinutes);
        } else if (j.approvedAt && j.deliveredAt) {
          const mins = Math.round(
            (new Date(j.deliveredAt).getTime() - new Date(j.approvedAt).getTime()) / 60000
          );
          if (mins > 0 && mins < 1000) durations.push(mins);
        }
      });
      const avgMins =
        durations.length > 0
          ? Math.round(durations.reduce((s, v) => s + v, 0) / durations.length)
          : 0;

      const pHandovers = handovers.filter((h) => h.partnerId === p.id);
      const overdueCount = pHandovers.filter(
        (h) =>
          (!h.returnTime && Date.now() > new Date(h.deliveryDeadline).getTime()) ||
          (h.returnTime && new Date(h.returnTime).getTime() > new Date(h.deliveryDeadline).getTime())
      ).length;

      map[p.id] = {
        jobsDone: Math.max(doneJobs.length, p.jobsCompleted || 0),
        avgMins,
        overdueCount
      };
    });
    return map;
  }, [partners, jobs, handovers]);

  const pendingApprovals = useMemo(
    () =>
      partnerJobs.filter(
        (pj) => pj.partnerSubmission && !pj.partnerSubmission.costApprovedByAdmin
      ),
    [partnerJobs]
  );

  const openPartnerEditor = (partner?: Partner) => {
    if (partner) {
      setEditingPartner(partner);
      setPName(partner.name);
      setPArea(partner.area);
      setPPhone(partner.phone);
      setPEmail(partner.email || '');
      setPBalance(partner.advanceBalance || 0);
      setPThreshold(partner.lowBalanceThreshold ?? adminSettings.lowPartnerBalanceThreshold ?? 1000);
      setPActive(partner.active);
      setPRateCard(partner.rateCard || {});
    } else {
      setEditingPartner(null);
      setPName('');
      setPArea('Adajan & Pal');
      setPPhone('');
      setPEmail('');
      setPBalance(3000);
      setPThreshold(adminSettings.lowPartnerBalanceThreshold ?? 1000);
      setPActive(true);
      const defaults: Record<string, number> = {};
      repairPrices.forEach((rp) => {
        defaults[rp.id] = Math.round(rp.minPrice * 0.5);
      });
      setPRateCard(defaults);
    }
    setIsPartnerModalOpen(true);
  };

  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim() || !pPhone.trim()) return;
    setBusy(true);
    setFeedback(null);
    const id = editingPartner?.id || `ptr-${Date.now()}`;
    const now = new Date().toISOString();
    const cleanEmail = pEmail.trim().toLowerCase();

    const payload: Partial<Partner> = {
      id,
      name: pName.trim(),
      area: pArea.trim(),
      phone: pPhone.trim(),
      email: cleanEmail,
      advanceBalance: Number(pBalance || 0),
      lowBalanceThreshold: Number(pThreshold || 1000),
      active: pActive,
      rating: editingPartner?.rating ?? 5.0,
      jobsCompleted: editingPartner?.jobsCompleted ?? 0,
      rateCard: pRateCard,
      updatedAt: now,
      ...(editingPartner ? {} : { createdAt: now })
    };

    try {
      await setDoc(doc(db, 'partners', id), payload, { merge: true });
      let claimNote = '';
      if (cleanEmail) {
        const res = await syncPartnerCustomClaimByEmail(id, cleanEmail, pActive);
        if (res.message) claimNote = ` (${res.message})`;
      }
      await recordAuditLog({
        action: editingPartner ? 'partner_updated' : 'partner_created',
        targetType: 'partner',
        targetId: id,
        after: { name: pName.trim(), email: cleanEmail, active: pActive }
      });
      setIsPartnerModalOpen(false);
      setFeedback(`✓ पार्टनर ${pName.trim()} सेव हो गया${claimNote}`);
    } catch (err: any) {
      setFeedback(err?.message || 'पार्टनर सेव करने में त्रुटि।');
    } finally {
      setBusy(false);
    }
  };

  const handleToggleActive = async (partner: Partner) => {
    const nextActive = !partner.active;
    await updateDoc(doc(db, 'partners', partner.id), {
      active: nextActive,
      updatedAt: new Date().toISOString()
    });
    if (partner.email) {
      await syncPartnerCustomClaimByEmail(partner.id, partner.email, nextActive);
    }
    await recordAuditLog({
      action: nextActive ? 'partner_activated' : 'partner_deactivated',
      targetType: 'partner',
      targetId: partner.id
    });
  };

  const handleAddLedgerEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetPartner = partners.find((p) => p.id === ledgerPartnerId);
    if (!targetPartner || ledgerAmount <= 0) return;
    setBusy(true);
    try {
      const balBefore = targetPartner.advanceBalance || 0;
      const balAfter =
        ledgerType === 'advance_topup' || ledgerType === 'incentive'
          ? balBefore + ledgerAmount
          : balBefore - ledgerAmount;

      await addPartnerLedgerEntry({
        partnerId: targetPartner.id,
        partnerName: targetPartner.name,
        type: ledgerType,
        amount: ledgerAmount,
        balanceBefore: balBefore,
        balanceAfter: balAfter,
        notes: ledgerNotes.trim() || `${ledgerType} (₹${ledgerAmount}) via Admin`
      });

      await recordAuditLog({
        action: 'partner_ledger_entry_added',
        targetType: 'partner',
        targetId: targetPartner.id,
        reason: ledgerNotes.trim() || ledgerType,
        after: { type: ledgerType, amount: ledgerAmount, balanceAfter: balAfter }
      });

      setLedgerNotes('');
      setFeedback(`✓ ${targetPartner.name} लेजर अपडेट हुआ (नया बैलेंस: ₹${balAfter})`);
    } finally {
      setBusy(false);
    }
  };

  const handleApproveSubmission = async (pj: PartnerJob) => {
    const partner = partners.find((p) => p.id === pj.partnerId);
    if (!partner || !pj.partnerSubmission) return;
    setBusy(true);
    try {
      await approvePartnerPartsCost({
        jobId: pj.jobId,
        partner,
        submission: pj.partnerSubmission,
        approvalNote: approvalNotes[pj.jobId] || ''
      });
      setFeedback(`✓ जॉब #${pj.jobId} की पार्ट्स कॉस्ट (₹${pj.partnerSubmission.totalPartsCost}) स्वीकृत व लेजर में दर्ज हुई।`);
    } finally {
      setBusy(false);
    }
  };

  const handleReturnHandover = async (handover: JobHandoverRecord) => {
    const now = new Date().toISOString();
    await updateDoc(doc(db, 'handovers', handover.id), {
      returnTime: now,
      status: 'returned',
      isOverdue: new Date(now).getTime() > new Date(handover.deliveryDeadline).getTime()
    });
    await recordAuditLog({
      action: 'handover_returned',
      targetType: 'handover',
      targetId: handover.id,
      after: { jobId: handover.jobId, returnTime: now }
    });
  };

  const handleUploadReturnPhoto = async (handover: JobHandoverRecord, file: File) => {
    setUploadingHandoverId(handover.id);
    try {
      const url = await uploadImageToStorage(file, `admin/handovers/${handover.id}`);
      await updateDoc(doc(db, 'handovers', handover.id), {
        returnPhotos: [...(handover.returnPhotos || []), url]
      });
      await recordAuditLog({
        action: 'handover_return_photo_uploaded',
        targetType: 'handover',
        targetId: handover.id
      });
    } finally {
      setUploadingHandoverId(null);
    }
  };

  const filteredMonthlyLedger = useMemo(
    () => ledger.filter((l) => (l.timestamp || '').startsWith(statementMonth)),
    [ledger, statementMonth]
  );

  const handleExportMonthlyStatementCsv = () => {
    const headers = ['timestamp', 'partnerName', 'type', 'amount', 'jobId', 'balanceBefore', 'balanceAfter', 'notes'];
    downloadCsvFile(`sastafone-partner-ledger-${statementMonth}.csv`, headers, filteredMonthlyLedger);
  };

  return (
    <div className="space-y-5">
      {feedback && (
        <div className="p-3 rounded-xl bg-[#FEF2F2] border border-red-200 text-xs font-bold text-[#132032] flex items-center justify-between">
          <span>{feedback}</span>
          <button type="button" onClick={() => setFeedback(null)} className="cursor-pointer">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      )}

      {/* Sub-Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'directory', label: `Partners (${partners.length})` },
            { id: 'approvals', label: `Parts Approvals (${pendingApprovals.length})` },
            { id: 'ledger', label: `Advance Ledger (${ledger.length})` },
            { id: 'handovers', label: `Handover & Return Log (${handovers.length})` }
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                subTab === t.id
                  ? 'bg-[#D5151B] text-white'
                  : 'bg-white border border-gray-200 text-[#132032] hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => openPartnerEditor()}
          className="px-3.5 py-2 rounded-xl bg-[#132032] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Partner</span>
        </button>
      </div>

      {/* 1. Partner Directory + Performance + Rate Card */}
      {subTab === 'directory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {partners.map((p) => {
            const m = partnerMetrics[p.id] || { jobsDone: 0, avgMins: 0, overdueCount: 0 };
            const threshold = p.lowBalanceThreshold ?? adminSettings.lowPartnerBalanceThreshold ?? 1000;
            const isLowBal = (p.advanceBalance || 0) < threshold;

            return (
              <div
                key={p.id}
                className={`p-5 rounded-2xl bg-white border space-y-3 text-xs ${
                  isLowBal ? 'border-amber-300' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#132032]">{p.name}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {p.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {p.area} • +91 {p.phone}
                    </p>
                    <p className="text-[11px] text-gray-500 font-mono">
                      Login Email: {p.email || 'Not linked (Partner login inactive)'}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-bold text-[#D5151B] tabular-nums block">
                      ₹{(p.advanceBalance || 0).toLocaleString('en-IN')}
                    </span>
                    {isLowBal && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700">
                        <AlertTriangle className="w-3 h-3" /> Low Balance
                      </span>
                    )}
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-4 gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-center tabular-nums">
                  <div>
                    <span className="text-[10px] text-gray-500 block">Rating</span>
                    <strong className="text-[#132032]">{p.rating} ★</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block">Jobs Done</span>
                    <strong className="text-[#132032]">{m.jobsDone}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block">Avg Time</span>
                    <strong className="text-[#132032]">{m.avgMins || '—'}m</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block">Overdue</span>
                    <strong className={m.overdueCount > 0 ? 'text-[#D5151B]' : 'text-emerald-700'}>
                      {m.overdueCount}
                    </strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => openPartnerEditor(p)}
                    className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#132032] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit & Rate Card</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLedgerPartnerId(p.id);
                        setSubTab('ledger');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#FEF2F2] hover:bg-red-100 text-[#D5151B] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Ledger</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(p)}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold cursor-pointer"
                    >
                      {p.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Pending Partner Parts Cost Approval Queue */}
      {subTab === 'approvals' && (
        <div className="space-y-3">
          {pendingApprovals.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-xs text-gray-500">
              पार्टनर द्वारा सबमिट की गई कोई पार्ट्स कॉस्ट स्वीकृति लंबित नहीं है।
            </div>
          ) : (
            pendingApprovals.map((pj) => {
              const partner = partners.find((p) => p.id === pj.partnerId);
              const sub = pj.partnerSubmission!;
              return (
                <div key={pj.jobId} className="p-4 rounded-2xl bg-white border border-gray-200 space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
                    <div>
                      <span className="font-mono font-bold text-[#D5151B]">#{pj.jobId}</span>
                      <h4 className="text-sm font-bold text-[#132032]">
                        {pj.brand} {pj.model} • Partner: {partner?.name || pj.partnerId}
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        Submitted: {new Date(sub.submittedAt).toLocaleString('en-IN')} • Time Taken: {sub.timeTakenMinutes} min
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-[#D5151B] tabular-nums block">
                        ₹{sub.totalPartsCost}
                      </span>
                      <span className="text-[10px] text-gray-500">Claimed Parts Cost</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl">
                    <div>
                      <p><strong>Faults Found:</strong> {sub.faultsFound}</p>
                      <p><strong>Checks:</strong> {sub.checksDone?.join(', ')}</p>
                      <p><strong>Tags:</strong> {sub.tags?.join(', ')}</p>
                      <p><strong>Remarks:</strong> {sub.remarks || '—'}</p>
                    </div>
                    <div>
                      <strong>Parts Used:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {sub.partsUsed?.map((part, idx) => (
                          <li key={idx}>
                            {part.name}: ₹{part.cost}
                          </li>
                        ))}
                      </ul>
                      {sub.repairPhotoUrls?.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {sub.repairPhotoUrls.map((u, idx) => (
                            <a key={idx} href={u} target="_blank" rel="noreferrer">
                              <img src={u} alt="Repair proof" className="w-12 h-12 rounded-lg object-cover border" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={approvalNotes[pj.jobId] ?? ''}
                      onChange={(e) => setApprovalNotes((prev) => ({ ...prev, [pj.jobId]: e.target.value }))}
                      placeholder="एडमिन अप्रूवल नोट (वैकल्पिक)..."
                      className="flex-1 px-3 py-2 rounded-xl border border-gray-200"
                    />
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleApproveSubmission(pj)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Parts Cost & Deduct Ledger</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 3. Partner Advance Ledger & Monthly Statement */}
      {subTab === 'ledger' && (
        <div className="space-y-4">
          <form
            onSubmit={handleAddLedgerEntry}
            className="p-4 rounded-2xl bg-white border border-gray-200 grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-end text-xs"
          >
            <div>
              <label className="block font-bold text-gray-700 mb-1">Partner</label>
              <select
                required
                value={ledgerPartnerId}
                onChange={(e) => setLedgerPartnerId(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-gray-200 bg-white"
              >
                <option value="">-- Select Partner --</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (₹{p.advanceBalance})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Entry Type</label>
              <select
                value={ledgerType}
                onChange={(e) => setLedgerType(e.target.value as any)}
                className="w-full px-2.5 py-2 rounded-xl border border-gray-200 bg-white"
              >
                <option value="advance_topup">Advance Top-up (+)</option>
                <option value="incentive">Incentive (+)</option>
                <option value="job_deduction">Job Deduction (-)</option>
                <option value="penalty">Penalty (-)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Amount (₹)</label>
              <input
                type="number"
                required
                min={1}
                value={ledgerAmount}
                onChange={(e) => setLedgerAmount(Number(e.target.value) || 0)}
                className="w-full px-2.5 py-2 rounded-xl border border-gray-200 font-mono font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Notes</label>
              <input
                type="text"
                value={ledgerNotes}
                onChange={(e) => setLedgerNotes(e.target.value)}
                placeholder="Reason / UTR..."
                className="w-full px-2.5 py-2 rounded-xl border border-gray-200"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="py-2 px-4 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold cursor-pointer"
            >
              Post Ledger Entry
            </button>
          </form>

          <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#132032]">Monthly Ledger Statement:</span>
                <input
                  type="month"
                  value={statementMonth}
                  onChange={(e) => setStatementMonth(e.target.value)}
                  className="px-2.5 py-1.5 rounded-xl border border-gray-200 font-mono"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportMonthlyStatementCsv}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#D5151B]" />
                  <span>Export CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-[#132032] text-white font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print PDF</span>
                </button>
              </div>
            </div>

            {filteredMonthlyLedger.length === 0 ? (
              <p className="text-center text-gray-500 py-4">चयनित माह ({statementMonth}) के लिए कोई लेजर एंट्री नहीं है।</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 text-[11px]">
                      <th className="py-2">Date</th>
                      <th className="py-2">Partner</th>
                      <th className="py-2">Type</th>
                      <th className="py-2">Notes</th>
                      <th className="py-2 text-right">Amount</th>
                      <th className="py-2 text-right">Balance After</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 tabular-nums">
                    {filteredMonthlyLedger.map((entry) => {
                      const isCredit = entry.type === 'advance_topup' || entry.type === 'incentive';
                      return (
                        <tr key={entry.id}>
                          <td className="py-2 font-mono text-[11px]">
                            {new Date(entry.timestamp).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-2 font-bold">{entry.partnerName}</td>
                          <td className="py-2 capitalize">{entry.type.replace('_', ' ')}</td>
                          <td className="py-2 text-gray-600">{entry.notes}</td>
                          <td className={`py-2 text-right font-bold ${isCredit ? 'text-emerald-700' : 'text-[#D5151B]'}`}>
                            {isCredit ? '+' : '-'}₹{entry.amount}
                          </td>
                          <td className="py-2 text-right font-bold">₹{entry.balanceAfter}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Handover & Return Log */}
      {subTab === 'handovers' && (
        <div className="space-y-3">
          {handovers.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-xs text-gray-500">
              कोई सीलबंद बैग हैंडओवर रिकॉर्ड नहीं है।
            </div>
          ) : (
            handovers.map((h) => {
              const isOverdue =
                (!h.returnTime && Date.now() > new Date(h.deliveryDeadline).getTime()) ||
                h.isOverdue;
              return (
                <div
                  key={h.id}
                  className={`p-4 rounded-2xl bg-white border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                    isOverdue ? 'border-red-300 bg-[#FEF2F2]/40' : 'border-gray-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-[#D5151B]">Bag #{h.sealedBagId}</span>
                      <span className="font-mono text-gray-500">Job #{h.jobId}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          h.returnTime
                            ? 'bg-emerald-100 text-emerald-800'
                            : isOverdue
                            ? 'bg-[#D5151B] text-white'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {h.returnTime ? 'Returned' : isOverdue ? 'OVERDUE > 2H' : 'Active With Partner'}
                      </span>
                    </div>
                    <p className="font-bold text-[#132032]">
                      {h.partnerName} • IMEI Match Check: <span className="font-mono">{h.imei}</span>
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Handover: {new Date(h.handoverTime).toLocaleString('en-IN')} • 2h Deadline:{' '}
                      {new Date(h.deliveryDeadline).toLocaleTimeString('en-IN')}
                      {h.returnTime ? ` • Returned: ${new Date(h.returnTime).toLocaleString('en-IN')}` : ''}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#132032] font-bold flex items-center gap-1 cursor-pointer">
                      <Camera className="w-3.5 h-3.5" />
                      <span>
                        {uploadingHandoverId === h.id
                          ? 'Uploading...'
                          : `Return Photo (${h.returnPhotos?.length || 0})`}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUploadReturnPhoto(h, f);
                        }}
                      />
                    </label>

                    {!h.returnTime && (
                      <button
                        type="button"
                        onClick={() => handleReturnHandover(h)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>Mark Returned</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Partner Add/Edit & Rate Card Modal */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <form
            onSubmit={handleSavePartner}
            className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto text-xs"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-[#132032]">
                {editingPartner ? `Edit Partner: ${editingPartner.name}` : 'Add New Partner'}
              </h3>
              <button type="button" onClick={() => setIsPartnerModalOpen(false)} className="cursor-pointer">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">Partner Name *</label>
                <input
                  type="text"
                  required
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Surat Area *</label>
                <input
                  type="text"
                  required
                  value={pArea}
                  onChange={(e) => setPArea(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Phone *</label>
                <input
                  type="tel"
                  required
                  value={pPhone}
                  onChange={(e) => setPPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Verified Login Email (Grants Partner Role)</label>
                <input
                  type="email"
                  value={pEmail}
                  onChange={(e) => setPEmail(e.target.value)}
                  placeholder="partner@gmail.com"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Advance Balance (₹)</label>
                <input
                  type="number"
                  value={pBalance}
                  onChange={(e) => setPBalance(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Low Balance Alert Threshold (₹)</label>
                <input
                  type="number"
                  value={pThreshold}
                  onChange={(e) => setPThreshold(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={pActive}
                onChange={(e) => setPActive(e.target.checked)}
                className="accent-[#D5151B]"
              />
              <span>Active (Allow Partner Portal access & assignment)</span>
            </label>

            <div className="pt-2 border-t border-gray-100 space-y-2">
              <span className="font-bold text-[#132032] block">Partner Rate Card (₹ per Service)</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {repairPrices.map((rp) => (
                  <div key={rp.id} className="p-2 rounded-xl bg-gray-50 border border-gray-100">
                    <label className="text-[10px] font-bold text-gray-600 block truncate">
                      {rp.id}
                    </label>
                    <input
                      type="number"
                      value={pRateCard[rp.id] ?? 0}
                      onChange={(e) =>
                        setPRateCard((prev) => ({
                          ...prev,
                          [rp.id]: Number(e.target.value) || 0
                        }))
                      }
                      className="w-full mt-1 px-2 py-1 rounded-lg border border-gray-200 bg-white font-mono"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPartnerModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 font-bold text-gray-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="flex-1 py-2.5 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold cursor-pointer disabled:opacity-50"
              >
                {busy ? 'Saving...' : 'Save Partner & Sync Claim'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
