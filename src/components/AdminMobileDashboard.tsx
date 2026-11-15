import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Job, JobStatus, Partner, RepairPrice, SellRequest, InventoryPhone, RealCustomerReview } from '../types';
import {
  subscribeToAllJobs,
  updateJobStatusInFirestore,
  assignPartnerToJobInFirestore,
  getPartnersFromFirestore,
  getRepairPricesFromFirestore,
  updateRepairPriceInFirestore,
  subscribeToAllSellRequests,
  updateSellRequestInFirestore,
  subscribeToAvailableInventory,
  addInventoryPhoneInFirestore,
  updateInventoryPhoneInFirestore,
  addPartnerLedgerEntry
} from '../services/firestoreRepairService';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { PickupQCScreen } from './PickupQCScreen';
import {
  updateSiteSettingsInFirestore,
  DEFAULT_SITE_SETTINGS
} from '../services/siteSettingsService';
import { uploadImageToStorage } from '../utils/storageUpload';
import {
  ShieldAlert,
  Search,
  Phone,
  MessageCircle,
  Truck,
  Wrench,
  CheckCircle2,
  Clock,
  Filter,
  TrendingUp,
  Sliders,
  Calendar,
  User,
  Users,
  ChevronDown,
  X,
  Sparkles,
  MapPin,
  RefreshCw,
  Smartphone,
  ShoppingBag,
  DollarSign,
  AlertCircle,
  Camera,
  Upload,
  ArrowRight,
  Star,
  Check,
  FileText,
  Settings,
  Download,
  Database
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AdminMobileDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminMobileDashboard: React.FC<AdminMobileDashboardProps> = ({
  isOpen,
  onClose
}) => {
  const { user, siteSettings } = useApp();

  const [activeTab, setActiveTab] = useState<
    | 'new_bookings'
    | 'today_pickups'
    | 'in_repair'
    | 'deliveries'
    | 'sell_requests'
    | 'inventory'
    | 'partner_ledger'
    | 'rates_slots'
    | 'reviews'
    | 'site_settings'
    | 'backup'
  >('new_bookings');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [repairPrices, setRepairPrices] = useState<RepairPrice[]>([]);
  const [sellRequests, setSellRequests] = useState<SellRequest[]>([]);
  const [inventoryList, setInventoryList] = useState<InventoryPhone[]>([]);
  const [customerReviews, setCustomerReviews] = useState<RealCustomerReview[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [areaFilter, setAreaFilter] = useState<string>('all');

  // QC Screen modal
  const [qcActiveJob, setQcActiveJob] = useState<Job | null>(null);

  // Rates editor state
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editMinPrice, setEditMinPrice] = useState<number>(0);
  const [editMaxPrice, setEditMaxPrice] = useState<number>(0);
  const [editMinutes, setEditMinutes] = useState<number>(30);
  const [isSavingRate, setIsSavingRate] = useState<boolean>(false);

  // Sell Inspection Modal State
  const [activeSellInspection, setActiveSellInspection] = useState<SellRequest | null>(null);
  const [sellInspectionImei, setSellInspectionImei] = useState('');
  const [sellInspectionIdPhoto, setSellInspectionIdPhoto] = useState('');
  const [sellInspectionBillPhoto, setSellInspectionBillPhoto] = useState('');
  const [sellFinalOffer, setSellFinalOffer] = useState<number>(0);
  const [sellPaymentMethod, setSellPaymentMethod] = useState<'UPI' | 'Bank Transfer' | 'Cash'>('UPI');
  const [sellPayoutError, setSellPayoutError] = useState<string | null>(null);
  const [isUploadingSellId, setIsUploadingSellId] = useState(false);
  const [isUploadingSellBill, setIsUploadingSellBill] = useState(false);

  // Add Inventory State
  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false);
  const [newInvBrand, setNewInvBrand] = useState('Apple');
  const [newInvModel, setNewInvModel] = useState('');
  const [newInvStorage, setNewInvStorage] = useState('128GB');
  const [newInvColour, setNewInvColour] = useState('Black');
  const [newInvGrade, setNewInvGrade] = useState<'A+ Like New' | 'A Excellent' | 'B Good'>('A+ Like New');
  const [newInvBattery, setNewInvBattery] = useState<number>(90);
  const [newInvImei, setNewInvImei] = useState('');
  const [newInvPrice, setNewInvPrice] = useState<number>(25000);
  const [newInvPhotos, setNewInvPhotos] = useState<string[]>([]);
  const [isUploadingInvPhotos, setIsUploadingInvPhotos] = useState(false);
  const [isSavingInventory, setIsSavingInventory] = useState(false);
  const [invError, setInvError] = useState<string | null>(null);

  // Partner Handover Modal State
  const [activeHandoverJob, setActiveHandoverJob] = useState<Job | null>(null);
  const [handoverPartnerId, setHandoverPartnerId] = useState('');
  const [sealedBagId, setSealedBagId] = useState('');
  const [handoverImei, setHandoverImei] = useState('');
  const [handoverPhotos, setHandoverPhotos] = useState<string[]>([]);

  // Partner Top-up State
  const [topupPartnerId, setTopupPartnerId] = useState<string | null>(null);
  const [topupAmount, setTopupAmount] = useState<number>(2000);

  // Public Site Settings Form State
  const [settingsGoogleReviewUrl, setSettingsGoogleReviewUrl] = useState(
    siteSettings.googleReviewUrl || DEFAULT_SITE_SETTINGS.googleReviewUrl
  );
  const [settingsWhatsapp, setSettingsWhatsapp] = useState(
    siteSettings.whatsappNumber || DEFAULT_SITE_SETTINGS.whatsappNumber
  );
  const [settingsSupportPhone, setSettingsSupportPhone] = useState(
    siteSettings.supportPhone || DEFAULT_SITE_SETTINGS.supportPhone
  );
  const [settingsBusinessHours, setSettingsBusinessHours] = useState(
    siteSettings.businessHours || DEFAULT_SITE_SETTINGS.businessHours
  );
  const [settingsSupportEmail, setSettingsSupportEmail] = useState(
    siteSettings.supportEmail || DEFAULT_SITE_SETTINGS.supportEmail
  );
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSaveMessage, setSettingsSaveMessage] = useState<string | null>(null);

  // Backup Export State
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [backupStatusMessage, setBackupStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setSettingsGoogleReviewUrl(siteSettings.googleReviewUrl || '');
    setSettingsWhatsapp(siteSettings.whatsappNumber || DEFAULT_SITE_SETTINGS.whatsappNumber);
    setSettingsSupportPhone(siteSettings.supportPhone || DEFAULT_SITE_SETTINGS.supportPhone);
    setSettingsBusinessHours(siteSettings.businessHours || DEFAULT_SITE_SETTINGS.businessHours);
    setSettingsSupportEmail(siteSettings.supportEmail || DEFAULT_SITE_SETTINGS.supportEmail);
  }, [siteSettings]);

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);

    // 1. Subscribe to all jobs
    const unsubJobs = subscribeToAllJobs((allJobs) => {
      setJobs(allJobs);
      setIsLoading(false);
    });

    // 2. Subscribe to sell requests
    const unsubSell = subscribeToAllSellRequests((requests) => {
      setSellRequests(requests as SellRequest[]);
    });

    // 3. Subscribe to inventory
    const unsubInv = subscribeToAvailableInventory((items) => {
      setInventoryList(items as InventoryPhone[]);
    });

    // 4. Subscribe to reviews for moderation
    const qReviews = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const unsubReviews = onSnapshot(
      qReviews,
      (snapshot) => {
        const list: RealCustomerReview[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as RealCustomerReview);
        });
        setCustomerReviews(list);
      },
      (err) => console.warn('Reviews listener notice:', err)
    );

    // 5. Load partners & repair prices
    getPartnersFromFirestore().then(setPartners);
    getRepairPricesFromFirestore().then(setRepairPrices);

    return () => {
      unsubJobs();
      unsubSell();
      unsubInv();
      unsubReviews();
    };
  }, [isOpen]);

  const todayStr = new Date().toISOString().split('T')[0];

  const counts = useMemo(() => {
    return {
      today_pickups: jobs.filter(
        (j) => j.pickupSlot?.date === todayStr && (j.status === 'Booked' || j.status === 'Pickup scheduled')
      ).length,
      in_repair: jobs.filter(
        (j) => j.status === 'In repair' || j.status === 'Picked up' || j.status === 'Quote approved'
      ).length,
      deliveries: jobs.filter((j) => j.status === 'Ready').length,
      new_bookings: jobs.filter((j) => j.status === 'Booked').length,
      sell_requests: sellRequests.filter((r) => r.status === 'Submitted' || r.status === 'Pickup scheduled').length,
      reviews_pending: customerReviews.filter((r) => r.status === 'pending').length
    };
  }, [jobs, sellRequests, customerReviews, todayStr]);

  // Filtered jobs
  const tabJobs = useMemo(() => {
    let base = jobs;
    if (activeTab === 'today_pickups') {
      base = jobs.filter(
        (j) => j.pickupSlot?.date === todayStr && (j.status === 'Booked' || j.status === 'Pickup scheduled')
      );
    } else if (activeTab === 'in_repair') {
      base = jobs.filter(
        (j) => j.status === 'In repair' || j.status === 'Picked up' || j.status === 'Quote approved'
      );
    } else if (activeTab === 'deliveries') {
      base = jobs.filter((j) => j.status === 'Ready');
    } else if (activeTab === 'new_bookings') {
      base = jobs.filter((j) => j.status === 'Booked');
    }

    if (areaFilter !== 'all') {
      base = base.filter((j) => j.area === areaFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      base = base.filter(
        (j) =>
          j.jobId.toLowerCase().includes(q) ||
          j.name.toLowerCase().includes(q) ||
          j.phone.includes(q) ||
          j.model.toLowerCase().includes(q)
      );
    }

    return base;
  }, [jobs, activeTab, areaFilter, searchQuery, todayStr]);

  if (!isOpen) return null;

  // Handlers
  const handleStatusChange = async (jobId: string, newStatus: JobStatus) => {
    await updateJobStatusInFirestore(jobId, newStatus);
  };

  const handlePartnerAssign = async (jobId: string, partnerId: string) => {
    await assignPartnerToJobInFirestore(jobId, partnerId);
  };

  const handleSaveRate = async (priceId: string) => {
    setIsSavingRate(true);
    await updateRepairPriceInFirestore(priceId, {
      minPrice: editMinPrice,
      maxPrice: editMaxPrice,
      serviceMinutes: editMinutes
    });
    const refreshed = await getRepairPricesFromFirestore();
    setRepairPrices(refreshed);
    setEditingPriceId(null);
    setIsSavingRate(false);
  };

  // Section E: Complete Sell Inspection & Payout
  const handleCompleteSellInspection = async () => {
    if (!activeSellInspection) return;

    setSellPayoutError(null);

    // Strict validation: IMEI, ID photo, Bill photo are mandatory before payout
    if (!sellInspectionImei || sellInspectionImei.length < 15) {
      setSellPayoutError('15-अंकीय IMEI नंबर दर्ज करना अनिवार्य है।');
      return;
    }
    if (!sellInspectionIdPhoto) {
      setSellPayoutError('ग्राहक का पहचान पत्र (ID Photo) अनिवार्य है।');
      return;
    }
    if (!sellInspectionBillPhoto && !activeSellInspection.billPhotoUrl) {
      setSellPayoutError('खरीद बिल / ऑनरशिप प्रूफ फोटो अनिवार्य है।');
      return;
    }
    if (sellFinalOffer <= 0) {
      setSellPayoutError('कृपया वैध अंतिम बाय-बैक रकम (Final Offer) दर्ज करें।');
      return;
    }

    try {
      await updateSellRequestInFirestore(activeSellInspection.id, {
        imei: sellInspectionImei,
        idPhotoUrl: sellInspectionIdPhoto,
        billPhotoUrl: sellInspectionBillPhoto || activeSellInspection.billPhotoUrl,
        finalOffer: sellFinalOffer,
        paymentMethod: sellPaymentMethod,
        payoutRecorded: true,
        status: 'Purchased',
        statusHistory: [
          ...(activeSellInspection.statusHistory || []),
          {
            status: 'Purchased',
            timestamp: new Date().toISOString(),
            note: `ऑन-साइट निरीक्षण पूर्ण। IMEI: ${sellInspectionImei} सत्यापित। अंतिम भुगतान: ₹${sellFinalOffer} (${sellPaymentMethod}) पूरा हुआ।`
          }
        ]
      });

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setActiveSellInspection(null);
    } catch (err: any) {
      setSellPayoutError('बाय-बैक भुगतान दर्ज करने में समस्या आई।');
    }
  };

  // Move Purchased Phone to Inventory
  const handleMoveToInventory = async (sellReq: SellRequest) => {
    try {
      const slug = `${sellReq.brand.toLowerCase()}-${sellReq.model.toLowerCase().replace(/\s+/g, '-')}-${sellReq.storage.toLowerCase()}-${Date.now().toString().slice(-4)}`;
      await addInventoryPhoneInFirestore({
        slug,
        brand: sellReq.brand,
        model: sellReq.model,
        storage: sellReq.storage,
        colour: 'Original',
        grade: 'A Excellent',
        batteryHealth: 88,
        imei: sellReq.imei || '',
        photos: sellReq.conditionPhotos?.length > 0 ? sellReq.conditionPhotos : [],
        price: Math.round((sellReq.finalOffer || 12000) * 1.25),
        tokenAmount: 499,
        warrantyMonths: 6,
        status: 'available',
        description: `सर्टिफाइड ${sellReq.brand} ${sellReq.model} (${sellReq.storage})। 32-पॉइंट QC पास और 6 महीने की Sastafone वारंटी।`
      });

      await updateSellRequestInFirestore(sellReq.id, {
        movedToInventory: true,
        status: 'Moved to inventory'
      });

      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
      alert('✓ फोन सफलतापूर्वक इन्वेंट्री में जोड़ दिया गया है!');
    } catch (err: any) {
      alert('इन्वेंट्री में जोड़ने में समस्या आई।');
    }
  };

  // Section H: Handover phone to partner with sealed bag
  const handleConfirmHandover = async () => {
    if (!activeHandoverJob || !handoverPartnerId || !sealedBagId || !handoverImei) {
      alert('कृपया पार्टनर, सीलबंद बैग ID और IMEI नंबर दर्ज करें।');
      return;
    }

    try {
      const now = new Date();
      const deadline = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours

      const partner = partners.find((p) => p.id === handoverPartnerId);

      await addDoc(collection(db, 'handovers'), {
        jobId: activeHandoverJob.jobId,
        partnerId: handoverPartnerId,
        partnerName: partner?.name || 'Partner',
        sealedBagId,
        imei: handoverImei,
        handoverPhotos,
        handoverTime: now.toISOString(),
        deliveryDeadline: deadline.toISOString(),
        status: 'active',
        timestamp: serverTimestamp()
      });

      await updateJobStatusInFirestore(activeHandoverJob.jobId, 'Pickup scheduled');
      await assignPartnerToJobInFirestore(activeHandoverJob.jobId, handoverPartnerId);

      setActiveHandoverJob(null);
      setSealedBagId('');
      setHandoverImei('');
      setHandoverPhotos([]);
      alert(`✓ फोन सीलबंद बैग #${sealedBagId} में पार्टनर को हैंडओवर हुआ। 2 घंटे का डिलीवरी टाइमर सक्रिय।`);
    } catch (err: any) {
      alert('हैंडओवर दर्ज करने में समस्या आई।');
    }
  };

  // Section H: Partner Balance Top-up
  const handlePartnerTopup = async () => {
    if (!topupPartnerId || topupAmount <= 0) return;
    try {
      const partner = partners.find((p) => p.id === topupPartnerId);
      await addPartnerLedgerEntry({
        partnerId: topupPartnerId,
        partnerName: partner?.name || 'Partner',
        type: 'advance_topup',
        amount: topupAmount,
        balanceBefore: partner?.advanceBalance || 0,
        balanceAfter: (partner?.advanceBalance || 0) + topupAmount,
        notes: `एडवांस टॉप-अप ₹${topupAmount} एडमिन द्वारा जोड़ा गया`
      });

      const updated = await getPartnersFromFirestore();
      setPartners(updated);
      setTopupPartnerId(null);
      alert('✓ पार्टनर एडवांस बैलेंस सफलतापूर्वक टॉप-अप हुआ!');
    } catch (err: any) {
      alert('टॉप-अप में समस्या आई।');
    }
  };

  // Section J: Review Moderation
  const handleModerateReview = async (reviewId: string, status: 'approved' | 'rejected') => {
    try {
      const ref = doc(db, 'reviews', reviewId);
      await updateDoc(ref, {
        status,
        moderatedAt: new Date().toISOString()
      });
    } catch (err) {
      alert('समीक्षा स्टेटस बदलने में विफल।');
    }
  };

  // Save public settings
  const handleSaveSiteSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsSaveMessage(null);
    const res = await updateSiteSettingsInFirestore(
      {
        googleReviewUrl: settingsGoogleReviewUrl.trim(),
        whatsappNumber: settingsWhatsapp.trim(),
        supportPhone: settingsSupportPhone.trim(),
        businessHours: settingsBusinessHours.trim(),
        supportEmail: settingsSupportEmail.trim()
      },
      user.uid
    );
    setIsSavingSettings(false);
    if (res.success) {
      setSettingsSaveMessage('✓ पब्लिक सेटिंग्स सफलतापूर्वक सेव हो गई हैं।');
    } else {
      setSettingsSaveMessage(res.error || 'सेटिंग्स सेव करने में त्रुटि हुई।');
    }
  };

  // Add inventory phone handler
  const handleSaveNewInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    setInvError(null);
    if (!newInvModel.trim()) {
      setInvError('कृपया फोन का मॉडल नाम दर्ज करें।');
      return;
    }
    if (!newInvImei || newInvImei.length < 15) {
      setInvError('कृपया सही 15-अंकीय IMEI दर्ज करें।');
      return;
    }
    if (newInvPrice <= 0) {
      setInvError('कृपया मान्य विक्रय मूल्य दर्ज करें।');
      return;
    }

    setIsSavingInventory(true);
    try {
      const slug = `${newInvBrand.toLowerCase()}-${newInvModel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${newInvStorage.toLowerCase()}-${Date.now().toString().slice(-4)}`;
      await addInventoryPhoneInFirestore({
        slug,
        brand: newInvBrand,
        model: newInvModel.trim(),
        storage: newInvStorage,
        colour: newInvColour.trim() || 'Original',
        grade: newInvGrade,
        batteryHealth: newInvBattery,
        imei: newInvImei,
        photos: newInvPhotos,
        price: newInvPrice,
        tokenAmount: 499,
        warrantyMonths: 6,
        status: 'available',
        description: `सर्टिफाइड ${newInvBrand} ${newInvModel.trim()} (${newInvStorage})। 32-पॉइंट QC पास और 6 महीने की Sastafone वारंटी।`
      });
      setIsAddInventoryOpen(false);
      setNewInvModel('');
      setNewInvImei('');
      setNewInvPhotos([]);
    } catch (err: any) {
      setInvError(err?.message || 'इन्वेंट्री जोड़ने में त्रुटि हुई।');
    } finally {
      setIsSavingInventory(false);
    }
  };

  // Download helper for JSON / CSV backup
  const triggerDownload = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const escapeCsvCell = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const handleExportFullJsonBackup = async () => {
    setIsExportingBackup(true);
    setBackupStatusMessage(null);
    try {
      const collectionNames = [
        'jobs',
        'sellRequests',
        'inventory',
        'repairPrices',
        'partners',
        'reviews',
        'warrantyClaims',
        'settings',
        'handovers',
        'ledger'
      ];
      const backupPayload: Record<string, any[]> = {};
      for (const col of collectionNames) {
        try {
          const snap = await getDocs(collection(db, col));
          backupPayload[col] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        } catch {
          backupPayload[col] = [];
        }
      }
      const dateStamp = new Date().toISOString().split('T')[0];
      triggerDownload(
        JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            exportedBy: user.email || user.uid,
            collections: backupPayload
          },
          null,
          2
        ),
        `sastafone-backup-${dateStamp}.json`,
        'application/json'
      );
      setBackupStatusMessage('✓ पूरा JSON डेटाबेस बैकअप डाउनलोड हो गया।');
    } catch (err: any) {
      setBackupStatusMessage('बैकअप डाउनलोड करने में समस्या आई।');
    } finally {
      setIsExportingBackup(false);
    }
  };

  const handleExportJobsCsv = () => {
    const headers = [
      'jobId',
      'name',
      'phone',
      'area',
      'address',
      'brand',
      'model',
      'status',
      'estMin',
      'estMax',
      'finalPrice',
      'visitFeePaid',
      'customerApproved',
      'partnerId',
      'createdAt'
    ];
    const rows = jobs.map((j) =>
      headers.map((h) => escapeCsvCell((j as any)[h])).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const dateStamp = new Date().toISOString().split('T')[0];
    triggerDownload(csv, `sastafone-repair-jobs-${dateStamp}.csv`, 'text/csv;charset=utf-8;');
    setBackupStatusMessage(`✓ ${jobs.length} रिपेयर जॉब्स CSV में डाउनलोड हो गए।`);
  };

  const handleExportSellRequestsCsv = () => {
    const headers = [
      'id',
      'customerName',
      'customerPhone',
      'area',
      'brand',
      'model',
      'storage',
      'estMin',
      'estMax',
      'finalOffer',
      'paymentMethod',
      'status',
      'imei',
      'createdAt'
    ];
    const rows = sellRequests.map((r) =>
      headers.map((h) => escapeCsvCell((r as any)[h])).join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const dateStamp = new Date().toISOString().split('T')[0];
    triggerDownload(csv, `sastafone-sell-requests-${dateStamp}.csv`, 'text/csv;charset=utf-8;');
    setBackupStatusMessage(`✓ ${sellRequests.length} बाय-बैक अनुरोध CSV में डाउनलोड हो गए।`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs step-transition overflow-y-auto">
      <div className="relative w-full max-w-5xl my-auto bg-gray-50 rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-gray-200 text-[#132032] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#D5151B] text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#132032] tracking-tight">
                  Sastafone Admin Control Center
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Role: Admin
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                सूरत डोरस्टेप सर्विस, इन्वेंट्री, पार्टनर लेजर व मार्जिन प्रबंधन
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: 'new_bookings', label: 'नई बुकिंग्स', count: counts.new_bookings },
            { id: 'today_pickups', label: 'आज के पिकअप', count: counts.today_pickups },
            { id: 'in_repair', label: 'रिपेयर चालू', count: counts.in_repair },
            { id: 'deliveries', label: 'डिलीवरी', count: counts.deliveries },
            { id: 'sell_requests', label: 'फोन बाय-बैक (Sell)', count: counts.sell_requests },
            { id: 'inventory', label: 'इन्वेंट्री (Buy)', count: inventoryList.length },
            { id: 'partner_ledger', label: 'पार्टनर लेजर', count: partners.length },
            { id: 'rates_slots', label: 'रेट व स्लॉट', count: null },
            { id: 'reviews', label: 'रिव्यू मॉडरेशन', count: counts.reviews_pending },
            { id: 'site_settings', label: 'सेटिंग्स (Site)', count: null },
            { id: 'backup', label: 'बैकअप (Export)', count: null }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-[#D5151B] text-white shadow-2xs'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && tab.count > 0 && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                    activeTab === tab.id ? 'bg-white text-[#D5151B]' : 'bg-red-100 text-[#D5151B]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB: REPAIR JOBS (new_bookings, today_pickups, in_repair, deliveries) */}
          {(activeTab === 'new_bookings' ||
            activeTab === 'today_pickups' ||
            activeTab === 'in_repair' ||
            activeTab === 'deliveries') && (
            <div className="space-y-4">
              {/* Search & Area Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="जॉब ID, ग्राहक नाम, फोन या मॉडल खोजें..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-white text-xs outline-none focus:border-[#D5151B]"
                  />
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <select
                    value={areaFilter}
                    onChange={(e) => setAreaFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white text-gray-700 outline-none"
                  >
                    <option value="all">सभी सूरत क्षेत्र</option>
                    {['Adajan', 'Vesu', 'Pal', 'Varachha', 'Katargam', 'Rander', 'Piplod', 'Citylight'].map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {tabJobs.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-gray-500 text-xs">
                  इस श्रेणी में कोई रिपेयर ऑर्डर नहीं है।
                </div>
              ) : (
                tabJobs.map((job) => {
                  const partner = partners.find((p) => p.id === job.partnerId);
                  const partnerRate = partner?.rateCard?.['screen'] || 350;
                  const pickupCost = job.pickupCost || 70;
                  const finalPrice = job.finalPrice || job.estMax || 1000;
                  const perJobMargin = Math.max(0, finalPrice - partnerRate - pickupCost);

                  return (
                    <div
                      key={job.jobId}
                      className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
                        <div>
                          <span className="text-xs font-mono font-bold text-[#D5151B]">
                            #{job.jobId}
                          </span>
                          <h3 className="text-sm font-bold text-[#132032]">
                            {job.name} • {job.brand} {job.model}
                          </h3>
                          <p className="text-[11px] text-gray-500">
                            पिकअप स्लॉट: {job.pickupSlot?.date} ({job.pickupSlot?.window}) • {job.area}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:${job.phone}`}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>कॉल</span>
                          </a>
                          <a
                            href={`https://wa.me/91${job.phone}?text=${encodeURIComponent(`नमस्ते ${job.name}! Sastafone सूरत से आपके ऑर्डर #${job.jobId} के संबंध में।`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </div>

                      {/* Margin Breakdown Card */}
                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-1">
                        <div className="flex justify-between text-[11px] text-gray-600">
                          <span>फाइनल बिल: ₹{finalPrice}</span>
                          <span>पार्टनर रेट: -₹{partnerRate}</span>
                          <span>पिकअप खर्च: -₹{pickupCost}</span>
                          <span className="font-bold text-emerald-700">नेट मार्जिन: ₹{perJobMargin}</span>
                        </div>
                      </div>

                      {/* Actions: Handover, QC, Status Change */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                        <div className="flex items-center gap-2">
                          <select
                            value={job.partnerId || ''}
                            onChange={(e) => handlePartnerAssign(job.jobId, e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
                          >
                            <option value="">-- पार्टनर असाइन करें --</option>
                            {partners.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.area})
                              </option>
                            ))}
                          </select>

                          <select
                            value={job.status}
                            onChange={(e) => handleStatusChange(job.jobId, e.target.value as JobStatus)}
                            className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs bg-white font-bold"
                          >
                            <option value="Booked">Booked</option>
                            <option value="Pickup scheduled">Pickup scheduled</option>
                            <option value="Picked up">Picked up</option>
                            <option value="Quote approved">Quote approved</option>
                            <option value="In repair">In repair</option>
                            <option value="Ready">Ready</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveHandoverJob(job);
                              setHandoverPartnerId(job.partnerId || '');
                              setHandoverImei(job.qc?.imei || '');
                              setSealedBagId(`BAG-${job.jobId.slice(-4)}`);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#FEF2F2] hover:bg-red-100 text-[#D5151B] border border-red-200 font-bold text-xs cursor-pointer"
                          >
                            सीलबंद हैंडओवर (2-hr Timer)
                          </button>

                          <button
                            type="button"
                            onClick={() => setQcActiveJob(job)}
                            className="px-3 py-1.5 rounded-lg bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-xs cursor-pointer"
                          >
                            11-पॉइंट QC करें
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB: SELL REQUESTS (Section E) */}
          {activeTab === 'sell_requests' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <h3 className="font-bold text-[#132032]">
                  फोन बाय-बैक अनुरोध (`sellRequests`):
                </h3>
                <span className="text-gray-500">{sellRequests.length} अनुरोध</span>
              </div>

              {sellRequests.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-gray-500 text-xs">
                  कोई बाय-बैक अनुरोध नहीं मिला।
                </div>
              ) : (
                sellRequests.map((req) => (
                  <div key={req.id} className="p-4 rounded-2xl bg-white border border-gray-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
                      <div>
                        <span className="text-xs font-mono font-bold text-[#D5151B]">#{req.id.slice(-6)}</span>
                        <h4 className="text-sm font-bold text-[#132032]">
                          {req.customerName} (+91 {req.customerPhone}) • {req.brand} {req.model} ({req.storage})
                        </h4>
                        <p className="text-[11px] text-gray-500">
                          पता: {req.address}, {req.area} • स्लॉट: {req.pickupSlot?.date} ({req.pickupSlot?.window})
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                          {req.status}
                        </span>
                        <p className="text-xs font-bold text-gray-700 mt-1">
                          अनुमानित: ₹{req.estMin} – ₹{req.estMax}
                        </p>
                      </div>
                    </div>

                    {/* Actions: Inspect & Payout / Move to Inventory */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                      <div>
                        {req.payoutRecorded ? (
                          <span className="text-emerald-700 font-bold">
                            ✓ भुगतान पूर्ण: ₹{req.finalOffer} ({req.paymentMethod}) • IMEI: {req.imei}
                          </span>
                        ) : (
                          <span className="text-amber-700">निरीक्षण व अनिवार्य सत्यापन प्रतीक्षारत</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {!req.payoutRecorded && (
                          <button
                            type="button"
                            onClick={() => {
                              setActiveSellInspection(req);
                              setSellInspectionImei(req.imei || '');
                              setSellFinalOffer(req.estMax || 10000);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-xs cursor-pointer"
                          >
                            ऑन-साइट निरीक्षण व पेआउट
                          </button>
                        )}

                        {req.payoutRecorded && !req.movedToInventory && (
                          <button
                            type="button"
                            onClick={() => handleMoveToInventory(req)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                          >
                            + इन्वेंट्री में जोड़ें (Move to Inventory)
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: INVENTORY (Section F) */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <h3 className="font-bold text-[#132032]">
                  सर्टिफाइड फोन इन्वेंट्री (`inventory` Collection):
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddInventoryOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-xs cursor-pointer"
                >
                  + नया फोन इन्वेंट्री में जोड़ें
                </button>
              </div>

              {inventoryList.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-gray-500 text-xs">
                  कोई इन्वेंट्री रिकॉर्ड नहीं मिला।
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {inventoryList.map((item) => (
                    <div key={item.id} className="p-4 rounded-2xl bg-white border border-gray-200 space-y-2 text-xs">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-[#D5151B] uppercase">{item.brand}</span>
                          <h4 className="text-sm font-bold text-[#132032]">{item.model}</h4>
                          <p className="text-gray-500 text-[11px]">
                            {item.storage} • {item.colour} • ग्रेड: {item.grade}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'available'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'booked'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-gray-50 text-[11px] space-y-0.5">
                        <div className="flex justify-between">
                          <span>विक्रय मूल्य:</span>
                          <strong className="text-[#132032] font-mono">₹{item.price}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>प्राइवेट IMEI:</span>
                          <span className="font-mono text-gray-600">{item.imei || 'दर्ज नहीं'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>बैटरी हेल्थ:</span>
                          <span className="text-emerald-700 font-bold">{item.batteryHealth}%</span>
                        </div>
                      </div>

                      {item.status === 'booked' && (
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-[11px] text-amber-800 font-bold">
                            ग्राहक द्वारा टोकन (₹{item.tokenAmount}) बुक
                          </span>
                          <button
                            type="button"
                            onClick={async () => {
                              await updateInventoryPhoneInFirestore(item.id, {
                                status: 'sold',
                                balancePaid: true,
                                deliveredAt: new Date().toISOString()
                              });
                              alert('✓ फोन डिलीवर मार्क हुआ और इनवॉइस जनरेट हो गया!');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] cursor-pointer"
                          >
                            डिलीवर मार्क करें व इनवॉइस बनाएं
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: PARTNER LEDGER (Section H) */}
          {activeTab === 'partner_ledger' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <h3 className="font-bold text-[#132032]">
                  पार्टनर लेजर व सीलबंद बैग हैंडओवर (`partners` & `ledger`):
                </h3>
                <span className="text-gray-500">{partners.length} एक्टिव पार्टनर्स</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {partners.map((p) => (
                  <div key={p.id} className="p-4 rounded-2xl bg-white border border-gray-200 space-y-2 text-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-[#132032]">{p.name}</h4>
                        <p className="text-[11px] text-gray-500">📍 {p.area} • 📞 {p.phone}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        ⭐ {p.rating}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">एडवांस बैलेंस:</span>
                        <strong className="text-[#132032] font-mono text-sm">₹{p.advanceBalance}</strong>
                      </div>
                      <div className="flex justify-between text-[11px] text-gray-500">
                        <span>रेट कार्ड (स्क्रीन रिपेयर):</span>
                        <span>₹{p.rateCard?.['screen'] || 350}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTopupPartnerId(p.id);
                          setTopupAmount(2000);
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs cursor-pointer"
                      >
                        + बैलेंस टॉप-अप करें
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: RATES & SLOTS */}
          {activeTab === 'rates_slots' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#132032]">
                    रिपेयर प्राइस मास्टर (`repairPrices` Collection):
                  </h4>
                  <span className="text-xs text-gray-500">{repairPrices.length} सेवाएं</span>
                </div>

                <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                  {repairPrices.map((item) => {
                    const isEditing = editingPriceId === item.id;
                    return (
                      <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-[#132032] block truncate">{item.name_hi}</span>
                          <span className="text-[10px] text-gray-500">{item.description_hi}</span>
                        </div>

                        {isEditing ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <input
                              type="number"
                              value={editMinPrice}
                              onChange={(e) => setEditMinPrice(parseInt(e.target.value, 10))}
                              className="w-16 px-1.5 py-1 border rounded text-xs font-mono"
                              placeholder="Min ₹"
                            />
                            <span>-</span>
                            <input
                              type="number"
                              value={editMaxPrice}
                              onChange={(e) => setEditMaxPrice(parseInt(e.target.value, 10))}
                              className="w-16 px-1.5 py-1 border rounded text-xs font-mono"
                              placeholder="Max ₹"
                            />
                            <button
                              type="button"
                              disabled={isSavingRate}
                              onClick={() => handleSaveRate(item.id)}
                              className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-xs cursor-pointer"
                            >
                              सेव
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingPriceId(null)}
                              className="px-2 py-1 rounded bg-gray-200 text-gray-700 text-xs cursor-pointer"
                            >
                              रद्द
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-mono font-bold text-[#D5151B]">
                              ₹{item.minPrice} - ₹{item.maxPrice}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPriceId(item.id);
                                setEditMinPrice(item.minPrice);
                                setEditMaxPrice(item.maxPrice);
                                setEditMinutes(item.serviceMinutes);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[11px] cursor-pointer"
                            >
                              एडिट
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: REVIEWS MODERATION (Section J) */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <h3 className="font-bold text-[#132032]">
                  ग्राहक समीक्षा मॉडरेशन (`reviews` Collection):
                </h3>
                <span className="text-gray-500">
                  कम से कम 5 स्वीकृत समीक्षाएं होने पर ही वेबसाइट पर स्टार रेटिंग दिखेगी।
                </span>
              </div>

              {customerReviews.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-gray-500 text-xs">
                  कोई समीक्षा नहीं मिली।
                </div>
              ) : (
                customerReviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-white border border-gray-200 space-y-2 text-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#132032]">{rev.customerName}</span>
                          <span className="text-[10px] text-gray-400">({rev.area})</span>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-500 my-1">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rev.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rev.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rev.status}
                      </span>
                    </div>

                    <p className="text-gray-700 text-xs italic bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      "{rev.reviewText}"
                    </p>

                    <div className="pt-2 flex justify-end gap-2">
                      {rev.status !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => handleModerateReview(rev.id, 'approved')}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                        >
                          स्वीकृत करें (Approve)
                        </button>
                      )}
                      {rev.status !== 'rejected' && (
                        <button
                          type="button"
                          onClick={() => handleModerateReview(rev.id, 'rejected')}
                          className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
                        >
                          अस्वीकृत करें (Reject)
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: SITE SETTINGS */}
          {activeTab === 'site_settings' && (
            <form onSubmit={handleSaveSiteSettings} className="bg-white p-5 rounded-2xl border border-gray-200 space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <Settings className="w-5 h-5 text-[#D5151B]" />
                <div>
                  <h3 className="text-sm font-bold text-[#132032]">
                    पब्लिक वेबसाइट व लोकल संपर्क सेटिंग्स (`settings/public`)
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    यहाँ से सेव किया गया डेटा तुरंत Contact पेज, Footer, WhatsApp बटन और Order Review बटन पर अपडेट होता है।
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#132032] mb-1">
                    Google Review URL ("Review us on Google" बटन के लिए)
                  </label>
                  <input
                    type="url"
                    value={settingsGoogleReviewUrl}
                    onChange={(e) => setSettingsGoogleReviewUrl(e.target.value)}
                    placeholder="https://g.page/r/..."
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#D5151B] outline-none"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    खाली होने पर "Review us on Google" बटन छिपा रहेगा; वैध URL डालते ही यह Contact व पूर्ण ऑर्डर कार्ड में दिखने लगेगा।
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-[#132032] mb-1">
                    WhatsApp नंबर (देश कोड सहित, बिना +)
                  </label>
                  <input
                    type="text"
                    value={settingsWhatsapp}
                    onChange={(e) => setSettingsWhatsapp(e.target.value.replace(/\D/g, ''))}
                    placeholder="919372802044"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 font-mono focus:border-[#D5151B] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#132032] mb-1">
                    सपोर्ट कॉल नंबर (Display + Tel)
                  </label>
                  <input
                    type="text"
                    value={settingsSupportPhone}
                    onChange={(e) => setSettingsSupportPhone(e.target.value)}
                    placeholder="+91 93728 02044"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 font-mono focus:border-[#D5151B] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#132032] mb-1">
                    सपोर्ट ईमेल (Support Email)
                  </label>
                  <input
                    type="email"
                    value={settingsSupportEmail}
                    onChange={(e) => setSettingsSupportEmail(e.target.value)}
                    placeholder="support@sastafone.in"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#D5151B] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#132032] mb-1">
                    कार्य समय (Business Hours)
                  </label>
                  <input
                    type="text"
                    value={settingsBusinessHours}
                    onChange={(e) => setSettingsBusinessHours(e.target.value)}
                    placeholder="9:00 AM – 9:30 PM (Monday – Sunday)"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#D5151B] outline-none"
                  />
                </div>
              </div>

              {settingsSaveMessage && (
                <div className="p-3 rounded-xl bg-[#FEF2F2] border border-red-200 text-[#132032] text-xs font-medium">
                  {settingsSaveMessage}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-5 py-2.5 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-xs cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isSavingSettings ? 'सेव हो रहा है...' : 'पब्लिक सेटिंग्स सेव करें'}
                </button>
              </div>
            </form>
          )}

          {/* TAB: BACKUP EXPORT */}
          {activeTab === 'backup' && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <Database className="w-5 h-5 text-[#D5151B]" />
                <div>
                  <h3 className="text-sm font-bold text-[#132032]">
                    Firestore डेटाबेस बैकअप व CSV एक्सपोर्ट
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    सभी मुख्य कलेक्शन (jobs, sellRequests, inventory, repairPrices, partners, reviews, warrantyClaims, settings) की सुरक्षित ऑफलाइन कॉपी डाउनलोड करें।
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <button
                  type="button"
                  onClick={handleExportFullJsonBackup}
                  disabled={isExportingBackup}
                  className="p-4 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold flex flex-col items-start gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-5 h-5" />
                  <span>पूरा JSON बैकअप डाउनलोड करें (.json)</span>
                  <span className="text-[10px] font-medium text-red-100">
                    {isExportingBackup ? 'सभी कलेक्शन लोड हो रहे हैं...' : 'सभी 10 Firestore कलेक्शन शामिल'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleExportJobsCsv}
                  className="p-4 rounded-xl bg-[#FEF2F2] hover:bg-red-100 border border-red-200 text-[#132032] font-bold flex flex-col items-start gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-5 h-5 text-[#D5151B]" />
                  <span>रिपेयर जॉब्स CSV डाउनलोड करें (.csv)</span>
                  <span className="text-[10px] font-medium text-gray-600">
                    कुल {jobs.length} जॉब्स (Excel/Sheets के लिए)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleExportSellRequestsCsv}
                  className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[#132032] font-bold flex flex-col items-start gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-5 h-5 text-[#132032]" />
                  <span>फोन बाय-बैक CSV डाउनलोड करें (.csv)</span>
                  <span className="text-[10px] font-medium text-gray-600">
                    कुल {sellRequests.length} अनुरोध (Excel/Sheets के लिए)
                  </span>
                </button>
              </div>

              {backupStatusMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                  {backupStatusMessage}
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL: ON-SITE SELL INSPECTION & PAYOUT (Section E) */}
        {activeSellInspection && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-base font-bold text-[#132032]">
                  ऑन-साइट बाय-बैक निरीक्षण व पेआउट
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveSellInspection(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs space-y-3">
                <p className="text-gray-600">
                  फोन: <strong>{activeSellInspection.brand} {activeSellInspection.model} ({activeSellInspection.storage})</strong>
                  <br />
                  ग्राहक: {activeSellInspection.customerName} (+91 {activeSellInspection.customerPhone})
                </p>

                {/* Mandatory Fields */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    1. 15-अंकीय IMEI नंबर दर्ज करें (*#06#) <span className="text-[#D5151B]">*</span>
                  </label>
                  <input
                    type="text"
                    value={sellInspectionImei}
                    onChange={(e) => setSellInspectionImei(e.target.value.replace(/\D/g, '').slice(0, 15))}
                    placeholder="15-अंकीय IMEI"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono text-xs outline-none focus:border-[#D5151B]"
                    maxLength={15}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    2. ग्राहक पहचान पत्र (Aadhaar / DL फोटो) <span className="text-[#D5151B]">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploadingSellId}
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        setIsUploadingSellId(true);
                        setSellPayoutError(null);
                        try {
                          const url = await uploadImageToStorage(e.target.files[0], 'admin/sell-inspections');
                          setSellInspectionIdPhoto(url);
                        } catch (err: any) {
                          setSellPayoutError(err?.message || 'ID फोटो अपलोड विफल रहा।');
                        } finally {
                          setIsUploadingSellId(false);
                        }
                      }
                    }}
                    className="w-full text-xs"
                  />
                  {isUploadingSellId && <p className="text-[11px] text-[#D5151B] mt-1">ID फोटो अपलोड हो रहा है...</p>}
                  {sellInspectionIdPhoto && !isUploadingSellId && (
                    <p className="text-[11px] text-emerald-700 font-bold mt-1">✓ ID फोटो Firebase Storage में अपलोड हुआ</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    3. खरीद बिल / ऑनरशिप प्रूफ फोटो <span className="text-[#D5151B]">*</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploadingSellBill}
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        setIsUploadingSellBill(true);
                        setSellPayoutError(null);
                        try {
                          const url = await uploadImageToStorage(e.target.files[0], 'admin/sell-inspections');
                          setSellInspectionBillPhoto(url);
                        } catch (err: any) {
                          setSellPayoutError(err?.message || 'बिल फोटो अपलोड विफल रहा।');
                        } finally {
                          setIsUploadingSellBill(false);
                        }
                      }
                    }}
                    className="w-full text-xs"
                  />
                  {isUploadingSellBill && <p className="text-[11px] text-[#D5151B] mt-1">बिल फोटो अपलोड हो रहा है...</p>}
                  {sellInspectionBillPhoto && !isUploadingSellBill && (
                    <p className="text-[11px] text-emerald-700 font-bold mt-1">✓ बिल फोटो Firebase Storage में अपलोड हुआ</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    4. अंतिम ऑफर रकम (Final Offer Amount) ₹ <span className="text-[#D5151B]">*</span>
                  </label>
                  <input
                    type="number"
                    value={sellFinalOffer}
                    onChange={(e) => setSellFinalOffer(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    5. भुगतान माध्यम (Payment Method)
                  </label>
                  <select
                    value={sellPaymentMethod}
                    onChange={(e) => setSellPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white"
                  >
                    <option value="UPI">UPI ट्रांसफर (Instant)</option>
                    <option value="Bank Transfer">बैंक ट्रांसफर (NEFT/IMPS)</option>
                    <option value="Cash">कैश (On-Spot)</option>
                  </select>
                </div>

                {sellPayoutError && (
                  <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{sellPayoutError}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSellInspection(null)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={handleCompleteSellInspection}
                  className="flex-1 py-2.5 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-xs cursor-pointer"
                >
                  बाय-बैक पुष्टि करें व पेआउट दें
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: PARTNER HANDOVER WITH SEALED BAG & 2-HOUR TIMER (Section H) */}
        {activeHandoverJob && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-200 text-xs">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-base font-bold text-[#132032]">
                  सीलबंद बैग हैंडओवर (2-Hour Timer)
                </h3>
                <button type="button" onClick={() => setActiveHandoverJob(null)}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-3 bg-red-50 rounded-xl text-[11px] text-[#D5151B] font-semibold">
                *डेटा सुरक्षा: पार्टनर को ग्राहक का नाम व फोन नंबर नहीं दिखाया जाएगा। सीलबंद बैग पर केवल जॉब ID #{activeHandoverJob.jobId} दिखेगी।
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">सीलबंद बैग ID *</label>
                  <input
                    type="text"
                    value={sealedBagId}
                    onChange={(e) => setSealedBagId(e.target.value)}
                    placeholder="उदा. BAG-9812"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">फोन IMEI नंबर *</label>
                  <input
                    type="text"
                    value={handoverImei}
                    onChange={(e) => setHandoverImei(e.target.value)}
                    placeholder="15-अंकीय IMEI"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">पार्टनर चुनें *</label>
                  <select
                    value={handoverPartnerId}
                    onChange={(e) => setHandoverPartnerId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs"
                  >
                    <option value="">-- पार्टनर चुनें --</option>
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.area}) - बैलेंस: ₹{p.advanceBalance}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveHandoverJob(null)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={handleConfirmHandover}
                  className="flex-1 py-2.5 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold cursor-pointer"
                >
                  हैंडओवर व 2-घंटे टाइमर शुरू
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: TOP-UP ADVANCE BALANCE (Section H) */}
        {topupPartnerId && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-3 shadow-2xl border border-gray-200 text-xs">
              <h3 className="text-sm font-bold text-[#132032]">पार्टनर एडवांस बैलेंस टॉप-अप</h3>
              <p className="text-gray-600">
                पार्टनर: <strong>{partners.find((p) => p.id === topupPartnerId)?.name}</strong>
              </p>
              <div>
                <label className="block font-bold text-gray-700 mb-1">टॉप-अप रकम (₹)</label>
                <input
                  type="number"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono text-sm font-bold"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setTopupPartnerId(null)}
                  className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={handlePartnerTopup}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold"
                >
                  टॉप-अप जोड़ें
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: ADD INVENTORY PHONE */}
        {isAddInventoryOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <form
              onSubmit={handleSaveNewInventory}
              className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto text-xs"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-[#132032]">
                  नया सर्टिफाइड फोन इन्वेंट्री में जोड़ें
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddInventoryOpen(false)}
                  className="text-gray-500 hover:text-[#132032]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#132032] mb-1">ब्रांड</label>
                  <select
                    value={newInvBrand}
                    onChange={(e) => setNewInvBrand(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white outline-none focus:border-[#D5151B]"
                  >
                    {['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Vivo', 'Oppo', 'Realme', 'Google'].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#132032] mb-1">मॉडल नाम *</label>
                  <input
                    type="text"
                    value={newInvModel}
                    onChange={(e) => setNewInvModel(e.target.value)}
                    placeholder="उदा. iPhone 13 Pro"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-[#D5151B]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#132032] mb-1">स्टोरेज</label>
                  <select
                    value={newInvStorage}
                    onChange={(e) => setNewInvStorage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white outline-none focus:border-[#D5151B]"
                  >
                    {['64GB', '128GB', '256GB', '512GB', '1TB'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#132032] mb-1">रंग (Colour)</label>
                  <input
                    type="text"
                    value={newInvColour}
                    onChange={(e) => setNewInvColour(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-[#D5151B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#132032] mb-1">कंडीशन ग्रेड</label>
                  <select
                    value={newInvGrade}
                    onChange={(e) => setNewInvGrade(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white outline-none focus:border-[#D5151B]"
                  >
                    <option value="A+ Like New">A+ Like New</option>
                    <option value="A Excellent">A Excellent</option>
                    <option value="B Good">B Good</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#132032] mb-1">बैटरी हेल्थ (%)</label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={newInvBattery}
                    onChange={(e) => setNewInvBattery(parseInt(e.target.value, 10) || 85)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono outline-none focus:border-[#D5151B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#132032] mb-1">15-अंकीय IMEI *</label>
                  <input
                    type="text"
                    value={newInvImei}
                    onChange={(e) => setNewInvImei(e.target.value.replace(/\D/g, '').slice(0, 15))}
                    placeholder="15-अंकीय IMEI"
                    maxLength={15}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono outline-none focus:border-[#D5151B]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#132032] mb-1">विक्रय मूल्य (₹) *</label>
                  <input
                    type="number"
                    value={newInvPrice}
                    onChange={(e) => setNewInvPrice(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono font-bold outline-none focus:border-[#D5151B]"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#132032] mb-1">फोन की तस्वीरें (Firebase Storage)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isUploadingInvPhotos}
                    onChange={async (e) => {
                      if (!e.target.files || e.target.files.length === 0) return;
                      setIsUploadingInvPhotos(true);
                      setInvError(null);
                      try {
                        const urls = await Promise.all(
                          Array.from(e.target.files)
                            .slice(0, 4)
                            .map((f) => uploadImageToStorage(f, 'inventory'))
                        );
                        setNewInvPhotos((prev) => [...prev, ...urls].slice(0, 5));
                      } catch (err: any) {
                        setInvError(err?.message || 'फोटो अपलोड विफल रहा।');
                      } finally {
                        setIsUploadingInvPhotos(false);
                      }
                    }}
                    className="w-full text-xs"
                  />
                  {isUploadingInvPhotos && (
                    <p className="text-[11px] text-[#D5151B] mt-1">तस्वीरें अपलोड हो रही हैं...</p>
                  )}
                  {newInvPhotos.length > 0 && (
                    <p className="text-[11px] text-emerald-700 font-bold mt-1">
                      ✓ {newInvPhotos.length} तस्वीरें अपलोड हुईं
                    </p>
                  )}
                </div>
              </div>

              {invError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-[#D5151B] text-xs">
                  {invError}
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddInventoryOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={isSavingInventory || isUploadingInvPhotos}
                  className="flex-1 py-2.5 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {isSavingInventory ? 'सेव हो रहा है...' : 'इन्वेंट्री में जोड़ें'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* QC Screen Modal */}
        {qcActiveJob && (
          <PickupQCScreen
            job={qcActiveJob}
            allRepairPrices={repairPrices}
            onClose={() => setQcActiveJob(null)}
            onSuccess={() => {
              setQcActiveJob(null);
              subscribeToAllJobs(setJobs);
            }}
          />
        )}
      </div>
    </div>
  );
};
