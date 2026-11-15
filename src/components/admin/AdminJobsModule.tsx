import React, { useMemo, useState } from 'react';
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
import { downloadCsvFile } from '../../services/adminService';
import { AdminJobDetailDrawer } from './AdminJobDetailDrawer';
import { PickupQCScreen } from '../PickupQCScreen';
import {
  Search,
  Download,
  Phone,
  MessageCircle,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

interface AdminJobsModuleProps {
  jobs: Job[];
  partners: Partner[];
  repairPrices: RepairPrice[];
  handovers: JobHandoverRecord[];
  invoices: InvoiceRecord[];
  reviews: RealCustomerReview[];
  adminSettings: AdminSettings;
  googleReviewUrl: string;
  initialStatusFilter?: string;
  initialOverdueOnly?: boolean;
}

export const AdminJobsModule: React.FC<AdminJobsModuleProps> = ({
  jobs,
  partners,
  repairPrices,
  handovers,
  invoices,
  reviews,
  adminSettings,
  googleReviewUrl,
  initialStatusFilter = 'all',
  initialOverdueOnly = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter);
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [partnerFilter, setPartnerFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [overdueOnly, setOverdueOnly] = useState<boolean>(initialOverdueOnly);

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [qcJob, setQcJob] = useState<Job | null>(null);

  const activeHandoverMap = useMemo(() => {
    const map = new Map<string, JobHandoverRecord>();
    handovers.forEach((h) => {
      if (!h.returnTime) map.set(h.jobId, h);
    });
    return map;
  }, [handovers]);

  const isJobOverdue = (j: Job): boolean => {
    if (['Delivered', 'Cancelled', 'Declined', 'Ready'].includes(j.status)) return false;
    const h = activeHandoverMap.get(j.jobId);
    if (h?.deliveryDeadline) return Date.now() > new Date(h.deliveryDeadline).getTime();
    if (j.approvedAt && j.status === 'In repair') {
      return Date.now() - new Date(j.approvedAt).getTime() > 2 * 60 * 60 * 1000;
    }
    return false;
  };

  const areas = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      if (j.area) set.add(j.area);
    });
    return Array.from(set).sort();
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return jobs.filter((j) => {
      if (statusFilter !== 'all' && j.status !== statusFilter) return false;
      if (areaFilter !== 'all' && j.area !== areaFilter) return false;
      if (partnerFilter !== 'all') {
        if (partnerFilter === 'unassigned' && j.partnerId) return false;
        if (partnerFilter !== 'unassigned' && j.partnerId !== partnerFilter) return false;
      }
      if (paymentFilter !== 'all') {
        const paySt = j.paymentStatus || (j.visitFeePaid ? 'paid' : 'pending');
        if (paySt !== paymentFilter) return false;
      }
      if (dateFrom && (j.pickupSlot?.date || j.createdAt.split('T')[0]) < dateFrom) return false;
      if (dateTo && (j.pickupSlot?.date || j.createdAt.split('T')[0]) > dateTo) return false;
      if (overdueOnly && !isJobOverdue(j)) return false;

      if (q) {
        const hay = `${j.jobId} ${j.name} ${j.phone} ${j.brand} ${j.model} ${j.area}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [
    jobs,
    searchQuery,
    statusFilter,
    areaFilter,
    partnerFilter,
    paymentFilter,
    dateFrom,
    dateTo,
    overdueOnly
  ]);

  const selectedJob = useMemo(
    () => jobs.find((j) => j.jobId === selectedJobId) || null,
    [jobs, selectedJobId]
  );

  const handleExportCsv = () => {
    const headers = [
      'jobId',
      'status',
      'name',
      'phone',
      'area',
      'address',
      'brand',
      'model',
      'services',
      'estMin',
      'estMax',
      'finalPrice',
      'discountPct',
      'visitFeePaid',
      'paymentStatus',
      'razorpayPaymentId',
      'partnerId',
      'createdAt'
    ];
    downloadCsvFile(
      `sastafone-jobs-${new Date().toISOString().split('T')[0]}.csv`,
      headers,
      filteredJobs
    );
  };

  return (
    <div className="space-y-4">
      {/* Multi-Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Job ID, Name, Phone, or Model..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#D5151B]"
            />
          </div>

          <button
            type="button"
            onClick={() => setOverdueOnly((v) => !v)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 cursor-pointer ${
              overdueOnly
                ? 'bg-[#D5151B] text-white border-[#D5151B]'
                : 'bg-[#FEF2F2] text-[#D5151B] border-red-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Overdue (&gt;2h)</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-bold text-[#132032] flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#D5151B]" />
            <span>CSV ({filteredJobs.length})</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-2 rounded-xl border border-gray-200 bg-white font-semibold"
          >
            <option value="all">All Statuses</option>
            {(
              [
                'Booked',
                'Pickup scheduled',
                'Picked up',
                'Quote approved',
                'In repair',
                'Ready',
                'Delivered',
                'Cancelled',
                'Declined'
              ] as JobStatus[]
            ).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="px-2.5 py-2 rounded-xl border border-gray-200 bg-white font-semibold"
          >
            <option value="all">All Areas</option>
            {areas.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <select
            value={partnerFilter}
            onChange={(e) => setPartnerFilter(e.target.value)}
            className="px-2.5 py-2 rounded-xl border border-gray-200 bg-white font-semibold"
          >
            <option value="all">All Partners</option>
            <option value="unassigned">Unassigned</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-2.5 py-2 rounded-xl border border-gray-200 bg-white font-semibold"
          >
            <option value="all">All Payments</option>
            <option value="paid">Token/Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
            <option value="partially_refunded">Partially Refunded</option>
          </select>

          <div className="col-span-2 sm:col-span-1 flex gap-1">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              title="From date"
              className="w-1/2 px-1.5 py-1.5 rounded-xl border border-gray-200 text-[11px] font-mono"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              title="To date"
              className="w-1/2 px-1.5 py-1.5 rounded-xl border border-gray-200 text-[11px] font-mono"
            />
          </div>
        </div>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-2xl border border-gray-200 text-xs text-gray-500">
          फ़िल्टर के अनुसार कोई जॉब नहीं मिला।
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredJobs.map((job) => {
            const partner = partners.find((p) => p.id === job.partnerId);
            const overdue = isJobOverdue(job);
            const cleanPhone = (job.phone || '').replace(/\D/g, '').slice(-10);

            return (
              <div
                key={job.jobId}
                onClick={() => setSelectedJobId(job.jobId)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setSelectedJobId(job.jobId);
                }}
                className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  overdue
                    ? 'border-red-300 bg-[#FEF2F2]/40 hover:border-[#D5151B]'
                    : 'border-gray-200 hover:border-[#D5151B]/50'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#D5151B]">#{job.jobId}</span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[#132032] text-[10px] font-bold">
                      {job.status}
                    </span>
                    {overdue && (
                      <span className="px-2 py-0.5 rounded-full bg-[#D5151B] text-white text-[10px] font-bold">
                        OVERDUE &gt;2H
                      </span>
                    )}
                    {job.visitFeePaid && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        ₹199 Paid
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-[#132032] truncate">
                    {job.name} • {job.brand} {job.model}
                  </h3>

                  <p className="text-[11px] text-gray-500 truncate">
                    {job.area} • Slot: {job.pickupSlot?.date} ({job.pickupSlot?.window}) • Partner:{' '}
                    <strong>{partner ? partner.name : 'Unassigned'}</strong>
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <div className="text-right tabular-nums">
                    <span className="text-sm font-bold text-[#132032] block">
                      ₹{(job.finalPrice || job.estMax || 0).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Est: ₹{job.estMin}–₹{job.estMax}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={`tel:+91${cleanPhone}`}
                      className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#132032]"
                      title="Call Customer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={`https://wa.me/91${cleanPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
                      title="WhatsApp Customer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Job Detail Drawer */}
      {selectedJob && (
        <AdminJobDetailDrawer
          job={selectedJob}
          partners={partners}
          repairPrices={repairPrices}
          handovers={handovers}
          invoices={invoices}
          reviews={reviews}
          adminSettings={adminSettings}
          googleReviewUrl={googleReviewUrl}
          onClose={() => setSelectedJobId(null)}
          onOpenQC={(j) => setQcJob(j)}
        />
      )}

      {/* 11-Point QC Screen Modal */}
      {qcJob && (
        <PickupQCScreen
          job={qcJob}
          allRepairPrices={repairPrices}
          onClose={() => setQcJob(null)}
          onSuccess={() => setQcJob(null)}
        />
      )}
    </div>
  );
};
