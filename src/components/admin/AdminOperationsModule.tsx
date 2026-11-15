import React, { useEffect, useMemo, useState } from 'react';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import {
  AdminSettings,
  AuditLogEntry,
  CustomerNote,
  CustomerReferral,
  InventoryPhone,
  Job,
  OwnerListing,
  RepairPrice,
  SellRequest,
  Slot
} from '../../types';
import {
  SiteSettings,
  updateSiteSettingsInFirestore
} from '../../services/siteSettingsService';
import {
  addCustomerNote,
  createOrUpdateSlot,
  createRepairPriceInFirestore,
  deleteRepairPriceInFirestore,
  deleteSlotInFirestore,
  downloadCsvFile,
  recordAuditLog,
  saveAdminSettings
} from '../../services/adminService';
import {
  addInventoryPhoneInFirestore,
  updateInventoryPhoneInFirestore,
  updateRepairPriceInFirestore,
  updateSellRequestInFirestore
} from '../../services/firestoreRepairService';
import { uploadImageToStorage } from '../../utils/storageUpload';
import {
  Users,
  Smartphone,
  ShoppingBag,
  ListChecks,
  Gift,
  Calendar,
  Wrench,
  Shield,
  Settings,
  Download,
  Plus,
  Trash2,
  Check,
  X,
  Search
} from 'lucide-react';

export type OperationsSubSection =
  | 'customers'
  | 'sell_requests'
  | 'inventory'
  | 'owner_listings'
  | 'referrals'
  | 'slots'
  | 'prices'
  | 'audit_logs'
  | 'settings_exports';

interface AdminOperationsModuleProps {
  section: OperationsSubSection;
  onChangeSection: (s: OperationsSubSection) => void;
  jobs: Job[];
  sellRequests: SellRequest[];
  inventory: InventoryPhone[];
  ownerListings: OwnerListing[];
  referrals: CustomerReferral[];
  slots: Slot[];
  repairPrices: RepairPrice[];
  customerNotes: CustomerNote[];
  auditLogs: AuditLogEntry[];
  siteSettings: SiteSettings;
  adminSettings: AdminSettings;
  userUid: string;
}

const SURAT_AREAS = ['Adajan', 'Vesu', 'Pal', 'Varachha', 'Katargam', 'Rander', 'Piplod', 'Citylight', 'All Surat'];

