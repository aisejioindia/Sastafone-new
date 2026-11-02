import React, { useState } from 'react';
import { OrderItem } from '../types';
import { formatINR } from '../utils/valuation';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Wrench,
  Smartphone,
  Battery,
  Camera,
  Volume2,
  Wifi,
  Sparkles,
  Save,
  Printer,
  X,
  FileText,
  Clock,
  User,
  MapPin,
  Check,
  AlertTriangle,
  RotateCcw,
  Zap,
  Lock,
  ExternalLink,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { updateOrderInFirestore } from '../services/firebaseDbService';

interface DynamicRepairChecklistModalProps {
  order: OrderItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveChecklist: (orderId: string, checklist: NonNullable<OrderItem['repairChecklist']>) => void;
}

export const DynamicRepairChecklistModal: React.FC<DynamicRepairChecklistModalProps> = ({
  order,
  isOpen,
  onClose,
  onSaveChecklist
}) => {
  if (!isOpen || !order) return null;

  const existing = order.repairChecklist;

  // 10 Core Hardware Checkpoints
  const [screenWorking, setScreenWorking] = useState(existing?.screenWorking ?? true);
  const [touchDigitizerPassed, setTouchDigitizerPassed] = useState(existing?.touchDigitizerPassed ?? true);
  const [batteryChargingOk, setBatteryChargingOk] = useState(existing?.batteryChargingOk ?? true);
  const [batteryHealthPct, setBatteryHealthPct] = useState(existing?.batteryHealthPct ?? 94);
  const [camerasPassed, setCamerasPassed] = useState(existing?.camerasPassed ?? true);
  const [audioMicSpeakerOk, setAudioMicSpeakerOk] = useState(existing?.audioMicSpeakerOk ?? true);
  const [networkWifiBtOk, setNetworkWifiBtOk] = useState(existing?.networkWifiBtOk ?? true);
  const [lciWaterDamageFree, setLciWaterDamageFree] = useState(existing?.lciWaterDamageFree ?? true);
  const [bodyAndScrewsIntact, setBodyAndScrewsIntact] = useState(existing?.bodyAndScrewsIntact ?? true);
  const [buttonsBiometricsOk, setButtonsBiometricsOk] = useState(existing?.buttonsBiometricsOk ?? true);

  // Parts Replaced & Work Log
  const [partsList, setPartsList] = useState<string[]>(existing?.partsReplacedList ?? [
    'ओरिजिनल डिस्प्ले / टच ग्लास',
    'OIS कैमरा लेंस मोटर री-अलाइनमेंट'
  ]);
  const [customPartInput, setCustomPartInput] = useState('');
  const [technicianName, setTechnicianName] = useState(existing?.technicianName || 'संजय प्रजापति (सर्टिफाइड टेक लीड)');
  const [technicianNotes, setTechnicianNotes] = useState(
    existing?.technicianNotes || 'सूरत लैब BGA सोल्डरिंग व OCA लैमिनेशन पूर्ण हुआ। 6 माह वारंटी जारी।'
  );
  const [jobStatus, setJobStatus] = useState<'in_progress' | 'qc_passed' | 'ready_for_handover'>(
    existing?.status ?? 'qc_passed'
  );

  const [activeTab, setActiveTab] = useState<'checklist' | 'parts' | 'print'>('checklist');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Dynamic QC Calculation
  const checkValues = [
    screenWorking,
    touchDigitizerPassed,
    batteryChargingOk,
    camerasPassed,
    audioMicSpeakerOk,
    networkWifiBtOk,
    lciWaterDamageFree,
    bodyAndScrewsIntact,
    buttonsBiometricsOk
  ];
  const passedCount = checkValues.filter(Boolean).length;
  const qcScorePct = Math.round((passedCount / checkValues.length) * 100);

  const handleTogglePart = (part: string) => {
    if (partsList.includes(part)) {
      setPartsList(partsList.filter(p => p !== part));
    } else {
      setPartsList([...partsList, part]);
    }
  };

  const handleAddCustomPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPartInput.trim() && !partsList.includes(customPartInput.trim())) {
      setPartsList([...partsList, customPartInput.trim()]);
      setCustomPartInput('');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    const checklistData: NonNullable<OrderItem['repairChecklist']> = {
      screenWorking,
      touchDigitizerPassed,
      batteryChargingOk,
      batteryHealthPct,
      camerasPassed,
      audioMicSpeakerOk,
      networkWifiBtOk,
      lciWaterDamageFree,
      bodyAndScrewsIntact,
      buttonsBiometricsOk,
      replacedParts: partsList,
      partsReplacedList: partsList,
      technicianName,
      qualityScorePercent: qcScorePct,
      qcPassPct: qcScorePct,
      jobStatus,
      status: jobStatus,
      technicianNotes,
      completedAt: new Date().toISOString()
    };

    // 1. Update local App State
    onSaveChecklist(order.id, checklistData);

    // 2. Instantly Sync to Firebase Firestore
    await updateOrderInFirestore(order.id, {
      repairChecklist: checklistData,
      status: jobStatus === 'ready_for_handover' ? 'technician_assigned' : 'in_inspection',
      statusHindi: qcScorePct === 100 ? 'हार्डवेयर चेकलिस्ट 100% पास • हैंडओवर तैयार' : `हार्डवेयर चेकलिस्ट ${qcScorePct}% पास`
    });

    setIsSaving(false);
    setSaveSuccess(true);
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-4 sm:p-5 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Wrench className="w-3 h-3 text-slate-950" />
              डायनेमिक रिपेयर चेकलिस्ट टूल
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold">
              जॉब #{order.orderNumber}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
            <span>{order.title}</span>
          </h3>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1">
            <span>👤 ग्राहक: <strong>{order.customerName}</strong></span>
            <span>📍 {order.locality}</span>
            <span>💰 विज़िट टोकन: <strong className="text-emerald-400">₹{order.amount}</strong></span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'checklist'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              📋 हार्डवेयर चेकलिस्ट ({passedCount}/9)
            </button>
            <button
              onClick={() => setActiveTab('parts')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'parts'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              🔧 पार्ट्स व वर्क लॉग ({partsList.length})
            </button>
            <button
              onClick={() => setActiveTab('print')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'print'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              🖨️ जॉब शीट प्रिव्यू
            </button>
          </div>

          {/* Real-time QC Badge */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 font-bold hidden sm:inline">QC स्कोर:</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
              qcScorePct === 100
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}>
              {qcScorePct}% Pass
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {saveSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center justify-between animate-in fade-in">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                चेकलिस्ट सफलतापूर्वक अपडेट हुई और फायरबेस डेटाबेस में तुरंत सिंक हो गई!
              </span>
              <span className="text-[10px] bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded-full">
                Live Synced
              </span>
            </div>
          )}

          {/* TAB 1: 9-POINT HARDWARE CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-1 border-b border-slate-100">
                <span>हार्डवेयर कंपोनेंट एवं सेंसर जांच</span>
                <span className="text-slate-400 text-[11px]">क्लिक करके टॉगल करें (पास / समस्या)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. Screen & AMOLED */}
                <div
                  onClick={() => setScreenWorking(!screenWorking)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    screenWorking
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-rose-50/70 border-rose-300 text-rose-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-bold text-xs">स्क्रीन व AMOLED डिस्प्ले</p>
                      <p className="text-[10px] text-slate-500">कोई लाइन या फ्लिकरिंग नहीं</p>
                    </div>
                  </div>
                  {screenWorking ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-black text-[10px]">PASS</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-[10px]">FAIL</span>
                  )}
                </div>

                {/* 2. Touch Digitizer */}
                <div
                  onClick={() => setTouchDigitizerPassed(!touchDigitizerPassed)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    touchDigitizerPassed
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-rose-50/70 border-rose-300 text-rose-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <div>
                      <p className="font-bold text-xs">टच स्क्रीन सेंसिटिविटी</p>
                      <p className="text-[10px] text-slate-500">9-पॉइंट फुल टच रिस्पॉन्स</p>
                    </div>
                  </div>
                  {touchDigitizerPassed ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-black text-[10px]">PASS</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-[10px]">FAIL</span>
                  )}
                </div>

                {/* 3. Battery & Fast Charging */}
                <div
                  onClick={() => setBatteryChargingOk(!batteryChargingOk)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    batteryChargingOk
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-rose-50/70 border-rose-300 text-rose-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Battery className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="font-bold text-xs">बैटरी व फास्ट चार्जिंग पोर्ट</p>
                      <p className="text-[10px] text-slate-500">करंट ड्रॉ 5V/2A • हेल्थ: {batteryHealthPct}%</p>
                    </div>
                  </div>
                  {batteryChargingOk ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-black text-[10px]">PASS</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-[10px]">FAIL</span>
                  )}
                </div>

                {/* 4. Cameras & OIS */}
                <div
                  onClick={() => setCamerasPassed(!camerasPassed)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    camerasPassed
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-rose-50/70 border-rose-300 text-rose-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Camera className="w-4 h-4 text-rose-600" />
                    <div>
                      <p className="font-bold text-xs">फ्रंट व रियर कैमरा + फोकस</p>
                      <p className="text-[10px] text-slate-500">4K ऑटोफोकस व OIS मोटर टेस्टेड</p>
                    </div>
                  </div>
                  {camerasPassed ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-black text-[10px]">PASS</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-[10px]">FAIL</span>
                  )}
                </div>

                {/* 5. Audio, Mic & Speaker */}
                <div
                  onClick={() => setAudioMicSpeakerOk(!audioMicSpeakerOk)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    audioMicSpeakerOk
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-rose-50/70 border-rose-300 text-rose-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Volume2 className="w-4 h-4 text-purple-600" />
                    <div>
                      <p className="font-bold text-xs">ईयरपीस, माइक व लाउडस्पीकर</p>
                      <p className="text-[10px] text-slate-500">क्रिस्टल क्लियर स्टीरियो साउंड</p>
                    </div>
                  </div>
                  {audioMicSpeakerOk ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-black text-[10px]">PASS</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-[10px]">FAIL</span>
                  )}
                </div>

                {/* 6. Network, Wi-Fi & Bluetooth */}
                <div
                  onClick={() => setNetworkWifiBtOk(!networkWifiBtOk)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    networkWifiBtOk
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-rose-50/70 border-rose-300 text-rose-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Wifi className="w-4 h-4 text-indigo-600" />
                    <div>
                      <p className="font-bold text-xs">5G/4G सिम, वाई-फाई व ब्लूटूथ</p>
                      <p className="text-[10px] text-slate-500">फुल सिग्नल रिसेप्शन</p>
                    </div>
                  </div>
                  {networkWifiBtOk ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-black text-[10px]">PASS</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-[10px]">FAIL</span>
                  )}
                </div>

                {/* 7. LCI Water Indicator */}
                <div
                  onClick={() => setLciWaterDamageFree(!lciWaterDamageFree)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    lciWaterDamageFree
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-rose-50/70 border-rose-300 text-rose-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-4 h-4 text-cyan-600" />
                    <div>
                      <p className="font-bold text-xs">LCI वाटर डैमेज इंडिकेटर</p>
                      <p className="text-[10px] text-slate-500">सफेद (सुरक्षित, कोई पानी नहीं)</p>
                    </div>
                  </div>
                  {lciWaterDamageFree ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-black text-[10px]">WHITE OK</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-[10px]">RED DAMAGE</span>
                  )}
                </div>

                {/* 8. Body & Screw Seals */}
                <div
                  onClick={() => setBodyAndScrewsIntact(!bodyAndScrewsIntact)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    bodyAndScrewsIntact
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                      : 'bg-rose-50/70 border-rose-300 text-rose-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="font-bold text-xs">हाउसिंग व स्क्रू सील्स</p>
                      <p className="text-[10px] text-slate-500">ओरिजिनल सील सुरक्षित</p>
                    </div>
                  </div>
                  {bodyAndScrewsIntact ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-black text-[10px]">INTACT</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-black text-[10px]">OPENED</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PARTS REPLACED & TECH WORK LOG */}
          {activeTab === 'parts' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-800 block mb-1.5">
                  रिप्लेस किए गए पार्ट्स (Replaced Components):
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {[
                    'ओरिजिनल डिस्प्ले / AMOLED पैनल',
                    'ओरिजिनल 5000mAh बैटरी',
                    'OIS कैमरा लेंस मोटर',
                    'टाइप-सी फास्ट चार्जिंग फ्लेक्स',
                    'ईयरपीस / लाउडस्पीकर मॉड्यूल',
                    'बैक हाउसिंग / रियर ग्लास',
                    'BGA मदरबोर्ड पावर IC सोल्डरिंग',
                    '11D अल्ट्रा टेम्पर्ड ग्लास गार्ड'
                  ].map(part => (
                    <button
                      key={part}
                      type="button"
                      onClick={() => handleTogglePart(part)}
                      className={`px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer text-xs ${
                        partsList.includes(part)
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {partsList.includes(part) ? '✓ ' : '+ '}
                      {part}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleAddCustomPart} className="flex gap-2">
                  <input
                    type="text"
                    value={customPartInput}
                    onChange={e => setCustomPartInput(e.target.value)}
                    placeholder="अन्य पार्ट जोड़ें (e.g. सिम ट्रे, वॉल्यूम बटन फ्लेक्स)..."
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden bg-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
                  >
                    जोड़ें
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    असाइंड टेक्नीशियन (Technician):
                  </label>
                  <input
                    type="text"
                    value={technicianName}
                    onChange={e => setTechnicianName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    जॉब शीट स्थिति (Job Status):
                  </label>
                  <select
                    value={jobStatus}
                    onChange={e => setJobStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  >
                    <option value="in_progress">🟡 रिपेयर कार्य प्रगति में (In Progress)</option>
                    <option value="qc_passed">🔵 QC चेक पास (QC Passed)</option>
                    <option value="ready_for_handover">🟢 ग्राहक हैंडओवर के लिए तैयार (Ready)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  विस्तृत रिपेयर व डायग्नोस्टिक नोट्स:
                </label>
                <textarea
                  rows={3}
                  value={technicianNotes}
                  onChange={e => setTechnicianNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs font-medium bg-white"
                  placeholder="BGA सोल्डरिंग, थर्मल पेस्ट एप्लिकेशन, 100% टेस्टिंग नोट्स..."
                />
              </div>
            </div>
          )}

          {/* TAB 3: PRINTABLE JOB SHEET */}
          {activeTab === 'print' && (
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-300 space-y-3 font-sans text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-300">
                <div>
                  <h4 className="font-black text-slate-900 text-sm">SASTAFONE SURAT - JOB CARD & AUDIT</h4>
                  <p className="text-[10px] text-slate-500">सूरत अधिकृत मोबाइल रिपेयरिंग व टेस्टिंग सेंटर</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 text-xs block">#{order.orderNumber}</span>
                  <span className="text-[10px] text-emerald-700 font-bold">100% QC Certified</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500 block">ग्राहक नाम:</span>
                  <strong className="text-slate-900">{order.customerName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">संपर्क नंबर:</span>
                  <strong className="text-slate-900">+91 {order.customerPhone}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">डिवाइस / मॉडल:</span>
                  <strong className="text-slate-900">{order.title}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">सूरत इलाका:</span>
                  <strong className="text-slate-900">{order.locality}</strong>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block uppercase">रिप्लेस्ड पार्ट्स:</span>
                <p className="font-semibold text-slate-800 text-[11px] mt-0.5">
                  {partsList.length > 0 ? partsList.join(', ') : 'कोई नया पार्ट नहीं (जनरल सर्विस)'}
                </p>
                <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                  <span>QC स्कोर: <strong className="text-emerald-700">{qcScorePct}% Pass</strong></span>
                  <span>वारंटी: <strong className="text-blue-700">6 महीने ऑफिशियल वारंटी</strong></span>
                  <span>टेक लीड: <strong className="text-slate-800">{technicianName}</strong></span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>जॉब शीट प्रिंट करें</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>फायरबेस डेटाबेस लाइव ऑटो-सिंक सक्रिय</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs cursor-pointer hover:bg-slate-100 transition-all"
            >
              बंद करें
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'फायरबेस में सेव हो रहा है...' : '💾 चेकलिस्ट सेव करें व सिंक करें'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
