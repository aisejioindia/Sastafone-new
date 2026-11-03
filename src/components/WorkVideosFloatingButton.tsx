import React, { useState } from 'react';
import { Play, Wrench, Sparkles } from 'lucide-react';
import { WorkVideosFeedModal } from './WorkVideosFeedModal';

export const WorkVideosFloatingButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Work Videos Feed Button (Bottom Left) */}
      <div className="fixed bottom-20 sm:bottom-6 left-3 sm:left-5 z-40 flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-300">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2 pl-2.5 pr-3.5 py-2 rounded-full bg-slate-900/95 hover:bg-slate-900 text-white font-black text-xs shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-blue-500/50 backdrop-blur-md"
          title="हमारे लाइव रिपेयर काम के वीडियो देखें"
        >
          {/* Subtle Outer Ping Glow */}
          <span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 opacity-60 group-hover:opacity-100 blur-xs transition-opacity -z-10 animate-pulse" />

          {/* Video Play / Wrench Icon with Blue Pill Background */}
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Play className="w-3 h-3 fill-white translate-x-0.2" />
          </div>

          <div className="flex flex-col text-left leading-none">
            <span className="text-[10px] text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1">
              <span>लाइव वीडियो फीड</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </span>
            <span className="text-xs font-black tracking-tight mt-0.5 flex items-center gap-1 text-white">
              <span>मेरे काम के वीडियो</span>
              <Wrench className="w-3 h-3 text-amber-400" />
            </span>
          </div>
        </button>
      </div>

      {/* Modal */}
      <WorkVideosFeedModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
