import React from 'react';
import { useApp } from '../context/AppContext';
import { SastafoneLogo } from './SastafoneLogo';
import {
  ShieldCheck,
  MapPin,
  MessageCircle,
  Clock,
  Mail,
  Phone,
  Instagram,
  ExternalLink
} from 'lucide-react';
import {
  buildWhatsappHref,
  normalizeTelHref,
  INSTAGRAM_URL,
  GOOGLE_MAPS_URL
} from '../services/siteSettingsService';
import { DIRECT_UPI_ID } from '../services/paymentService';
import { trackEvent } from '../utils/analytics';

export const Footer: React.FC = () => {
  const { setSelectedLocality, siteSettings } = useApp();

  const handleNav = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappHref = buildWhatsappHref(
    siteSettings.whatsappNumber,
    'नमस्ते Sastafone Surat! मुझे मोबाइल सेवा के बारे में जानकारी चाहिए।'
  );
  const telHref = normalizeTelHref(siteSettings.supportPhone);
  const instagramHref = siteSettings.instagramUrl || INSTAGRAM_URL;
  const mapsHref = siteSettings.googleMapsUrl || GOOGLE_MAPS_URL;

  return (
    <footer className="bg-white border-t border-gray-200 text-[#132032] pt-10 pb-24 md:pb-10 text-xs">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Clean Light Red Support Banner */}
        <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-[#FEF2F2] border border-red-200/80">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D5151B]">
                <ShieldCheck className="w-4 h-4" />
                <span>Sastafone Certified Technician Network</span>
              </div>
              <h3 className="text-lg font-bold text-[#132032] tracking-tight">
                सूरत में पारदर्शी डोरस्टेप मोबाइल रिपेयरिंग व बाय-बैक
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                बिना किसी लॉगिन के सीधे WhatsApp पर बुकिंग करें। ₹199 विज़िट टोकन डायरेक्ट UPI (<strong className="font-mono text-[#132032]">{DIRECT_UPI_ID}</strong>) द्वारा फाइनल बिल में एडजस्ट होता है। ₹1,000+ के बिल पर 6 महीने की वारंटी।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('whatsapp_click', { source: 'footer' })}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-2 transition-colors duration-150 shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp बुकिंग व सहायता</span>
              </a>

              <a
                href={telHref}
                onClick={() => trackEvent('call_click', { source: 'footer' })}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-[#132032] font-bold text-xs inline-flex items-center gap-2 transition-colors duration-150"
              >
                <Phone className="w-4 h-4 text-[#D5151B]" />
                <span>कॉल करें</span>
              </a>
            </div>
          </div>
        </div>

        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-gray-100">
          {/* Col 1: Brand & Contact Info */}
          <div className="space-y-3">
            <SastafoneLogo size="sm" />
            <p className="text-gray-600 leading-relaxed text-xs">
              सूरत की डोरस्टेप मोबाइल रिपेयर, पुराना फोन बेचने और क्वालिटी-चेक्ड सेकंड-हैंड फोन की विश्वसनीय सेवा।
            </p>
            <div className="space-y-1.5 pt-1 text-xs text-gray-700">
              <p className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#D5151B] shrink-0" />
                <span>9:00 AM – 9:30 PM</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#D5151B] shrink-0" />
                <a href={`mailto:${siteSettings.supportEmail}`} className="hover:text-[#D5151B]">
                  {siteSettings.supportEmail}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#D5151B] shrink-0" />
                <a
                  href={telHref}
                  onClick={() => trackEvent('call_click', { source: 'footer_link' })}
                  className="hover:text-[#D5151B] tabular-nums"
                >
                  {siteSettings.supportPhone}
                </a>
              </p>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="font-bold text-[#132032] uppercase tracking-wider text-xs mb-3">
              सेवाएं व लिंक
            </h4>
            <ul className="space-y-2">
              {[
                { label: 'मोबाइल रिपेयर (Repair)', path: '/repair' },
                { label: 'ऑर्डर स्टेटस ट्रैक (Track Order)', path: '/track' },
                { label: 'पुराना फोन बेचें (Sell Phone)', path: '/sell-phone' },
                { label: 'सर्टिफाइड फोन खरीदें (Buy Phones)', path: '/buy-phones' },
                { label: 'वारंटी जांचें (Warranty)', path: '/warranty' },
                { label: 'संपर्क करें व लोकेशन (Contact)', path: '/contact' }
              ].map((link) => (
                <li key={link.path}>
                  <button
                    type="button"
                    onClick={() => handleNav(link.path)}
                    className="text-gray-600 hover:text-[#D5151B] transition-colors duration-150 cursor-pointer text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Surat Service Areas */}
          <div>
            <h4 className="font-bold text-[#132032] uppercase tracking-wider text-xs mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#D5151B]" />
              <span>सूरत क्षेत्र (Areas)</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Adajan',
                'Vesu',
                'Pal',
                'Varachha',
                'Katargam',
                'Rander',
                'Piplod',
                'Citylight',
                'Ghod Dod Road',
                'Althan',
                'Udhna',
                'Dindoli'
              ].map((areaName) => (
                <button
                  key={areaName}
                  type="button"
                  onClick={() => {
                    setSelectedLocality(`${areaName}, Surat`);
                    const areaSlug = areaName.toLowerCase().replace(/\s+/g, '-');
                    handleNav(`/areas/${areaSlug}`);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-gray-50 hover:bg-[#FEF2F2] text-gray-700 hover:text-[#D5151B] text-[11px] font-medium transition-colors duration-150 cursor-pointer border border-gray-200/80"
                >
                  {areaName}
                </button>
              ))}
            </div>
          </div>

          {/* Col 4: Social & Map Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#132032] uppercase tracking-wider text-xs mb-2">
              सोशल व मैप
            </h4>
            <div className="space-y-2">
              <a
                href={instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-[#FEF2F2] border border-gray-200 text-[#132032] font-bold transition-colors duration-150"
              >
                <span className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-[#D5151B]" />
                  <span>Instagram</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              </a>

              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('google_maps_click', { source: 'footer' })}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-[#FEF2F2] border border-gray-200 text-[#132032] font-bold transition-colors duration-150"
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#D5151B]" />
                  <span>Google Maps</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              </a>

              <button
                type="button"
                onClick={() => handleNav('/contact')}
                className="w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold text-[#D5151B] hover:bg-[#FEF2F2] transition-colors duration-150 cursor-pointer"
              >
                मैप एम्बेड देखें (/contact)
              </button>
            </div>
          </div>
        </div>

        {/* Legal Permalinks */}
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-gray-500 text-[11px]">
          <p>© {new Date().getFullYear()} Sastafone Surat (sastafone.in). All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => handleNav('/terms')}
              className="hover:text-[#D5151B] transition-colors cursor-pointer"
            >
              Terms & Conditions
            </button>
            <button
              type="button"
              onClick={() => handleNav('/privacy')}
              className="hover:text-[#D5151B] transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => handleNav('/refund-policy')}
              className="hover:text-[#D5151B] transition-colors cursor-pointer"
            >
              Refund & Warranty Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
