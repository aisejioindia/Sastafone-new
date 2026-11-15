import React from 'react';
import { useApp } from '../context/AppContext';
import { X, ShieldCheck, FileText, Cookie } from 'lucide-react';

export const LegalModals: React.FC = () => {
  const { legalModal, setLegalModal, language } = useApp();

  if (!legalModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-gray-200 flex flex-col max-h-[85vh]">
        {/* Header (Brand Red Light Theme) */}
        <div className="p-4 sm:p-5 bg-[#D5151B] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {legalModal === 'terms' && <FileText className="w-5 h-5" />}
            {legalModal === 'privacy' && <ShieldCheck className="w-5 h-5" />}
            {legalModal === 'cookies' && <Cookie className="w-5 h-5" />}

            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                {legalModal === 'terms' &&
                  (language === 'hi' ? 'नियम और शर्तें (Terms & Conditions)' : 'Terms & Conditions')}
                {legalModal === 'privacy' &&
                  (language === 'hi' ? 'गोपनीयता नीति (Privacy Policy)' : 'Privacy Policy')}
                {legalModal === 'cookies' &&
                  (language === 'hi' ? 'कुकीज़ नीति (Cookies Policy)' : 'Cookies Policy')}
              </h3>
              <p className="text-xs text-red-100">Sastafone Surat (sastafone.in)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLegalModal(null)}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-red-200 text-[#132032] flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#D5151B] shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-[#132032]">Sastafone Surat सेवा शर्तें</p>
              <p className="text-gray-600">
                Sastafone (sastafone.in) सूरत में डोरस्टेप मोबाइल रिपेयर पिकअप व डिलीवरी, पुराने फोन की खरीद और क्वालिटी-चेक्ड सेकंड-हैंड फोन सेवा प्रदान करता है।
              </p>
            </div>
          </div>

          {legalModal === 'terms' && (
            <div className="space-y-3">
              <h4 className="font-bold text-[#132032] text-sm">1. डोरस्टेप रिपेयर व ₹199 विज़िट टोकन</h4>
              <p>
                डोरस्टेप रिपेयर बुकिंग के लिए ₹199 विज़िट टोकन लिया जाता है। रिपेयर कराने पर यह ₹199 फाइनल बिल में एडजस्ट हो जाता है। यदि 11-पॉइंट QC और कोटेशन के बाद आप मना करते हैं तो ₹99 रिफंड मिलता है (₹100 रखा जाता है)।
              </p>
              <h4 className="font-bold text-[#132032] text-sm">2. 6 महीने वारंटी नियम</h4>
              <p>
                ₹1,000 या उससे अधिक के रिपेयर बिल पर बदले गए पार्ट्स पर 6 महीने की सीमित वारंटी मिलती है (फिजिकल टूट-फूट या पानी जाने पर वारंटी लागू नहीं होगी)।
              </p>
              <h4 className="font-bold text-[#132032] text-sm">3. क्षेत्राधिकार</h4>
              <p>सभी सेवाएं सूरत, गुजरात में उपलब्ध हैं।</p>
            </div>
          )}

          {legalModal === 'privacy' && (
            <div className="space-y-3">
              <h4 className="font-bold text-[#132032] text-sm">1. एकत्रित की जाने वाली जानकारी</h4>
              <p>
                पिकअप, रिपेयर शेड्यूलिंग और इनवॉइस के लिए आपका नाम, मोबाइल नंबर, सूरत का पता और डिवाइस की जानकारी सुरक्षित रूप से सहेजी जाती है।
              </p>
              <h4 className="font-bold text-[#132032] text-sm">2. डेटा सुरक्षा व उपयोग</h4>
              <p>
                आपका संपर्क विवरण केवल सेवा प्रदान करने और वारंटी वेरिफिकेशन के लिए उपयोग किया जाता है। पार्टनर्स को केवल जॉब ID दिखाई जाती है।
              </p>
            </div>
          )}

          {legalModal === 'cookies' && (
            <div className="space-y-3">
              <h4 className="font-bold text-[#132032] text-sm">कुकीज़ का उपयोग</h4>
              <p>
                Sastafone आपकी भाषा प्राथमिकता और चुने गए सूरत क्षेत्र को याद रखने के लिए आवश्यक ब्राउज़र स्टोरेज का उपयोग करता है।
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500">sastafone.in</span>
          <button
            type="button"
            onClick={() => setLegalModal(null)}
            className="px-4 py-2 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-xs transition-colors cursor-pointer"
          >
            {language === 'hi' ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
