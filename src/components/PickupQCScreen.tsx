import React, { useState, useMemo } from 'react';
import { Job, RepairPrice, JobQC, QCCheckItem } from '../types';
import { saveJobQCInFirestore } from '../services/firestoreRepairService';
import { uploadImageToStorage } from '../utils/storageUpload';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Camera,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PickupQCScreenProps {
  job: Job;
  allRepairPrices: RepairPrice[];
  onClose: () => void;
  onSuccess: () => void;
}

const QC_ITEMS = [
  { key: 'display', label: 'Display (डिस्प्ले)' },
  { key: 'touch', label: 'Touch Screen (टच रिस्पॉन्स)' },
  { key: 'battery', label: 'Battery Health (बैटरी हेल्थ)' },
  { key: 'water_damage', label: 'Water Damage (पानी / लिक्विड इंडिकेटर)' },
  { key: 'camera', label: 'Camera Front & Rear (कैमरा)' },
  { key: 'audio', label: 'Mic & Speaker (माइक व लाउडस्पीकर)' },
  { key: 'charging_port', label: 'Charging Port (चार्जिंग जैक)' },
  { key: 'buttons', label: 'Buttons (पावर व वॉल्यूम बटन)' },
  { key: 'body_scratches', label: 'Body & Scratches (बॉडी स्क्रैच व डेंट)' },
  { key: 'network_wifi', label: 'Network & WiFi (सिम व नेटवर्क)' },
  { key: 'biometrics', label: 'Face / Touch ID (बायोमेट्रिक्स)' }
];

