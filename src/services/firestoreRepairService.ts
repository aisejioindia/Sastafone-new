import { db, auth } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import {
  RepairPrice,
  Slot,
  Partner,
  Job,
  JobStatus,
  JobQC,
  FirestoreUser,
  InvoiceRecord
} from '../types';

export const REPAIR_PRICES_COLLECTION = 'repairPrices';
export const SLOTS_COLLECTION = 'slots';
export const PARTNERS_COLLECTION = 'partners';
export const JOBS_COLLECTION = 'jobs';
export const USERS_COLLECTION = 'users';

// Seed list of 16 official repair items requested by user
export const SEED_REPAIR_PRICES: RepairPrice[] = [
  {
    id: 'hang',
    name_hi: 'फोन हैंग / अटक कर चलना (Hanging & Lag)',
    description_hi: 'सॉफ्टवेयर रिफ्रेश, रैम ऑप्टिमाइज़ेशन व कैश क्लीनअप',
    minPrice: 399,
    maxPrice: 899,
    serviceMinutes: 30,
    warrantyMonths: 3,
    active: true,
    sortOrder: 1,
    iconName: 'Cpu',
    category: 'software'
  },
  {
    id: 'network',
    name_hi: 'नेटवर्क / सिम / वाई-फाई समस्या (Network & WiFi)',
    description_hi: 'सिम जैक, बेस-बैंड आईसी या एंटीना स्ट्रिप रिपेयर',
    minPrice: 599,
    maxPrice: 1499,
    serviceMinutes: 35,
    warrantyMonths: 3,
    active: true,
    sortOrder: 2,
    iconName: 'Wifi',
    category: 'network'
  },
  {
    id: 'liquid_damage',
    name_hi: 'पानी में गिरा / लिक्विड डैमेज (Liquid & Water Damage)',
    description_hi: 'अल्ट्रासोनिक मदरबोर्ड डी-ऑक्सीडेशन और शॉर्ट सर्किट प्रोटेक्शन चेक',
    minPrice: 799,
    maxPrice: 2200,
    serviceMinutes: 60,
    warrantyMonths: 3,
    active: true,
    sortOrder: 3,
    iconName: 'Droplets',
    category: 'board'
  },
  {
    id: 'motherboard',
    name_hi: 'मदरबोर्ड आईसी लेवल / डेड फोन (Motherboard IC Chipset)',
    description_hi: 'सर्टिफाइड चिपसेट रिबॉलिंग, पावर आईसी व माइक्रो-सोल्डरिंग',
    minPrice: 1499,
    maxPrice: 3899,
    serviceMinutes: 90,
    warrantyMonths: 3,
    active: true,
    sortOrder: 4,
    iconName: 'Cpu',
    category: 'board'
  },
  {
    id: 'diagnostic',
    name_hi: 'अचानक बंद / फुल डायग्नोस्टिक जांच (Full Phone Diagnostic)',
    description_hi: 'सख्त प्री-इंस्पेक्शन, शॉर्ट सर्किट व फॉल्ट ट्रेसिंग प्रोटोकॉल',
    minPrice: 199,
    maxPrice: 1499,
    serviceMinutes: 45,
    warrantyMonths: 3,
    active: true,
    sortOrder: 5,
    iconName: 'AlertTriangle',
    category: 'diagnostic'
  },
  {
    id: 'tempered_glass',
    name_hi: '9D/11D प्रीमियम टेम्पर्ड ग्लास गार्ड (Tempered Glass)',
    description_hi: 'कर्व्ड एज स्क्रीन प्रोटेक्टर, 9H टफनेस ओलेओफोबिक कोटिंग',
    minPrice: 149,
    maxPrice: 299,
    serviceMinutes: 10,
    warrantyMonths: 1,
    active: true,
    sortOrder: 6,
    iconName: 'Shield',
    category: 'protection'
  },
  {
    id: 'deep_cleaning',
    name_hi: 'फुल फोन डीप क्लीनिंग व थर्मल ओवरहाल (Deep Cleaning)',
    description_hi: 'अल्ट्रासोनिक डस्ट क्लीनिंग, स्पीकर जाली डी-क्लॉग व फ्रेश थर्मल पेस्ट',
    minPrice: 249,
    maxPrice: 499,
    serviceMinutes: 25,
    warrantyMonths: 1,
    active: true,
    sortOrder: 7,
    iconName: 'Sparkles',
    category: 'service'
  },
  {
    id: 'charging',
    name_hi: 'चार्जिंग पोर्ट ढीला / चार्ज नहीं हो रहा (Charging Port)',
    description_hi: 'टाइप-सी / लाइटनिंग पोर्ट क्लीनिंग या नया ओरिजिनल जैक रिप्लेसमेंट',
    minPrice: 499,
    maxPrice: 999,
    serviceMinutes: 20,
    warrantyMonths: 3,
    active: true,
    sortOrder: 8,
    iconName: 'Zap',
    category: 'charging'
  },
  {
    id: 'mic_speaker',
    name_hi: 'माइक / लाउडस्पीकर / ऑडियो समस्या (Mic & Speaker)',
    description_hi: 'कॉल पर आवाज न जाना या रिंगटोन/म्यूजिक न बजना - ओरिजिनल माइक व स्पीकर',
    minPrice: 399,
    maxPrice: 899,
    serviceMinutes: 25,
    warrantyMonths: 3,
    active: true,
    sortOrder: 9,
    iconName: 'Volume2',
    category: 'audio'
  },
  {
    id: 'camera_blur',
    name_hi: 'कैमरा सेंसर ब्लर / फोकस खराबी (Camera Blur & Shaking)',
    description_hi: 'ओआईएस स्टेबलाइजेशन व इंटरनल कैमरा मॉड्यूल रिप्लेसमेंट',
    minPrice: 699,
    maxPrice: 1899,
    serviceMinutes: 30,
    warrantyMonths: 3,
    active: true,
    sortOrder: 10,
    iconName: 'Camera',
    category: 'camera'
  },
  {
    id: 'heating',
    name_hi: 'फोन ओवरहीटिंग व फ्रीज होना (Phone Overheating)',
    description_hi: 'थर्मल पेस्ट क्लीनिंग, आईसी वोल्टेज चेक और बैकग्राउंड ड्रेन फिक्स',
    minPrice: 499,
    maxPrice: 1199,
    serviceMinutes: 35,
    warrantyMonths: 3,
    active: true,
    sortOrder: 11,
    iconName: 'Flame',
    category: 'board'
  },
  {
    id: 'display',
    name_hi: 'टूटा हुआ डिस्प्ले / टच स्क्रीन क्रैक (Display & Touch)',
    description_hi: 'ओरिजिनल क्वालिटी डिस्प्ले रिप्लेसमेंट, 6 महीने वारंटी और टच वारंटी के साथ',
    minPrice: 1299,
    maxPrice: 3499,
    serviceMinutes: 45,
    warrantyMonths: 6,
    active: true,
    sortOrder: 12,
    iconName: 'Smartphone',
    category: 'screen'
  },
  {
    id: 'battery',
    name_hi: 'नई ओरिजिनल बैटरी - 100% हेल्थ (New Battery Replacement)',
    description_hi: 'नई 100% क्षमता वाली बैटरी इंस्टॉलेशन, पूरे दिन का बैकअप',
    minPrice: 899,
    maxPrice: 1799,
    serviceMinutes: 30,
    warrantyMonths: 6,
    active: true,
    sortOrder: 13,
    iconName: 'BatteryCharging',
    category: 'battery'
  },
  {
    id: 'back_panel',
    name_hi: 'नया बैक पैनल / बॉडी हाउसिंग कवर (Back Glass / Frame)',
    description_hi: 'लेजर बैक ग्लास रिमूवल व नया ओरिजिनल प्रीमियम बैक पैनल फिटिंग',
    minPrice: 499,
    maxPrice: 1299,
    serviceMinutes: 30,
    warrantyMonths: 3,
    active: true,
    sortOrder: 14,
    iconName: 'Shield',
    category: 'body'
  },
  {
    id: 'camera_lens',
    name_hi: 'कैमरा लेंस ग्लास रिप्लेसमेंट (Rear Camera Glass Lens)',
    description_hi: 'टूटे या स्क्रैच पड़े रियर कैमरा ग्लास लेंस का रिप्लेसमेंट, सफायर कोटिंग',
    minPrice: 299,
    maxPrice: 599,
    serviceMinutes: 20,
    warrantyMonths: 3,
    active: true,
    sortOrder: 15,
    iconName: 'Camera',
    category: 'camera'
  },
  {
    id: 'mega_makeover_combo',
    name_hi: '🌟 मेरा फोन बिल्कुल नया जैसा बनाओ (मेगा मेकओवर कॉम्बो)',
    description_hi: 'नया डिस्प्ले + 100% नई बैटरी + नया बैक पैनल + नया कैमरा ग्लास + 9D टेम्पर्ड ग्लास + पूरी डीप क्लीनिंग व थर्मल सर्विस एक साथ!',
    minPrice: 2499,
    maxPrice: 4499,
    serviceMinutes: 90,
    warrantyMonths: 6,
    active: true,
    sortOrder: 16,
    iconName: 'Sparkles',
    category: 'combo',
    isCombo: true,
    comboItems: [
      'नया प्रीमियम डिस्प्ले व टच स्क्रीन (New Display & Touch)',
      'नई 100% ओरिजिनल बैटरी (100% New Battery)',
      'नया बैक पैनल व बॉडी फ्रेम (New Back Panel)',
      'नया क्रिस्टल क्लियर कैमरा लेंस ग्लास (New Camera Lens Glass)',
      '9D/11D प्रीमियम टेम्पर्ड ग्लास (9D/11D Tempered Glass)',
      'फुल डीप क्लीनिंग व थर्मल ओवरहाल (Full Deep Cleaning)'
    ]
  }
];

