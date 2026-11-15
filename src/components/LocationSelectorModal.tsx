import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SURAT_LOCALITIES } from '../data/mockData';
import { MapPin, Search, X, Check } from 'lucide-react';

export const LocationSelectorModal: React.FC = () => {
  const { isLocationModalOpen, setIsLocationModalOpen, selectedLocality, setSelectedLocality, language } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isLocationModalOpen) return null;

  const filteredLocalities = SURAT_LOCALITIES.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.hindiName.includes(searchQuery) ||
      loc.pincode.includes(searchQuery)
  );

  const handleSelect = (name: string) => {
    setSelectedLocality(`${name}, Surat`);
    setIsLocationModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-200">
        {/* Header (Light Theme Red) */}
        <div className="bg-[#D5151B] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-5 h-5" />
            <div>
              <h3 className="font-bold text-base sm:text-lg leading-tight text-white">
                {language === 'hi' ? 'अपना सूरत क्षेत्र चुनें' : 'Select Your Surat Locality'}
              </h3>
              <p className="text-xs text-red-100">
                {language === 'hi'
                  ? 'सूरत के सभी इलाकों में डोरस्टेप पिकअप सेवा उपलब्ध है'
                  : 'Doorstep pickup & delivery available across Surat'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'hi'
                  ? 'इलाका या पिनकोड खोजें (जैसे Adajan, Vesu, 395009)...'
                  : 'Search area or pincode (e.g. Adajan, Vesu, 395009)...'
              }
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-[#132032] focus:outline-none focus:ring-2 focus:ring-[#D5151B]"
            />
          </div>
        </div>

        {/* Locality Grid */}
        <div className="p-4 max-h-[60vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {filteredLocalities.map((loc) => {
            const isSelected = selectedLocality.includes(loc.name);
            return (
              <button
                type="button"
                key={loc.id}
                onClick={() => handleSelect(loc.name)}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'border-[#D5151B] bg-[#FEF2F2] text-[#D5151B]'
                    : 'border-gray-200 hover:border-red-200 hover:bg-gray-50 text-[#132032]'
                }`}
              >
                <div>
                  <div className="font-bold text-sm flex items-center gap-1.5">
                    <span>{loc.name}</span>
                    {loc.isPopular && (
                      <span className="text-[10px] bg-red-100 text-[#D5151B] px-1.5 py-0.5 rounded font-bold">
                        Popular
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {loc.hindiName} • {loc.pincode} ({loc.zone} Surat)
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-[#D5151B] shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
