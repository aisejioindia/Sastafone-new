import React, { useState } from 'react';
import {
  Clock,
  Filter,
  Search,
  CheckCircle2,
  CreditCard,
  Boxes,
  FileText,
  ShieldCheck,
  AlertCircle,
  Download,
  Trash2,
  RefreshCw,
  ArrowRight,
  TrendingUp,
  History,
  Tag,
  CheckSquare
} from 'lucide-react';
import { formatINR } from '../utils/valuation';

export type ActivityActionType = 'all' | 'status_update' | 'payment_change' | 'inventory_adjust' | 'note_saved' | 'security_auth';

export interface AdminActivityLogItem {
  id: string;
  timestamp: string;
  timeFormatted: string;
  dateFormatted: string;
  actionType: 'status_update' | 'payment_change' | 'inventory_adjust' | 'note_saved' | 'security_auth';
  categoryLabel: string;
  title: string;
  description: string;
  actor: string;
  badgeBg: string;
  badgeText: string;
  iconType: 'status' | 'payment' | 'inventory' | 'note' | 'security';
  metadata?: {
    orderId?: string;
    orderNumber?: string;
    amount?: number;
    status?: string;
    itemName?: string;
    delta?: number;
    newStock?: number;
    details?: string;
  };
}

interface AdminActivityLogProps {
  logs: AdminActivityLogItem[];
  onClearLogs?: () => void;
  onRefreshLogs?: () => void;
  onSelectOrder?: (orderId: string) => void;
}