// Seed initial Sastafone Certified Technician Network Partners (Surat)
export const SEED_PARTNERS: Partner[] = [
  {
    id: 'ptr-sanjay-adajan',
    name: 'Sanjay Prajapati (Senior Technician)',
    area: 'Adajan & Pal',
    phone: '9372802044',
    rateCard: {
      display: 800,
      battery: 400,
      charging: 250,
      mic_speaker: 250,
      tempered_glass: 50,
      deep_cleaning: 150,
      back_panel: 300,
      camera_lens: 150,
      camera_blur: 500,
      heating: 350,
      hang: 250,
      network: 450,
      liquid_damage: 600,
      motherboard: 1200,
      diagnostic: 150,
      mega_makeover_combo: 1800
    },
    advanceBalance: 5000,
    rating: 4.9,
    active: true,
    jobsCompleted: 142
  },
  {
    id: 'ptr-pravin-varachha',
    name: 'Pravin Solanki (Micro-Soldering Lead)',
    area: 'Varachha & Katargam',
    phone: '9372802044',
    rateCard: {
      display: 800,
      battery: 400,
      charging: 250,
      mic_speaker: 250,
      tempered_glass: 50,
      deep_cleaning: 150,
      back_panel: 300,
      camera_lens: 150,
      camera_blur: 500,
      heating: 350,
      hang: 250,
      network: 450,
      liquid_damage: 600,
      motherboard: 1200,
      diagnostic: 150,
      mega_makeover_combo: 1800
    },
    advanceBalance: 4500,
    rating: 4.8,
    active: true,
    jobsCompleted: 118
  },
  {
    id: 'ptr-rahul-vesu',
    name: 'Rahul Varma (Field Express)',
    area: 'Vesu & Citylight',
    phone: '9372802044',
    rateCard: {
      display: 800,
      battery: 400,
      charging: 250,
      mic_speaker: 250,
      tempered_glass: 50,
      deep_cleaning: 150,
      back_panel: 300,
      camera_lens: 150,
      camera_blur: 500,
      heating: 350,
      hang: 250,
      network: 450,
      liquid_damage: 600,
      motherboard: 1200,
      diagnostic: 150,
      mega_makeover_combo: 1800
    },
    advanceBalance: 3800,
    rating: 4.9,
    active: true,
    jobsCompleted: 95
  }
];

