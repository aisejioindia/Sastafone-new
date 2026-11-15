import React from 'react';
import { Home, Wrench, Package, User, Smartphone, ShoppingBag } from 'lucide-react';

export type TabType = 'home' | 'repair' | 'orders' | 'profile';

interface BottomTabBarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  onNavigate?: (path: string) => void;
  activeOrdersCount?: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentTab,
  onTabChange,
  onNavigate,
  activeOrdersCount = 0
}) => {
  const handleQuickRoute = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg pb-safe">
      {/* Direct Quick Action Strip (Sell / Buy / Contact) */}
      <div className="bg-[#FEF2F2] border-b border-red-100 px-3 py-1 flex items-center justify-between text-[11px]">
        <button
          type="button"
          onClick={() => handleQuickRoute('/sell-phone')}
          className="inline-flex items-center gap-1 font-bold text-[#132032] hover:text-[#D5151B] cursor-pointer"
        >
          <Smartphone className="w-3 h-3 text-[#D5151B]" />
          <span>पुराना फोन बेचें</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickRoute('/buy-phones')}
          className="inline-flex items-center gap-1 font-bold text-[#132032] hover:text-[#D5151B] cursor-pointer"
        >
          <ShoppingBag className="w-3 h-3 text-[#D5151B]" />
          <span>सर्टिफाइड फोन</span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickRoute('/contact')}
          className="font-bold text-[#D5151B] cursor-pointer"
        >
          संपर्क
        </button>
      </div>

      {/* Main 4 Tabs */}
      <nav className="flex items-center justify-around h-16 px-1">
        <button
          type="button"
          onClick={() => onTabChange('home')}
          className={`flex-1 flex flex-col items-center justify-center py-2 tap-target transition-colors duration-150 cursor-pointer ${
            currentTab === 'home' ? 'text-[#D5151B]' : 'text-gray-500 hover:text-[#132032]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px] font-bold mt-1">होम</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('repair')}
          className={`flex-1 flex flex-col items-center justify-center py-2 tap-target transition-colors duration-150 cursor-pointer ${
            currentTab === 'repair' ? 'text-[#D5151B]' : 'text-gray-500 hover:text-[#132032]'
          }`}
        >
          <Wrench className="w-5 h-5" />
          <span className="text-[11px] font-bold mt-1">रिपेयर</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('orders')}
          className={`flex-1 flex flex-col items-center justify-center py-2 tap-target relative transition-colors duration-150 cursor-pointer ${
            currentTab === 'orders' ? 'text-[#D5151B]' : 'text-gray-500 hover:text-[#132032]'
          }`}
        >
          <div className="relative">
            <Package className="w-5 h-5" />
            {activeOrdersCount > 0 && (
              <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-[#D5151B] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                {activeOrdersCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold mt-1">ऑर्डर्स</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('profile')}
          className={`flex-1 flex flex-col items-center justify-center py-2 tap-target transition-colors duration-150 cursor-pointer ${
            currentTab === 'profile' ? 'text-[#D5151B]' : 'text-gray-500 hover:text-[#132032]'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[11px] font-bold mt-1">प्रोफाइल</span>
        </button>
      </nav>
    </div>
  );
};
