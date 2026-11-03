import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { OrderItem, UserProfile, ProAuditVerification } from '../types';

const USERS_COLLECTION = 'users';
const SERVICE_REQUESTS_COLLECTION = 'service_requests';
export const PENDING_JOBS_COLLECTION = 'pendingJobs';

export interface PendingJobRecord {
  jobId: string;
  orderNumber: string;
  serviceType: 'repair' | 'sell' | 'buy' | 'bazaar' | string;
  title: string;
  subtitle: string;
  amount: number;
  status: string;
  statusHindi: string;

  // Captured User Contact Details
  customerContact: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    locality: string;
    landmark?: string;
    pincode?: string;
  };

  // Geo-Location Coordinates for Admin Doorstep Dispatch & Verification
  geoLocation: {
    latitude: number;
    longitude: number;
    accuracyMeters?: number;
    mapsLink?: string;
    capturedAt?: string;
  } | null;

  // Comprehensive Form Fields Captured Across Services
  inputFormFields: {
    brand?: string;
    model?: string;
    ram?: string;
    storage?: string;
    color?: string;
    condition?: string;
    is5G?: boolean;
    customerRequirement?: string;
    repairProblems?: string[];
    selectedProblemsList?: any[];
    billPhotoUrl?: string;
    phonePhotos?: string[];
    ownershipDeclared?: boolean;
    antiTheftVerified?: boolean;
    imeiNumber?: string;
    advanceTokenAmount?: number;
    onlinePaymentUtr?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    timeSlot?: string;
    date?: string;
    customModelDetails?: any;
    p2pListingDetails?: any;
    originalEstimateMin?: number;
    originalEstimateMax?: number;
    discountOfferedPct?: number;
    finalQuoteAmount?: number;
    internalNotes?: string;
    repairChecklist?: any;
  };

  // Admin Centralized Management Details
  adminVisibility: {
    reviewStatus: 'pending_review' | 'in_inspection' | 'technician_assigned' | 'completed' | 'cancelled';
    assignedTechnician?: string;
    priority: 'high' | 'normal' | 'urgent';
    source: 'sastaphone_customer_portal';
    createdAt: string;
    updatedAt: string;
  };

  rawOrderData: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  timestamp: any;
}

/**
 * Instantly save user profile & address details to Firebase Firestore
 */
export async function saveUserToFirestore(user: UserProfile): Promise<{ success: boolean; error?: string }> {
  try {
    const userDocId = user.phone ? `user_${user.phone.replace(/\D/g, '')}` : `user_${Date.now()}`;
    const userRef = doc(db, USERS_COLLECTION, userDocId);

    const payload = {
      name: user.name || 'Surat Resident',
      phone: user.phone || '',
      email: user.email || '',
      address: user.address || '',
      locality: user.locality || 'Surat',
      landmark: user.landmark || '',
      pincode: user.pincode || '395009',
      gpsLocation: user.gpsLocation || null,
      authProvider: user.authProvider || 'phone',
      isLoggedIn: user.isLoggedIn,
      activePlan: user.activePlan || 'none',
      sellerPostCredits: user.sellerPostCredits || 0,
      buyerCredits: user.buyerCredits || 0,
      updatedAt: new Date().toISOString(),
      timestamp: serverTimestamp()
    };

    await setDoc(userRef, payload, { merge: true });
    return { success: true };
  } catch (error: any) {
    console.warn('Firebase Firestore saveUser notice (offline/fallback active):', error?.message || error);
    return { success: false, error: error?.message };
  }
}

/**
 * Pushes service request data (Repair, Sell, Buy, Bazaar) into centralized Firestore 'pendingJobs' collection.
 * Captures all input form fields, user contact, and geo-location coordinates for admin visibility.
 */