// Helper to generate next N days slots for Surat localities
export function generateDefaultSlots(): Slot[] {
  const areas = ['Adajan', 'Vesu', 'Pal', 'Varachha', 'Katargam', 'All Surat'];
  const windows = [
    '10:00 AM - 01:00 PM (Morning Slot)',
    '02:00 PM - 05:00 PM (Afternoon Slot)',
    '05:00 PM - 08:00 PM (Evening Express Slot)'
  ];

  const slots: Slot[] = [];
  const today = new Date();

  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD

    areas.forEach(area => {
      windows.forEach((win, winIdx) => {
        const id = `slot_${dateStr}_${area.toLowerCase().replace(/\s+/g, '_')}_${winIdx}`;
        slots.push({
          id,
          date: dateStr,
          window: win,
          area,
          capacity: 4,
          booked: i === 0 && winIdx === 0 ? 1 : 0 // Small realistic booking
        });
      });
    });
  }

  return slots;
}

// -------------------------------------------------------------
// Seeding Functions (Run automatically on boot if empty)
// -------------------------------------------------------------

export async function seedFirestoreIfEmpty(): Promise<void> {
  try {
    // 1. Check & Seed repairPrices
    const pricesSnapshot = await getDocs(collection(db, REPAIR_PRICES_COLLECTION));
    if (pricesSnapshot.empty) {
      console.log('Seeding repairPrices collection...');
      for (const item of SEED_REPAIR_PRICES) {
        await setDoc(doc(db, REPAIR_PRICES_COLLECTION, item.id), item);
      }
    }

    // 2. Check & Seed partners
    const partnersSnapshot = await getDocs(collection(db, PARTNERS_COLLECTION));
    if (partnersSnapshot.empty) {
      console.log('Seeding partners collection...');
      for (const partner of SEED_PARTNERS) {
        await setDoc(doc(db, PARTNERS_COLLECTION, partner.id), partner);
      }
    }

    // 3. Check & Seed slots
    const slotsSnapshot = await getDocs(collection(db, SLOTS_COLLECTION));
    if (slotsSnapshot.empty) {
      console.log('Seeding slots collection...');
      const defaultSlots = generateDefaultSlots();
      for (const slot of defaultSlots) {
        await setDoc(doc(db, SLOTS_COLLECTION, slot.id), slot);
      }
    }
  } catch (err) {
    console.warn('Firestore seeding notice (running with in-memory fallback):', err);
  }
}

