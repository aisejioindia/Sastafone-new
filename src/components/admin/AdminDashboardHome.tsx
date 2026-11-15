import React, { useMemo } from 'react';
import {
  Job,
  Partner,
  JobHandoverRecord,
  InvoiceRecord
} from '../../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  Inbox,
  Truck,
  Wrench,
  PackageCheck,
  AlertTriangle,
  Clock,
  IndianRupee,
  TrendingUp,
  CreditCard,
  RotateCcw
} from 'lucide-react';

interface AdminDashboardHomeProps {
  jobs: Job[];
  partners: Partner[];
  handovers: JobHandoverRecord[];
  invoices: InvoiceRecord[];
  onQuickFilter: (tab: 'jobs', filterStatus?: string, overdueOnly?: boolean) => void;
}

export const AdminDashboardHome: React.FC<AdminDashboardHomeProps> = ({
  jobs,
  partners,
  handovers,
  invoices,
  onQuickFilter
}) => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const metrics = useMemo(() => {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfWeek = startOfToday - 6 * 24 * 60 * 60 * 1000;
    const startOfMonth = startOfToday - 29 * 24 * 60 * 60 * 1000;

    const newLeads = jobs.filter((j) => j.status === 'Booked').length;
    const pickupsToday = jobs.filter(
      (j) =>
        j.pickupSlot?.date === todayStr &&
        j.status !== 'Cancelled' &&
        j.status !== 'Declined' &&
        j.status !== 'Delivered'
    ).length;
    const inRepair = jobs.filter(
      (j) => j.status === 'In repair' || j.status === 'Picked up' || j.status === 'Quote approved'
    ).length;
    const deliveriesToday = jobs.filter(
      (j) =>
        j.status === 'Ready' ||
        (j.status === 'Delivered' && (j.deliveredAt || j.updatedAt || '').startsWith(todayStr))
    ).length;

    // Overdue vs 2-hour target
    const activeHandoverByJob = new Map<string, JobHandoverRecord>();
    handovers.forEach((h) => {
      if (!h.returnTime) activeHandoverByJob.set(h.jobId, h);
    });

    const overdueJobs = jobs.filter((j) => {
      if (['Delivered', 'Cancelled', 'Declined', 'Ready'].includes(j.status)) return false;
      const handover = activeHandoverByJob.get(j.jobId);
      if (handover?.deliveryDeadline) {
        return Date.now() > new Date(handover.deliveryDeadline).getTime();
      }
      if (j.approvedAt && j.status === 'In repair') {
        return Date.now() - new Date(j.approvedAt).getTime() > 2 * 60 * 60 * 1000;
      }
      return false;
    }).length;

    const pendingApprovals = jobs.filter(
      (j) => j.status === 'Picked up' && !j.customerApproved
    ).length;

    let revToday = 0;
    let revWeek = 0;
    let revMonth = 0;
    let marginMonth = 0;
    let paymentsReceivedCount = 0;
    let paymentsReceivedAmount = 0;
    let refundsCount = 0;
    let refundsAmount = 0;

    jobs.forEach((j) => {
      const ts = new Date(j.createdAt || now).getTime();
      const bill = Number(j.finalPrice || (j.status === 'Delivered' ? j.estMax : 0) || 0);
      const isRecognized = ['Quote approved', 'In repair', 'Ready', 'Delivered'].includes(j.status);

      const partner = partners.find((p) => p.id === j.partnerId);
      const partsCost = j.partnerFindings?.totalPartsCost || 0;
      const partnerRate = partsCost > 0 ? partsCost : partner?.rateCard?.display || 350;
      const pickupCost = Number(j.pickupCost ?? 70);
      const jobMargin = Math.max(0, bill - partnerRate - pickupCost);

      if (isRecognized && bill > 0) {
        if (ts >= startOfToday) revToday += bill;
        if (ts >= startOfWeek) revWeek += bill;
        if (ts >= startOfMonth) {
          revMonth += bill;
          marginMonth += jobMargin;
        }
      }

      if (j.visitFeePaid || j.razorpayPaymentId || j.paymentStatus === 'paid') {
        paymentsReceivedCount += 1;
        paymentsReceivedAmount += j.status === 'Delivered' && bill > 0 ? bill : 199;
      }

      if (j.paymentStatus === 'refunded' || j.paymentStatus === 'partially_refunded' || (j.refundAmount || 0) > 0) {
        refundsCount += 1;
        refundsAmount += Number(j.refundAmount || 99);
      } else if (j.status === 'Declined') {
        refundsCount += 1;
        refundsAmount += 99;
      }
    });

    // Also include active invoices created within last 30 days if higher precision exists
    const activeInvCount = invoices.filter((i) => i.status !== 'voided').length;

    return {
      newLeads,
      pickupsToday,
      inRepair,
      deliveriesToday,
      overdueJobs,
      pendingApprovals,
      revToday,
      revWeek,
      revMonth,
      marginMonth,
      paymentsReceivedCount,
      paymentsReceivedAmount,
      refundsCount,
      refundsAmount,
      activeInvCount
    };
  }, [jobs, partners, handovers, invoices, todayStr]);

  // Build 30-day trend data
  const chartData30d = useMemo(() => {
    const days: {
      dateKey: string;
      label: string;
      revenue: number;
      margin: number;
      jobs: number;
      refunds: number;
    }[] = [];

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = `${d.getDate()}/${d.getMonth() + 1}`;
      days.push({ dateKey: key, label, revenue: 0, margin: 0, jobs: 0, refunds: 0 });
    }

    const dayMap = new Map(days.map((d) => [d.dateKey, d]));

    jobs.forEach((j) => {
      const key = (j.createdAt || '').split('T')[0];
      const bucket = dayMap.get(key);
      if (!bucket) return;

      bucket.jobs += 1;
      const bill = Number(j.finalPrice || j.estMax || 0);
      const isRecognized = ['Quote approved', 'In repair', 'Ready', 'Delivered'].includes(j.status);
      if (isRecognized && bill > 0) {
        const partsCost = j.partnerFindings?.totalPartsCost || 0;
        const partner = partners.find((p) => p.id === j.partnerId);
        const estCost = partsCost > 0 ? partsCost : partner?.rateCard?.display || 350;
        const net = Math.max(0, bill - estCost - Number(j.pickupCost ?? 70));
        bucket.revenue += bill;
        bucket.margin += net;
      }

      if (j.paymentStatus === 'refunded' || j.status === 'Declined' || (j.refundAmount || 0) > 0) {
        bucket.refunds += Number(j.refundAmount || 99);
      }
    });

    return days;
  }, [jobs, partners]);

  const kpiCards = [
    {
      label: 'New Leads (Booked)',
      value: metrics.newLeads,
      sub: 'असाइनमेंट प्रतीक्षारत',
      icon: Inbox,
      accent: 'text-[#D5151B] bg-[#FEF2F2]',
      onClick: () => onQuickFilter('jobs', 'Booked')
    },
    {
      label: 'Pickups Today',
      value: metrics.pickupsToday,
      sub: `तारीख: ${todayStr}`,
      icon: Truck,
      accent: 'text-[#132032] bg-gray-100',
      onClick: () => onQuickFilter('jobs', 'Pickup scheduled')
    },
    {
      label: 'In Repair',
      value: metrics.inRepair,
      sub: 'पिक्ड-अप + रिपेयरिंग',
      icon: Wrench,
      accent: 'text-amber-700 bg-amber-50',
      onClick: () => onQuickFilter('jobs', 'In repair')
    },
    {
      label: 'Deliveries Ready / Today',
      value: metrics.deliveriesToday,
      sub: 'डिलीवरी हेतु तैयार / पूर्ण',
      icon: PackageCheck,
      accent: 'text-emerald-700 bg-emerald-50',
      onClick: () => onQuickFilter('jobs', 'Ready')
    },
    {
      label: 'Overdue (>2hr Target)',
      value: metrics.overdueJobs,
      sub: 'तुरंत फॉलो-अप आवश्यक',
      icon: AlertTriangle,
      accent: metrics.overdueJobs > 0 ? 'text-white bg-[#D5151B]' : 'text-gray-600 bg-gray-100',
      highlight: metrics.overdueJobs > 0,
      onClick: () => onQuickFilter('jobs', undefined, true)
    },
    {
      label: 'Pending Approvals',
      value: metrics.pendingApprovals,
      sub: 'QC के बाद ग्राहक मंज़ूरी बाकी',
      icon: Clock,
      accent: 'text-amber-700 bg-amber-50',
      onClick: () => onQuickFilter('jobs', 'Picked up')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Row 1: Operational KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              type="button"
              onClick={card.onClick}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                card.highlight
                  ? 'bg-[#FEF2F2] border-red-300 shadow-xs'
                  : 'bg-white border-gray-200 hover:border-gray-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.accent}`}>
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <p className="text-2xl font-bold text-[#132032] tabular-nums">{card.value}</p>
              <p className="text-xs font-bold text-[#132032] mt-0.5 leading-tight">{card.label}</p>
              <p className="text-[11px] text-gray-500 mt-0.5 truncate">{card.sub}</p>
            </button>
          );
        })}
      </div>

      {/* Row 2: Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Revenue (Today / Week / Month)</span>
            <IndianRupee className="w-4 h-4 text-[#D5151B]" />
          </div>
          <p className="text-2xl font-bold text-[#132032] mt-2 tabular-nums">
            ₹{metrics.revMonth.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-gray-600 tabular-nums">
            <span>आज: <strong>₹{metrics.revToday.toLocaleString('en-IN')}</strong></span>
            <span>•</span>
            <span>7 दिन: <strong>₹{metrics.revWeek.toLocaleString('en-IN')}</strong></span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Net Margin (30 Days)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2 tabular-nums">
            ₹{metrics.marginMonth.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-gray-500 mt-1.5 tabular-nums">
            मार्जिन %:{' '}
            <strong>
              {metrics.revMonth > 0 ? Math.round((metrics.marginMonth / metrics.revMonth) * 100) : 0}%
            </strong>{' '}
            (पार्टनर + पिकअप घटाकर)
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payments Received</span>
            <CreditCard className="w-4 h-4 text-[#132032]" />
          </div>
          <p className="text-2xl font-bold text-[#132032] mt-2 tabular-nums">
            ₹{metrics.paymentsReceivedAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-gray-500 mt-1.5 tabular-nums">
            {metrics.paymentsReceivedCount} सत्यापित भुगतान • {metrics.activeInvCount} सक्रिय इनवॉइस
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Refunds Issued</span>
            <RotateCcw className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-700 mt-2 tabular-nums">
            ₹{metrics.refundsAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-gray-500 mt-1.5 tabular-nums">
            {metrics.refundsCount} रिफंड / QC अस्वीकृत ऑर्डर्स
          </p>
        </div>
      </div>

      {/* Row 3: 30-Day Recharts Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#132032]">30-Day Revenue vs Net Margin (₹)</h3>
              <p className="text-[11px] text-gray-500">दैनिक कुल बिलिंग व शुद्ध लाभ ट्रेंड</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData30d} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D5151B" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#D5151B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="marginFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748B' }} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue (₹)"
                  stroke="#D5151B"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#revFill)"
                />
                <Area
                  type="monotone"
                  dataKey="margin"
                  name="Net Margin (₹)"
                  stroke="#059669"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#marginFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#132032]">30-Day Order Volume & Refunds</h3>
              <p className="text-[11px] text-gray-500">दैनिक प्राप्त रिपेयर बुकिंग्स</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData30d} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748B' }} interval={4} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="jobs" name="Total Jobs" fill="#132032" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
