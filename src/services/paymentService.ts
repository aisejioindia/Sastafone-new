/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { OrderItem, PaymentTierType, PaymentRequest, UserProfile } from '../types';

// Official Razorpay link provided for Sastaphone / AllIndia.si operations
export const RAZORPAY_PAYMENT_LINK = 'https://rzp.io/rzp/7i9TRrRg';

export interface PaymentTierConfig {
  type: PaymentTierType;
  amount: number;
  title: string;
  titleHindi: string;
  badge: string;
  tagline: string;
  descriptionHindi: string;
  benefits: string[];
  refundPolicyHindi: string;
  popular?: boolean;
}

export const PAYMENT_TIERS: Record<PaymentTierType, PaymentTierConfig> = {
  appointment_199: {
    type: 'appointment_199',
    amount: 199,
    title: 'Doorstep Repair Visit Token (30 Mins)',
    titleHindi: 'घर पर रिपेयर अपॉइंटमेंट टोकन शुल्क',
    badge: '₹99 REFUND GUARANTEE',
    tagline: 'सूरत में 30 मिनट में सर्टिफाइड ऑलइंडिया टेक्नीशियन आपके पते पर',
    descriptionHindi: '₹199 विज़िट टोकन: फोन रिपेयर होने पर यह ₹199 फाइनल बिल में माइनस होगा। यदि फोन किसी कारण से रिपेयर नहीं हो सका, तो ₹99 तुरंत रिफंड होगा।',
    benefits: [
      '30 मिनट के भीतर होम विज़िट',
      'ओरिजिनल स्पेयर पार्ट्स व 6 माह वारंटी',
      'फोन रिपेयर होने पर ₹199 की पूरी छूट',
      'फोन न बन पाने पर ₹99 तत्काल रिफंड'
    ],
    refundPolicyHindi: 'फोन नहीं बनने पर ₹99 तत्काल रिफंड (AllIndia.si ट्रस्ट प्रोटेक्टेड)',
    popular: true
  },
  basic_99: {
    type: 'basic_99',
    amount: 99,
    title: 'Basic Pass: 10 Contact Unlocks & Chat / 1 Post',
    titleHindi: 'बेसिक पास: 10 सेलर संपर्क अनलॉक व चैट / 1 विज्ञापन',
    badge: '10 CONTACTS UNLOCKED',
    tagline: 'डायरेक्ट सेलर से बात करें व बिना किसी ब्रोकरेज के फोन खरीदें',
    descriptionHindi: '₹99 में 10 सेलर के मोबाइल नंबर तुरंत अनलॉक करें और सुरक्षित इन-ऐप चैट से डायरेक्ट डील करें। यदि आप सेलर हैं तो 1 वेरिफाइड विज्ञापन पोस्ट करें।',
    benefits: [
      '10 सीधे सेलर मोबाइल नंबर अनलॉक',
      'एंटी-लीक सुरक्षित इन-ऐप चैट एक्सेस',
      'सूरत लोकल सेलर डायरेक्ट डील गारंटी',
      'आधिकारिक टैक्स इनवॉइस व रसीद'
    ],
    refundPolicyHindi: '100% वेरिफाइड ऑलइंडिया नंबर गारंटी',
    popular: true
  },
  pro_299: {
    type: 'pro_299',
    amount: 299,
    title: 'Pro VIP Pass: 50 Contact Unlocks & Priority Access',
    titleHindi: 'प्रो वीआईपी पास: 50 मोबाइल संपर्क अनलॉक व प्रायोरिटी डील्स',
    badge: '50 CONTACTS (BEST VALUE)',
    tagline: 'सूरत के सर्वश्रेष्ठ सेकंड-हैंड मोबाइल डील्स सबसे पहले पाएं',
    descriptionHindi: '₹299 में 50 सेलर के डायरेक्ट मोबाइल नंबर अनलॉक करें, वीआईपी सेलर अलर्ट पाएं और प्रायोरिटी सपोर्ट हासिल करें।',
    benefits: [
      '50 सीधे सेलर मोबाइल नंबर अनलॉक',
      'वीआईपी प्रायोरिटी बायर बैज',
      'अनलिमिटेड इन-ऐप चैट व सेलर कॉलिंग',
      'नये विज्ञापनों पर सबसे पहले इंस्टेंट नोटिफिकेशन'
    ],
    refundPolicyHindi: '100% वेरिफाइड ऑलइंडिया नंबर गारंटी',
    popular: true
  },
  seller_pro_799: {
    type: 'seller_pro_799',
    amount: 799,
    title: 'Pro Seller Plan: 10 Verified Mobile Listings',
    titleHindi: 'प्रो सेलर प्लान: 10 वेरिफाइड मोबाइल विज्ञापन',
    badge: '10 ADS + PRO BADGE',
    tagline: 'सूरत के हज़ारों खरीदारों तक अपना मोबाइल तुरंत पहुंचाएं',
    descriptionHindi: '₹799 में 10 मोबाइल विज्ञापन पोस्ट करें, 6-फोटो एचडी गैलरी, प्रो सेलर ट्रस्ट बैज और प्रायोरिटी सर्च रैंकिंग।',
    benefits: [
      '10 वेरिफाइड मोबाइल विज्ञापन स्लॉट',
      'प्रो सेलर बैज व 3x अधिक ग्राहक व्यूज',
      'कस्टमर नंबर प्राइवेसी प्रोटेक्शन शील्ड',
      'आधिकारिक सेलर टैक्स इनवॉइस'
    ],
    refundPolicyHindi: '100% सुरक्षित ऑलइंडिया नेटवर्क गारंटी'
  }
};