// -------------------------------------------------------------
// REPAIR PRICES API
// -------------------------------------------------------------

export async function getRepairPricesFromFirestore(): Promise<RepairPrice[]> {
  try {
    const q = query(collection(db, REPAIR_PRICES_COLLECTION), orderBy('sortOrder', 'asc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      // Auto-seed and return seed data
      seedFirestoreIfEmpty().catch(() => {});
      return SEED_REPAIR_PRICES.filter(p => p.active);
    }
    const items: RepairPrice[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data() as RepairPrice;
      if (data.active !== false) {
        items.push({ ...data, id: docSnap.id });
      }
    });
    return items.length > 0 ? items : SEED_REPAIR_PRICES;
  } catch (err) {
    console.warn('Failed to load repair prices from Firestore, using seed:', err);
    return SEED_REPAIR_PRICES.filter(p => p.active);
  }
}

export async function updateRepairPriceInFirestore(
  id: string,
  updates: Partial<RepairPrice>
): Promise<void> {
  const ref = doc(db, REPAIR_PRICES_COLLECTION, id);
  await updateDoc(ref, updates);
}

// -------------------------------------------------------------
// SLOTS API
// -------------------------------------------------------------

export async function getAvailableSlots(area: string, date: string): Promise<Slot[]> {
  try {
    const q = query(
      collection(db, SLOTS_COLLECTION),
      where('date', '==', date)
    );
    const snapshot = await getDocs(q);
    const allSlots: Slot[] = [];
    snapshot.forEach(docSnap => {
      allSlots.push({ ...docSnap.data() as Slot, id: docSnap.id });
    });

    // Filter by area or general Surat
    const matching = allSlots.filter(
      s => s.area === area || s.area === 'All Surat'
    );

    if (matching.length > 0) return matching;

    // Fallback if no matching in Firestore for this exact date
    const fallback = generateDefaultSlots().filter(
      s => (s.area === area || s.area === 'All Surat') && s.date === date
    );
    return fallback.length > 0 ? fallback : generateDefaultSlots().slice(0, 3);
  } catch (err) {
    console.warn('Error fetching slots from Firestore:', err);
    return generateDefaultSlots().filter(s => s.date === date).slice(0, 3);
  }
}

export async function getSlotsFromFirestore(): Promise<Slot[]> {
  try {
    const snapshot = await getDocs(collection(db, SLOTS_COLLECTION));
    if (snapshot.empty) {
      return generateDefaultSlots();
    }
    const list: Slot[] = [];
    snapshot.forEach(d => {
      list.push({ ...(d.data() as Slot), id: d.id });
    });
    return list.length > 0 ? list : generateDefaultSlots();
  } catch (err) {
    return generateDefaultSlots();
  }
}

