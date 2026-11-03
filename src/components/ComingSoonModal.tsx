import React from 'react';
import { X, Sparkles, Wrench, ShieldCheck, ArrowRight, Smartphone } from 'lucide-react';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
  onGoToRepair: () => void;
}

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  isOpen,
  onClose,
  featureName = 'Sell & Buy',
  onGoToRepair
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-100 rounded-full blur-2xl pointer-events-none" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
          <Smartphone className="w-8 h-8" />
        </div>

        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider">
          Phase 2 • जल्द उपलब्ध (Coming Soon)
        </span>

        <h3 className="text-xl font-black text-slate-900 mt-3">
          {featureName}
        </h3>

        <p className="text-sm text-slate-600 mt-2 leading-relaxed">
          वर्तमान में <strong>सस्ताफोन सूरत</strong> विशेष रूप से <strong>Phase 1: सर्टिफाइड डोरस्टेप पिकअप व डिलीवरी फोन रिपेयरिंग</strong> सेवा संचालित कर रहा है। पुराना फोन खरीदने व बेचने (P2P बाज़ार) की सुविधा Phase 2 में जल्द शुरू की जाएगी।
        </p>

        <div className="mt-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-left space-y-2 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Sastafone Certified Technician Network</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-red-600 shrink-0" />
            <span>₹199 विज़िट टोकन (फाइनल बिल में माइनस)</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>₹1000+ पर 6 महीने वारंटी</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onGoToRepair();
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Wrench className="w-4 h-4" />
            <span>मोबाइल रिपेयरिंग बुक करें (Phase 1)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-700 font-bold cursor-pointer"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
};
