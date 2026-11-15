import React from 'react';
import {
  Phone,
  MessageCircle,
  Mail,
  Clock,
  MapPin,
  Instagram,
  Star,
  ArrowLeft,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SeoHead } from './SeoHead';
import { GoogleMapEmbed } from './GoogleMapEmbed';
import {
  buildWhatsappHref,
  normalizeTelHref,
  INSTAGRAM_URL,
  GOOGLE_MAPS_URL
} from '../services/siteSettingsService';
import { trackEvent } from '../utils/analytics';

interface ContactPageProps {
  onNavigateHome: () => void;
  onBookRepair: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  onNavigateHome,
  onBookRepair
}) => {
  const { siteSettings, language } = useApp();

  const whatsappHref = buildWhatsappHref(
    siteSettings.whatsappNumber,
    'नमस्ते Sastafone Surat टीम! मुझे डोरस्टेप मोबाइल रिपेयर / सेवा के बारे में बात करनी है।'
  );
  const telHref = normalizeTelHref(siteSettings.supportPhone);
  const instagramHref = siteSettings.instagramUrl || INSTAGRAM_URL;
  const mapsHref = siteSettings.googleMapsUrl || GOOGLE_MAPS_URL;
  const googleReviewUrl = siteSettings.googleReviewUrl;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Sastafone',
    url: 'https://sastafone.in/contact',
    logo: 'https://sastafone.in/assets/logo-wordmark.png',
    image: 'https://sastafone.in/og-image.png',
    telephone: siteSettings.supportPhone,
    email: siteSettings.supportEmail,
    hasMap: mapsHref,
    sameAs: [instagramHref, mapsHref],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Surat',
      addressRegion: 'Gujarat',
      postalCode: '395001',
      addressCountry: 'IN'
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '09:00',
        closes: '21:30'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white pt-4 pb-24">
      <SeoHead
        title="Contact Sastafone Surat – Doorstep Mobile Repair & Support"
        description="सूरत में Sastafone डोरस्टेप मोबाइल रिपेयर से संपर्क करें। कॉल, WhatsApp, सपोर्ट ईमेल support@sastafone.in, Instagram और Google Maps लोकेशन।"
        canonicalPath="/contact"
        jsonLd={jsonLd}
      />

      <div className="container mx-auto px-4 max-w-4xl space-y-6">
        <button
          type="button"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#D5151B] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>होम पर लौटें</span>
        </button>

        {/* Contact Header Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#FEF2F2] border border-red-200 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D5151B]">
            <ShieldCheck className="w-4 h-4" />
            <span>Sastafone Certified Technician Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#132032] tracking-tight">
            {language === 'hi'
              ? 'संपर्क करें – Sastafone Surat'
              : 'Contact Sastafone Surat'}
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
            सूरत में डोरस्टेप पिकअप, रिपेयरिंग स्टेटस, वारंटी सहायता या पुराना फोन बेचने के लिए सीधे कॉल या WhatsApp करें।
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('whatsapp_click', { source: 'contact_page' })}
              className="px-5 py-3 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white text-sm font-bold inline-flex items-center gap-2 transition-colors duration-150 shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp पर चैट करें</span>
            </a>

            <a
              href={telHref}
              onClick={() => trackEvent('call_click', { source: 'contact_page' })}
              className="px-5 py-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-[#132032] text-sm font-bold inline-flex items-center gap-2 transition-colors duration-150"
            >
              <Phone className="w-4 h-4 text-[#D5151B]" />
              <span>कॉल करें ({siteSettings.supportPhone})</span>
            </a>
          </div>
        </div>

        {/* Contact Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-3">
            <h2 className="text-base font-bold text-[#132032]">संपर्क विवरण</h2>
            <div className="space-y-3 text-xs sm:text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#D5151B] mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-[#132032]">सपोर्ट फोन</p>
                  <a
                    href={telHref}
                    onClick={() => trackEvent('call_click', { source: 'contact_card' })}
                    className="text-[#D5151B] hover:underline tabular-nums"
                  >
                    {siteSettings.supportPhone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#D5151B] mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-[#132032]">ईमेल सहायता</p>
                  <a href={`mailto:${siteSettings.supportEmail}`} className="text-[#D5151B] hover:underline">
                    {siteSettings.supportEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#D5151B] mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-[#132032]">कार्य समय (Working Hours)</p>
                  <p className="text-gray-600">{siteSettings.businessHours}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#D5151B] mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-[#132032]">सेवा क्षेत्र</p>
                  <p className="text-gray-600">
                    अडाजण, वेसु, पाल, वराछा, कतारगाम, पिपलोद, सिटीलाइट, घोड दोड रोड व पूरा सूरत शहर।
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-4">
            <h2 className="text-base font-bold text-[#132032]">सोशल व लोकेशन लिंक</h2>
            <div className="space-y-2.5">
              <a
                href={instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 hover:bg-[#FEF2F2] border border-gray-200 text-sm font-bold text-[#132032] flex items-center justify-between transition-colors duration-150"
              >
                <span className="flex items-center gap-2.5">
                  <Instagram className="w-4 h-4 text-[#D5151B]" />
                  <span>Instagram (@sastafone.in)</span>
                </span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>

              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('google_maps_click', { source: 'contact_page' })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 hover:bg-[#FEF2F2] border border-gray-200 text-sm font-bold text-[#132032] flex items-center justify-between transition-colors duration-150"
              >
                <span className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#D5151B]" />
                  <span>Google Maps लोकेशन देखें</span>
                </span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>

              {googleReviewUrl && (
                <a
                  href={googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('google_review_click', { source: 'contact_page' })}
                  className="w-full px-4 py-3 rounded-xl bg-[#FEF2F2] hover:bg-red-100/70 border border-red-200 text-sm font-bold text-[#D5151B] flex items-center justify-between transition-colors duration-150"
                >
                  <span className="flex items-center gap-2.5">
                    <Star className="w-4 h-4 text-[#D5151B]" />
                    <span>Google पर समीक्षा दें (Review us on Google)</span>
                  </span>
                  <ExternalLink className="w-4 h-4 text-[#D5151B]" />
                </a>
              )}

              <button
                type="button"
                onClick={onBookRepair}
                className="w-full py-3 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white text-sm font-bold transition-colors duration-150 cursor-pointer"
              >
                डोरस्टेप रिपेयर बुक करें (₹199)
              </button>
            </div>
          </div>
        </div>

        {/* Embedded Google Map */}
        <GoogleMapEmbed areaLabel="Surat, Gujarat" />
      </div>
    </div>
  );
};
