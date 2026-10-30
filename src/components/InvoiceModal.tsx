import React from 'react';
import { useApp } from '../context/AppContext';
import { OrderItem } from '../types';
import { formatINR } from '../utils/valuation';
import { Printer, Download, X, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react';

export const InvoiceModal: React.FC = () => {
  const { isInvoiceModalOpen, setIsInvoiceModalOpen, selectedInvoiceOrder } = useApp();

  if (!isInvoiceModalOpen || !selectedInvoiceOrder) return null;

  const order = selectedInvoiceOrder;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Modal Top Actions */}
        <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400">
              आधिकारिक रसीद व बिलिंग इनवॉइस
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>प्रिंट / PDF सेव करें</span>
            </button>
            <button
              onClick={() => setIsInvoiceModalOpen(false)}
              className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div id="printable-invoice" className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 text-xs bg-white">
          {/* Company & Invoice Header */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 via-rose-600 to-red-700 text-white flex items-center justify-center font-black text-sm shadow-xs border border-red-400/30">
                  S📱
                </span>
                <span className="text-xl font-black text-slate-900">
                  Sasta<span className="text-red-600">fone</span> Surat
                </span>
                <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full">
                  सस्ताफोन
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Surat Doorstep Mobile Hub • sastaphone.in Official
              </p>
              <p className="text-[11px] text-slate-500">
                GSTIN: 24AATCS8921P1Z4 • Ring Road / Adajan Tech Hub, Surat
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-900">
                {order.type === 'repair' ? 'APPOINTMENT BOOKING SLIP' : order.type === 'pass' ? 'DIGITAL PASS RECEIPT' : 'TAX INVOICE'}
              </span>
              <p className="text-sm font-black text-slate-900 mt-1">#{order.orderNumber}</p>
              <p className="text-[11px] text-slate-500">तारीख: {order.date}</p>
              <p className="text-[11px] text-emerald-700 font-bold">स्थिति: {order.statusHindi}</p>
            </div>
          </div>

          {/* Customer & Technician Details */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                ग्राहक विवरण (Customer Details):
              </span>
              <p className="font-bold text-slate-900 text-sm">{order.customerName}</p>
              <p className="text-slate-600 font-mono">+91 {order.customerPhone}</p>
              <p className="text-slate-600 leading-tight mt-1">{order.fullAddress}</p>
              <p className="font-bold text-blue-600 mt-0.5">📍 {order.locality}</p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                सूरत टेक्नीशियन व विज़िट स्लॉट:
              </span>
              <p className="text-slate-600 font-medium">हेल्पडेस्क: सस्ताफोन सूरत कस्टमर सपोर्ट (+91 9372802044)</p>
              <p className="font-bold text-amber-800 mt-1">स्लॉट: {order.timeSlot}</p>
              <p className="text-[11px] text-emerald-700 font-semibold">पेमेंट मोड: {order.paymentMethod || 'सस्ताफोन पे / सुरक्षित UPI'}</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold text-[11px]">
                  <th className="py-2">सेवा विवरण (Description)</th>
                  <th className="py-2 text-center">प्रकार</th>
                  <th className="py-2 text-right">रकम (Amount)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3">
                    <p className="font-bold text-slate-900">{order.title}</p>
                    <p className="text-[11px] text-slate-500">{order.subtitle}</p>
                  </td>
                  <td className="py-3 text-center uppercase text-[10px] font-bold text-slate-500">
                    {order.type}
                  </td>
                  <td className="py-3 text-right font-black text-slate-900">
                    {formatINR(order.amount)}
                  </td>
                </tr>

                {order.type === 'repair' && (
                  <>
                    <tr className="text-emerald-700 bg-emerald-50/50">
                      <td className="py-2 px-1 text-[11px]">
                        ✓ फोन रिपेयर होने पर 100% एडजस्टमेंट
                      </td>
                      <td className="py-2 text-center text-[10px] font-bold">क्रेडिट</td>
                      <td className="py-2 text-right font-bold">-₹199 (बिल में)</td>
                    </tr>
                    <tr className="text-amber-700 bg-amber-50/50">
                      <td className="py-2 px-1 text-[11px]">
                        ✓ फोन न बन पाने पर रिफंड गारंटी
                      </td>
                      <td className="py-2 text-center text-[10px] font-bold">रिफंड</td>
                      <td className="py-2 text-right font-bold">₹99 रिफंडेबल</td>
                    </tr>
                  </>
                )}
                {order.type === 'pass' && (
                  <tr className="text-emerald-700 bg-emerald-50/50">
                    <td className="py-2 px-1 text-[11px]">
                      ✓ 100% वेरिफाइड ऑलइंडिया डिजिटल पास • संपर्क अनलॉक एक्टिव
                    </td>
                    <td className="py-2 text-center text-[10px] font-bold">एक्टिव</td>
                    <td className="py-2 text-right font-bold">सत्यापित</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Total & Policy Notice */}
          <div className="pt-3 border-t-2 border-slate-900 flex justify-between items-start">
            <div className="max-w-xs space-y-1 text-[10px] text-slate-500">
              <p className="font-bold text-slate-800">नियम व गारंटी शर्तें:</p>
              <p>
                1. रिपेयरिंग पार्ट्स चार्ज फोन जांच के बाद तय होगा।<br />
                2. फोन रिपेयर होने पर यह ₹199 आपके फाइनल बिल में कम कर दिया जाएगा।<br />
                3. यदि फोन रिपेयर नहीं हो सका, तो ₹99 तुरंत UPI पर रिफंड कर दिया जाएगा।
              </p>
            </div>

            <div className="text-right space-y-1">
              <span className="text-[11px] text-slate-500">कुल भुगतान (Total Paid):</span>
              <p className="text-2xl font-black text-blue-700">{formatINR(order.amount)}</p>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                VERIFIED PAYMENT
              </span>
            </div>
          </div>

          {/* Footer Signatures & Stamp */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                <QrCode className="w-8 h-8 text-slate-800" />
              </div>
              <div className="text-[10px] text-slate-500">
                <p className="font-bold text-slate-700">डिजिटल सूरत सील</p>
                <p>Authenticity ID: STP-AUTH-{order.orderNumber.replace(/[^0-9]/g, '')}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="font-script text-base text-blue-800 font-bold">Sanjay Prajapati</div>
              <p className="text-[10px] text-slate-500 border-t border-slate-300 pt-0.5">
                अधिकृत हस्ताक्षर (Surat Hub Manager)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
