import React from 'react';

interface SastafoneLogoProps {
  variant?: 'light' | 'dark'; // 'light' is for white/light header, 'dark' is for dark footer
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const SastafoneLogo: React.FC<SastafoneLogoProps> = ({
  variant = 'light',
  size = 'md',
  showSubtitle = true,
  className = ''
}) => {
  const iconSizeClasses = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-10 h-10 rounded-2xl',
    lg: 'w-12 h-12 rounded-2xl'
  }[size];

  const textSizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Red Background Icon with Crisp White Silhouette & 'S' Lettermark */}
      <div
        className={`${iconSizeClasses} bg-gradient-to-tr from-red-600 via-rose-600 to-red-700 flex items-center justify-center text-white shadow-md shadow-red-500/30 shrink-0 border border-red-400/40 relative overflow-hidden`}
      >
        {/* White Smartphone Silhouette with 'S' */}
        <svg
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 drop-shadow-sm"
        >
          {/* White Outer Phone Body */}
          <rect x="5.5" y="2" width="17" height="24" rx="4" fill="#FFFFFF" />
          
          {/* Red Screen Insert */}
          <rect x="7" y="5" width="14" height="17" rx="2" fill="#DC2626" />
          
          {/* Dynamic Island / Speaker Line */}
          <rect x="11.5" y="3" width="5" height="1" rx="0.5" fill="#DC2626" />
          
          {/* Bold White "S" Lettermark */}
          <path
            d="M16.5 9.5C16.5 8.4 15.4 7.6 13.9 7.6C12.2 7.6 11.3 8.5 11.3 9.5C11.3 11.4 16.7 11.5 16.7 14.5C16.7 16.4 15 17.4 13.8 17.4C12 17.4 11 16.2 11 14.9H12.4C12.4 15.6 13 16.3 13.8 16.3C14.8 16.3 15.3 15.6 15.3 14.5C15.3 12.6 10 12.5 10 9.5C10 7.7 11.6 6.5 13.9 6.5C16.2 6.5 17.8 7.8 17.8 9.5H16.5Z"
            fill="#FFFFFF"
          />

          {/* Tiny Sparkle on Top-Right */}
          <circle cx="18.5" cy="4.5" r="1" fill="#FDE047" />

          {/* Bottom Home Indicator */}
          <rect x="11.5" y="23.5" width="5" height="1" rx="0.5" fill="#DC2626" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          <span
            className={`${textSizeClasses} font-black tracking-tight ${
              variant === 'dark' ? 'text-white' : 'text-slate-950'
            }`}
          >
            Sasta<span className="text-red-600">fone</span>
          </span>

          {/* Red Background Pill with Crisp White Hindi Text */}
          <span className="text-[10px] font-black bg-gradient-to-r from-red-600 to-rose-600 text-white px-2 py-0.5 rounded-full shadow-2xs tracking-wide">
            सस्ताफोन
          </span>
        </div>

        {showSubtitle && (
          <p
            className={`text-[10px] font-bold tracking-tight ${
              variant === 'dark' ? 'text-red-400' : 'text-red-700'
            }`}
          >
            सूरत का नंबर 1 मोबाइल हब (sastafone.in)
          </p>
        )}
      </div>
    </div>
  );
};
