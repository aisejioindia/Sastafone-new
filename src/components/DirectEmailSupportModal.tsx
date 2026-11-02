import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Mail,
  Send,
  CheckCircle2,
  Copy,
  Check,
  Smartphone,
  Wrench,
  ShoppingBag,
  Recycle,
  Tag,
  Clock,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  FileText
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PresetIssue {
  id: string;
  category: 'sell' | 'repair' | 'buy' | 'dead' | 'bazaar' | 'order';
  title: string;
  shortDesc: string;
  defaultSubject: string;
  defaultBodyTemplate: (locality: string) => string;
}

const PRESET_ISSUES: PresetIssue[] = [
  // 1. Sell Old Phone
  {
    id: 'sell-unlisted',
    category: 'sell',
    title: '📱 मॉडल लिस्ट में नहीं मिल रहा (Unlisted Phone Model)',
    shortDesc: 'मेरा फोन ब्रांड या मॉडल ड्रॉपडाउन में उपलब्ध नहीं है, सही भाव जानना है।',
    defaultSubject: '[सस्ताफोन सेल] अनलिस्टेड फोन मॉडल - बेस्ट AI भाव व पिकअप पूछताछ',
    defaultBodyTemplate: (loc) =>
      `नमस्ते Sastafone Surat सपोर्ट टीम!\n\nविषय: अनलिस्टेड फोन मॉडल का भाव\n\nमेरे फोन का विवरण:\n- ब्रांड व मॉडल:\n- स्टोरेज (GB/RAM):\n- कंडीशन (स्क्रीन/बॉडी/बैटरी):\n- बिल व चार्जर उपलब्ध है या नहीं:\n- सूरत क्षेत्र: ${loc}\n\nकृपया मुझे इस मॉडल का अधिकतम नकद भाव बताएं और सूरत में पिकअप का समय दें।`
  },
  {
    id: 'sell-high-quote',
    category: 'sell',
    title: '💰 अधिकतम स्पॉट बोनस भाव चाहिए (Best Price Guarantee)',
    shortDesc: 'मेरा फोन बहुत अच्छी कंडीशन में है, मुझे अतिरिक्त स्पॉट बोनस कोटेशन चाहिए।',
    defaultSubject: '[सस्ताफोन सेल] फोन कंडीशन A+ है - स्पेशल स्पॉट बोनस कोटेशन',
    defaultBodyTemplate: (loc) =>
      `नमस्ते Sastafone Surat सपोर्ट टीम!\n\nविषय: स्पेशल स्पॉट बोनस कोटेशन\n\nफोन विवरण:\n- मॉडल:\n- कंडीशन: A+ स्क्रैचलेस\n- वारंटी/बिल स्थिति:\n- सूरत क्षेत्र: ${loc}\n\nकृपया मुझे मौके पर मिलने वाला अधिकतम रेट व स्पॉट बोनस कन्फर्म करें।`
  },
  {
    id: 'sell-no-bill',
    category: 'sell',
    title: '📄 बिना बिल/बॉक्स का फोन बेचना है (No Bill/Box Buyback)',
    shortDesc: 'बिल खो गया है, क्या आधार कार्ड व वैध ID देकर फोन तुरंत बेच सकते हैं?',
    defaultSubject: '[सस्ताफोन सेल] बिना बिल/बॉक्स फोन बायबैक प्रक्रिया',
    defaultBodyTemplate: (loc) =>
      `नमस्ते Sastafone Surat!\n\nमेरे फोन का बिल और बॉक्स खो गया है:\n- फोन मॉडल:\n- क्या मेरे आधार कार्ड/आईडी प्रूफ के साथ मौके पर तुरंत कैश/UPI भुगतान हो जाएगा?\n- सूरत क्षेत्र: ${loc}\n\nकृपया बिना बिल की पिकअप गाइडलाइन बताएं।`
  },

  // 2. Repair
  {
    id: 'repair-screen',
    category: 'repair',
    title: '🔧 टूटी हुई स्क्रीन / डिस्प्ले बदलवाना (Screen Replacement)',
    shortDesc: 'ओरिजिनल टच स्क्रीन, 6 महीने वारंटी और ₹199 विज़िट टोकन से रिपेयर।',
    defaultSubject: '[सस्ताफोन रिपेयर] टूटी स्क्रीन/डिस्प्ले रिप्लेसमेंट व वारंटी रेट',
    defaultBodyTemplate: (loc) =>
      `नमस्ते Sastafone Surat रिपेयर टीम!\n\nविषय: स्क्रीन / डिस्प्ले रिप्लेसमेंट\n\n- फोन मॉडल:\n- समस्या: ग्लास टूटा / टच काम नहीं कर रहा / लाइन आ रही है\n- ओरिजिनल या OEM स्क्रीन का रेट:\n- क्या 30 मिनट में घर बैठे (${loc}) में रिपेयर हो जाएगा?\n\nकृपया स्लॉट व वारंटी कन्फर्म करें।`
  },
  {
    id: 'repair-dead-diagnostic',
    category: 'repair',
    title: '⚡ फोन चालू नहीं हो रहा / पानी में गिरा (Dead Phone Diagnostic)',
    shortDesc: 'मदरबोर्ड या शॉर्ट सर्किट समस्या, ₹199 टोकन व ₹99 रिफंड पॉलिसी।',
    defaultSubject: '[सस्ताफोन रिपेयर] डेड मोबाइल डायग्नोस्टिक व ₹199 टोकन पूछताछ',
    defaultBodyTemplate: (loc) =>
      `नमस्ते Sastafone Surat!\n\nविषय: डेड फोन व डायग्नोस्टिक\n\n- फोन मॉडल:\n- समस्या: फोन अचानक बंद हो गया / पानी में गिरा था\n- सूरत क्षेत्र: ${loc}\n\nकृपया टेक्नीशियन विज़िट स्लॉट बताएं और यदि रिपेयर न हो तो ₹99 रिफंड नियम बताएं।`
  },
  {
    id: 'repair-camera-battery',
    category: 'repair',
    title: '🔋 बैटरी बैकअप या कैमरा ब्लर (Battery / Camera 12% Off)',
    shortDesc: 'बैटरी हेल्थ 80% से कम है या कैमरा OIS/लेंस ब्लर समस्या, 12% ऑफ रेट।',
    defaultSubject: '[सस्ताफोन रिपेयर] बैटरी रिप्लेसमेंट / कैमरा लेंस रिपेयर (12% डिस्काउंट)',
    defaultBodyTemplate: (loc) =>
      `नमस्ते Sastafone Surat!\n\nविषय: बैटरी या कैमरा रिपेयर\n\n- फोन मॉडल:\n- समस्या विवरण (बैटरी ड्रेन / कैमरा धुंधला):\n- सूरत क्षेत्र: ${loc}\n\nकृपया 12% स्पेशल लैब डिस्काउंट के साथ फाइनल कोट दें।`
  },

  // 3. Buy Refurbished
  {
    id: 'buy-warranty-stock',
    category: 'buy',
    title: '🛒 6 महीने वारंटी वाले फोन का स्टॉक (Certified Stock Inquiry)',
    shortDesc: 'iPhone 13, 14, Samsung S23, S24 Ultra व OnePlus की करंट उपलब्धता।',
    defaultSubject: '[सस्ताफोन बाय] 6 महीने वारंटी वाले सर्टिफाइड फोन का स्टॉक व बेस्ट रेट',
    defaultBodyTemplate: (loc) =>
      `नमस्ते Sastafone Surat सेल्स टीम!\n\nविषय: सर्टिफाइड सेकंड-हैंड फोन स्टॉक\n\n- मुझे इस मॉडल में रुचि है:\n- बजट:\n- क्या सूरत (${loc}) में कैश ऑन डिलीवरी व टेस्टिंग उपलब्ध है?\n\nकृपया उपलब्ध यूनिट्स की तस्वीरें व Pro-Audit रिपोर्ट भेजें।`
  },

  // 4. Dead Scrap
  {
    id: 'dead-scrap-rate',
    category: 'dead',
    title: '♻️ डेड फोन स्क्रैप व वजन का भाव (₹600 - ₹1,600 / KG)',
    shortDesc: 'टूटे, पुराने कीपैड या बंद स्मार्टफोन किलो के भाव या फिक्स रेट में बेचना।',
    defaultSubject: '[सस्ताफोन स्क्रैप] डेड व कबाड़ फोन बायबैक / वजन अनुसार भाव',
    defaultBodyTemplate: (loc) =>
      `नमस्ते Sastafone Surat!\n\nविषय: डेड फोन स्क्रैप सेल\n\n- मेरे पास कुल डेड फोन की संख्या:\n- स्मार्टफोन / कीपैड फोन विवरण:\n- सूरत क्षेत्र: ${loc}\n\nकृपया किलो के हिसाब से या पर-पीस पिकअप का भाव बताएं।`
  },

  // 5. SastaBazaar P2P
  {
    id: 'bazaar-pass-help',
    category: 'bazaar',
    title: '🏷️ सस्ता बाज़ार ₹99 पास या लिस्टिंग सहायता (P2P Support)',
    shortDesc: 'बायर पास से 10 सेलर नंबर अनलॉक करने या अपना फोन लिस्ट करने में सहायता।',
    defaultSubject: '[सस्ता बाज़ार] P2P मोबाइल मंडी - बायर पास / लिस्टिंग पूछताछ',
    defaultBodyTemplate: (loc) =>
      `नमस्ते Sastafone Surat!\n\nविषय: सस्ता बाज़ार P2P सहायता\n\n- समस्या विवरण:\n- फोन नंबर:\n- सूरत क्षेत्र: ${loc}\n\nकृपया मुझे सेलर डायरेक्ट कॉन्टैक्ट अनलॉक करने में मार्गदर्शन दें।`
  },

  // 6. Order & Invoice
  {
    id: 'order-status-invoice',
    category: 'order',
    title: '🧾 ऑर्डर स्टेटस ट्रैकिंग या GST इनवॉइस प्रति (Order & Billing)',
    shortDesc: 'मेरे बुक किए गए ऑर्डर का लाइव स्टेटस या इनवॉइस कॉपी प्राप्त करना।',
    defaultSubject: '[सस्ताफोन ऑर्डर] ऑर्डर स्टेटस व इनवॉइस कॉपी अनुरोध',
    defaultBodyTemplate: (loc) =>
      `नमस्ते Sastafone Surat!\n\nविषय: ऑर्डर स्टेटस व इनवॉइस\n\n- ऑर्डर नंबर (उदा. STP-SURAT-...):\n- ग्राहक नाम:\n- पंजीकृत मोबाइल नंबर:\n- सूरत क्षेत्र: ${loc}\n\nकृपया मुझे मेरे ऑर्डर का वर्तमान स्टेटस और डिजिटल इनवॉइस भेजें।`
  }
];

