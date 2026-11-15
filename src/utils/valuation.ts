import { CONDITION_CRITERIA, SASTAPHONE_PHONE, WHATSAPP_NUMBER } from '../data/mockData';
import { ConditionGrade, SellSelection, ValuationQuote } from '../types';

export interface AIPredictionInput {
  category: 'budget' | 'midrange' | 'flagship';
  condition: ConditionGrade;
  storage?: string;
  is5G?: boolean;
  hasBox?: boolean;
  hasBill?: boolean;
  hasCharger?: boolean;
  modelName?: string;
}

export interface AIPredictionOutput {
  category: 'budget' | 'midrange' | 'flagship';
  categoryLabel: string;
  categoryLabelHindi: string;
  baseAnchor: number;
  minPrice: number;
  maxPrice: number;
  predictedAverage: number;
  potentialSpotHike: number;
  estimatedSuratResale: number;
  marginBuffer: number;
  confidenceScore: number;
  demandTrend: string;
  rationaleHindi: string;
}

/**
 * AI Price Prediction for Smartphones based on:
 * - Budget smartphone: ~₹5,000 base anchor (buyback ~₹3,500 - ₹5,800)
 * - Mid-range smartphone: ~₹8,000 base anchor (buyback ~₹6,500 - ₹9,600)
 * - Flagship smartphone: ~₹15,000 base anchor (buyback ~₹12,500 - ₹18,500+)
 * Protects refurbishment & warranty margins while providing doorstep spot bonus hike.
 */
