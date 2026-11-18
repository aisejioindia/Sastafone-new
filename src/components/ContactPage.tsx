import React, { useEffect, useMemo, useState } from 'react';
import {
  Phone,
  MessageCircle,
  Mail,
  Clock,
  MapPin,
  Instagram,
  Star,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Send,
  AlertCircle,
  RefreshCw,
  Wrench
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SeoHead } from './SeoHead';
import { GoogleMapEmbed } from './GoogleMapEmbed';
import {
  buildWhatsappHref,
  normalizeTelHref,
  INSTAGRAM_URL,
  GOOGLE_MAPS_URL
} from '../services/siteSettingsService';
import { getRepairPricesFromFirestore, getAvailableSlots } from '../services/firestoreRepairService';
import { RepairPrice, Slot } from '../types';
import { SURAT_LOCALITIES } from '../data/mockData';
import {
  WEB3FORMS_ACCESS_KEY,
  WEB3FORMS_ENDPOINT,
  buildPaymentLinkUrl,
  submitToWeb3Forms
} from '../services/web3formsService';
import { PaymentLinkQrCard } from './PaymentLinkQrCard';
import { trackEvent } from '../utils/analytics';

interface ContactPageProps {
  onNavigateHome: () => void;
  onBookRepair: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({
  onNavigateHome,
  onBookRepair
}) => {
  const { siteSettings, language, user, selectedLocality } = useApp();

  // Web3Forms Inquiry Form State
  const [repairPrices, setRepairPrices] = useState<RepairPrice[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [inqName, setInqName] = useState(user.name || '');
  const [inqPhone, setInqPhone] = useState(user.phone || '');
  const [inqEmail, setInqEmail] = useState(user.email || '');
  const [inqService, setInqService] = useState<'repair' | 'sell' | 'buy' | 'warranty'>('repair');
  const [inqModel, setInqModel] = useState('Apple iPhone 14');
  const [inqIssueIds, setInqIssueIds] = useState<string[]>(['display']);
  const [inqArea, setInqArea] = useState(selectedLocality.split(',')[0].trim() || 'Adajan');
  const [inqSlotDate, setInqSlotDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [inqSlotWindow, setInqSlotWindow] = useState('10:00 AM - 01:00 PM');
  const [inqMessage, setInqMessage] = useState('');
  const [isSubmittingInq, setIsSubmittingInq] = useState(false);
  const [inqError, setInqError] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  useEffect(() => {
    getRepairPricesFromFirestore().then((list) => {
      setRepairPrices(list.filter((p) => p.active !== false));
    });
  }, []);

  useEffect(() => {
    getAvailableSlots(inqArea, inqSlotDate).then((list) => {
      setSlots(list);
      const avail = list.find((s) => s.capacity - s.booked > 0);
      if (avail) setInqSlotWindow(avail.window);
    });
  }, [inqArea, inqSlotDate]);

  const selectedIssues = useMemo(
    () => repairPrices.filter((p) => inqIssueIds.includes(p.id)),
    [repairPrices, inqIssueIds]
  );

  const dynamicPricingText = useMemo(() => {
    if (inqService !== 'repair' || selectedIssues.length === 0) {
      return inqService === 'sell'
        ? 'ऑन-साइट QC अनुसार सर्वोत्तम बाय-बैक मूल्य'
        : inqService === 'buy'
        ? '₹499 रिफंडेबल बुकिंग टोकन'
        : 'वारंटी जांच / सपोर्ट अनुरोध';
    }
    const min = selectedIssues.reduce((acc, s) => acc + s.minPrice, 0);
    const max = selectedIssues.reduce((acc, s) => acc + s.maxPrice, 0);
    return `₹${min} – ₹${max} (+ ₹199 विज़िट टोकन बिल में एडजस्ट)`;
  }, [inqService, selectedIssues]);

  const serviceDisplayLabel =
    inqService === 'repair'
      ? 'डोरस्टेप मोबाइल रिपेयर'
      : inqService === 'sell'
      ? 'पुराना फोन बेचें (Sell Phone)'
      : inqService === 'buy'
      ? 'सर्टिफाइड फोन खरीदें (Buy Phone)'
      : 'वारंटी सहायता (Warranty Support)';

  const problemsDisplayLabel =
    inqService === 'repair' && selectedIssues.length > 0
      ? selectedIssues.map((s) => `${s.name_hi} (₹${s.minPrice}-₹${s.maxPrice})`).join(', ')
      : inqMessage.trim() || 'जनरल इंक्वायरी / मॉडल जांच';

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInqError(null);

    if (!inqName.trim() || inqPhone.replace(/\D/g, '').length < 10) {
      setInqError('कृपया अपना नाम और वैध 10-अंकों का मोबाइल नंबर दर्ज करें।');
      return;
    }

    setIsSubmittingInq(true);
    const refId = `INQ-SST-${Date.now().toString().slice(-6)}`;
    const tokenAmount = inqService === 'buy' ? 499 : 199;

    const res = await submitToWeb3Forms({
      formType: 'contact_inquiry',
      subject: `Sastafone Service Inquiry [${refId}]: ${inqModel}`,
      name: inqName.trim(),
      phone: inqPhone.trim(),
      email: inqEmail.trim() || undefined,
      service: serviceDisplayLabel,
      model: inqModel.trim() || 'Not specified',
      problems: problemsDisplayLabel,
      dynamicPricing: dynamicPricingText,
      visitTokenAmount: tokenAmount,
      slotDate: inqSlotDate,
      slotWindow: inqSlotWindow,
      area: inqArea,
      referenceId: refId,
      paymentStatus: 'Pending Token Payment Confirmation',
      paymentLink: buildPaymentLinkUrl(refId, tokenAmount),
      message: inqMessage.trim()
    });

    setIsSubmittingInq(false);
    if (!res.success) {
      setInqError(res.message || 'सबमिशन में त्रुटि आई। कृपया पुनः प्रयास करें।');
      return;
    }
    setSubmittedRef(refId);
  };

  const whatsappHref = buildWhatsappHref(
    siteSettings.whatsappNumber,
    'नमस्ते Sastafone Surat टीम! मुझे डोरस्टेप मोबाइल रिपेयर / सेवा के बारे में बात करनी है।'
  );
  const telHref = normalizeTelHref(siteSettings.supportPhone);
  const instagramHref = siteSettings.instagramUrl || INSTAGRAM_URL;
  const mapsHref = siteSettings.googleMapsUrl || GOOGLE_MAPS_URL;
  const googleReviewUrl = siteSettings.googleReviewUrl;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Sastafone',
    url: 'https://sastafone.in/contact',
    logo: 'https://sastafone.in/assets/logo-wordmark.png',
    image: 'https://sastafone.in/og-image.png',
    telephone: siteSettings.supportPhone,
    email: siteSettings.supportEmail,
    hasMap: mapsHref,
    sameAs: [instagramHref, mapsHref],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Surat',
      addressRegion: 'Gujarat',
      postalCode: '395001',
      addressCountry: 'IN'
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '09:00',
        closes: '21:30'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white pt-4 pb-24">
      <SeoHead
        title="Contact Sastafone Surat – Doorstep Mobile Repair & Support"
        description="सूरत में Sastafone डोरस्टेप मोबाइल रिपेयर से संपर्क करें। कॉल, WhatsApp, सपोर्ट ईमेल support@sastafone.in, Instagram और Google Maps लोकेशन।"
        canonicalPath="/contact"
        jsonLd={jsonLd}
      />

      <div className="container mx-auto px-4 max-w-4xl space-y-6">
        <button
          type="button"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#D5151B] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>होम पर लौटें</span>
        </button>

        {/* Contact Header Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#FEF2F2] border border-red-200 space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D5151B]">
            <ShieldCheck className="w-4 h-4" />
            <span>Sastafone Certified Technician Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#132032] tracking-tight">
            {language === 'hi'
              ? 'संपर्क करें – Sastafone Surat'
              : 'Contact Sastafone Surat'}
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
            सूरत में डोरस्टेप पिकअप, रिपेयरिंग स्टेटस, वारंटी सहायता या पुराना फोन बेचने के लिए सीधे कॉल या WhatsApp करें।
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('whatsapp_click', { source: 'contact_page' })}
              className="px-5 py-3 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white text-sm font-bold inline-flex items-center gap-2 transition-colors duration-150 shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp पर चैट करें</span>
            </a>

            <a
              href={telHref}
              onClick={() => trackEvent('call_click', { source: 'contact_page' })}
              className="px-5 py-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-[#132032] text-sm font-bold inline-flex items-center gap-2 transition-colors duration-150"
            >
              <Phone className="w-4 h-4 text-[#D5151B]" />
              <span>कॉल करें ({siteSettings.supportPhone})</span>
            </a>
          </div>
        </div>

        {/* Contact Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-3">
            <h2 className="text-base font-bold text-[#132032]">संपर्क विवरण</h2>
            <div className="space-y-3 text-xs sm:text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#D5151B] mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-[#132032]">सपोर्ट फोन</p>
                  <a
                    href={telHref}
                    onClick={() => trackEvent('call_click', { source: 'contact_card' })}
                    className="text-[#D5151B] hover:underline tabular-nums"
                  >
                    {siteSettings.supportPhone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#D5151B] mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-[#132032]">ईमेल सहायता</p>
                  <a href={`mailto:${siteSettings.supportEmail}`} className="text-[#D5151B] hover:underline">
                    {siteSettings.supportEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#D5151B] mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-[#132032]">कार्य समय (Working Hours)</p>
                  <p className="text-gray-600">{siteSettings.businessHours}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#D5151B] mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-[#132032]">सेवा क्षेत्र</p>
                  <p className="text-gray-600">
                    अडाजण, वेसु, पाल, वराछा, कतारगाम, पिपलोद, सिटीलाइट, घोड दोड रोड व पूरा सूरत शहर।
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-4">
            <h2 className="text-base font-bold text-[#132032]">सोशल व लोकेशन लिंक</h2>
            <div className="space-y-2.5">
              <a
                href={instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 hover:bg-[#FEF2F2] border border-gray-200 text-sm font-bold text-[#132032] flex items-center justify-between transition-colors duration-150"
              >
                <span className="flex items-center gap-2.5">
                  <Instagram className="w-4 h-4 text-[#D5151B]" />
                  <span>Instagram (@sastafone.in)</span>
                </span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>

              <a
                href={mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('google_maps_click', { source: 'contact_page' })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 hover:bg-[#FEF2F2] border border-gray-200 text-sm font-bold text-[#132032] flex items-center justify-between transition-colors duration-150"
              >
                <span className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-[#D5151B]" />
                  <span>Google Maps लोकेशन देखें</span>
                </span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>

              {googleReviewUrl && (
                <a
                  href={googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent('google_review_click', { source: 'contact_page' })}
                  className="w-full px-4 py-3 rounded-xl bg-[#FEF2F2] hover:bg-red-100/70 border border-red-200 text-sm font-bold text-[#D5151B] flex items-center justify-between transition-colors duration-150"
                >
                  <span className="flex items-center gap-2.5">
                    <Star className="w-4 h-4 text-[#D5151B]" />
                    <span>Google पर समीक्षा दें (Review us on Google)</span>
                  </span>
                  <ExternalLink className="w-4 h-4 text-[#D5151B]" />
                </a>
              )}

              <button
                type="button"
                onClick={onBookRepair}
                className="w-full py-3 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white text-sm font-bold transition-colors duration-150 cursor-pointer"
              >
                डोरस्टेप रिपेयर बुक करें (₹199)
              </button>
            </div>
          </div>
        </div>

        {/* Web3Forms Service Inquiry & Dynamic Estimate Form + Payment Link / QR */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FEF2F2] text-[#D5151B] text-[11px] font-bold border border-red-200 mb-1">
                <Wrench className="w-3 h-3" />
                <span>तुरंत इंक्वायरी व स्लॉट बुकिंग</span>
              </span>
              <h2 className="text-lg font-bold text-[#132032]">
                अपनी समस्या, मॉडल व स्लॉट चुनकर कोटेशन व पेमेंट लिंक प्राप्त करें
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-gray-500 block uppercase font-bold">डायनेमिक एस्टीमेट</span>
              <span className="text-sm font-bold text-[#D5151B] tabular-nums">{dynamicPricingText}</span>
            </div>
          </div>

          {submittedRef ? (
            <div className="space-y-4">
              <PaymentLinkQrCard
                referenceId={submittedRef}
                amount={inqService === 'buy' ? 499 : 199}
                serviceLabel={serviceDisplayLabel}
                deviceModel={inqModel}
                problemsLabel={problemsDisplayLabel}
                dynamicPricingLabel={dynamicPricingText}
                slotLabel={`${inqSlotDate} (${inqSlotWindow}) • ${inqArea}`}
                whatsappNumber={siteSettings.whatsappNumber}
                onPayViaRazorpay={onBookRepair}
              />
              <button
                type="button"
                onClick={() => setSubmittedRef(null)}
                className="text-xs font-bold text-[#D5151B] hover:underline cursor-pointer"
              >
                + नई इंक्वायरी भेजें
              </button>
            </div>
          ) : (
            <form
              action={WEB3FORMS_ENDPOINT}
              method="POST"
              onSubmit={handleInquirySubmit}
              className="space-y-4 text-xs"
            >
              <input type="hidden" name="access_key" value={WEB3FORMS_ACCESS_KEY} />
              <input type="hidden" name="service" value={serviceDisplayLabel} />
              <input type="hidden" name="dynamic_pricing" value={dynamicPricingText} />
              <input type="hidden" name="problems" value={problemsDisplayLabel} />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">आपका नाम *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={inqName}
                    onChange={(e) => setInqName(e.target.value)}
                    placeholder="उदा. राहुल पटेल"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#D5151B] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">मोबाइल नंबर *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={inqPhone}
                    onChange={(e) => setInqPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10 अंकों का नंबर"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-mono focus:border-[#D5151B] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">ईमेल (वैकल्पिक)</label>
                  <input
                    type="email"
                    name="email"
                    value={inqEmail}
                    onChange={(e) => setInqEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#D5151B] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">सर्विस चुनें *</label>
                  <select
                    value={inqService}
                    onChange={(e) => setInqService(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-[#D5151B] outline-none font-bold"
                  >
                    <option value="repair">डोरस्टेप मोबाइल रिपेयर (₹199 विज़िट टोकन)</option>
                    <option value="sell">पुराना फोन बेचें (Sell Old Phone)</option>
                    <option value="buy">सर्टिफाइड फोन खरीदें (₹499 बुकिंग टोकन)</option>
                    <option value="warranty">वारंटी क्लेम / सहायता</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">फ़ोन ब्रांड व मॉडल *</label>
                  <input
                    type="text"
                    name="model"
                    required
                    value={inqModel}
                    onChange={(e) => setInqModel(e.target.value)}
                    placeholder="उदा. Apple iPhone 14, Samsung S23"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#D5151B] outline-none"
                  />
                </div>
              </div>

              {inqService === 'repair' && repairPrices.length > 0 && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1.5">
                    समस्या चुनें (लाइव कीमत के लिए एक या अधिक चुनें):
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 rounded-xl bg-gray-50 border border-gray-200">
                    {repairPrices.map((p) => {
                      const active = inqIssueIds.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() =>
                            setInqIssueIds((prev) =>
                              prev.includes(p.id)
                                ? prev.length === 1
                                  ? prev
                                  : prev.filter((id) => id !== p.id)
                                : [...prev, p.id]
                            )
                          }
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer transition-colors ${
                            active
                              ? 'bg-[#D5151B] text-white border-[#D5151B]'
                              : 'bg-white text-[#132032] border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {p.name_hi} (₹{p.minPrice}–₹{p.maxPrice})
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">सूरत इलाका *</label>
                  <select
                    name="area"
                    value={inqArea}
                    onChange={(e) => setInqArea(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-[#D5151B] outline-none"
                  >
                    {SURAT_LOCALITIES.map((loc) => (
                      <option key={loc.id} value={loc.name}>
                        {loc.hindiName} ({loc.name})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">तारीख *</label>
                  <input
                    type="date"
                    name="slot_date"
                    min={new Date().toISOString().split('T')[0]}
                    value={inqSlotDate}
                    onChange={(e) => setInqSlotDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-mono focus:border-[#D5151B] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">पिकअप स्लॉट *</label>
                  <select
                    name="slot_window"
                    value={inqSlotWindow}
                    onChange={(e) => setInqSlotWindow(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-[#D5151B] outline-none"
                  >
                    {slots.length > 0 ? (
                      slots.map((s) => (
                        <option key={s.id} value={s.window}>
                          {s.window}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="10:00 AM - 01:00 PM">10:00 AM - 01:00 PM</option>
                        <option value="02:00 PM - 05:00 PM">02:00 PM - 05:00 PM</option>
                        <option value="05:00 PM - 08:00 PM">05:00 PM - 08:00 PM</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">समस्या का विवरण / पूरा पता *</label>
                <textarea
                  name="message"
                  required
                  rows={3}
                  value={inqMessage}
                  onChange={(e) => setInqMessage(e.target.value)}
                  placeholder="अपना पता, लैंडमार्क और फोन की समस्या लिखें..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#D5151B] outline-none"
                />
              </div>

              {inqError && (
                <div className="p-3 rounded-xl bg-[#FEF2F2] border border-red-200 text-[#D5151B] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{inqError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingInq}
                className="w-full py-3.5 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
              >
                {isSubmittingInq ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>सबमिट हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>इंक्वायरी भेजें व पेमेंट लिंक / QR जेनरेट करें</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-gray-500 text-center">
                नोट: सबमिशन के बाद आपको ₹199 टोकन पेमेंट लिंक व QR कोड मिलेगा — टेक्नीशियन का दौरा केवल पेमेंट पुष्टि के बाद ही सुनिश्चित होता है।
              </p>
            </form>
          )}
        </div>

        {/* Embedded Google Map */}
        <GoogleMapEmbed areaLabel="Surat, Gujarat" />
      </div>
    </div>
  );
};
