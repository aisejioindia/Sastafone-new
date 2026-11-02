import {
  Brand,
  PhoneModel,
  RefurbishedPhone,
  RepairIssue,
  SuratLocality,
  P2PListing,
  BrandServiceCenter,
  RepairSuperLab,
  CustomerRepairReview,
  CustomerReview
} from '../types';

export const SASTAPHONE_PHONE = '9372802044';
export const WHATSAPP_NUMBER = '919372802044';
export const DEFAULT_SURAT_LOCALITY = 'Adajan, Surat';

// Razorpay secure ₹199 Doorstep visit appointment payment link provided by user
export const RAZORPAY_REPAIR_VISIT_LINK = 'https://rzp.io/rzp/7i9TRrRg';

export const BRANDS: Brand[] = [
  { id: 'samsung', name: 'Samsung', logoText: 'Samsung', badgeColor: 'from-blue-700 to-blue-900', popular: true },
  { id: 'motorola', name: 'Motorola', logoText: 'M moto', badgeColor: 'from-indigo-600 to-indigo-900', popular: true },
  { id: 'vivo', name: 'Vivo', logoText: 'vivo', badgeColor: 'from-sky-500 to-blue-700', popular: true },
  { id: 'oppo', name: 'Oppo', logoText: 'OPPO', badgeColor: 'from-emerald-600 to-teal-800', popular: true },
  { id: 'tecno', name: 'Tecno', logoText: 'TECNO', badgeColor: 'from-blue-500 to-indigo-600', popular: true },
  { id: 'realme', name: 'Realme', logoText: 'realme', badgeColor: 'from-amber-400 to-yellow-600', popular: true },
  { id: 'xiaomi', name: 'Xiaomi (Mi / Redmi)', logoText: 'mi Xiaomi', badgeColor: 'from-orange-500 to-orange-700', popular: true },
  { id: 'oneplus', name: 'OnePlus', logoText: '1+ OnePlus', badgeColor: 'from-red-600 to-red-800', popular: true },
  { id: 'iqoo', name: 'iQOO', logoText: 'iQOO', badgeColor: 'from-amber-500 to-red-600', popular: true },
  { id: 'poco', name: 'Poco', logoText: 'POCO', badgeColor: 'from-yellow-400 to-amber-600', popular: true },
  { id: 'apple', name: 'Apple', logoText: ' Apple', badgeColor: 'from-slate-900 to-slate-700', popular: true },
  { id: 'nothing', name: 'Nothing', logoText: '(N) Nothing', badgeColor: 'from-zinc-900 to-stone-800', popular: true },
  { id: 'google', name: 'Google Mobile', logoText: 'G Google', badgeColor: 'from-red-500 via-yellow-500 to-blue-500', popular: true },
  { id: 'infinix', name: 'Infinix', logoText: 'Infinix', badgeColor: 'from-green-600 to-emerald-800', popular: true },
  { id: 'lava', name: 'Lava', logoText: 'LAVA', badgeColor: 'from-red-600 to-rose-800', popular: true },
  { id: 'cmf', name: 'CMF by Nothing', logoText: 'cmf', badgeColor: 'from-orange-600 to-orange-800', popular: true },
  { id: 'honor', name: 'Honor', logoText: 'HONOR', badgeColor: 'from-cyan-600 to-blue-600', popular: true },
];

import { COMPREHENSIVE_PHONE_MODELS } from './phonesDatabase';

const EXCLUDED_BRAND_IDS = ['alcatel', 'huawei', 'blackberry', 'asus', 'nubia', 'lg'];

// Filtered models list without removed brands
export const PHONE_MODELS: PhoneModel[] = COMPREHENSIVE_PHONE_MODELS.filter(
  m => !EXCLUDED_BRAND_IDS.includes(m.brandId)
);


