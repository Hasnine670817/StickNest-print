import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Calendar, Smartphone, Sparkles, Check, Ticket, Copy, CheckCircle2 } from 'lucide-react';
import Feature from '../components/Feature';
import Logos from '../components/Logos';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';

interface Coupon {
  id: number;
  code: string;
  discount_percentage: number;
  expiry_date: string;
  description: string;
  is_hero: boolean;
}

interface Review {
  id: number;
  user_name: string;
  user_avatar: string | null;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
}

export default function Deals() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [heroCoupon, setHeroCoupon] = useState<Coupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchPublicCoupons(), fetchApprovedReviews()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const fetchPublicCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .eq('show_on_deals', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      const allCoupons = data || [];
      setCoupons(allCoupons);
      
      // Find the hero coupon
      const hero = allCoupons.find(c => c.is_hero);
      setHeroCoupon(hero || null);
    } catch (err) {
      console.error('Error fetching coupons:', err);
    }
  };

  const fetchApprovedReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData.user;

      const { error } = await supabase
        .from('reviews')
        .insert([{
          user_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Anonymous',
          user_avatar: user?.user_metadata?.avatar_url || null,
          rating: newReview.rating,
          title: newReview.title,
          comment: newReview.comment,
          is_approved: false // Admin must approve
        }]);

      if (error) throw error;
      
      alert('Review submitted! It will appear once approved by an admin.');
      setIsReviewing(false);
      setNewReview({ rating: 5, title: '', comment: '' });
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const stats = {
    average: reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '4.8',
    total: reviews.length > 0 ? reviews.length.toLocaleString() : '18,294',
    recommend: '95%'
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#ff9900] via-[#ff8800] to-[#ffaa00] py-16 md:py-24 px-4 flex flex-col items-center justify-center text-center">
        {/* Background Image Overlay to simulate the stickers */}
        <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        
        <div className="relative z-10 max-w-[800px] mx-auto flex flex-col items-center">
          <h1 className="text-white text-[50px] md:text-[72px] font-bold leading-tight mb-2 drop-shadow-md tracking-tight">
            {heroCoupon ? `${heroCoupon.discount_percentage}% OFF` : '$29 for 50'}
          </h1>
          <h2 className="text-white text-[28px] md:text-[36px] font-bold mb-4 drop-shadow-md">
            {heroCoupon ? `Use code: ${heroCoupon.code}` : 'Custom 3" × 3" holographic stickers'}
          </h2>
          <p className="text-white text-[20px] mb-8 drop-shadow-sm">
            {heroCoupon ? (heroCoupon.description || 'Limited time offer! Grab it now.') : 'Normally $80. Free shipping.'}
          </p>
          
          <button 
            onClick={() => heroCoupon && copyToClipboard(heroCoupon.code)}
            className="bg-[#0066cc] hover:bg-[#005bb5] text-white font-bold py-4 px-12 rounded-md text-[20px] transition-colors mb-4 shadow-lg"
          >
            {heroCoupon ? (copiedCode === heroCoupon.code ? 'Code Copied!' : 'Copy Code') : 'Order now'}
          </button>
          
          <p className="text-white text-[16px]">
            Or, <Link to="/stickers" className="font-bold hover:underline">shop all quantities</Link>
          </p>
        </div>
      </section>

      {/* Timer Bar */}
      <div className="bg-[#6b5233] text-white text-center py-4 px-4 text-[16px]">
        {heroCoupon ? (
          <>
            Order in the next <span className="font-bold">
              {Math.max(0, Math.ceil((new Date(heroCoupon.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days
            </span> to get this limited time offer.
          </>
        ) : (
          <>Order in the next <span className="font-bold">4 days</span> to get this limited time offer.</>
        )}
      </div>

      {/* Featured Coupons Section */}
      {coupons.length > 0 && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-[1000px] mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Ticket className="w-8 h-8 text-[#ff7a00]" />
              <h2 className="text-[32px] font-bold text-[#333333]">Featured Offers</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {coupons.map((coupon) => (
                <div key={coupon.id} className="bg-white rounded-2xl border-2 border-dashed border-orange-200 p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5 sm:gap-6 hover:border-orange-400 transition-colors group">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-orange-50 rounded-xl flex flex-col items-center justify-center text-[#ff7a00] flex-shrink-0">
                    <span className="text-xl sm:text-2xl font-black leading-none">{coupon.discount_percentage}%</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">OFF</span>
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">{coupon.code}</h3>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                      {coupon.description || `Get ${coupon.discount_percentage}% off on your next order.`}
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-[12px] text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>Expires: {new Date(coupon.expiry_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => copyToClipboard(coupon.code)}
                    className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition-all ${
                      copiedCode === coupon.code 
                        ? 'bg-green-500 text-white' 
                        : 'bg-[#ff7a00] text-white hover:bg-[#e56a00] shadow-lg shadow-orange-100'
                    }`}
                  >
                    {copiedCode === coupon.code ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        Copy Code
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section className="py-20 px-4 max-w-[1000px] mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {/* Feature 1 */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 mb-6 relative flex items-center justify-center text-[#ff7a00]">
              <Calendar className="w-16 h-16 stroke-[1]" />
              <span className="absolute text-[22px] font-normal mt-2">4</span>
            </div>
            <h3 className="text-[20px] font-bold text-[#333333] mb-3">Free shipping in 4 days</h3>
            <p className="text-[#555555] text-[16px] leading-relaxed mb-4">
              Get your holographic stickers fast with 4 day turnaround and free shipping.
            </p>
            <a href="#" className="text-[#0056b3] font-bold text-[15px] hover:underline">Get a delivery estimate</a>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 mb-6 relative flex items-center justify-center text-[#ff7a00]">
              <Smartphone className="w-16 h-16 stroke-[1]" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-[-2px]">
                <Check className="w-6 h-6 stroke-[2]" />
              </div>
            </div>
            <h3 className="text-[20px] font-bold text-[#333333] mb-3">Get an online proof</h3>
            <p className="text-[#555555] text-[16px] leading-relaxed mb-4">
              Review your proof shortly after checkout and request changes until you're happy.
            </p>
            <a href="#" className="text-[#0056b3] font-bold text-[15px] hover:underline">Watch our process</a>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 mb-6 flex items-center justify-center text-[#ff7a00]">
              <Sparkles className="w-16 h-16 stroke-[1]" />
            </div>
            <h3 className="text-[20px] font-bold text-[#333333] mb-3">Colorful & shiny</h3>
            <p className="text-[#555555] text-[16px] leading-relaxed mb-4">
              Durable holographic vinyl gives your stickers a unique rainbow sheen.
            </p>
            <a href="#" className="text-[#0056b3] font-bold text-[15px] hover:underline">See them in action</a>
          </div>
        </div>
      </section>

      {/* Video Feature Section */}
      <Feature 
        title="Flux capacitor not included"
        description="Use holographic effects to enhance existing designs. Upload your plain-color logo, drawing or photo and we'll create a custom holographic sticker that's cut to your specifications. Work with us directly to ensure your stickers look totally awesome."
      />

      {/* Reviews Section */}
      <section className="py-20 px-4 max-w-[1000px] mx-auto w-full">
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
          <h2 className="text-[32px] font-bold text-[#333333] text-center md:text-left">Reviews for holographic stickers</h2>
          <button 
            onClick={() => setIsReviewing(!isReviewing)}
            className="bg-[#ff7a00] hover:bg-[#e56a00] text-white font-bold py-3 px-8 rounded-md transition-colors shadow-lg shadow-orange-100"
          >
            {isReviewing ? 'Cancel Review' : 'Write a Review'}
          </button>
        </div>

        {/* Review Form */}
        {isReviewing && (
          <div className="mb-20 bg-gray-50 rounded-2xl p-8 border border-gray-200">
            <h3 className="text-xl font-bold mb-6">Share your experience</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className={`p-1 transition-colors ${star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      <Star className={`w-8 h-8 ${star <= newReview.rating ? 'fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Review Title</label>
                <input
                  type="text"
                  required
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  placeholder="e.g., Amazing quality!"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700">Your Review</label>
                <textarea
                  required
                  rows={4}
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Tell us what you think about our stickers..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="w-full bg-[#0066cc] hover:bg-[#005bb5] text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50"
              >
                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}
        
        {/* Stats */}
        <div className="flex flex-col md:flex-row justify-between items-center text-center mb-20 gap-10 md:gap-0">
          <div className="flex flex-col items-center w-full md:w-1/3">
            <div className="text-[48px] md:text-[56px] font-bold text-[#333333] leading-none mb-3">{stats.average} / 5</div>
            <div className="flex text-[#ffc107] mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-6 h-6 ${i < Math.round(parseFloat(stats.average)) ? 'fill-current' : ''}`} />
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center w-full md:w-1/3">
            <div className="text-[48px] md:text-[56px] font-bold text-[#333333] leading-none mb-3">{stats.total}</div>
            <div className="text-[#555555] text-[16px]">Total reviews</div>
          </div>
          <div className="flex flex-col items-center w-full md:w-1/3">
            <div className="text-[48px] md:text-[56px] font-bold text-[#333333] leading-none mb-3">{stats.recommend}</div>
            <div className="text-[#555555] text-[16px]">Would order again</div>
          </div>
        </div>

        {/* Review List */}
        <div className="space-y-12">
          {reviews.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No reviews yet. Be the first to write one!</p>
          ) : (
            reviews.slice(0, 3).map((review) => (
              <div key={review.id} className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="flex-shrink-0">
                  {!review.user_avatar ? (
                    <div className="w-14 h-14 rounded-full bg-[#e9ecef] text-[#495057] flex items-center justify-center font-bold text-[20px]">
                      {review.user_name.charAt(0)}
                    </div>
                  ) : (
                    <img src={review.user_avatar} alt={review.user_name} className="w-14 h-14 rounded-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="flex text-[#ffc107]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                    <span className="font-bold text-[#333333] text-[16px]">{review.title}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3 text-[14px]">
                    <span className="font-bold text-[#333333]">{review.user_name}</span>
                    <span className="text-[#777777]">{new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[#555555] text-[16px] leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {reviews.length >= 3 && (
          <div className="mt-16 flex justify-center">
            <Link 
              to="/all-reviews"
              className="bg-[#f8f9fa] hover:bg-[#e2e6ea] text-[#333333] font-bold py-3 px-8 rounded transition-colors text-[16px]"
            >
              See all reviews
            </Link>
          </div>
        )}
      </section>

      {/* Logos Section */}
      <Logos />
        </>
      )}
    </div>
  );
}
