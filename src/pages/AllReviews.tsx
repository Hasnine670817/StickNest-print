import React, { useEffect, useState } from 'react';
import { Star, MessageSquare, ArrowLeft, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';

interface Review {
  id: number;
  user_name: string;
  user_avatar: string | null;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
}

export default function AllReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedReviews();
    window.scrollTo(0, 0);
  }, []);

  const fetchApprovedReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    average: reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0.0',
    total: reviews.length,
    recommend: '95%'
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-[1000px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <Link to="/deals" className="inline-flex items-center text-[#0066cc] hover:underline mb-4 font-bold gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Deals
            </Link>
            <h1 className="text-[32px] md:text-[40px] font-bold text-[#333333] flex items-center gap-3">
              <MessageSquare className="w-10 h-10 text-[#ff7a00]" />
              Customer Reviews
            </h1>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#333333] mb-1">{stats.average}</div>
              <div className="flex text-[#ffc107] justify-center mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(parseFloat(stats.average)) ? 'fill-current' : ''}`} />
                ))}
              </div>
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Average Rating</div>
            </div>
            <div className="w-px h-12 bg-gray-100"></div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#333333] mb-1">{stats.total}</div>
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Reviews</div>
            </div>
          </div>
        </div>

        {/* Review List */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-20 text-center">
              <LoadingSpinner />
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-500">Be the first to share your experience on the Deals page!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {reviews.map((review) => (
                <div key={review.id} className="p-8 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row gap-6">
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
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="flex text-[#ffc107]">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : ''}`} />
                            ))}
                          </div>
                          <span className="font-bold text-[#333333] text-[18px]">{review.title}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock className="w-4 h-4" />
                          {new Date(review.created_at).toLocaleDateString(undefined, { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                      <div className="mb-4">
                        <span className="font-bold text-[#333333] text-sm flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" /> {review.user_name}
                        </span>
                      </div>
                      <p className="text-[#555555] text-[16px] leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Showing all {reviews.length} verified customer reviews
          </p>
        </div>
      </div>
    </div>
  );
}
