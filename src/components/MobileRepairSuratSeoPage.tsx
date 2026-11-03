import React from 'react';
import { SeoHead } from './SeoHead';
import { Wrench, ShieldCheck, Clock, CheckCircle2, ArrowRight, MapPin } from 'lucide-react';

interface MobileRepairSuratSeoPageProps {
  onBookRepair: () => void;
  onNavigateHome: () => void;
}

export const MobileRepairSuratSeoPage: React.FC<MobileRepairSuratSeoPageProps> = ({
  onBookRepair,
  onNavigateHome
}) => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        'name': 'डोरस्टेप मोबाइल रिपेयरिंग सूरत (Doorstep Mobile Repair Surat)',
        'provider': {
          '@type': 'LocalBusiness',
          'name': 'Sastafone Surat',
          'telephone': '+919372802044',
          'url': 'https://sastafone.in'
        },
        'areaServed': 'Surat, Gujarat',
        'description': 'सूरत में घर बैठे मोबाइल रिपेयरिंग व पिकअप सेवा। स्क्रीन, बैटरी, कैमरा, चार्जिंग व मदरबोर्ड रिपेयर। ₹199 विज़िट टोकन फाइनल बिल में एडजस्टेड।'
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': 'सूरत में मोबाइल रिपेयरिंग का विज़िट चार्ज कितना है?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'सूरत में मात्र ₹199 विज़िट टोकन लगता है जो फाइनल रिपेयर बिल में पूरी तरह एडजस्ट हो जाता है।'
            }
          },
          {
            '@type': 'Question',
            'name': 'क्या रिपेयर के बाद वारंटी मिलती है?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'हाँ, ₹1000 या उससे अधिक के बिल पर रिपेयर किए गए पार्ट्स पर 6 महीने की वारंटी दी जाती है।'
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="bg-white min-h-screen py-8">
      <SeoHead
        title="सूरत में डोरस्टेप मोबाइल रिपेयरिंग – Sastafone Certified Technician Network"
        description="सूरत में घर बैठे मोबाइल रिपेयरिंग पिकअप व डिलीवरी। मात्र ₹199 विज़िट टोकन (फाइनल बिल में माइनस), 6 महीने वारंटी, ओरिजिनल पार्ट्स व पारदर्शी दरें।"
        canonicalPath="/mobile-repair-surat"
        jsonLd={jsonLd}
      />

      <div className="container mx-auto px-4 max-w-4xl">
        <header className="mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF2F2] border border-red-200 text-[#DC2626] text-xs font-bold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>सूरत एक्सक्लूसिव • 17+ प्रमुख क्षेत्र</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight mb-3">
            सूरत में डोरस्टेप मोबाइल रिपेयरिंग सेवा (Doorstep Mobile Repair in Surat)
          </h1>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Sastafone Certified Technician Network द्वारा सूरत के अडाजण, वेसु, पाल, वराछा, कतारगाम सहित सभी क्षेत्रों में सुरक्षित पिकअप, ऑन-साइट 11-पॉइंट QC व गुणवत्तापूर्ण रिपेयरिंग।
          </p>
        </header>

        {/* CTA Box */}
        <div className="mb-8 p-6 rounded-2xl bg-[#FEF2F2] border border-red-200 text-gray-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                घर बैठे फोन रिपेयर स्लॉट बुक करें
              </h2>
              <p className="text-xs text-gray-600">
                ₹199 विज़िट टोकन फाइनल बिल में एडजस्टेड (निरीक्षण बाद मना करने पर ₹99 रिफंड, ₹100 इंस्पेक्शन चार्ज)
              </p>
            </div>

            <button
              type="button"
              onClick={onBookRepair}
              className="px-6 py-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer tap-target shrink-0"
            >
              <Wrench className="w-4 h-4" />
              <span>रिपेयरिंग स्लॉट बुक करें</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Services Grid */}
        <section className="space-y-6 mb-10">
          <h2 className="text-xl font-bold text-gray-900">
            हम क्या-क्या रिपेयर करते हैं
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-gray-200 bg-white">
              <h3 className="font-bold text-sm text-gray-900 mb-1">डिस्प्ले व टच स्क्रीन रिप्लेसमेंट</h3>
              <p className="text-xs text-gray-600">टूटा कांच, काली स्क्रीन, लाइनिंग या टच न चलने की समस्या।</p>
            </div>
            <div className="p-4 rounded-xl border border-gray-200 bg-white">
              <h3 className="font-bold text-sm text-gray-900 mb-1">बैटरी बदलना व हीटिंग समाधान</h3>
              <p className="text-xs text-gray-600">बैटरी जल्दी खत्म होना, फूलना या चार्ज न होना।</p>
            </div>
            <div className="p-4 rounded-xl border border-gray-200 bg-white">
              <h3 className="font-bold text-sm text-gray-900 mb-1">माइक, स्पीकर व ऑडियो रिपेयर</h3>
              <p className="text-xs text-gray-600">कॉल में आवाज न जाना, लाउडस्पीकर की आवाज फटना या रिंगर बंद होना।</p>
            </div>
            <div className="p-4 rounded-xl border border-gray-200 bg-white">
              <h3 className="font-bold text-sm text-gray-900 mb-1">चार्जिंग पोर्ट व टाइप-सी सॉकेट</h3>
              <p className="text-xs text-gray-600">चार्जिंग केबल हिलना या चार्जिंग बंद होना।</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