export const AdminActivityLog: React.FC<AdminActivityLogProps> = ({
  logs,
  onClearLogs,
  onRefreshLogs,
  onSelectOrder
}) => {
  const [filterType, setFilterType] = useState<ActivityActionType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Filter logs based on category and search query
  const filteredLogs = logs.filter(log => {
    if (filterType !== 'all' && log.actionType !== filterType) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.title.toLowerCase().includes(q) ||
      log.description.toLowerCase().includes(q) ||
      log.categoryLabel.toLowerCase().includes(q) ||
      (log.metadata?.orderNumber && log.metadata.orderNumber.toLowerCase().includes(q)) ||
      (log.metadata?.itemName && log.metadata.itemName.toLowerCase().includes(q))
    );
  });

  const getActionIcon = (type: AdminActivityLogItem['iconType']) => {
    switch (type) {
      case 'status':
        return <CheckSquare className="w-4 h-4 text-blue-600" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'inventory':
        return <Boxes className="w-4 h-4 text-indigo-600" />;
      case 'note':
        return <FileText className="w-4 h-4 text-purple-600" />;
      case 'security':
        return <ShieldCheck className="w-4 h-4 text-amber-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getIconContainerBg = (type: AdminActivityLogItem['iconType']) => {
    switch (type) {
      case 'status':
        return 'bg-blue-100 border-blue-200';
      case 'payment':
        return 'bg-emerald-100 border-emerald-200';
      case 'inventory':
        return 'bg-indigo-100 border-indigo-200';
      case 'note':
        return 'bg-purple-100 border-purple-200';
      case 'security':
        return 'bg-amber-100 border-amber-200';
      default:
        return 'bg-slate-100 border-slate-200';
    }
  };

  const handleExportAuditSummary = () => {
    const textData = logs
      .map(
        l =>
          `[${l.dateFormatted} ${l.timeFormatted}] [${l.categoryLabel.toUpperCase()}] ${l.title} - ${l.description} (By: ${l.actor})`
      )
      .join('\n');

    navigator.clipboard.writeText(textData);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 3000);
  };

  // Counts by category
  const statusCount = logs.filter(l => l.actionType === 'status_update').length;
  const paymentCount = logs.filter(l => l.actionType === 'payment_change').length;
  const inventoryCount = logs.filter(l => l.actionType === 'inventory_adjust').length;
  const securityCount = logs.filter(l => l.actionType === 'security_auth').length;

  return (
    <div className="space-y-5">
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <History className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                सस्ताफोन एडमिन गतिविधि ऑडिट लॉग (Activity & Audit Trail)
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                Live Tracking
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              स्टेटस परिवर्तन, पेमेंट व कोटेशन अपडेट्स, और मैन्युअल इन्वेंटरी स्टॉक में किए गए सभी बदलावों का कालक्रमानुसार (Chronological) रिकॉर्ड
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={handleExportAuditSummary}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="ऑडिट रिकॉर्ड क्लिपबोर्ड पर कॉपी करें"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{copiedNotice ? '✓ कॉपी हो गया' : 'एक्सपोर्ट लॉग'}</span>
          </button>

          {onClearLogs && (
            <button
              type="button"
              onClick={onClearLogs}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 transition-all flex items-center gap-1.5 cursor-pointer"
              title="लॉग्स खाली करें"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">लॉग साफ़ करें</span>
            </button>
          )}
        </div>
      </div>

      {/* 4 Category Quick Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div
          onClick={() => setFilterType('status_update')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            filterType === 'status_update'
              ? 'bg-blue-50 border-blue-400 shadow-xs ring-1 ring-blue-400'
              : 'bg-white hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-blue-700 font-bold mb-1">
            <span>स्टेटस अपडेट्स</span>
            <CheckSquare className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-black text-slate-900">{statusCount}</div>
          <span className="text-[10px] text-slate-500">पेंडिंग, इन प्रोग्रेस, कम्पलीट</span>
        </div>

        <div
          onClick={() => setFilterType('payment_change')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            filterType === 'payment_change'
              ? 'bg-emerald-50 border-emerald-400 shadow-xs ring-1 ring-emerald-400'
              : 'bg-white hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-emerald-700 font-bold mb-1">
            <span>पेमेंट व कोट्स</span>
            <CreditCard className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-black text-slate-900">{paymentCount}</div>
          <span className="text-[10px] text-slate-500">QR जेनरेशन व कलेक्शन</span>
        </div>

        <div
          onClick={() => setFilterType('inventory_adjust')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            filterType === 'inventory_adjust'
              ? 'bg-indigo-50 border-indigo-400 shadow-xs ring-1 ring-indigo-400'
              : 'bg-white hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-indigo-700 font-bold mb-1">
            <span>इन्वेंटरी स्टॉक</span>
            <Boxes className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-black text-slate-900">{inventoryCount}</div>
          <span className="text-[10px] text-slate-500">फोन व स्पेयर पार्ट्स एडजस्टमेंट</span>
        </div>

        <div
          onClick={() => setFilterType('security_auth')}
          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
            filterType === 'security_auth'
              ? 'bg-amber-50 border-amber-400 shadow-xs ring-1 ring-amber-400'
              : 'bg-white hover:bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 font-bold mb-1">
            <span>सुरक्षा व एक्सेस</span>
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="text-xl font-black text-slate-900">{securityCount}</div>
          <span className="text-[10px] text-slate-500">मास्टर टोकन व ऑथेंटिकेशन</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="ऑर्डर नंबर, डिवाइस, मॉडल या एक्शन खोजें..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-indigo-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            सभी ({logs.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('status_update')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterType === 'status_update'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
            }`}
          >
            स्टेटस ({statusCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('payment_change')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterType === 'payment_change'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
            }`}
          >
            पेमेंट ({paymentCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('inventory_adjust')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterType === 'inventory_adjust'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50'
            }`}
          >
            स्टॉक ({inventoryCount})
          </button>
        </div>
      </div>

      {/* Chronological Activity List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-xl">
              🔍
            </div>
            <p className="text-sm font-bold text-slate-700">कोई गतिविधि नहीं मिली</p>
            <p className="text-xs text-slate-400">
              चयनित फ़िल्टर या खोज के लिए कोई लॉग एंट्री उपलब्ध नहीं है।
            </p>
            <button
              type="button"
              onClick={() => {
                setFilterType('all');
                setSearchQuery('');
              }}
              className="mt-2 text-xs text-indigo-600 hover:underline font-bold cursor-pointer"
            >
              फ़िल्टर रीसेट करें
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log, index) => (
              <div
                key={log.id}
                className="p-4 sm:p-4.5 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 group"
              >
                {/* Left Side: Icon + Details */}
                <div className="flex items-start gap-3.5">
                  {/* Category Action Icon */}
                  <div
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs mt-0.5 ${getIconContainerBg(
                      log.iconType
                    )}`}
                  >
                    {getActionIcon(log.iconType)}
                  </div>

                  {/* Text Content */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${log.badgeBg}`}
                      >
                        {log.badgeText}
                      </span>
                      <h5 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-indigo-950 transition-colors">
                        {log.title}
                      </h5>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {log.description}
                    </p>

                    {/* Additional Metadata Card (if present) */}
                    {log.metadata && (
                      <div className="mt-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex flex-wrap items-center gap-3">
                        {log.metadata.orderNumber && (
                          <span>
                            ऑर्डर:{' '}
                            <strong className="font-mono text-slate-900">
                              {log.metadata.orderNumber}
                            </strong>
                          </span>
                        )}
                        {log.metadata.amount !== undefined && (
                          <span>
                            राशि:{' '}
                            <strong className="font-mono text-emerald-700">
                              {formatINR(log.metadata.amount)}
                            </strong>
                          </span>
                        )}
                        {log.metadata.itemName && (
                          <span>
                            आइटम: <strong className="text-slate-900">{log.metadata.itemName}</strong>
                          </span>
                        )}
                        {log.metadata.delta !== undefined && (
                          <span>
                            परिवर्तन:{' '}
                            <strong
                              className={
                                log.metadata.delta > 0 ? 'text-emerald-700' : 'text-rose-700'
                              }
                            >
                              {log.metadata.delta > 0 ? `+${log.metadata.delta}` : log.metadata.delta}
                            </strong>
                          </span>
                        )}
                        {log.metadata.newStock !== undefined && (
                          <span>
                            नया स्टॉक: <strong>{log.metadata.newStock} यूनिट्स</strong>
                          </span>
                        )}
                        {log.metadata.status && (
                          <span className="capitalize">
                            स्थिति: <strong className="text-blue-700">{log.metadata.status}</strong>
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-400">
                      <span>कर्ता: {log.actor}</span>
                      <span>•</span>
                      <span>सूरत हब ऑथेंटिकेटेड</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Timestamp & Order Link Button */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 text-right">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{log.timeFormatted}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    {log.dateFormatted}
                  </span>

                  {log.metadata?.orderId && onSelectOrder && (
                    <button
                      type="button"
                      onClick={() => onSelectOrder(log.metadata!.orderId!)}
                      className="mt-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>ऑर्डर देखें</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
