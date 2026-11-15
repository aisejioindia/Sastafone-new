import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Star, ShieldCheck, MessageCircle, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { buildWhatsappHref } from '../services/siteSettingsService';
import { trackEvent } from '../utils/analytics';

interface RealReview {
  id: string;
  customerName: string;
  rating: number;
  reviewText: string;
  area?: string;
  createdAt?: string;
  status: string;
}

export const HappyCustomersSection: React.FC = () => {
  const { siteSettings } = useApp();
  const [reviews, setReviews] = useState<RealReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchRealReviews = async () => {
      try {
        const q = query(
          collection(db, 'reviews'),
          where('status', '==', 'approved'),
          limit(10)
        );
        const snap = await getDocs(q);
        if (!mounted) return;
        const list: RealReview[] = [];
        snap.forEach((docSnap) => {
          list.push({ ...(docSnap.data() as Omit<RealReview, 'id'>), id: docSnap.id });
        });
        setReviews(list);
      } catch (err) {
        console.warn('Reviews fetch skipped:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchRealReviews();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="py-10 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="h-6 w-56 bg-gray-100 rounded-lg mb-4 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-gray-50 border border-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Hide reviews section completely until real approved reviews exist in Firestore
  if (reviews.length === 0) {
    if (!siteSettings.googleReviewUrl) return null;

    return (
      <section className="py-8 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FEF2F2] border border-red-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h2 className="text-base sm:text-lg font-bold text-[#132032]">
                क्या आपने Sastafone सेवा का अनुभव किया है?
              </h2>
              <p className="text-xs text-gray-600">
                अपनी वास्तविक प्रतिक्रिया साझा करें ताकि सूरत के अन्य ग्राहकों को सही निर्णय लेने में मदद मिले।
              </p>
            </div>
            <a
              href={siteSettings.googleReviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('google_review_click', { source: 'home_section' })}
              className="px-4 py-2.5 rounded-xl bg-[#D5151B] hover:bg-[#B31419] text-white text-xs font-bold inline-flex items-center gap-2 transition-colors duration-150 shrink-0"
            >
              <Star className="w-4 h-4" />
              <span>Review us on Google</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>
    );
  }

  const avgRating = (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1);
  const whatsappHref = buildWhatsappHref(
    siteSettings.whatsappNumber,
    'नमस्ते Sastafone! मुझे फोन रिपेयरिंग के लिए स्लॉट बुक करना है।'
  );

  return (
    <section className="py-10 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D5151B] mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>सत्यापित ग्राहक समीक्षाएं</span>
            </div>
            <h2 className="text-2xl font-bold text-[#132032] tracking-tight">
              सूरत के संतुष्ट ग्राहक
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {reviews.length >= 5 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FEF2F2] border border-red-200 text-[#D5151B] text-xs font-bold tabular-nums">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>
                  {avgRating} ({reviews.length} सत्यापित समीक्षाएं)
                </span>
              </div>
            )}

            {siteSettings.googleReviewUrl && (
              <a
                href={siteSettings.googleReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('google_review_click', { source: 'reviews_header' })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-[#132032] text-xs font-bold transition-colors duration-150"
              >
                <Star className="w-3.5 h-3.5 text-[#D5151B]" />
                <span>Review us on Google</span>
                <ExternalLink className="w-3 h-3 text-gray-400" />
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-2.5 flex flex-col justify-between transition-all duration-150 hover:border-red-200"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div>
                    <p className="font-bold text-[#132032] text-sm">{rev.customerName}</p>
                    {rev.area && <p className="text-[11px] text-gray-500">{rev.area}, Surat</p>}
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">"{rev.reviewText}"</p>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                <span>सत्यापित ग्राहक</span>
                <span>{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('hi-IN') : ''}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('whatsapp_click', { source: 'reviews_section' })}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-[#FEF2F2] border border-gray-200 hover:border-red-200 text-xs font-bold text-[#132032] transition-colors duration-150"
          >
            <MessageCircle className="w-4 h-4 text-[#D5151B]" />
            <span>WhatsApp पर सेवा सहायता प्राप्त करें</span>
          </a>
        </div>
      </div>
    </section>
  );
};