export function predictSmartphonePrice(input: AIPredictionInput): AIPredictionOutput {
  const { category, condition, storage, is5G, hasBox, hasBill, hasCharger } = input;

  // 1. Base Anchor as instructed: 5k budget, 8k mid-range, 15k high-end/flagship
  let baseAnchor = 8000;
  let categoryLabel = 'Mid-Range Smartphone';
  let categoryLabelHindi = 'मिड-रेंज स्मार्टफोन (बेस ~₹8,000)';
  let estimatedSuratResale = 13500;
  let potentialSpotHike = 1200;
  let marginBuffer = 4500;
  let demandTrend = '🔥 सूरत में सर्वाधिक मांग (High Demand)';

  if (category === 'budget') {
    baseAnchor = 5000;
    categoryLabel = 'Budget Smartphone';
    categoryLabelHindi = 'बजट स्मार्टफोन (बेस ~₹5,000)';
    estimatedSuratResale = 8500;
    potentialSpotHike = 600;
    marginBuffer = 3000;
    demandTrend = '⚡ भारी मांग (Quick Turnaround)';
  } else if (category === 'flagship') {
    baseAnchor = 15000;
    categoryLabel = 'High-End / Flagship Smartphone';
    categoryLabelHindi = 'हाई-एंड फ्लैगशिप स्मार्टफोन (बेस ~₹15,000)';
    estimatedSuratResale = 24000;
    potentialSpotHike = 2500;
    marginBuffer = 7500;
    demandTrend = '💎 प्रीमियम रीसेल वैल्यू (Premium Demand)';
  }

  // Dead smartphone special override
  if (condition === 'dead') {
    const isHighStorage = Boolean(
      storage?.includes('256') || storage?.includes('512') || storage?.includes('1 TB') || storage?.includes('1TB')
    );
    const minPrice = isHighStorage ? 1200 : 600;
    const maxPrice = isHighStorage ? 1600 : 1200;
    return {
      category,
      categoryLabel,
      categoryLabelHindi,
      baseAnchor,
      minPrice,
      maxPrice,
      predictedAverage: Math.round((minPrice + maxPrice) / 2),
      potentialSpotHike: isHighStorage ? 200 : 100,
      estimatedSuratResale: isHighStorage ? 3200 : 2200,
      marginBuffer: 1200,
      confidenceScore: 98,
      demandTrend: '♻️ पार्ट्स व स्क्रैप रिकवरी',
      rationaleHindi: isHighStorage
        ? '256GB+ डेड स्मार्टफोन के लिए ₹1,600 लास्ट नकद भुगतान व पार्ट्स रिकवरी।'
        : 'डेड स्मार्टफोन (ऑन न होने वाला) के लिए ₹600 - ₹1,200 मौके पर नकद भुगतान।'
    };
  }

  // Condition multiplier
  const conditionInfo = CONDITION_CRITERIA[condition as keyof typeof CONDITION_CRITERIA] || CONDITION_CRITERIA.good;
  let multiplier = conditionInfo.multiplier;

  // Storage bonus
  let storageOffset = 0;
  if (storage?.includes('256')) {
    storageOffset += category === 'flagship' ? 1200 : category === 'midrange' ? 700 : 400;
  } else if (storage?.includes('512') || storage?.includes('1 TB') || storage?.includes('1TB')) {
    storageOffset += category === 'flagship' ? 2400 : 1200;
  }

  // 5G Network bonus
  const networkOffset = is5G ? (category === 'budget' ? 400 : 600) : 0;

  // Accessories bonus
  let accBonus = 0;
  if (hasBox) accBonus += 250;
  if (hasBill) accBonus += 450;
  if (hasCharger) accBonus += 200;

  // Calculate predicted purchase target
  const rawTarget = (baseAnchor * multiplier) + storageOffset + networkOffset + accBonus;
  const spread = Math.round(rawTarget * 0.05);
  const minPrice = Math.max(800, rawTarget - spread);
  const maxPrice = rawTarget + spread;
  const predictedAverage = Math.round((minPrice + maxPrice) / 2);

  // Confidence Score (94-98%)
  const confidenceScore = condition === 'flawless' || condition === 'good' ? 97 : 94;

  const rationaleHindi = `सूरत मार्केट में सुरक्षित रीसेल व 6-माह वारंटी मार्जिन (~₹${marginBuffer.toLocaleString('en-IN')}) सुरक्षित रखते हुए सर्वोत्तम नकद भाव।`;

  return {
    category,
    categoryLabel,
    categoryLabelHindi,
    baseAnchor,
    minPrice,
    maxPrice,
    predictedAverage,
    potentialSpotHike,
    estimatedSuratResale,
    marginBuffer,
    confidenceScore,
    demandTrend,
    rationaleHindi
  };
}

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

  // Special Dead Smartphone Pricing Rules (Smartphones only):
  // Normal dead/pura band smartphone: ₹600 to ₹1,200 last
  // High storage (256GB or higher): ₹1,600 last
  if (condition === 'dead') {
    const isHighStorage = Boolean(
      selection.variant?.storage.includes('256') ||
      selection.variant?.storage.includes('512') ||
      selection.variant?.storage.includes('1 TB') ||
      selection.variant?.storage.includes('1TB') ||
      selection.customDetails?.storage?.includes('256') ||
      selection.customDetails?.storage?.includes('512')
    );

    const deadMin = isHighStorage ? 1200 : 600;
    const deadMax = isHighStorage ? 1600 : 1200;
    let evaluatedPrice = isHighStorage ? 1400 : 900;

    let accessoriesBonus = 0;
    if (selection.hasOriginalBox) accessoriesBonus += 100;
    if (selection.hasValidBill) accessoriesBonus += 150;
    if (selection.hasOriginalCharger) accessoriesBonus += 100;
    const videoBonus = selection.verifiedVideo ? 150 : 0;

    evaluatedPrice = Math.min(deadMax, evaluatedPrice + accessoriesBonus + videoBonus);

    return {
      basePrice,
      minPrice: deadMin,
      maxPrice: deadMax,
      conditionDeduction: Math.max(0, basePrice - deadMax),
      accessoriesBonus,
      videoBonus,
      potentialSpotHike: isHighStorage ? 200 : 100,
      currency: '₹',
      timestamp: new Date().toISOString()
    };
  }

  // Margin Protection Strategy for Sastafone:
  // When purchasing from customers, we deduct costs for reconditioning, testing, 6-month warranty & profit:
  // Budget models: ~₹5,000 baseline target buy-in
  // Midrange models: ~₹8,000 baseline target buy-in
  // Flagship models: ~₹15,000 baseline target buy-in
  const category = selection.model.category || 'midrange';
  let marginBuffer = 5000;
  let potentialSpotHike = 800;

  if (category === 'budget') {
    marginBuffer = Math.min(basePrice * 0.38, 4800);
    potentialSpotHike = 600;
  } else if (category === 'midrange') {
    marginBuffer = Math.min(basePrice * 0.35, 8200);
    potentialSpotHike = 1200;
  } else if (category === 'flagship') {
    marginBuffer = Math.min(basePrice * 0.30, 16000);
    potentialSpotHike = 2500;
  }

  // Condition multiplier applied
  const multiplier = conditionInfo.multiplier;

  // Accessories bonus
  let accessoriesBonus = 0;
  if (selection.hasOriginalBox) accessoriesBonus += 300;
  if (selection.hasValidBill) accessoriesBonus += 500;
  if (selection.hasOriginalCharger) accessoriesBonus += 250;

  // Video verification bonus
  const videoBonus = selection.verifiedVideo ? 300 : 0;

  // Baseline purchase price after safe margin
  const adjustedBase = Math.max(1200, basePrice - marginBuffer);
  const evaluatedPrice = Math.round((adjustedBase * multiplier) + accessoriesBonus + videoBonus);
  const conditionDeduction = Math.round(basePrice - evaluatedPrice);

  // Range +- 4%
  const spread = Math.round(evaluatedPrice * 0.04);
  const minPrice = Math.max(800, evaluatedPrice - spread);
  const maxPrice = evaluatedPrice + spread;

  return {
    basePrice,
    minPrice,
    maxPrice,
    conditionDeduction: Math.max(0, conditionDeduction),
    accessoriesBonus,
    videoBonus,
    potentialSpotHike,
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
  typeOrCustomText: string,
  details?: {
    modelName?: string;
    variant?: string;
    condition?: string;
    quotePrice?: number;
    locality?: string;
    issue?: string;
    phoneName?: string;
  }
): string {
  if (!details || !['sell', 'buy', 'repair', 'general'].includes(typeOrCustomText)) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(typeOrCustomText)}`;
  }

  let message = '';
  const type = typeOrCustomText;

  if (type === 'sell') {
    message = `नमस्ते Sastafone Surat टीम! 📱\n\nमैं अपना पुराना फोन बेचना चाहता हूँ:\n` +
      `• फोन: *${details.modelName || 'Mobile'}*\n` +
      `• वेरिएंट: *${details.variant || 'Standard'}*\n` +
      `• कंडीशन: *${details.condition || 'Good'}*\n` +
      `• AI एस्टीमेटेड प्राइस: *${details.quotePrice ? formatINR(details.quotePrice) : '₹---'}*\n` +
      `• सूरत लोकेशन: *${details.locality || 'Surat'}*\n\n` +
      `कृपया सूरत में फ्री होम पिकअप और इंस्टेंट कैश पेमेंट कन्फर्म करें। धन्यवाद!`;
  } else if (type === 'repair') {
    message = `नमस्ते Sastafone Surat टीम! 🔧\n\nमुझे अपने फोन का डोरस्टेप रिपेयर बुक करना है:\n` +
      `• फोन: *${details.modelName || 'Mobile'}*\n` +
      `• समस्या: *${details.issue || 'General Repair'}*\n` +
      `• होम विज़िट चार्ज: *₹199* (रिपेयर होने पर फाइनल बिल में एडजस्ट, फोन न बनने पर ₹99 रिफंड)\n` +
      `• सूरत लोकेशन: *${details.locality || 'Surat'}*\n\n` +
      `कृपया मेरे पते पर टेक्नीशियन विज़िट स्लॉट कन्फर्म करें।`;
  } else if (type === 'buy') {
    message = `नमस्ते Sastafone Surat! 🛒\n\nमुझे यह सेकंड-हैंड सर्टिफाइड फोन खरीदना है:\n` +
      `• मॉडल: *${details.phoneName || 'Phone'}*\n` +
      `• प्राइस: *${details.quotePrice ? formatINR(details.quotePrice) : 'Offer Price'}*\n` +
      `• डिलीवरी सूरत: *${details.locality || 'Surat'}*\n\n` +
      `कृपया 6 महीने वारंटी और सूरत फ्री डिलीवरी के साथ ऑर्डर बुक करें।`;
  } else {
    message = `नमस्ते Sastafone Surat टीम! मुझे फोन बेचने / खरीदने / रिपेयरिंग के बारे में जानकारी चाहिए।`;
  }

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
