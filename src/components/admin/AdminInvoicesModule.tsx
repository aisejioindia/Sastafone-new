import React, { useMemo, useState } from 'react';
import {
  AdminSettings,
  InvoiceRecord,
  Job,
  Partner
} from '../../types';
import {
  downloadCsvFile,
  generateInvoiceForJob,
  recordAuditLog,
  voidInvoiceInFirestore
} from '../../services/adminService';
import { SastafoneLogo } from '../SastafoneLogo';
import {
  FileText,
  Printer,
  MessageCircle,
  Ban,
  RefreshCw,
  Search,
  Download,
  ShieldCheck,
  X,
  Plus
} from 'lucide-react';

interface AdminInvoicesModuleProps {
  invoices: InvoiceRecord[];
  jobs: Job[];
  partners: Partner[];
  adminSettings: AdminSettings;
  supportEmail: string;
  businessHours: string;
}

export const AdminInvoicesModule: React.FC<AdminInvoicesModuleProps> = ({
  invoices,
  jobs,
  partners,
  adminSettings,
  supportEmail,
  businessHours
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'voided'>('all');
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceRecord | null>(null);
  const [voidTarget, setVoidTarget] = useState<InvoiceRecord | null>(null);
  const [voidReason, setVoidReason] = useState('');
  const [reissueAfterVoid, setReissueAfterVoid] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Quick Create Invoice for Delivered / Ready Job without invoice
  const [selectedJobToBill, setSelectedJobToBill] = useState('');

  const unbilledJobs = useMemo(
    () =>
      jobs.filter(
        (j) =>
          !j.invoiceId &&
          ['Quote approved', 'In repair', 'Ready', 'Delivered'].includes(j.status)
      ),
    [jobs]
  );

  const filteredInvoices = useMemo(() => {
    const q = search.toLowerCase().trim();
    return invoices.filter((inv) => {
      const invStatus = inv.status || 'active';
      if (statusFilter !== 'all' && invStatus !== statusFilter) return false;
      if (!q) return true;
      return (
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        inv.customerPhone.includes(q) ||
        (inv.jobId || '').toLowerCase().includes(q) ||
        `${inv.brand} ${inv.model}`.toLowerCase().includes(q)
      );
    });
  }, [invoices, search, statusFilter]);

  // Monthly Sales & Margin Report
  const monthlyReport = useMemo(() => {
    const buckets: Record<
      string,
      {
        month: string;
        count: number;
        grossSales: number;
        gstCollected: number;
        partsAndPartnerCost: number;
        pickupCost: number;
        netMargin: number;
      }
    > = {};

    invoices
      .filter((inv) => inv.status !== 'voided')
      .forEach((inv) => {
        const dt = new Date(inv.date || inv.createdAt);
        const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
        if (!buckets[key]) {
          buckets[key] = {
            month: key,
            count: 0,
            grossSales: 0,
            gstCollected: 0,
            partsAndPartnerCost: 0,
            pickupCost: 0,
            netMargin: 0
          };
        }
        const linkedJob = jobs.find((j) => j.jobId === inv.jobId);
        const partner = linkedJob ? partners.find((p) => p.id === linkedJob.partnerId) : undefined;
        const pCost =
          inv.partsCost > 0
            ? inv.partsCost
            : linkedJob?.partnerFindings?.totalPartsCost || partner?.rateCard?.display || 350;
        const logCost = linkedJob?.pickupCost ?? 70;
        const gst = inv.gstAmount || 0;
        const exGstTotal = Math.max(0, (inv.finalTotal || 0) - gst);

        buckets[key].count += 1;
        buckets[key].grossSales += inv.finalTotal || 0;
        buckets[key].gstCollected += gst;
        buckets[key].partsAndPartnerCost += pCost;
        buckets[key].pickupCost += logCost;
        buckets[key].netMargin += Math.max(0, exGstTotal - pCost - logCost);
      });

    return Object.values(buckets).sort((a, b) => b.month.localeCompare(a.month));
  }, [invoices, jobs, partners]);

  const handleGenerateInvoice = async () => {
    const job = jobs.find((j) => j.jobId === selectedJobToBill);
    if (!job) return;
    setIsProcessing(true);
    try {
      const inv = await generateInvoiceForJob({ job, adminSettings });
      setPreviewInvoice(inv);
      setSelectedJobToBill('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVoidAndReissue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voidTarget || !voidReason.trim()) return;
    setIsProcessing(true);
    try {
      await voidInvoiceInFirestore(voidTarget.id, voidReason.trim());
      if (reissueAfterVoid && voidTarget.jobId) {
        const job = jobs.find((j) => j.jobId === voidTarget.jobId);
        if (job) {
          const newInv = await generateInvoiceForJob({
            job,
            adminSettings,
            replacesInvoiceId: voidTarget.id
          });
          setPreviewInvoice(newInv);
        }
      }
      setVoidTarget(null);
      setVoidReason('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportMonthlyCsv = () => {
    const headers = [
      'month',
      'count',
      'grossSales',
      'gstCollected',
      'partsAndPartnerCost',
      'pickupCost',
      'netMargin'
    ];
    downloadCsvFile(
      `sastafone-monthly-sales-margin-${new Date().toISOString().split('T')[0]}.csv`,
      headers,
      monthlyReport
    );
    recordAuditLog({
      action: 'export_monthly_sales_csv',
      targetType: 'report',
      targetId: 'monthly_sales_margin'
    });
  };

  const handleExportInvoicesCsv = () => {
    const headers = [
      'invoiceNumber',
      'status',
      'jobId',
      'date',
      'customerName',
      'customerPhone',
      'area',
      'brand',
      'model',
      'imei',
      'subtotal',
      'discountAmount',
      'visitFeeAdjusted',
      'gstEnabled',
      'gstAmount',
      'finalTotal',
      'paymentMethod',
      'warrantyMonths'
    ];
    downloadCsvFile(
      `sastafone-invoices-${new Date().toISOString().split('T')[0]}.csv`,
      headers,
      filteredInvoices
    );
  };

  return (
    <div className="space-y-6">
      {/* Quick Generate Invoice Bar */}
      <div className="p-4 rounded-2xl bg-white border border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <select
            value={selectedJobToBill}
            onChange={(e) => setSelectedJobToBill(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white outline-none focus:border-[#D5151B]"
          >
            <option value="">-- इनवॉइस बनाने के लिए जॉब चुनें ({unbilledJobs.length} उपलब्ध) --</option>
            {unbilledJobs.map((j) => (
              <option key={j.jobId} value={j.jobId}>
                #{j.jobId} • {j.name} • {j.brand} {j.model} (₹{j.finalPrice || j.estMax})
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!selectedJobToBill || isProcessing}
            onClick={handleGenerateInvoice}
            className="px-4 py-2 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Invoice</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportInvoicesCsv}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-bold text-[#132032] flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#D5151B]" />
            <span>Invoices CSV</span>
          </button>
          <button
            type="button"
            onClick={handleExportMonthlyCsv}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-bold text-[#132032] flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sales & Margin CSV</span>
          </button>
        </div>
      </div>

      {/* Monthly Sales & Margin Report */}
      <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#132032]">मासिक बिक्री व मार्जिन रिपोर्ट (Monthly Sales & Margin)</h3>
            <p className="text-[11px] text-gray-500">केवल सक्रिय (Active) इनवॉइस पर आधारित</p>
          </div>
          <span className="text-[11px] text-gray-500 font-bold">
            GST: {adminSettings.gstEnabled ? `${adminSettings.gstPct}% (${adminSettings.gstin || 'Configured'})` : 'Disabled'}
          </span>
        </div>

        {monthlyReport.length === 0 ? (
          <p className="text-xs text-gray-500 py-4 text-center">अभी कोई मासिक इनवॉइस डेटा उपलब्ध नहीं है।</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 font-bold text-[11px]">
                  <th className="py-2 pr-3">Month</th>
                  <th className="py-2 px-2">Invoices</th>
                  <th className="py-2 px-2 text-right">Gross Sales</th>
                  <th className="py-2 px-2 text-right">GST</th>
                  <th className="py-2 px-2 text-right">Partner / Parts</th>
                  <th className="py-2 px-2 text-right">Pickup</th>
                  <th className="py-2 pl-2 text-right">Net Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 tabular-nums">
                {monthlyReport.map((m) => (
                  <tr key={m.month} className="hover:bg-gray-50">
                    <td className="py-2.5 pr-3 font-bold text-[#132032]">{m.month}</td>
                    <td className="py-2.5 px-2">{m.count}</td>
                    <td className="py-2.5 px-2 text-right font-bold">₹{m.grossSales.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-2 text-right text-gray-600">₹{m.gstCollected.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-2 text-right text-gray-600">-₹{m.partsAndPartnerCost.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-2 text-right text-gray-600">-₹{m.pickupCost.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 pl-2 text-right font-bold text-emerald-700">₹{m.netMargin.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Filter & Invoice Registry */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="इनवॉइस नंबर, जॉब ID, ग्राहक नाम या मोबाइल से खोजें..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-white text-xs outline-none focus:border-[#D5151B]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-[#132032]"
          >
            <option value="all">सभी इनवॉइस ({invoices.length})</option>
            <option value="active">सक्रिय (Active)</option>
            <option value="voided">निरस्त (Voided)</option>
          </select>
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-xs text-gray-500">
            कोई इनवॉइस रिकॉर्ड नहीं मिला।
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredInvoices.map((inv) => {
              const isVoided = inv.status === 'voided';
              const waMessage = encodeURIComponent(
                `नमस्ते ${inv.customerName}! Sastafone Surat से आपका इनवॉइस #${inv.invoiceNumber}\nडिवाइस: ${inv.brand} ${inv.model} (IMEI: ${inv.imei})\nअंतिम राशि: ₹${inv.finalTotal}\nवारंटी: ${inv.warrantyMonths >= 6 ? '6 महीने' : '7 दिन टेस्टिंग'}\nजांचें: https://sastafone.in/warranty`
              );
              const cleanPhone = (inv.customerPhone || '').replace(/\D/g, '').slice(-10);

              return (
                <div
                  key={inv.id}
                  className={`p-4 rounded-2xl border bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isVoided ? 'border-rose-200 bg-rose-50/30 opacity-80' : 'border-gray-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#D5151B]">
                        #{inv.invoiceNumber}
                      </span>
                      {inv.jobId && (
                        <span className="text-[11px] font-mono text-gray-500">Job #{inv.jobId}</span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isVoided
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isVoided ? 'VOIDED' : 'ACTIVE'}
                      </span>
                      {inv.warrantyMonths >= 6 && !isVoided && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF2F2] text-[#D5151B] border border-red-200">
                          6-Mo Warranty
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-[#132032]">
                      {inv.customerName} (+91 {inv.customerPhone}) • {inv.brand} {inv.model}
                    </h4>
                    <p className="text-[11px] text-gray-500">
                      तारीख: {new Date(inv.date || inv.createdAt).toLocaleDateString('hi-IN')} • IMEI:{' '}
                      <span className="font-mono">{inv.imei || 'N/A'}</span>
                      {inv.gstEnabled ? ` • GST (${inv.gstPct}%): ₹${inv.gstAmount}` : ''}
                    </p>
                    {isVoided && inv.voidReason && (
                      <p className="text-[11px] text-rose-700 font-semibold">
                        Void Reason: {inv.voidReason}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-right mr-2">
                      <span className="text-base font-bold text-[#132032] tabular-nums block">
                        ₹{(inv.finalTotal || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        टोकन समायोजन: -₹{inv.visitFeeAdjusted || 0}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPreviewInvoice(inv)}
                      className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#132032] text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>PDF / देखें</span>
                    </button>

                    {cleanPhone.length === 10 && !isVoided && (
                      <a
                        href={`https://wa.me/91${cleanPhone}?text=${waMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          recordAuditLog({
                            action: 'invoice_whatsapp_resent',
                            targetType: 'invoice',
                            targetId: inv.id,
                            reason: `Sent #${inv.invoiceNumber} to +91${cleanPhone}`
                          })
                        }
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Resend</span>
                      </a>
                    )}

                    {!isVoided && (
                      <button
                        type="button"
                        onClick={() => {
                          setVoidTarget(inv);
                          setVoidReason('');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>Void / Reissue</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invoice PDF Print Modal */}
      {previewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between no-print">
              <span className="text-xs font-bold text-[#132032] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#D5151B]" />
                <span>Invoice #{previewInvoice.invoiceNumber}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewInvoice(null)}
                  className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-5 text-xs bg-white text-[#132032]">
              <div className="flex flex-col sm:flex-row justify-between gap-4 border-b border-gray-200 pb-4">
                <div>
                  <SastafoneLogo variant="light" size="sm" showSubtitle={false} />
                  <p className="text-[11px] text-gray-600 mt-1 font-semibold">
                    {adminSettings.businessLegalName || 'Sastafone Surat'} • {adminSettings.businessAddress}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {supportEmail} • {businessHours}
                  </p>
                  {previewInvoice.gstEnabled && previewInvoice.gstin && (
                    <p className="text-[11px] font-mono text-gray-700 mt-0.5">
                      GSTIN: {previewInvoice.gstin}
                    </p>
                  )}
                </div>

                <div className="sm:text-right space-y-1">
                  <span className="px-2.5 py-0.5 rounded-md bg-red-100 text-[#D5151B] font-bold text-[10px] uppercase">
                    {previewInvoice.status === 'voided' ? 'VOIDED INVOICE' : previewInvoice.gstEnabled ? 'TAX INVOICE' : 'REPAIR INVOICE'}
                  </span>
                  <p className="text-sm font-bold font-mono">#{previewInvoice.invoiceNumber}</p>
                  <p className="text-[11px] text-gray-500">
                    Date: {new Date(previewInvoice.date || previewInvoice.createdAt).toLocaleDateString('en-IN')}
                  </p>
                  <p className="text-[11px] font-bold text-emerald-700">
                    Payment: {previewInvoice.paymentStatus?.toUpperCase() || 'PAID'} ({previewInvoice.paymentMethod})
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-200">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Bill To</span>
                  <p className="font-bold text-sm">{previewInvoice.customerName}</p>
                  <p className="font-mono text-gray-600">+91 {previewInvoice.customerPhone}</p>
                  <p className="text-gray-600 mt-0.5">{previewInvoice.customerAddress}</p>
                  <p className="font-bold text-[#D5151B] mt-0.5">{previewInvoice.area}, Surat</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Device Details</span>
                  <p className="font-bold text-sm">
                    {previewInvoice.brand} {previewInvoice.model}
                  </p>
                  <p className="font-mono text-gray-700 mt-0.5">IMEI: {previewInvoice.imei || 'Verified'}</p>
                  {previewInvoice.jobId && (
                    <p className="font-mono text-gray-500 mt-0.5">Job Ref: #{previewInvoice.jobId}</p>
                  )}
                </div>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 font-bold text-[11px]">
                    <th className="py-2">Service / Part Item</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 tabular-nums">
                  {previewInvoice.services?.map((srv, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-semibold">{srv.name}</td>
                      <td className="py-2.5 text-right font-bold">₹{srv.price}</td>
                    </tr>
                  ))}
                  {previewInvoice.parts && previewInvoice.parts.length > 0 && (
                    <tr>
                      <td className="py-2 text-gray-600" colSpan={2}>
                        Spare Parts Used: {previewInvoice.parts.map((p) => p.name).join(', ')}
                      </td>
                    </tr>
                  )}
                  {previewInvoice.discountAmount > 0 && (
                    <tr className="text-emerald-700">
                      <td className="py-2">
                        Discount {previewInvoice.discountPct ? `(${previewInvoice.discountPct}%)` : ''}
                        {previewInvoice.discountReason ? ` — ${previewInvoice.discountReason}` : ''}
                      </td>
                      <td className="py-2 text-right font-bold">-₹{previewInvoice.discountAmount}</td>
                    </tr>
                  )}
                  {previewInvoice.visitFeeAdjusted > 0 && (
                    <tr className="text-emerald-700 bg-emerald-50/40">
                      <td className="py-2 px-1">Visit Token Adjusted in Final Bill</td>
                      <td className="py-2 text-right font-bold">-₹{previewInvoice.visitFeeAdjusted}</td>
                    </tr>
                  )}
                  {previewInvoice.gstEnabled && (previewInvoice.gstAmount || 0) > 0 && (
                    <tr>
                      <td className="py-2 text-gray-600">GST ({previewInvoice.gstPct}%)</td>
                      <td className="py-2 text-right font-bold">+₹{previewInvoice.gstAmount}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-red-200 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#D5151B] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#132032]">
                    {previewInvoice.warrantyMonths >= 6
                      ? `6-Month Warranty Card (Valid till ${
                          previewInvoice.warrantyExpiry
                            ? new Date(previewInvoice.warrantyExpiry).toLocaleDateString('en-IN')
                            : '6 Months'
                        })`
                      : '7-Day Testing Guarantee'}
                  </p>
                  <p className="text-[11px] text-gray-600 mt-0.5">{previewInvoice.warrantyTerms}</p>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-[#132032] flex items-center justify-between">
                <div className="text-[11px] text-gray-500">
                  Verify warranty anytime at <strong>sastafone.in/warranty</strong>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-gray-500 block">Final Total (After Adjustments)</span>
                  <span className="text-2xl font-bold text-[#D5151B] tabular-nums">
                    ₹{Math.max(0, previewInvoice.finalTotal - (previewInvoice.visitFeeAdjusted || 0))}
                  </span>
                  <span className="text-[10px] text-gray-500 block tabular-nums">
                    Gross Billed: ₹{previewInvoice.finalTotal}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Void & Reissue Modal */}
      {voidTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <form
            onSubmit={handleVoidAndReissue}
            className="bg-white rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-gray-200 text-xs"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-[#132032]">
                Void Invoice #{voidTarget.invoiceNumber}
              </h3>
              <button type="button" onClick={() => setVoidTarget(null)} className="cursor-pointer">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">
                निरस्त करने का कारण (Audit Log Reason) *
              </label>
              <textarea
                rows={2}
                required
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="उदा. ग्राहक द्वारा डिस्काउंट/पार्ट्स अपडेट के बाद नया बिल जारी..."
                className="w-full p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#D5151B]"
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-medium text-[#132032] cursor-pointer">
              <input
                type="checkbox"
                checked={reissueAfterVoid}
                onChange={(e) => setReissueAfterVoid(e.target.checked)}
                className="accent-[#D5151B]"
              />
              <span>तुरंत नया अपडेटेड इनवॉइस (Reissue) बनाएं</span>
            </label>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setVoidTarget(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 font-bold text-gray-700 cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                disabled={isProcessing || !voidReason.trim()}
                className="flex-1 py-2.5 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{reissueAfterVoid ? 'Void & Reissue' : 'Confirm Void'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
