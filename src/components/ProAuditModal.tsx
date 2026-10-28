import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProAuditVerification } from '../types';
import {
  ShieldCheck,
  CheckCircle2,
  X,
  Smartphone,
  Camera,
  Volume2,
  Cpu,
  Zap,
  Droplets,
  Fingerprint,
  RotateCcw,
  AlertTriangle,
  Award,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ProAuditModal: React.FC = () => {
  const {
    isProAuditModalOpen,
    setIsProAuditModalOpen,
    selectedAuditOrder,
    saveOrderProAudit,
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

  const [technicianNotes, setTechnicianNotes] = useState(
    selectedAuditOrder?.proAudit?.technicianNotes ||
      'कैमरा सेंसर री-एलाइनमेंट व डस्ट-फ्री लेन्स टेस्टिंग सफल। 100% रिस्पॉन्सिव टच व ज़ीरो डेड-ज़ोन प्रमाणित।'
  );

  const [auditorName, setAuditorName] = useState(
    selectedAuditOrder?.proAudit?.auditorName || 'संजय प्रजापति (सूरत टेक लीड #1)'
  );

  if (!isProAuditModalOpen || !selectedAuditOrder) return null;

  const handleToggleTouchPoint = (index: number) => {
    setTouchGrid(prev => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const touchPassedCount = touchGrid.filter(Boolean).length;
  const isAllTouchPassed = touchPassedCount === 9;

  const handleSubmitAudit = (e: React.FormEvent) => {
    e.preventDefault();

    const auditData: ProAuditVerification = {
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
      auditorName
    };

    saveOrderProAudit(selectedAuditOrder.id, auditData);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    setIsProAuditModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-auto shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-md font-black text-lg">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Pro-Audit Lab Checklist
                </span>
                <span className="text-xs text-blue-200 font-mono">
                  {selectedAuditOrder.orderNumber}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                हार्डवेयर प्री-डिलीवरी वेरिफिकेशन ऑडिट
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
              सूरत Sastaphone सुरक्षा नियम: फोन हैंडओवर या फाइनल बिल भुगतान से पहले प्रत्येक पार्ट की वास्तविक हार्डवेयर टेस्टिंग व डिजिटल सील लगाना अनिवार्य है।
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
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-white"
                  placeholder="358921094821034"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 w-full cursor-pointer hover:bg-slate-100/50">
                  <input
                    type="checkbox"
                    checked={imeiMatched}
                    onChange={e => setImeiMatched(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                  <span className="text-[11px] font-bold text-slate-800">
                    बिल, बॉक्स व फोन का सीरियल/IMEI पूर्णतः मैच है
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
                  className={`h-12 rounded-xl font-black text-xs flex items-center justify-center transition-all cursor-pointer ${
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
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
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

          {/* Step 3: Camera Sensor & OIS Autofocus Test (Crucial for S24 Ultra Example) */}
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
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
                <span className="font-bold text-[11px] text-slate-800">
                  रियर 200MP मेन लेंस क्लियर
                </span>
              </label>

              <label className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 cursor-pointer hover:bg-slate-100/50">
                <input
                  type="checkbox"
                  checked={cameraAutofocusCheck}
                  onChange={e => setCameraAutofocusCheck(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
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
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
                <span className="font-bold text-[11px] text-slate-800">
                  फ्रंट सेल्फी कैमरा शार्प
                </span>
              </label>
            </div>
          </div>

          {/* Step 4: Audio, Microphone & Biometrics */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <h4 className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">4</span>
              <span>ऑडियो, माइक, प्रॉक्सिमिटी व बायोमेट्रिक्स</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <label className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={micEarpieceCheck}
                  onChange={e => setMicEarpieceCheck(e.target.checked)}
                  className="w-3.5 h-3.5 text-emerald-600 rounded"
                />
                <span className="font-semibold text-[11px]">कॉल माइक व ईयरपीस</span>
              </label>

              <label className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={loudspeakerCheck}
                  onChange={e => setLoudspeakerCheck(e.target.checked)}
                  className="w-3.5 h-3.5 text-emerald-600 rounded"
                />
                <span className="font-semibold text-[11px]">लाउडस्पीकर स्टीरियो</span>
              </label>

              <label className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={proximitySensorCheck}
                  onChange={e => setProximitySensorCheck(e.target.checked)}
                  className="w-3.5 h-3.5 text-emerald-600 rounded"
                />
                <span className="font-semibold text-[11px]">प्रॉक्सिमिटी सेंसर</span>
              </label>

              <label className="p-2 rounded-xl bg-white border border-slate-200 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={biometricsCheck}
                  onChange={e => setBiometricsCheck(e.target.checked)}
                  className="w-3.5 h-3.5 text-emerald-600 rounded"
                />
                <span className="font-semibold text-[11px]">फिंगरप्रिंट / फेस ID</span>
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
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-xs bg-white"
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
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-white"
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
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs bg-white"
                />
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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">जांचकर्ता टेक्नीशियन:</span>
              <input
                type="text"
                value={auditorName}
                onChange={e => setAuditorName(e.target.value)}
                className="font-bold text-xs text-slate-900 border-b border-slate-300 bg-transparent py-0.5"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsProAuditModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
              >
                कैंसिल
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>डिजिटल Pro-Audit सर्टिफिकेट जारी करें</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
