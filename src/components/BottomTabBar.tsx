import React from 'react';
import { Home, Wrench, Package, User, ShoppingBag, ArrowUpRight } from 'lucide-react';

export type TabType = 'home' | 'repair' | 'orders' | 'profile';

interface BottomTabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  activeOrdersCount?: number;
  onShowComingSoon: (featureName: string) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
  activeOrdersCount = 0,
  onShowComingSoon
}) => {
  return (
    <nav 
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="max-w-lg mx-auto grid grid-cols-4 px-2 py-1.5">
        {/* Tab 1: Home */}
        <button
          type="button"
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center min-h-[52px] py-1 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'home'
              ? 'text-red-600 font-bold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <div className="relative">
            <Home className={`w-5 h-5 transition-transform ${activeTab === 'home' ? 'scale-110' : ''}`} />
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight">होम (Home)</span>
        </button>

        {/* Tab 2: Repair (Brand Red Highlight) */}
        <button
          type="button"
          onClick={() => onTabChange('repair')}
          className={`relative flex flex-col items-center justify-center min-h-[52px] py-1 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'repair'
              ? 'text-red-600 font-black'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <div className="relative">
            <div className={`p-1 rounded-lg ${activeTab === 'repair' ? 'bg-red-50 text-red-600' : ''}`}>
              <Wrench className={`w-5 h-5 transition-transform ${activeTab === 'repair' ? 'scale-110' : ''}`} />
            </div>
            <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-red-600 text-white text-[8px] font-black rounded-full uppercase leading-none shadow-xs">
              ₹199
            </span>
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight">रिपेयर (Repair)</span>
        </button>

        {/* Tab 3: My Orders */}
        <button
          type="button"
          onClick={() => onTabChange('orders')}
          className={`flex flex-col items-center justify-center min-h-[52px] py-1 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'text-red-600 font-bold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <div className="relative">
            <Package className={`w-5 h-5 transition-transform ${activeTab === 'orders' ? 'scale-110' : ''}`} />
            {activeOrdersCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs animate-pulse">
                {activeOrdersCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight">ऑर्डर्स (Orders)</span>
        </button>

        {/* Tab 4: Profile & Admin */}
        <button
          type="button"
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center min-h-[52px] py-1 px-1 rounded-xl transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'text-red-600 font-bold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <div className="relative">
            <User className={`w-5 h-5 transition-transform ${activeTab === 'profile' ? 'scale-110' : ''}`} />
          </div>
          <span className="text-[11px] mt-0.5 tracking-tight">प्रोफाइल (Profile)</span>
        </button>
      </div>

      {/* Floating or Sub-strip for Sell/Buy Notice */}
      <div className="bg-slate-50 border-t border-slate-100 px-3 py-1 flex items-center justify-between text-[11px] text-slate-500">
        <span className="truncate">
          सूरत पिकअप-डिलीवरी: <strong>Sastafone Certified Technician Network</strong>
        </span>
        <button
          type="button"
          onClick={() => onShowComingSoon('Sell & Buy (पुराना बेचें / खरीदें)')}
          className="inline-flex items-center gap-0.5 text-red-600 hover:text-red-700 font-bold cursor-pointer shrink-0 ml-2"
        >
          <span>Sell / Buy</span>
          <span className="text-[9px] px-1 py-0.2 bg-amber-100 text-amber-800 rounded font-black ml-0.5">जल्द</span>
        </button>
      </div>
    </nav>
  );
};
