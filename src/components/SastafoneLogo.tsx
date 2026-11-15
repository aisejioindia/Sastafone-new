import React, { useState } from 'react';

interface SastafoneLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const SastafoneLogo: React.FC<SastafoneLogoProps> = ({
  size = 'md',
  className = ''
}) => {
  const [imgError, setImgError] = useState(false);

  const heightClasses = {
    sm: 'h-7 w-auto',
    md: 'h-8 sm:h-9 w-auto',
    lg: 'h-10 sm:h-11 w-auto'
  }[size];

  if (imgError) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#D5151B] text-white font-bold text-base shrink-0">
          S
        </span>
        <span className="text-lg font-bold tracking-tight text-[#132032]">
          Sasta<span className="text-[#D5151B]">fone</span>
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center shrink-0 ${className}`}>
      <img
        src="/assets/logo-wordmark.png"
        alt="Sastafone"
        onError={() => setImgError(true)}
        className={`${heightClasses} object-contain select-none`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
