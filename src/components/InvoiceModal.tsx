import React from 'react';
import { useApp } from '../context/AppContext';
import { SastafoneLogo } from './SastafoneLogo';
import { Printer, Download, X, ShieldCheck, CheckCircle2, QrCode, MessageCircle } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../data/mockData';

export const InvoiceModal: React.FC = () => {
  const { isInvoiceModalOpen, setIsInvoiceModalOpen, selectedInvoiceOrder } = useApp();

  if (!isInvoiceModalOpen || !selectedInvoiceOrder) return null;

  const order = selectedInvoiceOrder;
  const isEligibleWarranty = (order.amount || 0) >= 1000;

  const invoiceDate = new Date(order.date || Date.now());
  const expiryDate = new Date(invoiceDate);
  expiryDate.setMonth(expiryDate.getMonth() + 6);

  const handlePrint = () => {
    window.print();
  };

  const shareText = encodeURIComponent(
    `नमस्ते! Sastafone Surat रिपेयरिंग इनवॉइस #${order.orderNumber}\nडिवाइस: ${order.title}\nकुल भुगतान: ₹${order.amount}\nवारंटी: 6 महीने (शर्तें लागू)\nजांचें: https://sastafone.in/warranty`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-gray-200 flex flex-col max-h-[92vh]">
        {/* Modal Top Actions */}
        <div className="p-3.5 bg-gray-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-200">
              आधिकारिक इनवॉइस व वारंटी कार्ड
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/?text=${shareText}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp शेयर</span>
            </a>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट / PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setIsInvoiceModalOpen(false)}
              className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div id="printable-invoice" className="p-6 sm:p-8 overflow-y-auto space-y-6 text-gray-800 text-xs bg-white">
          {/* Company & Invoice Header */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-4 border-b border-gray-200">
            <div>
              <SastafoneLogo variant="light" size="sm" showSubtitle={false} />
              <p className="text-[11px] text-gray-500 mt-1.5 font-medium">
                Sastafone Certified Technician Network • Surat, Gujarat
              </p>
              <p className="text-[11px] text-gray-500">
                ईमेल: support@sastafone.in • समय: सुबह 9:00 AM – 9:30 PM
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-red-100 text-[#DC2626]">
                TAX INVOICE & WARRANTY
              </span>
              <p className="text-sm font-black text-gray-900 mt-1">#{order.orderNumber}</p>
              <p className="text-[11px] text-gray-500">तारीख: {order.date}</p>
              <p className="text-[11px] text-emerald-700 font-bold">स्थिति: {order.statusHindi || 'सत्यापित'}</p>
            </div>
          </div>

          {/* Customer & Device Details */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-200">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                ग्राहक विवरण (Customer Details):
              </span>
              <p className="font-bold text-gray-900 text-sm">{order.customerName}</p>
              <p className="text-gray-600 font-mono">+91 {order.customerPhone}</p>
              <p className="text-gray-600 leading-tight mt-1">{order.fullAddress || order.locality}</p>
              <p className="font-bold text-[#DC2626] mt-0.5">📍 {order.locality}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                डिवाइस व सेवा स्लॉट:
              </span>
              <p className="font-bold text-gray-900">{order.title}</p>
              <p className="text-gray-600 text-[11px]">सेवा: {order.subtitle}</p>
              <p className="text-gray-600 mt-1">स्लॉट: {order.timeSlot}</p>
              <p className="text-[11px] text-emerald-700 font-semibold">
                पेमेंट मोड: {order.paymentMethod || 'ऑनलाइन सत्यापन (Verified)'}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 font-bold text-[11px]">
                  <th className="py-2">सेवा / पार्ट विवरण</th>
                  <th className="py-2 text-center">प्रकार</th>
                  <th className="py-2 text-right">रकम (Amount)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-3">
                    <p className="font-bold text-gray-900">{order.title}</p>
                    <p className="text-[11px] text-gray-500">{order.subtitle}</p>
                  </td>
                  <td className="py-3 text-center uppercase text-[10px] font-bold text-gray-500">
                    {order.type}
                  </td>
                  <td className="py-3 text-right font-black text-gray-900">
                    ₹{order.amount}
                  </td>
                </tr>

                {order.type === 'repair' && (
                  <tr className="text-emerald-700 bg-emerald-50/50">
                    <td className="py-2 px-1 text-[11px]">
                      ✓ विज़िट टोकन 100% फाइनल बिल में एडजस्टेड
                    </td>
                    <td className="py-2 text-center text-[10px] font-bold">एडजस्ट</td>
                    <td className="py-2 text-right font-bold">-₹199</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Warranty Card Section (bills >= ₹1000) */}
          <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-red-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#DC2626]" />
                <span className="text-xs font-bold text-gray-900">
                  {isEligibleWarranty ? '6 महीने की सीमित रिपेयर वारंटी कार्ड' : 'Sastafone रिपेयरिंग गारंटी'}
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#DC2626] border border-red-200">
                {isEligibleWarranty ? 'वारंटी वैध' : 'मानक टेस्टिंग'}
              </span>
            </div>

            <p className="text-[11px] text-gray-600 leading-relaxed">
              {isEligibleWarranty
                ? `यह वारंटी इनवॉइस तारीख से 6 महीने (${expiryDate.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' })}) तक केवल बदले गए पार्ट्स पर लागू है। फिजिकल ड्रॉप या लिक्विड डैमेज शामिल नहीं है।`
                : '₹1000 से कम के बिलों पर 7 दिन की टेस्टिंग रिप्लेसमेंट गारंटी लागू होती है।'}
            </p>
          </div>

          {/* Total & Summary */}
          <div className="pt-3 border-t-2 border-gray-900 flex justify-between items-start">
            <div className="max-w-xs space-y-1 text-[10px] text-gray-500">
              <p className="font-bold text-gray-800">वारंटी क्लेम करने का तरीका:</p>
              <p>
                sastafone.in/warranty पर जाकर अपना इनवॉइस नंबर #{order.orderNumber} और मोबाइल नंबर दर्ज करें।
              </p>
            </div>

            <div className="text-right space-y-1">
              <span className="text-[11px] text-gray-500">कुल भुगतान (Total Paid):</span>
              <p className="text-2xl font-black text-[#DC2626]">₹{order.amount}</p>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                VERIFIED PAYMENT
              </span>
            </div>
          </div>

          {/* Footer Digital Stamp */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <QrCode className="w-6 h-6 text-gray-800" />
              </div>
              <div className="text-[10px] text-gray-500">
                <p className="font-bold text-gray-700">सूरत डिजिटल मुहर</p>
                <p>Authenticity ID: SST-VERIFIED-{order.orderNumber.slice(-6)}</p>
              </div>
            </div>

            <div className="text-right text-[10px] text-gray-500">
              <p className="font-bold text-gray-800">Sastafone Certified Network</p>
              <p>Surat, Gujarat</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