// Surat Official Authorized Brand Service Centers Directory (to make it easy for customers)
export const SURAT_OFFICIAL_SERVICE_CENTERS: BrandServiceCenter[] = [
  {
    id: 'sc-apple-majura',
    brandName: 'Apple',
    centerName: 'Apple Authorized Service Provider (Inspire / F1 Info)',
    address: 'Shop No. 104-106, 1st Floor, Trade Center, Near Majura Gate Circle',
    area: 'Majura Gate, Surat',
    pincode: '395002',
    phone: '0261-2475588',
    timings: '10:00 AM - 7:30 PM (Mon-Sat)',
    rating: 4.8,
    googleMapQuery: 'Apple Service Center Majura Gate Surat',
    verifiedOfficial: true
  },
  {
    id: 'sc-samsung-ringroad',
    brandName: 'Samsung',
    centerName: 'Samsung Customer Service Plaza Surat',
    address: 'Upper Ground Floor, Silicon Shoppers, Ring Road, Opp. Civil Court',
    area: 'Ring Road, Surat',
    pincode: '395002',
    phone: '1800-40-7267864',
    timings: '10:00 AM - 8:00 PM (All 7 Days)',
    rating: 4.7,
    googleMapQuery: 'Samsung Service Plaza Ring Road Surat',
    verifiedOfficial: true
  },
  {
    id: 'sc-mi-athwagate',
    brandName: 'Xiaomi (Mi / Redmi)',
    centerName: 'Xiaomi Mi Authorized Exclusive Service Center',
    address: 'Office 203, Jolly Plaza, Opp. Athwa Arcade, Athwagate',
    area: 'Athwagate / Nanpura, Surat',
    pincode: '395001',
    phone: '0261-2462299',
    timings: '10:30 AM - 7:00 PM (Closed Sunday)',
    rating: 4.6,
    googleMapQuery: 'Xiaomi Mi Service Center Athwagate Surat',
    verifiedOfficial: true
  },
  {
    id: 'sc-oneplus-ghoddod',
    brandName: 'OnePlus',
    centerName: 'OnePlus Authorized Service Center Surat',
    address: 'Ground Floor, Prime Arcade, Near Rajhans Multiplex, Ghod Dod Road',
    area: 'Ghod Dod Road, Surat',
    pincode: '395007',
    phone: '1800-102-8411',
    timings: '10:00 AM - 7:30 PM',
    rating: 4.8,
    googleMapQuery: 'OnePlus Service Center Ghod Dod Road Surat',
    verifiedOfficial: true
  },
  {
    id: 'sc-vivo-varachha',
    brandName: 'Vivo',
    centerName: 'Vivo Official Care Service Hub Surat',
    address: '2nd Floor, Royal Arcade, Varachha Main Road, Opp. Zoo Garden',
    area: 'Varachha, Surat',
    pincode: '395006',
    phone: '1800-102-3388',
    timings: '10:00 AM - 7:00 PM',
    rating: 4.6,
    googleMapQuery: 'Vivo Service Center Varachha Surat',
    verifiedOfficial: true
  },
  {
    id: 'sc-realme-adajan',
    brandName: 'Realme',
    centerName: 'Realme Exclusive Service Plaza Adajan',
    address: 'Shop 14, 1st Floor, Shreepad Ananta, Near LP Savani Road, Adajan',
    area: 'Adajan, Surat',
    pincode: '395009',
    phone: '1800-102-2777',
    timings: '10:00 AM - 7:30 PM',
    rating: 4.7,
    googleMapQuery: 'Realme Service Center Adajan Surat',
    verifiedOfficial: true
  }
];

// Surat Sastaphone Central Super Cleanroom Labs (for complex chip-level/curved screen repairs)
export const SASTAPHONE_SUPER_LABS: RepairSuperLab[] = [
  {
    id: 'lab-ringroad-hq',
    name: 'Sastaphone Central Tech Super Lab (HQ Cleanroom)',
    tagline: 'सूरत की सबसे एडवांस्ड चिपसेट व मदरबोर्ड आईसी रिपेयर लैब',
    area: 'Ring Road / Textile Market Hub, Surat',
    fullAddress: 'Level 4, Diamond Heritage Complex, Near Ring Road Flyover, Surat',
    equipment: ['BGA Rework Station', 'OCA Vacuum Screen Laminator', 'Thermal Infrared Cam', 'Ultrasonic De-oxidation'],
    cctvProtected: true,
    isoCertified: true,
    technicianLead: 'Pravin Solanki (Master Micro-Soldering Engineer - 14 Yrs Exp)',
    phone: '9372802044',
    averageTime: '2 से 4 घंटे (CCTV रिकॉर्डिंग के साथ)'
  },
  {
    id: 'lab-adajan-express',
    name: 'Sastaphone West Hub Lab (Adajan-Pal)',
    tagline: 'कर्व्ड एमोलेड डिस्प्ले और वाटर डैमेज रिकवरी यूनिट',
    area: 'Adajan - Pal Link Road, Surat',
    fullAddress: 'Shop 102, Shivalik Avenue, Opp. Anand Mahal Road, Adajan, Surat',
    equipment: ['Edge Screen Separator', 'Microscope Soldering', 'Battery Cell Balancer'],
    cctvProtected: true,
    isoCertified: true,
    technicianLead: 'Sanjay Prajapati (Surat West Field Lead)',
    phone: '9372802044',
    averageTime: '45 से 90 मिनट'
  }
];