export async function pushJobToPendingJobs(
  order: OrderItem,
  additionalMetadata?: Record<string, any>
): Promise<{ success: boolean; jobId?: string; error?: string }> {
  try {
    const jobId = order.id || `job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const jobRef = doc(db, PENDING_JOBS_COLLECTION, jobId);

    // 1. Precise Geo-Location Coordinates
    const geoLocation = order.gpsLocation
      ? {
          latitude: order.gpsLocation.latitude,
          longitude: order.gpsLocation.longitude,
          accuracyMeters: order.gpsLocation.accuracyMeters || 20,
          mapsLink:
            order.gpsLocation.mapsLink ||
            `https://www.google.com/maps?q=${order.gpsLocation.latitude},${order.gpsLocation.longitude}`,
          capturedAt: order.gpsLocation.capturedAt || new Date().toISOString()
        }
      : null;

    // 2. Complete User Contact Information
    const customerContact = {
      name: order.customerName || 'Surat Resident',
      phone: order.customerPhone || '',
      email: additionalMetadata?.userEmail || '',
      address: order.fullAddress || `${order.locality || 'Surat'}, Gujarat`,
      locality: order.locality || 'Surat',
      landmark: order.landmark || '',
      pincode: order.pincode || '395009'
    };

    // 3. All Input Form Fields for Full Admin Transparency
    const inputFormFields = {
      brand: order.customModelDetails?.brand || (order.title ? order.title.split(' ')[0] : 'Generic'),
      model: order.customModelDetails?.model || order.title,
      ram: order.customModelDetails?.ram || '',
      storage: order.customModelDetails?.storage || '',
      color: order.customModelDetails?.color || '',
      condition: order.customModelDetails?.condition || 'Good',
      is5G: order.customModelDetails?.is5G ?? false,
      customerRequirement: order.customerRequirement || '',
      repairProblems: order.repairProblems || [],
      selectedProblemsList: order.selectedProblemsList || [],
      billPhotoUrl: order.billPhotoUrl || '',
      phonePhotos: order.phonePhotos || [],
      ownershipDeclared: order.ownershipDeclared ?? false,
      antiTheftVerified: order.antiTheftVerified ?? false,
      imeiNumber: order.imeiNumber || '',
      advanceTokenAmount: order.advanceTokenAmount || order.visitCharge || (order.type === 'repair' ? 199 : 0),
      onlinePaymentUtr: order.onlinePaymentUtr || '',
      paymentMethod: order.paymentMethod || 'सुरक्षित डिजिटल भुगतान (Sastaphone)',
      paymentStatus: order.paymentStatus || 'pending',
      timeSlot: order.timeSlot || 'Today (Express 30 Mins)',
      date: order.date || new Date().toLocaleDateString('hi-IN'),
      customModelDetails: order.customModelDetails || null,
      originalEstimateMin: order.originalEstimateMin || 0,
      originalEstimateMax: order.originalEstimateMax || 0,
      discountOfferedPct: order.discountOfferedPct || 0,
      finalQuoteAmount: order.finalQuoteAmount || 0,
      internalNotes: order.internalNotes || '',
      repairChecklist: order.repairChecklist || null,
      ...additionalMetadata?.formFields
    };

    // Sanitize raw data so no undefined property breaks Firestore
    const sanitizedRaw: Record<string, any> = {};
    for (const [key, val] of Object.entries(order)) {
      if (val !== undefined) {
        sanitizedRaw[key] = val;
      }
    }

    const payload: PendingJobRecord = {
      jobId,
      orderNumber: order.orderNumber || `STP-${Date.now().toString().slice(-6)}`,
      serviceType: order.type || 'repair',
      title: order.title || 'Mobile Service Job',
      subtitle: order.subtitle || '',
      amount: order.amount || 0,
      status: order.status || 'pending',
      statusHindi: order.statusHindi || 'प्रतीक्षारत (Pending)',
      customerContact,
      geoLocation,
      inputFormFields,
      adminVisibility: {
        reviewStatus: 'pending_review',
        assignedTechnician: order.technicianName || 'Sanjay Prajapati (सस्ताफोन डोरस्टेप लीड)',
        priority: order.type === 'repair' ? 'high' : 'normal',
        source: 'sastaphone_customer_portal',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      rawOrderData: sanitizedRaw,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timestamp: serverTimestamp()
    };

    await setDoc(jobRef, payload, { merge: true });
    return { success: true, jobId };
  } catch (error: any) {
    console.warn('Firebase Firestore pendingJobs push notice:', error?.message || error);
    return { success: false, error: error?.message };
  }
}

