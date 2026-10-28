import React from 'react';
import { useApp } from '../context/AppContext';
import { X, ShieldCheck, FileText, Cookie, ExternalLink, ArrowRight } from 'lucide-react';

export const LegalModals: React.FC = () => {
  const { legalModal, setLegalModal, language } = useApp();

  if (!legalModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {legalModal === 'terms' && <FileText className="w-5 h-5 text-blue-400" />}
            {legalModal === 'privacy' && <ShieldCheck className="w-5 h-5 text-emerald-400" />}
            {legalModal === 'cookies' && <Cookie className="w-5 h-5 text-amber-400" />}

            <div>
              <h3 className="font-bold text-base sm:text-lg">
                {legalModal === 'terms' && (language === 'hi' ? 'नियम और शर्तें (Terms & Conditions)' : 'Terms & Conditions')}
                {legalModal === 'privacy' && (language === 'hi' ? 'गोपनीयता नीति (Privacy Policy)' : 'Privacy Policy')}
                {legalModal === 'cookies' && (language === 'hi' ? 'कुकीज़ नीति (Cookies Policy)' : 'Cookies Policy')}
              </h3>
              <p className="text-xs text-slate-400">Sastaphone Surat • Official Certified Portal (sastaphone.in)</p>
            </div>
          </div>
          <button
            onClick={() => setLegalModal(null)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {/* Sastaphone Surat Official Operations Notice */}
          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-blue-950">
                सस्ताफोन सूरत अधिकृत वैधानिक व सेवा सूचना (Official Operating Terms):
              </p>
              <p>
                Sastaphone (सस्ताफोन) एवं <strong>sastaphone.in</strong> डोमेन अधिकृत रूप से सूरत में सेकंड हैंड मोबाइल खरीद-बिक्री, 30-मिनट होम रिपेयर सेवा एवं P2P सस्ता बाज़ार हेतु पंजीकृत है। सूरत के सभी ऑर्डर्स और पेमेंट्स इसी प्रमाणित फ्रेमवर्क द्वारा सुरक्षित रूप से प्रोसेस होते हैं।
              </p>
            </div>
          </div>

          {legalModal === 'terms' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">1. डोरस्टेप पिकअप व सेल एग्रीमेंट (Sell Policy)</h4>
              <p>
                ग्राहक यह प्रमाणित करता है कि बेचा जा रहा फोन उसका अपना वैध स्वामित्व है और किसी भी चोरी, अवैध या विवादित गतिविधि से संबंधित नहीं है। फोन हैंडओवर के समय वैध आईडी प्रूफ और बिल (यदि उपलब्ध हो) देना अनिवार्य है।
              </p>

              <h4 className="font-bold text-slate-900 text-sm">2. AI लाइव वैल्यूएशन व प्राइस लॉकिंग</h4>
              <p>
                AI एस्टीमेट फोन की इनपुट कंडीशन के आधार पर जनरेट होता है। वास्तविक होम विजिट पर यदि स्क्रीन, कैमरा, या इंटरनल मदरबोर्ड में छिपी खराबी पाई जाती है, तो संशोधित कीमत ग्राहक की सहमति से फाइनल होगी।
              </p>

              <h4 className="font-bold text-slate-900 text-sm">3. डेटा सुरक्षा व वाइप (Data Wipe)</h4>
              <p>
                पिकअप के समय टेक्नीशियन के सामने डिवाइस का फैक्ट्री रिसेट (Factory Reset) किया जाएगा। बाद में किसी भी पर्सनल डेटा रिकवरी के लिए Sastaphone उत्तरदायी नहीं होगा।
              </p>

              <h4 className="font-bold text-slate-900 text-sm">4. डोरस्टेप रिपेयर विज़िट चार्ज (₹199) एवं रिफंड नीति</h4>
              <p>
                डोरस्टेप रिपेयर अपॉइंटमेंट बुक करते समय ₹199 का विज़िट व डायग्नोस्टिक टोकन चार्ज लिया जाता है। पार्ट्स व वास्तविक रिपेयरिंग चार्ज फोन की जांच के बाद अलग से तय होता है। जब फोन सफलतापूर्वक रिपेयर हो जाता है, तो यह ₹199 ग्राहक के फाइनल बिल में से पूर्णतः एडजस्ट (माइनस) कर दिया जाता है। यदि स्पेयर पार्ट्स अनुपलब्ध होने या गंभीर मदरबोर्ड खराबी के कारण फोन रिपेयर नहीं हो पाता, तो ग्राहक को <strong>₹99 तुरंत रिफंड</strong> कर दिया जाता है।
              </p>

              <h4 className="font-bold text-slate-900 text-sm">5. ब्रांड ट्रेडमार्क, कॉपीराइट व फेयर यूज़ डिस्क्लेमर (Trademark Fair Use Policy)</h4>
              <p>
                Sastaphone प्लेटफॉर्म पर प्रदर्शित सभी मोबाइल ब्रांड नाम, ट्रेडमार्क, लोगो और मॉडल नाम (उदा. Apple, iPhone, Samsung, Xiaomi, Redmi, OnePlus, Vivo, Oppo, Realme, Motorola, Google, Nothing इत्यादि) उनके संबंधित मूल स्वामियों (OEMs) की बौद्धिक संपदा (Intellectual Property) हैं।
              </p>
              <p>
                Sastaphone सूरत एक स्वतंत्र तृतीय-पक्ष (Independent Third-Party) डोरस्टेप रिपेयर व री-कॉमर्स प्लेटफॉर्म है। हम किसी भी ट्रेडमार्क या कॉपीराइट का उल्लंघन नहीं करते हैं। इन सभी ब्रांड नामों व लोगो का उपयोग केवल उपभोक्ता को उनके डिवाइस मॉडल की पहचान व स्पेयर पार्ट्स कम्पैटिबिलिटी (Compatibility) समझाने हेतु <strong>Fair Use (उचित उपयोग)</strong> सिद्धांत के अंतर्गत किया गया है।
              </p>

              <h4 className="font-bold text-slate-900 text-sm">6. क्षेत्राधिकार (Surat Jurisdiction)</h4>
              <p>
                सभी सेवाएं विशेष रूप से सूरत, गुजरात क्षेत्र में दी जाती हैं। कोई भी विधिक विवाद केवल सूरत न्यायालय के अधिकार क्षेत्र में आएगा।
              </p>
            </div>
          )}

          {legalModal === 'trademark' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">कॉपीराइट व ट्रेडमार्क विधिक घोषणा (Brand IP Notice)</h4>
              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-800 space-y-2">
                <p>
                  <strong>1. स्वामियों के अधिकार:</strong> Apple Inc., Samsung Electronics, Xiaomi Inc., OnePlus Technology, Vivo Mobile, Oppo, Realme, Google LLC, Nothing Technology आदि सभी पंजीकृत ट्रेडमार्क हैं। Sastaphone इनके साथ प्रत्यक्ष साझेदारी का दावा नहीं करता है।
                </p>
                <p>
                  <strong>2. उद्देश्य:</strong> मॉडल और ब्रांड का उल्लेख केवल ग्राहक को यह बताने के लिए है कि किस डिवाइस के लिए डोरस्टेप रिपेयर अथवा सेकंड-हैंड ट्रेड की सेवा उपलब्ध है।
                </p>
                <p>
                  <strong>3. ओरिजिनल सर्विस सेंटर डायरेक्टरी:</strong> ग्राहक चाहें तो सूरत में मौजूद ब्रांड के आधिकारिक अधिकृत सर्विस सेंटर (Authorized Service Centers) पर भी जा सकते हैं, जिसकी पूरी सूची हमने ऐप में पारदर्शिता हेतु उपलब्ध कराई है।
                </p>
              </div>
            </div>
          )}

          {legalModal === 'privacy' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">1. एकत्रित की जाने वाली जानकारी</h4>
              <p>
                हम केवल डोरस्टेप पिकअप, रिपेयर शेड्यूलिंग और ऑर्डर डिलीवरी के लिए आवश्यक संपर्क विवरण (नाम, फोन नंबर, सूरत पता, और 10-सेकंड डिवाइस वीडियो) एकत्र करते हैं।
              </p>

              <h4 className="font-bold text-slate-900 text-sm">2. वीडियो वेरिफिकेशन डेटा सुरक्षा</h4>
              <p>
                अपलोड किया गया 10-सेकंड इंस्पेक्शन वीडियो केवल डिवाइस की बाहरी स्थिति के प्रमाणीकरण के लिए उपयोग किया जाता है। इसे किसी तीसरे पक्ष को बेचा या प्रचार के लिए उपयोग नहीं किया जाता।
              </p>

              <h4 className="font-bold text-slate-900 text-sm">3. Firebase एवं सुरक्षित एन्क्रिप्शन</h4>
              <p>
                आपका डेटा आधुनिक क्लाउड एन्क्रिप्शन प्रोटोकॉल द्वारा सुरक्षित रहता है और केवल हमारे ऑथराइज्ड सूरत टेक्नीशियन हब द्वारा ही एक्सेस किया जा सकता है।
              </p>
            </div>
          )}

          {legalModal === 'cookies' && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">कुकीज़ का उपयोग</h4>
              <p>
                Sastaphone वेब ऐप आपकी भाषा प्राथमिकता (हिंदी/अंग्रेजी), चुनी हुई सूरत लोकैलिटी (जैसे Adajan/Vesu), और आपके सक्रिय ऑर्डर्स को सुरक्षित रखने के लिए लोकल ब्राउज़र स्टोरेज एवं आवश्यक कुकीज़ का उपयोग करता है।
              </p>
              <p>
                ये कुकीज़ बिना बार-बार टाइप किए 100% क्लिकेबल अनुभव प्रदान करने में सहायक हैं।
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>sastaphone.in सूरत अधिकृत</span>
          </span>
          <button
            onClick={() => setLegalModal(null)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all"
          >
            {language === 'hi' ? 'समझ गए / बंद करें' : 'Understood & Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
