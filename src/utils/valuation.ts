import { CONDITION_CRITERIA, SASTAPHONE_PHONE, WHATSAPP_NUMBER } from '../data/mockData';
import { SellSelection, ValuationQuote } from '../types';

export function calculateValuation(selection: SellSelection): ValuationQuote {
  if (!selection.model) {
    return {
      minPrice: 0,
      maxPrice: 0,
      basePrice: 0,
      conditionDeduction: 0,
      accessoriesBonus: 0,
      videoBonus: 0,
      currency: '₹',
      timestamp: new Date().toISOString()
    };
  }

  // Base price from model
  let basePrice = selection.model.baseValuation;

  // Variant modifier
  if (selection.variant) {
    basePrice += selection.variant.priceModifier;
  }

  // Condition multiplier
  const condition = selection.condition || 'good';
  const conditionInfo = CONDITION_CRITERIA[condition];
  const multiplier = conditionInfo.multiplier;

  // Accessories bonus
  let accessoriesBonus = 0;
  if (selection.hasOriginalBox) accessoriesBonus += 400;
  if (selection.hasValidBill) accessoriesBonus += 600;
  if (selection.hasOriginalCharger) accessoriesBonus += 350;

  // Video verification bonus
  const videoBonus = selection.verifiedVideo ? 300 : 0;

  // Subtotal
  const evaluatedPrice = Math.round((basePrice * multiplier) + accessoriesBonus + videoBonus);
  const conditionDeduction = Math.round(basePrice * (1 - multiplier));

  // Range +- 5% to 8%
  const spread = Math.round(evaluatedPrice * 0.05);
  const minPrice = Math.max(500, evaluatedPrice - spread);
  const maxPrice = evaluatedPrice + spread;

  return {
    basePrice,
    minPrice,
    maxPrice,
    conditionDeduction,
    accessoriesBonus,
    videoBonus,
    currency: '₹',
    timestamp: new Date().toISOString()
  };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

export function generateWhatsAppLink(
  type: 'sell' | 'buy' | 'repair' | 'general',
  details: {
    modelName?: string;
    variant?: string;
    condition?: string;
    quotePrice?: number;
    locality?: string;
    issue?: string;
    phoneName?: string;
  }
): string {
  let message = '';

  if (type === 'sell') {
    message = `नमस्ते Sastaphone Surat टीम! 📱\n\nमैं अपना पुराना फोन बेचना चाहता हूँ:\n` +
      `• फोन: *${details.modelName || 'Mobile'}*\n` +
      `• वेरिएंट: *${details.variant || 'Standard'}*\n` +
      `• कंडीशन: *${details.condition || 'Good'}*\n` +
      `• AI एस्टीमेटेड प्राइस: *${details.quotePrice ? formatINR(details.quotePrice) : '₹---'}*\n` +
      `• सूरत लोकेशन: *${details.locality || 'Surat'}*\n\n` +
      `कृपया सूरत में फ्री होम पिकअप और इंस्टेंट कैश पेमेंट कन्फर्म करें। धन्यवाद!`;
  } else if (type === 'repair') {
    message = `नमस्ते Sastaphone Surat टीम! 🔧\n\nमुझे अपने फोन का डोरस्टेप रिपेयर बुक करना है:\n` +
      `• फोन: *${details.modelName || 'Mobile'}*\n` +
      `• समस्या: *${details.issue || 'General Repair'}*\n` +
      `• होम विज़िट चार्ज: *₹199* (रिपेयर होने पर फाइनल बिल में एडजस्ट, फोन न बनने पर ₹99 रिफंड)\n` +
      `• सूरत लोकेशन: *${details.locality || 'Surat'}*\n\n` +
      `कृपया मेरे पते पर टेक्नीशियन विज़िट स्लॉट कन्फर्म करें।`;
  } else if (type === 'buy') {
    message = `नमस्ते Sastaphone Surat! 🛒\n\nमुझे यह सेकंड-हैंड सर्टिफाइड फोन खरीदना है:\n` +
      `• मॉडल: *${details.phoneName || 'Phone'}*\n` +
      `• प्राइस: *${details.quotePrice ? formatINR(details.quotePrice) : 'Offer Price'}*\n` +
      `• डिलीवरी सूरत: *${details.locality || 'Surat'}*\n\n` +
      `कृपया 6 महीने वारंटी और सूरत फ्री डिलीवरी के साथ ऑर्डर बुक करें।`;
  } else {
    message = `नमस्ते Sastaphone Surat टीम! मुझे फोन बेचने / खरीदने / रिपेयरिंग के बारे में जानकारी चाहिए।`;
  }

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
