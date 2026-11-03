import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Wrench,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Smartphone,
  Cpu,
  Zap,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface WorkVideosFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RepairWorkVideo {
  id: string;
  category: 'screen' | 'ic_motherboard' | 'battery_charging' | 'handover';
  categoryLabel: string;
  title: string;
  phoneModel: string;
  locality: string;
  durationMinutes: number;
  partsReplaced: string;
  warranty: string;
  benchStage: string;
  technicianNotes: string;
  audioTranscript: string;
  benchColor: string;
  accentColor: string;
  videoSteps: string[];
}

const REPAIR_VIDEOS: RepairWorkVideo[] = [
  {
    id: 'work-1',
    category: 'screen',
    categoryLabel: 'स्क्रीन व डिस्प्ले',
    title: 'iPhone 14 Pro Max 120Hz OLED डिस्प्ले व True Tone प्रोग्रामिंग',
    phoneModel: 'Apple iPhone 14 Pro Max',
    locality: 'अडाजण, सूरत (डोरस्टेप)',
    durationMinutes: 28,
    partsReplaced: '100% Original Super Retina XDR OLED + वॉटरप्रूफ रबर सील',
    warranty: '6 महीने की लिखित वारंटी',
    benchStage: 'True Tone Data Transfer & 120Hz ProMotion Calibration',
    technicianNotes: 'कस्टमर के सामने डोरस्टेप पर डिस्प्ले खोला, पुराने डिस्प्ले से EEPROM चिप का True Tone डेटा नए डिस्प्ले में कॉपी किया, और फैक्ट्री वाटर-रेसिस्टेंट सील लगाकर असेंबल किया।',
    audioTranscript: '"नमस्ते! आज हम सूरत अडाजण में ग्राहक के घर पर iPhone 14 Pro Max की स्क्रीन बदल रहे हैं। हमने ओरिजिनल True Tone प्रोग्रामर से कलर कैलिब्रेशन ट्रांसफर कर दिया है और 120Hz स्मूथनेस पूरी तरह टेस्टेड है।"',
    benchColor: 'from-blue-950 via-slate-900 to-indigo-950',
    accentColor: 'text-blue-400',
    videoSteps: [
      'डिस्प्ले हीटिंग व सक्शन सेफ ओपनिंग',
      'EEPROM True Tone डेटा ट्रांसफर',
      'फैक्ट्री IP68 वॉटरप्रूफ गैस्केट इंस्टॉलेशन',
      '32-पॉइंट टच व मल्टी-टच टेस्ट पास'
    ]
  },
  {
    id: 'work-2',
    category: 'ic_motherboard',
    categoryLabel: 'मदरबोर्ड व IC',
    title: 'Samsung Galaxy S23 Ultra डेड मदरबोर्ड PMIC व माइक्रो-सोल्डरिंग',
    phoneModel: 'Samsung Galaxy S23 Ultra 5G',
    locality: 'सूरत सेंट्रल लैब (रिंग रोड)',
    durationMinutes: 45,
    partsReplaced: 'ओरिजिनल Qualcomm PM8550 PMIC चिप + Reballing Stencil',
    warranty: '90 दिन की IC रिपेयर वारंटी',
    benchStage: 'Stereo Microscope 40x Live Micro-Soldering',
    technicianNotes: 'पानी लगने से फोन शून्य चार्ज ले रहा था। माइक्रोस्कोप में शॉर्टेड कैपेसिटर ट्रेस किया और पावर मैनेजमेंट IC को 350°C पर सेफ हीट गन से रीबॉल करके नया लगाया। सारा डेटा सुरक्षित रहा।',
    audioTranscript: '"यह S23 Ultra पानी गिरने के बाद डेड हो गया था। हमारी सूरत लैब में माइक्रोस्कोप के नीचे शॉर्टेज रिमूव की गई और PMIC चेंज किया। कस्टमर का 256GB का पूरा डेटा सुरक्षित रिकवर हो गया।"',
    benchColor: 'from-indigo-950 via-slate-900 to-purple-950',
    accentColor: 'text-purple-400',
    videoSteps: [
      'मदरबोर्ड थर्मल कैमरा शॉर्टेज स्कैन',
      'माइक्रोस्कोप 40x पर IC रिमूवल व पैड क्लीनिंग',
      '0.3mm शोल्डर बॉल्स से IC रीबॉलिंग',
      'DC पावर सप्लाई पर नॉर्मल बूटिंग टेस्ट'
    ]
  },
  {
    id: 'work-3',
    category: 'screen',
    categoryLabel: 'स्क्रीन व डिस्प्ले',
    title: 'OnePlus 11R AMOLED स्क्रीन केवल ग्लास रिप्लेसमेंट (OCA लेमिनेशन)',
    phoneModel: 'OnePlus 11R 5G (Curved Display)',
    locality: 'वेसु, सूरत (डोरस्टेप पिकअप)',
    durationMinutes: 35,
    partsReplaced: '9H गोरिल्ला कर्व्ड फ्रंट ग्लास + मित्सुबिशी OCA लेयर',
    warranty: '180 दिन टच रिस्पॉन्स वारंटी',
    benchStage: 'Zero-Bubble OCA Vacuum Pressing & UV Curing',
    technicianNotes: 'ओरिजिनल AMOLED स्क्रीन एकदम सही चल रही थी, सिर्फ ऊपर का शीशा टूटा था। डायमंड कटिंग वायर से ब्रोकन ग्लास अलग करके नया कर्व्ड ग्लास लगाया, जिससे ग्राहक के ₹4,800 बचे।',
    audioTranscript: '"OnePlus कर्व्ड डिस्प्ले में पूरा स्क्रीन बदलने की जरूरत नहीं पड़ी। ओरिजिनल AMOLED बचाकर सिर्फ ग्लास बदला गया। टच रिस्पॉन्स और डिस्प्ले ब्राइटनेस बिल्कुल कंपनी जैसी है।"',
    benchColor: 'from-emerald-950 via-slate-900 to-teal-950',
    accentColor: 'text-emerald-400',
    videoSteps: [
      'डायमंड वायर से डैमेज ग्लास सेपरेशन',
      'ऑप्टिकल लिक्विड क्लीनर से ग्लू रिमूवल',
      'वैक्यूम चैंबर में बबल-फ्री लेमिनेशन',
      'UV ऑटोक्लेव क्योरिंग व फिनिशिंग'
    ]
  },
  {
    id: 'work-4',
    category: 'battery_charging',
    categoryLabel: 'बैटरी व चार्जिंग',
    title: 'iPhone 13 ओरिजिनल BMS स्पॉट वेल्डिंग (100% बैटरी हेल्थ रीस्टोर)',
    phoneModel: 'Apple iPhone 13',
    locality: 'कतारगाम, सूरत',
    durationMinutes: 22,
    partsReplaced: 'हाई-कैपेसिटी OEM लीथियम सेल + निकल स्ट्रिप वेल्डिंग',
    warranty: '1 वर्ष की संपूर्ण रिप्लेसमेंट वारंटी',
    benchStage: 'Precision Spot Welder & BMS Tag-on Flex Program',
    technicianNotes: 'ओरिजिनल बैटरी का BMS बोर्ड काटकर नई फ्रेश सेल पर स्पॉट वेल्ड किया। JCID प्रोग्रामर से साइकिल काउंट 0 और हेल्थ 100% की। कोई अननोन पार्ट वार्निंग नहीं आई।',
    audioTranscript: '"iPhone 13 में बैटरी बदलने पर अक्सर अननोन पार्ट वार्निंग आ जाती है। हमने मूल BMS चिप को नई सेल पर स्पॉट वेल्ड किया है, जिससे सेटिंग्स में 100% बैटरी हेल्थ दिखाई दे रही है।"',
    benchColor: 'from-amber-950 via-slate-900 to-yellow-950',
    accentColor: 'text-amber-400',
    videoSteps: [
      'ओरिजिनल BMS फ्लेक्स का सेफ सेपरेशन',
      'प्रिसिजन लेजर स्पॉट वेल्डिंग',
      'प्रोग्रामर से बैटरी हेल्थ 100% सेट',
      'फास्ट चार्जिंग व डिस्चार्ज टेम्परेचर चेक'
    ]
  },
  {
    id: 'work-5',
    category: 'battery_charging',
    categoryLabel: 'बैटरी व चार्जिंग',
    title: 'Redmi Note 12 Pro 5G चार्जिंग जैक व माइक्रोफोन सब-बोर्ड रिपेयर',
    phoneModel: 'Xiaomi Redmi Note 12 Pro 5G',
    locality: 'गोपीपुरा, सूरत (डोरस्टेप)',
    durationMinutes: 18,
    partsReplaced: 'ओरिजिनल 67W टर्बो फास्ट-चार्जिंग सब-बोर्ड व माइक मॉड्यूल',
    warranty: '3 महीने की ऑन-स्पॉट वारंटी',
    benchStage: '67W Turbo Charge Voltage & Mic Impedance Test',
    technicianNotes: 'कस्टमर के घर पर 18 मिनट में फोन खोलकर लूज़ चार्जिंग पोर्ट और डस्ट से चोक हुआ माइक बदला। 67W टर्बो चार्जिंग और क्रिस्टल क्लियर वॉयस कॉल टेस्ट करके दिया।',
    audioTranscript: '"सूरत गोपीपुरा में 20 मिनट के भीतर Redmi Note 12 Pro का चार्जिंग जैक और माइक रिप्लेस किया गया। 67W टर्बो चार्जिंग ऑन-स्पॉट टेस्ट कर ली गई है।"',
    benchColor: 'from-rose-950 via-slate-900 to-red-950',
    accentColor: 'text-rose-400',
    videoSteps: [
      'बैक पैनल थर्मल ओपनिंग',
      'सब-बोर्ड डिसकनेक्शन व इंस्पेक्शन',
      'नया ओरिजिनल टर्बो चार्ज बोर्ड फिटिंग',
      'वॉयस रिकॉर्डर व 67W चार्जिंग वेरिफिकेशन'
    ]
  },
  {
    id: 'work-6',
    category: 'handover',
    categoryLabel: 'डोरस्टेप हैंडओवर',
    title: 'सूरत ग्राहक के घर पर लाइव 32-पॉइंट टेस्टिंग व वारंटी कार्ड हैंडओवर',
    phoneModel: 'Vivo V27 Pro (क्लाउड ब्लू)',
    locality: 'पाल-अडाजण, सूरत',
    durationMinutes: 15,
    partsReplaced: 'डोरस्टेप हैंडओवर व लाइव कस्टमर इंस्पेक्शन',
    warranty: '6 महीने की डोरस्टेप वारंटी कार्ड',
    benchStage: 'Customer Live Self-Test & Digital Invoice Generation',
    technicianNotes: 'कस्टमर के सामने स्क्रीन कलर, फिंगरप्रिंट सेंसर, फ्रंट कैमरा, फ्लैश और कॉलिंग टेस्ट करवाया। ग्राहक के पूरी तरह संतुष्ट होने के बाद ही पेमेंट लिया गया।',
    audioTranscript: '"हमारे सूरत टेक्नीशियन ग्राहक के सामने पूरा फोन चेक करवाते हैं। जब आप संतुष्ट हो जाते हैं, तभी हम पेमेंट लेते हैं और साथ में 6 महीने का लिखित वारंटी कार्ड प्रदान करते हैं।"',
    benchColor: 'from-slate-950 via-blue-950 to-slate-900',
    accentColor: 'text-cyan-400',
    videoSteps: [
      'इन-डिस्प्ले फिंगरप्रिंट कैलिब्रेशन',
      'कैमरा फोकस व सेंसर एलाइनमेंट टेस्ट',
      'ग्राहक द्वारा लाइव संतुष्टि चेक',
      'डिजिटल GST बिल व वारंटी कार्ड हैंडओवर'
    ]
  }
];

