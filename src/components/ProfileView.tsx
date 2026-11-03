import React from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  Phone,
  MapPin,
  ShieldCheck,
  Package,
  Wrench,
  LogOut,
  ChevronRight,
  MessageCircle,
  ShieldAlert
} from 'lucide-react';
import { WHATSAPP_NUMBER } from '../data/mockData';

interface ProfileViewProps {
  onOpenAdmin: () => void;
  onNavigateToOrders: () => void;
  onNavigateToRepair: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onOpenAdmin,
  onNavigateToOrders,
  onNavigateToRepair
}) => {
  const { user, logoutUser, setIsAuthModalOpen, selectedLocality } = useApp();

  const isAdmin = user.isLoggedIn && user.role === 'admin';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5 animate-in fade-in duration-200">
      {/* User Card */}
      <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center font-black text-xl shrink-0">
            {user.isLoggedIn ? (
              user.name ? user.name.charAt(0).toUpperCase() : <User className="w-8 h-8" />
            ) : (
              <User className="w-8 h-8 text-gray-400" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {user.isLoggedIn ? (
              <>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-gray-900 truncate">
                    {user.name || 'Sastafone ग्राहक'}
                  </h2>
                  {isAdmin && (
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-[#DC2626] text-[10px] font-bold uppercase">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>{user.phone ? `+91 ${user.phone}` : 'फोन नंबर सुरक्षित'}</span>
                </p>
                {user.email && (
                  <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                )}
              </>
            ) : (
              <>
                <h2 className="text-lg font-black text-gray-900">
                  नमस्ते, आपका स्वागत है
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  ऑर्डर्स और प्रोफाइल देखने के लिए लॉगिन करें।
                </p>
              </>
            )}
          </div>
        </div>

        {/* Auth CTA */}
        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-xs text-gray-600 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>सूरत: {user.address || selectedLocality}</span>
          </div>

          {user.isLoggedIn ? (
            <button
              type="button"
              onClick={logoutUser}
              className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-gray-500" />
              <span>लॉगआउट</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              लॉगिन करें
            </button>
          )}
        </div>
      </div>

      {/* Navigation Quick Links */}
      <div className="bg-white rounded-3xl p-3 shadow-xs border border-gray-200 divide-y divide-gray-100">
        <button
          type="button"
          onClick={onNavigateToOrders}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-gray-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-[#DC2626]" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">मेरे ऑर्डर्स (My Orders)</div>
              <div className="text-xs text-gray-500">लाइव स्टेटस ट्रैकिंग, इनवॉइस व क्वोट अप्रूवल</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button
          type="button"
          onClick={onNavigateToRepair}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-gray-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">नया रिपेयर बुक करें (Book Repair)</div>
              <div className="text-xs text-gray-500">₹199 विज़िट टोकन • 60 मिनट पिकअप स्लॉट्स</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Admin Quick Action (ONLY visible to user.role === 'admin', NO public button or PIN prompt) */}
      {isAdmin && (
        <div className="bg-[#FEF2F2] rounded-3xl p-5 border border-red-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#DC2626]" />
              <h3 className="text-sm font-bold text-gray-900">
                Sastafone एडमिन कंसोल (/admin)
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-[#DC2626]">
              Admin Active
            </span>
          </div>

          <p className="text-xs text-gray-600 mb-3">
            सूरत पिकअप, रिपेयर असाइनमेंट, फोन बाय-बैक, इन्वेंट्री व पार्टनर लेजर प्रबंधन।
          </p>

          <button
            type="button"
            onClick={onOpenAdmin}
            className="w-full py-2.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            एडमिन डेस्क खोलें
          </button>
        </div>
      )}

      {/* Surat Help & Support */}
      <div className="bg-gray-50 rounded-3xl p-5 border border-gray-200 text-center">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
          Sastafone Certified Technician Network
        </h4>
        <p className="text-xs text-gray-500 max-w-sm mx-auto mb-3">
          सूरत के सभी प्रमुख इलाकों (अडाजण, वेसु, वराछा, कतारगाम, सिटीलाइट) में डोरस्टेप पिकअप व डिलीवरी।
        </p>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('नमस्ते Sastafone Surat! मुझे सहायता चाहिए।')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp सहायता</span>
        </a>
      </div>
    </div>
  );
};
