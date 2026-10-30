import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SURAT_LOCALITIES, BRANDS } from '../data/mockData';
import { MapPin, Search, ShieldCheck, Sparkles, Star, ChevronDown, ChevronUp, Wrench, Smartphone, Tag, RefreshCw } from 'lucide-react';

export const SuratLocalSeoSection: React.FC = () => {
  const { setSelectedLocality, setActiveTab, language } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);

  const singleKeywords = [
    'sastaphone', 'sastafone', 'सस्ताफोन', 'सस्ता फोन', 'surat', 'mobile', 'repair',
    'refurbished', 'secondhand', 'buyback', 'deadphone', 'scrap', 'bazaar', 'mandi', 'sastaphonein'
  ];

  const doubleKeywords = [
    'sastaphone surat', 'sastafone surat', 'second hand mobile surat', 'purana phone surat',
    'mobile repair surat', 'doorstep mobile repair', 'phone repair near me', 'sell phone surat',
    'buy phone surat', 'dead mobile surat', 'sasta bazar surat', 'mobile mandi surat',
    'refurbished phone surat', 'screen repair surat', 'battery change surat', 'scrap mobile surat'
  ];

  const tripleKeywords = [
    'second hand mobile in surat near me',
    'best price purana mobile beche surat',
    '30 minute doorstep mobile repair in surat',
    'purana band dead phone scrap rate surat per kg',
    'apple iphone screen replacement surat doorstep',
    'samsung original display repair near me surat',
    'vivo oppo realme refurbished 5g phone in surat',
    'sasta bazar direct p2p mobile mandi 0 brokerage',
    'sastaphone official contact number surat whatsapp',
    'high storage 256gb dead phone cash buyback surat'
  ];

  const brandKeywords = [
    'Samsung Repair Surat', 'iPhone Screen Repair Surat', 'Vivo Service Surat',
    'Oppo Doorstep Repair Surat', 'Realme 5G Phone Surat', 'OnePlus Display Fix Surat',
    'Xiaomi Redmi Repair Surat', 'Motorola Buyback Surat', 'iQOO Phone Deals Surat',
    'POCO Screen Change Surat', 'Lava Mobile Service Surat', 'Nothing Phone Repair Surat'
  ];

  return (
    <section id="surat-seo-directory" className="py-10 bg-slate-900 text-slate-300 border-t border-slate-800 text-xs">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header with Google My Business Trust */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[11px] font-bold mb-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>सूरत's #1 गूगल व AI-सर्च वेरीफाइड मोबाइल डायरेक्टरी</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              सस्ताफोन सूरत (Sastaphone / Sastafone) - ऑल सूरत मोबाइल हब
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              सूरत के प्रत्येक वार्ड व लोकैलिटी में पुराना मोबाइल बेचने, सर्टिफाइड सेकंड-हैंड फोन खरीदने, 30 मिनट में घर बैठे ओरिजिनल रिपेयर करवाने एवं डेड स्मार्टफोन बेस्ट प्राइस में बेचने की सम्पूर्ण अधिकृत डायरेक्टरी।
            </p>
          </div>

          {/* GMB Rating Card */}
          <div className="shrink-0 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1 text-center md:text-right">
            <div className="flex items-center justify-center md:justify-end gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
              <span className="text-white font-black text-sm ml-1">4.9 / 5</span>
            </div>
            <p className="text-[11px] text-slate-300 font-semibold">Google My Business Surat Rating</p>
            <p className="text-[10px] text-slate-400">285+ सत्यापित सूरत ग्राहक समीक्षाएं • 100% संतोष</p>
          </div>
        </div>

        {/* 4 Interactive Feature Columns linking directly to sections */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div
            onClick={() => {
              setActiveTab('sell');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            role="button"
            tabIndex={0}
            className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-blue-500 hover:bg-slate-800 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2 text-blue-400 font-bold mb-1">
              <Smartphone className="w-4 h-4" />
              <span>पुराना फोन बेचें सूरत</span>
            </div>
            <p className="text-[11px] text-slate-400">
              सूरत में 2 घंटे में फ्री होम पिकअप, बेस्ट AI वैल्यूएशन व ऑन-स्पॉट बोनस कैश।
            </p>
          </div>

          <div
            onClick={() => {
              setActiveTab('repair');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            role="button"
            tabIndex={0}
            className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-blue-500 hover:bg-slate-800 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2 text-indigo-400 font-bold mb-1">
              <Wrench className="w-4 h-4" />
              <span>घर पर रिपेयरिंग ₹199</span>
            </div>
            <p className="text-[11px] text-slate-400">
              सूरत के हर इलाके में 30 मिनट में टेक्नीशियन विज़िट, ओरिजिनल पार्ट्स, 90 दिन वारंटी।
            </p>
          </div>

          <div
            onClick={() => {
              setActiveTab('buy');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            role="button"
            tabIndex={0}
            className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-blue-500 hover:bg-slate-800 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
              <Sparkles className="w-4 h-4" />
              <span>सेकंड हैंड फोन डील्स</span>
            </div>
            <p className="text-[11px] text-slate-400">
              32-पॉइंट टेस्टेड, 6 महीने वारंटी, 7 दिन रिप्लेसमेंट गारंटी के साथ सूरत में डिलीवरी।
            </p>
          </div>

          <div
            onClick={() => {
              setActiveTab('sell');
              setTimeout(() => {
                document.getElementById('dead-phone-section')?.scrollIntoView({ behavior: 'smooth' });
              }, 80);
            }}
            role="button"
            tabIndex={0}
            className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-rose-500 hover:bg-slate-800 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2 text-rose-400 font-bold mb-1">
              <RefreshCw className="w-4 h-4" />
              <span>डेड फोन ₹600-₹1600</span>
            </div>
            <p className="text-[11px] text-slate-400">
              पूरा बंद या टूटा स्मार्टफोन, 256GB+ पर ₹1,600 लास्ट एवं ऑन न होने वाले स्मार्टफोन्स ₹600-₹1200।
            </p>
          </div>
        </div>


        {/* 
          SEO KEYWORD & SEARCH INDEX BLOCK (HIDDEN FROM VISIBLE UI AS REQUESTED BY USER)
          Kept accessible in DOM (sr-only / schema) so Google, Bing, and AI LLM search crawlers index all keywords
          without cluttering the human user interface.
        */}
        <div className="sr-only" aria-hidden="true">
          <h3>सूरत मोबाइल सर्च इंडेक्स (Google, Bing & AI LLM Search Keywords)</h3>
          <div>
            <h4>Trending Surat Mobile Keywords</h4>
            <ul>
              {doubleKeywords.map((kw, i) => (
                <li key={i}>{kw}</li>
              ))}
              {tripleKeywords.map((kw, i) => (
                <li key={i}>{kw}</li>
              ))}
              {brandKeywords.map((bkw, i) => (
                <li key={i}>{bkw}</li>
              ))}
              {singleKeywords.map((skw, i) => (
                <li key={i}>{skw}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Sastaphone Surat Official Google My Business Entity Data</h4>
            <p>Business Name: Sastaphone Surat (सस्ताफोन) • Surat Certified Mobile Hub (sastaphone.in)</p>
            <p>Physical Hubs: Ring Road, Athwa Gate & Adajan Central Super Lab, Surat, Gujarat 395001</p>
            <p>Service Coverage: Adajan, Vesu, Pal, Varachha, Katargam, Citylight, Piplod, Ghod Dod Road, Athwa, Rander, Udhna, Dindoli, Althan, VIP Road, Begampura, Surat</p>
            <p>Helpline: +91 9372802044 | Open Daily 9:00 AM – 9:30 PM</p>
          </div>
        </div>
      </div>
    </section>
  );
};
