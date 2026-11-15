import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Language, OrderItem, SellSelection, UserProfile, P2PListing, ChatMessage, CustomerReview, PaymentRequest, AdminSettings } from '../types';
import { DEFAULT_SURAT_LOCALITY } from '../data/mockData';
import { validateChatSecurity } from '../utils/chatSecurity';
import confetti from 'canvas-confetti';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  saveUserToFirestore,
  saveOrderToFirestore,
  updateOrderInFirestore,
  subscribeToOrdersFromFirestore,
  updatePendingJobInFirestore
} from '../services/firebaseDbService';
import {
  SiteSettings,
  DEFAULT_SITE_SETTINGS,
  subscribeToSiteSettings
} from '../services/siteSettingsService';
import {
  DEFAULT_ADMIN_SETTINGS,
  subscribeToAdminSettings,
  syncAndRefreshUserClaims,
  recordAuditLog
} from '../services/adminService';

export type MainTabType = 'sell' | 'buy' | 'repair';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  selectedLocality: string;
  setSelectedLocality: (locality: string) => void;
  siteSettings: SiteSettings;
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
  // Admin, Partner & Verified Claims Controls
  adminSettings: AdminSettings;
  authClaimsLoading: boolean;
  sessionSecondsRemaining: number | null;
  resetSessionTimer: () => void;
  refreshUserClaims: () => Promise<void>;
  isAdminModalOpen: boolean;
  setIsAdminModalOpen: (open: boolean) => void;
  isProAuditModalOpen: boolean;
  setIsProAuditModalOpen: (open: boolean) => void;
  selectedAuditOrder: OrderItem | null;
  setSelectedAuditOrder: (order: OrderItem | null) => void;
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

