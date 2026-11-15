import { db } from '../firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';

export interface SiteSettings {
  googleReviewUrl: string;
  whatsappNumber: string; // Digits with country code e.g. 919372802044
  supportPhone: string;   // Display / tel: number e.g. +91 93728 02044
  supportEmail: string;
  businessHours: string;
  instagramUrl: string;
  googleMapsUrl: string;
  googleMapsEmbedUrl: string;
}

export const GOOGLE_MAPS_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d119066.77791957908!2d72.8222859!3d21.1588917!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2eaead1332c11a6b%3A0x1bd1ef560574e47e!2sSastafone!5e0!3m2!1sen!2sin!4v1794767896644!5m2!1sen!2sin';

export const INSTAGRAM_URL = 'https://www.instagram.com/sastafone.in';
export const GOOGLE_MAPS_URL = 'https://maps.app.goo.gl/XwXM1na9Ervb46zA9';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  googleReviewUrl: '',
  whatsappNumber: '919372802044',
  supportPhone: '+91 93728 02044',
  supportEmail: 'support@sastafone.in',
  businessHours: '9:00 AM – 9:30 PM (Monday – Sunday)',
  instagramUrl: INSTAGRAM_URL,
  googleMapsUrl: GOOGLE_MAPS_URL,
  googleMapsEmbedUrl: GOOGLE_MAPS_EMBED_URL
};

const SETTINGS_COLLECTION = 'settings';
const PUBLIC_SETTINGS_DOC = 'public';

export function normalizeWhatsappDigits(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return DEFAULT_SITE_SETTINGS.whatsappNumber;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export function normalizeTelHref(raw: string): string {
  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return `tel:+${DEFAULT_SITE_SETTINGS.whatsappNumber}`;
  if (digits.length === 10) return `tel:+91${digits}`;
  return `tel:+${digits}`;
}

export function buildWhatsappHref(whatsappNumber: string, text?: string): string {
  const digits = normalizeWhatsappDigits(whatsappNumber);
  const query = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${digits}${query}`;
}

export function subscribeToSiteSettings(
  onUpdate: (settings: SiteSettings) => void
): () => void {
  try {
    const ref = doc(db, SETTINGS_COLLECTION, PUBLIC_SETTINGS_DOC);
    return onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<SiteSettings>;
          onUpdate({
            googleReviewUrl: (data.googleReviewUrl || '').trim(),
            whatsappNumber: (data.whatsappNumber || DEFAULT_SITE_SETTINGS.whatsappNumber).trim(),
            supportPhone: (data.supportPhone || DEFAULT_SITE_SETTINGS.supportPhone).trim(),
            supportEmail: (data.supportEmail || DEFAULT_SITE_SETTINGS.supportEmail).trim(),
            businessHours: (data.businessHours || DEFAULT_SITE_SETTINGS.businessHours).trim(),
            instagramUrl: (data.instagramUrl || INSTAGRAM_URL).trim(),
            googleMapsUrl: (data.googleMapsUrl || GOOGLE_MAPS_URL).trim(),
            googleMapsEmbedUrl: (data.googleMapsEmbedUrl || GOOGLE_MAPS_EMBED_URL).trim()
          });
        } else {
          onUpdate(DEFAULT_SITE_SETTINGS);
        }
      },
      () => {
        onUpdate(DEFAULT_SITE_SETTINGS);
      }
    );
  } catch {
    onUpdate(DEFAULT_SITE_SETTINGS);
    return () => {};
  }
}

export async function updateSiteSettingsInFirestore(
  updates: Partial<SiteSettings>,
  updatedByUid?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const ref = doc(db, SETTINGS_COLLECTION, PUBLIC_SETTINGS_DOC);
    await setDoc(
      ref,
      {
        ...updates,
        updatedBy: updatedByUid || 'admin',
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update site settings' };
  }
}