export const DirectEmailSupportModal: React.FC = () => {
  const {
    isEmailSupportModalOpen,
    setIsEmailSupportModalOpen,
    emailSupportPresetTopic,
    selectedLocality
  } = useApp();

  const [selectedIssueId, setSelectedIssueId] = useState<string>('sell-unlisted');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customSubject, setCustomSubject] = useState<string>('');
  const [customBody, setCustomBody] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [sentNotice, setSentNotice] = useState<boolean>(false);

  // If opened with a pre-set topic from external trigger, match it
  useEffect(() => {
    if (emailSupportPresetTopic) {
      const match = PRESET_ISSUES.find(
        p => p.id === emailSupportPresetTopic || p.title.toLowerCase().includes(emailSupportPresetTopic.toLowerCase())
      );
      if (match) {
        setSelectedIssueId(match.id);
        setSelectedCategory(match.category);
        setCustomSubject(match.defaultSubject);
        setCustomBody(match.defaultBodyTemplate(selectedLocality));
        return;
      }
    }

    // Default selection
    const current = PRESET_ISSUES.find(p => p.id === selectedIssueId) || PRESET_ISSUES[0];
    setCustomSubject(current.defaultSubject);
    setCustomBody(current.defaultBodyTemplate(selectedLocality));
  }, [emailSupportPresetTopic, isEmailSupportModalOpen]);

  // Handle switching preset issue
  const handleSelectIssue = (issue: PresetIssue) => {
    setSelectedIssueId(issue.id);
    setCustomSubject(issue.defaultSubject);
    setCustomBody(issue.defaultBodyTemplate(selectedLocality));
    setCopied(false);
  };

  const handleSendEmail = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Prepare complete message with customer signature
    const finalSubject = encodeURIComponent(customSubject.trim() || 'Sastafone Surat Support Inquiry');
    const finalBodyText = `${customBody.trim()}\n\n---\nप्रेषक:\nनाम: ${customerName.trim() || 'सूरत निवासी'}\nफ़ोन: ${customerPhone.trim() || 'N/A'}\nसूरत क्षेत्र: ${selectedLocality}\nपोर्टल: sastafone.in (आधिकारिक)`;
    const finalBody = encodeURIComponent(finalBodyText);

    // Open mail client directly to support@sastafone.in
    const mailtoUrl = `mailto:support@sastafone.in?subject=${finalSubject}&body=${finalBody}`;
    window.location.href = mailtoUrl;

    setSentNotice(true);
    confetti({ particleCount: 60, spread: 70 });
    setTimeout(() => {
      setSentNotice(false);
    }, 4000);
  };

  const handleCopyText = () => {
    const textToCopy = `To: support@sastafone.in\nSubject: ${customSubject}\n\n${customBody}\n\n---\nनाम: ${customerName || 'N/A'}\nफोन: ${customerPhone || 'N/A'}\nसूरत क्षेत्र: ${selectedLocality}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    confetti({ particleCount: 30, spread: 50 });
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isEmailSupportModalOpen) return null;

  const filteredIssues = selectedCategory === 'all'
    ? PRESET_ISSUES
    : PRESET_ISSUES.filter(p => p.category === selectedCategory);

  const activeIssue = PRESET_ISSUES.find(p => p.id === selectedIssueId) || PRESET_ISSUES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={() => setIsEmailSupportModalOpen(false)}
      />

      <div className="relative w-full max-w-4xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md border border-blue-400/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  1-क्लिक डायरेक्ट ईमेल सपोर्ट (Direct Email Q&A)
                </h3>
                <span className="hidden sm:inline-block text-[10px] font-black bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-blue-200 flex items-center gap-1.5 mt-0.5">
                <span>आधिकारिक ईमेल:</span>
                <strong className="font-mono text-amber-300">support@sastafone.in</strong>
                <span className="text-slate-400">• सूरत 2-घंटे रिस्पॉन्स गारंटी</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEmailSupportModalOpen(false)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
            title="बंद करें"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Two Columns on Desktop */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Left Column: Preset Problem Selector */}
          <div className="lg:col-span-5 p-4 sm:p-5 bg-slate-50/70 overflow-y-auto space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  <span>अपनी समस्या चुनें (Preset Problems):</span>
                </span>
                <span className="text-[11px] text-blue-600 font-bold">1-क्लिक ड्राफ्ट</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                नीचे दी गई किसी भी समस्या पर क्लिक करें, पूरा ईमेल तुरंत तैयार हो जाएगा:
              </p>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                सभी (All)
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('sell')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === 'sell'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                📱 फोन सेल
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('repair')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === 'repair'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                🔧 रिपेयर
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('buy')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === 'buy'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                🛒 सर्टिफाइड
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('dead')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === 'dead'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                ♻️ स्क्रैप
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('bazaar')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === 'bazaar'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                🏷️ बाज़ार
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('order')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === 'order'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                🧾 इनवॉइस
              </button>
            </div>

            {/* Issues List */}
            <div className="space-y-2">
              {filteredIssues.map((issue) => {
                const isSelected = issue.id === selectedIssueId;
                return (
                  <button
                    key={issue.id}
                    type="button"
                    onClick={() => handleSelectIssue(issue)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/30'
                        : 'bg-white hover:bg-slate-100/80 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <p className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {issue.title}
                      </p>
                      <p className={`text-[11px] leading-relaxed line-clamp-2 ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                        {issue.shortDesc}
                      </p>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  </button>
                );
              })}
            </div>

            {/* Surat Local Hub Notice */}
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-black text-amber-950">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>सूरत ऑफिस कार्य समय:</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                सुबह 9:00 बजे से रात 9:30 बजे तक आपके भेजे गए ईमेल का 2 घंटे के भीतर लिखित समाधान दिया जाता है।
              </p>
            </div>
          </div>

          {/* Right Column: Pre-filled Email Editor & 1-Click Send */}
          <div className="lg:col-span-7 p-4 sm:p-5 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-black text-slate-900">
                  ईमेल ड्राफ्ट प्रीव्यू (Ready to Send)
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                To: <strong className="text-blue-600">support@sastafone.in</strong>
              </span>
            </div>

            {/* Notification if sent */}
            {sentNotice && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-2 text-xs font-bold animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>ईमेल क्लाइंट खुल गया है! support@sastafone.in पर सेंड करें।</span>
              </div>
            )}

            {/* Optional Customer Contact Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  आपका नाम (वैकल्पिक):
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="उदा. राहुल पटेल"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-slate-50 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  सूरत फ़ोन नंबर (वैकल्पिक):
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="9825012345"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-slate-50 font-mono text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Subject Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ईमेल विषय (Subject):
              </label>
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* Message Body Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  ईमेल संदेश (Message Details):
                </label>
                <span className="text-[10px] text-slate-500 font-medium">
                  📍 चयनित क्षेत्र: {selectedLocality}
                </span>
              </div>
              <textarea
                rows={7}
                value={customBody}
                onChange={(e) => setCustomBody(e.target.value)}
                className="w-full p-3 rounded-2xl border border-slate-300 text-xs font-mono bg-slate-50 text-slate-800 leading-relaxed focus:outline-none focus:border-blue-600 focus:bg-white resize-y"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleSendEmail()}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] text-white font-black text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>📧 तुरंत ईमेल भेजें (support@sastafone.in)</span>
              </button>

              <button
                type="button"
                onClick={handleCopyText}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-slate-300"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">✓ ड्राफ्ट टेक्स्ट कॉपी हो गया!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-600" />
                    <span>📋 पूरा ईमेल ड्राफ्ट कॉपी करें (मैन्युअल भेजने हेतु)</span>
                  </>
                )}
              </button>
            </div>

            {/* Privacy & Trust Footer */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5 font-bold text-emerald-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% डेटा प्राइवेसी व निष्पक्ष समाधान</span>
              </span>
              <span>sastafone.in सूरत अधिकृत</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