const initialSampleOrders: OrderItem[] = [];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('sastafone_lang') as Language) || 'hi';
  });

  const [selectedLocality, setSelectedLocalityState] = useState<string>(() => {
    return localStorage.getItem('sastafone_locality') || DEFAULT_SURAT_LOCALITY;
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    const unsub = subscribeToSiteSettings(setSiteSettings);
    return () => unsub();
  }, []);

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('sastafone_user') || localStorage.getItem('sastaphone_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.isLoggedIn === 'boolean') {
          return parsed;
        }
      } catch {
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
    const saved = localStorage.getItem('sastafone_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return initialSampleOrders;
  });

  const [p2pListings, setP2PListings] = useState<P2PListing[]>([]);
  const [unlockedContactIds, setUnlockedContactIds] = useState<string[]>([]);
  const [buyerCredits, setBuyerCredits] = useState<number>(0);
  const [buyerPlan, setBuyerPlan] = useState<'none' | 'basic_99' | 'pro_299'>('none');
  const [sellerPostCredits, setSellerPostCredits] = useState<number>(0);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});

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

  const [activeTab, setActiveTab] = useState<MainTabType>('repair');
  const [legalModal, setLegalModal] = useState<'terms' | 'privacy' | 'cookies' | 'trademark' | null>(null);

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<OrderItem | null>(null);
  const [isBrandCentersModalOpen, setIsBrandCentersModalOpen] = useState(false);

  // Real reviews only (no hardcoded initial fake testimonials)
  const [reviews, setReviews] = useState<CustomerReview[]>([]);

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

  // Admin & Verified Claims states
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);
  const [authClaimsLoading, setAuthClaimsLoading] = useState<boolean>(true);
  const [sessionSecondsRemaining, setSessionSecondsRemaining] = useState<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isProAuditModalOpen, setIsProAuditModalOpen] = useState(false);
  const [selectedAuditOrder, setSelectedAuditOrder] = useState<OrderItem | null>(null);

  const resetSessionTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  const applyVerifiedFirebaseUser = useCallback(async (fbUser: import('firebase/auth').User) => {
    const claimsResult = await syncAndRefreshUserClaims('auth_session_verify');
    let profileData: Record<string, any> = {};
    try {
      const userSnap = await getDoc(doc(db, 'users', fbUser.uid));
      if (userSnap.exists()) {
        profileData = userSnap.data() || {};
      }
    } catch {
      // fallback safely to auth fields
    }

    setUser((prev) => ({
      ...prev,
      uid: fbUser.uid,
      name: profileData.name || fbUser.displayName || prev.name || 'Sastafone User',
      phone: profileData.phone || fbUser.phoneNumber || prev.phone || '',
      email: fbUser.email || profileData.email || '',
      avatarUrl: fbUser.photoURL || prev.avatarUrl,
      address: profileData.address || prev.address || 'Surat, Gujarat',
      locality: profileData.area || profileData.locality || prev.locality || selectedLocality,
      isLoggedIn: true,
      emailVerified: fbUser.emailVerified,
      role: claimsResult.role,
      isAdmin: claimsResult.admin,
      isPartner: claimsResult.partner,
      partnerId: claimsResult.partnerId
    }));
  }, [selectedLocality]);

  const refreshUserClaims = useCallback(async () => {
    if (!auth.currentUser) return;
    setAuthClaimsLoading(true);
    try {
      await applyVerifiedFirebaseUser(auth.currentUser);
    } finally {
      setAuthClaimsLoading(false);
    }
  }, [applyVerifiedFirebaseUser]);

  // Listen to Firebase Auth state and enforce server-verified custom claims
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser((prev) => ({
          ...prev,
          uid: undefined,
          isLoggedIn: false,
          role: 'customer',
          isAdmin: false,
          isPartner: false,
          partnerId: null,
          emailVerified: false
        }));
        setAuthClaimsLoading(false);
        return;
      }

      setAuthClaimsLoading(true);
      try {
        await applyVerifiedFirebaseUser(fbUser);
      } finally {
        setAuthClaimsLoading(false);
      }
    });

    return () => unsubAuth();
  }, [applyVerifiedFirebaseUser]);

  // Load Admin Settings when authenticated as verified Admin
  useEffect(() => {
    if (!user.isLoggedIn || !user.isAdmin) {
      setAdminSettings(DEFAULT_ADMIN_SETTINGS);
      return;
    }
    const unsub = subscribeToAdminSettings(setAdminSettings);
    return () => unsub();
  }, [user.isLoggedIn, user.isAdmin]);

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
    localStorage.setItem('sastafone_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('sastafone_locality', selectedLocality);
  }, [selectedLocality]);

  useEffect(() => {
    localStorage.setItem('sastafone_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('sastafone_orders', JSON.stringify(orders));
  }, [orders]);

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

  const logoutUser = useCallback(async () => {
    if (user.isAdmin || user.isPartner) {
      await recordAuditLog({
        action: 'privileged_logout',
        targetType: 'auth_user',
        targetId: user.uid || '',
        reason: 'Manual sign out'
      });
    }
    try {
      await signOut(auth);
    } catch {
      // ignore if already signed out
    }
    setSessionSecondsRemaining(null);
    setUser({
      name: 'Guest User',
      phone: '',
      locality: selectedLocality,
      address: '',
      isLoggedIn: false,
      role: 'customer',
      isAdmin: false,
      isPartner: false,
      partnerId: null,
      emailVerified: false,
      sellerPostCredits: sellerPostCredits,
      buyerCredits: buyerCredits,
      buyerPlan: buyerPlan
    });
  }, [user.isAdmin, user.isPartner, user.uid, selectedLocality, sellerPostCredits, buyerCredits, buyerPlan]);

  // Inactivity Session Timeout for Admin & Partner accounts
  useEffect(() => {
    const isPrivileged = user.isLoggedIn && (user.isAdmin || user.isPartner);
    if (!isPrivileged) {
      setSessionSecondsRemaining(null);
      return;
    }

    const timeoutMs = Math.max(5, Number(adminSettings.sessionTimeoutMinutes || 30)) * 60 * 1000;
    lastActivityRef.current = Date.now();

    const bumpActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const;
    events.forEach((evt) => window.addEventListener(evt, bumpActivity, { passive: true }));

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remainingSec = Math.max(0, Math.ceil((timeoutMs - elapsed) / 1000));
      setSessionSecondsRemaining(remainingSec);

      if (remainingSec <= 0) {
        window.clearInterval(interval);
        recordAuditLog({
          action: 'session_timeout_logout',
          targetType: 'auth_user',
          targetId: user.uid || '',
          reason: `Inactivity timeout (${adminSettings.sessionTimeoutMinutes} min)`
        }).finally(() => {
          logoutUser();
        });
      }
    }, 1000);

    return () => {
      window.clearInterval(interval);
      events.forEach((evt) => window.removeEventListener(evt, bumpActivity));
    };
  }, [user.isLoggedIn, user.isAdmin, user.isPartner, user.uid, adminSettings.sessionTimeoutMinutes, logoutUser]);

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

  const addP2PListing = (_listingData: Omit<P2PListing, 'id' | 'date' | 'viewsCount' | 'maskedPhone'>) => {
    // Removed SastaBazaar marketplace
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
    _listingId: string,
    text: string,
    isQuickOption: boolean = false
  ): { success: boolean; error?: string } => {
    if (!isQuickOption) {
      const securityCheck = validateChatSecurity(text);
      if (!securityCheck.isValid) {
        return { success: false, error: securityCheck.errorMessage };
      }
    }
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
        siteSettings,
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
        // Admin, Partner & Verified Claims
        adminSettings,
        authClaimsLoading,
        sessionSecondsRemaining,
        resetSessionTimer,
        refreshUserClaims,
        isAdminModalOpen,
        setIsAdminModalOpen,
        isProAuditModalOpen,
        setIsProAuditModalOpen,
        selectedAuditOrder,
        setSelectedAuditOrder,
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
