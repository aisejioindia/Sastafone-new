import React, { useState } from 'react';
import { SeoHead } from './SeoHead';
import { db } from '../firebase';
import { collection, query, where, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { trackEvent } from '../utils/analytics';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Wrench,
  ArrowRight,
  Phone,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface WarrantyPageProps {
  onNavigateHome: () => void;
  onNavigateOrders: () => void;
}

export const WarrantyPage: React.FC<WarrantyPageProps> = ({
  onNavigateHome,
  onNavigateOrders
}) => {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Found Invoice / Job Details
  const [foundWarranty, setFoundWarranty] = useState<{
    invoiceNumber: string;
    date: string;
    customerName: string;
    customerPhone: string;
    brand: string;
    model: string;
    imei: string;
    services: string[];
    finalTotal: number;
    warrantyMonths: number;
    expiryDate: string;
    isCovered: boolean;
    jobId?: string;
  } | null>(null);

  // Claim Form state
  const [isClaimFormOpen, setIsClaimFormOpen] = useState(false);
  const [claimIssueText, setClaimIssueText] = useState('');
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [claimSuccessNote, setClaimSuccessNote] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    setFoundWarranty(null);
    setClaimSuccessNote(null);

    const cleanInvoice = invoiceNumber.trim().toUpperCase();
    const cleanPhone = mobileNumber.replace(/\D/g, '');

    if (!cleanInvoice || cleanPhone.length < 10) {
      setSearchError('कृपया सही इनवॉइस नंबर और 10-अंकीय मोबाइल नंबर दर्ज करें।');
      return;
    }

    setIsSearching(true);

    try {
      // 1. Try finding in 'invoices' collection
      let matchFound = false;
      const invRef = collection(db, 'invoices');
      const qInv = query(invRef, where('invoiceNumber', '==', cleanInvoice), limit(1));
      const invSnap = await getDocs(qInv);

      if (!invSnap.empty) {
        const invData = invSnap.docs[0].data();
        if (invData.customerPhone && invData.customerPhone.includes(cleanPhone)) {
          const createdAt = new Date(invData.date || invData.createdAt);
          const expiry = new Date(createdAt);
          expiry.setMonth(expiry.getMonth() + (invData.warrantyMonths || 6));
          const isCovered = (invData.finalTotal >= 1000) && (new Date() <= expiry);

          setFoundWarranty({
            invoiceNumber: invData.invoiceNumber,
            date: createdAt.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            customerName: invData.customerName,
            customerPhone: invData.customerPhone,
            brand: invData.brand,
            model: invData.model,
            imei: invData.imei || 'सत्यापित',
            services: invData.services?.map((s: any) => s.name || s) || ['मोबाइल रिपेयरिंग'],
            finalTotal: invData.finalTotal || 0,
            warrantyMonths: invData.warrantyMonths || 6,
            expiryDate: expiry.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            isCovered,
            jobId: invData.jobId
          });
          matchFound = true;
        }
      }

      // 2. If not found in 'invoices', check 'jobs' by jobId or phone
      if (!matchFound) {
        const jobsRef = collection(db, 'jobs');
        const qJob = query(jobsRef, where('phone', '==', cleanPhone), limit(3));
        const jobSnap = await getDocs(qJob);

        if (!jobSnap.empty) {
          const matchingDoc = jobSnap.docs.find(d => {
            const data = d.data();
            return d.id.toUpperCase().includes(cleanInvoice) || (data.jobId && data.jobId.toUpperCase().includes(cleanInvoice));
          }) || jobSnap.docs[0];

          const jData = matchingDoc.data();
          const createdAt = new Date(jData.createdAt || Date.now());
          const expiry = new Date(createdAt);
          const warrantyMonths = (jData.finalPrice || jData.estMax || 0) >= 1000 ? 6 : 0;
          expiry.setMonth(expiry.getMonth() + warrantyMonths);
          const isCovered = warrantyMonths > 0 && (new Date() <= expiry);

          setFoundWarranty({
            invoiceNumber: cleanInvoice,
            date: createdAt.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            customerName: jData.name || 'ग्राहक',
            customerPhone: jData.phone,
            brand: jData.brand,
            model: jData.model,
            imei: jData.qc?.imei || 'सत्यापित',
            services: jData.finalServices || jData.services || ['पार्ट्स रिपेयरिंग'],
            finalTotal: jData.finalPrice || jData.estMax || 1200,
            warrantyMonths,
            expiryDate: expiry.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            isCovered,
            jobId: matchingDoc.id
          });
          matchFound = true;
        }
      }

      trackEvent('warranty_lookup', { found: matchFound });

      if (!matchFound) {
        setSearchError('इस इनवॉइस नंबर व मोबाइल नंबर के लिए कोई रिकॉर्ड नहीं मिला। कृपया अपने बिल पर छपा इनवॉइस नंबर जांचें।');
      }
    } catch (err: any) {
      console.warn('Warranty search error:', err);
      setSearchError('खोज के दौरान समस्या आई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimIssueText.trim() || !foundWarranty) return;

    setIsSubmittingClaim(true);
    setSearchError(null);

    try {
      const claimPayload = {
        invoiceNumber: foundWarranty.invoiceNumber,
        customerName: foundWarranty.customerName,
        phone: foundWarranty.customerPhone,
        customerPhone: foundWarranty.customerPhone,
        brand: foundWarranty.brand,
        model: foundWarranty.model,
        imei: foundWarranty.imei,
        issue: claimIssueText.trim(),
        issueDescription: claimIssueText.trim(),
        jobId: foundWarranty.jobId || foundWarranty.invoiceNumber,
        status: 'Received',
        createdAt: new Date().toISOString(),
        timestamp: serverTimestamp()
      };

      const claimRef = await addDoc(collection(db, 'warrantyClaims'), claimPayload);

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setClaimSuccessNote(`✓ वारंटी क्लेम अनुरोध #${claimRef.id.slice(-6).toUpperCase()} दर्ज कर लिया गया है। हमारे सर्टिफाइड टेक्नीशियन प्राथमिकता के साथ आपसे संपर्क करेंगे।`);
      setIsClaimFormOpen(false);
      setClaimIssueText('');
    } catch (err: any) {
      setSearchError('वारंटी क्लेम दर्ज करने में समस्या आई। कृपया सीधे हेल्पलाइन पर संपर्क करें।');
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  return (
    <div className="bg-white min-h-screen py-8">
      <SeoHead
        title="वारंटी जांचें व क्लेम करें – 6 महीने रिपेयर वारंटी | Sastafone Surat"
        description="Sastafone Surat पर अपने रिपेयरिंग बिल की 6 महीने की वारंटी जांचें या क्लेम करें। ₹1000+ के बिल पर बदले गए पार्ट्स पर 6 महीने वारंटी।"
        canonicalPath="/warranty"
      />

      <div className="container mx-auto px-4 max-w-3xl">
        {/* Top Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF2F2] border border-red-200 text-[#D5151B] text-xs font-bold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sastafone Certified Warranty Protection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#132032] tracking-tight mb-2">
            वारंटी स्थिति जांचें व क्लेम करें
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
            सूरत में ₹1000 या अधिक के रिपेयरिंग बिल पर बदले गए पार्ट्स पर 6 महीने की वारंटी दी जाती है।
          </p>
        </div>

        {/* Warranty Lookup Form */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs mb-8">
          <h2 className="text-base font-bold text-[#132032] mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#D5151B]" />
            <span>इनवॉइस नंबर से वारंटी खोजें</span>
          </h2>

          <form onSubmit={handleLookup} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  इनवॉइस नंबर (Invoice #)
                </label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="उदा. SST-202611-001 या Job ID"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-xs sm:text-sm uppercase font-mono outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  रजिस्टर्ड मोबाइल नंबर
                </label>
                <div className="flex rounded-xl border border-gray-200 overflow-hidden focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500">
                  <span className="px-3 py-2 bg-gray-50 text-gray-600 text-xs font-bold border-r border-gray-200 flex items-center">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10 अंकों का मोबाइल"
                    className="w-full px-3 py-2 text-xs sm:text-sm font-mono outline-none"
                    maxLength={10}
                    required
                  />
                </div>
              </div>
            </div>

            {searchError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSearching}
              className="w-full py-3 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50 tap-target"
            >
              {isSearching ? (
                <span>वारंटी खोजी जा रही है...</span>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>वारंटी जांचें (Check Status)</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Claim Success Notification */}
        {claimSuccessNote && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-1">
            <p className="font-bold text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>क्लेम सफलतापूर्वक दर्ज हुआ</span>
            </p>
            <p>{claimSuccessNote}</p>
          </div>
        )}

        {/* Found Warranty Card */}
        {foundWarranty && (
          <div className="p-6 rounded-2xl bg-[#FEF2F2] border border-red-200 text-[#132032] mb-8 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-200/80 pb-4 mb-4">
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                  इनवॉइस नंबर: {foundWarranty.invoiceNumber}
                </span>
                <h3 className="text-lg font-bold text-[#132032]">
                  {foundWarranty.brand} {foundWarranty.model}
                </h3>
                <p className="text-xs text-gray-600">
                  ग्राहक: {foundWarranty.customerName} (+91 {foundWarranty.customerPhone})
                </p>
              </div>

              <div>
                {foundWarranty.isCovered ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>वारंटी सक्रिय (Active)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-200 text-gray-700 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>वारंटी समाप्त / लागू नहीं</span>
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
              <div>
                <span className="text-gray-500 block text-[11px]">रिपेयरिंग तारीख:</span>
                <strong className="text-[#132032]">{foundWarranty.date}</strong>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">वारंटी अवधि:</span>
                <strong className="text-[#132032]">{foundWarranty.warrantyMonths} महीने</strong>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">वारंटी अंतिम तिथि:</span>
                <strong className="text-[#132032]">{foundWarranty.expiryDate}</strong>
              </div>
              <div>
                <span className="text-gray-500 block text-[11px]">कुल बिल राशि:</span>
                <strong className="text-[#132032]">₹{foundWarranty.finalTotal}</strong>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-red-100 text-xs mb-4">
              <span className="font-bold text-gray-800 block mb-1">कवर किए गए पार्ट्स व सेवाएं:</span>
              <ul className="list-disc list-inside space-y-0.5 text-gray-600">
                {foundWarranty.services.map((srv, idx) => (
                  <li key={idx}>{srv}</li>
                ))}
              </ul>
            </div>

            {/* Claim Warranty Action Button */}
            {foundWarranty.isCovered && !isClaimFormOpen && (
              <button
                type="button"
                onClick={() => setIsClaimFormOpen(true)}
                className="w-full py-2.5 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 tap-target"
              >
                <Wrench className="w-4 h-4" />
                <span>इस रिपेयर पर वारंटी क्लेम करें</span>
              </button>
            )}

            {/* Interactive Claim Form */}
            {isClaimFormOpen && (
              <form onSubmit={handleClaimSubmit} className="mt-4 pt-4 border-t border-red-200 space-y-3">
                <h4 className="text-xs font-bold text-[#132032]">
                  वारंटी क्लेम विवरण (समस्या बताएं):
                </h4>
                <textarea
                  value={claimIssueText}
                  onChange={(e) => setClaimIssueText(e.target.value)}
                  placeholder="कृपया बताएं कि बदले गए पार्ट में क्या समस्या आ रही है (उदा. टच स्क्रीन ठीक से काम नहीं कर रही)..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-gray-300 text-xs outline-none focus:border-red-500 bg-white"
                  required
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsClaimFormOpen(false)}
                    className="flex-1 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold cursor-pointer"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingClaim}
                    className="flex-1 py-2 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingClaim ? 'दर्ज हो रहा है...' : 'क्लेम सबमिट करें'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Clear Policy Breakdown */}
        <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
          <h2 className="text-sm font-bold text-[#132032] flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#D5151B]" />
            <span>Sastafone वारंटी नियम व शर्तें (Warranty Policy)</span>
          </h2>

          <div className="space-y-2 text-xs text-gray-600 leading-relaxed">
            <p>
              • <strong>कवरेज:</strong> वारंटी केवल इनवॉइस पर उल्लेखित बदले गए या रिपेयर किए गए पार्ट्स पर लागू होती है।
            </p>
            <p>
              • <strong>न्यूनतम सीमा:</strong> 6 महीने की वारंटी केवल ₹1000 या उससे अधिक के कुल बिल पर मान्य है।
            </p>
            <p>
              • <strong>बहिष्कार (Exclusions):</strong> पानी या किसी भी प्रकार का तरल डैमेज (Liquid damage), फोन गिरने या दबने से हुआ फिजिकल डैमेज (Screen crack/dent), या किसी अनधिकृत दुकान पर खुला हुआ फोन वारंटी में शामिल नहीं है।
            </p>
            <p>
              • <strong>मुफ़्त पिकअप:</strong> वैध वारंटी क्लेम के लिए दोबारा कोई विज़िट शुल्क नहीं लिया जाता।
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
