import React, { useState } from 'react';
import { OrderItem, ProAuditVerification } from '../types';
import { formatINR } from '../utils/valuation';
import {
  ShieldCheck,
  CheckCircle2,
  Wrench,
  Smartphone,
  Tag,
  Percent,
  Check,
  MessageCircle,
  Copy,
  Award,
  AlertTriangle,
  Sparkles,
  QrCode,
  FileText,
  Clock,
  Layers,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TechnicianProAuditIntakeProps {
  order: OrderItem;
  onSaveAudit: (orderId: string, audit: ProAuditVerification) => void;
  onUpdateQuote: (orderId: string, amount: number, discountPct: number, notes?: string) => void;
  onActivityLog?: (title: string, desc: string, amount?: number) => void;
}

export interface SuratServiceItem {
  id: string;
  name: string;
  category: 'screen' | 'battery' | 'camera' | 'body' | 'port' | 'audio' | 'board' | 'combo' | 'protection' | 'service';
  defaultPrice: number;
  priceRange: string;
  warrantyType: string;
}

export const SURAT_PRICE_CATALOG: SuratServiceItem[] = [
  { id: 'srv-screen', name: 'ओरिजिनल डिस्प्ले / AMOLED स्क्रीन पैनल रिप्लेसमेंट', category: 'screen', defaultPrice: 1699, priceRange: '₹1,299 - ₹2,999', warrantyType: '6 महीने वारंटी' },
  { id: 'srv-battery', name: '100% ओरिजिनल बैटरी (100% हेल्थ व बैकअप)', category: 'battery', defaultPrice: 999, priceRange: '₹899 - ₹1,499', warrantyType: '3 या 6 महीने वारंटी' },
  { id: 'srv-camera', name: 'कैमरा लेंस ग्लास / OIS मोटर री-अलाइनमेंट', category: 'camera', defaultPrice: 699, priceRange: '₹499 - ₹899', warrantyType: '3 महीने वारंटी' },
  { id: 'srv-back', name: 'बैक पैनल / बैक ग्लास हाउसिंग रिप्लेसमेंट', category: 'body', defaultPrice: 799, priceRange: '₹699 - ₹1,299', warrantyType: '3 महीने वारंटी' },
  { id: 'srv-port', name: 'फास्ट चार्जिंग जैक / सब-बोर्ड रिपेयर', category: 'port', defaultPrice: 449, priceRange: '₹349 - ₹599', warrantyType: '3 महीने वारंटी' },
  { id: 'srv-audio', name: 'ईयरपीस / लाउडस्पीकर / माइक मॉड्यूल', category: 'audio', defaultPrice: 499, priceRange: '₹399 - ₹699', warrantyType: '3 महीने वारंटी' },
  { id: 'srv-board', name: 'मदरबोर्ड BGA चिपसेट / पावर आईसी रिपेयर (नो पावर)', category: 'board', defaultPrice: 1899, priceRange: '₹1,499 - ₹2,800', warrantyType: '6 महीने वारंटी' },
  { id: 'srv-combo', name: '🌟 फुल फोन मेकओवर कॉम्बो (डिस्प्ले + बैटरी + बैक + ग्लास)', category: 'combo', defaultPrice: 2999, priceRange: '₹2,499 - ₹3,999', warrantyType: '6 महीने फुल वारंटी' },
  { id: 'srv-glass', name: '11D अल्ट्रा टफ टेम्पर्ड ग्लास व कैमरा रिंग गार्ड', category: 'protection', defaultPrice: 249, priceRange: '₹199 - ₹299', warrantyType: '3 महीने वारंटी' },
  { id: 'srv-clean', name: 'अल्ट्रासोनिक डीप क्लीनिंग व थर्मल हीटिंग सर्विस', category: 'service', defaultPrice: 349, priceRange: '₹299 - ₹499', warrantyType: '3 महीने वारंटी' }
];

export const TechnicianProAuditIntake: React.FC<TechnicianProAuditIntakeProps> = ({
  order,
  onSaveAudit,
  onUpdateQuote,
  onActivityLog
}) => {
  const [isOpen, setIsOpen] = useState(true);

  // Active Audit Mode (defaults to order type, but can be switched)
  const [auditMode, setAuditMode] = useState<'repair' | 'sell' | 'buy'>(
    order.type === 'sell' ? 'sell' : order.type === 'buy' ? 'buy' : 'repair'
  );

  // Core Hardware Checklist Tick Marks
  const [imei, setImei] = useState(order.proAudit?.imei || '359182049182741');
  const [imeiMatched, setImeiMatched] = useState(order.proAudit?.imeiMatched ?? true);
  const [screwSealIntact, setScrewSealIntact] = useState(order.proAudit?.screwSealIntact ?? true);
  const [bodyGrade, setBodyGrade] = useState<'flawless' | 'minor_scratches' | 'dents' | 'bent'>(
    order.proAudit?.bodyConditionCheck || 'minor_scratches'
  );
  const [lciMarker, setLciMarker] = useState<'dry_white_ok' | 'red_liquid_contact' | 'repaired'>(
    order.proAudit?.lciWaterMarkerStatus || 'dry_white_ok'
  );

  // 9-Point Touch (0-8)
  const [touchGrid, setTouchGrid] = useState<boolean[]>([
    true, true, true, true, true, true, true, true, true
  ]);

  const [screenDisplayCheck, setScreenDisplayCheck] = useState<
    'flawless' | 'minor_scratches' | 'replaced_tested' | 'dead_pixels'
  >(order.proAudit?.screenDisplayCheck || 'replaced_tested');

  // Sensors & Modules
  const [rearCamera, setRearCamera] = useState(order.proAudit?.rearCameraCheck ?? true);
  const [frontCamera, setFrontCamera] = useState(order.proAudit?.frontCameraCheck ?? true);
  const [cameraOis, setCameraOis] = useState(order.proAudit?.cameraAutofocusCheck ?? true);
  const [micEarpiece, setMicEarpiece] = useState(order.proAudit?.micEarpieceCheck ?? true);
  const [loudspeaker, setLoudspeaker] = useState(order.proAudit?.loudspeakerCheck ?? true);
  const [wifiBt, setWifiBt] = useState(order.proAudit?.wifiBluetoothCheck ?? true);
  const [networkSim, setNetworkSim] = useState(order.proAudit?.networkSimCheck ?? true);
  const [biometrics, setBiometrics] = useState(order.proAudit?.biometricsCheck ?? true);
  const [buttons, setButtons] = useState(order.proAudit?.buttonsCheck ?? true);

  // Power & Battery
  const [batteryHealth, setBatteryHealth] = useState(order.proAudit?.batteryHealthPct || 93);
  const [currentDraw, setCurrentDraw] = useState(order.proAudit?.chargingCurrentDrawAmps || 2.4);

  // Sell & Buy Specific Checks
  const [ceirVerified, setCeirVerified] = useState(order.proAudit?.ceirAntiTheftVerified ?? true);
  const [boxCharger, setBoxCharger] = useState(order.proAudit?.boxChargerVerified ?? true);
  const [oemDisplay, setOemDisplay] = useState(order.proAudit?.oemDisplayVerified ?? true);
  const [qcSealAttached, setQcSealAttached] = useState(order.proAudit?.qcHologramSealAttached ?? true);
  const [ultrasonicCleaned, setUltrasonicCleaned] = useState(order.proAudit?.ultrasonicCleaned ?? true);

  // Technician Remarks
  const [techNotes, setTechNotes] = useState(
    order.proAudit?.technicianNotes ||
      (order.type === 'repair'
        ? 'डिवाइस रिसीविंग टेस्ट पूर्ण। 9-पॉइंट टच व कैमरा OIS स्मूथ। स्क्रू सील और मदरबोर्ड LCI व्हाइट सेफ।'
        : order.type === 'sell'
        ? 'CEIR पोर्टल व बिल-बॉक्स सत्यापित। A+ ग्रेड बॉडी व ओरिजिनल बैटरी टेस्ट पास।'
        : 'सूरत सेंट्रल 32-पॉइंट लैब क्वालिटी टेस्ट पास, होलोग्राफिक वारंटी सील अटैच्ड।')
  );

  // Selected Services from Surat Price Catalog
  const initialServices = order.proAudit?.selectedServices || (
    order.type === 'repair'
      ? [{ name: 'कैमरा लेंस ग्लास / OIS मोटर री-अलाइनमेंट', price: 699, category: 'camera' },
         { name: 'ओरिजिनल डिस्प्ले / AMOLED स्क्रीन पैनल रिप्लेसमेंट', price: 1699, category: 'screen' }]
      : [{ name: 'सर्टिफाइड 32-पॉइंट क्वालिटी इंस्पेक्शन व वारंटी', price: order.finalQuoteAmount || order.amount, category: 'service' }]
  );

  const [selectedServices, setSelectedServices] = useState<{ name: string; price: number; category?: string }[]>(initialServices);

  // Calculated Pricing & Discounts
  const subtotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const [finalQuote, setFinalQuote] = useState<number>(order.finalQuoteAmount || (subtotal > 0 ? subtotal : order.amount));
  const [discountOfferedPct, setDiscountOfferedPct] = useState<number>(order.discountOfferedPct || (finalQuote === 1600 ? 12 : 0));
  const [customQuoteNote, setCustomQuoteNote] = useState(order.adminNotes || '');
  const [isCopied, setIsCopied] = useState(false);
  const [isSentToWhatsApp, setIsSentToWhatsApp] = useState(Boolean(order.invoiceSentToCustomer));

  // USER WARRANTY RULE: Under 1k (< 1000) -> 3 months warranty, 1000 and above (>= 1000) -> 6 months warranty
  const calculatedWarrantyMonths = finalQuote < 1000 ? 3 : 6;
  const warrantyLabel = finalQuote < 1000 ? '3 महीने वारंटी (₹1k से कम)' : '6 महीने फुल वारंटी (₹1k या अधिक)';

  // Toggle touch point
  const handleToggleTouch = (idx: number) => {
    setTouchGrid(prev => {
      const copy = [...prev];
      copy[idx] = !copy[idx];
      return copy;
    });
  };

  const touchPassedCount = touchGrid.filter(Boolean).length;
  const isTouchAllPassed = touchPassedCount === 9;

  // Toggle service in catalog
  const handleToggleService = (item: SuratServiceItem) => {
    const exists = selectedServices.some(s => s.name === item.name);
    let updated: { name: string; price: number; category?: string }[];
    if (exists) {
      updated = selectedServices.filter(s => s.name !== item.name);
    } else {
      updated = [...selectedServices, { name: item.name, price: item.defaultPrice, category: item.category }];
    }
    setSelectedServices(updated);

    const newSubtotal = updated.reduce((sum, s) => sum + s.price, 0);
    if (discountOfferedPct > 0) {
      const discounted = Math.round(newSubtotal * (1 - discountOfferedPct / 100));
      setFinalQuote(discounted);
    } else {
      setFinalQuote(newSubtotal || order.amount);
    }
  };

  // Apply quick discount preset
  const handleApplyPresetDiscount = (pct: number, forcedAmount?: number) => {
    setDiscountOfferedPct(pct);
    if (forcedAmount !== undefined) {
      setFinalQuote(forcedAmount);
    } else {
      const discounted = Math.round((subtotal || order.amount) * (1 - pct / 100));
      setFinalQuote(discounted);
    }
  };

  // Build the complete Pro-Audit Verification Object
  const getAuditData = (): ProAuditVerification => ({
    imei,
    imeiMatched,
    touchSensitivity: isTouchAllPassed ? 'passed' : 'tested',
    screenDisplayCheck,
    frontCameraCheck: frontCamera,
    rearCameraCheck: rearCamera,
    cameraAutofocusCheck: cameraOis,
    micEarpieceCheck: micEarpiece,
    loudspeakerCheck: loudspeaker,
    proximitySensorCheck: true,
    biometricsCheck: biometrics,
    chargingCurrentDrawAmps: currentDraw,
    batteryHealthPct: batteryHealth,
    lciWaterMarkerStatus: lciMarker,
    technicianNotes: techNotes,
    auditPassed: imeiMatched && rearCamera && isTouchAllPassed,
    auditTimestamp: new Date().toLocaleDateString('hi-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    auditorName: 'संजय प्रजापति (सर्टिफाइड ओनर व टेक लीड, सूरत)',
    auditType: auditMode,
    screwSealIntact,
    bodyConditionCheck: bodyGrade,
    wifiBluetoothCheck: wifiBt,
    networkSimCheck: networkSim,
    buttonsCheck: buttons,
    boxChargerVerified: boxCharger,
    ceirAntiTheftVerified: ceirVerified,
    oemDisplayVerified: oemDisplay,
    qcHologramSealAttached: qcSealAttached,
    ultrasonicCleaned,
    selectedServices,
    warrantyMonths: calculatedWarrantyMonths,
    warrantyType: warrantyLabel
  });

  // Save Audit Only
  const handleSaveAuditOnly = () => {
    const auditData = getAuditData();
    onSaveAudit(order.id, auditData);
    onUpdateQuote(order.id, finalQuote, discountOfferedPct, customQuoteNote);

    if (onActivityLog) {
      onActivityLog(
        `${order.title} Pro-Audit सहेजा गया`,
        `IMEI ${imei} सत्यापित। फाइनल कोट ₹${finalQuote} (${warrantyLabel}) दर्ज किया।`,
        finalQuote
      );
    }

    confetti({ particleCount: 50, spread: 60 });
  };

  // Generate Structured WhatsApp Message for Customer
  const generateWhatsAppMessage = () => {
    const servicesListText = selectedServices.length > 0
      ? selectedServices.map(s => `  • ${s.name}: ₹${s.price.toLocaleString('en-IN')}`).join('\n')
      : `  • स्वीकृत रिपेयरिंग/सर्विस जॉब: ₹${finalQuote.toLocaleString('en-IN')}`;

    const touchStatus = isTouchAllPassed ? '✓ पास (9/9 ग्रिड एक्टिव)' : 'सत्यापित';
    const lciText = lciMarker === 'dry_white_ok' ? '⚪ ड्राई व्हाइट (नो लिक्विड कांटेक्ट - सेफ)' : 'सत्यापित';

    return `📱 *सस्ताफोन सूरत (Sastaphone Surat) - आधिकारिक Pro-Audit व फाइनल इनवॉइस*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧾 *जॉब इनवॉइस नंबर:* #${order.invoiceNumber || order.orderNumber}
👤 *ग्राहक:* ${order.customerName}
📱 *स्मार्टफोन:* ${order.title}
📍 *सूरत लोकेशन:* ${order.locality || 'Adajan / Surat'}

🔍 *सूरत सेंट्रल लैब Technician Pro-Audit रिपोर्ट:*
✓ IMEI 1: ${imei} (${imeiMatched ? 'बिल/बॉक्स से सत्यापित' : 'सत्यापित'})
✓ 9-पॉइंट टच व AMOLED स्क्रीन: ${touchStatus}
✓ बैटरी हेल्थ बैकअप: ${batteryHealth}% (चार्जिंग करंट: ${currentDraw}A)
✓ कैमरा व OIS लेज़र ऑटोफोकस: ${cameraOis && rearCamera ? '100% क्लियर व टेस्टेड' : 'टेस्टेड'}
✓ LCI वाटर मार्कर: ${lciText}
✓ ऑडियो (माइक / लाउडस्पीकर): 100% एक्टिव
✓ नेटवर्क सिम, वाईफाई व बायोमेट्रिक्स: पास

🛠️ *स्वीकृत काम व पार्ट्स विवरण (Surat Hub Price List):*
${servicesListText}
${discountOfferedPct > 0 ? `🎁 *विशेष एडमिन डिस्काउंट:* ${discountOfferedPct}% ऑफ लागू` : ''}

💰 *फाइनल देय राशि (Payable Bill):* ₹${finalQuote.toLocaleString('en-IN')}
(₹199 विज़िट टोकन पहले से एडजस्टेड)

🛡️ *सस्ताफोन आधिकारिक वारंटी:*
${calculatedWarrantyMonths === 6 ? '🛡️ 6 महीने की फुल रिप्लेसमेंट वारंटी (बिल ₹1,000+)' : '🛡️ 3 महीने की पार्ट वारंटी (बिल < ₹1,000)'}
(जीएसटी इनवॉइस व डिजिटल जॉब कार्ड सुरक्षित)

💳 *पेमेंट विवरण (Direct Scan / UPI Transfer):*
• UPI ID: 9372802044@okbizaxis
• GPay / PhonePe / Paytm: 9372802044
(पेमेंट पूरा होने पर स्क्रीनशॉट इसी चैट पर भेजें)

🏢 *सूरत सेंट्रल टेक सुपर लैब:*
रिंग रोड व अडाजण हब, सूरत (24x7 सपोर्ट)
वेबसाइट: https://sastafone.in
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
धन्यवाद! सस्ताफोन सूरत - आपका भरोसेमंद मोबाइल साथी।`;
  };

  const handleSendToWhatsApp = () => {
    // 1. Save audit & quotation first
    handleSaveAuditOnly();

    // 2. Build message
    const msg = generateWhatsAppMessage();
    const cleanCustomerPhone = (order.customerPhone || '').replace(/\D/g, '').slice(-10);

    // 3. Open WhatsApp Web / App
    const targetUrl = `https://wa.me/91${cleanCustomerPhone}?text=${encodeURIComponent(msg)}`;
    window.open(targetUrl, '_blank');

    setIsSentToWhatsApp(true);
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
  };

  const handleCopyMessage = () => {
    const msg = generateWhatsAppMessage();
    navigator.clipboard.writeText(msg);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="rounded-3xl border-2 border-blue-500/70 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white overflow-hidden shadow-xl mb-4">
      {/* Top Banner Header */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 flex flex-wrap items-center justify-between gap-2.5 border-b border-blue-400/30">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-base shadow-md shrink-0">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                1. फोन रिसीविंग व टेक्नीशियन Pro-Audit चेकलिस्ट
              </span>
              <span className="text-[11px] font-mono font-bold text-blue-200 bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-400/30">
                {order.orderNumber}
              </span>
              {order.proAudit?.auditPassed && (
                <span className="text-[10px] font-black bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>ऑडिट पास</span>
                </span>
              )}
            </div>
            <h5 className="font-black text-sm sm:text-base text-white mt-0.5">
              {order.title} • {order.customerName} ({order.locality || 'Surat'})
            </h5>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Badges */}
          <div className="inline-flex rounded-xl bg-slate-950/60 p-0.5 border border-white/10 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setAuditMode('repair')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                auditMode === 'repair' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              🔧 रिपेयरिंग
            </button>
            <button
              type="button"
              onClick={() => setAuditMode('sell')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                auditMode === 'sell' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              📱 बाय-बैक
            </button>
            <button
              type="button"
              onClick={() => setAuditMode('buy')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                auditMode === 'buy' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              🛒 सर्टिफाइड
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors cursor-pointer"
          >
            {isOpen ? 'छोटा करें ▲' : 'चेकलिस्ट खोलें ▼'}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="p-3.5 sm:p-5 space-y-4 text-xs">
          {/* Customer Requirement Notice Box */}
          <div className="p-3 rounded-2xl bg-blue-950/50 border border-blue-400/40 flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
              📋
            </div>
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span className="text-[11px] font-black text-amber-300">
                  ग्राहक का मूल आवेदन व समस्या विवरण:
                </span>
                <span className="text-[10px] text-blue-200 bg-blue-900/60 px-2 py-0.5 rounded-full border border-blue-500/30">
                  {order.type === 'repair' ? 'होम रिपेयरिंग (विज़िट टोकन ₹199)' : order.type === 'sell' ? 'सेल बाय-बैक पिकअप' : 'सर्टिफाइड आर्डर'}
                </span>
              </div>
              <p className="text-white text-xs font-medium">
                {order.subtitle || 'कैमरा लेंस, AMOLED डिस्प्ले टच या चार्जिंग इश्यू'}
              </p>
              {order.customerRequirement && (
                <p className="text-[11px] text-emerald-300 font-semibold">
                  नोट: {order.customerRequirement}
                </p>
              )}
            </div>
          </div>

          {/* SECTION A: SMARTPHONE HARDWARE AUDIT TICK-MARKS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>स्मार्टफोन हार्डवेयर व रिसीविंग टेस्ट (Interactive Tick Marks):</span>
              </span>
              <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full">
                सूरत सेंट्रल लैब प्रोटोकॉल
              </span>
            </div>

            {/* Checklist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {/* 1. IMEI Verification */}
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-white flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-black">1</span>
                    <span>IMEI 1 (*#06# जांच)</span>
                  </span>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={imeiMatched}
                      onChange={e => setImeiMatched(e.target.checked)}
                      className="w-3.5 h-3.5 text-emerald-500 rounded accent-emerald-500"
                    />
                    <span className={`text-[10px] font-bold ${imeiMatched ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {imeiMatched ? '✓ मैच' : 'मिसमैच'}
                    </span>
                  </label>
                </div>
                <input
                  type="text"
                  value={imei}
                  onChange={e => setImei(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-600 font-mono text-[11px] text-amber-300 focus:outline-none focus:border-blue-400"
                  placeholder="359182049182741"
                />
              </div>

              {/* 2. Screw Seal & Body */}
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-white flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-black">2</span>
                    <span>स्क्रू सील व फिजिकल बॉडी</span>
                  </span>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={screwSealIntact}
                      onChange={e => setScrewSealIntact(e.target.checked)}
                      className="w-3.5 h-3.5 text-emerald-500 rounded accent-emerald-500"
                    />
                    <span className={`text-[10px] font-bold ${screwSealIntact ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {screwSealIntact ? '✓ सील इंटैक्ट' : 'ओपन'}
                    </span>
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-1 text-[10px]">
                  {[
                    { id: 'flawless', label: 'A+ क्लीन' },
                    { id: 'minor_scratches', label: 'माइनर स्क्रैच' },
                    { id: 'dents', label: 'डेंट/क्रैक' }
                  ].map(b => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBodyGrade(b.id as any)}
                      className={`py-1 rounded-lg font-bold border transition-all cursor-pointer text-center ${
                        bodyGrade === b.id
                          ? 'bg-blue-600 text-white border-blue-400'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. LCI Liquid Damage Marker */}
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-white flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-black">3</span>
                    <span>LCI वाटर स्टीकर जांच</span>
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    lciMarker === 'dry_white_ok' ? 'bg-emerald-500/30 text-emerald-300' : 'bg-rose-500/30 text-rose-300'
                  }`}>
                    {lciMarker === 'dry_white_ok' ? '⚪ नो वाटर' : '🔴 लिक्विड कांटेक्ट'}
                  </span>
                </div>
                <select
                  value={lciMarker}
                  onChange={e => setLciMarker(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-600 text-[11px] text-white font-bold"
                >
                  <option value="dry_white_ok">⚪ ड्राई व्हाइट (सुरक्षित नो वाटर डैमेज)</option>
                  <option value="red_liquid_contact">🔴 रेड मार्कर (वाटर कांटेक्ट डिटेक्टेड)</option>
                  <option value="repaired">🟡 लैब अल्ट्रासोनिक डी-ऑक्सीडाइज्ड</option>
                </select>
              </div>

              {/* 4. 9-Point Touch Grid */}
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-white flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-black">4</span>
                    <span>9-पॉइंट टच सेंसिटिविटी</span>
                  </span>
                  <span className={`text-[10px] font-bold ${isTouchAllPassed ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {touchPassedCount}/9 एक्टिव
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 py-0.5">
                  {touchGrid.map((passed, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleToggleTouch(idx)}
                      className={`h-7 rounded-lg font-black text-[10px] flex items-center justify-center transition-all cursor-pointer ${
                        passed
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-900 text-slate-500 border border-dashed border-slate-600 hover:bg-slate-800'
                      }`}
                    >
                      {passed ? '✓ OK' : `Q${idx + 1}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Cameras & OIS Laser Autofocus */}
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-white flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-black">5</span>
                    <span>कैमरा व OIS ऑटोफोकस</span>
                  </span>
                  <span className="text-[10px] text-blue-300 font-bold">लेंस टेस्ट</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <label className="flex items-center gap-1.5 cursor-pointer bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                    <input
                      type="checkbox"
                      checked={rearCamera}
                      onChange={e => setRearCamera(e.target.checked)}
                      className="w-3.5 h-3.5 accent-emerald-500"
                    />
                    <span className="text-[10px] font-bold text-white">रियर मेन</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                    <input
                      type="checkbox"
                      checked={cameraOis}
                      onChange={e => setCameraOis(e.target.checked)}
                      className="w-3.5 h-3.5 accent-emerald-500"
                    />
                    <span className="text-[10px] font-bold text-amber-300">OIS मोटर</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                    <input
                      type="checkbox"
                      checked={frontCamera}
                      onChange={e => setFrontCamera(e.target.checked)}
                      className="w-3.5 h-3.5 accent-emerald-500"
                    />
                    <span className="text-[10px] font-bold text-white">सेल्फी लेंस</span>
                  </label>
                </div>
              </div>

              {/* 6. Battery Health & Charging Amps */}
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-white flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-black">6</span>
                    <span>बैटरी व चार्जिंग करंट</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {batteryHealth}% हेल्थ
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] text-slate-400 block">हेल्थ (%):</label>
                    <input
                      type="number"
                      value={batteryHealth}
                      onChange={e => setBatteryHealth(parseInt(e.target.value) || 85)}
                      className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-600 text-xs font-bold text-white text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-400 block">करंट ड्रॉ (A):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={currentDraw}
                      onChange={e => setCurrentDraw(parseFloat(e.target.value) || 2.0)}
                      className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-600 text-xs font-bold text-white text-center"
                    />
                  </div>
                </div>
              </div>

              {/* 7. Audio, Mic, WiFi, Buttons (Compact Quick Ticks) */}
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-1.5 md:col-span-2 lg:col-span-3">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="font-bold text-[11px] text-white flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-black">7</span>
                    <span>ऑडियो, कनेक्टिविटी, नेटवर्क व बायोमेट्रिक्स अतिरिक्त टिक-मार्क्स:</span>
                  </span>
                  <span className="text-[10px] text-slate-400">सभी फंक्शन्स 100% वेरिफाइड</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1 text-[11px]">
                  <label className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer hover:border-slate-500">
                    <input
                      type="checkbox"
                      checked={micEarpiece}
                      onChange={e => setMicEarpiece(e.target.checked)}
                      className="w-3.5 h-3.5 accent-emerald-500"
                    />
                    <span className="font-semibold text-slate-200">माइक व ईयरपीस</span>
                  </label>

                  <label className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer hover:border-slate-500">
                    <input
                      type="checkbox"
                      checked={loudspeaker}
                      onChange={e => setLoudspeaker(e.target.checked)}
                      className="w-3.5 h-3.5 accent-emerald-500"
                    />
                    <span className="font-semibold text-slate-200">लाउडस्पीकर</span>
                  </label>

                  <label className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer hover:border-slate-500">
                    <input
                      type="checkbox"
                      checked={networkSim}
                      onChange={e => setNetworkSim(e.target.checked)}
                      className="w-3.5 h-3.5 accent-emerald-500"
                    />
                    <span className="font-semibold text-slate-200">सिम 4G/5G नेटवर्क</span>
                  </label>

                  <label className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer hover:border-slate-500">
                    <input
                      type="checkbox"
                      checked={wifiBt}
                      onChange={e => setWifiBt(e.target.checked)}
                      className="w-3.5 h-3.5 accent-emerald-500"
                    />
                    <span className="font-semibold text-slate-200">WiFi व ब्लूटूथ</span>
                  </label>

                  <label className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer hover:border-slate-500">
                    <input
                      type="checkbox"
                      checked={biometrics}
                      onChange={e => setBiometrics(e.target.checked)}
                      className="w-3.5 h-3.5 accent-emerald-500"
                    />
                    <span className="font-semibold text-slate-200">फिंगरप्रिंट / फेस ID</span>
                  </label>

                  <label className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer hover:border-slate-500">
                    <input
                      type="checkbox"
                      checked={buttons}
                      onChange={e => setButtons(e.target.checked)}
                      className="w-3.5 h-3.5 accent-emerald-500"
                    />
                    <span className="font-semibold text-slate-200">पावर व वॉल्यूम कीज़</span>
                  </label>
                </div>
              </div>

              {/* Sell / Buy Specific Checks */}
              {(auditMode === 'sell' || auditMode === 'buy') && (
                <div className="p-3 rounded-2xl bg-indigo-950/70 border border-indigo-400/50 space-y-2 md:col-span-2 lg:col-span-3">
                  <span className="font-bold text-[11px] text-amber-300 block">
                    {auditMode === 'sell' ? 'बाय-बैक सत्यापन (Sell Intake Protocol):' : 'सर्टिफाइड डिस्पैच चेक (Pre-Delivery Protocol):'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ceirVerified}
                        onChange={e => setCeirVerified(e.target.checked)}
                        className="w-3.5 h-3.5 accent-emerald-500"
                      />
                      <span className="text-white font-bold text-[11px]">CEIR सरकारी एंटी-थेफ्ट पोर्टल पास</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={boxCharger}
                        onChange={e => setBoxCharger(e.target.checked)}
                        className="w-3.5 h-3.5 accent-emerald-500"
                      />
                      <span className="text-white font-bold text-[11px]">ओरिजिनल बिल, बॉक्स व चार्जर</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={qcSealAttached}
                        onChange={e => setQcSealAttached(e.target.checked)}
                        className="w-3.5 h-3.5 accent-emerald-500"
                      />
                      <span className="text-white font-bold text-[11px]">सस्ताफोन 32-पॉइंट होलोग्राफिक सील</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION B: SURAT PRICE LIST & SERVICE ADJUSTMENT ENGINE */}
          <div className="p-4 rounded-3xl bg-slate-800/90 border-2 border-amber-400/60 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h6 className="font-black text-sm text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-400" />
                  <span>सूरत सर्विस प्राइस लिस्ट से काम जोड़ें / घटाएं (Service & Invoice Engine):</span>
                </h6>
                <p className="text-[11px] text-slate-300">
                  हमारे सूरत सर्विस हब के मानक रेट्स में से सेलेक्ट करें, डिस्काउंट दें और ग्राहक का फाइनल बिल तैयार करें।
                </p>
              </div>

              {/* Preset Discount Shortcuts */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-bold">शॉर्टकट:</span>
                <button
                  type="button"
                  onClick={() => handleApplyPresetDiscount(12, 1600)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                    finalQuote === 1600
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md ring-2 ring-emerald-400/50'
                      : 'bg-slate-900 text-emerald-300 border-emerald-500/50 hover:bg-emerald-950/40'
                  }`}
                  title="12% डिस्काउंट देकर ₹1,600 करें"
                >
                  ⭐ 12% Off (₹1,600)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetDiscount(10, 1700)}
                  className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-900 text-amber-300 border border-amber-500/50 hover:bg-amber-950/40 cursor-pointer"
                >
                  10% Off (₹1,700)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetDiscount(0, subtotal || order.amount)}
                  className="px-2 py-1 rounded-xl text-[11px] font-bold bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-800 cursor-pointer"
                >
                  रीसेट
                </button>
              </div>
            </div>

            {/* Catalog Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {SURAT_PRICE_CATALOG.map(item => {
                const isSelected = selectedServices.some(s => s.name === item.name);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleToggleService(item)}
                    className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-blue-600/90 text-white border-blue-400 shadow-sm ring-1 ring-blue-400'
                        : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold block leading-tight">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-amber-300 font-mono block">
                        मानक: {item.priceRange}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-black block">
                        ₹{item.defaultPrice}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white text-blue-900' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isSelected ? '✓ जोड़ा गया' : '+ जोड़ें'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Price Inputs & Dynamic Warranty Display */}
            <div className="pt-2 border-t border-slate-700 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-4 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block">
                  फाइनल कस्टमर बिल (₹):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-amber-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    value={finalQuote}
                    onChange={e => {
                      const val = parseInt(e.target.value) || 0;
                      setFinalQuote(val);
                    }}
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-900 border-2 border-amber-400 font-mono font-black text-base text-amber-300 focus:outline-none"
                  />
                </div>
              </div>

              {/* DYNAMIC WARRANTY NOTICE (User Rule: < 1k = 3M, >= 1k = 6M) */}
              <div className="sm:col-span-8 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 block">
                  लागू वारंटी पॉलिसी (ऑटो-कैलकुलेटेड):
                </label>
                <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                  calculatedWarrantyMonths === 6
                    ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200'
                    : 'bg-amber-950/60 border-amber-400 text-amber-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-amber-300" />
                    <div>
                      <span className="font-black text-xs block text-white">
                        {calculatedWarrantyMonths === 6
                          ? '🛡️ 6 महीने फुल वारंटी (₹1,000 या अधिक का बिल)'
                          : '🛡️ 3 महीने पार्ट वारंटी (₹1,000 से कम का बिल)'}
                      </span>
                      <span className="text-[10px] opacity-90 block">
                        सूरत नियम: ₹1k से कम काम पर 3 माह, ₹1k व अधिक पर 6 माह फुल वारंटी।
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black font-mono px-2 py-0.5 rounded-full bg-white/20 text-white shrink-0">
                    {calculatedWarrantyMonths} Months
                  </span>
                </div>
              </div>
            </div>

            {/* Custom Technician Remark */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 block">
                ग्राहक को जाने वाला टेक्नीशियन ऑडिट रिमार्क / स्पष्टीकरण:
              </label>
              <input
                type="text"
                value={techNotes}
                onChange={e => setTechNotes(e.target.value)}
                placeholder="कैमरा OIS री-अलाइनमेंट पूर्ण, 100% ओरिजिनल लेंस फिटिंग व 6 महीने फुल वारंटी लागू..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* SECTION C: ACTION TOOLBAR - RETURN WHATSAPP INVOICE & PAYMENT DETAILS */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border-2 border-emerald-500 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ग्राहक WhatsApp रिटर्न इंजन (One-Click Return):</span>
                </span>
                <h6 className="font-black text-sm text-white">
                  सीधे ग्राहक ({order.customerPhone}) के WhatsApp पर Pro-Audit रिपोर्ट, इनवॉइस व UPI पेमेंट भेजें
                </h6>
                <p className="text-[11px] text-slate-300">
                  UPI ID: <strong className="font-mono text-amber-300">9372802044@okbizaxis</strong> • GPay / PhonePe / Paytm: 9372802044
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleSaveAuditOnly}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-600 transition-all"
                  title="केवल डेटाबेस में सहेजें"
                >
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>ऑडिट सहेजें</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-600 transition-all"
                  title="संदेश कॉपी करें"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isCopied ? 'कॉपी हुआ ✓' : 'मैसेज कॉपी'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendToWhatsApp}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg cursor-pointer transition-transform hover:scale-102"
                >
                  <MessageCircle className="w-4 h-4 fill-slate-950" />
                  <span>📲 WhatsApp पर इनवॉइस व UPI भेजें</span>
                </button>
              </div>
            </div>

            {/* Sent Status Banner */}
            {isSentToWhatsApp && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  ✓ ग्राहक {order.customerName} के WhatsApp ({order.customerPhone}) पर Pro-Audit सर्टिफिकेट, इनवॉइस व ₹{finalQuote.toLocaleString('en-IN')} का UPI पेमेंट विवरण सफलता से प्रेषित!
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