// Verified SastaBazaar Direct P2P Mobile Listings in Surat (with Phone Number Privacy Masking)
export const INITIAL_P2P_LISTINGS: P2PListing[] = [
  {
    id: 'p2p-101',
    sellerName: 'Jignesh Patel',
    sellerPhone: '9825145892',
    maskedPhone: '98251 •••••',
    brand: 'Apple',
    modelName: 'iPhone 15 Pro (128GB)',
    variant: '128 GB Natural Titanium',
    price: 68500,
    condition: 'Like New (सुपर फ्रेश - बिल व बॉक्स सहित)',
    highlights: ['Battery Health 98%', 'Apple Care Warranty Active', 'Scratchless Screen with Tempered Glass'],
    description: 'फोन केवल 4 महीने पुराना है। ओरिजिनल केबल, बिल और बॉक्स मौजूद है। सूरत के अडाजण या वेसु में हैंड-टू-हैंड चेक करके लें।',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&auto=format&fit=crop&q=80'
    ],
    locality: 'Adajan, Surat',
    date: 'Today, 11:30 AM',
    planType: 'single_99',
    isPro: false,
    viewsCount: 142
  },
  {
    id: 'p2p-102',
    sellerName: 'Mehul Desai (Pro Verified Seller)',
    sellerPhone: '9879512340',
    maskedPhone: '98795 •••••',
    brand: 'Xiaomi (Mi)',
    modelName: 'Xiaomi 14 5G (12GB / 512GB)',
    variant: '12GB RAM / 512GB Jade Green',
    price: 36999,
    condition: 'Superb (शानदार)',
    highlights: ['Leica Summilux Lens', '90W Turbo Charger Included', 'Clean Bill with Warranty'],
    description: 'पर्सनल उपयोग का फोन, कोई भी स्क्रैच नहीं है। केवल अपग्रेड करने के लिए बेच रहा हूँ। वीआईपी रोड वेसु के पास विज़िट करके ले सकते हैं।',
    images: [
      'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600&auto=format&fit=crop&q=80'
    ],
    locality: 'Vesu, Surat',
    date: 'Yesterday',
    planType: 'pro_799',
    isPro: true,
    viewsCount: 310
  },
  {
    id: 'p2p-103',
    sellerName: 'Ketan Shah',
    sellerPhone: '9374011223',
    maskedPhone: '93740 •••••',
    brand: 'OnePlus',
    modelName: 'OnePlus Nord 4 5G',
    variant: '8GB / 256GB Mercurial Silver',
    price: 21500,
    condition: 'Flawless (सुपर फ्रेश)',
    highlights: ['All Metal Body', 'SuperVOOC 100W Charging', '6 Months OnePlus Brand Warranty'],
    description: 'बिल्कुल नया जैसा फोन। बिल, बॉक्स और चार्जर सब मौजूद है। वराछा हीरा बाज़ार के पास हैंडओवर कर सकता हूँ।',
    images: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80'
    ],
    locality: 'Varachha, Surat',
    date: '2 Days Ago',
    planType: 'single_99',
    isPro: false,
    viewsCount: 98
  }
];

// Happy Customer Repair Reviews & Stories
export const CUSTOMER_REPAIR_REVIEWS: CustomerRepairReview[] = [
  {
    id: 'rev-1',
    customerName: 'Haresh Solanki',
    locality: 'Pal, Surat',
    phoneModel: 'iPhone 13 (Screen Replacement)',
    issueFixed: 'कर्व्ड टच स्क्रीन क्रैक 30 मिनट में घर पर ठीक हुआ',
    rating: 5,
    comment: 'टेक्नीशियन संजय भाई सीधे मेरे घर अडाजण आए। ओरिजिनल ओएलईडी स्क्रीन लगाई और ₹199 विज़िट चार्ज फाइनल बिल में एडजस्ट भी कर दिया। बेस्ट सर्विस!',
    date: '26 Oct 2026',
    verifiedRepair: true
  },
  {
    id: 'rev-2',
    customerName: 'Priya Choksi',
    locality: 'Citylight, Surat',
    phoneModel: 'Samsung S22 (Motherboard No Power)',
    issueFixed: 'रिंग रोड सेंट्रल लैब में 2 घंटे में मदरबोर्ड आईसी रिपेयर हुआ',
    rating: 5,
    comment: 'फोन बिल्कुल ऑन नहीं हो रहा था। सेंट्रल सुपर लैब में ले जाकर चिपसेट रीबॉलिंग की और पूरा डेटा सुरक्षित बचा लिया। बहुत धैर्य और विश्वास वाली टीम है।',
    date: '24 Oct 2026',
    verifiedRepair: true
  },
  {
    id: 'rev-3',
    customerName: 'Bhavin Vaghani',
    locality: 'Katargam, Surat',
    phoneModel: 'Xiaomi 13 Pro (Battery & Heating Issue)',
    issueFixed: 'ओरिजिनल 100% क्षमता वाली बैटरी इंस्टॉलेशन',
    rating: 5,
    comment: 'फोन बहुत ज्यादा गर्म हो रहा था। थर्मल क्लीनिंग और नई बैटरी के बाद फोन मक्खन चल रहा है। सोशल मीडिया पर मैंने वीडियो भी शेयर किया!',
    date: '21 Oct 2026',
    verifiedRepair: true
  }
];

