import React from 'react';
import { useApp } from '../context/AppContext';
import { SastafoneLogo } from './SastafoneLogo';
import { SURAT_LOCALITIES, WHATSAPP_NUMBER } from '../data/mockData';
import { ShieldCheck, MapPin, MessageCircle, Clock, Mail, Phone, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const {
    setLegalModal,
    setSelectedLocality,
    setActiveTab,
    openEmailSupportWithPreset
  } = useApp();

  const handleNav = (tab: any, path: string) => {
    setActiveTab(tab);
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t border-red-100 text-gray-800 pt-10 pb-8 text-xs">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Surat Assurance Banner (Light Red Tint) */}
        <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-[#FEF2F2] border border-red-200/80">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white text-red-700 text-[11px] font-bold border border-red-200">
                <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                <span>Sastafone Certified Technician Network • सूरत डोरस्टेप सेवा</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                पारदर्शी व प्रामाणिक मोबाइल रिपेयरिंग व बाय-बैक
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                सूरत में ₹199 विज़िट टोकन के साथ घर बैठे पिकअप व डिलीवरी। ₹199 टोकन फाइनल बिल में एडजस्ट हो जाता है (निरीक्षण बाद मना करने पर ₹99 रिफंड, ₹100 इंस्पेक्शन चार्ज)। ₹1000+ के बिल पर 6 महीने वारंटी।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('नमस्ते Sastafone Surat! मुझे मोबाइल सेवा के बारे में जानकारी चाहिए।')}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp पर संपर्क करें</span>
              </a>
            </div>
          </div>
        </div>

        {/* 4-Col Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-gray-100">
          {/* Col 1: Brand & About */}
          <div className="space-y-3">
            <SastafoneLogo variant="light" size="sm" showSubtitle={false} />
            <p className="text-gray-600 leading-relaxed text-xs">
              सूरत की समर्पित डोरस्टेप मोबाइल सेवा। Sastafone Certified Technician Network द्वारा सुरक्षित पिकअप, पारदर्शी रिपेयर और सेकंड-हैंड फोन की प्रामाणिक सुविधा।
            </p>
            <div className="space-y-1 pt-1 text-[11px] text-gray-500">
              <p className="flex items-center gap-1.5 font-medium text-gray-700">
                <Clock className="w-3.5 h-3.5 text-red-600" />
                <span>कार्य समय: 9:00 AM – 9:30 PM (सोमवार - रविवार)</span>
              </p>
              <p className="flex items-center gap-1.5 font-medium text-gray-700">
                <Mail className="w-3.5 h-3.5 text-red-600" />
                <span>support@sastafone.in</span>
              </p>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="font-bold text-gray-900 uppercase tracking-wider text-xs mb-3">
              सेवाएं एवं लिंक
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('repair', '/repair')}
                  className="text-gray-600 hover:text-red-600 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  <span>मोबाइल रिपेयरिंग (Doorstep Repair)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('sell', '/sell-phone')}
                  className="text-gray-600 hover:text-red-600 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  <span>पुराना फोन बेचें (Sell Old Phone)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('buy', '/buy-phones')}
                  className="text-gray-600 hover:text-red-600 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  <span>सर्टिफाइड फोन खरीदें (Buy Phones)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('repair', '/warranty')}
                  className="text-gray-600 hover:text-red-600 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  <span>वारंटी जांचें व क्लेम करें (Warranty)</span>
                </button>
              </li>
              <li>
                <a
                  href={`mailto:support@sastafone.in`}
                  className="text-gray-600 hover:text-red-600 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  <span>संपर्क करें (Contact Support)</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Surat Areas */}
          <div>
            <h4 className="font-bold text-gray-900 uppercase tracking-wider text-xs mb-3 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-red-600" />
              <span>सूरत के प्रमुख क्षेत्र (Areas)</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {['Adajan', 'Vesu', 'Pal', 'Varachha', 'Katargam', 'Rander', 'Piplod', 'Citylight', 'Ghod Dod Road', 'Althan', 'Udhna', 'Dindoli'].map(areaName => (
                <button
                  key={areaName}
                  type="button"
                  onClick={() => {
                    setSelectedLocality(`${areaName}, Surat`);
                    const areaSlug = areaName.toLowerCase().replace(/\s+/g, '-');
                    if (window.location.pathname !== `/areas/${areaSlug}`) {
                      window.history.pushState({}, '', `/areas/${areaSlug}`);
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-2 py-1 rounded-md bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-700 text-[11px] font-medium transition-colors cursor-pointer border border-gray-200/80"
                >
                  {areaName}
                </button>
              ))}
            </div>
          </div>

          {/* Col 4: Support & Policies */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 uppercase tracking-wider text-xs mb-2">
              कस्टमर सहायता व गारंटी
            </h4>
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200/80 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>क्वालिटी-चेक्ड पार्ट्स व सेवा</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                सभी रिपेयरिंग में ओरिजिनल/सर्टिफाइड ग्रेड पार्ट्स का इस्तेमाल होता है।
              </p>
              <div className="text-[11px] text-gray-600 space-y-1 pt-1 border-t border-gray-200">
                <p>ईमेल: <span className="font-mono text-gray-800">support@sastafone.in</span></p>
                <p>समय: सुबह 9:00 AM – 9:30 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar & Legal Links */}
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-gray-500 text-[11px]">
          <p>
            © {new Date().getFullYear()} Sastafone Surat (sastafone.in). सर्वाधिकार सुरक्षित।
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => setLegalModal('terms')}
              className="hover:text-red-600 transition-colors cursor-pointer"
            >
              Terms & Conditions
            </button>
            <button
              type="button"
              onClick={() => setLegalModal('privacy')}
              className="hover:text-red-600 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => handleNav('repair', '/warranty')}
              className="hover:text-red-600 transition-colors cursor-pointer"
            >
              Refund & Warranty Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
