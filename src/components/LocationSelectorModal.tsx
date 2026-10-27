import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, MapPin, Search, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { SURAT_LOCALITIES } from '../data/mockData';

export const LocationSelectorModal: React.FC = () => {
  const { isLocationModalOpen, setIsLocationModalOpen, selectedLocality, setSelectedLocality, language } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isLocationModalOpen) return null;

  const filtered = SURAT_LOCALITIES.filter(
    l => l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         l.hindiName.includes(searchQuery) ||
         l.pincode.includes(searchQuery)
  );

  const handleSelect = (localityName: string) => {
    setSelectedLocality(`${localityName}, Surat`);
    setIsLocationModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <MapPin className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {language === 'hi' ? 'सूरत में अपना क्षेत्र चुनें' : 'Select Locality in Surat'}
              </h3>
              <p className="text-xs text-blue-100">
                {language === 'hi' ? 'एक्सक्लूसिव 2-घंटे डोरस्टेप सर्विस' : 'Exclusive 2-hour doorstep pickup'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsLocationModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={language === 'hi' ? 'सूरत इलाका या पिनकोड खोजें (उदा. Adajan, Vesu, 395009)...' : 'Search Surat area or pincode...'}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600 bg-slate-50"
            />
          </div>
        </div>

        {/* Localities List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            {language === 'hi' ? 'सूरत के प्रमुख हब्स (Surat Hubs):' : 'Surat Active Hubs:'}
          </p>

          <div className="grid grid-cols-1 gap-2">
            {filtered.map(locality => {
              const isSelected = selectedLocality.includes(locality.name);
              return (
                <button
                  key={locality.id}
                  onClick={() => handleSelect(locality.name)}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-xs'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">📍</span>
                    <div>
                      <p className="font-bold text-xs sm:text-sm flex items-center gap-1.5">
                        <span>{locality.name}</span>
                        <span className="text-xs font-normal text-slate-500">({locality.hindiName})</span>
                        {locality.isPopular && (
                          <span className="text-[9px] font-extrabold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                            FAST HUB
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Pincode: {locality.pincode} • {locality.zone} Surat Zone
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Surat Note */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-600 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>सूरत नगर निगम (SMC) क्षेत्र में पूर्ण डोरस्टेप कवरेज</span>
        </div>
      </div>
    </div>
  );
};
