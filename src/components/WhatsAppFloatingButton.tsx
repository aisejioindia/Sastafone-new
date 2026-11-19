import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { buildWhatsappHref, normalizeTelHref } from '../services/siteSettingsService';
import { trackEvent } from '../utils/analytics';

export const WhatsAppFloatingButton: React.FC = () => {
  const { siteSettings } = useApp();

  const whatsappHref = buildWhatsappHref(
    siteSettings.whatsappNumber,
    'नमस्ते Sastafone Surat! मुझे मोबाइल रिपेयर / सेवा के बारे में जानकारी चाहिए।'
  );
  const telHref = normalizeTelHref(siteSettings.supportPhone);

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-30 flex flex-col gap-2">
      <a
        href={telHref}
        onClick={() => trackEvent('call_click', { source: 'floating_button' })}
        aria-label="Call Sastafone Support"
        title={`Call ${siteSettings.supportPhone}`}
        className="w-11 h-11 rounded-full bg-white border border-gray-200 text-[#132032] hover:border-[#D5151B] hover:text-[#D5151B] shadow-md flex items-center justify-center transition-all duration-150"
      >
        <Phone className="w-4 h-4" />
      </a>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent('whatsapp_click', { source: 'floating_button' })}
        aria-label="Chat on WhatsApp"
        title="WhatsApp Support"
        className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center justify-center transition-all duration-150"
      >
        <MessageCircle className="w-5 h-5" />
      </a>
    </div>
  );
};
