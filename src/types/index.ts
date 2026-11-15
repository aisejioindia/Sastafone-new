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
  imei?: string;
  invoiceServices?: { name: string; price: number }[];
  invoiceParts?: { name: string; cost: number }[];
  subtotalAmount?: number;
  discountAmount?: number;
  discountPct?: number;
  discountReason?: string;
  visitFeeAdjusted?: number;
  gstEnabled?: boolean;
  gstPct?: number;
  gstAmount?: number;
  gstin?: string;
  warrantyMonths?: number;
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
  uid?: string;
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
  role?: 'customer' | 'admin' | 'partner' | 'technician';
  isAdmin?: boolean;
  isPartner?: boolean;
  partnerId?: string | null;
  emailVerified?: boolean;
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

// -------------------------------------------------------------
// Phase 1 Sastafone Pickup & Delivery Repair Service Models
// -------------------------------------------------------------

export type UserRole = 'customer' | 'admin' | 'partner';

export interface FirestoreUser {
  uid: string;
  name: string;
  phone: string;
  role: UserRole;
  partnerId?: string | null;
  email?: string;
  address?: string;
  locality?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RepairPrice {
  id: string;
  name_hi: string;
  description_hi: string;
  minPrice: number;
  maxPrice: number;
  serviceMinutes: number;
  warrantyMonths: number;
  active: boolean;
  sortOrder: number;
  category?: string;
  iconName?: string;
  isCombo?: boolean;
  comboItems?: string[];
}

export interface Partner {
  id: string;
  name: string;
  area: string;
  phone: string;
  email?: string;
  uid?: string;
  rateCard: Record<string, number>; // problemId -> partner technician payout
  advanceBalance: number;
  lowBalanceThreshold?: number;
  rating: number;
  active: boolean;
  jobsCompleted?: number;
  avgTurnaroundMinutes?: number;
  overdueCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Slot {
  id: string;
  date: string; // YYYY-MM-DD or DD Mon YYYY
  window: string; // e.g. "10:00 AM - 01:00 PM", "02:00 PM - 05:00 PM", "05:00 PM - 08:00 PM"
  area: string; // Surat Locality, e.g. "Adajan", "Vesu", "All Surat"
  capacity: number; // e.g. 5
  booked: number; // e.g. 2
}

export type JobStatus =
  | 'Booked'
  | 'Pickup scheduled'
  | 'Picked up'
  | 'Quote approved'
  | 'In repair'
  | 'Ready'
  | 'Delivered'
  | 'Cancelled'
  | 'Declined';

export interface QCCheckItem {
  status: 'OK' | 'Issue' | 'NA';
  note: string;
}

export interface JobQC {
  checklist: Record<string, QCCheckItem>;
  imei: string;
  billPhotoUrl: string;
  conditionPhotoUrls: string[];
  idPhotoUrl?: string;
  notes?: string;
  conductedAt?: string;
  conductedBy?: string;
  discountPct?: number;
  discountReason?: string;
  suggestedFinalPrice?: number;
  servicesBreakdown?: {
    serviceId: string;
    name: string;
    price: number;
  }[];
}

export interface Job {
  jobId: string;
  userId: string;
  name: string;
  phone: string;
  address: string;
  area: string;
  brand: string;
  model: string;
  services: string[]; // List of repairPrice names or IDs
  serviceDetails?: RepairPrice[];
  estMin: number;
  estMax: number;
  estMinutes: number;
  pickupSlot: {
    date: string;
    window: string;
    area: string;
  };
  status: JobStatus;
  statusHistory: {
    status: JobStatus | string;
    timestamp: string;
    note?: string;
  }[];
  qc?: JobQC;
  finalServices?: string[];
  finalPrice?: number;
  customerApproved: boolean;
  approvedAt?: string;
  visitFeePaid: boolean;
  razorpayPaymentId?: string;
  partnerId?: string;
  pickupCost: number; // e.g. 70 standard Surat pickup & delivery logistics cost
  paymentStatus?: 'paid' | 'pending' | 'refunded' | 'partially_refunded';
  refundAmount?: number;
  refundReason?: string;
  refundedAt?: string;
  discountPct?: number;
  discountReason?: string;
  referralDiscountApplied?: number;
  internalNotes?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  partnerFindings?: PartnerSubmission;
  warrantyMonths?: number;
  customerReviewId?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt?: string;
  deviceNotes?: string;
}

// -------------------------------------------------------------
// Phase 2 Sastafone Data Models (Sell, Buy, Ledger, Invoice, Reviews)
// -------------------------------------------------------------

export interface SellRate {
  id: string;
  brand: string;
  model: string;
  storage: string;
  flawlessPriceMin: number;
  flawlessPriceMax: number;
  goodPriceMin: number;
  goodPriceMax: number;
  averagePriceMin: number;
  averagePriceMax: number;
  deadPriceMin: number;
  deadPriceMax: number;
  updatedAt?: string;
}

export type SellRequestStatus =
  | 'Submitted'
  | 'Pickup scheduled'
  | 'Inspected'
  | 'Offer accepted'
  | 'Offer declined'
  | 'Purchased'
  | 'Moved to inventory'
  | 'Cancelled';

export interface SellRequest {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  area: string;
  brand: string;
  model: string;
  storage: string;
  age: string; // e.g. "under_6_months", "6_to_12_months", "1_to_2_years", "above_2_years"
  isDeadPhone?: boolean;
  conditionChecklist: {
    screenWorking: boolean;
    touchWorking: boolean;
    bodyScratches: 'none' | 'minor' | 'heavy' | 'dented';
    batteryHealth: string; // "above_85", "75_85", "below_75"
    cameraWorking: boolean;
    buttonsWorking: boolean;
    speakerMicWorking: boolean;
    faceTouchIdWorking: boolean;
  };
  conditionPhotos: string[];
  imei?: string;
  billPhotoUrl?: string;
  idPhotoUrl?: string;
  pickupSlot: {
    date: string;
    window: string;
    area: string;
  };
  estMin: number;
  estMax: number;
  finalOffer?: number;
  offerNote?: string;
  partnerId?: string;
  paymentMethod?: 'UPI' | 'Bank Transfer' | 'Cash';
  paymentRef?: string;
  payoutRecorded?: boolean;
  movedToInventory?: boolean;
  status: SellRequestStatus;
  statusHistory: {
    status: SellRequestStatus;
    timestamp: string;
    note?: string;
  }[];
  createdAt: string;
  updatedAt?: string;
}

export interface InventoryPhone {
  id: string;
  slug: string;
  brand: string;
  model: string;
  storage: string;
  colour: string;
  grade: 'A+ Like New' | 'A Excellent' | 'B Good';
  batteryHealth: number; // e.g. 92
  imei: string; // Private, admin only
  photos: string[];
  price: number;
  tokenAmount: number; // usually ₹499
  warrantyMonths: number; // usually 6
  status: 'available' | 'booked' | 'sold';
  specs?: {
    ram?: string;
    display?: string;
    camera?: string;
    processor?: string;
  };
  description?: string;
  bookedBy?: {
    userId: string;
    name: string;
    phone: string;
    address: string;
    area: string;
    razorpayPaymentId?: string;
    bookedAt: string;
  };
  balancePaid?: boolean;
  invoiceId?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string; // SST-YYYYMM-XXXX
  userId?: string;
  jobId?: string;
  inventoryId?: string;
  type: 'repair' | 'refurbished_sale';
  status?: 'active' | 'voided';
  voidReason?: string;
  voidedAt?: string;
  voidedBy?: string;
  replacesInvoiceId?: string;
  reissuedInvoiceId?: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  area: string;
  brand: string;
  model: string;
  imei: string;
  services: {
    name: string;
    price: number;
  }[];
  parts?: {
    name: string;
    cost: number;
  }[];
  partsCost: number;
  subtotal: number;
  discountPct?: number;
  discountAmount: number;
  discountReason?: string;
  visitFeeAdjusted: number; // ₹199
  gstEnabled?: boolean;
  gstPct?: number;
  gstAmount?: number;
  gstin?: string;
  finalTotal: number;
  paymentStatus?: 'paid' | 'pending' | 'refunded';
  paymentMethod: string;
  razorpayPaymentId?: string;
  warrantyMonths: number; // 6 if finalTotal >= 1000
  warrantyExpiry: string;
  warrantyTerms: string;
  createdAt: string;
  updatedAt?: string;
}

export interface WarrantyClaim {
  id: string;
  invoiceNumber: string;
  customerPhone: string;
  customerName: string;
  jobId?: string;
  brand: string;
  model: string;
  issueDescription: string;
  status: 'Received' | 'Technician assigned' | 'In inspection' | 'Resolved' | 'Rejected';
  linkedRepairJobId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PartnerLedgerEntry {
  id: string;
  partnerId: string;
  partnerName: string;
  type: 'advance_topup' | 'job_deduction' | 'incentive' | 'penalty';
  amount: number;
  jobId?: string;
  balanceBefore: number;
  balanceAfter: number;
  notes: string;
  timestamp: string;
}

export interface JobHandoverRecord {
  id: string;
  jobId: string;
  partnerId: string;
  partnerName: string;
  sealedBagId: string;
  imei: string;
  handoverPhotos: string[];
  handoverTime: string;
  deliveryDeadline: string; // handoverTime + 2 hours
  returnTime?: string;
  returnPhotos?: string[];
  isOverdue?: boolean;
  notes?: string;
}

export interface CustomerReferral {
  id: string;
  jobId: string;
  referrerUserId: string;
  referrerName: string;
  referrerPhone: string;
  contacts: {
    name: string;
    phone: string;
  }[];
  discountAmount: number; // 200 (for 2 contacts) or 300 (for 3 contacts)
  status: 'applied' | 'verified' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
}

export interface RealCustomerReview {
  id: string;
  jobId?: string;
  userId?: string;
  partnerId?: string;
  partnerName?: string;
  customerName: string;
  phone?: string;
  rating: number; // 1 to 5
  reviewText: string;
  serviceType: 'repair' | 'sell' | 'buy';
  phoneModel: string;
  area: string;
  status: 'pending' | 'approved' | 'rejected';
  flaggedAbusive?: boolean;
  flagReason?: string;
  adminReply?: string;
  repliedAt?: string;
  repliedBy?: string;
  createdAt: string;
  moderatedAt?: string;
}

export interface PartnerPartUsed {
  name: string;
  cost: number;
}

export interface PartnerSubmission {
  checksDone: string[];
  faultsFound: string;
  tags: string[];
  partsUsed: PartnerPartUsed[];
  totalPartsCost: number;
  repairPhotoUrls: string[];
  timeTakenMinutes: number;
  remarks: string;
  submittedAt: string;
  updatedAt: string;
  readyMarked: boolean;
  costApprovedByAdmin?: boolean;
  costApprovedAt?: string;
  costApprovedBy?: string;
  adminApprovalNote?: string;
}

export interface PartnerJob {
  jobId: string;
  partnerId: string;
  brand: string;
  model: string;
  services: string[];
  pickupSlot: {
    date: string;
    window: string;
    area: string;
  };
  status: JobStatus;
  sealedBagId?: string;
  handoverImei?: string;
  handoverTime?: string;
  handoverDeadline?: string;
  partnerSubmission?: PartnerSubmission;
  updatedAt: string;
}

export interface OwnerListing {
  id: string;
  userId: string;
  ownerName: string;
  ownerPhone: string;
  brand: string;
  model: string;
  storage: string;
  price: number;
  area: string;
  description: string;
  photos: string[];
  status: 'pending' | 'approved' | 'rejected';
  moderationNote?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerNote {
  id: string;
  userId?: string;
  phone: string;
  customerName?: string;
  note: string;
  createdBy: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  actorUid: string;
  actorEmail: string;
  actorRole: string;
  targetType: string;
  targetId: string;
  reason?: string;
  before?: any;
  after?: any;
  metadata?: any;
  createdAt: string;
}

export interface AdminSettings {
  discountMinPct: number;
  discountMaxPct: number;
  minOrderAmountAfterDiscount: number;
  minNetMarginRupees: number;
  visitTokenAmount: number;
  buyPhoneTokenAmount: number;
  gstEnabled: boolean;
  gstPct: number;
  gstin: string;
  businessLegalName: string;
  businessAddress: string;
  sessionTimeoutMinutes: number;
  lowPartnerBalanceThreshold: number;
  updatedAt?: string;
  updatedBy?: string;
}


