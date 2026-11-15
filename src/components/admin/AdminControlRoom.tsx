import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AuditLogEntry,
  CustomerNote,
  CustomerReferral,
  InventoryPhone,
  InvoiceRecord,
  Job,
  JobHandoverRecord,
  OwnerListing,
  Partner,
  PartnerJob,
  PartnerLedgerEntry,
  RealCustomerReview,
  RepairPrice,
  SellRequest,
  Slot
} from '../../types';
import {
  subscribeToAllJobs,
  subscribeToAllSellRequests,
  subscribeToAvailableInventory
} from '../../services/firestoreRepairService';
import { subscribeToCollection } from '../../services/adminService';
import { SeoHead } from '../SeoHead';
import { AdminDashboardHome } from './AdminDashboardHome';
import { AdminJobsModule } from './AdminJobsModule';
import { AdminPartnersModule } from './AdminPartnersModule';
import { AdminInvoicesModule } from './AdminInvoicesModule';
import { AdminReviewsModule } from './AdminReviewsModule';
import { AdminOperationsModule, OperationsSubSection } from './AdminOperationsModule';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  FileText,
  Star,
  Sliders,
  Bell,
  Clock,
  LogOut,
  ArrowLeft,
  ShieldCheck,
  X,
  AlertTriangle,
  Menu
} from 'lucide-react';

interface AdminControlRoomProps {
  onNavigatePublicHome: () => void;
}

type MainSection = 'dashboard' | 'jobs' | 'partners' | 'invoices' | 'reviews' | 'operations';

