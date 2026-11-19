import React from 'react';
import { ArrowLeft, FileText, Lock, RotateCcw, ShieldCheck } from 'lucide-react';
import { SeoHead } from './SeoHead';
import { useApp } from '../context/AppContext';

export type LegalPageType = 'terms' | 'privacy' | 'refund';

interface LegalPageProps {
  type: LegalPageType;
  onNavigateHome: () => void;
  onNavigateContact: () => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({
  type,
  onNavigateHome,
  onNavigateContact
}) => {
  const { siteSettings } = useApp();

  const metaConfig = {
    terms: {
      path: '/terms',
      title: 'Terms & Conditions | Sastafone Surat',
      description: 'Sastafone Surat डोरस्टेप मोबाइल रिपेयर, पुराना फोन बेचने और सर्टिफाइड फोन खरीदने के नियम एवं शर्तें।',
      heading: 'नियम एवं शर्तें (Terms & Conditions)',
      icon: FileText
    },
    privacy: {
      path: '/privacy',
      title: 'Privacy Policy | Sastafone Surat',
      description: 'Sastafone Surat ग्राहक डेटा सुरक्षा और प्राइवेसी नीति — फोन पते, फोटो और बुकिंग डेटा की सुरक्षा।',
      heading: 'गोपनीयता नीति (Privacy Policy)',
      icon: Lock
    },
    refund: {
      path: '/refund-policy',
      title: 'Refund & Warranty Policy | Sastafone Surat',
      description: 'Sastafone Surat ₹199 विज़िट टोकन एडजस्टमेंट, QC बाद ₹99 रिफंड नियम और ₹1000+ बिल पर 6 माह वारंटी शर्तें।',
      heading: 'रिफंड एवं वारंटी नीति (Refund & Warranty Policy)',
      icon: RotateCcw
    }
  }[type];

  const Icon = metaConfig.icon;

  return (
    <div className="min-h-screen bg-white pt-4 pb-24">
      <SeoHead
        title={metaConfig.title}
        description={metaConfig.description}
        canonicalPath={metaConfig.path}
      />

      <div className="container mx-auto px-4 max-w-3xl space-y-6">
        <button
          type="button"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#D5151B] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>होम पर लौटें</span>
        </button>

        <div className="p-6 sm:p-8 rounded-2xl bg-[#FEF2F2] border border-red-200 space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D5151B]">
            <Icon className="w-4 h-4" />
            <span>Sastafone Surat Legal & Policies</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#132032] tracking-tight">
            {metaConfig.heading}
          </h1>
          <p className="text-xs text-gray-600">
            प्रभावी तिथि: {new Date().getFullYear()} • सहायता ईमेल: {siteSettings.supportEmail}
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 space-y-6 text-sm text-gray-700 leading-relaxed">
          {type === 'terms' && (
            <>
              <section className="space-y-2">
                <h2 className="text-base font-bold text-[#132032]">1. सेवा का दायरा (Scope of Service)</h2>
                <p>
                  Sastafone Surat सूरत शहर में Sastafone Certified Technician Network के माध्यम से डोरस्टेप मोबाइल रिपेयर पिकअप व डिलीवरी, पुराने फोन की खरीद (Buyback), और क्वालिटी-चेक्ड सेकंड-हैंड फोन की बिक्री प्रदान करता है।
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[#132032]">2. ₹199 विज़िट टोकन एवं कोटेशन</h2>
                <p>
                  रिपेयर पिकअप स्लॉट कन्फर्म करने के लिए ₹199 विज़िट टोकन सीधे UPI ID (<strong className="font-mono">9372802044@idfcfirst</strong>) के माध्यम से लिया जाता है। यह ₹199 रिपेयर कराने पर फाइनल बिल में पूरी तरह एडजस्ट कर दिया जाता है।
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[#132032]">3. ग्राहक डेटा और स्वामित्व</h2>
                <p>
                  डिवाइस पिकअप से पहले कृपया अपने महत्वपूर्ण डेटा का बैकअप लें। पुराना फोन बेचते समय वैध पहचान पत्र व फोन के वैध स्वामित्व की पुष्टि अनिवार्य है। चोरी या लॉक्ड डिवाइस स्वीकार नहीं किए जाते हैं।
                </p>
              </section>
            </>
          )}

          {type === 'privacy' && (
            <>
              <section className="space-y-2">
                <h2 className="text-base font-bold text-[#132032]">1. हम कौन सा डेटा एकत्र करते हैं</h2>
                <p>
                  पिकअप, डिलीवरी और इनवॉइस के लिए आपका नाम, मोबाइल नंबर, सूरत का पता, डिवाइस मॉडल और निरीक्षण के दौरान लिए गए कंडीशन फ़ोटो सुरक्षित रूप से सहेजे जाते हैं।
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[#132032]">2. डेटा का उपयोग</h2>
                <p>
                  आपका मोबाइल नंबर और पता केवल डोरस्टेप पिकअप, रिपेयर अपडेट, वारंटी वेरिफिकेशन और बिलिंग के लिए उपयोग होता है। हम आपका डेटा किसी थर्ड-पार्टी मार्केटिंग एजेंसी को नहीं बेचते।
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[#132032]">3. पार्टनर प्राइवेसी और भुगतान</h2>
                <p>
                  रिपेयर पार्टनर को केवल जॉब ID व रिपेयर विवरण साझा किया जाता है। सभी ऑनलाइन टोकन भुगतान सीधे हमारे आधिकारिक UPI ID (<strong className="font-mono">9372802044@idfcfirst</strong>) पर स्वीकार किए जाते हैं और WhatsApp पर कन्फर्म होते हैं।
                </p>
              </section>
            </>
          )}

          {type === 'refund' && (
            <>
              <section className="space-y-2">
                <h2 className="text-base font-bold text-[#132032]">1. ₹199 विज़िट टोकन और ₹99 रिफंड नियम</h2>
                <p>
                  जब आप डोरस्टेप रिपेयर स्लॉट बुक करते हैं, तो ₹199 विज़िट टोकन लिया जाता है। रिपेयर स्वीकार करने पर यह राशि फाइनल बिल से घटा दी जाती है। यदि 11-पॉइंट QC निरीक्षण व फाइनल कोटेशन के बाद आप रिपेयर न कराने का निर्णय लेते हैं, तो ₹100 इंस्पेक्शन/पिकअप खर्च रखकर ₹99 आपके मूल भुगतान माध्यम में रिफंड कर दिए जाते हैं।
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[#132032]">2. 6 महीने की रिपेयर वारंटी</h2>
                <p>
                  ₹1,000 या उससे अधिक के रिपेयर बिल पर बदले गए पार्ट्स पर 6 महीने की वारंटी मिलती है (इनवॉइस तारीख से)। सर्टिफाइड सेकंड-हैंड फोन पर भी 6 महीने की वारंटी लागू होती है।
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[#132032]">3. वारंटी अपवाद</h2>
                <p>
                  फिजिकल टूट-फूट (स्क्रीन गिरना/क्रैक), पानी जाना, या किसी बाहरी दुकान से फोन खुलवाने पर वारंटी समाप्त मानी जाएगी।
                </p>
              </section>
            </>
          )}

          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <ShieldCheck className="w-4 h-4 text-[#D5151B]" />
              <span>कोई प्रश्न है? हमारी सूरत सपोर्ट टीम से संपर्क करें।</span>
            </div>
            <button
              type="button"
              onClick={onNavigateContact}
              className="px-4 py-2 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              संपर्क पेज पर जाएं
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