// Unified Customer Reviews for Repairs, Sales, and Refurbished Purchases
export const INITIAL_CUSTOMER_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-c1',
    customerName: 'Haresh Solanki',
    locality: 'Pal, Surat',
    serviceType: 'repair',
    phoneModel: 'iPhone 13',
    serviceDetail: '30 मिनट में घर पर ओरिजिनल स्क्रीन रिप्लेसमेंट',
    rating: 5,
    reviewText: 'टेक्नीशियन संजय भाई सीधे मेरे घर पाल आए। 30 मिनट के अंदर ओरिजिनल ओएलईडी स्क्रीन बदल दी। ₹199 टोकन विज़िट चार्ज फाइनल बिल में माइनस कर दिया। 6 महीने की वारंटी मिली। सुपर खुश!',
    date: '26 Oct 2026',
    verified: true,
    orderNumber: 'STP-SURAT-8921',
    likesCount: 24,
    likedByMe: false
  },
  {
    id: 'rev-c2',
    customerName: 'Ankit Jariwala',
    locality: 'Varachha, Surat',
    serviceType: 'sell',
    phoneModel: 'Samsung Galaxy S23 Ultra',
    serviceDetail: 'डोरस्टेप फोन पिकअप व तुरंत ₹52,000 बैंक ट्रांसफर',
    rating: 5,
    reviewText: 'पुराना S23 Ultra बेचने के लिए ऑनलाइन वैल्यूएशन किया। दोपहर 2 बजे टेक्नीशियन आया, 5 मिनट में कैमरा और स्क्रीन चेक की और तुरंत मेरे बैंक खाते में ₹52,000 एनईएफटी कर दिए। सूरत का सबसे सच्चा प्लेटफॉर्म!',
    date: '25 Oct 2026',
    verified: true,
    orderNumber: 'STP-SURAT-9034',
    likesCount: 38,
    likedByMe: true
  },
  {
    id: 'rev-c3',
    customerName: 'Sneha Modi',
    locality: 'Vesu, Surat',
    serviceType: 'buy',
    phoneModel: 'iPhone 14 (128GB Midnight)',
    serviceDetail: 'सर्टिफाइड सुपर फ्रेश • 96% बैटरी हेल्थ',
    rating: 5,
    reviewText: 'दिवाली ऑफर में सर्टिफाइड आईफोन 14 मंगवाया। फोन बिल्कुल सील-पैक नया जैसा निकला, 96% बैटरी हेल्थ और 6 महीने की फुल वारंटी मिली। मार्केट से ₹14,000 की बचत हुई। सस्ताफोन का भरोसा सच है।',
    date: '24 Oct 2026',
    verified: true,
    orderNumber: 'STP-SURAT-8712',
    likesCount: 19,
    likedByMe: false
  },
  {
    id: 'rev-c4',
    customerName: 'Mehul Patel',
    locality: 'Adajan, Surat',
    serviceType: 'repair',
    phoneModel: 'OnePlus 10R 5G',
    serviceDetail: 'बैटरी ड्रेन फिक्स + नई 100% ओरिजिनल बैटरी',
    rating: 5,
    reviewText: 'मेरा वनप्लस फोन दिन में 3 बार चार्ज करना पड़ता था। सस्ताफोन की होम रिपेयर बुक की। टेक्नीशियन ने सामने ही फोन खोलकर नई सीलबंद बैटरी लगाई। अब पूरे 1.5 दिन का बैकअप मिल रहा है।',
    date: '23 Oct 2026',
    verified: true,
    orderNumber: 'STP-SURAT-7742',
    likesCount: 15,
    likedByMe: false
  },
  {
    id: 'rev-c5',
    customerName: 'Rupal Goti',
    locality: 'Katargam, Surat',
    serviceType: 'sell',
    phoneModel: 'Vivo V25 Pro',
    serviceDetail: 'वीडियो वेरिफिकेशन से ₹300 अतिरिक्त बोनस मिला',
    rating: 5,
    reviewText: 'मैंने वेबसाइट पर 30 सेकंड का कंडीशन वीडियो अपलोड किया था जिससे ₹300 एक्स्ट्रा बोनस मिला। कतारगाम हीरा बाज़ार के पास पिकअप हुआ और कोई मोलभाव नहीं किया। पूरी तय कीमत मिली!',
    date: '22 Oct 2026',
    verified: true,
    orderNumber: 'STP-SURAT-8490',
    likesCount: 29,
    likedByMe: false
  },
  {
    id: 'rev-c6',
    customerName: 'Chirag Shah',
    locality: 'Ghod Dod Road, Surat',
    serviceType: 'buy',
    phoneModel: 'Nothing Phone (1) White Glyph',
    serviceDetail: 'शानदार 32% डिस्काउंट डील • 100% टेस्टेड',
    rating: 5,
    reviewText: 'नथिंग फोन 1 खरीदा, ग्लिफ लाइट्स और कैमरा एकदम नया जैसा है। साथ में ओरिजिनल जीएसटी इनवॉइस और वारंटी कार्ड भी मिला। डिलीवरी भी उसी दिन शाम को मिल गई।',
    date: '20 Oct 2026',
    verified: true,
    orderNumber: 'STP-SURAT-7920',
    likesCount: 11,
    likedByMe: false
  },
  {
    id: 'rev-c7',
    customerName: 'Priya Choksi',
    locality: 'Citylight, Surat',
    serviceType: 'repair',
    phoneModel: 'Samsung S22',
    serviceDetail: 'रिंग रोड सेंट्रल लैब में मदरबोर्ड चिपसेट रीबॉलिंग',
    rating: 5,
    reviewText: 'फोन अचानक बंद हो गया था। ऑथराइज्ड सेंटर ने पूरा मदरबोर्ड बदलने को बोला था। सस्ताफोन की सेंट्रल सुपर लैब में BGA मशीन से चिपसेट रिपेयर हुआ और मेरा पूरा 2 साल का फोटो डेटा बच गया। भगवान का धन्यवाद!',
    date: '19 Oct 2026',
    verified: true,
    orderNumber: 'STP-SURAT-7411',
    likesCount: 42,
    likedByMe: true
  }
];

