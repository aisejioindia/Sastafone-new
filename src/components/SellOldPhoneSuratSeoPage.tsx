import React from 'react';
import { SeoHead } from './SeoHead';
import { Smartphone, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface SellOldPhoneSuratSeoPageProps {
  onGoToSell: () => void;
  onNavigateHome: () => void;
}

export const SellOldPhoneSuratSeoPage: React.FC<SellOldPhoneSuratSeoPageProps> = ({
  onGoToSell,
  onNavigateHome
}) => {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'name': 'सूरत में पुराना फोन बेचें (Sell Old Phone Surat)',
    'provider': {
      '@type': 'LocalBusiness',
      'name': 'Sastafone Surat',
      'telephone': '+919372802044',
      'url': 'https://sastafone.in'
    },
    'areaServed': 'Surat, Gujarat',
    'description': 'सूरत में पुराना मोबाइल बेचें। तुरंत अनुमानित भाव, डोरस्टेप पिकअप और मौके पर तुरंत UPI/कैश भुगतान।'
  };

  return (
    <div className="bg-white min-h-screen py-8">
      <SeoHead
        title="सूरत में पुराना फोन बेचें – तुरंत नकद भुगतान व फ्री पिकअप | Sastafone"
        description="सूरत में पुराना मोबाइल सबसे अच्छे दाम में बेचें। Sastafone Certified Technician Network द्वारा फ्री डोरस्टेप पिकअप और मौके पर तुरंत भुगतान।"
        canonicalPath="/sell-old-phone-surat"
        jsonLd={jsonLd}
      />

      <div className="container mx-auto px-4 max-w-4xl">
        <header className="mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF2F2] border border-red-200 text-[#DC2626] text-xs font-bold mb-3">
            <Smartphone className="w-3.5 h-3.5" />
            <span>सूरत डोरस्टेप बाय-बैक</span>
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight mb-3">
            सूरत में पुराना मोबाइल फोन बेचें (Sell Used Phone in Surat)
          </h1>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            अपने पुराने फोन का मॉडल व स्थिति दर्ज करें, पारदर्शी अनुमानित भाव देखें और सूरत में अपने घर से फ्री पिकअप व ऑन-द-स्पॉट भुगतान प्राप्त करें।
          </p>
        </header>

        <div className="mb-8 p-6 rounded-2xl bg-[#FEF2F2] border border-red-200 text-gray-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                अपने फोन का अनुमानित भाव तुरंत देखें
              </h2>
              <p className="text-xs text-gray-600">
                100% डेटा वाइप गारंटी, कोई छुपा शुल्क नहीं
              </p>
            </div>

            <button
              type="button"
              onClick={onGoToSell}
              className="px-6 py-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer tap-target shrink-0"
            >
              <Smartphone className="w-4 h-4" />
              <span>पुराना फोन बेचें (Sell Now)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <section className="space-y-4 text-xs sm:text-sm text-gray-600 leading-relaxed">
          <h2 className="text-xl font-bold text-gray-900">
            Sastafone पर फोन बेचना क्यों आसान है?
          </h2>
          <p>
            • <strong>पारदर्शी मूल्यांकन:</strong> मॉडल, स्टोरेज और कंडीशन के आधार पर निष्पक्ष अनुमान।
          </p>
          <p>
            • <strong>डोरस्टेप इंस्पेक्शन:</strong> तकनीशियन आपके घर आकर फोन की स्थिति जांचेगा और अंतिम ऑफर देगा।
          </p>
          <p>
            • <strong>सुरक्षित भुगतान:</strong> आपकी सहमति के तुरंत बाद UPI या बैंक ट्रांसफर द्वारा मौके पर भुगतान।
          </p>
        </section>
      </div>
    </div>
  );
};
