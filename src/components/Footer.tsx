import React from 'react';
import { useApp } from '../context/AppContext';
import { SastafoneLogo } from './SastafoneLogo';
import { SURAT_LOCALITIES, WHATSAPP_NUMBER } from '../data/mockData';
import { ShieldCheck, MapPin, ExternalLink, Building2, MessageCircle, Globe, Flag, Headphones, Lock, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  const {
    setLegalModal,
    setSelectedLocality,
    selectedLocality,
    setActiveTab,
    setIsBrandCentersModalOpen,
    language,
    setIsAdminModalOpen,
    user,
    openEmailSupportWithPreset
  } = useApp();

  return (
    <footer className="bg-slate-950 text-slate-300 pt-12 pb-8 border-t border-slate-800 text-xs">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Sastaphone Surat Trust & Doorstep Assurance Banner */}
        <div className="mb-10 p-6 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/30 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/30">
                <Flag className="w-3.5 h-3.5 text-amber-400" />
                <span>सूरत का 100% प्रामाणिक व अधिकृत मोबाइल हब (sastafone.in)</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>सस्ताफोन सूरत (Sastafone.in) - अटूट भरोसा व पारदर्शिता</span>
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                <strong className="text-white">sastafone.in</strong> सूरत वासियों के लिए पुराना मोबाइल बेचने, 6 माह वारंटी वाले सर्टिफाइड फोन खरीदने, 30 मिनट में घर बैठे ओरिजिनल रिपेयर करवाने एवं डेड/स्क्रैप फोन के उच्चतम दाम पाने का आधिकारिक डिजिटल प्लेटफॉर्म है। निष्पक्ष डील्स, 100% डेटा प्राइवेसी और सुरक्षित लेनदेन का सच्चा भरोसा।
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=नमस्ते Sastaphone Surat! मुझे जानकारी चाहिए।`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>सूरत 24x7 WhatsApp हेल्पलाइन (डायरेक्ट चैट)</span>
                </a>

                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>100% डेटा प्राइवेसी व ऑन-स्पॉट पेमेंट गारंटी</span>
                </span>
              </div>
            </div>

            {/* Sastaphone Badge */}
            <div className="shrink-0 p-4 rounded-2xl bg-white/5 border border-white/15 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Official Surat Portal
              </span>
              <p className="text-lg font-black text-white">Sastaphone.in</p>
              <p className="text-[10px] text-amber-300">सूरत नंबर 1 डोरस्टेप हब</p>
              <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-[10px] font-bold">
                ✓ 100% Verified
              </span>
            </div>
          </div>
        </div>

        {/* 4-Col Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Col 1: Brand & Surat Focus */}
          <div className="space-y-3">
            <div>
              <SastafoneLogo variant="dark" size="sm" showSubtitle={false} />
            </div>

            <p className="text-slate-400 leading-relaxed text-xs">
              सूरत का पहला 100% क्लिकेबल व विश्वसनीय डोरस्टेप मोबाइल प्लेटफॉर्म। पुराना फोन बेचें, 6 महीने वारंटी वाले सर्टिफाइड फोन खरीदें, घर बैठे रिपेयर करवाएं या "सस्ता बाज़ार" में सीधे ग्राहक से सुरक्षित डील करें।
            </p>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-[11px]">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                Official Entity:
              </span>
              <p className="text-slate-300 font-semibold">
                Sastafone Surat • Authorized Mobile Hub (sastafone.in)
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

          {/* Col 4: Official Sastaphone Surat Support */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-2">
              सस्ताफोन सूरत हेल्पडेस्क
            </h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              सुबह 9:00 बजे से रात 9:30 बजे तक सूरत वासियों के लिए तुरंत डिजिटल व ऑन-कॉल सहायता उपलब्ध है।
            </p>

            {/* Official Support Channel with 1-Click Preset Problem Direct Email */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950/60 border border-blue-500/30 space-y-2.5 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Headphones className="w-4 h-4 text-amber-400" />
                  <span>सूरत कस्टमर केयर</span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  24x7 एक्टिव
                </span>
              </div>

              <div className="text-[11px] text-slate-300 space-y-0.5">
                <p>
                  आधिकारिक ईमेल:{' '}
                  <button
                    type="button"
                    onClick={() => openEmailSupportWithPreset()}
                    className="text-blue-300 hover:text-amber-300 underline font-mono cursor-pointer transition-colors"
                    title="1-क्लिक समस्या चुनकर ईमेल भेजें"
                  >
                    support@sastafone.in
                  </button>
                </p>
                <p className="text-[10px] text-slate-400">
                  सूरत सेंट्रल हब • 2 घंटे में समाधान गारंटी
                </p>
              </div>

              <button
                type="button"
                onClick={() => openEmailSupportWithPreset()}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer border border-blue-400/30 group"
                title="समस्या चुनें व तुरंत ईमेल भेजें"
              >
                <Mail className="w-3.5 h-3.5 fill-white text-blue-600 group-hover:scale-110 transition-transform" />
                <span>📧 समस्या चुनें व डायरेक्ट मेल करें (support@sastafone.in)</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-emerald-400 pt-1">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>सस्ताफोन 100% सुरक्षित भुगतान व डेटा वाइप गारंटी</span>
            </div>
          </div>
        </div>

        {/* Dedicated Admin Portal Trigger in Footer (Owner / Staff) */}
        <div className="mt-8 pt-4 pb-2 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>सूरत सेंट्रल हब सर्वर लाइव • sastafone.in अधिकृत डिजिटल हब</span>
          </div>

          <button
            type="button"
            onClick={() => setIsAdminModalOpen(true)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              user.role === 'admin'
                ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md font-black'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 hover:border-amber-400/50 text-slate-400 hover:text-amber-300'
            }`}
            title="सस्ताफोन अधिकृत ओनर व एडमिन पोर्टल लॉगिन"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>{user.role === 'admin' ? '🛡️ एडमिन कंट्रोल रूम (ओनर एक्टिव)' : '🔐 एडमिन मोड (sastafone.in)'}</span>
          </button>
        </div>

        {/* Bottom Bar & Legal Links */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <p>
            © {new Date().getFullYear()} Sastafone Surat (sastafone.in). All rights reserved. सूरत का नंबर 1 विश्वसनीय मोबाइल प्लेटफॉर्म।
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
