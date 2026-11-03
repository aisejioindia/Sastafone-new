import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, OrderItem, SellSelection, SuratLocality, UserProfile, P2PListing, ChatMessage, CustomerReview, PaymentRequest } from '../types';
import { DEFAULT_SURAT_LOCALITY, SURAT_LOCALITIES, INITIAL_P2P_LISTINGS, INITIAL_CUSTOMER_REVIEWS } from '../data/mockData';
import { validateChatSecurity, getAutomatedSellerReply } from '../utils/chatSecurity';
import confetti from 'canvas-confetti';
import {
  saveUserToFirestore,
  saveOrderToFirestore,
  updateOrderInFirestore,
  subscribeToOrdersFromFirestore,
  updatePendingJobInFirestore,
  pushJobToPendingJobs
} from '../services/firebaseDbService';

export type MainTabType = 'sell' | 'buy' | 'repair' | 'bazaar';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  selectedLocality: string;
  setSelectedLocality: (locality: string) => void;
  user: UserProfile;
  loginUser: (
    name: string,
    phone: string,
    address?: string,
    email?: string,
    avatarUrl?: string,
    authProvider?: 'google' | 'phone',
    extraFields?: Partial<UserProfile>
  ) => void;
  logoutUser: () => void;
  orders: OrderItem[];
  addOrder: (order: Omit<OrderItem, 'id' | 'orderNumber' | 'date'>) => OrderItem;
  sellSelection: SellSelection;
  updateSellSelection: (updates: Partial<SellSelection>) => void;
  resetSellSelection: () => void;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
  isDashboardOpen: boolean;
  setIsDashboardOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authPromptReason: string | null;
  setAuthPromptReason: (reason: string | null) => void;
  requireAuth: (reason: string, callback?: () => void) => boolean;
  activeTab: MainTabType;
  setActiveTab: (tab: MainTabType) => void;
  legalModal: 'terms' | 'privacy' | 'cookies' | 'trademark' | null;
  setLegalModal: (modal: 'terms' | 'privacy' | 'cookies' | 'trademark' | null) => void;
  // P2P OLX-style Bazaar & Buyer Pass
  p2pListings: P2PListing[];
  addP2PListing: (listing: Omit<P2PListing, 'id' | 'date' | 'viewsCount' | 'maskedPhone'>) => void;
  unlockedContactIds: string[];
  unlockContact: (id: string) => void;
  buyerCredits: number;
  buyerPlan: 'none' | 'basic_99' | 'pro_299';
  buyBuyerPass: (plan: 'basic_99' | 'pro_299') => void;
  unlockContactWithCredit: (listingId: string) => { success: boolean; message: string; remainingCredits: number };
  sellerPostCredits: number;
  buySellerPostPass: (plan: 'single_99' | 'pro_799') => void;
  // Secure In-App Chat
  chatMessages: Record<string, import('../types').ChatMessage[]>;
  sendChatMessage: (listingId: string, text: string, isQuickOption?: boolean) => { success: boolean; error?: string };
  // Invoice / Receipt download modal
  isInvoiceModalOpen: boolean;
  setIsInvoiceModalOpen: (open: boolean) => void;
  selectedInvoiceOrder: OrderItem | null;
  setSelectedInvoiceOrder: (order: OrderItem | null) => void;
  // Surat Official Brand Service Centers Modal
  isBrandCentersModalOpen: boolean;
  setIsBrandCentersModalOpen: (open: boolean) => void;
  // Official Preset Direct Email Support Modal (support@sastafone.in)
  isEmailSupportModalOpen: boolean;
  setIsEmailSupportModalOpen: (open: boolean) => void;
  emailSupportPresetTopic: string | null;
  openEmailSupportWithPreset: (presetTopic?: string) => void;
  // Happy Customers Reviews & Testimonials
  reviews: CustomerReview[];
  addReview: (newReview: Omit<CustomerReview, 'id' | 'date' | 'likesCount' | 'verified'>) => void;
  toggleLikeReview: (reviewId: string) => void;
  isReviewModalOpen: boolean;
  setIsReviewModalOpen: (open: boolean) => void;
  prefillReviewOrder: OrderItem | null;
  setPrefillReviewOrder: (order: OrderItem | null) => void;
  // Unified Razorpay Payment Modal
  isPaymentModalOpen: boolean;
  paymentModalRequest: PaymentRequest | null;
  openPaymentModal: (request: PaymentRequest) => void;
  closePaymentModal: () => void;
  // Admin & Pro-Audit Controls
  isAdminModalOpen: boolean;
  setIsAdminModalOpen: (open: boolean) => void;
  isProAuditModalOpen: boolean;
  setIsProAuditModalOpen: (open: boolean) => void;
  selectedAuditOrder: OrderItem | null;
  setSelectedAuditOrder: (order: OrderItem | null) => void;
  loginAsAdmin: (email?: string) => void;
  switchToCustomerRole: () => void;
  updateOrder: (orderId: string, updates: Partial<OrderItem>) => void;
  setOrderAdminQuote: (orderId: string, finalAmount: number, discountPct: number, adminNotes?: string) => void;
  confirmOrderPaymentAndHandover: (orderId: string, isPaid: boolean, isHandedOver: boolean) => void;
  saveOrderProAudit: (orderId: string, audit: import('../types').ProAuditVerification) => void;
  sendInvoiceAndOfferToCustomer: (
    orderId: string,
    offerAmount: number,
    discountPct: number,
    doubtNotice: string,
    invoiceNumber?: string
  ) => void;
}

