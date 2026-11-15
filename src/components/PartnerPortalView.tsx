import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useApp } from '../context/AppContext';
import { Partner, PartnerJob, PartnerLedgerEntry, PartnerPartUsed, PartnerSubmission } from '../types';
import {
  recordAuditLog,
  subscribeToCollection,
  subscribeToPartnerAssignedJobs
} from '../services/adminService';
import { uploadImageToStorage } from '../utils/storageUpload';
import { SeoHead } from './SeoHead';
import {
  Wrench,
  Clock,
  CheckCircle2,
  Camera,
  Plus,
  Trash2,
  ShieldCheck,
  LogOut,
  AlertCircle,
  Lock
} from 'lucide-react';

const PARTNER_CHECK_OPTIONS = [
  'Display & Touch Tested',
  'Battery Voltage & Charging Amp Checked',
  'Speaker, Mic & Earpiece Tested',
  'Front & Rear Camera Focus Checked',
  'Motherboard / Liquid Oxidation Inspected',
  'Network, WiFi & Sensors Verified',
  'Body Screws & Seal Re-secured'
];

const PARTNER_FAULT_TAGS = [
  'display',
  'battery',
  'motherboard',
  'water damage',
  'charging',
  'audio',
  'camera',
  'software',
  'network'
];

export const PartnerPortalView: React.FC = () => {
  const { user, logoutUser, sessionSecondsRemaining, setIsAuthModalOpen } = useApp();
  const partnerId = user.partnerId || '';

  const [partnerDoc, setPartnerDoc] = useState<Partner | null>(null);
  const [assignedJobs, setAssignedJobs] = useState<PartnerJob[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<PartnerLedgerEntry[]>([]);
  const [selectedJob, setSelectedJob] = useState<PartnerJob | null>(null);

  // Submission Form State
  const [checksDone, setChecksDone] = useState<string[]>([]);
  const [faultsFound, setFaultsFound] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [partsUsed, setPartsUsed] = useState<PartnerPartUsed[]>([]);
  const [repairPhotoUrls, setRepairPhotoUrls] = useState<string[]>([]);
  const [timeTakenMinutes, setTimeTakenMinutes] = useState<number>(30);
  const [remarks, setRemarks] = useState('');
  const [markReady, setMarkReady] = useState(true);

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user.isLoggedIn || !user.isPartner || !partnerId) return;

    getDoc(doc(db, 'partners', partnerId)).then((snap) => {
      if (snap.exists()) setPartnerDoc({ ...(snap.data() as Partner), id: snap.id });
    });

    const unsubJobs = subscribeToPartnerAssignedJobs(partnerId, (jobs) => {
      setAssignedJobs(jobs);
    });

    const unsubLedger = subscribeToCollection<PartnerLedgerEntry>('ledger', 'timestamp', (items) => {
      setLedgerEntries(items.filter((e) => e.partnerId === partnerId));
    });

    return () => {
      unsubJobs();
      unsubLedger();
    };
  }, [user.isLoggedIn, user.isPartner, partnerId]);

  const openJobForm = (job: PartnerJob) => {
    setSelectedJob(job);
    const sub = job.partnerSubmission;
    setChecksDone(sub?.checksDone || []);
    setFaultsFound(sub?.faultsFound || '');
    setTags(sub?.tags || []);
    setPartsUsed(sub?.partsUsed || []);
    setRepairPhotoUrls(sub?.repairPhotoUrls || []);
    setTimeTakenMinutes(sub?.timeTakenMinutes || 30);
    setRemarks(sub?.remarks || '');
    setMarkReady(sub?.readyMarked ?? true);
    setStatusMsg(null);
  };

  if (!user.isLoggedIn || !user.isPartner || !partnerId) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <SeoHead
          title="Partner Portal – Access Denied | Sastafone"
          description="Sastafone Certified Technician Partner Portal"
          canonicalPath="/partner"
          noindex
        />
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
          <Lock className="w-10 h-10 text-[#D5151B] mx-auto" />
          <h1 className="text-lg font-bold text-[#132032]">Partner Access Restricted</h1>
          <p className="text-xs text-gray-600">
            यह पोर्टल केवल सक्रिय और ईमेल-सत्यापित Sastafone Certified Technicians के लिए है।
          </p>
          {!user.isLoggedIn && (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-xs cursor-pointer"
            >
              Partner Account से लॉगिन करें
            </button>
          )}
        </div>
      </div>
    );
  }

  const totalPartsCost = partsUsed.reduce((sum, p) => sum + Number(p.cost || 0), 0);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !selectedJob) return;
    setIsUploading(true);
    setStatusMsg(null);
    try {
      const urls = await Promise.all(
        Array.from(files)
          .slice(0, 4)
          .map((f) => uploadImageToStorage(f, `partner/${partnerId}/${selectedJob.jobId}`))
      );
      setRepairPhotoUrls((prev) => [...prev, ...urls].slice(0, 6));
    } catch (err: any) {
      setStatusMsg(err?.message || 'फोटो अपलोड विफल रहा।');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmitFindings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    if (!faultsFound.trim()) {
      setStatusMsg('कृपया पाया गया फॉल्ट / जांच रिपोर्ट दर्ज करें।');
      return;
    }

    setIsSaving(true);
    setStatusMsg(null);
    const now = new Date().toISOString();

    const submission: PartnerSubmission = {
      checksDone,
      faultsFound: faultsFound.trim(),
      tags,
      partsUsed: partsUsed.filter((p) => p.name.trim()),
      totalPartsCost,
      repairPhotoUrls,
      timeTakenMinutes,
      remarks: remarks.trim(),
      submittedAt: selectedJob.partnerSubmission?.submittedAt || now,
      updatedAt: now,
      readyMarked: markReady,
      costApprovedByAdmin: selectedJob.partnerSubmission?.costApprovedByAdmin || false
    };

    try {
      await updateDoc(doc(db, 'partnerJobs', selectedJob.jobId), {
        partnerSubmission: submission,
        status: markReady ? 'Ready' : 'In repair',
        updatedAt: now
      });

      await recordAuditLog({
        action: markReady ? 'partner_marked_job_ready' : 'partner_updated_findings',
        targetType: 'partnerJob',
        targetId: selectedJob.jobId,
        after: { totalPartsCost, tags, readyMarked: markReady }
      });

      setStatusMsg('✓ रिपेयर रिपोर्ट सफलतापूर्वक सेव हो गई है। एडमिन समीक्षा करेंगे।');
      setSelectedJob(null);
    } catch (err: any) {
      setStatusMsg(err?.message || 'डेटा सेव करने में त्रुटि हुई।');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <SeoHead
        title="Technician Partner Portal | Sastafone"
        description="Sastafone Certified Technician Partner Portal"
        canonicalPath="/partner"
        noindex
      />

      <div className="max-w-4xl mx-auto space-y-5">
        {/* Top Partner Header */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#D5151B] text-[10px] font-bold uppercase border border-red-200">
                Partner Role (Zero-PII View)
              </span>
              {sessionSecondsRemaining !== null && (
                <span className="text-[11px] font-mono text-gray-500">
                  Session: {Math.floor(sessionSecondsRemaining / 60)}:
                  {String(sessionSecondsRemaining % 60).padStart(2, '0')}
                </span>
              )}
            </div>
            <h1 className="text-lg font-bold text-[#132032] mt-1">
              {partnerDoc?.name || user.name}
            </h1>
            <p className="text-xs text-gray-500">
              Area: {partnerDoc?.area || 'Surat'} • Advance Balance:{' '}
              <strong className="text-emerald-700 tabular-nums">
                ₹{(partnerDoc?.advanceBalance ?? 0).toLocaleString('en-IN')}
              </strong>
            </p>
          </div>

          <button
            type="button"
            onClick={logoutUser}
            className="px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-[#132032] flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-[#D5151B]" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Assigned Jobs (Strictly Job ID + Device Details, NEVER customer phone/name/address) */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-[#132032] flex items-center gap-2">
            <Wrench className="w-4 h-4 text-[#D5151B]" />
            <span>असाइन किए गए रिपेयर जॉब्स ({assignedJobs.length})</span>
          </h2>

          {assignedJobs.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-xs text-gray-500">
              अभी कोई जॉब असाइन नहीं है।
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {assignedJobs.map((job) => (
                <div
                  key={job.jobId}
                  className="p-4 rounded-2xl bg-white border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#D5151B]">#{job.jobId}</span>
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[#132032] text-[10px] font-bold">
                        {job.status}
                      </span>
                      {job.sealedBagId && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-mono text-[10px]">
                          Bag #{job.sealedBagId}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-[#132032]">
                      {job.brand} {job.model}
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Services: {job.services?.join(', ')} • Area: {job.pickupSlot?.area} ({job.pickupSlot?.date})
                    </p>
                    {job.partnerSubmission && (
                      <p className="text-[11px] text-emerald-700 font-semibold">
                        Submitted Parts Cost: ₹{job.partnerSubmission.totalPartsCost} •{' '}
                        {job.partnerSubmission.costApprovedByAdmin ? '✓ Approved by Admin' : 'Pending Admin Approval'}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => openJobForm(job)}
                    className="px-4 py-2 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-xs cursor-pointer shrink-0"
                  >
                    {job.partnerSubmission ? 'Edit Findings' : 'Enter Findings & Parts'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Partner Recent Ledger Summary */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 space-y-3">
          <h3 className="text-sm font-bold text-[#132032]">Advance Balance Ledger</h3>
          {ledgerEntries.length === 0 ? (
            <p className="text-xs text-gray-500">कोई लेजर एंट्री नहीं है।</p>
          ) : (
            <div className="divide-y divide-gray-100 text-xs">
              {ledgerEntries.slice(0, 10).map((entry) => (
                <div key={entry.id} className="py-2 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-[#132032]">{entry.notes}</p>
                    <p className="text-[10px] text-gray-400 font-mono">
                      {new Date(entry.timestamp).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right tabular-nums">
                    <span
                      className={`font-bold ${
                        entry.type === 'advance_topup' || entry.type === 'incentive'
                          ? 'text-emerald-700'
                          : 'text-[#D5151B]'
                      }`}
                    >
                      {entry.type === 'advance_topup' || entry.type === 'incentive' ? '+' : '-'}₹
                      {entry.amount}
                    </span>
                    <span className="block text-[10px] text-gray-500">Bal: ₹{entry.balanceAfter}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Partner Findings Form Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <form
            onSubmit={handleSubmitFindings}
            className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-gray-200 max-h-[92vh] overflow-y-auto text-xs"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#D5151B]">#{selectedJob.jobId}</span>
                <h3 className="text-base font-bold text-[#132032]">
                  {selectedJob.brand} {selectedJob.model} — Repair Entry
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="text-gray-500 hover:text-[#132032] font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

            {statusMsg && (
              <div className="p-3 rounded-xl bg-[#FEF2F2] border border-red-200 text-[#D5151B] font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{statusMsg}</span>
              </div>
            )}

            {/* Checks Done */}
            <div>
              <label className="block font-bold text-[#132032] mb-1.5">Checks Done</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {PARTNER_CHECK_OPTIONS.map((chk) => {
                  const checked = checksDone.includes(chk);
                  return (
                    <label
                      key={chk}
                      className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer ${
                        checked ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setChecksDone((prev) =>
                            checked ? prev.filter((c) => c !== chk) : [...prev, chk]
                          )
                        }
                        className="accent-emerald-600"
                      />
                      <span>{chk}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block font-bold text-[#132032] mb-1.5">Problem Tags</label>
              <div className="flex flex-wrap gap-1.5">
                {PARTNER_FAULT_TAGS.map((tag) => {
                  const active = tags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        setTags((prev) =>
                          active ? prev.filter((t) => t !== tag) : [...prev, tag]
                        )
                      }
                      className={`px-2.5 py-1 rounded-lg border font-bold capitalize cursor-pointer ${
                        active ? 'bg-[#D5151B] text-white border-[#D5151B]' : 'bg-white border-gray-200 text-gray-700'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Faults Found */}
            <div>
              <label className="block font-bold text-[#132032] mb-1">Faults Found *</label>
              <textarea
                rows={2}
                required
                value={faultsFound}
                onChange={(e) => setFaultsFound(e.target.value)}
                placeholder="पाया गया मुख्य हार्डवेयर/सॉफ्टवेयर फॉल्ट लिखें..."
                className="w-full p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#D5151B]"
              />
            </div>

            {/* Parts Used + Cost */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-[#132032]">
                  Parts Used & Cost (Total: ₹{totalPartsCost})
                </label>
                <button
                  type="button"
                  onClick={() => setPartsUsed((prev) => [...prev, { name: '', cost: 0 }])}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Part</span>
                </button>
              </div>
              {partsUsed.map((part, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="Part name (e.g. iPhone 13 OLED)"
                    value={part.name}
                    onChange={(e) => {
                      const next = [...partsUsed];
                      next[idx].name = e.target.value;
                      setPartsUsed(next);
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200"
                  />
                  <input
                    type="number"
                    placeholder="₹ Cost"
                    value={part.cost}
                    onChange={(e) => {
                      const next = [...partsUsed];
                      next[idx].cost = Number(e.target.value) || 0;
                      setPartsUsed(next);
                    }}
                    className="w-24 px-3 py-1.5 rounded-xl border border-gray-200 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setPartsUsed((prev) => prev.filter((_, i) => i !== idx))}
                    className="p-1.5 text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Time Taken + Photos + Remarks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#132032] mb-1">Time Taken (Minutes)</label>
                <input
                  type="number"
                  min={5}
                  value={timeTakenMinutes}
                  onChange={(e) => setTimeTakenMinutes(Number(e.target.value) || 15)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-[#132032] mb-1">Repair Photos</label>
                <label className="w-full py-2 px-3 rounded-xl border border-dashed border-red-300 bg-[#FEF2F2] text-[#D5151B] font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                  <Camera className="w-4 h-4" />
                  <span>{isUploading ? 'Uploading...' : `Upload Photos (${repairPhotoUrls.length})`}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isUploading}
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#132032] mb-1">Technician Remarks</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="अतिरिक्त टिप्पणी..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200"
              />
            </div>

            <label className="flex items-center gap-2 font-bold text-[#132032] cursor-pointer">
              <input
                type="checkbox"
                checked={markReady}
                onChange={(e) => setMarkReady(e.target.checked)}
                className="accent-emerald-600"
              />
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Mark Job Ready for Delivery (Admin review required for ledger deduction)</span>
            </label>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedJob(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || isUploading}
                className="flex-1 py-2.5 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSaving ? 'Submitting...' : 'Submit & Save'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