export async function bookSlotInFirestore(slotId: string): Promise<boolean> {
  try {
    const ref = doc(db, SLOTS_COLLECTION, slotId);
    await runTransaction(db, async transaction => {
      const slotSnap = await transaction.get(ref);
      if (!slotSnap.exists()) {
        return;
      }
      const data = slotSnap.data() as Slot;
      const booked = (data.booked || 0) + 1;
      transaction.update(ref, { booked });
    });
    return true;
  } catch (err) {
    console.warn('Slot increment notice:', err);
    return true;
  }
}

// -------------------------------------------------------------
// PARTNERS API
// -------------------------------------------------------------

export async function getPartnersFromFirestore(): Promise<Partner[]> {
  try {
    const snapshot = await getDocs(collection(db, PARTNERS_COLLECTION));
    if (snapshot.empty) {
      seedFirestoreIfEmpty().catch(() => {});
      return SEED_PARTNERS;
    }
    const items: Partner[] = [];
    snapshot.forEach(d => {
      items.push({ ...d.data() as Partner, id: d.id });
    });
    return items.length > 0 ? items : SEED_PARTNERS;
  } catch (err) {
    console.warn('Error fetching partners:', err);
    return SEED_PARTNERS;
  }
}

export async function updatePartnerInFirestore(
  partnerId: string,
  updates: Partial<Partner>
): Promise<void> {
  const ref = doc(db, PARTNERS_COLLECTION, partnerId);
  await updateDoc(ref, updates);
}

// -------------------------------------------------------------
// JOBS API (Customer + Admin)
// -------------------------------------------------------------

export async function createJobInFirestore(job: Omit<Job, 'createdAt' | 'statusHistory'>): Promise<string> {
  const now = new Date().toISOString();
  const fullJob: Job = {
    ...job,
    status: 'Booked',
    statusHistory: [
      {
        status: 'Booked',
        timestamp: now,
        note: 'बुकिंग दर्ज की गई। ₹199 विज़िट टोकन वेरिफाइड।'
      }
    ],
    createdAt: now,
    updatedAt: now
  };

  const jobRef = doc(db, JOBS_COLLECTION, fullJob.jobId);
  await setDoc(jobRef, fullJob);

  // Book the slot
  if (job.pickupSlot?.window) {
    const slotId = `slot_${job.pickupSlot.date}_${job.area.toLowerCase().replace(/\s+/g, '_')}_0`;
    bookSlotInFirestore(slotId).catch(() => {});
  }

  return fullJob.jobId;
}

export function subscribeToCustomerJobs(
  userId: string,
  onJobsUpdate: (jobs: Job[]) => void
): () => void {
  try {
    const q = query(
      collection(db, JOBS_COLLECTION),
      where('userId', '==', userId)
    );

    return onSnapshot(
      q,
      snapshot => {
        const jobs: Job[] = [];
        snapshot.forEach(docSnap => {
          jobs.push(docSnap.data() as Job);
        });
        // Sort descending by creation
        jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onJobsUpdate(jobs);
      },
      err => {
        console.warn('Customer jobs snapshot notice:', err.message);
      }
    );
  } catch (err) {
    console.warn('Error in subscribeToCustomerJobs:', err);
    return () => {};
  }
}

const RECENT_GUEST_JOBS_KEY = 'sastafone_recent_jobs';

export function normalizeIndianPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
}

export function saveRecentGuestJobLocally(job: Job): void {
  if (typeof window === 'undefined') return;
  try {
    const existingRaw = localStorage.getItem(RECENT_GUEST_JOBS_KEY);
    const existing: Job[] = existingRaw ? JSON.parse(existingRaw) : [];
    const filtered = existing.filter((j) => j.jobId !== job.jobId);
    localStorage.setItem(RECENT_GUEST_JOBS_KEY, JSON.stringify([job, ...filtered].slice(0, 15)));
  } catch {
    // Ignore storage quota errors
  }
}

export function getRecentGuestJobsByPhone(phone10: string): Job[] {
  if (typeof window === 'undefined' || !phone10) return [];
  try {
    const raw = localStorage.getItem(RECENT_GUEST_JOBS_KEY);
    if (!raw) return [];
    const list: Job[] = JSON.parse(raw);
    return list.filter((j) => normalizeIndianPhone(j.phone || '') === phone10);
  } catch {
    return [];
  }
}

export interface PhoneLookupResult {
  jobs: Job[];
  permissionDenied: boolean;
  source: 'firebase' | 'local' | 'mixed';
}

