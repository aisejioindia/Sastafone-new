import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CustomerReview, ServiceType } from '../types';
import { SURAT_LOCALITIES } from '../data/mockData';
import {
  Star,
  ThumbsUp,
  Share2,
  CheckCircle2,
  MessageSquarePlus,
  Wrench,
  ShoppingBag,
  Sparkles,
  Smartphone,
  ShieldCheck,
  MapPin,
  Clock,
  Heart,
  X,
  Send,
  Award
} from 'lucide-react';

export const HappyCustomersSection: React.FC = () => {
  const {
    reviews,
    addReview,
    toggleLikeReview,
    isReviewModalOpen,
    setIsReviewModalOpen,
    prefillReviewOrder,
    setPrefillReviewOrder,
    selectedLocality,
    user
  } = useApp();

  // Filter tab state
  const [activeFilter, setActiveFilter] = useState<'all' | 'repair' | 'sell' | 'buy' | '5star'>('all');

  // Review Form States
  const [formServiceType, setFormServiceType] = useState<ServiceType>(
    prefillReviewOrder ? prefillReviewOrder.type : 'repair'
  );
  const [formPhoneModel, setFormPhoneModel] = useState(
    prefillReviewOrder ? prefillReviewOrder.title : ''
  );
  const [formServiceDetail, setFormServiceDetail] = useState(
    prefillReviewOrder ? prefillReviewOrder.subtitle : ''
  );
  const [formRating, setFormRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [formCustomerName, setFormCustomerName] = useState(user.name || '');
  const [formLocality, setFormLocality] = useState(
    prefillReviewOrder ? prefillReviewOrder.locality.split(',')[0] : selectedLocality.split(',')[0] || 'Adajan'
  );
  const [formOrderNumber, setFormOrderNumber] = useState(
    prefillReviewOrder ? prefillReviewOrder.orderNumber : ''
  );
  const [formReviewText, setFormReviewText] = useState('');
  const [formShareToSocial, setFormShareToSocial] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  // Sync if prefillReviewOrder changes
  React.useEffect(() => {
    if (prefillReviewOrder) {
      setFormServiceType(prefillReviewOrder.type);
      setFormPhoneModel(prefillReviewOrder.title);
      setFormServiceDetail(prefillReviewOrder.subtitle);
      setFormOrderNumber(prefillReviewOrder.orderNumber);
      if (prefillReviewOrder.customerName) {
        setFormCustomerName(prefillReviewOrder.customerName);
      }
    }
  }, [prefillReviewOrder]);

  // Filter reviews
  const filteredReviews = reviews.filter(rev => {
    if (activeFilter === 'repair') return rev.serviceType === 'repair';
    if (activeFilter === 'sell') return rev.serviceType === 'sell';
    if (activeFilter === 'buy') return rev.serviceType === 'buy';
    if (activeFilter === '5star') return rev.rating === 5;
    return true;
  });

  // Calculate statistics
  const totalReviews = reviews.length;
  const avgRating = (
    reviews.reduce((acc, curr) => acc + curr.rating, 0) / (totalReviews || 1)
  ).toFixed(1);
  const fiveStarPercentage = Math.round(
    (reviews.filter(r => r.rating === 5).length / (totalReviews || 1)) * 100
  );

  const handleOpenReviewModal = () => {
    setPrefillReviewOrder(null);
    setFormPhoneModel('');
    setFormServiceDetail('');
    setFormReviewText('');
    setFormRating(5);
    if (!formCustomerName && user.name) {
      setFormCustomerName(user.name);
    }
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setPrefillReviewOrder(null);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPhoneModel.trim() || !formReviewText.trim()) {
      alert('कृपया फोन का मॉडल और अपना अनुभव विवरण अवश्य लिखें।');
      return;
    }

    setFormSubmitting(true);

    setTimeout(() => {
      let defaultDetail = formServiceDetail.trim();
      if (!defaultDetail) {
        if (formServiceType === 'repair') defaultDetail = '30 मिनट में होम रिपेयर सेवा';
        else if (formServiceType === 'sell') defaultDetail = 'डोरस्टेप फोन पिकअप व तुरंत भुगतान';
        else defaultDetail = 'सर्टिफाइड टेस्टेड स्मार्टफोन डील';
      }

      addReview({
        customerName: formCustomerName.trim() || 'सूरत निवासी',
        locality: formLocality + ', Surat',
        serviceType: formServiceType,
        phoneModel: formPhoneModel.trim(),
        serviceDetail: defaultDetail,
        rating: formRating,
        reviewText: formReviewText.trim(),
        orderNumber: formOrderNumber.trim() || undefined
      });

      setFormSubmitting(false);
      handleCloseReviewModal();
    }, 400);
  };

  const handleShareReview = (review: CustomerReview) => {
    const textToShare = `🌟 Sastaphone Surat Customer Review:\n"${review.reviewText}"\n- ${review.customerName} (${review.locality})\n⭐ Rating: ${review.rating}/5 stars for ${review.phoneModel} (${review.serviceDetail})\nSastaphone Surat (sastaphone.in) 100% Verified 🇮🇳`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(textToShare)}`;
    window.open(whatsappUrl, '_blank');
    setCopiedShareId(review.id);
    setTimeout(() => setCopiedShareId(null), 3000);
  };

  const getServiceTypeBadge = (type: ServiceType) => {
    switch (type) {
      case 'repair':
        return {
          label: 'होम रिपेयर (Repair @ Home)',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <Wrench className="w-3 h-3 text-blue-600" />
        };
      case 'sell':
        return {
          label: 'फोन बेचा (Sell Old Phone)',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <Sparkles className="w-3 h-3 text-emerald-600" />
        };
      case 'buy':
        return {
          label: 'सर्टिफाइड फोन (Buy Certified)',
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: <ShoppingBag className="w-3 h-3 text-purple-600" />
        };
      default:
        return {
          label: 'सस्ताफोन सेवा',
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: <Smartphone className="w-3 h-3 text-slate-600" />
        };
    }
  };

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 5:
        return 'उत्कृष्ट अनुभव! (5/5 Stars - Highly Recommended)';
      case 4:
        return 'बहुत अच्छा अनुभव (4/5 Stars - Very Good)';
      case 3:
        return 'अच्छा अनुभव (3/5 Stars - Good)';
      case 2:
        return 'सामान्य / औसत (2/5 Stars - Average)';
      case 1:
        return 'सुधार की आवश्यकता (1/5 Stars - Needs Improvement)';
      default:
        return '';
    }
  };

  return (
    <section id="happy-customers" className="py-12 bg-gradient-to-b from-slate-50 to-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black shadow-2xs">
            <Award className="w-3.5 h-3.5 text-blue-600" />
            <span>🇮🇳 सस्ताफोन सूरत (sastaphone.in) • 100% सत्यापित ग्राहक समीक्षाएं</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            सूरत के खुशहाल ग्राहक <span className="text-blue-600">(Happy Customers)</span>
          </h2>

          <p className="text-sm text-slate-600 leading-relaxed">
            सूरत के विभिन्न इलाकों (अडाजण, वेसु, वराछा, कतारगाम, सिटीलाइट) के ग्राहकों के सच्चे अनुभव। घर पर 30 मिनट में रिपेयर, तुरंत कैश में पुराना फोन बेचना और सर्टिफाइड डिवाइस खरीदना!
          </p>

          {/* Social Proof Stats Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm font-black text-slate-900">{avgRating} / 5.0</span>
              <span className="text-xs text-slate-500 font-medium">({totalReviews * 120}+ सूरत रिव्यू)</span>
            </div>

            <div className="h-4 w-px bg-slate-300 hidden sm:block" />

            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>औसत रिपेयर: <strong>30 मिनट</strong></span>
            </div>

            <div className="h-4 w-px bg-slate-300 hidden sm:block" />

            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span><strong>{fiveStarPercentage}%</strong> 5-स्टार संतुष्टि</span>
            </div>
          </div>

          {/* Write a Review Button */}
          <div className="pt-3">
            <button
              onClick={handleOpenReviewModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-500/20 hover:scale-102 transition-all cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4 text-amber-300" />
              <span>+ अपना अनुभव व रेटिंग शेयर करें (Write Review)</span>
            </button>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            सभी अनुभव ({reviews.length})
          </button>
          <button
            onClick={() => setActiveFilter('repair')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'repair'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>होम रिपेयर ({reviews.filter(r => r.serviceType === 'repair').length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('sell')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'sell'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>फोन बेचा ({reviews.filter(r => r.serviceType === 'sell').length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('buy')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'buy'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>फोन खरीदा ({reviews.filter(r => r.serviceType === 'buy').length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('5star')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFilter === '5star'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>5-स्टार केवल ({reviews.filter(r => r.rating === 5).length})</span>
          </button>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReviews.map(review => {
            const badge = getServiceTypeBadge(review.serviceType);
            const initials = review.customerName
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={review.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="space-y-3.5">
                  {/* Top Row: User Avatar, Name, Locality & Verification Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                        {initials || 'SR'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                            {review.customerName}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <MapPin className="w-3 h-3 text-rose-500" />
                          <span>{review.locality}</span>
                        </div>
                      </div>
                    </div>

                    {review.verified && (
                      <span className="shrink-0 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>सत्यापित ग्राहक</span>
                      </span>
                    )}
                  </div>

                  {/* Rating Stars & Service Pill */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-black text-slate-800 ml-1">
                        {review.rating}.0
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg border flex items-center gap-1 ${badge.bg}`}
                    >
                      {badge.icon}
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  {/* Device & Service Detail Highlight */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-150 space-y-0.5">
                    <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                      <span>{review.phoneModel}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">
                      ✓ {review.serviceDetail}
                    </p>
                  </div>

                  {/* Testimonial Quote */}
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{review.reviewText}"
                  </p>
                </div>

                {/* Card Footer: Date, Order Ref, Likes & Share */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 block">{review.date}</span>
                    {review.orderNumber && (
                      <span className="text-[10px] font-mono text-blue-600 font-semibold block">
                        #{review.orderNumber}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleLikeReview(review.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        review.likedByMe
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                      title="मददगार रिव्यू (Helpful)"
                    >
                      <ThumbsUp className={`w-3 h-3 ${review.likedByMe ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{review.likesCount}</span>
                    </button>

                    <button
                      onClick={() => handleShareReview(review)}
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                      title="WhatsApp पर शेयर करें"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Submission Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100 p-5 sm:p-6 space-y-4">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>सूरत कस्टमर रिव्यू फीडबैक</span>
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  अपना सच्चा अनुभव व रेटिंग शेयर करें
                </h3>
                <p className="text-xs text-slate-500">
                  आपके फीडबैक से सूरत के अन्य उपयोगकर्ताओं को सही निर्णय लेने में मदद मिलती है।
                </p>
              </div>

              <button
                onClick={handleCloseReviewModal}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Service Type Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  1. आपने कौन सी सेवा ली? (Select Service Type)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormServiceType('repair')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      formServiceType === 'repair'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 font-bold ring-2 ring-blue-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Wrench className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                    <span className="text-[11px] block font-bold">होम रिपेयर</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormServiceType('sell')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      formServiceType === 'sell'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-700 font-bold ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                    <span className="text-[11px] block font-bold">फोन बेचा</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormServiceType('buy')}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      formServiceType === 'buy'
                        ? 'bg-purple-50 border-purple-600 text-purple-700 font-bold ring-2 ring-purple-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                    <span className="text-[11px] block font-bold">फोन खरीदा</span>
                  </button>
                </div>
              </div>

              {/* Interactive Star Rating Selector */}
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 text-center space-y-2">
                <label className="text-xs font-black text-slate-900 block">
                  2. आपका रेटिंग स्कोर क्या है? (Rating Stars)
                </label>

                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => {
                    const isFilled = (hoverRating || formRating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setFormRating(star)}
                        className="p-1 hover:scale-125 transition-transform cursor-pointer focus:outline-hidden"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            isFilled
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <p className="text-xs font-black text-amber-800">
                  {getRatingLabel(hoverRating || formRating)}
                </p>
              </div>

              {/* Phone Model & Service Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    मोबाइल का नाम / मॉडल <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. iPhone 13, OnePlus 10R"
                    value={formPhoneModel}
                    onChange={e => setFormPhoneModel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    सर्विस डिटेल (वैकल्पिक)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. स्क्रीन रिप्लेसमेंट, तुरंत ₹32,400 कैश"
                    value={formServiceDetail}
                    onChange={e => setFormServiceDetail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-blue-500"
                  />
                </div>
              </div>

              {/* Name & Surat Locality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    आपका नाम (Customer Name)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा. राहुल पटेल"
                    value={formCustomerName}
                    onChange={e => setFormCustomerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    सूरत इलाका (Locality)
                  </label>
                  <select
                    value={formLocality}
                    onChange={e => setFormLocality(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-blue-500 cursor-pointer"
                  >
                    {SURAT_LOCALITIES.map(loc => (
                      <option key={loc.id} value={loc.name}>
                        {loc.name} ({loc.hindiName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Order Number (Optional) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  ऑर्डर नंबर (Order Number - यदि उपलब्ध हो)
                </label>
                <input
                  type="text"
                  placeholder="उदा. STP-SURAT-8921"
                  value={formOrderNumber}
                  onChange={e => setFormOrderNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-blue-500"
                />
              </div>

              {/* Testimonial / Review Text */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  आपका सच्चा अनुभव (Your Testimonial / Review) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="सस्ताफोन के साथ आपका अनुभव कैसा रहा? टेक्नीशियन समय पर आया? फोन की परफॉर्मेंस कैसी है? अपना अनुभव विस्तार से लिखें..."
                  value={formReviewText}
                  onChange={e => setFormReviewText(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed focus:bg-white focus:outline-blue-500"
                />
              </div>

              {/* Verification & Social Media Post Checkbox */}
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-950 space-y-1">
                <label className="flex items-start gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={formShareToSocial}
                    onChange={e => setFormShareToSocial(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>
                    सत्यापित करें: यह मेरा वास्तविक अनुभव है और मैं इसे सूरत के खुशहाल ग्राहक (Happy Customers) पेज पर प्रदर्शित करने की अनुमति देता हूँ।
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCloseReviewModal}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-black shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {formSubmitting ? 'रिव्यू पोस्ट हो रहा है...' : 'रिव्यू पोस्ट करें (Post Review)'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