/**
 * Opens the official Razorpay checkout page in a safe new window or redirect
 */
export const openRazorpayPaymentLink = (url: string = RAZORPAY_PAYMENT_LINK): Window | null => {
  return window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Creates a verified OrderItem entry for dashboard & printable invoice
 */
export const createPaymentOrderItem = (
  request: PaymentRequest,
  user: UserProfile,
  transactionId?: string
): OrderItem => {
  const txId = transactionId || `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
  const orderNumber = request.type === 'appointment_199'
    ? `STP-REP-${Math.floor(1000 + Math.random() * 9000)}`
    : `STP-PASS-${Math.floor(1000 + Math.random() * 9000)}`;

  let title = request.title;
  let subtitle = request.description;
  let locality = user.locality || 'Adajan, Surat';
  let fullAddress = user.address || `${locality}, Surat, Gujarat`;
  let customerName = user.name || 'Surat Resident';
  let customerPhone = user.phone || '9372802044';
  let timeSlot = 'Instant / Immediate';

  if (request.type === 'appointment_199' && request.repairDetails) {
    const rd = request.repairDetails;
    title = `${rd.modelName} - ${rd.issueName}`;
    subtitle = `30-Min Doorstep Repair • ₹199 विज़िट टोकन (₹99 रिफंडेबल)`;
    locality = rd.locality || locality;
    fullAddress = rd.address || fullAddress;
    customerName = rd.customerName || customerName;
    customerPhone = rd.customerPhone || customerPhone;
    timeSlot = rd.timeSlot || 'Today (30-45 Mins)';
  } else if (request.targetSellerName && request.targetListingTitle) {
    subtitle = `${request.targetListingTitle} (सेलर: ${request.targetSellerName}) • ${request.description}`;
  }

  return {
    id: 'ord-' + Date.now(),
    orderNumber,
    type: request.type === 'appointment_199' ? 'repair' : 'pass',
    title,
    subtitle,
    amount: request.amount,
    status: 'technician_assigned',
    statusHindi: request.type === 'appointment_199'
      ? 'विज़िट टोकन पेड (टेक्नीशियन असाइन हुआ)'
      : 'एक्टिव पास (क्रेडिट्स व संपर्क अनलॉक)',
    locality,
    fullAddress,
    customerName,
    customerPhone,
    date: 'Just now',
    timeSlot,
    technicianName: request.type === 'appointment_199' ? 'Sanjay Prajapati (AllIndia Doorstep Lead)' : 'AllIndia.si डिजिटल सिस्टम',
    technicianPhone: 'ऑफ़िशियल हब',
    visitCharge: request.type === 'appointment_199' ? 199 : undefined,
    paymentMethod: `Razorpay UPI / AllIndia Pay (Ref: ${txId})`,
    paymentStatus: 'paid',
    refundPolicyNote: request.refundNote || (request.type === 'appointment_199'
      ? 'फोन रिपेयर होने पर ₹199 फाइनल बिल में माइनस होगा। फोन रिपेयर न होने पर ₹99 तुरंत रिफंड होगा।'
      : '100% वेरिफाइड सेलर संपर्क गारंटी।')
  };
};
