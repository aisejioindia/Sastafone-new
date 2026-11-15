import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SastafoneLogo } from './SastafoneLogo';
import { auth, db, googleAuthProvider } from '../firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { syncAndRefreshUserClaims } from '../services/adminService';
import {
  X,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  MapPin,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Home,
  Building,
  User
} from 'lucide-react';
import confetti from 'canvas-confetti';

const SURAT_AREAS_LIST = [
  'Adajan',
  'Vesu',
  'Pal',
  'Varachha',
  'Katargam',
  'Rander',
  'Piplod',
  'Citylight',
  'Ghod Dod Road',
  'Althan',
  'Athwa',
  'Udhna',
  'Dindoli',
  'VIP Road',
  'Nanpura',
  'Majura Gate',
  'Bhatar',
  'Pandesara',
  'Amroli',
  'Mota Varachha',
  'Jahangirpura',
  'Dumas Road'
];

interface FirebaseAuthModalProps {
  onSuccess?: () => void;
}

export const FirebaseAuthModal: React.FC<FirebaseAuthModalProps> = ({ onSuccess }) => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    loginUser,
    authPromptReason,
    setAuthPromptReason
  } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Form states
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Address fields
  const [houseFlat, setHouseFlat] = useState('');
  const [buildingSociety, setBuildingSociety] = useState('');
  const [roadLandmark, setRoadLandmark] = useState('');
  const [area, setArea] = useState('Adajan');
  const [pincode, setPincode] = useState('395009');

  // GPS Location
  const [gpsLocation, setGpsLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsSuccessNote, setGpsSuccessNote] = useState<string | null>(null);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  useEffect(() => {
    if (isAuthModalOpen) {
      setErrorMessage(null);
      setGpsSuccessNote(null);
      setForgotPasswordSent(false);
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
    setAuthPromptReason(null);
    setErrorMessage(null);
  };

  // Convert technical errors to friendly Hindi messages (NO "Firebase" mention)
  const getFriendlyErrorMessage = (error: any): string => {
    if (!error) return 'सत्यापन में समस्या आई। कृपया पुनः प्रयास करें।';
    const code = error.code || '';
    if (
      code === 'auth/wrong-password' ||
      code === 'auth/invalid-credential' ||
      code === 'auth/invalid-login-credentials'
    ) {
      return 'दर्ज किया गया पासवर्ड या ईमेल गलत है। कृपया पुनः जांचें।';
    }
    if (code === 'auth/user-not-found') {
      return 'इस ईमेल/नंबर से कोई खाता नहीं मिला। कृपया "नया खाता बनाएं" पर क्लिक करें।';
    }
    if (code === 'auth/email-already-in-use') {
      return 'इस ईमेल से पहले से खाता मौजूद है। कृपया "लॉगिन" टैब का उपयोग करें।';
    }
    if (code === 'auth/weak-password') {
      return 'पासवर्ड कमजोर है। कृपया कम से कम 6 अक्षरों का सुरक्षित पासवर्ड बनाएं।';
    }
    if (code === 'auth/invalid-email') {
      return 'कृपया एक वैध ईमेल पता दर्ज करें।';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Google लॉगिन विंडो बंद हो गई। पुनः प्रयास करें।';
    }
    if (code === 'auth/too-many-requests') {
      return 'बहुत अधिक असफल प्रयास। कृपया कुछ मिनट बाद पुनः प्रयास करें।';
    }
    return 'सत्यापन विफल रहा। कृपया विवरण जांचें और पुनः प्रयास करें।';
  };

  // Handle GPS location capture
  const handleCaptureGps = () => {
    if (!navigator.geolocation) {
      setErrorMessage('आपके ब्राउज़र में GPS लोकेशन सपोर्ट उपलब्ध नहीं है।');
      return;
    }

    setIsLocating(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setGpsLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy)
        });
        setGpsSuccessNote('✓ सटीक GPS लोकेशन सफलतापूर्वक जोड़ ली गई है।');
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) {
          setErrorMessage('लोकेशन की अनुमति अस्वीकृत हुई। कृपया ब्राउज़र सेटिंग्स में लोकेशन की अनुमति दें।');
        } else {
          setErrorMessage('GPS सिग्नल प्राप्त नहीं हो सका। कृपया अपना पता मैन्युअली भरें।');
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Sync user profile to users/{uid}
  const syncUserProfileToFirestore = async (
    uid: string,
    profileData: {
      name: string;
      phone: string;
      email?: string;
      address?: string;
      houseFlat?: string;
      buildingSociety?: string;
      roadLandmark?: string;
      area?: string;
      pincode?: string;
      gpsLocation?: any;
    }
  ) => {
    const userRef = doc(db, 'users', uid);
    const existingSnap = await getDoc(userRef);
    const existingRole = existingSnap.exists() ? existingSnap.data()?.role : 'customer';

    const fullFormattedAddress = [
      profileData.houseFlat,
      profileData.buildingSociety,
      profileData.roadLandmark,
      profileData.area,
      profileData.pincode ? `Surat - ${profileData.pincode}` : 'Surat'
    ]
      .filter(Boolean)
      .join(', ');

    const payload = {
      uid,
      name: profileData.name || 'ग्राहक',
      phone: profileData.phone || '',
      email: profileData.email || '',
      role: existingRole || 'customer',
      address: fullFormattedAddress || profileData.address || '',
      houseFlat: profileData.houseFlat || '',
      buildingSociety: profileData.buildingSociety || '',
      roadLandmark: profileData.roadLandmark || '',
      area: profileData.area || 'Surat',
      pincode: profileData.pincode || '395009',
      gpsLocation: profileData.gpsLocation || null,
      updatedAt: new Date().toISOString(),
      timestamp: serverTimestamp()
    };

    await setDoc(userRef, payload, { merge: true });
    return payload;
  };

  // Google Login Flow
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await signInWithPopup(auth, googleAuthProvider);
      const fbUser = res.user;

      // Check existing profile in users/{uid}
      const userRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userRef);

      let savedPhone = '';
      let savedAddress = '';
      let savedArea = 'Surat';

      if (userSnap.exists()) {
        const uData = userSnap.data();
        savedPhone = uData.phone || '';
        savedAddress = uData.address || '';
        savedArea = uData.area || 'Surat';
      } else {
        await syncUserProfileToFirestore(fbUser.uid, {
          name: fbUser.displayName || 'Google User',
          phone: fbUser.phoneNumber || '',
          email: fbUser.email || '',
          area: 'Surat'
        });
      }

      const claimsResult = await syncAndRefreshUserClaims('google_popup_login');

      loginUser(
        fbUser.displayName || 'Google User',
        savedPhone,
        savedAddress,
        fbUser.email || '',
        fbUser.photoURL || undefined,
        'google',
        {
          uid: fbUser.uid,
          role: claimsResult.role,
          isAdmin: claimsResult.admin,
          isPartner: claimsResult.partner,
          partnerId: claimsResult.partnerId,
          emailVerified: fbUser.emailVerified,
          locality: savedArea
        }
      );

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      handleClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Email / Password Login Flow
  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const loginId = mobile.trim();
    if (!loginId) {
      setErrorMessage('कृपया अपना रजिस्टर्ड मोबाइल नंबर या ईमेल दर्ज करें।');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMessage('कृपया न्यूनतम 6 अक्षरों का पासवर्ड दर्ज करें।');
      return;
    }

    setIsLoading(true);

    try {
      // Determine if loginId is email or phone number
      const effectiveEmail = loginId.includes('@')
        ? loginId
        : `${loginId.replace(/\D/g, '')}@sastafone.in`;

      const res = await signInWithEmailAndPassword(auth, effectiveEmail, password);
      const fbUser = res.user;

      // Fetch user profile from users/{uid}
      const userRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userRef);

      const uData = userSnap.exists() ? userSnap.data() : null;
      const userName = uData?.name || fbUser.displayName || 'ग्राहक';
      const userPhone = uData?.phone || (loginId.includes('@') ? '' : loginId);
      const userAddress = uData?.address || '';
      const claimsResult = await syncAndRefreshUserClaims('email_password_login');

      loginUser(
        userName,
        userPhone,
        userAddress,
        fbUser.email || '',
        undefined,
        'phone',
        {
          uid: fbUser.uid,
          role: claimsResult.role,
          isAdmin: claimsResult.admin,
          isPartner: claimsResult.partner,
          partnerId: claimsResult.partnerId,
          emailVerified: fbUser.emailVerified,
          locality: uData?.area || 'Surat'
        }
      );

      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
      handleClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Register New Account Flow
  const handleRegisterAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validate Name
    if (!name.trim()) {
      setErrorMessage('कृपया अपना पूरा नाम दर्ज करें।');
      return;
    }

    // 2. Validate 10-digit Indian Mobile (+91)
    const cleanMobile = mobile.replace(/\D/g, '');
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(cleanMobile)) {
      setErrorMessage('कृपया वैध 10-अंकीय भारतीय मोबाइल नंबर दर्ज करें (6, 7, 8 या 9 से शुरू)।');
      return;
    }

    // 3. Validate Password (min 6 chars)
    if (!password || password.length < 6) {
      setErrorMessage('पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।');
      return;
    }

    // 4. Validate Address fields
    if (!houseFlat.trim() || !buildingSociety.trim()) {
      setErrorMessage('कृपया मकान/फ्लैट नंबर और बिल्डिंग/सोसाइटी का नाम दर्ज करें।');
      return;
    }

    setIsLoading(true);

    try {
      // Use email if provided, or synthetic phone-backed auth email
      const accountEmail = email.trim() ? email.trim() : `${cleanMobile}@sastafone.in`;

      const res = await createUserWithEmailAndPassword(auth, accountEmail, password);
      const fbUser = res.user;

      await updateProfile(fbUser, { displayName: name.trim() });

      // Save complete profile to users/{uid}
      const fullSaved = await syncUserProfileToFirestore(fbUser.uid, {
        name: name.trim(),
        phone: cleanMobile,
        email: email.trim() || accountEmail,
        houseFlat: houseFlat.trim(),
        buildingSociety: buildingSociety.trim(),
        roadLandmark: roadLandmark.trim(),
        area,
        pincode: pincode.trim(),
        gpsLocation
      });

      loginUser(
        name.trim(),
        cleanMobile,
        fullSaved.address,
        email.trim(),
        undefined,
        'phone',
        {
          uid: fbUser.uid,
          role: 'customer',
          locality: area
        }
      );

      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      handleClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes('@')) {
      setErrorMessage('कृपया अपना वैध ईमेल पता दर्ज करें।');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setForgotPasswordSent(true);
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-md my-auto shadow-2xl border border-gray-100 overflow-hidden text-[#132032] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 pb-3 border-b border-gray-100 flex items-center justify-between">
          <SastafoneLogo size="sm" variant="light" showSubtitle={false} />
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reason banner if triggered by a booking/action */}
        {authPromptReason && (
          <div className="bg-[#FEF2F2] border-b border-red-100 px-4 py-2 text-xs text-[#D5151B] font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{authPromptReason}</span>
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-5">
          {/* 1. Google One-Click Login on TOP */}
          <div>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-colors shadow-2xs cursor-pointer tap-target disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google से तुरंत लॉगिन करें</span>
            </button>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <span className="relative bg-white px-3 text-[11px] text-gray-500 font-medium">
                या मोबाइल नंबर / पासवर्ड से
              </span>
            </div>
          </div>

          {/* 2. Login vs Register Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white text-[#132032] shadow-2xs'
                  : 'text-gray-600 hover:text-[#132032]'
              }`}
            >
              लॉगिन (Login)
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-white text-[#D5151B] shadow-2xs'
                  : 'text-gray-600 hover:text-[#132032]'
              }`}
            >
              नया खाता बनाएं (Register)
            </button>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: LOGIN FORM */}
          {activeTab === 'login' && !isForgotPasswordOpen && (
            <form onSubmit={handleEmailPasswordLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  मोबाइल नंबर या ईमेल
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="उदा. 9876543210 या your@email.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 focus:border-[#D5151B] focus:ring-1 focus:ring-[#D5151B] text-xs sm:text-sm bg-gray-50 focus:bg-white outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-700">
                    पासवर्ड
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPasswordOpen(true);
                      setResetEmail(mobile.includes('@') ? mobile : '');
                      setErrorMessage(null);
                    }}
                    className="text-[11px] text-[#D5151B] hover:underline font-semibold cursor-pointer"
                  >
                    पासवर्ड भूल गए?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="न्यूनतम 6 अक्षर"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-[#D5151B] focus:ring-1 focus:ring-[#D5151B] text-xs sm:text-sm bg-gray-50 focus:bg-white outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50 tap-target mt-2"
              >
                {isLoading ? (
                  <span>सत्यापित हो रहा है...</span>
                ) : (
                  <>
                    <span>लॉगिन करें</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* FORGOT PASSWORD SUB-VIEW */}
          {activeTab === 'login' && isForgotPasswordOpen && (
            <div className="space-y-3.5">
              <h3 className="text-sm font-bold text-[#132032]">
                पासवर्ड रीसेट लिंक प्राप्त करें
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                अपना रजिस्टर्ड ईमेल दर्ज करें। हम आपको पासवर्ड रीसेट करने का सुरक्षित लिंक भेजेंगे।
              </p>

              {forgotPasswordSent ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
                  <p className="font-bold">✓ ईमेल सफलतापूर्वक भेज दिया गया है!</p>
                  <p className="text-[11px]">कृपया अपना इनबॉक्स और स्पैम फ़ोल्डर जांचें।</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPasswordOpen(false);
                      setForgotPasswordSent(false);
                    }}
                    className="text-xs font-bold text-[#D5151B] underline cursor-pointer"
                  >
                    लॉगिन पर वापस जाएं
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      रजिस्टर्ड ईमेल
                    </label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="उदा. name@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#D5151B] focus:ring-1 focus:ring-[#D5151B] text-xs sm:text-sm outline-none"
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotPasswordOpen(false)}
                      className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs cursor-pointer"
                    >
                      रद्द करें
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-2.5 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-xs cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? 'भेज रहे हैं...' : 'रीसेट लिंक भेजें'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: REGISTER FORM (Mobile-First Complete Profile) */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterAccount} className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  पूरा नाम <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="उदा. राहुल शर्मा"
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 focus:border-[#D5151B] focus:ring-1 focus:ring-[#D5151B] text-xs sm:text-sm bg-gray-50 focus:bg-white outline-none"
                    required
                  />
                </div>
              </div>

              {/* Mobile (+91 validated) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  मोबाइल नंबर (+91) <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-xl border border-gray-200 overflow-hidden focus-within:border-[#D5151B] focus-within:ring-1 focus-within:ring-[#D5151B] bg-gray-50 focus-within:bg-white">
                  <span className="px-3 py-2 bg-gray-100 text-gray-600 text-xs font-bold border-r border-gray-200 flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10 अंकों का मोबाइल नंबर"
                    className="w-full px-3 py-2 text-xs sm:text-sm outline-none bg-transparent font-mono"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              {/* Email (Optional) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ईमेल <span className="text-gray-400 font-normal">(वैकल्पिक / Optional)</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3 py-2 rounded-xl border border-gray-200 focus:border-[#D5151B] focus:ring-1 focus:ring-[#D5151B] text-xs sm:text-sm bg-gray-50 focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* Password (min 6, show/hide) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  पासवर्ड बनाएं <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="न्यूनतम 6 अक्षर या अंक"
                    className="w-full pl-10 pr-10 py-2 rounded-xl border border-gray-200 focus:border-[#D5151B] focus:ring-1 focus:ring-[#D5151B] text-xs sm:text-sm bg-gray-50 focus:bg-white outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Surat Address Section */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#132032] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#D5151B]" />
                    <span>सूरत पिकअप पता (Address)</span>
                  </span>

                  {/* GPS Button */}
                  <button
                    type="button"
                    onClick={handleCaptureGps}
                    disabled={isLocating}
                    className="px-2.5 py-1 rounded-lg bg-[#FEF2F2] hover:bg-red-100 text-[#D5151B] text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Navigation className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                    <span>{isLocating ? 'प्राप्त हो रहा है...' : 'GPS उपयोग करें'}</span>
                  </button>
                </div>

                {gpsSuccessNote && (
                  <p className="text-[11px] text-emerald-700 font-semibold mb-2 bg-emerald-50 p-1.5 rounded-lg border border-emerald-200">
                    {gpsSuccessNote}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <input
                      type="text"
                      value={houseFlat}
                      onChange={(e) => setHouseFlat(e.target.value)}
                      placeholder="मकान/फ्लैट नं. *"
                      className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#D5151B]"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={buildingSociety}
                      onChange={(e) => setBuildingSociety(e.target.value)}
                      placeholder="बिल्डिंग/सोसाइटी *"
                      className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#D5151B]"
                      required
                    />
                  </div>
                </div>

                <div className="mb-2">
                  <input
                    type="text"
                    value={roadLandmark}
                    onChange={(e) => setRoadLandmark(e.target.value)}
                    placeholder="सड़क / प्रमुख लैंडमार्क (वैकल्पिक)"
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#D5151B]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <select
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#D5151B] bg-white"
                    >
                      {SURAT_AREAS_LIST.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="पिनकोड (395009)"
                      className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#D5151B] font-mono"
                      maxLength={6}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50 tap-target mt-3"
              >
                {isLoading ? (
                  <span>खाता बनाया जा रहा है...</span>
                ) : (
                  <>
                    <span>खाता बनाएं व आगे बढ़ें</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Privacy Note */}
          <p className="text-[11px] text-gray-500 text-center leading-relaxed">
            सुरक्षित लॉगिन द्वारा आप Sastafone की सेवा शर्तों व गोपनीयता नीति से सहमत होते हैं।
          </p>
        </div>
      </div>
    </div>
  );
};