export const AdminOperationsModule: React.FC<AdminOperationsModuleProps> = ({
  section,
  onChangeSection,
  jobs,
  sellRequests,
  inventory,
  ownerListings,
  referrals,
  slots,
  repairPrices,
  customerNotes,
  auditLogs,
  siteSettings,
  adminSettings,
  userUid
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Customers state
  const [custSearch, setCustSearch] = useState('');
  const [selectedCustPhone, setSelectedCustPhone] = useState<string | null>(null);
  const [newCustNote, setNewCustNote] = useState('');

  // Sell inspection state
  const [inspectSell, setInspectSell] = useState<SellRequest | null>(null);
  const [sellImei, setSellImei] = useState('');
  const [sellOffer, setSellOffer] = useState(0);
  const [sellMethod, setSellMethod] = useState<'UPI' | 'Bank Transfer' | 'Cash'>('UPI');
  const [sellIdPhoto, setSellIdPhoto] = useState('');
  const [sellBillPhoto, setSellBillPhoto] = useState('');

  // Inventory add modal state
  const [showAddInv, setShowAddInv] = useState(false);
  const [invBrand, setInvBrand] = useState('Apple');
  const [invModel, setInvModel] = useState('');
  const [invStorage, setInvStorage] = useState('128GB');
  const [invPrice, setInvPrice] = useState(25000);
  const [invImei, setInvImei] = useState('');
  const [invPhotos, setInvPhotos] = useState<string[]>([]);

  // Slot CRUD state
  const [slotDate, setSlotDate] = useState(new Date().toISOString().split('T')[0]);
  const [slotArea, setSlotArea] = useState('Adajan');
  const [slotWindow, setSlotWindow] = useState('10:00 AM - 01:00 PM (Morning Slot)');
  const [slotCapacity, setSlotCapacity] = useState(4);

  // Repair Price CRUD state
  const [newPriceId, setNewPriceId] = useState('');
  const [newPriceName, setNewPriceName] = useState('');
  const [newPriceDesc, setNewPriceDesc] = useState('');
  const [newPriceMin, setNewPriceMin] = useState(499);
  const [newPriceMax, setNewPriceMax] = useState(999);
  const [newPriceMins, setNewPriceMins] = useState(30);
  const [newPriceWarranty, setNewPriceWarranty] = useState(6);

  // Audit Log search
  const [auditSearch, setAuditSearch] = useState('');

  // Settings form
  const [pubForm, setPubForm] = useState<SiteSettings>(siteSettings);
  const [admForm, setAdmForm] = useState<AdminSettings>(adminSettings);

  useEffect(() => {
    setPubForm(siteSettings);
  }, [siteSettings]);

  useEffect(() => {
    setAdmForm(adminSettings);
  }, [adminSettings]);

  // Derived Customer Directory
  const customersList = useMemo(() => {
    const map = new Map<
      string,
      {
        phone: string;
        name: string;
        area: string;
        userId: string;
        jobCount: number;
        sellCount: number;
        totalSpent: number;
      }
    >();

    jobs.forEach((j) => {
      const key = (j.phone || j.userId || '').replace(/\D/g, '').slice(-10) || j.jobId;
      const cur = map.get(key) || {
        phone: j.phone,
        name: j.name,
        area: j.area,
        userId: j.userId,
        jobCount: 0,
        sellCount: 0,
        totalSpent: 0
      };
      cur.jobCount += 1;
      if (['Delivered', 'Ready', 'In repair'].includes(j.status)) {
        cur.totalSpent += Number(j.finalPrice || j.estMax || 0);
      }
      map.set(key, cur);
    });

    sellRequests.forEach((s) => {
      const key = (s.customerPhone || s.userId || '').replace(/\D/g, '').slice(-10) || s.id;
      const cur = map.get(key) || {
        phone: s.customerPhone,
        name: s.customerName,
        area: s.area,
        userId: s.userId,
        jobCount: 0,
        sellCount: 0,
        totalSpent: 0
      };
      cur.sellCount += 1;
      map.set(key, cur);
    });

    const list = Array.from(map.values());
    if (!custSearch.trim()) return list;
    const q = custSearch.toLowerCase();
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.area.toLowerCase().includes(q)
    );
  }, [jobs, sellRequests, custSearch]);

  const handleSaveCustomerNote = async () => {
    if (!selectedCustPhone || !newCustNote.trim()) return;
    const cust = customersList.find((c) => c.phone === selectedCustPhone);
    await addCustomerNote({
      phone: selectedCustPhone,
      userId: cust?.userId,
      customerName: cust?.name,
      note: newCustNote.trim()
    });
    setNewCustNote('');
    setFeedback('✓ ग्राहक नोट सेव हो गया।');
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = `slot_${slotDate}_${slotArea.toLowerCase().replace(/\s+/g, '_')}_${Date.now().toString().slice(-3)}`;
    await createOrUpdateSlot({
      id,
      date: slotDate,
      area: slotArea,
      window: slotWindow,
      capacity: slotCapacity,
      booked: 0
    });
    setFeedback(`✓ स्लॉट जोड़ा गया (${slotDate} • ${slotArea})`);
  };

  const handleSaveNewPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = (newPriceId || newPriceName).toLowerCase().replace(/[^a-z0-9]+/g, '_');
    if (!id || !newPriceName.trim()) return;
    await createRepairPriceInFirestore({
      id,
      name_hi: newPriceName.trim(),
      description_hi: newPriceDesc.trim() || 'Sastafone Certified Repair Service',
      minPrice: newPriceMin,
      maxPrice: newPriceMax,
      serviceMinutes: newPriceMins,
      warrantyMonths: newPriceWarranty,
      active: true,
      sortOrder: repairPrices.length + 1
    });
    setNewPriceId('');
    setNewPriceName('');
    setNewPriceDesc('');
    setFeedback('✓ नया रिपेयर रेट जोड़ा गया।');
  };

  const handleCompleteSellInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectSell || sellImei.length < 15 || !sellIdPhoto) {
      setFeedback('15-अंकीय IMEI व ID फोटो अनिवार्य है।');
      return;
    }
    setBusy(true);
    try {
      await updateSellRequestInFirestore(inspectSell.id, {
        imei: sellImei,
        idPhotoUrl: sellIdPhoto,
        billPhotoUrl: sellBillPhoto || inspectSell.billPhotoUrl || '',
        finalOffer: sellOffer,
        paymentMethod: sellMethod,
        payoutRecorded: true,
        status: 'Purchased'
      });
      await recordAuditLog({
        action: 'sell_buyback_purchased',
        targetType: 'sellRequest',
        targetId: inspectSell.id,
        after: { imei: sellImei, finalOffer: sellOffer, paymentMethod: sellMethod }
      });
      setInspectSell(null);
      setFeedback('✓ बाय-बैक भुगतान रिकॉर्ड हो गया।');
    } finally {
      setBusy(false);
    }
  };

  const handleMoveSellToInventory = async (req: SellRequest) => {
    const slug = `${req.brand.toLowerCase()}-${req.model.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`;
    await addInventoryPhoneInFirestore({
      slug,
      brand: req.brand,
      model: req.model,
      storage: req.storage,
      colour: 'Original',
      grade: 'A Excellent',
      batteryHealth: 88,
      imei: req.imei || '',
      photos: req.conditionPhotos || [],
      price: Math.round((req.finalOffer || 12000) * 1.25),
      tokenAmount: adminSettings.buyPhoneTokenAmount || 499,
      warrantyMonths: 6,
      status: 'available',
      description: `सर्टिफाइड ${req.brand} ${req.model} (${req.storage})। 32-पॉइंट QC और 6 माह वारंटी।`
    });
    await updateSellRequestInFirestore(req.id, { movedToInventory: true, status: 'Moved to inventory' });
    await recordAuditLog({
      action: 'sell_moved_to_inventory',
      targetType: 'sellRequest',
      targetId: req.id
    });
    setFeedback('✓ फोन इन्वेंट्री में जुड़ गया।');
  };

  const handleSaveAllSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await updateSiteSettingsInFirestore(pubForm, userUid);
      await saveAdminSettings(admForm);
      setFeedback('✓ पब्लिक व एडमिन कंट्रोल सेटिंग्स सेव हो गईं।');
    } finally {
      setBusy(false);
    }
  };

  const handleFullJsonBackup = async () => {
    const cols = [
      'jobs',
      'partnerJobs',
      'sellRequests',
      'inventory',
      'ownerListings',
      'repairPrices',
      'partners',
      'slots',
      'reviews',
      'referrals',
      'invoices',
      'handovers',
      'ledger',
      'auditLogs',
      'settings'
    ];
    const data: Record<string, any[]> = {};
    for (const c of cols) {
      try {
        const snap = await getDocs(collection(db, c));
        data[c] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      } catch {
        data[c] = [];
      }
    }
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), data }, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sastafone-full-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    await recordAuditLog({ action: 'full_json_backup_exported', targetType: 'system', targetId: 'backup' });
  };

  const navItems: { id: OperationsSubSection; label: string; icon: any; count?: number }[] = [
    { id: 'customers', label: 'Customers', icon: Users, count: customersList.length },
    { id: 'sell_requests', label: 'Sell Requests', icon: Smartphone, count: sellRequests.length },
    { id: 'inventory', label: 'Buy Inventory', icon: ShoppingBag, count: inventory.length },
    { id: 'owner_listings', label: 'Owner Listings', icon: ListChecks, count: ownerListings.length },
    { id: 'referrals', label: 'Referrals', icon: Gift, count: referrals.length },
    { id: 'slots', label: 'Slots & Areas', icon: Calendar, count: slots.length },
    { id: 'prices', label: 'Repair Prices', icon: Wrench, count: repairPrices.length },
    { id: 'audit_logs', label: 'Audit Logs', icon: Shield, count: auditLogs.length },
    { id: 'settings_exports', label: 'Settings & CSV', icon: Settings }
  ];

  return (
    <div className="space-y-4">
      {feedback && (
        <div className="p-3 rounded-xl bg-[#FEF2F2] border border-red-200 text-xs font-bold text-[#132032] flex items-center justify-between">
          <span>{feedback}</span>
          <button type="button" onClick={() => setFeedback(null)} className="cursor-pointer">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      )}

      {/* Sub-navigation pills */}
      <div className="flex flex-wrap gap-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = section === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeSection(item.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                active
                  ? 'bg-[#D5151B] text-white'
                  : 'bg-white border border-gray-200 text-[#132032] hover:bg-gray-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span className={`text-[10px] px-1.5 rounded-full ${active ? 'bg-white text-[#D5151B]' : 'bg-gray-100'}`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1. CUSTOMERS DIRECTORY + NOTES */}
      {section === 'customers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
          <div className="lg:col-span-2 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={custSearch}
                onChange={(e) => setCustSearch(e.target.value)}
                placeholder="ग्राहक नाम, मोबाइल या इलाका खोजें..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-white outline-none focus:border-[#D5151B]"
              />
            </div>

            {customersList.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-gray-500">
                कोई ग्राहक रिकॉर्ड नहीं मिला।
              </div>
            ) : (
              customersList.map((c) => (
                <div
                  key={c.phone || c.name}
                  onClick={() => setSelectedCustPhone(c.phone)}
                  className={`p-4 rounded-2xl bg-white border flex items-center justify-between cursor-pointer ${
                    selectedCustPhone === c.phone ? 'border-[#D5151B] bg-[#FEF2F2]/30' : 'border-gray-200'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-sm text-[#132032]">{c.name}</h4>
                    <p className="text-gray-500 font-mono">
                      +91 {c.phone} • {c.area}
                    </p>
                  </div>
                  <div className="text-right tabular-nums">
                    <span className="font-bold text-[#D5151B] block">₹{c.totalSpent.toLocaleString('en-IN')}</span>
                    <span className="text-[11px] text-gray-500">
                      {c.jobCount} Repairs • {c.sellCount} Sells
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 rounded-2xl bg-white border border-gray-200 space-y-3 h-fit">
            <h4 className="font-bold text-sm text-[#132032]">Customer History & Internal Notes</h4>
            {!selectedCustPhone ? (
              <p className="text-gray-500">इतिहास और नोट्स देखने के लिए किसी ग्राहक को चुनें।</p>
            ) : (
              <>
                <p className="font-mono font-bold text-[#D5151B]">+91 {selectedCustPhone}</p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {jobs
                    .filter((j) => j.phone === selectedCustPhone)
                    .map((j) => (
                      <div key={j.jobId} className="p-2 rounded-lg bg-gray-50 border border-gray-100">
                        <strong>#{j.jobId}</strong> • {j.brand} {j.model} ({j.status})
                      </div>
                    ))}
                </div>
                <div className="pt-2 border-t border-gray-100 space-y-2">
                  <textarea
                    rows={2}
                    value={newCustNote}
                    onChange={(e) => setNewCustNote(e.target.value)}
                    placeholder="ग्राहक के बारे में गोपनीय नोट जोड़ें..."
                    className="w-full p-2 rounded-xl border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={handleSaveCustomerNote}
                    className="w-full py-2 rounded-xl bg-[#132032] text-white font-bold cursor-pointer"
                  >
                    Save Internal Note
                  </button>
                </div>
                <div className="space-y-1.5 pt-2">
                  {customerNotes
                    .filter((n) => n.phone === selectedCustPhone)
                    .map((n) => (
                      <div key={n.id} className="p-2 rounded-lg bg-[#FEF2F2] text-[11px]">
                        <p>{n.note}</p>
                        <span className="text-[10px] text-gray-500">
                          {new Date(n.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 2. SELL REQUESTS */}
      {section === 'sell_requests' && (
        <div className="space-y-3 text-xs">
          {sellRequests.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-gray-500">
              कोई फोन बेचने का अनुरोध नहीं मिला।
            </div>
          ) : (
            sellRequests.map((req) => (
              <div key={req.id} className="p-4 rounded-2xl bg-white border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-mono text-[#D5151B] font-bold">#{req.id.slice(-6)}</span>
                  <h4 className="font-bold text-sm text-[#132032]">
                    {req.customerName} (+91 {req.customerPhone}) • {req.brand} {req.model} ({req.storage})
                  </h4>
                  <p className="text-gray-500">
                    {req.address}, {req.area} • Status: <strong>{req.status}</strong> • Est: ₹{req.estMin}–₹{req.estMax}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!req.payoutRecorded && (
                    <button
                      type="button"
                      onClick={() => {
                        setInspectSell(req);
                        setSellImei(req.imei || '');
                        setSellOffer(req.estMax || 10000);
                      }}
                      className="px-3 py-2 rounded-xl bg-[#D5151B] text-white font-bold cursor-pointer"
                    >
                      Inspect & Record Payout
                    </button>
                  )}
                  {req.payoutRecorded && !req.movedToInventory && (
                    <button
                      type="button"
                      onClick={() => handleMoveSellToInventory(req)}
                      className="px-3 py-2 rounded-xl bg-emerald-600 text-white font-bold cursor-pointer"
                    >
                      Move to Inventory
                    </button>
                  )}
                </div>
              </div>
            ))
          )}

          {inspectSell && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
              <form
                onSubmit={handleCompleteSellInspection}
                className="bg-white rounded-3xl max-w-md w-full p-5 space-y-3 shadow-2xl border border-gray-200"
              >
                <h4 className="font-bold text-sm text-[#132032]">
                  Buy-Back Inspection: {inspectSell.brand} {inspectSell.model}
                </h4>
                <input
                  type="text"
                  required
                  value={sellImei}
                  onChange={(e) => setSellImei(e.target.value.replace(/\D/g, '').slice(0, 15))}
                  placeholder="15-digit IMEI *"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono"
                />
                <input
                  type="number"
                  required
                  value={sellOffer}
                  onChange={(e) => setSellOffer(Number(e.target.value) || 0)}
                  placeholder="Final Payout ₹ *"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono"
                />
                <select
                  value={sellMethod}
                  onChange={(e) => setSellMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
                >
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                </select>
                <div>
                  <label className="block font-bold mb-1">Upload ID Photo (/admin/sell) *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) setSellIdPhoto(await uploadImageToStorage(f, `admin/sell/${inspectSell.id}`));
                    }}
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Upload Bill Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) setSellBillPhoto(await uploadImageToStorage(f, `admin/sell/${inspectSell.id}`));
                    }}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setInspectSell(null)}
                    className="flex-1 py-2 rounded-xl bg-gray-100 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={busy}
                    className="flex-1 py-2 rounded-xl bg-[#D5151B] text-white font-bold cursor-pointer"
                  >
                    Confirm Payout
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* 3. BUY INVENTORY */}
      {section === 'inventory' && (
        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-[#132032]">Certified Buy Phones Inventory</h3>
            <button
              type="button"
              onClick={() => setShowAddInv(true)}
              className="px-3.5 py-2 rounded-xl bg-[#D5151B] text-white font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Phone</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {inventory.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-white border border-gray-200 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-[#D5151B]">{item.brand}</span>
                    <h4 className="font-bold text-sm text-[#132032]">
                      {item.model} ({item.storage})
                    </h4>
                    <p className="text-[11px] text-gray-500">IMEI: {item.imei} • Grade: {item.grade}</p>
                  </div>
                  <span className="font-bold text-base text-[#132032] tabular-nums">
                    ₹{item.price.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="font-bold uppercase text-[10px]">{item.status}</span>
                  <div className="flex gap-1.5">
                    {(['available', 'booked', 'sold'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => updateInventoryPhoneInFirestore(item.id, { status: st })}
                        className={`px-2 py-1 rounded-lg font-bold capitalize cursor-pointer ${
                          item.status === st ? 'bg-[#132032] text-white' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showAddInv && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const slug = `${invBrand.toLowerCase()}-${invModel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
                  await addInventoryPhoneInFirestore({
                    slug,
                    brand: invBrand,
                    model: invModel,
                    storage: invStorage,
                    colour: 'Original',
                    grade: 'A+ Like New',
                    batteryHealth: 92,
                    imei: invImei,
                    photos: invPhotos,
                    price: invPrice,
                    tokenAmount: adminSettings.buyPhoneTokenAmount || 499,
                    warrantyMonths: 6,
                    status: 'available',
                    description: `सर्टिफाइड ${invBrand} ${invModel} (${invStorage}) • 6 महीने वारंटी`
                  });
                  setShowAddInv(false);
                  setInvModel('');
                  setInvImei('');
                  setInvPhotos([]);
                }}
                className="bg-white rounded-3xl max-w-md w-full p-5 space-y-3 shadow-2xl border border-gray-200"
              >
                <h4 className="font-bold text-sm">Add Certified Inventory</h4>
                <input
                  type="text"
                  required
                  value={invBrand}
                  onChange={(e) => setInvBrand(e.target.value)}
                  placeholder="Brand (Apple, Samsung...)"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
                <input
                  type="text"
                  required
                  value={invModel}
                  onChange={(e) => setInvModel(e.target.value)}
                  placeholder="Model (e.g. iPhone 14)"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={invStorage}
                    onChange={(e) => setInvStorage(e.target.value)}
                    placeholder="Storage"
                    className="px-3 py-2 rounded-xl border border-gray-200"
                  />
                  <input
                    type="number"
                    required
                    value={invPrice}
                    onChange={(e) => setInvPrice(Number(e.target.value) || 0)}
                    placeholder="Price ₹"
                    className="px-3 py-2 rounded-xl border border-gray-200 font-mono"
                  />
                </div>
                <input
                  type="text"
                  required
                  value={invImei}
                  onChange={(e) => setInvImei(e.target.value.replace(/\D/g, '').slice(0, 15))}
                  placeholder="15-digit IMEI"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono"
                />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []).slice(0, 4);
                    const urls = await Promise.all(files.map((f) => uploadImageToStorage(f, 'inventory')));
                    setInvPhotos(urls);
                  }}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddInv(false)}
                    className="flex-1 py-2 rounded-xl bg-gray-100 font-bold"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-2 rounded-xl bg-[#D5151B] text-white font-bold">
                    Save Phone
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* 4. OWNER LISTINGS MODERATION */}
      {section === 'owner_listings' && (
        <div className="space-y-3 text-xs">
          {ownerListings.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-gray-500">
              कोई ओनर लिस्टिंग मॉडरेशन के लिए नहीं है।
            </div>
          ) : (
            ownerListings.map((ol) => (
              <div key={ol.id} className="p-4 rounded-2xl bg-white border border-gray-200 flex flex-col sm:flex-row justify-between gap-3">
                <div>
                  <span className="font-bold text-[#D5151B] uppercase text-[10px]">{ol.status}</span>
                  <h4 className="font-bold text-sm text-[#132032]">
                    {ol.brand} {ol.model} ({ol.storage}) — ₹{ol.price}
                  </h4>
                  <p className="text-gray-500">
                    Owner: {ol.ownerName} (+91 {ol.ownerPhone}) • {ol.area}
                  </p>
                  <p className="text-gray-600 mt-1">{ol.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={async () => {
                      await updateDoc(doc(db, 'ownerListings', ol.id), { status: 'approved', updatedAt: new Date().toISOString() });
                      await recordAuditLog({ action: 'owner_listing_approved', targetType: 'ownerListing', targetId: ol.id });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await updateDoc(doc(db, 'ownerListings', ol.id), { status: 'rejected', updatedAt: new Date().toISOString() });
                      await recordAuditLog({ action: 'owner_listing_rejected', targetType: 'ownerListing', targetId: ol.id });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 5. REFERRALS */}
      {section === 'referrals' && (
        <div className="space-y-3 text-xs">
          {referrals.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-gray-500">
              अभी कोई रेफरल रिकॉर्ड नहीं मिला।
            </div>
          ) : (
            referrals.map((ref) => (
              <div key={ref.id} className="p-4 rounded-2xl bg-white border border-gray-200 flex flex-col sm:flex-row justify-between gap-3">
                <div>
                  <span className="font-mono font-bold text-[#D5151B]">Job #{ref.jobId}</span>
                  <h4 className="font-bold text-sm text-[#132032]">
                    {ref.referrerName} (+91 {ref.referrerPhone}) — Discount: ₹{ref.discountAmount}
                  </h4>
                  <p className="text-gray-600 mt-1">
                    Contacts: {ref.contacts?.map((c) => `${c.name} (${c.phone})`).join(', ')}
                  </p>
                  <span className="text-[10px] font-bold uppercase text-gray-500">Status: {ref.status}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={async () => {
                      await updateDoc(doc(db, 'referrals', ref.id), { status: 'verified' });
                      await recordAuditLog({ action: 'referral_verified', targetType: 'referral', targetId: ref.id });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold cursor-pointer"
                  >
                    Verify
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await updateDoc(doc(db, 'referrals', ref.id), { status: 'rejected' });
                      await recordAuditLog({ action: 'referral_rejected', targetType: 'referral', targetId: ref.id });
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 6. SLOTS & AREAS CRUD */}
      {section === 'slots' && (
        <div className="space-y-4 text-xs">
          <form
            onSubmit={handleSaveSlot}
            className="p-4 rounded-2xl bg-white border border-gray-200 grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-end"
          >
            <div>
              <label className="block font-bold mb-1">Date</label>
              <input
                type="date"
                required
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Area</label>
              <select
                value={slotArea}
                onChange={(e) => setSlotArea(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
              >
                {SURAT_AREAS.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold mb-1">Window</label>
              <select
                value={slotWindow}
                onChange={(e) => setSlotWindow(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"
              >
                <option value="10:00 AM - 01:00 PM (Morning Slot)">10:00 AM - 01:00 PM</option>
                <option value="02:00 PM - 05:00 PM (Afternoon Slot)">02:00 PM - 05:00 PM</option>
                <option value="05:00 PM - 08:00 PM (Evening Express Slot)">05:00 PM - 08:00 PM</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-1">Capacity</label>
              <input
                type="number"
                min={1}
                value={slotCapacity}
                onChange={(e) => setSlotCapacity(Number(e.target.value) || 4)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono"
              />
            </div>
            <button type="submit" className="py-2 px-4 rounded-xl bg-[#D5151B] text-white font-bold cursor-pointer">
              + Add Slot
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {slots.map((slot) => (
              <div key={slot.id} className="p-3.5 rounded-2xl bg-white border border-gray-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#132032]">{slot.area} • {slot.date}</p>
                  <p className="text-[11px] text-gray-500">{slot.window}</p>
                  <p className="text-[11px] font-mono text-[#D5151B]">
                    Booked: {slot.booked} / {slot.capacity}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteSlotInFirestore(slot.id)}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. REPAIR PRICE LIST CRUD */}
      {section === 'prices' && (
        <div className="space-y-4 text-xs">
          <form
            onSubmit={handleSaveNewPrice}
            className="p-4 rounded-2xl bg-white border border-gray-200 grid grid-cols-1 sm:grid-cols-6 gap-2 items-end"
          >
            <div className="sm:col-span-2">
              <label className="block font-bold mb-1">Service Name (Hindi + Eng) *</label>
              <input
                type="text"
                required
                value={newPriceName}
                onChange={(e) => setNewPriceName(e.target.value)}
                placeholder="उदा. बैक ग्लास रिप्लेसमेंट (Back Glass)"
                className="w-full px-3 py-2 rounded-xl border border-gray-200"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Min ₹</label>
              <input
                type="number"
                value={newPriceMin}
                onChange={(e) => setNewPriceMin(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Max ₹</label>
              <input
                type="number"
                value={newPriceMax}
                onChange={(e) => setNewPriceMax(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Minutes</label>
              <input
                type="number"
                value={newPriceMins}
                onChange={(e) => setNewPriceMins(Number(e.target.value) || 30)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono"
              />
            </div>
            <button type="submit" className="py-2 px-4 rounded-xl bg-[#D5151B] text-white font-bold cursor-pointer">
              + Add Price
            </button>
          </form>

          <div className="space-y-2">
            {repairPrices.map((rp) => (
              <div key={rp.id} className="p-3.5 rounded-2xl bg-white border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-mono text-[10px] text-gray-400">#{rp.id}</span>
                  <h4 className="font-bold text-sm text-[#132032]">{rp.name_hi}</h4>
                  <p className="text-[11px] text-gray-500">
                    ₹{rp.minPrice} – ₹{rp.maxPrice} • ~{rp.serviceMinutes}m • {rp.warrantyMonths}m Warranty
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await updateRepairPriceInFirestore(rp.id, { active: !rp.active });
                      await recordAuditLog({
                        action: 'repair_price_toggled',
                        targetType: 'repairPrice',
                        targetId: rp.id,
                        after: { active: !rp.active }
                      });
                    }}
                    className={`px-3 py-1 rounded-lg font-bold cursor-pointer ${
                      rp.active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {rp.active !== false ? 'Active' : 'Hidden'}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteRepairPriceInFirestore(rp.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. AUDIT LOGS VIEWER */}
      {section === 'audit_logs' && (
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between gap-2">
            <input
              type="text"
              value={auditSearch}
              onChange={(e) => setAuditSearch(e.target.value)}
              placeholder="Search audit logs (action, email, targetId, reason)..."
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-white outline-none focus:border-[#D5151B]"
            />
            <button
              type="button"
              onClick={() =>
                downloadCsvFile(
                  `sastafone-audit-logs-${new Date().toISOString().split('T')[0]}.csv`,
                  ['createdAt', 'actorEmail', 'actorRole', 'action', 'targetType', 'targetId', 'reason'],
                  auditLogs
                )
              }
              className="px-3.5 py-2 rounded-xl bg-[#132032] text-white font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 max-h-[65vh] overflow-y-auto">
            {auditLogs
              .filter((l) => {
                if (!auditSearch.trim()) return true;
                const q = auditSearch.toLowerCase();
                return `${l.action} ${l.actorEmail} ${l.targetId} ${l.reason || ''}`.toLowerCase().includes(q);
              })
              .map((log) => (
                <div key={log.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#FEF2F2] text-[#D5151B] font-mono font-bold text-[10px]">
                        {log.action}
                      </span>
                      <span className="font-mono text-gray-600 text-[11px]">
                        {log.targetType}: {log.targetId}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-0.5">
                      Actor: <strong>{log.actorEmail || log.actorUid}</strong> ({log.actorRole})
                      {log.reason ? ` — Reason: ${log.reason}` : ''}
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-gray-400 shrink-0">
                    {new Date(log.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 9. SETTINGS & EXPORT CENTER */}
      {section === 'settings_exports' && (
        <div className="space-y-5 text-xs">
          <form onSubmit={handleSaveAllSettings} className="p-5 rounded-2xl bg-white border border-gray-200 space-y-4">
            <h3 className="text-sm font-bold text-[#132032]">Public Site & Business Rules Settings</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold mb-1">WhatsApp Number (919372802044)</label>
                <input
                  type="text"
                  value={pubForm.whatsappNumber}
                  onChange={(e) => setPubForm({ ...pubForm, whatsappNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Support Phone Display</label>
                <input
                  type="text"
                  value={pubForm.supportPhone}
                  onChange={(e) => setPubForm({ ...pubForm, supportPhone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Support Email</label>
                <input
                  type="email"
                  value={pubForm.supportEmail}
                  onChange={(e) => setPubForm({ ...pubForm, supportEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Google Review URL</label>
                <input
                  type="url"
                  value={pubForm.googleReviewUrl}
                  onChange={(e) => setPubForm({ ...pubForm, googleReviewUrl: e.target.value })}
                  placeholder="https://g.page/r/..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Discount Min % (12%)</label>
                <input
                  type="number"
                  value={admForm.discountMinPct}
                  onChange={(e) => setAdmForm({ ...admForm, discountMinPct: Number(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Discount Max % (15%)</label>
                <input
                  type="number"
                  value={admForm.discountMaxPct}
                  onChange={(e) => setAdmForm({ ...admForm, discountMaxPct: Number(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Min Net Margin (₹)</label>
                <input
                  type="number"
                  value={admForm.minNetMarginRupees}
                  onChange={(e) => setAdmForm({ ...admForm, minNetMarginRupees: Number(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Visit Token (₹) / Buy Token (₹)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={admForm.visitTokenAmount}
                    onChange={(e) => setAdmForm({ ...admForm, visitTokenAmount: Number(e.target.value) || 199 })}
                    className="w-1/2 px-3 py-2 rounded-xl border border-gray-200 font-mono"
                  />
                  <input
                    type="number"
                    value={admForm.buyPhoneTokenAmount}
                    onChange={(e) => setAdmForm({ ...admForm, buyPhoneTokenAmount: Number(e.target.value) || 499 })}
                    className="w-1/2 px-3 py-2 rounded-xl border border-gray-200 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-1">Admin Session Timeout (Minutes)</label>
                <input
                  type="number"
                  min={5}
                  value={admForm.sessionTimeoutMinutes}
                  onChange={(e) => setAdmForm({ ...admForm, sessionTimeoutMinutes: Number(e.target.value) || 30 })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">GSTIN (Optional)</label>
                <input
                  type="text"
                  value={admForm.gstin}
                  onChange={(e) => setAdmForm({ ...admForm, gstin: e.target.value.toUpperCase() })}
                  placeholder="24AAAAA0000A1Z5"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={admForm.gstEnabled}
                  onChange={(e) => setAdmForm({ ...admForm, gstEnabled: e.target.checked })}
                  className="accent-[#D5151B]"
                />
                <span>Enable Optional GST ({admForm.gstPct}%) on Invoices</span>
              </label>

              <button
                type="submit"
                disabled={busy}
                className="px-5 py-2.5 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold cursor-pointer ml-auto"
              >
                {busy ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>

          {/* Master Export Hub */}
          <div className="p-5 rounded-2xl bg-[#FEF2F2] border border-red-200 space-y-3">
            <h3 className="text-sm font-bold text-[#132032]">CSV & Database Export Hub</h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleFullJsonBackup}
                className="px-4 py-2 rounded-xl bg-[#D5151B] text-white font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Full JSON Backup</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadCsvFile(
                    `sastafone-sell-requests-${new Date().toISOString().split('T')[0]}.csv`,
                    ['id', 'customerName', 'customerPhone', 'area', 'brand', 'model', 'finalOffer', 'status', 'imei', 'createdAt'],
                    sellRequests
                  )
                }
                className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 font-bold cursor-pointer"
              >
                Sell Requests CSV
              </button>
              <button
                type="button"
                onClick={() =>
                  downloadCsvFile(
                    `sastafone-customers-${new Date().toISOString().split('T')[0]}.csv`,
                    ['phone', 'name', 'area', 'jobCount', 'sellCount', 'totalSpent'],
                    customersList
                  )
                }
                className="px-3.5 py-2 rounded-xl bg-white border border-gray-200 font-bold cursor-pointer"
              >
                Customers CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
