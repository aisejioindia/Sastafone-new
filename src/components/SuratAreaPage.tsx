import React from 'react';
import { SeoHead } from './SeoHead';
import { GoogleMapEmbed } from './GoogleMapEmbed';
import { Wrench, CheckCircle2, ArrowRight, MapPin, ChevronRight, Phone, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  buildWhatsappHref,
  normalizeTelHref,
  INSTAGRAM_URL,
  GOOGLE_MAPS_URL
} from '../services/siteSettingsService';
import { trackEvent } from '../utils/analytics';

interface SuratAreaPageProps {
  areaSlug: string;
  onBookInArea: (areaName: string) => void;
  onNavigateHome: () => void;
}

const SURAT_AREA_METADATA: Record<
  string,
  {
    name: string;
    hindiName: string;
    pincode: string;
    landmark: string;
    description: string;
  }
> = {
  adajan: {
    name: 'Adajan',
    hindiName: 'अडाजण',
    pincode: '395009',
    landmark: 'आनंद महल रोड, प्राइम आर्केड व LP सवानी रोड',
    description:
      'अडाजण व पाल क्षेत्र में Sastafone Certified Technician Network द्वारा सुरक्षित डोरस्टेप पिकअप व क्वालिटी-चेक्ड पार्ट्स के साथ मोबाइल रिपेयरिंग सेवा।'
  },
  vesu: {
    name: 'Vesu',
    hindiName: 'वेसु',
    pincode: '395007',
    landmark: 'VIP रोड, भगवान महावीर कॉलेज व रीगालिया कॉम्प्लेक्स',
    description:
      'वेसु व यूनिवर्सिटी रोड पर डोरस्टेप पिकअप, आईफोन व एंड्रॉयड स्क्रीन-बैटरी रिपेयरिंग ₹1000+ बिल पर 6 माह वारंटी के साथ।'
  },
  pal: {
    name: 'Pal',
    hindiName: 'पाल',
    pincode: '395009',
    landmark: 'पाल आरटीओ, गौरव पथ व नक्षत्र नेबुला',
    description:
      'पाल और अडाजण एक्सटेंशन में सुरक्षित पिकअप, ऑन-साइट 11-पॉइंट QC और पारदर्शी बिलिंग।'
  },
  varachha: {
    name: 'Varachha',
    hindiName: 'वराछा',
    pincode: '395006',
    landmark: 'हीरा बाजार, मिनी बाजार व मानगढ़ चौक',
    description:
      'वराछा और एके रोड पर सभी प्रमुख ब्रांड्स (Samsung, Apple, Vivo, Oppo) के लिए डोरस्टेप पिकअप व डिलीवरी।'
  },
  katargam: {
    name: 'Katargam',
    hindiName: 'कतारगाम',
    pincode: '395004',
    landmark: 'कतारगाम दरवाजा, गजेरा सर्कल व ललिता चौकड़ी',
    description:
      'कतारगाम क्षेत्र में Sastafone Certified Technician Network द्वारा पारदर्शी कोट व 11-पॉइंट QC रिपेयरिंग।'
  },
  rander: {
    name: 'Rander',
    hindiName: 'रांदेर',
    pincode: '395005',
    landmark: 'रांदेर रोड व जहांगीरपुरा जंक्शन',
    description:
      'रांदेर में पुराना फोन बेचें या डोरस्टेप पिकअप पर मात्र ₹199 विज़िट टोकन में फोन रिपेयर करवाएं।'
  },
  piplod: {
    name: 'Piplod',
    hindiName: 'पिपलोद',
    pincode: '395007',
    landmark: 'राहुल राज मॉल, SVNIT व डुमस रोड',
    description:
      'पिपलोद और डुमस रोड पर सुविधाजनक टाइम स्लॉट में डोरस्टेप पिकअप और 2-घंटे डिलीवरी लक्ष्य।'
  },
  citylight: {
    name: 'Citylight',
    hindiName: 'सिटीलाइट',
    pincode: '395007',
    landmark: 'सिटीलाइट रोड, अग्रसेन भवन व साइंस सेंटर',
    description: 'सिटीलाइट में पारदर्शी दरों पर डिस्प्ले व बैटरी रिपेयर, सुरक्षित पिकअप व डिलीवरी।'
  },
  'ghod-dod-road': {
    name: 'Ghod Dod Road',
    hindiName: 'घोड़ दौड़ रोड',
    pincode: '395007',
    landmark: 'जानी फरसाण, काकड़िया कॉम्प्लेक्स व अठवा लाइन्स',
    description: 'घोड़ दौड़ रोड पर क्वालिटी-चेक्ड पार्ट्स के साथ फोन रिपेयर व बाय-बैक सर्विस।'
  },
  althan: {
    name: 'Althan',
    hindiName: 'अलथान',
    pincode: '395017',
    landmark: 'अलथान नहर रोड, सोहम सर्कल व भीमराड',
    description: 'अलथान क्षेत्र में डोरस्टेप मोबाइल रिपेयरिंग पिकअप और पुराने फोन का ऑन-साइट मूल्य।'
  }
};

