import React from 'react';
import { MapPin, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { GOOGLE_MAPS_EMBED_URL, GOOGLE_MAPS_URL } from '../services/siteSettingsService';
import { trackEvent } from '../utils/analytics';

interface GoogleMapEmbedProps {
  title?: string;
  compact?: boolean;
  areaLabel?: string;
}

export const GoogleMapEmbed: React.FC<GoogleMapEmbedProps> = ({
  title = 'Sastafone Surat Location Map',
  compact = false,
  areaLabel = 'Surat, Gujarat'
}) => {
  const { siteSettings } = useApp();
  const embedSrc = siteSettings.googleMapsEmbedUrl || GOOGLE_MAPS_EMBED_URL;
  const mapsHref = siteSettings.googleMapsUrl || GOOGLE_MAPS_URL;

  return (
    <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-xs">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-2 bg-[#FEF2F2]/60">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="w-4 h-4 text-[#D5151B] shrink-0" />
          <span className="text-xs sm:text-sm font-bold text-[#132032] truncate">
            Sastafone • {areaLabel}
          </span>
        </div>
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent('google_maps_click', { location: areaLabel })}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#D5151B] hover:text-[#B31419] whitespace-nowrap transition-colors duration-150"
        >
          <span>Google Maps पर खोलें</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className={`w-full relative bg-gray-50 ${compact ? 'h-56 sm:h-64' : 'h-64 sm:h-80'}`}>
        <iframe
          src={embedSrc}
          title={title}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
};
