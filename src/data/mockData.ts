import {
  Brand,
  PhoneModel,
  SuratLocality,
  P2PListing,
  CustomerReview
} from '../types';
import { COMPREHENSIVE_PHONE_MODELS } from './phonesDatabase';

export const SASTAPHONE_PHONE = '9372802044';
export const SASTAFONE_PHONE = '9372802044';
export const WHATSAPP_NUMBER = '919372802044';
export const DEFAULT_SURAT_LOCALITY = 'Adajan, Surat';

export const BRANDS: Brand[] = [
  { id: 'samsung', name: 'Samsung', logoText: 'Samsung', badgeColor: 'from-slate-800 to-slate-900', popular: true },
  { id: 'motorola', name: 'Motorola', logoText: 'M moto', badgeColor: 'from-slate-800 to-slate-900', popular: true },
  { id: 'vivo', name: 'Vivo', logoText: 'vivo', badgeColor: 'from-slate-800 to-slate-900', popular: true },
  { id: 'oppo', name: 'Oppo', logoText: 'OPPO', badgeColor: 'from-slate-800 to-slate-900', popular: true },
  { id: 'tecno', name: 'Tecno', logoText: 'TECNO', badgeColor: 'from-slate-800 to-slate-900', popular: true },
  { id: 'realme', name: 'Realme', logoText: 'realme', badgeColor: 'from-slate-800 to-slate-900', popular: true },
  { id: 'xiaomi', name: 'Xiaomi (Mi / Redmi)', logoText: 'mi Xiaomi', badgeColor: 'from-slate-800 to-slate-900', popular: true },
  { id: 'oneplus', name: 'OnePlus', logoText: '1+ OnePlus', badgeColor: 'from-red-700 to-red-800', popular: true },
  { id: 'iqoo', name: 'iQOO', logoText: 'iQOO', badgeColor: 'from-slate-800 to-slate-900', popular: true },
  { id: 'poco', name: 'Poco', logoText: 'POCO', badgeColor: 'from-slate-800 to-slate-900', popular: true },
  { id: 'apple', name: 'Apple', logoText: 'Apple', badgeColor: 'from-slate-800 to-slate-900', popular: true },
  { id: 'nothing', name: 'Nothing', logoText: '(N) Nothing', badgeColor: 'from-slate-800 to-slate-900', popular: true },
  { id: 'google', name: 'Google Pixel', logoText: 'G Google', badgeColor: 'from-slate-800 to-slate-900', popular: true },
  { id: 'infinix', name: 'Infinix', logoText: 'Infinix', badgeColor: 'from-slate-800 to-slate-900', popular: true },
  { id: 'lava', name: 'Lava', logoText: 'LAVA', badgeColor: 'from-red-700 to-red-800', popular: true },
  { id: 'cmf', name: 'CMF by Nothing', logoText: 'cmf', badgeColor: 'from-slate-800 to-slate-900', popular: true },
  { id: 'honor', name: 'Honor', logoText: 'HONOR', badgeColor: 'from-slate-800 to-slate-900', popular: true }
];

const EXCLUDED_BRAND_IDS = ['alcatel', 'huawei', 'blackberry', 'asus', 'nubia', 'lg'];

export const PHONE_MODELS: PhoneModel[] = COMPREHENSIVE_PHONE_MODELS.filter(
  (m) => !EXCLUDED_BRAND_IDS.includes(m.brandId)
);

// Empty arrays preserved only for backwards-compatible imports (no mock/demo data)
export const INITIAL_P2P_LISTINGS: P2PListing[] = [];
export const INITIAL_CUSTOMER_REVIEWS: CustomerReview[] = [];

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

export const CONDITION_CRITERIA = {
  flawless: {
    label: 'Flawless (सुपर फ्रेश)',
    description: 'बिल्कुल नया जैसा। कोई स्क्रैच, डेंट या मार्क नहीं। स्क्रीन व बॉडी परफेक्ट।',
    multiplier: 1.0,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-300'
  },
  good: {
    label: 'Good (अच्छा)',
    description: 'हल्के-फुल्के इस्तेमाल के निशान। 1-2 माइनर स्क्रैच हो सकते हैं, कोई डेंट नहीं।',
    multiplier: 0.88,
    badgeColor: 'bg-red-50 text-[#D5151B] border-red-200'
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