export const SuratAreaPage: React.FC<SuratAreaPageProps> = ({
  areaSlug,
  onBookInArea,
  onNavigateHome
}) => {
  const { siteSettings } = useApp();
  const normalizedSlug = areaSlug.toLowerCase().trim();
  const areaInfo = SURAT_AREA_METADATA[normalizedSlug] || {
    name: areaSlug.charAt(0).toUpperCase() + areaSlug.slice(1).replace(/-/g, ' '),
    hindiName: areaSlug.replace(/-/g, ' '),
    pincode: '395001',
    landmark: 'सूरत मुख्य बाजार व प्रमुख मार्ग',
    description: `सूरत के ${areaSlug} क्षेत्र में Sastafone Certified Technician Network द्वारा सुरक्षित फोन पिकअप व डिलीवरी सेवा।`
  };

  const pageTitle = `मोबाइल रिपेयरिंग सूरत ${areaInfo.hindiName} (${areaInfo.name}) – डोरस्टेप पिकअप | Sastafone`;
  const pageDescription = `सूरत के ${areaInfo.hindiName} (${areaInfo.name}) में घर बैठे फोन रिपेयर करवाएं। ₹199 विज़िट टोकन (बिल में एडजस्ट), ₹1000+ पर 6 माह वारंटी और क्वालिटी-चेक्ड पार्ट्स।`;

  const instagramHref = siteSettings.instagramUrl || INSTAGRAM_URL;
  const mapsHref = siteSettings.googleMapsUrl || GOOGLE_MAPS_URL;
  const whatsappHref = buildWhatsappHref(
    siteSettings.whatsappNumber,
    `नमस्ते Sastafone! मुझे सूरत ${areaInfo.name} में मोबाइल रिपेयरिंग करवानी है।`
  );
  const telHref = normalizeTelHref(siteSettings.supportPhone);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        '@id': `https://sastafone.in/areas/${normalizedSlug}#service`,
        name: `Sastafone - ${areaInfo.name}, Surat`,
        description: pageDescription,
        url: `https://sastafone.in/areas/${normalizedSlug}`,
        image: 'https://sastafone.in/og-image.png',
        telephone: siteSettings.supportPhone,
        priceRange: '₹149 - ₹12,000',
        hasMap: mapsHref,
        sameAs: [instagramHref, mapsHref],
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Surat',
          addressRegion: 'Gujarat',
          postalCode: areaInfo.pincode,
          streetAddress: `${areaInfo.name}, Surat`,
          addressCountry: 'IN'
        },
        areaServed: `${areaInfo.name}, Surat`
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `सूरत के ${areaInfo.hindiName} में फोन पिकअप की प्रक्रिया क्या है?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Sastafone सर्टिफाइड टेक्नीशियन आपके द्वारा चुने गए स्लॉट में ${areaInfo.hindiName} में आपके पते पर पहुंच कर 11-पॉइंट QC चेक करता है और सहमति के बाद रिपेयर पूरा कर डिलीवर करता है।`
            }
          },
          {
            '@type': 'Question',
            name: `${areaInfo.hindiName} में रिपेयरिंग का विज़िट चार्ज कितना है?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `विज़िट टोकन ₹199 है जो फाइनल बिल में पूरी तरह एडजस्ट हो जाता है। यदि निरीक्षण के बाद आप मना करते हैं तो ₹99 रिफंड मिलता है (₹100 रखा जाता है)।`
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="bg-white min-h-screen py-8 pb-24">
      <SeoHead
        title={pageTitle}
        description={pageDescription}
        canonicalPath={`/areas/${normalizedSlug}`}
        jsonLd={jsonLd}
      />

      <div className="container mx-auto px-4 max-w-4xl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-500 mb-6">
          <button
            type="button"
            onClick={onNavigateHome}
            className="hover:text-[#D5151B] transition-colors cursor-pointer"
          >
            होम
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>सूरत क्षेत्र</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#132032] font-bold">
            {areaInfo.name} ({areaInfo.hindiName})
          </span>
        </nav>

        {/* Primary Page Header */}
        <header className="mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D5151B] mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>
              सूरत पिनकोड {areaInfo.pincode} • {areaInfo.landmark}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#132032] tracking-tight leading-tight mb-3">
            सूरत {areaInfo.hindiName} ({areaInfo.name}) में डोरस्टेप मोबाइल रिपेयरिंग व पिकअप सेवा
          </h1>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{areaInfo.description}</p>
        </header>

        {/* Area Booking Highlight Card */}
        <div className="mb-8 p-6 rounded-2xl bg-[#FEF2F2] border border-red-200 text-[#132032]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#D5151B] uppercase tracking-wider">
                डोरस्टेप पिकअप स्लॉट
              </span>
              <h2 className="text-lg font-bold text-[#132032]">
                {areaInfo.hindiName} में आज ही पिकअप स्लॉट बुक करें
              </h2>
              <p className="text-xs text-gray-600">
                ₹199 विज़िट टोकन फाइनल बिल में एडजस्टेड (QC बाद मना करने पर ₹99 रिफंड, ₹100 रखा जाता है)
              </p>
            </div>

            <button
              type="button"
              onClick={() => onBookInArea(areaInfo.name)}
              className="px-6 py-3 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer tap-target shrink-0"
            >
              <Wrench className="w-4 h-4" />
              <span>{areaInfo.name} में रिपेयर बुक करें</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Services in Area */}
        <section className="mb-10 space-y-4">
          <h2 className="text-xl font-bold text-[#132032]">
            Sastafone Certified Technician Network द्वारा {areaInfo.hindiName} में सेवाएं
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-gray-200 bg-white">
              <div className="flex items-center gap-2 mb-2 font-bold text-[#132032] text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>स्क्रीन व डिस्प्ले रिपेयर</span>
              </div>
              <p className="text-xs text-gray-600">
                क्वालिटी-चेक्ड डिस्प्ले, टच रिस्पॉन्स टेस्ट और ₹1000+ बिल पर 6 माह वारंटी।
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200 bg-white">
              <div className="flex items-center gap-2 mb-2 font-bold text-[#132032] text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>बैटरी रिप्लेसमेंट</span>
              </div>
              <p className="text-xs text-gray-600">
                हेल्थ-टेस्टेड बैटरी, थर्मल चेक और पारदर्शी बिलिंग।
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200 bg-white">
              <div className="flex items-center gap-2 mb-2 font-bold text-[#132032] text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>चार्जिंग जैक व माइक/स्पीकर</span>
              </div>
              <p className="text-xs text-gray-600">
                धीमी चार्जिंग, लूज पोर्ट या आवाज की समस्या का मौके पर 11-पॉइंट QC निरीक्षण।
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-gray-200 bg-white">
              <div className="flex items-center gap-2 mb-2 font-bold text-[#132032] text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>मदरबोर्ड व आईसी लेवल रिपेयर</span>
              </div>
              <p className="text-xs text-gray-600">
                डेड फोन, वाटर डैमेज व शॉर्टिंग के लिए सर्टिफाइड नेटवर्क द्वारा समाधान।
              </p>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-10 space-y-4">
          <h2 className="text-xl font-bold text-[#132032]">
            अक्सर पूछे जाने वाले सवाल (FAQs) – {areaInfo.hindiName}, सूरत
          </h2>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80">
              <h3 className="text-sm font-bold text-[#132032] mb-1">
                प्र. {areaInfo.name} में फोन पिकअप की प्रक्रिया क्या है?
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                उ. आप ऑनलाइन अपना मॉडल व समस्या चुनकर पिकअप स्लॉट बुक करते हैं। सर्टिफाइड तकनीशियन आपके पते पर आकर फोन का 11-पॉइंट QC करता है और आपकी सहमति के बाद ही रिपेयर प्रक्रिया शुरू होती है।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80">
              <h3 className="text-sm font-bold text-[#132032] mb-1">
                प्र. क्या रिपेयरिंग के बाद वारंटी मिलती है?
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                उ. हाँ, ₹1000 या अधिक के कुल बिल पर बदले गए पार्ट पर 6 महीने की सीमित वारंटी मिलती है।
              </p>
            </div>
          </div>
        </section>

        {/* Google Map Embed */}
        <section className="mb-8">
          <GoogleMapEmbed
            title={`Sastafone ${areaInfo.name} Surat Map`}
            areaLabel={`${areaInfo.name}, Surat`}
            compact
          />
        </section>

        {/* Light Theme Bottom CTA */}
        <div className="p-6 rounded-2xl bg-[#FEF2F2] border border-red-200 text-[#132032] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[#132032] mb-1">
              {areaInfo.hindiName} में सहायता चाहिए?
            </h3>
            <p className="text-xs text-gray-600">
              सुबह 9:00 AM से रात 9:30 PM तक हमारी सूरत टीम उपलब्ध है।
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('whatsapp_click', { source: `area_${areaInfo.name}` })}
              className="px-4 py-2.5 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp करें</span>
            </a>

            <a
              href={telHref}
              onClick={() => trackEvent('call_click', { source: `area_${areaInfo.name}` })}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-[#132032] text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4 text-[#D5151B]" />
              <span>कॉल करें</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
