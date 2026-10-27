/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface BrandLogoProps {
  brandId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  inverted?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  brandId,
  className = '',
  size = 'md',
  showName = false,
  inverted = false
}) => {
  const normalizedId = brandId.toLowerCase().replace(/[^a-z0-9]/g, '');

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
    xl: 'w-11 h-11'
  };

  const renderIcon = () => {
    switch (normalizedId) {
      case 'apple':
        return (
          <div
            className={`${iconSizes[size]} flex items-center justify-center rounded-lg ${
              inverted ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
            } shadow-xs shrink-0`}
            title="Apple"
          >
            <svg viewBox="0 0 170 170" className="w-4/5 h-4/5 fill-current">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.34-6.42-9.78-11.45-20.73-15.09-32.84-3.64-12.11-5.46-23.49-5.46-34.13 0-14.57 3.73-26.68 11.19-36.33 7.46-9.65 17-14.58 28.61-14.81 4.78 0 10.15 1.25 16.12 3.75 5.97 2.5 9.87 3.86 11.71 4.08 1.41-.22 5.54-1.63 12.38-4.22 6.84-2.59 12.59-3.72 17.26-3.39 12.83 1.09 23.01 5.86 30.55 14.31-11.31 6.85-16.85 16.52-16.63 29.02.22 10 3.97 18.26 11.25 24.78 7.28 6.52 15.98 10.22 26.09 11.1-2.17 6.3-4.78 12.83-7.83 19.57zM119.22 33.15c0-7.39 2.66-14.46 7.99-21.2C132.53 5.21 139.16 1.08 147.1 0c.22 1.09.33 2.07.33 2.93 0 7.39-2.83 14.78-8.48 22.17-5.65 7.39-12.39 11.74-20.22 13.05-.22-1.3-.33-2.61-.33-5z" />
            </svg>
          </div>
        );

      case 'xiaomi':
        return (
          <div
            className={`${iconSizes[size]} flex items-center justify-center rounded-xl bg-[#FF6900] text-white shadow-xs shrink-0 font-bold`}
            title="Xiaomi (Mi)"
          >
            {/* Authentic Mi squircle ligature */}
            <span className="font-sans font-black tracking-tighter text-sm">mi</span>
          </div>
        );

      case 'samsung':
        return (
          <div
            className={`${iconSizes[size]} flex items-center justify-center rounded-full bg-[#034EA2] text-white shadow-xs shrink-0 px-1`}
            title="Samsung"
          >
            <span className="font-sans font-black tracking-tight text-[9px] uppercase">
              SAMSUNG
            </span>
          </div>
        );

      case 'oneplus':
        return (
          <div
            className={`${iconSizes[size]} flex items-center justify-center rounded-lg bg-[#EB0028] text-white shadow-xs shrink-0 font-black relative`}
            title="OnePlus"
          >
            <span className="text-xs font-black">1</span>
            <span className="text-[10px] absolute top-0.5 right-0.5 font-bold">+</span>
          </div>
        );

      case 'vivo':
        return (
          <div
            className={`${iconSizes[size]} flex items-center justify-center rounded-xl bg-[#0045F5] text-white shadow-xs shrink-0`}
            title="Vivo"
          >
            <span className="font-sans font-black text-xs lowercase tracking-tight italic">
              vivo
            </span>
          </div>
        );

      case 'oppo':
        return (
          <div
            className={`${iconSizes[size]} flex items-center justify-center rounded-xl bg-[#00845B] text-white shadow-xs shrink-0`}
            title="Oppo"
          >
            <span className="font-sans font-black text-[10px] tracking-wider uppercase">
              OPPO
            </span>
          </div>
        );

      case 'realme':
        return (
          <div
            className={`${iconSizes[size]} flex items-center justify-center rounded-xl bg-[#FFC915] text-slate-950 shadow-xs shrink-0 font-black`}
            title="Realme"
          >
            <span className="font-sans font-black text-[10px] lowercase tracking-tight">
              realme
            </span>
          </div>
        );

      case 'motorola':
        return (
          <div
            className={`${iconSizes[size]} flex items-center justify-center rounded-full bg-[#001435] text-white shadow-xs shrink-0 border border-slate-700`}
            title="Motorola"
          >
            <svg viewBox="0 0 100 100" className="w-3/5 h-3/5 fill-white">
              <path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm22.5 68.6c-5.8-3.9-10.4-12.8-13.4-23.7-2.6 10-6.7 18.2-12.1 22.5-3.3 2.6-7.3 3.9-11.6 3.9-3.7 0-7.3-.9-10.4-2.7 7.7-10.8 14-25.7 18-36.9 2.5-7 4.1-13.3 4.9-18.4 4 11.2 9.4 24.3 15.6 34.6 3.2 5.3 6.6 9.8 9.9 13.5 2.8 3.2 5.8 5.7 9.1 7.2z" />
            </svg>
          </div>
        );

      case 'google':
        return (
          <div
            className={`${iconSizes[size]} flex items-center justify-center rounded-xl bg-white shadow-xs shrink-0 border border-slate-200 p-1`}
            title="Google Pixel"
          >
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          </div>
        );

      case 'nothing':
        return (
          <div
            className={`${iconSizes[size]} flex items-center justify-center rounded-xl bg-black text-white shadow-xs shrink-0 border border-zinc-700`}
            title="Nothing"
          >
            <span className="font-mono font-black text-[9px] tracking-widest text-zinc-100">
              (N)
            </span>
          </div>
        );

      case 'iqoo':
        return (
          <div
            className={`${iconSizes[size]} flex items-center justify-center rounded-xl bg-slate-950 text-white shadow-xs shrink-0 border border-amber-500/50 relative overflow-hidden`}
            title="iQOO"
          >
            <span className="font-sans font-black text-[10px] tracking-tight italic text-amber-400">
              iQOO
            </span>
          </div>
        );

      case 'poco':
        return (
          <div
            className={`${iconSizes[size]} flex items-center justify-center rounded-xl bg-[#FFCC00] text-black shadow-xs shrink-0 font-black`}
            title="POCO"
          >
            <span className="font-sans font-black text-[10px] tracking-tight">POCO</span>
          </div>
        );

      case 'nokia':
        return (
          <div
            className={`${iconSizes[size]} flex items-center justify-center rounded-xl bg-[#124191] text-white shadow-xs shrink-0`}
            title="Nokia"
          >
            <span className="font-sans font-black text-[9px] tracking-widest uppercase">
              NOKIA
            </span>
          </div>
        );

      case 'honor':
        return (
          <div
            className={`${iconSizes[size]} flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-xs shrink-0`}
            title="Honor"
          >
            <span className="font-sans font-black text-[9px] tracking-wider uppercase">
              HONOR
            </span>
          </div>
        );

      case 'asus':
        return (
          <div
            className={`${iconSizes[size]} flex items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs shrink-0 border border-slate-700`}
            title="Asus"
          >
            <span className="font-sans font-black text-[9px] tracking-widest uppercase text-sky-400">
              ASUS
            </span>
          </div>
        );

      case 'infinix':
        return (
          <div
            className={`${iconSizes[size]} flex items-center justify-center rounded-xl bg-[#00C261] text-slate-950 shadow-xs shrink-0 font-bold`}
            title="Infinix"
          >
            <span className="font-sans font-black text-[9px] tracking-tight">infinix</span>
          </div>
        );

      case 'tecno':
        return (
          <div
            className={`${iconSizes[size]} flex items-center justify-center rounded-xl bg-[#0072CE] text-white shadow-xs shrink-0`}
            title="Tecno"
          >
            <span className="font-sans font-black text-[9px] tracking-wider uppercase">
              TECNO
            </span>
          </div>
        );

      case 'lenovo':
        return (
          <div
            className={`${iconSizes[size]} flex items-center justify-center rounded-lg bg-[#E2231A] text-white shadow-xs shrink-0`}
            title="Lenovo"
          >
            <span className="font-sans font-bold text-[9px] tracking-tight">lenovo</span>
          </div>
        );

      case 'lg':
        return (
          <div
            className={`${iconSizes[size]} flex items-center justify-center rounded-full bg-[#A50034] text-white shadow-xs shrink-0 border border-rose-400/40`}
            title="LG"
          >
            <span className="font-sans font-black text-[10px] tracking-tighter">LG</span>
          </div>
        );

      case 'lava':
        return (
          <div
            className={`${iconSizes[size]} flex items-center justify-center rounded-lg bg-[#E21836] text-white shadow-xs shrink-0 font-black`}
            title="Lava"
          >
            <span className="font-sans font-black text-[9px] tracking-wider uppercase">
              LAVA
            </span>
          </div>
        );

      case 'cmf':
        return (
          <div
            className={`${iconSizes[size]} flex items-center justify-center rounded-xl bg-[#FF4500] text-white shadow-xs shrink-0 font-mono font-black`}
            title="CMF by Nothing"
          >
            <span className="font-mono text-[9px] font-black tracking-tighter">
              cmf
            </span>
          </div>
        );

      case 'micromax':
        return (
          <div
            className={`${iconSizes[size]} flex items-center justify-center rounded-xl bg-[#E85D04] text-white shadow-xs shrink-0 font-bold`}
            title="Micromax"
          >
            <span className="font-sans font-black text-[8px] tracking-tight">
              micro
            </span>
          </div>
        );

      case 'alcatel':
        return (
          <div
            className={`${iconSizes[size]} flex items-center justify-center rounded-lg bg-[#008080] text-white shadow-xs shrink-0 font-bold`}
            title="Alcatel"
          >
            <span className="font-sans font-black text-[8px] tracking-widest uppercase">
              ALCATEL
            </span>
          </div>
        );

      case 'huawei':
        return (
          <div
            className={`${iconSizes[size]} flex items-center justify-center rounded-full bg-[#CF0A2C] text-white shadow-xs shrink-0 font-bold`}
            title="Huawei"
          >
            <svg viewBox="0 0 24 24" className="w-3/5 h-3/5 fill-white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h2v2h-2v-2zm1-14c4.41 0 8 3.59 8 8 0 2.5-1.15 4.74-2.94 6.22l-1.42-1.42C17.06 15.65 18 13.94 18 12c0-3.31-2.69-6-6-6s-6 2.69-6 6c0 1.94.94 3.65 2.36 4.8l-1.42 1.42C5.15 16.74 4 14.5 4 12c0-4.41 3.59-8 8-8z"/>
            </svg>
          </div>
        );

      case 'blackberry':
        return (
          <div
            className={`${iconSizes[size]} flex items-center justify-center rounded-lg bg-[#000000] text-white shadow-xs shrink-0 border border-slate-700`}
            title="BlackBerry"
          >
            <span className="font-sans font-black text-[7px] tracking-tighter">
              BlackBerry
            </span>
          </div>
        );

      case 'nubia':
        return (
          <div
            className={`${iconSizes[size]} flex items-center justify-center rounded-xl bg-slate-900 text-[#E60012] shadow-xs shrink-0 border border-slate-800 font-black`}
            title="Nubia"
          >
            <span className="font-sans font-black text-[9px] tracking-tighter">
              nubia
            </span>
          </div>
        );

      default:
        return (
          <div
            className={`${iconSizes[size]} flex items-center justify-center rounded-xl bg-slate-800 text-white shadow-xs shrink-0 font-bold text-xs`}
          >
            📱
          </div>
        );
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {renderIcon()}
      {showName && (
        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
          {brandId.toUpperCase()}
        </span>
      )}
    </div>
  );
};