export const PickupQCScreen: React.FC<PickupQCScreenProps> = ({
  job,
  allRepairPrices,
  onClose,
  onSuccess
}) => {
  // 11-point Checklist state
  const [checklist, setChecklist] = useState<Record<string, QCCheckItem>>(() => {
    const initial: Record<string, QCCheckItem> = {};
    QC_ITEMS.forEach(item => {
      initial[item.key] = { status: 'OK', note: '' };
    });
    return initial;
  });

  // Mandatory fields (real uploaded photos, zero hardcoded demo photos)
  const [imei, setImei] = useState<string>(job.qc?.imei || '');
  const [billPhotoUrl, setBillPhotoUrl] = useState<string>(job.qc?.billPhotoUrl || '');
  const [conditionPhotos, setConditionPhotos] = useState<string[]>(
    job.qc?.conditionPhotoUrls || []
  );
  const [idPhotoUrl] = useState<string>(job.qc?.idPhotoUrl || '');
  const [isUploadingBill, setIsUploadingBill] = useState(false);
  const [isUploadingCondition, setIsUploadingCondition] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Service Modification in QC
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(() => {
    // Match job.services to repairPrice ids
    const found = allRepairPrices.filter(p =>
      job.services.some(s => s.toLowerCase().includes(p.id) || s.includes(p.name_hi))
    );
    return found.length > 0 ? found.map(f => f.id) : ['display'];
  });

  // Discount configuration: 12% to 15% slider
  const [discountPct, setDiscountPct] = useState<number>(12);
  const [isOverrideDiscount, setIsOverrideDiscount] = useState<boolean>(false);
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [customPriceOverride, setCustomPriceOverride] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Calculate prices
  const activeServices = useMemo(() => {
    return allRepairPrices.filter(p => selectedServiceIds.includes(p.id));
  }, [allRepairPrices, selectedServiceIds]);

  const sumOfHighPrices = useMemo(() => {
    return activeServices.reduce((sum, s) => sum + s.maxPrice, 0);
  }, [activeServices]);

  // Suggested final price = sum of HIGH prices x (1 - discount%)
  const suggestedFinalPrice = useMemo(() => {
    if (isOverrideDiscount && customPriceOverride) {
      return parseInt(customPriceOverride, 10) || sumOfHighPrices;
    }
    const discountFactor = 1 - discountPct / 100;
    return Math.round(sumOfHighPrices * discountFactor);
  }, [sumOfHighPrices, discountPct, isOverrideDiscount, customPriceOverride]);

  const discountAmount = sumOfHighPrices - suggestedFinalPrice;
  const visitFeeAdjusted = job.visitFeePaid ? 199 : 0;
  const finalBalanceToPay = Math.max(0, suggestedFinalPrice - visitFeeAdjusted);
  const warrantyMonths = suggestedFinalPrice >= 1000 ? 6 : 3;

  // Validation: Block "Accept Phone" until IMEI and Bill Photo are filled
  const isFormValid = useMemo(() => {
    return (
      imei.trim().length >= 8 &&
      billPhotoUrl.trim().length > 0 &&
      conditionPhotos.length >= 3
    );
  }, [imei, billPhotoUrl, conditionPhotos]);

  const handleChecklistChange = (key: string, status: 'OK' | 'Issue' | 'NA') => {
    setChecklist(prev => ({
      ...prev,
      [key]: { ...prev[key], status }
    }));
  };

  const handleNoteChange = (key: string, note: string) => {
    setChecklist(prev => ({
      ...prev,
      [key]: { ...prev[key], note }
    }));
  };

  const handleBillFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setIsUploadingBill(true);
    try {
      const url = await uploadImageToStorage(file, `jobs/${job.jobId}`);
      setBillPhotoUrl(url);
    } catch (err: any) {
      setUploadError(err?.message || 'बिल फ़ोटो अपलोड करने में समस्या आई।');
    } finally {
      setIsUploadingBill(false);
      e.target.value = '';
    }
  };

  const handleConditionFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadError(null);
    setIsUploadingCondition(true);
    try {
      const limitCount = Math.min(files.length, 6 - conditionPhotos.length);
      const uploaded: string[] = [];
      for (let i = 0; i < limitCount; i++) {
        const url = await uploadImageToStorage(files[i], `jobs/${job.jobId}`);
        uploaded.push(url);
      }
      setConditionPhotos(prev => [...prev, ...uploaded]);
    } catch (err: any) {
      setUploadError(err?.message || 'कंडीशन फ़ोटो अपलोड करने में समस्या आई।');
    } finally {
      setIsUploadingCondition(false);
      e.target.value = '';
    }
  };

  const handleSubmitQC = async () => {
    if (!isFormValid) return;
    setIsSubmitting(true);

    try {
      const qcPayload: JobQC = {
        checklist,
        imei: imei.trim(),
        billPhotoUrl: billPhotoUrl.trim(),
        conditionPhotoUrls: conditionPhotos,
        idPhotoUrl: idPhotoUrl.trim(),
        conductedAt: new Date().toISOString(),
        conductedBy: 'Sastafone Certified Technician Network Lead',
        discountPct,
        discountReason: isOverrideDiscount ? overrideReason : undefined,
        suggestedFinalPrice,
        servicesBreakdown: activeServices.map(s => ({
          serviceId: s.id,
          name: s.name_hi,
          price: s.maxPrice
        }))
      };

      await saveJobQCInFirestore(
        job.jobId,
        qcPayload,
        suggestedFinalPrice,
        activeServices.map(s => s.name_hi)
      );

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.5 }
      });

      setIsSubmitting(false);
      onSuccess();
    } catch (err) {
      console.error('Error saving QC inspection:', err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-3xl my-auto bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#D5151B] text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase">
                सूरत डोरस्टेप पिकअप QC
              </span>
              <span className="font-mono text-xs font-bold text-red-100">{job.jobId}</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-1">
              फोन पिकअप व फिजिकल क्वालिटी चेक (QC Screen)
            </h3>
            <p className="text-[11px] text-red-100">
              ग्राहक: {job.name} ({job.phone}) • डिवाइस: {job.model} • इलाका: {job.area}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* 1. Mandatory IMEI and Bill Photo (Anti-Fraud) */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>सख्त एंटी-थेफ्ट व ओनरशिप सत्यापन (IMEI व बिल फोटो अनिवार्य):</span>
            </div>

            {uploadError && (
              <p className="text-xs text-[#D5151B] font-bold">{uploadError}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  15-अंकों का IMEI नंबर (डायल *#06#): *
                </label>
                <input
                  type="text"
                  required
                  value={imei}
                  onChange={e => setImei(e.target.value)}
                  placeholder="उदा. 352894109823451"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-mono font-bold text-[#132032] focus:outline-none focus:border-[#D5151B] bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-700 block mb-1">
                  मूल बिल / वारंटी कार्ड फोटो: *
                </label>
                <label className="w-full py-2 px-3 rounded-xl bg-white border border-gray-300 hover:border-[#D5151B] text-xs font-bold text-gray-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs">
                  {isUploadingBill ? (
                    <RefreshCw className="w-4 h-4 text-[#D5151B] animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-[#D5151B]" />
                  )}
                  <span>
                    {isUploadingBill
                      ? 'अपलोड हो रहा है...'
                      : billPhotoUrl
                      ? '✓ बिल फोटो अपलोड हो गया'
                      : 'बिल फोटो खींचें / अपलोड'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    disabled={isUploadingBill}
                    onChange={handleBillFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Condition Photos Upload (3 to 6 photos) */}
            <div className="pt-2">
              <label className="text-[11px] font-bold text-gray-700 block mb-1.5 flex items-center justify-between">
                <span>फोन की स्थिति के 3-6 लाइव फोटो (सामने, पीछे, कोनों से): *</span>
                <span className="text-[10px] text-gray-500 font-mono">
                  {conditionPhotos.length} / 6 फोटो
                </span>
              </label>

              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {conditionPhotos.map((photo, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-300 shrink-0 shadow-xs">
                    <img src={photo} alt={`Condition ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setConditionPhotos(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-0.5 right-0.5 bg-[#D5151B] text-white rounded-full p-0.5 cursor-pointer"
                      aria-label="Remove photo"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}

                {conditionPhotos.length < 6 && (
                  <label className="w-16 h-16 rounded-xl border-2 border-dashed border-red-300 hover:border-[#D5151B] bg-[#FEF2F2] flex flex-col items-center justify-center text-[#D5151B] cursor-pointer shrink-0 transition-colors">
                    {isUploadingCondition ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Camera className="w-5 h-5" />
                        <span className="text-[9px] font-bold mt-0.5">+ फोटो</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      disabled={isUploadingCondition}
                      onChange={handleConditionFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* 2. 11-Point QC Checklist Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>11-पॉइंट हार्डवेयर व सॉफ्टवेयर निरीक्षण चेकलिस्ट:</span>
            </h4>

            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <div className="grid grid-cols-12 bg-slate-100 p-2 text-[10px] font-black uppercase text-slate-600 border-b border-slate-200">
                <span className="col-span-4 sm:col-span-5">जांच का बिंदु (Item)</span>
                <span className="col-span-4 sm:col-span-4 text-center">स्थिति (Status)</span>
                <span className="col-span-4 sm:col-span-3">टिप्पणी (Note)</span>
              </div>

              <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                {QC_ITEMS.map(item => {
                  const checkVal = checklist[item.key] || { status: 'OK', note: '' };
                  return (
                    <div key={item.key} className="grid grid-cols-12 p-2 items-center text-xs gap-1">
                      <div className="col-span-4 sm:col-span-5 flex items-center gap-1.5 truncate">
                        <span className="font-bold text-[#132032] text-[11px] truncate">{item.label}</span>
                      </div>

                      <div className="col-span-4 sm:col-span-4 flex items-center justify-center gap-1">
                        {(['OK', 'Issue', 'NA'] as const).map(st => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleChecklistChange(item.key, st)}
                            className={`px-2 py-1 rounded-md text-[10px] font-black transition-all cursor-pointer ${
                              checkVal.status === st
                                ? st === 'OK'
                                  ? 'bg-emerald-600 text-white'
                                  : st === 'Issue'
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-slate-700 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>

                      <div className="col-span-4 sm:col-span-3">
                        <input
                          type="text"
                          value={checkVal.note}
                          onChange={e => handleNoteChange(item.key, e.target.value)}
                          placeholder="नोट..."
                          className="w-full px-2 py-1 rounded border border-slate-200 text-[10px] text-slate-800 focus:outline-none focus:border-red-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Add / Remove Services from repairPrices */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>आवश्यक रिपेयर सेवाएं (repairPrices से चुनें):</span>
              <span className="text-[10px] text-red-600 font-bold">{selectedServiceIds.length} चयनित</span>
            </h4>

            <div className="flex flex-wrap gap-1.5">
              {allRepairPrices.map(service => {
                const isSelected = selectedServiceIds.includes(service.id);
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => {
                      setSelectedServiceIds(prev =>
                        isSelected
                          ? prev.filter(id => id !== service.id)
                          : [...prev, service.id]
                      );
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{service.name_hi.split('(')[0]}</span>
                    <span className="ml-1 text-[10px] opacity-80 font-mono">₹{service.maxPrice}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Suggested Final Price Calculation Box (Light Theme) */}
          <div className="p-4 rounded-2xl bg-[#FEF2F2] text-[#132032] space-y-3 border border-red-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-[#D5151B]">
                फाइनल क्वोट फॉर्मूला: Sum of HIGH Prices × (1 - Discount%)
              </span>
              <span className="text-[10px] text-gray-600">12% से 15% मानक छूट</span>
            </div>

            {/* Discount Slider */}
            {!isOverrideDiscount && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>ग्राहक छूट (Discount):</span>
                  <span className="text-[#D5151B] font-mono text-sm">{discountPct}% OFF</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="15"
                  step="1"
                  value={discountPct}
                  onChange={e => setDiscountPct(parseInt(e.target.value, 10))}
                  className="w-full accent-[#D5151B] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                  <span>12%</span>
                  <span>13%</span>
                  <span>14%</span>
                  <span>15%</span>
                </div>
              </div>
            )}

            {/* Custom Override Option */}
            <div className="pt-1 flex items-center justify-between text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer text-[#132032]">
                <input
                  type="checkbox"
                  checked={isOverrideDiscount}
                  onChange={e => setIsOverrideDiscount(e.target.checked)}
                  className="rounded accent-[#D5151B] cursor-pointer"
                />
                <span className="text-[11px]">कस्टम डिस्काउंट / प्राइस ओवरराइड करें</span>
              </label>

              {isOverrideDiscount && (
                <input
                  type="number"
                  placeholder="कस्टम फाइनल प्राइस ₹"
                  value={customPriceOverride}
                  onChange={e => setCustomPriceOverride(e.target.value)}
                  className="w-32 px-2 py-1 rounded-lg bg-white text-[#132032] text-xs border border-gray-300 font-mono"
                />
              )}
            </div>

            {isOverrideDiscount && (
              <div>
                <input
                  type="text"
                  required
                  placeholder="ओवरराइड का कारण लिखें (उदा. स्क्रीन + बैटरी दोनों एक साथ रिप्लेस)..."
                  value={overrideReason}
                  onChange={e => setOverrideReason(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white text-[#132032] text-xs border border-gray-300"
                />
              </div>
            )}

            {/* Final Breakdown Table */}
            <div className="pt-2 border-t border-red-200 space-y-1.5 text-xs text-gray-700">
              <div className="flex items-center justify-between">
                <span>सेवाओं का अधिकतम योग (Sum of High Prices):</span>
                <span className="font-mono font-bold">₹{sumOfHighPrices}</span>
              </div>
              <div className="flex items-center justify-between text-emerald-700 font-medium">
                <span>छूट (Discount {discountPct}%):</span>
                <span className="font-mono">-₹{discountAmount}</span>
              </div>
              <div className="flex items-center justify-between text-[#132032] font-medium">
                <span>विज़िट टोकन एडजस्टमेंट:</span>
                <span className="font-mono">-₹{visitFeeAdjusted}</span>
              </div>
              <div className="flex items-center justify-between text-sm sm:text-base font-bold text-[#132032] pt-1 border-t border-red-200">
                <span>ग्राहक से देय फाइनल बैलेंस (Final Balance):</span>
                <span className="text-xl font-bold text-[#D5151B] tabular-nums">₹{finalBalanceToPay}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-600 pt-0.5">
                <span>प्रदान की जाने वाली वारंटी:</span>
                <span className="text-emerald-700 font-bold">{warrantyMonths} महीने लिखित वारंटी</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Blocked Button */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-3 shrink-0">
          <div>
            {!isFormValid && (
              <span className="text-[11px] text-[#D5151B] font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>फोन स्वीकारने हेतु IMEI, बिल फोटो और 3+ कंडीशन फोटो आवश्यक हैं।</span>
              </span>
            )}
            {isFormValid && (
              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>सभी शर्तें पूरी हैं। ग्राहक के पास लाइव क्वोट जाएगा।</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-[#132032] text-xs font-bold cursor-pointer transition-all"
            >
              रद्द करें
            </button>

            <button
              type="button"
              disabled={!isFormValid || isSubmitting}
              onClick={handleSubmitQC}
              className="px-5 py-2.5 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!isFormValid ? 'कृपया पहले IMEI, बिल और कंडीशन फोटो भरें' : 'फोन स्वीकारें व क्वोट भेजें'}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'सेव हो रहा है...' : 'फोन स्वीकारें व क्वोट भेजें'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