export async function fetchRepairJobsByPhoneFromFirestore(
  rawPhone: string
): Promise<PhoneLookupResult> {
  const clean10 = normalizeIndianPhone(rawPhone);
  if (clean10.length !== 10) {
    return { jobs: [], permissionDenied: false, source: 'firebase' };
  }

  const candidates = Array.from(
    new Set([clean10, `+91${clean10}`, `91${clean10}`, `0${clean10}`, `+91 ${clean10}`])
  );

  const jobsMap = new Map<string, Job>();
  let permissionDenied = false;
  let hasFirebaseResults = false;

  // 1. Primary lookup in 'jobs' collection by phone (no auth required)
  try {
    const jobsQ = query(
      collection(db, JOBS_COLLECTION),
      where('phone', 'in', candidates),
      limit(5)
    );
    const snap = await getDocs(jobsQ);
    snap.forEach((docSnap) => {
      const data = docSnap.data() as Job;
      const id = data.jobId || docSnap.id;
      jobsMap.set(id, { ...data, jobId: id });
      hasFirebaseResults = true;
    });
  } catch (err: any) {
    const code = err?.code || '';
    if (code === 'permission-denied' || String(err?.message || '').toLowerCase().includes('permission')) {
      permissionDenied = true;
    }
    console.warn('Firestore jobs phone lookup notice:', err?.message || err);
  }

  // 2. Secondary lookup in 'invoices' collection (limit <= 3)
  try {
    const invQ = query(
      collection(db, INVOICES_COLLECTION),
      where('customerPhone', 'in', candidates),
      limit(3)
    );
    const invSnap = await getDocs(invQ);
    invSnap.forEach((docSnap) => {
      const inv = { ...(docSnap.data() as InvoiceRecord), id: docSnap.id };
      if (inv.status === 'voided') return;
      const jId = inv.jobId || inv.invoiceNumber || docSnap.id;
      if (!jobsMap.has(jId)) {
        const isPaid = inv.paymentStatus === 'paid';
        const syntheticStatus: JobStatus = isPaid ? 'Delivered' : 'Ready';
        const syntheticJob: Job = {
          jobId: jId,
          userId: inv.userId || `wa_${clean10}`,
          name: inv.customerName || 'Surat Customer',
          phone: inv.customerPhone || clean10,
          address: inv.customerAddress || `${inv.area || 'Surat'}, Gujarat`,
          area: inv.area || 'Surat',
          brand: inv.brand || 'Phone',
          model: inv.model || 'Smartphone',
          services: (inv.services || []).map((s) => s.name),
          estMin: inv.subtotal || inv.finalTotal || 199,
          estMax: inv.finalTotal || inv.subtotal || 199,
          estMinutes: 60,
          pickupSlot: {
            date: inv.date || new Date().toLocaleDateString('hi-IN'),
            window: 'Doorstep Slot',
            area: inv.area || 'Surat'
          },
          status: syntheticStatus,
          statusHistory: [
            {
              status: syntheticStatus,
              timestamp: inv.createdAt || new Date().toISOString(),
              note: `इनवॉइस #${inv.invoiceNumber || jId} जारी किया गया।`
            }
          ],
          finalPrice: inv.finalTotal,
          visitFeePaid: (inv.visitFeeAdjusted || 0) > 0,
          pickupCost: 70,
          customerApproved: true,
          warrantyMonths: inv.warrantyMonths,
          invoiceNumber: inv.invoiceNumber,
          createdAt: inv.createdAt || new Date().toISOString(),
          updatedAt: inv.createdAt || new Date().toISOString()
        };
        jobsMap.set(jId, syntheticJob);
        hasFirebaseResults = true;
      }
    });
  } catch (err: any) {
    console.warn('Firestore invoices phone lookup notice:', err?.message || err);
  }

  // 3. Merge recent guest bookings saved locally in this browser (only if not already from Firebase)
  const localJobs = getRecentGuestJobsByPhone(clean10);
  let hasLocalResults = false;
  localJobs.forEach((localJob) => {
    if (!jobsMap.has(localJob.jobId)) {
      jobsMap.set(localJob.jobId, localJob);
      hasLocalResults = true;
    }
  });

  const merged = Array.from(jobsMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const source: PhoneLookupResult['source'] =
    hasFirebaseResults && hasLocalResults
      ? 'mixed'
      : hasFirebaseResults
      ? 'firebase'
      : 'local';

  return {
    jobs: merged,
    permissionDenied: permissionDenied && merged.length === 0,
    source
  };
}

export function subscribeToAllJobs(onJobsUpdate: (jobs: Job[]) => void): () => void {
  try {
    const q = query(collection(db, JOBS_COLLECTION));
    return onSnapshot(
      q,
      snapshot => {
        const jobs: Job[] = [];
        snapshot.forEach(docSnap => {
          jobs.push(docSnap.data() as Job);
        });
        jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onJobsUpdate(jobs);
      },
      err => {
        console.warn('Admin all jobs snapshot notice:', err.message);
      }
    );
  } catch (err) {
    console.warn('Error subscribing to all jobs:', err);
    return () => {};
  }
}

export async function updateJobStatusInFirestore(
  jobId: string,
  newStatus: JobStatus,
  note?: string
): Promise<void> {
  const ref = doc(db, JOBS_COLLECTION, jobId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const job = snap.data() as Job;
  const now = new Date().toISOString();
  const history = job.statusHistory || [];
  history.push({
    status: newStatus,
    timestamp: now,
    note: note || `स्थिति अपडेट: ${newStatus}`
  });

  await updateDoc(ref, {
    status: newStatus,
    statusHistory: history,
    updatedAt: now
  });
}

export async function saveJobQCInFirestore(
  jobId: string,
  qc: JobQC,
  finalPrice: number,
  finalServices: string[]
): Promise<void> {
  const ref = doc(db, JOBS_COLLECTION, jobId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const job = snap.data() as Job;
  const now = new Date().toISOString();
  const history = job.statusHistory || [];
  history.push({
    status: 'Picked up',
    timestamp: now,
    note: `क्वालिटी चेक व निरीक्षण पूरा। फाइनल क्वोट: ₹${finalPrice} (ग्राहक की स्वीकृति हेतु भेजा गया)`
  });

  await updateDoc(ref, {
    qc,
    finalPrice,
    finalServices,
    status: 'Picked up',
    statusHistory: history,
    customerApproved: false,
    updatedAt: now
  });
}

export async function customerApproveQuoteInFirestore(jobId: string): Promise<void> {
  const ref = doc(db, JOBS_COLLECTION, jobId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const job = snap.data() as Job;
  const now = new Date().toISOString();
  const history = job.statusHistory || [];
  history.push({
    status: 'Quote approved',
    timestamp: now,
    note: 'ग्राहक द्वारा क्वोट स्वीकृत किया गया। रिपेयरिंग शुरू।'
  });
  history.push({
    status: 'In repair',
    timestamp: now,
    note: 'सर्टिफाइड टेक्नीशियन द्वारा रिपेयर कार्य प्रगति पर है।'
  });

  await updateDoc(ref, {
    customerApproved: true,
    approvedAt: now,
    status: 'In repair',
    statusHistory: history,
    updatedAt: now
  });
}

export async function customerDeclineQuoteInFirestore(jobId: string): Promise<void> {
  const ref = doc(db, JOBS_COLLECTION, jobId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const job = snap.data() as Job;
  const now = new Date().toISOString();
  const history = job.statusHistory || [];
  history.push({
    status: 'Cancelled',
    timestamp: now,
    note: 'ग्राहक द्वारा क्वोट अस्वीकृत। केवल ₹199 विज़िट टोकन रखा गया, फोन सुरक्षित वापस किया जाएगा।'
  });

  await updateDoc(ref, {
    customerApproved: false,
    status: 'Cancelled',
    statusHistory: history,
    updatedAt: now
  });
}

export async function assignPartnerToJobInFirestore(jobId: string, partnerId: string): Promise<void> {
  const ref = doc(db, JOBS_COLLECTION, jobId);
  await updateDoc(ref, {
    partnerId,
    status: 'Pickup scheduled',
    updatedAt: new Date().toISOString()
  });
}

// -------------------------------------------------------------
// PHASE 2: SELL REQUESTS & SELL RATES
// -------------------------------------------------------------

export const SELL_REQUESTS_COLLECTION = 'sellRequests';
export const SELL_RATES_COLLECTION = 'sellRates';
export const INVENTORY_COLLECTION = 'inventory';
export const REVIEWS_COLLECTION = 'reviews';
export const LEDGER_COLLECTION = 'ledger';
export const HANDOVER_COLLECTION = 'handovers';
export const WARRANTY_CLAIMS_COLLECTION = 'warrantyClaims';
export const INVOICES_COLLECTION = 'invoices';
export const REFERRALS_COLLECTION = 'referrals';

export async function createSellRequestInFirestore(data: any): Promise<string> {
  const colRef = collection(db, SELL_REQUESTS_COLLECTION);
  const docRef = await addDoc(colRef, {
    ...data,
    status: 'Submitted',
    statusHistory: [
      {
        status: 'Submitted',
        timestamp: new Date().toISOString(),
        note: 'फोन बेचने का अनुरोध दर्ज किया गया। पिकअप स्लॉट असाइन किया जाएगा।'
      }
    ],
    createdAt: new Date().toISOString(),
    timestamp: serverTimestamp()
  });
  return docRef.id;
}

export function subscribeToCustomerSellRequests(
  userId: string,
  onUpdate: (requests: any[]) => void
) {
  const q = query(
    collection(db, SELL_REQUESTS_COLLECTION),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    snapshot => {
      const list: any[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      onUpdate(list);
    },
    err => {
      console.warn('Customer sell requests subscription fallback:', err);
      onUpdate([]);
    }
  );
}

export function subscribeToAllSellRequests(onUpdate: (requests: any[]) => void) {
  const q = query(collection(db, SELL_REQUESTS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    snapshot => {
      const list: any[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      onUpdate(list);
    },
    err => {
      console.warn('All sell requests subscription error:', err);
      onUpdate([]);
    }
  );
}

export async function updateSellRequestInFirestore(id: string, updates: any): Promise<void> {
  const ref = doc(db, SELL_REQUESTS_COLLECTION, id);
  await updateDoc(ref, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
}

// -------------------------------------------------------------
// PHASE 2: INVENTORY (BUY PHONES)
// -------------------------------------------------------------

export function subscribeToAvailableInventory(onUpdate: (phones: any[]) => void) {
  const q = query(collection(db, INVENTORY_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    snapshot => {
      const list: any[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        list.push({ id: docSnap.id, ...data });
      });
      onUpdate(list);
    },
    err => {
      console.warn('Inventory subscription notice:', err);
      onUpdate([]);
    }
  );
}

export async function addInventoryPhoneInFirestore(phone: any): Promise<string> {
  const colRef = collection(db, INVENTORY_COLLECTION);
  const docRef = await addDoc(colRef, {
    ...phone,
    status: phone.status || 'available',
    createdAt: new Date().toISOString(),
    timestamp: serverTimestamp()
  });
  return docRef.id;
}

export async function updateInventoryPhoneInFirestore(id: string, updates: any): Promise<void> {
  const ref = doc(db, INVENTORY_COLLECTION, id);
  await updateDoc(ref, {
    ...updates,
    updatedAt: new Date().toISOString()
  });
}

// -------------------------------------------------------------
// PHASE 2: REVIEWS (Min 5 approved reviews requirement)
// -------------------------------------------------------------

export function subscribeToApprovedReviews(onUpdate: (reviews: any[]) => void) {
  const q = query(
    collection(db, REVIEWS_COLLECTION),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    snapshot => {
      const list: any[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      onUpdate(list);
    },
    err => {
      console.warn('Reviews subscription notice:', err);
      onUpdate([]);
    }
  );
}

export async function submitReviewToFirestore(review: any): Promise<string> {
  const colRef = collection(db, REVIEWS_COLLECTION);
  const docRef = await addDoc(colRef, {
    ...review,
    status: 'pending', // Requires admin approval
    createdAt: new Date().toISOString(),
    timestamp: serverTimestamp()
  });
  return docRef.id;
}

// -------------------------------------------------------------
// PHASE 2: PARTNER LEDGER
// -------------------------------------------------------------

export async function addPartnerLedgerEntry(entry: any): Promise<string> {
  const colRef = collection(db, LEDGER_COLLECTION);
  const docRef = await addDoc(colRef, {
    ...entry,
    timestamp: new Date().toISOString(),
    serverTime: serverTimestamp()
  });

  // Update partner advance balance in partners collection
  if (entry.partnerId) {
    const partnerRef = doc(db, PARTNERS_COLLECTION, entry.partnerId);
    const partnerSnap = await getDoc(partnerRef);
    if (partnerSnap.exists()) {
      const currentBal = partnerSnap.data()?.advanceBalance || 0;
      const newBal = entry.type === 'advance_topup' || entry.type === 'incentive'
        ? currentBal + entry.amount
        : currentBal - entry.amount;
      await updateDoc(partnerRef, { advanceBalance: newBal });
    }
  }

  return docRef.id;
}
