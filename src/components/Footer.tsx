import React from 'react';
import { useApp } from '../context/AppContext';
import { SURAT_LOCALITIES, WHATSAPP_NUMBER } from '../data/mockData';
import { ShieldCheck, MapPin, ExternalLink, Building2, MessageCircle, Globe, Flag, Headphones } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setLegalModal, setSelectedLocality, setActiveTab, setIsBrandCentersModalOpen, language } = useApp();

  return (
    <footer className="bg-slate-950 text-slate-300 pt-12 pb-8 border-t border-slate-800 text-xs">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Prominent AllIndia.si Parent Brand & Corporate Trust Banner */}
        <div className="mb-10 p-6 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/30">
                <Flag className="w-3.5 h-3.5 text-amber-400" />
                <span>100% भारतीय स्वामित्व वाली पैरेंट कंपनी (Proudly Indian Enterprise)</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>AllIndia.si (aisiindia) पैरेंट ग्रुप का अटूट विश्वास</span>
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                <strong className="text-white">sastaphone.in</strong> सम्पूर्ण रूप से <strong className="text-blue-400">AllIndia.si (aisiindia)</strong> के प्रतिष्ठित भारतीय डिजिटल नेटवर्क द्वारा संचालित और 100% गारंटीकृत है। sastaphone.in का सम्पूर्ण वेब ट्रैफिक AllIndia.si के सुरक्षित नेशनल पैरेंट पोर्टल पर रीडायरेक्ट और मॉनिटर होता है। देश के नागरिकों के लिए निष्पक्ष डील्स, 100% डेटा प्राइवेसी और सुरक्षित लेनदेन का राष्ट्रीय भरोसा।
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                <a
                  href="https://allindia.si"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black flex items-center gap-1.5 transition-all shadow-md"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>allindia.si आधिकारिक पोर्टल</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <a
                  href="https://aisi.si"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-blue-200 hover:text-white font-bold flex items-center gap-1.5 border border-white/20 transition-all"
                >
                  <span>aisi.si नेटवर्क गेटवे</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>पैरेंट कंपनी ऑलइंडिया सुरक्षा प्रमाणन</span>
                </span>
              </div>
            </div>

            {/* Corporate Badge */}
            <div className="shrink-0 p-4 rounded-2xl bg-white/5 border border-white/15 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Parent Company Guarantee
              </span>
              <p className="text-lg font-black text-white">AllIndia.si</p>
              <p className="text-[10px] text-blue-300">National Digital Ecosystem</p>
              <span className="inline-block px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold">
                ISO & Trust Compliant
              </span>
            </div>
          </div>
        </div>

        {/* 4-Col Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Col 1: Brand & Surat Focus */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-amber-500 flex items-center justify-center text-white font-black text-sm">
                S📱
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                Sasta<span className="text-blue-400">phone</span>
              </span>
              <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-mono">
                सूरत
              </span>
            </div>

            <p className="text-slate-400 leading-relaxed text-xs">
              सूरत का पहला 100% क्लिकेबल व विश्वसनीय डोरस्टेप मोबाइल प्लेटफॉर्म। पुराना फोन बेचें, 6 महीने वारंटी वाले सर्टिफाइड फोन खरीदें, घर बैठे रिपेयर करवाएं या "सस्ता बाज़ार" में सीधे ग्राहक से सुरक्षित डील करें।
            </p>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-[11px]">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Official Entity:
              </span>
              <p className="text-slate-300 font-semibold">
                Sastaphone Surat • A Venture of AllIndia.si Network
              </p>
              <p className="text-[10px] text-slate-500">
                रिंग रोड व अडाजण सेंट्रल मोबाइल लैब, सूरत, गुजरात
              </p>
            </div>
          </div>

          {/* Col 2: Core Services */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">
              प्रमुख सेवाएं (Services)
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => {
                    setActiveTab('sell');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  📱 पुराना फोन बेचें (AI इंस्टेंट वैल्यूएशन)
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('buy');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  🛒 दिवाली धमाका: टॉप 10 सेकंड-हैंड डील्स
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('repair');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  🔧 घर पर मोबाइल रिपेयर (₹199 विज़िट टोकन)
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('bazaar');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>🏷️ सस्ता बाज़ार (P2P मोबाइल मंडी)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveTab('sell');
                    setTimeout(() => {
                      document.getElementById('dead-phone-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="text-rose-400 hover:text-rose-300 font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>♻️ डेड व स्क्रैप फोन बेचें (₹600 - ₹1,600 / KG भाव)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsBrandCentersModalOpen(true)}
                  className="text-blue-400 hover:text-blue-300 font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Building2 className="w-3 h-3" />
                  <span>सूरत अधिकृत ब्रांड सर्विस सेंटर डायरेक्टरी</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Surat Localities Coverage */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>सूरत के प्रमुख क्षेत्र</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {SURAT_LOCALITIES.slice(0, 10).map(loc => (
                <button
                  key={loc.id}
                  onClick={() => {
                    setSelectedLocality(`${loc.name}, Surat`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-blue-600 hover:text-white text-slate-300 text-[11px] transition-colors cursor-pointer border border-slate-800"
                >
                  {loc.name}
                </button>
              ))}
              <span className="text-[10px] text-slate-500 self-center">+ अन्य सभी सूरत क्षेत्र</span>
            </div>
          </div>

          {/* Col 4: Official Parent Support (Personal number is hidden!) */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-2">
              ऑलइंडिया कॉर्पोरेट हेल्पडेस्क
            </h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              सुबह 9:00 बजे से रात 9:00 बजे तक पैरेंट कंपनी AllIndia.si द्वारा 24x7 डिजिटल सहायता उपलब्ध है।
            </p>

            {/* Official Support Channel without exposing raw personal number */}
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Headphones className="w-4 h-4 text-blue-400" />
                <span>AllIndia.si हेल्पडेस्क</span>
              </div>
              <p className="text-[11px] text-slate-400">
                कॉर्पोरेट ईमेल: <span className="text-blue-300">support@allindia.si</span>
              </p>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=नमस्ते AllIndia.si / Sastaphone Surat! मुझे सहायता चाहिए।`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>ऑफ़िशियल सहायता चैट (WhatsApp)</span>
              </a>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-emerald-400 pt-1">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>AllIndia.si 100% सुरक्षित भुगतान व डेटा वाइप गारंटी</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar & Legal Links */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <p>
            © {new Date().getFullYear()} Sastaphone Surat. All rights reserved. An Official Venture of <strong className="text-slate-400">AllIndia.si (aisiindia)</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setLegalModal('trademark')}
              className="hover:text-slate-300 underline cursor-pointer text-amber-400 font-semibold"
            >
              ट्रेडमार्क व कॉपीराइट डिस्क्लेमर
            </button>
            <button
              onClick={() => setLegalModal('terms')}
              className="hover:text-slate-300 underline cursor-pointer"
            >
              Terms & Conditions
            </button>
            <button
              onClick={() => setLegalModal('privacy')}
              className="hover:text-slate-300 underline cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setLegalModal('cookies')}
              className="hover:text-slate-300 underline cursor-pointer"
            >
              Cookies Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
