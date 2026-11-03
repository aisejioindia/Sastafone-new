import React from 'react';
import { SeoHead } from './SeoHead';
import { Wrench, ShieldCheck, Clock, CheckCircle2, ArrowRight, MapPin, ChevronRight, PhoneCall } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../data/mockData';

interface SuratAreaPageProps {
  areaSlug: string;
  onBookInArea: (areaName: string) => void;
  onNavigateHome: () => void;
}

const SURAT_AREA_METADATA: Record<string, {
  name: string;
  hindiName: string;
  pincode: string;
  landmark: string;
  description: string;
}> = {
  'adajan': {
    name: 'Adajan',
    hindiName: 'अडाजण',
    pincode: '395009',
    landmark: 'आनंद महल रोड, प्राइम आर्केड व LP सवानी रोड',
    description: 'अडाजण व पाल क्षेत्र में Sastafone के सर्टिफाइड टेक्नीशियन द्वारा तेज डोरस्टेप पिकअप व ओरिजिनल क्वालिटी रिपेयरिंग सेवा।'
  },
  'vesu': {
    name: 'Vesu',
    hindiName: 'वेसु',
    pincode: '395007',
    landmark: 'VIP रोड, भगवान महावीर कॉलेज व रीगालिया कॉम्प्लेक्स',
    description: 'वेसु व यूनिवर्सिटी रोड पर प्रीमियम डोरस्टेप पिकअप, आईफोन व एंड्रॉयड स्क्रीन-बैटरी रिपेयरिंग 6 माह वारंटी के साथ।'
  },
  'pal': {
    name: 'Pal',
    hindiName: 'पाल',
    pincode: '395009',
    landmark: 'पाल आरटीओ, गौरव पथ व नक्षत्र नेबुला',
    description: 'पाल और अडाजण एक्सटेंशन में सुरक्षित पिकअप, ऑन-साइट 11-पॉइंट QC और पारदर्शी बिलिंग।'
  },
  'varachha': {
    name: 'Varachha',
    hindiName: 'वराछा',
    pincode: '395006',
    landmark: 'हीरा बाजार, मिनी बाजार व मानगढ़ चौक',
    description: 'वराछा और एके रोड पर सभी प्रमुख ब्रांड्स (Samsung, iPhone, Vivo, Oppo) के लिए तुरंत पिकअप व डिलीवरी।'
  },
  'katargam': {
    name: 'Katargam',
    hindiName: 'कतारगाम',
    pincode: '395004',
    landmark: 'कतारगाम दरवाजा, गजेरा सर्कल व ललिता चौकड़ी',
    description: 'कतारगाम क्षेत्र में अनुभवी मोबाइल टेक्नीशियन नेटवर्क द्वारा नो-फिक्स नो-फी पॉलिसी के तहत फोन रिपेयरिंग।'
  },
  'rander': {
    name: 'Rander',
    hindiName: 'रांदेर',
    pincode: '395005',
    landmark: 'रांदेर रोड, गोरदाद व जहांगीरपुरा जंक्शन',
    description: 'रांदेर में पुराना फोन बेचें या डोरस्टेप पिकअप पर मात्र ₹199 टोकन में फोन रिपेयर करवाएं।'
  },
  'piplod': {
    name: 'Piplod',
    hindiName: 'पिपलोद',
    pincode: '395007',
    landmark: 'राहुल राज मॉल, SVNIT व डुमस रोड',
    description: 'पिपलोद और डुमस रोड पर छात्रों व कामकाजी प्रोफेशनल्स के लिए सुविधाजनक टाइम स्लॉट में पिकअप सेवा।'
  },
  'citylight': {
    name: 'Citylight',
    hindiName: 'सिटीलाइट',
    pincode: '395007',
    landmark: 'सिटीलाइट रोड, अग्रसेन भवन व साइंस सेंटर',
    description: 'सिटीलाइट में पारदर्शी दरों पर डिस्प्ले व बैटरी रिपेयर, 100% डेटा प्राइवेसी के साथ।'
  },
  'ghod-dod-road': {
    name: 'Ghod Dod Road',
    hindiName: 'घोड़ दौड़ रोड',
    pincode: '395007',
    landmark: 'जानी फरसाण, काकड़िया कॉम्प्लेक्स व अठवा लाइन्स',
    description: 'घोड़ दौड़ रोड पर प्रमाणित पार्ट्स के साथ प्रीमियम फोन रिपेयर व बाय-बैक सर्विस।'
  },
  'althan': {
    name: 'Althan',
    hindiName: 'अलथान',
    pincode: '395017',
    landmark: 'अलथान नहर रोड, सोहम सर्कल व भीमराड',
    description: 'अलथान क्षेत्र में डोरस्टेप मोबाइल रिपेयरिंग पिकअप और पुराने फोन का ऑन-द-स्पॉट मूल्य।'
  }
};

