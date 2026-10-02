import React, { useState } from 'react';
import {
  Star,
  CheckCircle2,
  ThumbsUp,
  MessageSquarePlus,
  Filter,
  ShieldCheck,
  Sparkles,
  X,
  UserCheck,
} from 'lucide-react';
import { useFarm } from '../../context/FarmContext';
import { CustomerReview } from '../../types';
import { CustomSelect } from '../ui/CustomSelect';

export const CustomerReviews: React.FC = () => {
  const { reviews, addReview, voteHelpfulReview, currentUser, produceList } = useFarm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [onlyVerified, setOnlyVerified] = useState(false);

  // Form State
  const [authorName, setAuthorName] = useState(currentUser.name || 'Verified Customer');
  const [location, setLocation] = useState('Coimbatore, Tamil Nadu');
  const [selectedProduce, setSelectedProduce] = useState(produceList[0]?.name || 'Heirloom Vine Tomatoes');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [confirmedPurchase, setConfirmedPurchase] = useState(true);
  const [submittedNotice, setSubmittedNotice] = useState(false);

  // Dynamic statistics
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '5.0';

  const ratingCounts: Record<number, number> = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  // Filtered reviews
  const filteredReviews = reviews.filter((r) => {
    if (filterRating !== 'all' && r.rating !== filterRating) return false;
    if (onlyVerified && !r.verifiedPurchase) return false;
    return true;
  });

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !title.trim()) return;

    addReview({
      customerName: authorName.trim() || 'Verified Customer',
      customerLocation: location.trim(),
      rating,
      title: title.trim(),
      comment: comment.trim(),
      produceName: selectedProduce,
      verifiedPurchase: confirmedPurchase,
    });

    setSubmittedNotice(true);
    setTimeout(() => {
      setSubmittedNotice(false);
      setIsModalOpen(false);
      setTitle('');
      setComment('');
      setRating(5);
    }, 1200);
  };

  const getRatingLabel = (score: number) => {
    switch (score) {
      case 5:
        return 'Exceptional Freshness';
      case 4:
        return 'Very Good Quality';
      case 3:
        return 'Satisfactory Harvest';
      case 2:
        return 'Needs Improvement';
      default:
        return 'Poor Experience';
    }
  };

  return (
    <section id="reviews" className="py-20 max-w-7xl mx-auto px-5 md:px-8 font-sans">
      {/* Header Eyebrow & Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#c5a880] block">
            Community Feedback & Verified Purchases
          </span>
          <h2 className="font-sans text-3xl md:text-5xl font-bold tracking-[-0.04em] text-[#182019] mt-2">
            Real Customer Reviews
          </h2>
          <p className="text-sm md:text-base text-[#6f776e] mt-2 max-w-xl">
            Read direct experiences from local patrons enjoying farm-fresh harvests. Every review reflects transparent, verified doorstep deliveries.
          </p>
        </div>

        {/* Write a Review Button */}
        <button
          type="button"
          onClick={() => {
            setAuthorName(currentUser.name);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-full bg-[#183c2a] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-[#23533a] active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          <MessageSquarePlus className="h-4 w-4 text-[#c5a880]" />
          <span>Write a Customer Review</span>
        </button>
      </div>

      {/* Aggregate Rating Overview Card */}
      <div className="rounded-3xl border border-stone-200/90 bg-[#fbfaf5] p-6 md:p-8 shadow-xs mb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Average Score Column */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left border-b lg:border-b-0 lg:border-r border-stone-200/80 pb-6 lg:pb-0 lg:pr-8">
            <div className="text-5xl md:text-6xl font-black text-[#183c2a] tracking-tight">
              {averageRating}
            </div>
            <div className="flex items-center gap-1 my-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(Number(averageRating))
                      ? 'text-amber-500 fill-amber-400'
                      : 'text-stone-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs font-semibold text-[#6f776e]">
              Based on {totalReviews} dynamic verified customer submissions
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
              <span>100% Verified Farm Orders</span>
            </div>
          </div>

          {/* Rating Distribution Breakdown Bars */}
          <div className="lg:col-span-8 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = ratingCounts[stars] || 0;
              const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <span className="w-12 font-bold text-stone-700 flex items-center gap-1">
                    <span>{stars}</span>
                    <Star className="h-3 w-3 text-amber-500 fill-amber-400" />
                  </span>
                  <div className="flex-1 h-2.5 rounded-full bg-stone-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#183c2a] transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono text-stone-500 text-[11px]">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-stone-500 mr-1 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter:</span>
          </span>
          <button
            type="button"
            onClick={() => setFilterRating('all')}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              filterRating === 'all'
                ? 'bg-[#183c2a] text-white shadow-2xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900'
            }`}
          >
            All Reviews ({totalReviews})
          </button>
          {[5, 4, 3].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFilterRating(star)}
              className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                filterRating === star
                  ? 'bg-[#183c2a] text-white shadow-2xs'
                  : 'bg-white border border-stone-200 text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>{star}</span>
              <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
              <span>({ratingCounts[star] || 0})</span>
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 cursor-pointer">
          <input
            type="checkbox"
            checked={onlyVerified}
            onChange={(e) => setOnlyVerified(e.target.checked)}
            className="rounded border-stone-300 text-[#183c2a] focus:ring-[#183c2a]"
          />
          <span>Verified buyers only</span>
        </label>
      </div>

      {/* Dynamic Reviews Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredReviews.length === 0 ? (
          <div className="col-span-full py-12 text-center rounded-2xl bg-white border border-stone-200 text-stone-500">
            No customer reviews match this filter. Be the first to write a review!
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <article
              key={rev.id}
              className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Author Info & Verified Badge */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#183c2a] text-[#c5a880] font-bold flex items-center justify-center text-xs shadow-xs">
                      {rev.customerName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#182019]">{rev.customerName}</h4>
                      {rev.customerLocation && (
                        <p className="text-[11px] text-stone-500">{rev.customerLocation}</p>
                      )}
                    </div>
                  </div>

                  {rev.verifiedPurchase && (
                    <div className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 shrink-0">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      <span>Verified Buyer</span>
                    </div>
                  )}
                </div>

                {/* Star Rating & Produce Tag */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3.5 w-3.5 ${
                          star <= rev.rating
                            ? 'text-amber-500 fill-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>

                  {rev.produceName && (
                    <span className="rounded-full bg-stone-100 text-stone-700 px-2.5 py-0.5 text-[11px] font-medium">
                      {rev.produceName}
                    </span>
                  )}

                  <span className="text-[11px] text-stone-400 ml-auto font-medium">
                    {rev.date}
                  </span>
                </div>

                {/* Review Title & Body */}
                <h5 className="font-bold text-sm text-[#182019] mb-1.5 leading-snug">
                  {rev.title}
                </h5>
                <p className="text-xs sm:text-[13px] text-stone-600 leading-relaxed">
                  {rev.comment}
                </p>
              </div>

              {/* Helpful Vote Button */}
              <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <span className="text-[11px]">Was this review helpful?</span>
                <button
                  type="button"
                  onClick={() => voteHelpfulReview(rev.id)}
                  className="flex items-center gap-1.5 rounded-full bg-stone-100 hover:bg-stone-200 px-3 py-1 text-stone-700 font-semibold transition-colors cursor-pointer"
                >
                  <ThumbsUp className="h-3 w-3 text-[#183c2a]" />
                  <span>Helpful ({rev.helpfulCount})</span>
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Dynamic Write Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white border border-stone-200 p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Modal Close Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {submittedNotice ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-xl text-[#182019]">Review Published!</h3>
                <p className="text-xs text-stone-500">
                  Thank you for sharing your harvest feedback. Your review is now live in the community section.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#a48256]">
                      Verified Consumer Feedback
                    </span>
                    <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[9px] font-bold">
                      Direct Patron
                    </span>
                  </div>
                  <h3 className="font-sans text-2xl font-bold tracking-tight text-[#182019] mt-1">
                    Write Your Harvest Review
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Help your local community and partner farmers by reviewing your recent produce quality and transit service.
                  </p>
                </div>

                {/* Rating Selector */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Your Rating
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          className="p-1 cursor-pointer transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-7 w-7 ${
                              star <= (hoverRating || rating)
                                ? 'text-amber-500 fill-amber-400'
                                : 'text-stone-300'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-[#183c2a] ml-2">
                      {getRatingLabel(hoverRating || rating)}
                    </span>
                  </div>
                </div>

                {/* Reviewer Name & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#183c2a]"
                      placeholder="e.g. Pooja Sharma"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Your City / District
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#183c2a]"
                      placeholder="e.g. Coimbatore, Tamil Nadu"
                    />
                  </div>
                </div>

                {/* Produce Item Select */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Select Produce or Box Experience
                  </label>
                  <CustomSelect
                    value={selectedProduce}
                    onChange={(val) => setSelectedProduce(val)}
                    options={[
                      'Weekly Family Harvest Box',
                      'Seasonal Orchard Box',
                      'Farm2Street Overall Delivery Experience',
                      ...produceList.map((p) => `${p.name} (${p.farmer})`),
                    ]}
                    size="sm"
                  />
                </div>

                {/* Review Headline */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Review Headline
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#183c2a]"
                    placeholder="e.g. Farm-gate freshness exceeded my expectations!"
                  />
                </div>

                {/* Detailed Feedback */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Your Detailed Review
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#183c2a]"
                    placeholder="Describe the aroma, taste, freshness upon delivery, and packaging quality..."
                  />
                </div>

                {/* Verified Purchase confirmation */}
                <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmedPurchase}
                    onChange={(e) => setConfirmedPurchase(e.target.checked)}
                    className="rounded border-stone-300 text-[#183c2a] focus:ring-[#183c2a]"
                  />
                  <span>I confirm this review is based on an authentic Farm2Street order</span>
                </label>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-full px-5 py-2.5 text-xs font-bold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-[#183c2a] hover:bg-[#23533a] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all cursor-pointer"
                  >
                    Publish Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
