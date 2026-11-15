import React, { useMemo, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { Job, Partner, RealCustomerReview } from '../../types';
import { recordAuditLog } from '../../services/adminService';
import {
  Star,
  Check,
  X,
  Flag,
  MessageCircle,
  Send,
  AlertTriangle
} from 'lucide-react';

interface AdminReviewsModuleProps {
  reviews: RealCustomerReview[];
  jobs: Job[];
  partners: Partner[];
  googleReviewUrl: string;
}

export const AdminReviewsModule: React.FC<AdminReviewsModuleProps> = ({
  reviews,
  jobs,
  partners,
  googleReviewUrl
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'flagged'>('all');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const overallStats = useMemo(() => {
    const valid = reviews.filter((r) => !r.flaggedAbusive);
    const avg =
      valid.length > 0
        ? (valid.reduce((s, r) => s + Number(r.rating || 5), 0) / valid.length).toFixed(1)
        : '0.0';

    const byPartner = partners.map((p) => {
      const pRevs = reviews.filter((r) => r.partnerId === p.id || r.partnerName === p.name);
      const pAvg =
        pRevs.length > 0
          ? (pRevs.reduce((s, r) => s + Number(r.rating || 5), 0) / pRevs.length).toFixed(1)
          : String(p.rating || 0);
      return { id: p.id, name: p.name, area: p.area, count: pRevs.length, avg: pAvg };
    });

    return { total: reviews.length, avg, byPartner };
  }, [reviews, partners]);

  const unreviewedDeliveredJobs = useMemo(() => {
    const reviewedJobIds = new Set(reviews.map((r) => r.jobId).filter(Boolean));
    return jobs.filter((j) => j.status === 'Delivered' && !reviewedJobIds.has(j.jobId));
  }, [jobs, reviews]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (filterStatus === 'flagged') return r.flaggedAbusive === true;
      if (filterStatus !== 'all') return r.status === filterStatus;
      return true;
    });
  }, [reviews, filterStatus]);

  const handleModerate = async (reviewId: string, status: 'approved' | 'rejected') => {
    setBusyId(reviewId);
    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        status,
        moderatedAt: new Date().toISOString()
      });
      await recordAuditLog({
        action: `review_${status}`,
        targetType: 'review',
        targetId: reviewId
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleFlag = async (review: RealCustomerReview) => {
    setBusyId(review.id);
    const nextFlag = !review.flaggedAbusive;
    try {
      await updateDoc(doc(db, 'reviews', review.id), {
        flaggedAbusive: nextFlag,
        status: nextFlag ? 'rejected' : review.status,
        moderatedAt: new Date().toISOString()
      });
      await recordAuditLog({
        action: nextFlag ? 'review_flagged_abusive' : 'review_unflagged',
        targetType: 'review',
        targetId: review.id
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleSaveReply = async (reviewId: string) => {
    const replyText = (replyDrafts[reviewId] || '').trim();
    if (!replyText) return;
    setBusyId(reviewId);
    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        adminReply: replyText,
        repliedAt: new Date().toISOString(),
        repliedBy: auth.currentUser?.email || 'admin'
      });
      await recordAuditLog({
        action: 'review_admin_reply',
        targetType: 'review',
        targetId: reviewId,
        after: { adminReply: replyText }
      });
      setReplyDrafts((prev) => ({ ...prev, [reviewId]: '' }));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary & Per-Partner Ratings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-1">
          <span className="text-xs font-bold text-gray-500 uppercase">Overall Customer Rating</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#132032] tabular-nums">{overallStats.avg}</span>
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span className="text-xs text-gray-500">({overallStats.total} reviews)</span>
          </div>
          <p className="text-[11px] text-gray-500">
            होमपेज पर केवल 'Approved' समीक्षाएं दिखती हैं
          </p>
        </div>

        <div className="md:col-span-2 p-5 rounded-2xl bg-white border border-gray-200 space-y-2">
          <span className="text-xs font-bold text-gray-500 uppercase block">
            Per-Partner Rating Breakdown
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {overallStats.byPartner.map((p) => (
              <div key={p.id} className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                <p className="font-bold text-[#132032] truncate">{p.name}</p>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="text-gray-500">{p.area}</span>
                  <span className="font-bold text-amber-700 inline-flex items-center gap-0.5 tabular-nums">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {p.avg} ({p.count})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delivered Jobs Not Yet Reviewed (1-Click Request Review via WhatsApp) */}
      <div className="p-5 rounded-2xl bg-[#FEF2F2] border border-red-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#132032]">
              Delivered Jobs Pending Review ({unreviewedDeliveredJobs.length})
            </h3>
            <p className="text-[11px] text-gray-600">
              1-क्लिक WhatsApp लिंक से ग्राहक को Google Review अनुरोध भेजें
            </p>
          </div>
          {!googleReviewUrl && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D5151B]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Settings में Google Review URL जोड़ें</span>
            </span>
          )}
        </div>

        {unreviewedDeliveredJobs.length === 0 ? (
          <p className="text-xs text-gray-600">सभी डिलीवर किए गए ऑर्डर्स के रिव्यू दर्ज हो चुके हैं।</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto">
            {unreviewedDeliveredJobs.map((job) => {
              const cleanPhone = (job.phone || '').replace(/\D/g, '').slice(-10);
              const targetLink = googleReviewUrl || 'https://sastafone.in/orders';
              const msg = encodeURIComponent(
                `नमस्ते ${job.name}! Sastafone Surat पर अपने ${job.brand} ${job.model} रिपेयर (#${job.jobId}) का अनुभव साझा करें — आपका रिव्यू हमारे लिए बेहद कीमती है: ${targetLink}`
              );
              return (
                <div
                  key={job.jobId}
                  className="p-3 rounded-xl bg-white border border-red-100 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-[#132032] truncate">
                      {job.name} • {job.brand} {job.model}
                    </p>
                    <p className="text-[11px] text-gray-500 font-mono">
                      #{job.jobId} • +91 {cleanPhone}
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/91${cleanPhone}?text=${msg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      recordAuditLog({
                        action: 'whatsapp_review_requested',
                        targetType: 'job',
                        targetId: job.jobId
                      })
                    }
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shrink-0"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Request Review</span>
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Reviews Moderation Queue */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-[#132032]">ग्राहक समीक्षाएं व मॉडरेशन</h3>
          <div className="flex flex-wrap gap-1.5">
            {(['all', 'pending', 'approved', 'rejected', 'flagged'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg text-xs font-bold capitalize cursor-pointer ${
                  filterStatus === st
                    ? 'bg-[#D5151B] text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {filteredReviews.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 text-xs text-gray-500">
            इस श्रेणी में कोई समीक्षा नहीं है।
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div key={rev.id} className="p-4 rounded-2xl bg-white border border-gray-200 space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#132032]">{rev.customerName}</span>
                    <span className="text-amber-600 font-bold inline-flex items-center gap-0.5 tabular-nums">
                      {rev.rating} <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rev.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rev.status === 'rejected'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rev.status}
                    </span>
                    {rev.flaggedAbusive && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                        FLAGGED ABUSIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {rev.phoneModel} • {rev.area} • {rev.jobId ? `Job #${rev.jobId}` : rev.serviceType}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    disabled={busyId === rev.id}
                    onClick={() => handleModerate(rev.id, 'approved')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    type="button"
                    disabled={busyId === rev.id}
                    onClick={() => handleModerate(rev.id, 'rejected')}
                    className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Hide</span>
                  </button>
                  <button
                    type="button"
                    disabled={busyId === rev.id}
                    onClick={() => handleToggleFlag(rev)}
                    className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50 ${
                      rev.flaggedAbusive
                        ? 'bg-rose-600 text-white'
                        : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>{rev.flaggedAbusive ? 'Unflag' : 'Flag'}</span>
                  </button>
                </div>
              </div>

              <p className="text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                "{rev.reviewText}"
              </p>

              {rev.adminReply && (
                <div className="p-2.5 rounded-xl bg-[#FEF2F2] border border-red-100 text-[#132032]">
                  <span className="font-bold text-[#D5151B]">Admin Reply:</span> {rev.adminReply}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={replyDrafts[rev.id] ?? ''}
                  onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [rev.id]: e.target.value }))}
                  placeholder={rev.adminReply ? 'रिप्लाई अपडेट करें...' : 'आधिकारिक एडमिन रिप्लाई लिखें...'}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#D5151B]"
                />
                <button
                  type="button"
                  disabled={busyId === rev.id || !(replyDrafts[rev.id] || '').trim()}
                  onClick={() => handleSaveReply(rev.id)}
                  className="px-3 py-1.5 rounded-xl bg-[#132032] hover:bg-black text-white font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-3 h-3" />
                  <span>Reply</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