export const SuratAreaPage: React.FC<SuratAreaPageProps> = ({
  areaSlug,
  onBookInArea,
  onNavigateHome
}) => {
  const normalizedSlug = areaSlug.toLowerCase().trim();
  const areaInfo = SURAT_AREA_METADATA[normalizedSlug] || {
    name: areaSlug.charAt(0).toUpperCase() + areaSlug.slice(1).replace(/-/g, ' '),
    hindiName: areaSlug.replace(/-/g, ' '),
    pincode: '395001',
    landmark: 'सूरत मुख्य बाजार व प्रमुख मार्ग',
    description: `सूरत के ${areaSlug} क्षेत्र में Sastafone Certified Technician Network द्वारा सुरक्षित फोन पिकअप व डिलीवरी सेवा।`
  };

  const pageTitle = `मोबाइल रिपेयरिंग सूरत ${areaInfo.hindiName} (${areaInfo.name}) – डोरस्टेप पिकअप व डिलीवरी | Sastafone`;
  const pageDescription = `सूरत के ${areaInfo.hindiName} (${areaInfo.name}) में घर बैठे फोन रिपेयर करवाएं। मात्र ₹199 विज़िट टोकन (फाइनल बिल में एडजस्टेड), 6 महीने वारंटी और प्रमाणित पार्ट्स।`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        '@id': `https://sastafone.in/areas/${normalizedSlug}#service`,
        'name': `Sastafone Mobile Repair - ${areaInfo.name}, Surat`,
        'description': pageDescription,
        'url': `https://sastafone.in/areas/${normalizedSlug}`,
        'telephone': '+919372802044',
        'priceRange': '₹199 - ₹12,000',
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': 'Surat',
          'addressRegion': 'Gujarat',
          'postalCode': areaInfo.pincode,
          'streetAddress': `${areaInfo.name}, Surat`,
          'addressCountry': 'IN'
        },
        'areaServed': `${areaInfo.name}, Surat`
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': `सूरत के ${areaInfo.hindiName} में फोन पिकअप का कितना समय लगता है?`,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': `Sastafone सर्टिफाइड टेक्नीशियन आपके द्वारा चुने गए 60 मिनट के स्लॉट में ${areaInfo.hindiName} में आपके पते पर पहुंच कर QC चेक करता है।`
            }
          },
          {
            '@type': 'Question',
            'name': `${areaInfo.hindiName} में रिपेयरिंग का विज़िट चार्ज कितना है?`,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': `विज़िट टोकन मात्र ₹199 है जो रिपेयर के फाइनल बिल में पूरी तरह एडजस्ट हो जाता है। यदि निरीक्षण बाद ग्राहक मना करता है तो ₹99 रिफंड कर दिया जाता है।`
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="bg-white min-h-screen py-8">
      <SeoHead
        title={pageTitle}
        description={pageDescription}
        canonicalPath={`/areas/${normalizedSlug}`}
        jsonLd={jsonLd}
      />

      <div className="container mx-auto px-4 max-w-4xl">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-500 mb-6">
          <button
            type="button"
            onClick={onNavigateHome}
            className="hover:text-red-600 transition-colors cursor-pointer"
          >
            होम
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>सूरत क्षेत्र</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-bold">{areaInfo.name} ({areaInfo.hindiName})</span>
        </nav>

        {/* Primary Page Header (Single H1) */}
        <header className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF2F2] border border-red-200 text-[#DC2626] text-xs font-bold mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span>सूरत पिनकोड {areaInfo.pincode} • {areaInfo.landmark}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight mb-3">
            सूरत {areaInfo.hindiName} ({areaInfo.name}) में डोरस्टेप मोबाइल रिपेयरिंग व पिकअप सेवा
          </h1>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            {areaInfo.description}
          </p>
        </header>

        {/* Area Booking Highlight Card */}
        <div className="mb-8 p-6 rounded-2xl bg-[#FEF2F2] border border-red-200 text-gray-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider">
                डोरस्टेप पिकअप स्लॉट
              </span>
              <h2 className="text-lg font-bold text-gray-900">
                {areaInfo.hindiName} में आज ही पिकअप स्लॉट बुक करें
              </h2>
              <p className="text-xs text-gray-600">
                मात्र ₹199 विज़िट टोकन (फाइनल बिल में माइनस, मना करने पर ₹99 रिफंड)
              </p>
            </div>

            <button
              type="button"
              onClick={() => onBookInArea(areaInfo.name)}
              className="px-6 py-3 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer tap-target shrink-0"
            >
              <Wrench className="w-4 h-4" />
              <span>{areaInfo.name} में रिपेयर बुक करें</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Section 2: Services in Area */}
        <section className="mb-10 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            Sastafone Certified Technician Network द्वारा {areaInfo.hindiName} में सेवाएं
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center gap-2 mb-2 font-bold text-gray-900 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>स्क्रीन व डिस्प्ले चेंज</span>
              </div>
              <p className="text-xs text-gray-600">
                ओरिजिनल व ओईएम ग्रेड डिस्प्ले, टच रिस्पॉन्स टेस्ट और ₹1000+ बिल पर 6 माह वारंटी।
              </p>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center gap-2 mb-2 font-bold text-gray-900 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>बैटरी रिप्लेसमेंट</span>
              </div>
              <p className="text-xs text-gray-600">
                100% फ्रेश बैटरी सेल्स, हीटिंग कंट्रोल और लंबे बैकअप की पूरी गारंटी।
              </p>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center gap-2 mb-2 font-bold text-gray-900 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>चार्जिंग जैक व माइक/स्पीकर</span>
              </div>
              <p className="text-xs text-gray-600">
                धीमी चार्जिंग, लूज पोर्ट या आवाज कटने की समस्या का मौके पर 11-पॉइंट निरीक्षण।
              </p>
            </div>

            <div className="p-4 rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center gap-2 mb-2 font-bold text-gray-900 text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>मदरबोर्ड व आईसी लेवल रिपेयर</span>
              </div>
              <p className="text-xs text-gray-600">
                डेड फोन, वाटर डैमेज व शार्टिंग के लिए सर्टिफाइड नेटवर्क द्वारा विशेषज्ञ समाधान।
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: FAQs */}
        <section className="mb-10 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            अक्सर पूछे जाने वाले सवाल (FAQs) – {areaInfo.hindiName}, सूरत
          </h2>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80">
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                प्र. {areaInfo.name} में फोन पिकअप की प्रक्रिया क्या है?
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                उ. आप ऑनलाइन अपना मॉडल व समस्या चुनकर पिकअप स्लॉट बुक करते हैं। हमारा सर्टिफाइड तकनीशियन आपके पते पर आकर फोन का 11-पॉइंट QC करता है और आपकी सहमति के बाद ही फोन पिकअप होता है।
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80">
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                प्र. क्या रिपेयरिंग के बाद वारंटी मिलती है?
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                उ. हाँ, ₹1000 या अधिक के कुल बिल पर बदले गए पार्ट पर 6 महीने की सीमित वारंटी मिलती है (फिजिकल व लिक्विड डैमेज शामिल नहीं है)।
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80">
              <h3 className="text-sm font-bold text-gray-900 mb-1">
                प्र. क्या मेरा डेटा सुरक्षित रहेगा?
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                उ. बिल्कुल! Sastafone आपके डेटा की पूर्ण गोपनीयता बनाए रखता है। हार्डवेयर रिपेयर के दौरान डेटा नहीं छेड़ा जाता।
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="p-6 rounded-2xl bg-gray-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white mb-1">
              {areaInfo.hindiName} में सहायता चाहिए?
            </h3>
            <p className="text-xs text-gray-300">
              सुबह 9:00 AM से रात 9:30 PM तक हमारी टीम उपलब्ध है।
            </p>
          </div>

          <div className="flex gap-2">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`नमस्ते Sastafone! मुझे सूरत ${areaInfo.name} में मोबाइल रिपेयरिंग करवानी है।`)}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              WhatsApp करें
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
