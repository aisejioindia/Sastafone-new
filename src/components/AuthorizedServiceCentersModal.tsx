import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SURAT_OFFICIAL_SERVICE_CENTERS } from '../data/mockData';
import { BrandLogo } from './BrandLogo';
import { MapPin, Phone, Clock, Star, ExternalLink, ShieldCheck, X, Search } from 'lucide-react';

export const AuthorizedServiceCentersModal: React.FC = () => {
  const { isBrandCentersModalOpen, setIsBrandCentersModalOpen, language } = useApp();
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isBrandCentersModalOpen) return null;

  const brandsList = ['All', 'Apple', 'Samsung', 'Xiaomi (Mi / Redmi)', 'OnePlus', 'Vivo', 'Realme'];

  const filtered = SURAT_OFFICIAL_SERVICE_CENTERS.filter(center => {
    const matchesBrand = selectedBrandFilter === 'All' || center.brandName.toLowerCase().includes(selectedBrandFilter.toLowerCase());
    const matchesSearch =
      center.centerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      center.area.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-800 to-indigo-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                सूरत डायरेक्टरी
              </span>
              <h3 className="font-bold text-base sm:text-lg">
                सूरत के अधिकृत ब्रांड सर्विस सेंटर (Official Service Centers)
              </h3>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              Apple, Samsung, Xiaomi Mi, OnePlus, Vivo, Realme के ओरिजिनल सर्विस सेंटर एड्रेस व फोन
            </p>
          </div>
          <button
            onClick={() => setIsBrandCentersModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Brand Filter */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="सूरत इलाका या सेंटर का नाम खोजें (उदा. Majura Gate, Ring Road, Adajan)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:border-blue-600"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {brandsList.map(b => (
              <button
                key={b}
                onClick={() => setSelectedBrandFilter(b)}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedBrandFilter === b
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Directory List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {filtered.map(center => (
            <div
              key={center.id}
              className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 bg-white shadow-2xs space-y-2 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <BrandLogo brandId={center.brandName.toLowerCase()} size="sm" />
                    <span className="text-[10px] font-black bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full uppercase">
                      {center.brandName}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Center
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{center.centerName}</h4>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{center.rating}</span>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <p className="flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{center.address} ({center.area} - {center.pincode})</span>
                </p>
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <strong>{center.phone}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{center.timings}</span>
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(center.googleMapQuery)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                >
                  <span>गूगल मैप्स पर रास्ता देखें</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <a
                  href={`tel:${center.phone}`}
                  className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs flex items-center gap-1"
                >
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <span>कॉल करें</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer Note */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500">
          नोट: यह डायरेक्टरी सूरत के नागरिकों की सुविधा हेतु है। Sastaphone थर्ड-पार्टी डोरस्टेप रिपेयर प्रदान करता है।
        </div>
      </div>
    </div>
  );
};
