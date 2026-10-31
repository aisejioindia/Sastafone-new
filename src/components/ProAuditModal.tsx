import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProAuditVerification } from '../types';
import { SURAT_PRICE_CATALOG, SuratServiceItem } from './TechnicianProAuditIntake';
import { formatINR } from '../utils/valuation';
import {
  ShieldCheck,
  CheckCircle2,
  X,
  Smartphone,
  Camera,
  Volume2,
  Zap,
  Droplets,
  Award,
  MessageCircle,
  Tag,
  Copy,
  Percent,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ProAuditModal: React.FC = () => {
  const {
    isProAuditModalOpen,
    setIsProAuditModalOpen,
    selectedAuditOrder,
    saveOrderProAudit,
    setOrderAdminQuote,
    updateOrder,
    user
  } = useApp();

  // Audit Form States
  const [imeiInput, setImeiInput] = useState(
    selectedAuditOrder?.proAudit?.imei || '358921094821034'
  );
  const [imeiMatched, setImeiMatched] = useState(
    selectedAuditOrder?.proAudit?.imeiMatched ?? true
  );

  // 9-Point Touch Grid (indices 0 to 8)
  const [touchGrid, setTouchGrid] = useState<boolean[]>(() => [
    true, true, true, true, true, true, true, true, true
  ]);

  const [screenDisplayCheck, setScreenDisplayCheck] = useState<
    'flawless' | 'minor_scratches' | 'replaced_tested' | 'dead_pixels'
  >(selectedAuditOrder?.proAudit?.screenDisplayCheck || 'replaced_tested');

  // Cameras
  const [rearCameraCheck, setRearCameraCheck] = useState(
    selectedAuditOrder?.proAudit?.rearCameraCheck ?? true
  );
  const [frontCameraCheck, setFrontCameraCheck] = useState(
    selectedAuditOrder?.proAudit?.frontCameraCheck ?? true
  );
  const [cameraAutofocusCheck, setCameraAutofocusCheck] = useState(
    selectedAuditOrder?.proAudit?.cameraAutofocusCheck ?? true
  );

  // Audio & Sensors
  const [micEarpieceCheck, setMicEarpieceCheck] = useState(
    selectedAuditOrder?.proAudit?.micEarpieceCheck ?? true
  );
  const [loudspeakerCheck, setLoudspeakerCheck] = useState(
    selectedAuditOrder?.proAudit?.loudspeakerCheck ?? true
  );
  const [proximitySensorCheck, setProximitySensorCheck] = useState(
    selectedAuditOrder?.proAudit?.proximitySensorCheck ?? true
  );
  const [biometricsCheck, setBiometricsCheck] = useState(
    selectedAuditOrder?.proAudit?.biometricsCheck ?? true
  );
  const [wifiBluetoothCheck, setWifiBluetoothCheck] = useState(
    selectedAuditOrder?.proAudit?.wifiBluetoothCheck ?? true
  );
  const [networkSimCheck, setNetworkSimCheck] = useState(
    selectedAuditOrder?.proAudit?.networkSimCheck ?? true
  );
  const [buttonsCheck, setButtonsCheck] = useState(
    selectedAuditOrder?.proAudit?.buttonsCheck ?? true
  );

  // Physical seal & body
  const [screwSealIntact, setScrewSealIntact] = useState(
    selectedAuditOrder?.proAudit?.screwSealIntact ?? true
  );
  const [bodyConditionCheck, setBodyConditionCheck] = useState<'flawless' | 'minor_scratches' | 'dents' | 'bent'>(
    selectedAuditOrder?.proAudit?.bodyConditionCheck || 'minor_scratches'
  );

  // Water & Battery
  const [lciWaterMarkerStatus, setLciWaterMarkerStatus] = useState<
    'dry_white_ok' | 'red_liquid_contact' | 'repaired'
  >(selectedAuditOrder?.proAudit?.lciWaterMarkerStatus || 'dry_white_ok');
  const [batteryHealthPct, setBatteryHealthPct] = useState<number>(
    selectedAuditOrder?.proAudit?.batteryHealthPct || 94
  );
  const [chargingCurrentDrawAmps, setChargingCurrentDrawAmps] = useState<number>(
    selectedAuditOrder?.proAudit?.chargingCurrentDrawAmps || 2.4
  );

  // Services & Billing
  const [selectedServices, setSelectedServices] = useState<{ name: string; price: number; category?: string }[]>(
    selectedAuditOrder?.proAudit?.selectedServices || [
      { name: 'कैमरा लेंस ग्लास / OIS मोटर री-अलाइनमेंट', price: 699, category: 'camera' },
      { name: 'ओरिजिनल डिस्प्ले / AMOLED स्क्रीन पैनल रिप्लेसमेंट', price: 1699, category: 'screen' }
    ]
  );
  const subtotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const [finalQuote, setFinalQuote] = useState<number>(
    selectedAuditOrder?.finalQuoteAmount || (subtotal > 0 ? subtotal : selectedAuditOrder?.amount || 1600)
  );
  const [discountOfferedPct, setDiscountOfferedPct] = useState<number>(
    selectedAuditOrder?.discountOfferedPct || (finalQuote === 1600 ? 12 : 0)
  );

  // User Warranty Rule: < 1000 = 3M, >= 1000 = 6M
  const calculatedWarrantyMonths = finalQuote < 1000 ? 3 : 6;
  const warrantyLabel = finalQuote < 1000 ? '3 महीने वारंटी (₹1k से कम)' : '6 महीने फुल वारंटी (₹1k या अधिक)';

  const [technicianNotes, setTechnicianNotes] = useState(
    selectedAuditOrder?.proAudit?.technicianNotes ||
      'कैमरा सेंसर री-एलाइनमेंट व डस्ट-फ्री लेन्स टेस्टिंग सफल। 100% रिस्पॉन्सिव टच व ज़ीरो डेड-ज़ोन प्रमाणित।'
  );

  const [auditorName, setAuditorName] = useState(
    selectedAuditOrder?.proAudit?.auditorName || 'संजय प्रजापति (सस्ताफोन ओनर व सर्टिफाइड टेक लीड, सूरत)'
  );

  const [isCopied, setIsCopied] = useState(false);
  const [isSentToWhatsApp, setIsSentToWhatsApp] = useState(false);

  // Pro-Audit is strictly accessible by Admin (Shopkeeper / Owner Technician)
  if (!isProAuditModalOpen || !selectedAuditOrder || user.role !== 'admin') return null;

  const handleToggleTouchPoint = (index: number) => {
    setTouchGrid(prev => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const touchPassedCount = touchGrid.filter(Boolean).length;
  const isAllTouchPassed = touchPassedCount === 9;

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
      setFinalQuote(Math.round(newSubtotal * (1 - discountOfferedPct / 100)));
    } else {
      setFinalQuote(newSubtotal || selectedAuditOrder.amount);
    }
  };

  const handleApplyPresetDiscount = (pct: number, forcedAmount?: number) => {
    setDiscountOfferedPct(pct);
    if (forcedAmount !== undefined) {
      setFinalQuote(forcedAmount);
    } else {
      const discounted = Math.round((subtotal || selectedAuditOrder.amount) * (1 - pct / 100));
      setFinalQuote(discounted);
    }
  };

  const buildAuditData = (): ProAuditVerification => ({
    imei: imeiInput,
    imeiMatched,
    touchSensitivity: isAllTouchPassed ? 'passed' : 'tested',
    screenDisplayCheck,
    frontCameraCheck,
    rearCameraCheck,
    cameraAutofocusCheck,
    micEarpieceCheck,
    loudspeakerCheck,
    proximitySensorCheck,
    biometricsCheck,
    wifiBluetoothCheck,
    networkSimCheck,
    buttonsCheck,
    screwSealIntact,
    bodyConditionCheck,
    chargingCurrentDrawAmps,
    batteryHealthPct,
    lciWaterMarkerStatus,
    technicianNotes,
    auditPassed: imeiMatched && rearCameraCheck && frontCameraCheck && isAllTouchPassed,
    auditTimestamp: new Date().toLocaleDateString('hi-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    auditorName,
    selectedServices,
    warrantyMonths: calculatedWarrantyMonths,
    warrantyType: warrantyLabel
  });

  const handleSubmitAudit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const auditData = buildAuditData();
    saveOrderProAudit(selectedAuditOrder.id, auditData);
    setOrderAdminQuote(selectedAuditOrder.id, finalQuote, discountOfferedPct, technicianNotes);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    setIsProAuditModalOpen(false);
  };

  const generateWhatsAppMessage = () => {
    const servicesListText = selectedServices.length > 0
      ? selectedServices.map(s => `  • ${s.name}: ₹${s.price.toLocaleString('en-IN')}`).join('\n')
      : `  • स्वीकृत रिपेयरिंग/सर्विस जॉब: ₹${finalQuote.toLocaleString('en-IN')}`;

    return `📱 *सस्ताफोन सूरत (Sastaphone Surat) - आधिकारिक Pro-Audit व फाइनल इनवॉइस*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧾 *जॉब इनवॉइस नंबर:* #${selectedAuditOrder.invoiceNumber || selectedAuditOrder.orderNumber}
👤 *ग्राहक:* ${selectedAuditOrder.customerName}
📱 *स्मार्टफोन:* ${selectedAuditOrder.title}
📍 *सूरत लोकेशन:* ${selectedAuditOrder.locality || 'Adajan / Surat'}

🔍 *सूरत सेंट्रल लैब Technician Pro-Audit रिपोर्ट:*
✓ IMEI 1: ${imeiInput} (${imeiMatched ? 'बिल/बॉक्स से सत्यापित' : 'सत्यापित'})
✓ 9-पॉइंट टच व डिस्प्ले: ${isAllTouchPassed ? '✓ 100% पास (9/9 ग्रिड OK)' : 'टेस्टेड'}
✓ बैटरी हेल्थ बैकअप: ${batteryHealthPct}% (चार्जिंग करंट: ${chargingCurrentDrawAmps}A)
✓ कैमरा व OIS लेज़र ऑटोफोकस: ${cameraAutofocusCheck && rearCameraCheck ? '100% क्लियर व टेस्टेड' : 'टेस्टेड'}
✓ LCI वाटर मार्कर: ${lciWaterMarkerStatus === 'dry_white_ok' ? '⚪ नो वाटर कांटेक्ट (सेफ)' : 'सत्यापित'}
✓ माइक, ईयरपीस व लाउडस्पीकर: OK
✓ नेटवर्क सिम, वाईफाई व बायोमेट्रिक्स: पास

🛠️ *स्वीकृत काम व पार्ट्स विवरण (Surat Price List):*
${servicesListText}
${discountOfferedPct > 0 ? `🎁 *विशेष एडमिन डिस्काउंट:* ${discountOfferedPct}% ऑफ लागू` : ''}

💰 *फाइनल देय राशि (Payable Bill):* ₹${finalQuote.toLocaleString('en-IN')}
(₹199 विज़िट टोकन पहले से एडजस्टेड)

🛡️ *सस्ताफोन आधिकारिक वारंटी:*
${calculatedWarrantyMonths === 6 ? '🛡️ 6 महीने की फुल रिप्लेसमेंट वारंटी (बिल ₹1,000+)' : '🛡️ 3 महीने की पार्ट वारंटी (बिल < ₹1,000)'}

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
    // Save audit and quote
    const auditData = buildAuditData();
    saveOrderProAudit(selectedAuditOrder.id, auditData);
    setOrderAdminQuote(selectedAuditOrder.id, finalQuote, discountOfferedPct, technicianNotes);
    updateOrder(selectedAuditOrder.id, { invoiceSentToCustomer: true });

    const msg = generateWhatsAppMessage();
    const cleanCustomerPhone = (selectedAuditOrder.customerPhone || '').replace(/\D/g, '').slice(-10);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md font-black text-lg">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Pro-Audit Lab Checklist
                </span>
                <span className="text-xs text-blue-200 font-mono">
                  {selectedAuditOrder.orderNumber}
                </span>
                <span className="text-[10px] font-bold bg-blue-900/60 text-blue-200 border border-blue-400/40 px-2 py-0.5 rounded-full">
                  {selectedAuditOrder.type === 'repair' ? 'रिपेयरिंग जॉब' : selectedAuditOrder.type === 'sell' ? 'बाय-बैक खरीद' : 'सर्टिफाइड सेल'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                हार्डवेयर प्री-डिलीवरी व रिसीविंग वेरिफिकेशन ऑडिट
              </h3>
              <p className="text-[11px] text-slate-300">
                डिवाइस: <strong>{selectedAuditOrder.title}</strong> • ग्राहक: {selectedAuditOrder.customerName} ({selectedAuditOrder.customerPhone})
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsProAuditModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Audit Form Body */}
        <form onSubmit={handleSubmitAudit} className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-800 flex-1">
          {/* Audit Notification Banner */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex items-center gap-2.5 text-blue-950">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <p className="text-[11px] leading-relaxed">
              सूरत Sastaphone सुरक्षा नियम: फोन हैंडओवर या फाइनल बिल भुगतान से पहले प्रत्येक पार्ट की वास्तविक हार्डवेयर टेस्टिंग, सूरत प्राइस लिस्ट अनुसार इनवॉइस व डिजिटल वारंटी जारी करना अनिवार्य है।
            </p>
          </div>

          {/* Step 1: IMEI Check */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                <span>IMEI व ओरिजिनल डिवाइस सत्यापन (*#06# जांच)</span>
              </h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                imeiMatched ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {imeiMatched ? '✓ IMEI मैच हुआ' : '⚠️ मिसमैच'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                  डिवाइस IMEI 1 (डायलर से *#06# डायल करें):
                </label>
                <input
                  type="text"
                  required
                  value={imeiInput}
                  onChange={e => setImeiInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-white text-slate-950"
                  placeholder="358921094821034"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 w-full cursor-pointer hover:bg-slate-100/50">
                  <input
                    type="checkbox"
                    checked={imeiMatched}
                    onChange={e => setImeiMatched(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer accent-emerald-600"
                  />
                  <span className="text-[11px] font-bold text-slate-800">
                    बिल, बॉक्स व फोन का IMEI पूर्णतः मैच है
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Step 2: 9-Point Touch Grid Test */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">2</span>
                <span>9-पॉइंट टच सेंसिटिविटी व स्क्रीन ग्रिड टेस्ट</span>
              </h4>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                isAllTouchPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
              }`}>
                {touchPassedCount}/9 क्वाड्रंट्स एक्टिव
              </span>
            </div>

            <p className="text-[11px] text-slate-500">
              प्रत्येक ब्लॉक पर टैप करके जांचें कि टच स्क्रीन में कोई डेड-ज़ोन या घोस्ट टच नहीं है:
            </p>

            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto py-2">
              {touchGrid.map((passed, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleToggleTouchPoint(idx)}
                  className={`h-11 rounded-xl font-black text-xs flex items-center justify-center transition-all cursor-pointer ${
                    passed
                      ? 'bg-emerald-600 text-white shadow-xs scale-102 border-2 border-emerald-500'
                      : 'bg-slate-200 text-slate-500 border-2 border-dashed border-slate-300 hover:bg-slate-300'
                  }`}
                >
                  {passed ? '✓ OK' : `Q${idx + 1}`}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] text-slate-500">स्क्रीन कंडीशन स्टेटस:</span>
              <div className="flex gap-2">
                {[
                  { id: 'replaced_tested', label: 'नया टेस्टेड डिस्प्ले ✓' },
                  { id: 'flawless', label: 'ओरिजिनल 100%' },
                  { id: 'minor_scratches', label: 'माइनर स्क्रैच' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setScreenDisplayCheck(item.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                      screenDisplayCheck === item.id
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: Camera Sensor & OIS Autofocus Test */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <h4 className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">3</span>
              <span>कैमरा सेंसर, OIS स्टेबलाइजर व ऑटोफोकस जांच</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <label className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 cursor-pointer hover:bg-slate-100/50">
                <input
                  type="checkbox"
                  checked={rearCameraCheck}
                  onChange={e => setRearCameraCheck(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer accent-emerald-600"
                />
                <span className="font-bold text-[11px] text-slate-800">
                  रियर मेन कैमरा लेंस क्लियर
                </span>
              </label>

              <label className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 cursor-pointer hover:bg-slate-100/50">
                <input
                  type="checkbox"
                  checked={cameraAutofocusCheck}
                  onChange={e => setCameraAutofocusCheck(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer accent-emerald-600"
                />
                <span className="font-bold text-[11px] text-slate-800">
                  OIS मोटर व लेज़र ऑटोफोकस OK
                </span>
              </label>

              <label className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 cursor-pointer hover:bg-slate-100/50">
                <input
                  type="checkbox"
                  checked={frontCameraCheck}
                  onChange={e => setFrontCameraCheck(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer accent-emerald-600"
                />
                <span className="font-bold text-[11px] text-slate-800">
                  फ्रंट सेल्फी कैमरा शार्प
                </span>
              </label>
            </div>
          </div>

          {/* Step 4: Audio, Connectivity, Biometrics & Buttons */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <h4 className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">4</span>
              <span>ऑडियो, कनेक्टिविटी, बायोमेट्रिक्स व हार्डवेयर बटन</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1 text-[11px]">
              <label className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={micEarpieceCheck}
                  onChange={e => setMicEarpieceCheck(e.target.checked)}
                  className="w-3.5 h-3.5 accent-emerald-600"
                />
                <span className="font-semibold text-slate-800">माइक व ईयरपीस</span>
              </label>

              <label className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={loudspeakerCheck}
                  onChange={e => setLoudspeakerCheck(e.target.checked)}
                  className="w-3.5 h-3.5 accent-emerald-600"
                />
                <span className="font-semibold text-slate-800">लाउडस्पीकर</span>
              </label>

              <label className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={networkSimCheck}
                  onChange={e => setNetworkSimCheck(e.target.checked)}
                  className="w-3.5 h-3.5 accent-emerald-600"
                />
                <span className="font-semibold text-slate-800">सिम 4G/5G</span>
              </label>

              <label className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wifiBluetoothCheck}
                  onChange={e => setWifiBluetoothCheck(e.target.checked)}
                  className="w-3.5 h-3.5 accent-emerald-600"
                />
                <span className="font-semibold text-slate-800">WiFi व ब्लूटूथ</span>
              </label>

              <label className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={biometricsCheck}
                  onChange={e => setBiometricsCheck(e.target.checked)}
                  className="w-3.5 h-3.5 accent-emerald-600"
                />
                <span className="font-semibold text-slate-800">फिंगरप्रिंट / फेस ID</span>
              </label>

              <label className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={buttonsCheck}
                  onChange={e => setButtonsCheck(e.target.checked)}
                  className="w-3.5 h-3.5 accent-emerald-600"
                />
                <span className="font-semibold text-slate-800">बटन (Power/Vol)</span>
              </label>
            </div>
          </div>

          {/* Step 5: LCI Water Marker & Battery Draw */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <h4 className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">5</span>
              <span>मदरबोर्ड LCI वाटर मार्कर व बैटरी वोल्टेज</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                  वाटर डैमेज मार्कर (LCI स्टीकर):
                </label>
                <select
                  value={lciWaterMarkerStatus}
                  onChange={e => setLciWaterMarkerStatus(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-xs bg-white text-slate-950"
                >
                  <option value="dry_white_ok">⚪ ड्राई व्हाइट (नो वाटर डैमेज - 100% सेफ)</option>
                  <option value="red_liquid_contact">🔴 रेड मार्कर (वाटर कांटेक्ट डिटेक्टेड)</option>
                  <option value="repaired">🟡 लैब अल्ट्रासोनिक डी-ऑक्सीडाइज्ड</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                  चार्जिंग करंट ड्रॉ (Amps):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={chargingCurrentDrawAmps}
                  onChange={e => setChargingCurrentDrawAmps(parseFloat(e.target.value) || 2.0)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-white text-slate-950"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                  बैटरी हेल्थ (%):
                </label>
                <input
                  type="number"
                  value={batteryHealthPct}
                  onChange={e => setBatteryHealthPct(parseInt(e.target.value) || 90)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-white text-slate-950"
                />
              </div>
            </div>
          </div>

          {/* Step 6: Surat Service Price Catalog & Dynamic Warranty */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-300 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-black text-slate-950 text-xs sm:text-sm flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-700" />
                  <span>सूरत सर्विस प्राइस लिस्ट व वारंटी इंजन:</span>
                </h4>
                <p className="text-[11px] text-slate-600">
                  काम सेलेक्ट करें और डिस्काउंट के साथ फाइनल बिल तय करें:
                </p>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-500 font-bold">शॉर्टकट:</span>
                <button
                  type="button"
                  onClick={() => handleApplyPresetDiscount(12, 1600)}
                  className="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-600 text-white shadow-xs cursor-pointer"
                >
                  12% Off (₹1,600) ⭐
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetDiscount(10, 1700)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-amber-900 border border-amber-300 cursor-pointer"
                >
                  10% Off (₹1,700)
                </button>
              </div>
            </div>

            {/* Quick Service Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SURAT_PRICE_CATALOG.slice(0, 6).map(item => {
                const isSelected = selectedServices.some(s => s.name === item.name);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleToggleService(item)}
                    className={`p-2 rounded-xl text-left border text-[11px] flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 font-bold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.name}</span>
                    <span className="font-mono font-bold shrink-0">₹{item.defaultPrice}</span>
                  </button>
                );
              })}
            </div>

            {/* Final Bill & Warranty Rule Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-2 border-t border-amber-200">
              <div className="sm:col-span-4">
                <label className="text-[10px] font-bold text-slate-600 block mb-1">
                  फाइनल कस्टमर बिल (₹):
                </label>
                <input
                  type="number"
                  value={finalQuote}
                  onChange={e => setFinalQuote(parseInt(e.target.value) || 0)}
                  className="w-full p-2 rounded-xl border-2 border-amber-400 font-black text-sm bg-white text-slate-950 font-mono"
                />
              </div>

              <div className="sm:col-span-8">
                <label className="text-[10px] font-bold text-slate-600 block mb-1">
                  लागू वारंटी (सूरत नियम: &lt;₹1k = 3M, &gt;=₹1k = 6M):
                </label>
                <div className={`p-2 rounded-xl font-bold text-xs flex items-center justify-between border ${
                  calculatedWarrantyMonths === 6
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}>
                  <span>{warrantyLabel}</span>
                  <span className="font-mono">{calculatedWarrantyMonths} Months</span>
                </div>
              </div>
            </div>
          </div>

          {/* Technician Notes & Signature */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 block">
              सर्टिफाइड टेक्नीशियन ऑडिट रिमार्क व निष्कर्ष:
            </label>
            <textarea
              rows={2}
              value={technicianNotes}
              onChange={e => setTechnicianNotes(e.target.value)}
              className="w-full p-3 rounded-2xl border border-slate-300 text-xs text-slate-800"
            />
          </div>

          {/* Footer & WhatsApp Return Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">जांचकर्ता टेक्नीशियन:</span>
              <input
                type="text"
                value={auditorName}
                onChange={e => setAuditorName(e.target.value)}
                className="font-bold text-xs text-slate-900 border-b border-slate-300 bg-transparent py-0.5"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleCopyMessage}
                className="px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{isCopied ? 'कॉपी हुआ ✓' : 'मैसेज कॉपी'}</span>
              </button>

              <button
                type="button"
                onClick={handleSendToWhatsApp}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>📲 WhatsApp पर इनवॉइस भेजें</span>
              </button>

              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>सर्टिफिकेट सहेजें</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