export const WorkVideosFeedModal: React.FC<WorkVideosFeedModalProps> = ({
  isOpen,
  onClose
}) => {
  const { setActiveTab } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeVideoIndex, setActiveVideoIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(20);

  const filteredVideos = selectedCategory === 'all'
    ? REPAIR_VIDEOS
    : REPAIR_VIDEOS.filter(v => v.category === selectedCategory);

  const currentVideo = filteredVideos[activeVideoIndex] || filteredVideos[0];

  // Auto-progress video playback simulation
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          return 0;
        }
        return prev + 2.5;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, activeVideoIndex]);

  // Reset video index when category changes
  useEffect(() => {
    setActiveVideoIndex(0);
    setProgress(0);
    setIsPlaying(true);
  }, [selectedCategory]);

  if (!isOpen) return null;

  const handleBookThisRepair = () => {
    onClose();
    setActiveTab('repair');
    setTimeout(() => {
      document.getElementById('repair-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 text-white rounded-3xl shadow-2xl border border-slate-700/60 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                  मेरे काम के लाइव वीडियो फीड
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>सूरत रिपेयर बेंच लाइव</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                सूरत में हमारे द्वारा किए गए वास्तविक मोबाइल रिपेयरिंग, स्क्रीन व मदरबोर्ड काम
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="बंद करें"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          {[
            { id: 'all', label: 'सभी काम (All Videos)' },
            { id: 'screen', label: '📱 स्क्रीन व डिस्प्ले' },
            { id: 'ic_motherboard', label: '🔬 मदरबोर्ड व IC सोल्डरिंग' },
            { id: 'battery_charging', label: '⚡ बैटरी व चार्जिंग' },
            { id: 'handover', label: '🤝 डोरस्टेप हैंडओवर' }
          ].map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Main Content Area (Video Reel Player on Left/Top, Work Specs on Right/Bottom) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 min-h-0">
          {/* Video Player Column */}
          <div className="md:col-span-7 bg-black p-4 sm:p-5 flex flex-col justify-between relative border-b md:border-b-0 md:border-r border-slate-800">
            {/* Visual Simulated Video Screen */}
            <div className={`relative w-full aspect-16/10 rounded-2xl bg-gradient-to-br ${currentVideo.benchColor} p-4 sm:p-5 border border-slate-700/70 shadow-2xl overflow-hidden flex flex-col justify-between`}>
              {/* Microscope/Grid Background Pattern overlay */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                  backgroundSize: '16px 16px'
                }}
              />

              {/* Live Tag & Model Badge */}
              <div className="relative z-10 flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span>LIVE REPAIR CLIP</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-amber-400 font-mono text-[10px]">{currentVideo.durationMinutes} min job</span>
                </div>

                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-900/60 backdrop-blur-md border border-blue-400/30 text-blue-200 text-[10px] font-semibold">
                  <MapPin className="w-3 h-3 text-red-400" />
                  <span>{currentVideo.locality}</span>
                </div>
              </div>

              {/* Center Bench Work Illustration / Live Indicator */}
              <div className="relative z-10 my-auto text-center space-y-2 py-4">
                <div className="relative w-20 h-20 mx-auto rounded-2xl bg-slate-900/90 border-2 border-blue-500/50 flex items-center justify-center shadow-xl group">
                  {isPlaying ? (
                    <div className="relative flex items-center justify-center">
                      <Cpu className="w-10 h-10 text-blue-400 animate-pulse" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                  ) : (
                    <Play className="w-10 h-10 text-white fill-white translate-x-0.5" />
                  )}
                </div>

                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-800/80 text-slate-300 text-[10px] font-mono border border-slate-700">
                    STAGE: {currentVideo.benchStage}
                  </span>
                  <h4 className="text-sm sm:text-base font-black text-white mt-1">
                    {currentVideo.phoneModel}
                  </h4>
                </div>
              </div>

              {/* Bottom Progress & Video Controls Overlay */}
              <div className="relative z-10 space-y-2 bg-black/40 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
                {/* Progress Bar */}
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-300 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPlaying(prev => !prev)}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsMuted(prev => !prev)}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                    </button>

                    <span className="text-[11px] text-slate-400 font-mono">
                      {Math.floor((progress / 100) * currentVideo.durationMinutes)}:00 / {currentVideo.durationMinutes}:00
                    </span>
                  </div>

                  <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>सत्यापित ओरिजिनल काम</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Technician Voice Commentary Note */}
            <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px]">
                <Volume2 className="w-3.5 h-3.5" />
                <span>टेक्नीशियन की लाइव आवाज / कमेंट्री:</span>
              </div>
              <p className="text-[11px] text-slate-300 italic leading-relaxed">
                {currentVideo.audioTranscript}
              </p>
            </div>
          </div>

          {/* Work Specs, Step-by-Step, and Booking Column */}
          <div className="md:col-span-5 p-4 sm:p-5 flex flex-col justify-between space-y-4 bg-slate-900 overflow-y-auto">
            <div className="space-y-3.5">
              <div>
                <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-wider border border-blue-500/30">
                  {currentVideo.categoryLabel}
                </span>
                <h4 className="text-base font-black text-white mt-1 leading-snug">
                  {currentVideo.title}
                </h4>
              </div>

              {/* 4 Quick Spec Cards */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block font-medium">📍 स्थान / क्षेत्र</span>
                  <span className="font-bold text-slate-200 text-[11px] truncate block">{currentVideo.locality}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block font-medium">⏱️ कुल समय</span>
                  <span className="font-bold text-amber-300 text-[11px] block">{currentVideo.durationMinutes} मिनट में पूरा</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 col-span-2">
                  <span className="text-[10px] text-slate-400 block font-medium">🛠️ इस्तेमाल किए गए पार्ट्स</span>
                  <span className="font-bold text-slate-100 text-[11px] block">{currentVideo.partsReplaced}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 col-span-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">🛡️ वारंटी गारंटी</span>
                    <span className="font-bold text-emerald-400 text-[11px] block">{currentVideo.warranty}</span>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                </div>
              </div>

              {/* Technician Step Checklist */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  काम के मुख्य चरण (Step-by-Step):
                </span>
                <div className="space-y-1 text-xs">
                  {currentVideo.videoSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/70 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="text-[11px]">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technician Bench Notes */}
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-[11px] text-slate-300 leading-relaxed">
                <span className="font-bold text-blue-300 block mb-0.5">काम का विवरण:</span>
                {currentVideo.technicianNotes}
              </div>
            </div>

            {/* Action Bottom Section */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <button
                type="button"
                onClick={handleBookThisRepair}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer group"
              >
                <Wrench className="w-4 h-4 text-white group-hover:rotate-45 transition-transform" />
                <span>इसी प्रकार का रिपेयर बुक करें (मात्र ₹199 टोकन)</span>
                <ChevronRight className="w-4 h-4 text-blue-200 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Video Switcher Thumbnails */}
              <div className="pt-1">
                <span className="text-[10px] text-slate-400 block mb-1">अन्य वीडियो देखें ({filteredVideos.length}):</span>
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                  {filteredVideos.map((vid, idx) => (
                    <button
                      key={vid.id}
                      type="button"
                      onClick={() => {
                        setActiveVideoIndex(idx);
                        setProgress(0);
                        setIsPlaying(true);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all whitespace-nowrap cursor-pointer ${
                        activeVideoIndex === idx
                          ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {idx + 1}. {vid.phoneModel.split(' ')[0]} {vid.phoneModel.split(' ')[1] || ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
