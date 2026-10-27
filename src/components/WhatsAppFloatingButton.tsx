import React from 'react';
import { useApp } from '../context/AppContext';
import { WHATSAPP_NUMBER } from '../data/mockData';
import { generateWhatsAppLink } from '../utils/valuation';
import { MessageCircle } from 'lucide-react';

export const WhatsAppFloatingButton: React.FC = () => {
  const { selectedLocality, language } = useApp();

  const url = generateWhatsAppLink('general', { locality: selectedLocality });

  return (
    <aside aria-label="Support chat" className="fixed bottom-5 right-5 z-40 flex items-center gap-2 group">
      {/* Tooltip bubble on desktop */}
      <div className="hidden sm:flex flex-col items-end bg-slate-900 text-white text-xs py-1.5 px-3 rounded-2xl shadow-lg border border-slate-700 opacity-95 group-hover:opacity-100 transition-opacity">
        <span className="font-bold text-amber-400">
          {language === 'hi' ? 'सूरत हेल्पलाइन' : 'Surat Support Desk'}
        </span>
        <span className="text-[11px] text-slate-300">
          {language === 'hi' ? 'AllIndia 24x7 सपोर्ट चैट' : 'AllIndia 24x7 Live Chat'}
        </span>
      </div>

      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-xl shadow-emerald-500/35 hover:scale-110 active:scale-95 transition-all duration-200 relative"
        title="AllIndia.si 24x7 सपोर्ट डेस्क"
      >
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-white animate-ping" />
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-white" />
        <MessageCircle className="w-7 h-7 fill-white text-emerald-500" />
      </a>
    </aside>
  );
};