// Refurbished Diwali Dhamaka Deals (5x2 Grid)
export const DIWALI_DHAMAKA_PHONES: RefurbishedPhone[] = [
  {
    id: 'refurb-1',
    brand: 'Apple',
    name: 'iPhone 13 (128GB)',
    variant: '128 GB',
    color: 'Starlight White',
    grade: 'Superb (शानदार)',
    originalPrice: 49999,
    offerPrice: 36999,
    discountPct: 26,
    imageUrl: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600&auto=format&fit=crop&q=80',
    batteryHealth: 89,
    warrantyMonths: 6,
    keySpecs: ['A15 Bionic Chip', 'Dual 12MP Camera', 'OLED Super Retina'],
    stockCount: 3,
    isDiwaliDhamaka: true
  },
  {
    id: 'refurb-2',
    brand: 'OnePlus',
    name: 'OnePlus 10R 5G',
    variant: '8GB / 128GB',
    color: 'Sierra Black',
    grade: 'Like New (सुपर फ्रेश)',
    originalPrice: 26999,
    offerPrice: 18499,
    discountPct: 31,
    imageUrl: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80',
    batteryHealth: 94,
    warrantyMonths: 6,
    keySpecs: ['80W SuperVOOC', 'Dimensity 8100-Max', '120Hz Fluid AMOLED'],
    stockCount: 5,
    isDiwaliDhamaka: true
  },
  {
    id: 'refurb-3',
    brand: 'Samsung',
    name: 'Galaxy S22 5G',
    variant: '8GB / 128GB',
    color: 'Phantom Black',
    grade: 'Superb (शानदार)',
    originalPrice: 45000,
    offerPrice: 31999,
    discountPct: 29,
    imageUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80',
    batteryHealth: 91,
    warrantyMonths: 6,
    keySpecs: ['Snapdragon 8 Gen 1', 'Nightography 50MP', 'Dynamic AMOLED 2X'],
    stockCount: 2,
    isDiwaliDhamaka: true
  },
  {
    id: 'refurb-4',
    brand: 'Vivo',
    name: 'Vivo V27 5G',
    variant: '8GB / 128GB',
    color: 'Magic Blue',
    grade: 'Like New (सुपर फ्रेश)',
    originalPrice: 25999,
    offerPrice: 19200,
    discountPct: 26,
    imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&auto=format&fit=crop&q=80',
    batteryHealth: 93,
    warrantyMonths: 6,
    keySpecs: ['Aura Light Portrait', '3D Curved AMOLED', '66W Fast Charging'],
    stockCount: 4,
    isDiwaliDhamaka: true
  },
  {
    id: 'refurb-5',
    brand: 'Xiaomi',
    name: 'Redmi Note 12 Pro 5G',
    variant: '6GB / 128GB',
    color: 'Onyx Black',
    grade: 'Good (अच्छा)',
    originalPrice: 19999,
    offerPrice: 13999,
    discountPct: 30,
    imageUrl: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600&auto=format&fit=crop&q=80',
    batteryHealth: 88,
    warrantyMonths: 6,
    keySpecs: ['50MP Sony IMX766 OIS', '120Hz Pro AMOLED', '67W Turbo Charge'],
    stockCount: 6,
    isDiwaliDhamaka: true
  },
  {
    id: 'refurb-6',
    brand: 'Apple',
    name: 'iPhone 14 (128GB)',
    variant: '128 GB',
    color: 'Midnight Blue',
    grade: 'Like New (सुपर फ्रेश)',
    originalPrice: 62000,
    offerPrice: 47999,
    discountPct: 23,
    imageUrl: 'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=600&auto=format&fit=crop&q=80',
    batteryHealth: 96,
    warrantyMonths: 6,
    keySpecs: ['Photonic Engine', 'Action Mode Video', 'Emergency SOS Crash Detect'],
    stockCount: 2,
    isDiwaliDhamaka: true
  },
  {
    id: 'refurb-7',
    brand: 'Realme',
    name: 'Realme 11 Pro+ 5G',
    variant: '8GB / 256GB',
    color: 'Sunrise Beige (Leather)',
    grade: 'Superb (शानदार)',
    originalPrice: 24999,
    offerPrice: 17500,
    discountPct: 30,
    imageUrl: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80',
    batteryHealth: 92,
    warrantyMonths: 6,
    keySpecs: ['200MP OIS SuperZoom', '100W SuperVOOC', 'Curved Vision Display'],
    stockCount: 4,
    isDiwaliDhamaka: true
  },
  {
    id: 'refurb-8',
    brand: 'Nothing',
    name: 'Nothing Phone (1)',
    variant: '8GB / 128GB',
    color: 'White Glyph Edition',
    grade: 'Superb (शानदार)',
    originalPrice: 24999,
    offerPrice: 16999,
    discountPct: 32,
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    batteryHealth: 90,
    warrantyMonths: 6,
    keySpecs: ['Unique Glyph Interface', 'Snapdragon 778G+', 'Wireless Charging'],
    stockCount: 3,
    isDiwaliDhamaka: true
  },
  {
    id: 'refurb-9',
    brand: 'iQOO',
    name: 'iQOO Neo 7 5G',
    variant: '8GB / 128GB',
    color: 'Interstellar Black',
    grade: 'Like New (सुपर फ्रेश)',
    originalPrice: 27999,
    offerPrice: 19999,
    discountPct: 29,
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
    batteryHealth: 94,
    warrantyMonths: 6,
    keySpecs: ['Dimensity 8200 4nm', '120W FlashCharge', 'Motion Control Gaming'],
    stockCount: 3,
    isDiwaliDhamaka: true
  },
  {
    id: 'refurb-10',
    brand: 'Motorola',
    name: 'Motorola Edge 40 5G',
    variant: '8GB / 256GB',
    color: 'Eclipse Black (Vegan Leather)',
    grade: 'Superb (शानदार)',
    originalPrice: 26999,
    offerPrice: 18999,
    discountPct: 30,
    imageUrl: 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600&auto=format&fit=crop&q=80',
    batteryHealth: 93,
    warrantyMonths: 6,
    keySpecs: ['144Hz 3D Curved pOLED', 'IP68 Water Under', '68W TurboPower'],
    stockCount: 4,
    isDiwaliDhamaka: true
  }
];