const initialSellSelection: SellSelection = {
  hasOriginalBox: true,
  hasOriginalCharger: true,
  hasValidBill: true,
  screenCondition: 'flawless',
  bodyCondition: 'flawless',
  functionalIssues: []
};

const initialSampleOrders: OrderItem[] = [
  {
    id: 'ord-103',
    orderNumber: 'STP-SURAT-9941',
    type: 'repair',
    title: 'Samsung Galaxy S24 Ultra 5G',
    subtitle: '1 समस्या: कैमरा सेंसर ब्लर / फोकस खराबी • सूरत लैब व डोरस्टेप सर्विस',
    amount: 199,
    status: 'in_inspection',
    statusHindi: 'जांच व प्राइसिंग समीक्षा में (एडमिन अप्रूवल पेंडिंग)',
    locality: 'Pal, Surat',
    fullAddress: 'A-304, Rajhans Synfonia, Near Pal RTO, Surat',
    customerName: 'Jignesh Mewada',
    customerPhone: '9825123456',
    date: 'Today, 11:45 AM',
    timeSlot: 'Today, 12:00 PM - 1:00 PM',
    technicianName: 'Sanjay Prajapati (सस्ताफोन ओनर व सर्टिफाइड टेक लीड)',
    technicianPhone: '9372802044',
    visitCharge: 199,
    paymentMethod: 'UPI / Doorstep',
    paymentStatus: 'paid',
    originalEstimateMin: 699,
    originalEstimateMax: 1899,
    refundPolicyNote: 'फोन रिपेयर होने पर ₹199 फाइनल बिल में एडजस्ट होगा (Visit Free)।',
    customerRequirement: 'कैमरा 10x ज़ूम व नाइट मोड में अत्यधिक ब्लर हो रहा है। ग्राहक का सवाल: क्या ओरिजिनल 200MP सेंसर रिप्लेस होगा या ग्लास री-अलाइनमेंट?',
    customerDoubtResolved: 'सूरत BGA लैब डायग्नोस्टिक: केवल टॉप सफायर लेंस ग्लास व OIS मोटर री-अलाइनमेंट आवश्यक। 12% स्पेशल ऑफ के साथ ₹1,600 का फाइनल बिल व 6 माह वारंटी जारी।',
    phonePhotos: [
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80'
    ],
    finalQuoteAmount: 1600,
    discountOfferedPct: 12,
    invoiceSentToCustomer: true,
    invoiceNumber: 'STP-INV-2026-9941',
    paymentQrGenerated: true,
    cloudSyncStatus: 'synced'
  },
  {
    id: 'ord-101',
    orderNumber: 'STP-SURAT-8921',
    type: 'sell',
    title: 'iPhone 13 (128 GB)',
    subtitle: 'Flawless Condition • Box & Bill Included',
    amount: 32400,
    status: 'technician_assigned',
    statusHindi: 'टेक्नीशियन असाइन हुआ (आज पिकअप)',
    locality: 'Adajan, Surat',
    fullAddress: 'Flat 402, Shivalik Residency, Near Anand Mahal Road, Adajan, Surat',
    customerName: 'Rahul Patel',
    customerPhone: '9825012345',
    date: 'Today, 2:30 PM',
    timeSlot: '2:00 PM - 4:00 PM',
    technicianName: 'Sanjay Prajapati (सस्ताफोन हब ओनर)',
    technicianPhone: '9372802044',
    videoUploaded: true,
    customerRequirement: 'ग्राहक को तत्काल कैश/UPI चाहिए। बिल व ओरिजिनल केबल बॉक्स के साथ है। बैटरी हेल्थ 88% है।',
    customerDoubtResolved: 'सूरत हब अप्रूवल: 32-पॉइंट टेस्ट पास होने पर ₹32,400 का ऑन-स्पॉट UPI ट्रांसफर होगा।',
    phonePhotos: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80'
    ],
    cloudSyncStatus: 'synced'
  },
  {
    id: 'ord-102',
    orderNumber: 'STP-SURAT-7742',
    type: 'repair',
    title: 'OnePlus 10R 5G (Screen Repair)',
    subtitle: 'Display Touch Issue • Doorstep 30 Min Fix',
    amount: 199,
    status: 'technician_assigned',
    statusHindi: '₹199 विज़िट टोकन पेड (टेक्नीशियन रवाना)',
    locality: 'Vesu, Surat',
    fullAddress: 'B-701, Green City, VIP Road, Vesu, Surat',
    customerName: 'Kavita Shah',
    customerPhone: '9879098765',
    date: 'Today, 10:15 AM',
    timeSlot: '11:00 AM - 12:00 PM',
    technicianName: 'Sanjay Prajapati (सस्ताफोन डोरस्टेप लीड)',
    technicianPhone: '9372802044',
    visitCharge: 199,
    paymentMethod: 'सुरक्षित डिजिटल भुगतान (Sastaphone Network)',
    paymentStatus: 'paid',
    refundPolicyNote: 'फोन रिपेयर होने पर ₹199 फाइनल बिल में एडजस्ट होगा। यदि फोन नहीं बन सका तो ₹99 रिफंड होगा।',
    customerRequirement: 'स्क्रीन पर वर्टिकल ग्रीन लाइन आ रही है, टच कभी-कभी फ्रीज होता है।',
    customerDoubtResolved: 'ओरिजिनल 120Hz AMOLED डिस्प्ले पैनल टेस्टेड व तैयार। 10% डिस्काउंट दिया गया।',
    phonePhotos: [
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80'
    ],
    cloudSyncStatus: 'synced'
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('sastaphone_lang') as Language) || 'hi';
  });

  const [selectedLocality, setSelectedLocalityState] = useState<string>(() => {
    return localStorage.getItem('sastaphone_locality') || DEFAULT_SURAT_LOCALITY;
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('sastaphone_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.isLoggedIn === 'boolean') {
          return parsed;
        }
      } catch (e) {
        // fallback
      }
    }
    return {
      name: 'Surat Resident',
      phone: '',
      locality: 'Adajan, Surat',
      address: 'Adajan, Surat',
      isLoggedIn: false,
      activePlan: 'none',
      postsRemaining: 0,
      sellerPostCredits: 0,
      buyerCredits: 0
    };
  });

  const [orders, setOrders] = useState<OrderItem[]>(() => {
    const saved = localStorage.getItem('sastaphone_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return initialSampleOrders;
  });

  const [p2pListings, setP2PListings] = useState<P2PListing[]>(() => {
    const saved = localStorage.getItem('sastaphone_p2p_listings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_P2P_LISTINGS;
  });

  const [unlockedContactIds, setUnlockedContactIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('sastaphone_unlocked_contacts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return [];
  });

  // Buyer Unlock Pass Credits & Plan: ₹99 for 10 unlocks, ₹299 for 50 unlocks
  const [buyerCredits, setBuyerCredits] = useState<number>(() => {
    const saved = localStorage.getItem('sastaphone_buyer_credits');
    return saved !== null ? Number(saved) : 0;
  });

  const [buyerPlan, setBuyerPlan] = useState<'none' | 'basic_99' | 'pro_299'>(() => {
    return (localStorage.getItem('sastaphone_buyer_plan') as 'none' | 'basic_99' | 'pro_299') || 'none';
  });

  // Seller Post Credits: ₹99 for 1 post, ₹799 for 10 posts. Without payment, ad cannot be published!
  const [sellerPostCredits, setSellerPostCredits] = useState<number>(() => {
    const saved = localStorage.getItem('sastaphone_seller_post_credits');
    return saved !== null ? Number(saved) : 0;
  });

  // In-app chat messages per listing
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem('sastaphone_chat_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    // Default initial mock conversations
    return {
      'p2p-1': [
        {
          id: 'init-1',
          listingId: 'p2p-1',
          sender: 'seller',
          text: 'नमस्ते! iPhone 15 Pro के संबंध में आपका स्वागत है। आप सुरक्षित इन-ऐप चैट से कोई भी सवाल पूछ सकते हैं।',
          timestamp: '2 घंटे पहले'
        }
      ],
      'p2p-2': [
        {
          id: 'init-2',
          listingId: 'p2p-2',
          sender: 'seller',
          text: 'नमस्ते! Samsung S24 Ultra बिल व वारंटी के साथ उपलब्ध है।',
          timestamp: '3 घंटे पहले'
        }
      ]
    };
  });

  const [sellSelection, setSellSelection] = useState<SellSelection>(initialSellSelection);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authPromptReason, setAuthPromptReason] = useState<string | null>(null);
  const [pendingAuthCallback, setPendingAuthCallback] = useState<(() => void) | null>(null);

  const requireAuth = (reason: string, callback?: () => void): boolean => {
    if (user.isLoggedIn) {
      if (callback) callback();
      return true;
    }
    setAuthPromptReason(reason);
    if (callback) {
      setPendingAuthCallback(() => callback);
    }
    setIsAuthModalOpen(true);
    return false;
  };

  const [activeTab, setActiveTab] = useState<MainTabType>('sell');
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | 'cookies' | 'trademark' | null>(null);

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<OrderItem | null>(null);
  const [isBrandCentersModalOpen, setIsBrandCentersModalOpen] = useState(false);

  // Happy Customers Reviews & Feedback
  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    const saved = localStorage.getItem('sastaphone_reviews');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_CUSTOMER_REVIEWS;
  });

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [prefillReviewOrder, setPrefillReviewOrder] = useState<OrderItem | null>(null);

  // Unified Razorpay Payment Modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentModalRequest, setPaymentModalRequest] = useState<PaymentRequest | null>(null);

  // Direct Preset Email Support Modal state (support@sastafone.in)
  const [isEmailSupportModalOpen, setIsEmailSupportModalOpen] = useState(false);
  const [emailSupportPresetTopic, setEmailSupportPresetTopic] = useState<string | null>(null);

  const openEmailSupportWithPreset = (presetTopic?: string) => {
    setEmailSupportPresetTopic(presetTopic || null);
    setIsEmailSupportModalOpen(true);
  };

  // Admin & Pro-Audit states
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isProAuditModalOpen, setIsProAuditModalOpen] = useState(false);
  const [selectedAuditOrder, setSelectedAuditOrder] = useState<OrderItem | null>(null);

  const loginAsAdmin = (email: string = 'support@sastafone.in') => {
    setUser(prev => ({
      ...prev,
      name: 'सस्ताफोन ओनर (अधिकृत एडमिन)',
      email: email,
      phone: '9372802044',
      role: 'admin',
      isAdmin: true
    }));
  };

  const switchToCustomerRole = () => {
    setUser(prev => ({
      ...prev,
      role: 'customer',
      isAdmin: false
    }));
  };

  const updateOrder = (orderId: string, updates: Partial<OrderItem>) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
    updateOrderInFirestore(orderId, updates).catch(() => {});
    updatePendingJobInFirestore(orderId, updates).catch(() => {});
  };

  const setOrderAdminQuote = (orderId: string, finalAmount: number, discountPct: number, adminNotes?: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          finalQuoteAmount: finalAmount,
          discountOfferedPct: discountPct,
          adminNotes,
          adminApprovedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          paymentQrGenerated: true,
          status: 'technician_assigned',
          statusHindi: `फाइनल प्राइस ₹${finalAmount.toLocaleString('en-IN')} सेट हुआ • पेमेंट QR तैयार`
        };
      }
      return o;
    }));
  };

  const confirmOrderPaymentAndHandover = (orderId: string, isPaid: boolean, isHandedOver: boolean) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          paymentCollected: isPaid,
          paymentStatus: isPaid ? 'paid' : o.paymentStatus,
          phoneHandedOver: isHandedOver,
          status: isHandedOver ? 'completed' : isPaid ? 'technician_assigned' : o.status,
          statusHindi: isHandedOver
            ? 'सफलतापूर्वक हैंडओवर व 6-माह वारंटी जारी'
            : isPaid
            ? 'पेमेंट वेरिफाइड • हैंडओवर पेंडिंग'
            : o.statusHindi
        };
      }
      return o;
    }));
  };

  const saveOrderProAudit = (orderId: string, audit: import('../types').ProAuditVerification) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          proAudit: audit,
          status: 'in_inspection',
          statusHindi: audit.auditPassed ? 'हार्डवेयर प्रो-ऑडिट 100% पास' : 'ऑडिट जांच में इश्यू मिला'
        };
      }
      return o;
    }));
  };

  const sendInvoiceAndOfferToCustomer = (
    orderId: string,
    offerAmount: number,
    discountPct: number,
    doubtNotice: string,
    invoiceNumber?: string
  ) => {
    const invNum = invoiceNumber || `STP-INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          finalQuoteAmount: offerAmount,
          discountOfferedPct: discountPct,
          customerDoubtResolved: doubtNotice,
          invoiceSentToCustomer: true,
          invoiceNumber: invNum,
          paymentQrGenerated: true,
          status: 'in_progress',
          statusHindi: `ऑफर ₹${offerAmount.toLocaleString('en-IN')} व रसीद जारी • ग्राहक डैशबोर्ड पर उपलब्ध`,
          cloudSyncStatus: 'synced',
          adminApprovedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
      }
      return o;
    }));
  };

  const openPaymentModal = (request: PaymentRequest) => {
    setPaymentModalRequest(request);
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setPaymentModalRequest(null);
  };

  useEffect(() => {
    localStorage.setItem('sastaphone_reviews', JSON.stringify(reviews));
  }, [reviews]);

  const addReview = (newReview: Omit<CustomerReview, 'id' | 'date' | 'likesCount' | 'verified'>) => {
    const createdReview: CustomerReview = {
      ...newReview,
      id: 'rev-user-' + Date.now(),
      date: 'Just now (आज)',
      likesCount: 1,
      likedByMe: true,
      verified: true
    };

    setReviews(prev => [createdReview, ...prev]);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const toggleLikeReview = (reviewId: string) => {
    setReviews(prev =>
      prev.map(rev => {
        if (rev.id === reviewId) {
          const currentlyLiked = rev.likedByMe;
          return {
            ...rev,
            likesCount: currentlyLiked ? Math.max(0, rev.likesCount - 1) : rev.likesCount + 1,
            likedByMe: !currentlyLiked
          };
        }
        return rev;
      })
    );
  };

  useEffect(() => {
    localStorage.setItem('sastaphone_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('sastaphone_locality', selectedLocality);
  }, [selectedLocality]);

  useEffect(() => {
    localStorage.setItem('sastaphone_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('sastaphone_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('sastaphone_p2p_listings', JSON.stringify(p2pListings));
  }, [p2pListings]);

  useEffect(() => {
    localStorage.setItem('sastaphone_unlocked_contacts', JSON.stringify(unlockedContactIds));
  }, [unlockedContactIds]);

  useEffect(() => {
    localStorage.setItem('sastaphone_buyer_credits', String(buyerCredits));
  }, [buyerCredits]);

  useEffect(() => {
    localStorage.setItem('sastaphone_buyer_plan', buyerPlan);
  }, [buyerPlan]);

  useEffect(() => {
    localStorage.setItem('sastaphone_seller_post_credits', String(sellerPostCredits));
  }, [sellerPostCredits]);

  useEffect(() => {
    localStorage.setItem('sastaphone_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Real-time synchronization from Firebase Firestore database
  useEffect(() => {
    const unsubscribe = subscribeToOrdersFromFirestore((remoteOrders) => {
      if (remoteOrders && remoteOrders.length > 0) {
        setOrders(prev => {
          const remoteIds = new Set(remoteOrders.map(o => o.id));
          const localOnly = prev.filter(o => !remoteIds.has(o.id));
          return [...remoteOrders, ...localOnly];
        });
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const setSelectedLocality = (locality: string) => {
    setSelectedLocalityState(locality);
    setUser(prev => ({ ...prev, locality }));
  };

  const loginUser = (
    name: string,
    phone: string,
    address?: string,
    email?: string,
    avatarUrl?: string,
    authProvider?: 'google' | 'phone',
    extraFields?: Partial<UserProfile>
  ) => {
    const updatedUser: UserProfile = {
      name,
      phone,
      email: email || user.email,
      avatarUrl: avatarUrl || user.avatarUrl,
      authProvider: authProvider || 'phone',
      locality: selectedLocality,
      address: address || `Surat, Gujarat`,
      isLoggedIn: true,
      activePlan: user.activePlan || 'none',
      postsRemaining: user.postsRemaining || 0,
      sellerPostCredits: sellerPostCredits,
      buyerCredits: buyerCredits,
      buyerPlan: buyerPlan,
      ...extraFields
    };

    setUser(updatedUser);

    // Instantly save user profile & address details to Firebase Firestore
    saveUserToFirestore(updatedUser).catch((err: any) => {
      console.warn('Firebase save user error:', err);
    });

    setIsAuthModalOpen(false);
    setAuthPromptReason(null);
    if (pendingAuthCallback) {
      setTimeout(() => {
        pendingAuthCallback();
        setPendingAuthCallback(null);
      }, 50);
    }
  };

  const logoutUser = () => {
    setUser({
      name: 'Guest User',
      phone: '',
      locality: selectedLocality,
      address: '',
      isLoggedIn: false,
      sellerPostCredits: sellerPostCredits,
      buyerCredits: buyerCredits,
      buyerPlan: buyerPlan
    });
  };

  const addOrder = (orderData: Omit<OrderItem, 'id' | 'orderNumber' | 'date'>): OrderItem => {
    const newOrder: OrderItem = {
      ...orderData,
      id: 'ord-' + Date.now(),
      orderNumber: `STP-SURAT-${Math.floor(1000 + Math.random() * 9000)}`,
      date: 'Just now',
      cloudSyncStatus: 'synced'
    };

    setOrders(prev => [newOrder, ...prev]);

    // Instantly save service request / job to Firebase Firestore
    saveOrderToFirestore(newOrder).catch(err => {
      console.warn('Firebase save order error:', err);
    });

    return newOrder;
  };

  const addP2PListing = (listingData: Omit<P2PListing, 'id' | 'date' | 'viewsCount' | 'maskedPhone'>) => {
    const masked = listingData.sellerPhone.slice(0, 5) + ' •••••';
    const newListing: P2PListing = {
      ...listingData,
      id: 'p2p-' + Date.now(),
      maskedPhone: masked,
      date: 'Just now',
      viewsCount: 1
    };
    setP2PListings(prev => [newListing, ...prev]);

    // Send all services to Jobs in Admin Dashboard & Firebase ("jitni serivse hain o sab ko job me bejho")
    addOrder({
      type: 'bazaar',
      title: `सस्ता बाज़ार विज्ञापन: ${listingData.brand} ${listingData.modelName}`,
      subtitle: `मांग मूल्य: ₹${listingData.price.toLocaleString('en-IN')} • स्थिति: ${listingData.condition} • फोटो: ${listingData.images.length}`,
      amount: listingData.price,
      status: 'pending',
      statusHindi: 'सस्ता बाज़ार लिस्टिंग जॉब • समीक्षा में',
      locality: listingData.locality || selectedLocality,
      fullAddress: `${listingData.locality || selectedLocality}, Surat`,
      customerName: listingData.sellerName,
      customerPhone: listingData.sellerPhone,
      timeSlot: 'Listing Active 24x7',
      paymentMethod: listingData.planType === 'pro_799' ? 'Pro Seller Pass (₹799)' : 'Single Post Pass (₹99)',
      paymentStatus: 'paid'
    });

    if (sellerPostCredits > 0) {
      setSellerPostCredits(prev => Math.max(0, prev - 1));
      setUser(prev => ({
        ...prev,
        sellerPostCredits: Math.max(0, (prev.sellerPostCredits || 1) - 1)
      }));
    }
  };

  const buySellerPostPass = (plan: 'single_99' | 'pro_799') => {
    const credits = plan === 'single_99' ? 1 : 10;
    setSellerPostCredits(prev => prev + credits);
    setUser(prev => ({
      ...prev,
      sellerPostCredits: (prev.sellerPostCredits || 0) + credits,
      activePlan: plan
    }));
  };

  const unlockContact = (id: string) => {
    if (!unlockedContactIds.includes(id)) {
      setUnlockedContactIds(prev => [...prev, id]);
    }
  };

  const buyBuyerPass = (plan: 'basic_99' | 'pro_299') => {
    const creditsToAdd = plan === 'basic_99' ? 10 : 50;
    setBuyerCredits(prev => prev + creditsToAdd);
    setBuyerPlan(plan);
    setUser(prev => ({
      ...prev,
      buyerCredits: (prev.buyerCredits || 0) + creditsToAdd,
      buyerPlan: plan
    }));
  };

  const unlockContactWithCredit = (listingId: string): { success: boolean; message: string; remainingCredits: number } => {
    if (unlockedContactIds.includes(listingId)) {
      return {
        success: true,
        message: 'सेलर का नंबर पहले से अनलॉक है।',
        remainingCredits: buyerCredits
      };
    }

    if (buyerCredits <= 0) {
      return {
        success: false,
        message: 'अनलॉक क्रेडिट समाप्त! कृपया बायर पास लें (₹99 में 10 नंबर / ₹299 में 50 नंबर)।',
        remainingCredits: 0
      };
    }

    const newCredits = buyerCredits - 1;
    setBuyerCredits(newCredits);
    setUnlockedContactIds(prev => [...prev, listingId]);
    setUser(prev => ({
      ...prev,
      buyerCredits: newCredits
    }));

    return {
      success: true,
      message: `सफल! 1 क्रेडिट का उपयोग हुआ। आपके पास ${newCredits} नंबर अनलॉक शेष हैं।`,
      remainingCredits: newCredits
    };
  };

  const sendChatMessage = (
    listingId: string,
    text: string,
    isQuickOption: boolean = false
  ): { success: boolean; error?: string } => {
    if (!isQuickOption) {
      const securityCheck = validateChatSecurity(text);
      if (!securityCheck.isValid) {
        return { success: false, error: securityCheck.errorMessage };
      }
    }

    const userMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      listingId,
      sender: 'buyer',
      text,
      timestamp: 'Just now',
      isQuickOption
    };

    setChatMessages(prev => {
      const existing = prev[listingId] || [];
      return {
        ...prev,
        [listingId]: [...existing, userMessage]
      };
    });

    // Simulate realistic seller response
    const targetListing = p2pListings.find(l => l.id === listingId);
    const sellerName = targetListing?.sellerName || 'सेलर';
    const locality = targetListing?.locality || 'सूरत';

    setTimeout(() => {
      const replyText = getAutomatedSellerReply(text, sellerName, locality);
      const sellerReply: ChatMessage = {
        id: 'reply-' + Date.now(),
        listingId,
        sender: 'seller',
        text: replyText,
        timestamp: 'Just now'
      };

      setChatMessages(prev => {
        const existing = prev[listingId] || [];
        return {
          ...prev,
          [listingId]: [...existing, sellerReply]
        };
      });
    }, 900);

    return { success: true };
  };

  const updateSellSelection = (updates: Partial<SellSelection>) => {
    setSellSelection(prev => ({ ...prev, ...updates }));
  };

  const resetSellSelection = () => {
    setSellSelection(initialSellSelection);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        selectedLocality,
        setSelectedLocality,
        user,
        loginUser,
        logoutUser,
        orders,
        addOrder,
        sellSelection,
        updateSellSelection,
        resetSellSelection,
        isLocationModalOpen,
        setIsLocationModalOpen,
        isDashboardOpen,
        setIsDashboardOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authPromptReason,
        setAuthPromptReason,
        requireAuth,
        activeTab,
        setActiveTab,
        legalModal,
        setLegalModal,
        p2pListings,
        addP2PListing,
        unlockedContactIds,
        unlockContact,
        buyerCredits,
        buyerPlan,
        buyBuyerPass,
        unlockContactWithCredit,
        sellerPostCredits,
        buySellerPostPass,
        chatMessages,
        sendChatMessage,
        isInvoiceModalOpen,
        setIsInvoiceModalOpen,
        selectedInvoiceOrder,
        setSelectedInvoiceOrder,
        isBrandCentersModalOpen,
        setIsBrandCentersModalOpen,
        reviews,
        addReview,
        toggleLikeReview,
        isReviewModalOpen,
        setIsReviewModalOpen,
        prefillReviewOrder,
        setPrefillReviewOrder,
        isPaymentModalOpen,
        paymentModalRequest,
        openPaymentModal,
        closePaymentModal,
        // Direct Preset Email Support Modal (support@sastafone.in)
        isEmailSupportModalOpen,
        setIsEmailSupportModalOpen,
        emailSupportPresetTopic,
        openEmailSupportWithPreset,
        // Admin & Pro-Audit
        isAdminModalOpen,
        setIsAdminModalOpen,
        isProAuditModalOpen,
        setIsProAuditModalOpen,
        selectedAuditOrder,
        setSelectedAuditOrder,
        loginAsAdmin,
        switchToCustomerRole,
        updateOrder,
        setOrderAdminQuote,
        confirmOrderPaymentAndHandover,
        saveOrderProAudit,
        sendInvoiceAndOfferToCustomer
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