export const AdminControlRoom: React.FC<AdminControlRoomProps> = ({
  onNavigatePublicHome
}) => {
  const {
    user,
    siteSettings,
    adminSettings,
    sessionSecondsRemaining,
    resetSessionTimer,
    logoutUser
  } = useApp();

  const [section, setSection] = useState<MainSection>('dashboard');
  const [opsSubSection, setOpsSubSection] = useState<OperationsSubSection>('customers');
  const [jobsFilterStatus, setJobsFilterStatus] = useState<string>('all');
  const [jobsOverdueOnly, setJobsOverdueOnly] = useState<boolean>(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Live Firestore collections
  const [jobs, setJobs] = useState<Job[]>([]);
  const [partnerJobs, setPartnerJobs] = useState<PartnerJob[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [ledger, setLedger] = useState<PartnerLedgerEntry[]>([]);
  const [handovers, setHandovers] = useState<JobHandoverRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [reviews, setReviews] = useState<RealCustomerReview[]>([]);
  const [sellRequests, setSellRequests] = useState<SellRequest[]>([]);
  const [inventory, setInventory] = useState<InventoryPhone[]>([]);
  const [ownerListings, setOwnerListings] = useState<OwnerListing[]>([]);
  const [referrals, setReferrals] = useState<CustomerReferral[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [repairPrices, setRepairPrices] = useState<RepairPrice[]>([]);
  const [customerNotes, setCustomerNotes] = useState<CustomerNote[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    if (!user.isLoggedIn || !user.isAdmin) return;
    setIsLoading(true);

    const unsubs = [
      subscribeToAllJobs((j) => {
        setJobs(j);
        setIsLoading(false);
      }),
      subscribeToCollection<PartnerJob>('partnerJobs', 'updatedAt', setPartnerJobs),
      subscribeToCollection<Partner>('partners', null, setPartners),
      subscribeToCollection<PartnerLedgerEntry>('ledger', 'timestamp', setLedger),
      subscribeToCollection<JobHandoverRecord>('handovers', 'handoverTime', setHandovers),
      subscribeToCollection<InvoiceRecord>('invoices', 'createdAt', setInvoices),
      subscribeToCollection<RealCustomerReview>('reviews', 'createdAt', setReviews),
      subscribeToAllSellRequests((s) => setSellRequests(s as SellRequest[])),
      subscribeToAvailableInventory((i) => setInventory(i as InventoryPhone[])),
      subscribeToCollection<OwnerListing>('ownerListings', 'createdAt', setOwnerListings),
      subscribeToCollection<CustomerReferral>('referrals', 'createdAt', setReferrals),
      subscribeToCollection<Slot>('slots', 'date', setSlots),
      subscribeToCollection<RepairPrice>('repairPrices', 'sortOrder', (list) =>
        setRepairPrices([...list].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)))
      ),
      subscribeToCollection<CustomerNote>('customerNotes', 'createdAt', setCustomerNotes),
      subscribeToCollection<AuditLogEntry>('auditLogs', 'createdAt', setAuditLogs)
    ];

    return () => {
      unsubs.forEach((fn) => fn());
    };
  }, [user.isLoggedIn, user.isAdmin]);

  // Live Notification Centre Items
  const notifications = useMemo(() => {
    const items: { id: string; title: string; detail: string; severity: 'urgent' | 'warn' | 'info'; targetSection: MainSection }[] = [];

    const newLeads = jobs.filter((j) => j.status === 'Booked');
    if (newLeads.length > 0) {
      items.push({
        id: 'new_leads',
        title: `${newLeads.length} New Repair Lead(s)`,
        detail: `Latest: #${newLeads[0].jobId} (${newLeads[0].brand} ${newLeads[0].model})`,
        severity: 'info',
        targetSection: 'jobs'
      });
    }

    const overdueHandovers = handovers.filter(
      (h) => !h.returnTime && Date.now() > new Date(h.deliveryDeadline).getTime()
    );
    if (overdueHandovers.length > 0) {
      items.push({
        id: 'overdue_jobs',
        title: `${overdueHandovers.length} Overdue Job(s) (>2h Target)`,
        detail: `Job #${overdueHandovers[0].jobId} exceeded 2-hour delivery deadline`,
        severity: 'urgent',
        targetSection: 'jobs'
      });
    }

    const pendingApprovals = jobs.filter((j) => j.status === 'Picked up' && !j.customerApproved);
    if (pendingApprovals.length > 0) {
      items.push({
        id: 'pending_approvals',
        title: `${pendingApprovals.length} Pending Customer Quote Approval(s)`,
        detail: `Latest: #${pendingApprovals[0].jobId} (${pendingApprovals[0].name})`,
        severity: 'warn',
        targetSection: 'jobs'
      });
    }

    const pendingPartnerCosts = partnerJobs.filter(
      (pj) => pj.partnerSubmission && !pj.partnerSubmission.costApprovedByAdmin
    );
    if (pendingPartnerCosts.length > 0) {
      items.push({
        id: 'partner_costs',
        title: `${pendingPartnerCosts.length} Partner Parts Submission(s)`,
        detail: `Awaiting admin parts cost review & ledger approval`,
        severity: 'warn',
        targetSection: 'partners'
      });
    }

    const lowBalPartners = partners.filter(
      (p) => (p.advanceBalance || 0) < (p.lowBalanceThreshold ?? adminSettings.lowPartnerBalanceThreshold ?? 1000)
    );
    if (lowBalPartners.length > 0) {
      items.push({
        id: 'low_balance',
        title: `${lowBalPartners.length} Low Partner Advance Balance Alert(s)`,
        detail: lowBalPartners.map((p) => `${p.name}: ₹${p.advanceBalance}`).join(', '),
        severity: 'urgent',
        targetSection: 'partners'
      });
    }

    return items;
  }, [jobs, handovers, partnerJobs, partners, adminSettings.lowPartnerBalanceThreshold]);

  const navLinks: { id: MainSection; label: string; icon: any; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard Home', icon: LayoutDashboard },
    { id: 'jobs', label: 'Leads & Jobs', icon: ClipboardList, badge: jobs.length },
    { id: 'partners', label: 'Technicians & Partners', icon: Users, badge: partners.length },
    { id: 'invoices', label: 'Bills & Invoices', icon: FileText, badge: invoices.length },
    { id: 'reviews', label: 'Reviews', icon: Star, badge: reviews.filter((r) => r.status === 'pending').length || undefined },
    { id: 'operations', label: 'Operations & Settings', icon: Sliders }
  ];

  const handleNavClick = (id: MainSection) => {
    setSection(id);
    setIsMobileSidebarOpen(false);
    if (id !== 'jobs') {
      setJobsFilterStatus('all');
      setJobsOverdueOnly(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-[#132032] flex flex-col">
      <SeoHead
        title="Admin Control Room | Sastafone"
        description="Restricted Sastafone Admin Control Room"
        canonicalPath="/admin"
        noindex
      />

      {/* Top Sticky Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen((v) => !v)}
            className="lg:hidden p-2 rounded-xl bg-gray-100 text-[#132032] cursor-pointer"
            aria-label="Toggle Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="w-8 h-8 rounded-xl bg-[#D5151B] text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-[#132032] truncate">
              Sastafone Admin Control Room
            </h1>
            <p className="text-[10px] text-gray-500 truncate hidden sm:block">
              Verified Admin: {user.email}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Session Timeout Counter */}
          {sessionSecondsRemaining !== null && (
            <button
              type="button"
              onClick={resetSessionTimer}
              title="Click to reset session timer"
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-mono font-bold cursor-pointer ${
                sessionSecondsRemaining < 120
                  ? 'bg-[#FEF2F2] border-red-300 text-[#D5151B]'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>
                {Math.floor(sessionSecondsRemaining / 60)}:
                {String(sessionSecondsRemaining % 60).padStart(2, '0')}
              </span>
            </button>
          )}

          {/* Notification Centre Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotifOpen((v) => !v)}
              className="relative p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#132032] cursor-pointer"
              aria-label="Notification Centre"
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#D5151B] text-white text-[9px] font-bold flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 p-3 z-40 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="font-bold text-[#132032]">Notification Centre</span>
                  <button type="button" onClick={() => setIsNotifOpen(false)} className="cursor-pointer">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                {notifications.length === 0 ? (
                  <p className="text-gray-500 py-3 text-center">कोई नया अलर्ट नहीं है।</p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        setSection(n.targetSection);
                        if (n.id === 'overdue_jobs') setJobsOverdueOnly(true);
                        setIsNotifOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left space-y-0.5 cursor-pointer ${
                        n.severity === 'urgent'
                          ? 'bg-[#FEF2F2] border-red-200'
                          : 'bg-gray-50 border-gray-100'
                      }`}
                    >
                      <p className="font-bold text-[#132032] flex items-center gap-1">
                        {n.severity === 'urgent' && <AlertTriangle className="w-3.5 h-3.5 text-[#D5151B]" />}
                        <span>{n.title}</span>
                      </p>
                      <p className="text-[11px] text-gray-600">{n.detail}</p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onNavigatePublicHome}
            className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Public Site</span>
          </button>

          <button
            type="button"
            onClick={logoutUser}
            className="px-3 py-1.5 rounded-xl bg-[#FEF2F2] hover:bg-red-100 text-[#D5151B] border border-red-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex max-w-[1440px] w-full mx-auto">
        {/* Sidebar */}
        <aside
          className={`${
            isMobileSidebarOpen ? 'fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-2xl pt-16' : 'hidden'
          } lg:block lg:w-60 lg:bg-white lg:border-r lg:border-gray-200 p-3 shrink-0`}
        >
          <nav className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                    active
                      ? 'bg-[#D5151B] text-white'
                      : 'text-[#132032] hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full tabular-nums ${
                        active ? 'bg-white text-[#D5151B]' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Workspace Content */}
        <main className="flex-1 p-4 sm:p-6 min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="h-28 rounded-2xl bg-white border border-gray-200 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {section === 'dashboard' && (
                <AdminDashboardHome
                  jobs={jobs}
                  partners={partners}
                  handovers={handovers}
                  invoices={invoices}
                  onQuickFilter={(_, filterStatus, overdueOnly) => {
                    setJobsFilterStatus(filterStatus || 'all');
                    setJobsOverdueOnly(Boolean(overdueOnly));
                    setSection('jobs');
                  }}
                />
              )}

              {section === 'jobs' && (
                <AdminJobsModule
                  jobs={jobs}
                  partners={partners}
                  repairPrices={repairPrices}
                  handovers={handovers}
                  invoices={invoices}
                  reviews={reviews}
                  adminSettings={adminSettings}
                  googleReviewUrl={siteSettings.googleReviewUrl}
                  initialStatusFilter={jobsFilterStatus}
                  initialOverdueOnly={jobsOverdueOnly}
                />
              )}

              {section === 'partners' && (
                <AdminPartnersModule
                  partners={partners}
                  jobs={jobs}
                  partnerJobs={partnerJobs}
                  ledger={ledger}
                  handovers={handovers}
                  repairPrices={repairPrices}
                  adminSettings={adminSettings}
                />
              )}

              {section === 'invoices' && (
                <AdminInvoicesModule
                  invoices={invoices}
                  jobs={jobs}
                  partners={partners}
                  adminSettings={adminSettings}
                  supportEmail={siteSettings.supportEmail}
                  businessHours={siteSettings.businessHours}
                />
              )}

              {section === 'reviews' && (
                <AdminReviewsModule
                  reviews={reviews}
                  jobs={jobs}
                  partners={partners}
                  googleReviewUrl={siteSettings.googleReviewUrl}
                />
              )}

              {section === 'operations' && (
                <AdminOperationsModule
                  section={opsSubSection}
                  onChangeSection={setOpsSubSection}
                  jobs={jobs}
                  sellRequests={sellRequests}
                  inventory={inventory}
                  ownerListings={ownerListings}
                  referrals={referrals}
                  slots={slots}
                  repairPrices={repairPrices}
                  customerNotes={customerNotes}
                  auditLogs={auditLogs}
                  siteSettings={siteSettings}
                  adminSettings={adminSettings}
                  userUid={user.uid || ''}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
