import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { subscribeToApprovedReviews } from '../services/firestoreRepairService';
import { RealCustomerReview } from '../types';
import { Star, ShieldCheck, CheckCircle2, MessageCircle } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../data/mockData';

export const HappyCustomersSection: React.FC = () => {
  const [approvedReviews, setApprovedReviews] = useState<RealCustomerReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToApprovedReviews((reviews) => {
      setApprovedReviews(reviews as RealCustomerReview[]);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  // Section B & J: Only show star rating and testimonials if min 5 real reviews in Firestore!
  if (isLoading || approvedReviews.length < 5) {
    return null;
  }

  const avgRating = (
    approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
  ).toFixed(1);

  return (
    <section id="happy-customers" className="py-10 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF2F2] border border-red-200 text-[#DC2626] text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>सत्यापित ग्राहक समीक्षाएं ({approvedReviews.length})</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            सूरत के ग्राहकों का सच्चा अनुभव
          </h2>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="flex items-center text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400" />
              ))}
            </div>
            <span className="text-base font-black text-gray-900">{avgRating} / 5</span>
            <span className="text-xs text-gray-500">({approvedReviews.length} वास्तविक रिव्यू)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {approvedReviews.slice(0, 6).map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-white border border-gray-200 shadow-2xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {new Date(rev.createdAt).toLocaleDateString('hi-IN', { month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <p className="text-xs text-gray-700 leading-relaxed italic">
                  "{rev.reviewText}"
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-gray-900 block">{rev.customerName}</span>
                  <span className="text-[10px] text-gray-500">
                    {rev.phoneModel} • {rev.area}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  सत्यापित
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