// Surat Localities
export const SURAT_LOCALITIES: SuratLocality[] = [
  { id: 'adajan', name: 'Adajan', hindiName: 'अडाजण', pincode: '395009', zone: 'West', isPopular: true },
  { id: 'vesu', name: 'Vesu', hindiName: 'वेसु', pincode: '395007', zone: 'South', isPopular: true },
  { id: 'pal', name: 'Pal (Pal Gam)', hindiName: 'पाल', pincode: '395009', zone: 'West', isPopular: true },
  { id: 'varachha', name: 'Varachha', hindiName: 'वराछा', pincode: '395006', zone: 'East', isPopular: true },
  { id: 'katargam', name: 'Katargam', hindiName: 'कतारगाम', pincode: '395004', zone: 'North', isPopular: true },
  { id: 'rander', name: 'Rander', hindiName: 'रांदेर', pincode: '395005', zone: 'West', isPopular: true },
  { id: 'piplod', name: 'Piplod (Dumas Road)', hindiName: 'पिपलोद', pincode: '395007', zone: 'South', isPopular: true },
  { id: 'citylight', name: 'Citylight', hindiName: 'सिटीलाइट', pincode: '395007', zone: 'South', isPopular: true },
  { id: 'ghod-dod', name: 'Ghod Dod Road', hindiName: 'घोड दोड रोड', pincode: '395007', zone: 'South', isPopular: true },
  { id: 'althan', name: 'Althan', hindiName: 'अलथाण', pincode: '395017', zone: 'South', isPopular: true },
  { id: 'nanpura', name: 'Nanpura', hindiName: 'नानपुरा', pincode: '395001', zone: 'Central' },
  { id: 'majura', name: 'Majura Gate', hindiName: 'मजूरा गेट', pincode: '395002', zone: 'Central' },
  { id: 'bhatar', name: 'Bhatar Road', hindiName: 'भटार रोड', pincode: '395001', zone: 'South' },
  { id: 'jahangirpura', name: 'Jahangirpura', hindiName: 'जहांगीरपुरा', pincode: '395005', zone: 'West' },
  { id: 'amroli', name: 'Amroli', hindiName: 'अमरोली', pincode: '394107', zone: 'North' },
  { id: 'dindoli', name: 'Dindoli', hindiName: 'दिंडोली', pincode: '394210', zone: 'East' },
  { id: 'udhna', name: 'Udhna', hindiName: 'उधना', pincode: '394210', zone: 'South' }
];

