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
 * Instantly save any service request (Repair, Sell, Buy, Bazaar) to Firebase Firestore
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
