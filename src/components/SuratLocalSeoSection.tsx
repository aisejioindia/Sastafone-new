import React from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, ArrowRight } from 'lucide-react';

const SURAT_AREAS_SEO = [
  { slug: 'adajan', name: 'Adajan', hi: 'अडाजण', desc: 'आनंद महल रोड, LP सवानी व प्राइम आर्केड' },
  { slug: 'vesu', name: 'Vesu', hi: 'वेसु', desc: 'VIP रोड व भगवान महावीर कॉलेज' },
  { slug: 'pal', name: 'Pal', hi: 'पाल', desc: 'पाल आरटीओ, गौरव पथ व नक्षत्र' },
  { slug: 'varachha', name: 'Varachha', hi: 'वराछा', desc: 'हीरा बाजार, मिनी बाजार व मानगढ़ चौक' },
  { slug: 'katargam', name: 'Katargam', hi: 'कतारगाम', desc: 'गजेरा सर्कल व ललिता चौकड़ी' },
  { slug: 'rander', name: 'Rander', hi: 'रांदेर', desc: 'रांदेर रोड व जहांगीरपुरा जंक्शन' },
  { slug: 'piplod', name: 'Piplod', hi: 'पिपलोद', desc: 'राहुल राज मॉल व SVNIT कैंपस' },
  { slug: 'citylight', name: 'Citylight', hi: 'सिटीलाइट', desc: 'अग्रसेन भवन व साइंस सेंटर' },
  { slug: 'ghod-dod-road', name: 'Ghod Dod Road', hi: 'घोड़ दौड़ रोड', desc: 'जानी फरसाण व काकड़िया कॉम्प्लेक्स' },
  { slug: 'althan', name: 'Althan', hi: 'अलथान', desc: 'अलथान नहर रोड व सोहम सर्कल' }
];

export const SuratLocalSeoSection: React.FC = () => {
  const { setSelectedLocality } = useApp();

  const handleAreaClick = (area: (typeof SURAT_AREAS_SEO)[0]) => {
    setSelectedLocality(`${area.name}, Surat`);
    if (window.location.pathname !== `/areas/${area.slug}`) {
      window.history.pushState({}, '', `/areas/${area.slug}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-10 bg-white border-t border-gray-100 text-[#132032] text-xs">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D5151B] mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>सूरत क्षेत्र कवरेज</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#132032] tracking-tight">
            सूरत के प्रमुख इलाकों में डोरस्टेप पिकअप सेवा
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Sastafone Certified Technician Network द्वारा आपके क्षेत्र में डोरस्टेप पिकअप और डिलीवरी।
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {SURAT_AREAS_SEO.map((area) => (
            <button
              key={area.slug}
              type="button"
              onClick={() => handleAreaClick(area)}
              className="p-3.5 rounded-2xl border border-gray-200 bg-white hover:bg-[#FEF2F2] hover:border-red-200 transition-all duration-150 text-left cursor-pointer group"
            >
              <div className="flex items-center justify-between text-[#132032] font-bold mb-1">
                <span>{area.name}</span>
                <span className="text-[10px] text-gray-400 group-hover:text-[#D5151B]">
                  {area.hi}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 line-clamp-1">{area.desc}</p>
              <span className="text-[11px] text-[#D5151B] font-bold mt-2 inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                <span>सेवा देखें</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