export const REPAIR_ISSUES: RepairIssue[] = [
  {
    id: 'phone-makeover-combo',
    name: 'Make My Phone Like New (All-In-One Full Restoration Combo)',
    hindiName: '🌟 मेरा फोन बिल्कुल नया जैसा बनाओ (मेगा मेकओवर कॉम्बो)',
    iconName: 'Sparkles',
    minPrice: 2499,
    maxPrice: 4499,
    estimatedTime: '45-60 मिनट (फुल मेकओवर)',
    description: 'फोन को शो-रूम जैसी नई चमक दें! नया डिस्प्ले + 100% नई बैटरी + नया बैक पैनल/बॉडी कवर + नया कैमरा ग्लास + 9D टेम्पर्ड ग्लास + पूरी डीप क्लीनिंग व थर्मल सर्विस एक साथ कॉम्बो स्पेशल रेट में!',
    popular: true,
    category: 'combo',
    isMakeoverCombo: true,
    comboItems: [
      'नया प्रीमियम डिस्प्ले व टच स्क्रीन (New Display & Touch)',
      'नई 100% ओरिजिनल बैटरी (100% New Battery)',
      'नया बैक पैनल व बॉडी हाउसिंग कवर (New Back Panel / Body Frame)',
      'नया क्रिस्टल क्लियर कैमरा लेंस ग्लास (New Camera Lens Glass)',
      '9D/11D प्रीमियम टेम्पर्ड ग्लास गार्ड (9D/11D Tempered Glass)',
      'फुल अल्ट्रासोनिक डीप क्लीनिंग व थर्मल ओवरहाल (Full Deep Clean & Service)'
    ],
    originalSeparateTotal: { min: 3394, max: 7894 }
  },
  {
    id: 'broken-screen',
    name: 'Broken / Cracked Display Screen',
    hindiName: 'नया डिस्प्ले स्क्रीन / टच क्रैक रिप्लेसमेंट',
    iconName: 'Smartphone',
    minPrice: 1299,
    maxPrice: 3499,
    estimatedTime: '30 मिनट में घर पर',
    description: 'ओरिजिनल क्वालिटी डिस्प्ले रिप्लेसमेंट, 6 महीने वारंटी और टच वारंटी के साथ।',
    popular: true,
    category: 'screen'
  },
  {
    id: 'battery-drain',
    name: 'Battery Draining / New Battery Replacement',
    hindiName: 'नई ओरिजिनल बैटरी (100% हेल्थ व बैकअप)',
    iconName: 'BatteryCharging',
    minPrice: 899,
    maxPrice: 1799,
    estimatedTime: '25 मिनट में घर पर',
    description: 'नई 100% क्षमता वाली बैटरी इंस्टॉलेशन, पूरे दिन का बैकअप + पुरानी बैटरी का सेफ डिस्पोजल।',
    popular: true,
    category: 'battery'
  },
  {
    id: 'back-glass',
    name: 'Back Glass / Outer Body Housing Cracked',
    hindiName: 'नया बैक पैनल / बॉडी हाउसिंग कवर',
    iconName: 'Shield',
    minPrice: 499,
    maxPrice: 1299,
    estimatedTime: '25 मिनट में फिटिंग',
    description: 'लेजर बैक ग्लास रिमूवल व नया ओरिजिनल प्रीमियम बैक पैनल व शाइनिंग बॉडी फ्रेम फिटिंग।',
    category: 'body',
    popular: true
  },
  {
    id: 'camera-glass-lens',
    name: 'Rear Camera Glass Lens Replacement',
    hindiName: 'नया कैमरा लेंस ग्लास (क्रिस्टल क्लियर सफायर)',
    iconName: 'Camera',
    minPrice: 299,
    maxPrice: 599,
    estimatedTime: '20 मिनट में रिप्लेसमेंट',
    description: 'टूटे या स्क्रैच पड़े रियर कैमरा ग्लास लेंस का रिप्लेसमेंट, सफायर कोटिंग और क्रिस्टल-क्लियर फोटो।',
    category: 'camera',
    popular: true
  },
  {
    id: 'tempered-glass-guard',
    name: 'Premium 9D/11D Tempered Glass Guard',
    hindiName: '9D/11D प्रीमियम टेम्पर्ड ग्लास (एज-टू-एज)',
    iconName: 'Shield',
    minPrice: 149,
    maxPrice: 299,
    estimatedTime: '10 मिनट में परफेक्ट फिटिंग',
    description: 'सुपर टफ 9D/11D कर्व्ड एज स्क्रीन प्रोटेक्टर, स्क्रैच प्रूफ, ओलेओफोबिक एंटी-फिंगरप्रिंट कोटिंग।',
    category: 'protection',
    popular: true
  },
  {
    id: 'deep-clean-service',
    name: 'Full Phone Deep Cleaning & Overhaul Service',
    hindiName: 'फुल सर्विस व डीप क्लीनिंग (अंदर-बाहर डस्ट व थर्मल)',
    iconName: 'Sparkles',
    minPrice: 249,
    maxPrice: 499,
    estimatedTime: '25 मिनट में डीप क्लीन',
    description: 'अल्ट्रासोनिक मदरबोर्ड डस्ट क्लीनिंग, स्पीकर/माइक जाली डी-क्लॉग, चार्जिंग पोर्ट सर्विस व फ्रेश थर्मल पेस्ट।',
    category: 'service',
    popular: true
  },
  {
    id: 'charging-port',
    name: 'Charging Port Loose / Not Charging',
    hindiName: 'चार्जिंग नहीं हो रही / केबल ढीली है',
    iconName: 'Zap',
    minPrice: 499,
    maxPrice: 999,
    estimatedTime: '20 मिनट में रिपेयर',
    description: 'टाइप-सी / लाइटनिंग पोर्ट क्लीनिंग या नया ओरिजिनल जैक रिप्लेसमेंट।',
    category: 'charging'
  },
  {
    id: 'speaker-mic',
    name: 'Speaker / Mic / Earpiece Audio Issue',
    hindiName: 'माइक / स्पीकर / आवाज़ नहीं आ रही',
    iconName: 'Volume2',
    minPrice: 399,
    maxPrice: 899,
    estimatedTime: '25 मिनट में रिपेयर',
    description: 'कॉल पर आवाज़ न जाना या रिंगटोन/म्यूजिक न बजना - ओरिजिनल माइक व लाउडस्पीकर रिपेयर।',
    category: 'audio'
  },
  {
    id: 'camera-broken',
    name: 'Camera Sensor Blurry / Shaking Failure',
    hindiName: 'कैमरा सेंसर ब्लर / फोकस खराबी',
    iconName: 'Camera',
    minPrice: 699,
    maxPrice: 1899,
    estimatedTime: '30 मिनट में रिपेयर',
    description: 'ओआईएस कैमरा स्टेबलाइजेशन व इंटरनल कैमरा मॉड्यूल रिप्लेसमेंट।',
    category: 'camera'
  },
  {
    id: 'heating-issue',
    name: 'Phone Overheating & Freezing',
    hindiName: 'फोन बहुत ज्यादा हीट (गर्म) हो रहा है',
    iconName: 'Flame',
    minPrice: 499,
    maxPrice: 1199,
    estimatedTime: '35 मिनट में डायग्नोस्टिक',
    description: 'थर्मल पेस्ट क्लीनिंग, आईसी वोल्टेज चेक और बैकग्राउंड बैटरी ड्रेन फिक्स।',
    popular: true,
    category: 'board'
  },
  {
    id: 'hanging-lag',
    name: 'Phone Hanging / Slow Lagging',
    hindiName: 'फोन हैंग / अटक कर चल रहा है',
    iconName: 'Cpu',
    minPrice: 399,
    maxPrice: 899,
    estimatedTime: '30 मिनट में सर्विस',
    description: 'सॉफ्टवेयर फ्लैशिंग, रैम कैश ऑप्टिमाइज़ेशन और जंक क्लीनअप।',
    popular: true,
    category: 'board'
  },
  {
    id: 'network-wifi',
    name: 'Network / SIM / WiFi / Bluetooth Problem',
    hindiName: 'नेटवर्क नहीं आ रहा / नो-सर्विस / वाई-फाई प्रॉब्लम',
    iconName: 'Wifi',
    minPrice: 599,
    maxPrice: 1499,
    estimatedTime: '35 मिनट में रिपेयर',
    description: 'सिम ट्रे जैक, बेस-बैंड आईसी या एंटीना स्ट्रिप रिपेयर।',
    category: 'network'
  },
  {
    id: 'water-damage',
    name: 'Water Splash / Liquid Damage',
    hindiName: 'पानी में गिरा फोन / लिक्विड डैमेज',
    iconName: 'Droplets',
    minPrice: 799,
    maxPrice: 2200,
    estimatedTime: 'सेंट्रल क्लीनरूम लैब टेस्ट',
    description: 'अल्ट्रासोनिक मदरबोर्ड डी-ऑक्सीडेशन और शॉर्ट सर्किट प्रोटेक्शन चेक।',
    category: 'board'
  },
  {
    id: 'motherboard-chipset',
    name: 'Motherboard IC Level / Dead Phone',
    hindiName: 'मदरबोर्ड आईसी / डेड फोन (सेंट्रल लैब सर्विस)',
    iconName: 'Cpu',
    minPrice: 1499,
    maxPrice: 3899,
    estimatedTime: '2 से 4 घंटे (सेंट्रल लैब)',
    description: 'रिंग रोड सेंट्रल सुपर लैब में BGA मशीन द्वारा माइक्रो-सोल्डरिंग व चिपसेट रिपेयर।',
    popular: true,
    category: 'board'
  },
  {
    id: 'unidentified-sudden-dead',
    name: 'Unknown Fault / Sudden Dead / Check Yourself',
    hindiName: '⚠️ पता नहीं क्या हुआ / अचानक बंद हो गया (फुल डायग्नोस्टिक जांच)',
    iconName: 'AlertTriangle',
    minPrice: 199,
    maxPrice: 1499,
    estimatedTime: 'लैब डीप डायग्नोस्टिक (30-60 मिनट)',
    description: 'ग्राहक को नहीं पता या अचानक बंद हुआ। सख्त एंटी-फ्रॉड, प्री-इंस्पेक्शन शॉर्ट सर्किट व वाटर-डैमेज ट्रेसिंग प्रोटोकॉल।',
    popular: true,
    isStrictDiagnostic: true,
    warningNotice: '⚠️ सख्त दुकान व टेक्नीशियन सुरक्षा नियम: कई बार वाटर डैमेज, अनधिकृत छेड़छाड़ या छिपी हुई शॉर्टिंग छुपाकर लाया जाता है। डायग्नोस्टिक से पहले लिखित/डिजिटल स्वीकृति अनिवार्य है। टाइम-पास व फेक कॉल्स से बचने के लिए ₹199 टोकन अनिवार्य है, जो फोन रिपेयर होने पर 100% माफ/एडजस्ट होगा।',
    category: 'diagnostic'
  }
];

