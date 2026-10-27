import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { X, Camera, Upload, CheckCircle2, ShieldCheck, Sparkles, AlertCircle, Play, Video } from 'lucide-react';
import confetti from 'canvas-confetti';

interface VideoVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export const VideoVerificationModal: React.FC<VideoVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerified
}) => {
  const { language, sellSelection, updateSellSelection } = useApp();
  const [mode, setMode] = useState<'tips' | 'recording' | 'analyzing' | 'completed'>('tips');
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusText, setScanStatusText] = useState('Initiating AI video analysis...');

  if (!isOpen) return null;

  const handleStartAnalysis = (dummyUrl?: string) => {
    setMode('analyzing');
    setScanProgress(15);
    setScanStatusText(language === 'hi' ? 'फोन की स्क्रीन चालू स्थिति जांची जा रही है...' : 'Validating live screen turn-on...');

    setTimeout(() => {
      setScanProgress(45);
      setScanStatusText(language === 'hi' ? 'ग्लास क्रैक और बॉडी डेंट का AI स्कैन जारी...' : 'AI scanning glass integrity and outer bezel...');
    }, 1000);

    setTimeout(() => {
      setScanProgress(80);
      setScanStatusText(language === 'hi' ? 'कैमरा लेंस और पोर्ट स्थिति वेरीफाई हो रही है...' : 'Verifying camera lens and port conditions...');
    }, 2000);

    setTimeout(() => {
      setScanProgress(100);
      setScanStatusText(language === 'hi' ? 'वेरिफिकेशन सफल! ₹300 एक्स्ट्रा बोनस जोड़ा गया' : 'Verification Complete! ₹300 bonus unlocked');
      setMode('completed');

      updateSellSelection({
        verifiedVideo: {
          fileUrl: dummyUrl || 'blob:sample-inspection-video',
          videoName: 'doorstep-inspection-video.mp4',
          verifiedAt: new Date().toLocaleTimeString(),
          score: 98
        }
      });

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    }, 3200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setRecordedVideoUrl(url);
      handleStartAnalysis(url);
    }
  };

  const handleSimulateQuickRecord = () => {
    setRecordedVideoUrl('https://assets.mixkit.co/videos/preview/mixkit-holding-a-modern-smartphone-with-a-green-screen-42981-large.mp4');
    handleStartAnalysis('https://assets.mixkit.co/videos/preview/mixkit-holding-a-modern-smartphone-with-a-green-screen-42981-large.mp4');
  };

  const handleFinish = () => {
    onVerified();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {language === 'hi' ? '10-सेकंड वीडियो वेरिफिकेशन' : '10-Sec Video Verification'}
              </h3>
              <p className="text-xs text-blue-100">
                {language === 'hi' ? 'सूरत में फास्टेस्ट होम सर्विस और +₹300 इंस्टेंट बोनस' : 'Fast doorstep confirmation & +₹300 cash bonus'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {mode === 'tips' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-blue-900">
                    {language === 'hi' ? 'वीडियो वेरिफिकेशन क्यों जरूरी है?' : 'Why Video Verification?'}
                  </p>
                  <p className="text-blue-800 leading-relaxed">
                    {language === 'hi'
                      ? 'वीडियो अपलोड करने से हमारे सूरत हब के टेक्नीशियन को फोन की सही स्थिति पहले से पता चल जाती है, जिससे बिना किसी बहस के तय कीमत तुरंत ट्रांसफर हो जाती है।'
                      : 'Helps our Surat technician verify condition beforehand to guarantee 100% price lock without doorstep bargaining.'}
                  </p>
                </div>
              </div>

              {/* Instructions list */}
              <div className="space-y-2.5 text-xs text-slate-700 font-medium">
                <p className="font-bold text-slate-900 text-sm">
                  {language === 'hi' ? 'वीडियो में क्या दिखाना है (10 सेकंड):' : 'What to capture in 10 seconds:'}
                </p>
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">1</span>
                  <span>{language === 'hi' ? 'स्क्रीन को ऑन (ON) करके होमस्क्रीन दिखाएं' : 'Turn phone screen ON and display home screen'}</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">2</span>
                  <span>{language === 'hi' ? 'फोन को घुमाकर बैक पैनल और कैमरा लेंस दिखाएं' : 'Flip phone to show back panel and camera lens'}</span>
                </div>
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">3</span>
                  <span>{language === 'hi' ? 'कोने और साइड की बॉडी दिखाएं' : 'Show the four corners and side frame'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-blue-500/20 transition-all text-center">
                  <Upload className="w-4 h-4" />
                  <span>{language === 'hi' ? 'गैलरी से वीडियो चुनें' : 'Upload Video File'}</span>
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>

                <button
                  onClick={handleSimulateQuickRecord}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all text-center"
                >
                  <Camera className="w-4 h-4" />
                  <span>{language === 'hi' ? 'कैमरा शुरू / इंस्टेंट डेमो' : 'Record Now / Demo'}</span>
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={onClose}
                  className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
                >
                  {language === 'hi' ? 'अभी छोड़ें (पिकअप के समय टेक्नीशियन चेक करेगा)' : 'Skip for now (Technician will verify at doorstep)'}
                </button>
              </div>
            </div>
          )}

          {mode === 'analyzing' && (
            <div className="py-8 text-center space-y-4">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-ping opacity-30" />
                <div className="w-20 h-20 rounded-full border-4 border-blue-600 border-t-amber-500 animate-spin flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-blue-600 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-bold text-slate-900">
                  {language === 'hi' ? 'AI वीडियो इंस्पेक्शन प्रगति पर है...' : 'AI Video Inspection in progress...'}
                </h4>
                <p className="text-xs text-slate-600 max-w-xs mx-auto font-medium">
                  {scanStatusText}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-emerald-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400">
                OpenRouter AI • Sastaphone Surat Quality Vision Engine
              </p>
            </div>
          )}

          {mode === 'completed' && (
            <div className="py-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  100% Verified By AI
                </span>
                <h4 className="text-lg font-black text-slate-900 pt-1">
                  {language === 'hi' ? 'वीडियो वेरिफिकेशन सफल रहा!' : 'Video Verification Approved!'}
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  {language === 'hi'
                    ? 'आपके फोन की ऑन-कंडीशन और बॉडी स्थिति वेरीफाई हो गई है। आपके कोटेशन में ₹300 का एक्सक्लूसिव वीडियो बोनस जोड़ दिया गया है।'
                    : 'Physical condition and working state validated. ₹300 Verified Seller bonus added to your valuation.'}
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-left text-xs space-y-1.5">
                <div className="flex justify-between font-semibold text-emerald-900">
                  <span>Display Quality:</span>
                  <span className="text-emerald-700 font-bold">Passed (99.2%)</span>
                </div>
                <div className="flex justify-between font-semibold text-emerald-900">
                  <span>Bezel & Back Panel:</span>
                  <span className="text-emerald-700 font-bold">Good / No major crack</span>
                </div>
                <div className="flex justify-between font-semibold text-emerald-900">
                  <span>Surat Hub Bonus:</span>
                  <span className="text-emerald-700 font-bold">+₹300 Cash Added</span>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all"
              >
                {language === 'hi' ? 'जारी रखें और पिकअप बुक करें' : 'Continue & Book Surat Pickup'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