/**
 * Instantly save any service request (Repair, Sell, Buy, Bazaar) to Firebase Firestore
 * AND push into centralized 'pendingJobs' collection for admin visibility.
 */
export async function saveOrderToFirestore(order: OrderItem): Promise<{ success: boolean; error?: string }> {
  try {
    const orderDocId = order.id || `ord_${Date.now()}`;
    const orderRef = doc(db, SERVICE_REQUESTS_COLLECTION, orderDocId);

    // Sanitize undefined fields for Firestore
    const sanitizedOrder: Record<string, any> = {};
    for (const [key, value] of Object.entries(order)) {
      if (value !== undefined) {
        sanitizedOrder[key] = value;
      }
    }

    sanitizedOrder.updatedAt = new Date().toISOString();
    sanitizedOrder.timestamp = serverTimestamp();

    await setDoc(orderRef, sanitizedOrder, { merge: true });

    // Also push automatically into centralized 'pendingJobs' collection
    await pushJobToPendingJobs(order);

    return { success: true };
  } catch (error: any) {
    console.warn('Firebase Firestore saveOrder notice (offline/fallback active):', error?.message || error);
    return { success: false, error: error?.message };
  }
}

/**
 * Update an existing service order / job sheet in Firebase Firestore
 */
export async function updateOrderInFirestore(
  orderId: string,
  updates: Partial<OrderItem>
): Promise<{ success: boolean; error?: string }> {
  try {
    const orderRef = doc(db, SERVICE_REQUESTS_COLLECTION, orderId);
    const sanitizedUpdates: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        sanitizedUpdates[key] = value;
      }
    }
    sanitizedUpdates.updatedAt = new Date().toISOString();

    await updateDoc(orderRef, sanitizedUpdates);
    return { success: true };
  } catch (error: any) {
    console.warn('Firebase Firestore updateOrder notice:', error?.message || error);
    return { success: false, error: error?.message };
  }
}

/**
 * Subscribe to real-time service requests / jobs from Firebase Firestore
 */
export function subscribeToOrdersFromFirestore(
  onOrdersReceived: (orders: OrderItem[]) => void
): () => void {
  try {
    const q = query(collection(db, SERVICE_REQUESTS_COLLECTION), orderBy('updatedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        if (!snapshot.empty) {
          const remoteOrders: OrderItem[] = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data();
            remoteOrders.push({
              ...data,
              id: docSnap.id,
              cloudSyncStatus: 'synced'
            } as OrderItem);
          });
          onOrdersReceived(remoteOrders);
        }
      },
      error => {
        console.warn('Firestore real-time subscription notice (using local storage data):', error?.message || error);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.warn('Firestore subscription init notice:', err?.message || err);
    return () => {};
  }
}

/**
 * Subscribe to real-time pendingJobs collection for admin dashboard visibility
 */
export function subscribeToPendingJobsFromFirestore(
  onJobsReceived: (jobs: PendingJobRecord[]) => void
): () => void {
  try {
    const q = query(collection(db, PENDING_JOBS_COLLECTION), orderBy('updatedAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        if (!snapshot.empty) {
          const remoteJobs: PendingJobRecord[] = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data();
            remoteJobs.push({
              ...data,
              jobId: docSnap.id
            } as PendingJobRecord);
          });
          onJobsReceived(remoteJobs);
        }
      },
      error => {
        console.warn('Firestore pendingJobs subscription notice:', error?.message || error);
      }
    );

    return unsubscribe;
  } catch (err: any) {
    console.warn('Firestore pendingJobs subscription init notice:', err?.message || err);
    return () => {};
  }
}

/**
 * Update a pending job record in Firestore
 */
export async function updatePendingJobInFirestore(
  jobId: string,
  updates: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  try {
    const jobRef = doc(db, PENDING_JOBS_COLLECTION, jobId);
    const sanitizedUpdates: Record<string, any> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        sanitizedUpdates[key] = value;
      }
    }
    sanitizedUpdates.updatedAt = new Date().toISOString();

    await updateDoc(jobRef, sanitizedUpdates);
    return { success: true };
  } catch (error: any) {
    console.warn('Firebase Firestore updatePendingJob notice:', error?.message || error);
    return { success: false, error: error?.message };
  }
}