export const CONDITION_CRITERIA = {
  flawless: {
    label: 'Flawless (सुपर फ्रेश)',
    description: 'बिल्कुल नया जैसा। कोई स्क्रैच, डेंट या मार्क नहीं। स्क्रीन व बॉडी 100% परफेक्ट।',
    multiplier: 1.0,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-300'
  },
  good: {
    label: 'Good (अच्छा)',
    description: 'हल्के-फुल्के इस्तेमाल के निशान। 1-2 माइनर स्क्रैच हो सकते हैं, कोई डेंट नहीं।',
    multiplier: 0.88,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-300'
  },
  average: {
    label: 'Average (सामान्य)',
    description: 'साफ दिखने वाले स्क्रैच या बॉडी पर छोटा डेंट। फोन के सभी फीचर्स ठीक काम कर रहे हैं।',
    multiplier: 0.72,
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-300'
  },
  damaged: {
    label: 'Damaged (टूटा हुआ)',
    description: 'स्क्रीन में क्रैक/दरार, बॉडी पर भारी डेंट या कोई फंक्शन (जैसे कैमरा/माइक) खराब है।',
    multiplier: 0.45,
    badgeColor: 'bg-orange-50 text-orange-700 border-orange-300'
  },
  dead: {
    label: 'Dead / Scrap (पूरा बंद व डेड फोन)',
    description: 'फोन बिल्कुल ऑन नहीं हो रहा, मदरबोर्ड डेड या पानी में खराब। तय कीमत: ₹600 से ₹1,200 लास्ट (256GB हाई स्टोरेज होने पर ₹1,600 लास्ट)।',
    multiplier: 0.15,
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-300'
  }
};
