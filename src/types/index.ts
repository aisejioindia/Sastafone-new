export type Language = 'hi' | 'en';

export type ServiceType = 'sell' | 'buy' | 'repair' | 'pass' | 'bazaar';

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
  isStrictDiagnostic?: boolean;
  warningNotice?: string;
  category?: 'screen' | 'battery' | 'audio' | 'board' | 'charging' | 'camera' | 'body' | 'network' | 'diagnostic' | 'combo' | 'protection' | 'service';
  isMakeoverCombo?: boolean;
  comboItems?: string[];
  originalSeparateTotal?: { min: number; max: number };
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
  isCustomModel?: boolean;
  customDetails?: {
    modelName: string;
    brandName?: string;
    ram?: string;
    storage?: string;
    is5G?: boolean;
    color?: string;
    condition?: ConditionGrade;
    expectedPrice?: number;
    notes?: string;
  };
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
  potentialSpotHike?: number;
  currency: string;
  timestamp: string;
}

export type OrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'booked' | 'technician_assigned' | 'in_inspection';

export interface OrderItem {
  id: string;
  orderNumber: string;
  type: ServiceType;
  title: string;
  subtitle: string;
  amount: number;
  status: OrderStatus;
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
  // Admin & Pro-Audit Additions
  finalQuoteAmount?: number;
  originalEstimateMin?: number;
  originalEstimateMax?: number;
  discountOfferedPct?: number;
  adminNotes?: string;
  internalNotes?: string;
  adminApprovedAt?: string;
  paymentQrGenerated?: boolean;
  paymentCollected?: boolean;
  phoneHandedOver?: boolean;
  proAudit?: ProAuditVerification;
  // Customer requirement, phone photos, doubts & invoice return
  customerRequirement?: string;
  customerDoubtResolved?: string;
  phonePhotos?: string[];
  repairProblems?: string[];
  invoiceSentToCustomer?: boolean;
  invoiceNumber?: string;
  customOfferNote?: string;
  cloudSyncStatus?: 'synced' | 'local';
  // Custom Phone Model, Bill Upload & Anti-Theft Verification
  customModelDetails?: {
    brand: string;
    model: string;
    ram?: string;
    storage?: string;
    is5G?: boolean;
    color?: string;
    condition?: string;
    baseValuation?: number;
  };
  selectedProblemsList?: {
    id: string;
    name: string;
    hindiName: string;
    minPrice: number;
    maxPrice: number;
    category?: string;
  }[];
  billPhotoUrl?: string;
  ownershipDeclared?: boolean;
  antiTheftVerified?: boolean;
  imeiNumber?: string;
  advanceTokenAmount?: number;
  gpsLocation?: {
    latitude: number;
    longitude: number;
    accuracyMeters?: number;
    mapsLink?: string;
    capturedAt?: string;
  };
  landmark?: string;
  pincode?: string;
  onlinePaymentUtr?: string;
  repairChecklist?: {
    screenWorking: boolean;
    touchDigitizerPassed: boolean;
    batteryChargingOk: boolean;
    batteryHealthPct: number;
    camerasPassed: boolean;
    audioMicSpeakerOk: boolean;
    networkWifiBtOk: boolean;
    lciWaterDamageFree: boolean;
    bodyAndScrewsIntact: boolean;
    buttonsBiometricsOk: boolean;
    replacedParts?: string[];
    partsReplacedList?: string[];
    technicianName: string;
    qualityScorePercent: number;
    qcPassPct?: number;
    jobStatus: 'in_progress' | 'qc_passed' | 'ready_for_handover';
    status?: 'in_progress' | 'qc_passed' | 'ready_for_handover';
    technicianNotes: string;
    completedAt?: string;
  };
}

export interface ProAuditVerification {
  imei: string;
  imeiMatched: boolean;
  touchSensitivity: 'passed' | 'failed' | 'tested';
  screenDisplayCheck: 'flawless' | 'minor_scratches' | 'replaced_tested' | 'dead_pixels';
  frontCameraCheck: boolean;
  rearCameraCheck: boolean;
  cameraAutofocusCheck: boolean;
  micEarpieceCheck: boolean;
  loudspeakerCheck: boolean;
  proximitySensorCheck: boolean;
  biometricsCheck: boolean;
  chargingCurrentDrawAmps?: number;
  batteryHealthPct?: number;
  lciWaterMarkerStatus: 'dry_white_ok' | 'red_liquid_contact' | 'repaired';
  technicianNotes?: string;
  auditPassed: boolean;
  auditTimestamp: string;
  auditorName: string;
  // Extended intake & requirement checklist fields
  auditType?: 'repair' | 'sell' | 'buy';
  screwSealIntact?: boolean;
  bodyConditionCheck?: 'flawless' | 'minor_scratches' | 'dents' | 'bent';
  wifiBluetoothCheck?: boolean;
  networkSimCheck?: boolean;
  buttonsCheck?: boolean;
  boxChargerVerified?: boolean;
  ceirAntiTheftVerified?: boolean;
  oemDisplayVerified?: boolean;
  qcHologramSealAttached?: boolean;
  ultrasonicCleaned?: boolean;
  selectedServices?: { name: string; price: number; category?: string }[];
  warrantyMonths?: number;
  warrantyType?: string;
  whatsappMessageSentAt?: string;
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
  landmark?: string;
  pincode?: string;
  gpsLocation?: {
    latitude: number;
    longitude: number;
    accuracyMeters?: number;
    mapsLink?: string;
  };
  isLoggedIn: boolean;
  avatarUrl?: string;
  authProvider?: 'google' | 'phone';
  activePlan?: 'none' | 'single_99' | 'pro_799';
  postsRemaining?: number;
  sellerPostCredits?: number;
  buyerCredits?: number;
  buyerPlan?: 'none' | 'basic_99' | 'pro_299';
  role?: 'customer' | 'admin' | 'technician';
  isAdmin?: boolean;
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
  serviceType: ServiceType;
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

