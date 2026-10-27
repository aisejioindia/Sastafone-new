export type Language = 'hi' | 'en';

export type ServiceType = 'sell' | 'buy' | 'repair' | 'pass';

export type PaymentTierType = 'appointment_199' | 'basic_99' | 'pro_299' | 'seller_pro_799';

export interface PaymentRequest {
  type: PaymentTierType;
  title: string;
  titleHindi: string;
  amount: number;
  description: string;
  descriptionHindi: string;
  benefits?: string[];
  refundNote?: string;
  targetListingId?: string;
  targetListingTitle?: string;
  targetSellerName?: string;
  repairDetails?: {
    modelName: string;
    issueName: string;
    locality?: string;
    address?: string;
    timeSlot?: string;
    customerName?: string;
    customerPhone?: string;
  };
}

export type ConditionGrade = 'flawless' | 'good' | 'average' | 'damaged' | 'dead';

export interface Brand {
  id: string;
  name: string;
  logoText: string;
  badgeColor: string;
  popular?: boolean;
}

export interface PhoneVariant {
  storage: string;
  ram?: string;
  priceModifier: number; // percentage modifier or fixed offset
}

export interface PhoneModel {
  id: string;
  brandId: string;
  name: string;
  baseValuation: number; // Base buyback price for good condition
  imageUrl: string;
  variants: PhoneVariant[];
  colors: { name: string; hex: string }[];
  category: 'flagship' | 'midrange' | 'budget';
  popular?: boolean;
  specScore?: number; // 91mobiles Spec Score (e.g. 98, 97, 95, 88)
  processor?: string;
  display?: string;
  camera?: string;
  battery?: string;
  is5G?: boolean;
  isAi?: boolean;
}

export interface RefurbishedPhone {
  id: string;
  brand: string;
  name: string;
  variant: string;
  color: string;
  grade: 'Like New (सुपर फ्रेश)' | 'Superb (शानदार)' | 'Good (अच्छा)';
  originalPrice: number;
  offerPrice: number;
  discountPct: number;
  imageUrl: string;
  batteryHealth: number; // e.g. 92%
  warrantyMonths: number;
  keySpecs: string[];
  stockCount: number;
  isDiwaliDhamaka?: boolean;
}

export interface RepairIssue {
  id: string;
  name: string;
  hindiName: string;
  iconName: string;
  minPrice: number;
  maxPrice: number;
  estimatedTime: string;
  description: string;
  popular?: boolean;
}

export interface SuratLocality {
  id: string;
  name: string;
  hindiName: string;
  pincode: string;
  zone: 'West' | 'South' | 'North' | 'East' | 'Central';
  isPopular?: boolean;
}

export interface SellSelection {
  brand?: Brand;
  model?: PhoneModel;
  variant?: PhoneVariant;
  color?: { name: string; hex: string };
  condition?: ConditionGrade;
  hasOriginalBox: boolean;
  hasOriginalCharger: boolean;
  hasValidBill: boolean;
  screenCondition: 'flawless' | 'minor_scratches' | 'cracked';
  bodyCondition: 'flawless' | 'minor_dents' | 'bent_heavy_scratches';
  functionalIssues: string[];
  verifiedVideo?: {
    fileUrl?: string;
    videoName?: string;
    verifiedAt: string;
    score: number;
  };
}

export interface ValuationQuote {
  minPrice: number;
  maxPrice: number;
  basePrice: number;
  conditionDeduction: number;
  accessoriesBonus: number;
  videoBonus: number;
  currency: string;
  timestamp: string;
}

export interface OrderItem {
  id: string;
  orderNumber: string;
  type: ServiceType;
  title: string;
  subtitle: string;
  amount: number;
  status: 'booked' | 'technician_assigned' | 'in_inspection' | 'completed' | 'cancelled';
  statusHindi: string;
  locality: string;
  fullAddress: string;
  customerName: string;
  customerPhone: string;
  date: string;
  timeSlot: string;
  technicianName?: string;
  technicianPhone?: string;
  videoUploaded?: boolean;
  visitCharge?: number;
  paymentMethod?: string;
  paymentStatus?: 'paid' | 'pay_on_visit';
  refundPolicyNote?: string;
}

export interface ChatMessage {
  id: string;
  listingId: string;
  sender: 'buyer' | 'seller';
  text: string;
  timestamp: string;
  isQuickOption?: boolean;
}

export interface UserProfile {
  name: string;
  phone: string;
  email?: string;
  locality: string;
  address: string;
  isLoggedIn: boolean;
  avatarUrl?: string;
  authProvider?: 'google' | 'phone';
  activePlan?: 'none' | 'single_99' | 'pro_799';
  postsRemaining?: number;
  sellerPostCredits?: number;
  buyerCredits?: number;
  buyerPlan?: 'none' | 'basic_99' | 'pro_299';
}

export interface P2PListing {
  id: string;
  sellerName: string;
  sellerPhone: string; // Real full phone number
  maskedPhone: string; // e.g. "98250 •••••"
  brand: string;
  modelName: string;
  variant: string;
  price: number;
  condition: string;
  highlights: string[];
  description: string;
  images: string[]; // up to 6 verified images
  locality: string;
  date: string;
  planType: 'single_99' | 'pro_799';
  isPro?: boolean;
  viewsCount: number;
}

export interface BrandServiceCenter {
  id: string;
  brandName: string;
  centerName: string;
  address: string;
  area: string;
  pincode: string;
  phone: string;
  timings: string;
  rating: number;
  googleMapQuery: string;
  verifiedOfficial: boolean;
}

export interface RepairSuperLab {
  id: string;
  name: string;
  tagline: string;
  area: string;
  fullAddress: string;
  equipment: string[];
  cctvProtected: boolean;
  isoCertified: boolean;
  technicianLead: string;
  phone: string;
  averageTime: string;
}

export interface CustomerRepairReview {
  id: string;
  customerName: string;
  locality: string;
  phoneModel: string;
  issueFixed: string;
  rating: number;
  comment: string;
  date: string;
  verifiedRepair: boolean;
}

export interface CustomerReview {
  id: string;
  customerName: string;
  customerPhone?: string;
  locality: string;
  serviceType: 'repair' | 'sell' | 'buy' | 'pass';
  phoneModel: string;
  serviceDetail: string; // e.g. "Screen Replacement in 30 Mins", "Instant ₹32,400 Bank Transfer", "Bought Certified iPhone 14"
  rating: number; // 1 to 5
  reviewText: string;
  date: string;
  verified: boolean;
  orderNumber?: string;
  likesCount: number;
  likedByMe?: boolean;
}

