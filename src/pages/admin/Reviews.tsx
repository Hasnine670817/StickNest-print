import React, { useEffect, useState } from 'react';
import { 
  Star, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle, 
  XCircle, 
  User, 
  MessageSquare,
  ThumbsUp,
  Flag,
  Clock,
  Trash2,
  ShoppingBag
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Review {
  id: number;
  user_name: string;
  user_avatar: string | null;
  rating: number;
  title: string;
  comment: string;
  is_approved: boolean;
  created_at: string;
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('All Ratings');

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const approveReview = async (id: number) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: true })
        .eq('id', id);
      
      if (error) throw error;
      setReviews(reviews.map(r => r.id === id ? { ...r, is_approved: true } : r));
    } catch (err) {
      console.error('Error approving review:', err);
    }
  };

  const deleteReview = async (id: number) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setReviews(reviews.filter(r => r.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.user_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = filterRating === 'All Ratings' || review.rating === parseInt(filterRating);
    return matchesSearch && matchesRating;
  });

  const stats = {
    average: reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0.0',
    total: reviews.length,
    pending: reviews.filter(r => !r.is_approved).length,
    flagged: 0 // Placeholder
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor and manage product reviews and ratings</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Average Rating</p>
          <div className="flex items-center gap-2 mt-2">
            <h3 className="text-2xl font-bold text-gray-900">{stats.average}</h3>
            <div className="flex text-yellow-400">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className={`w-4 h-4 ${i <= Math.round(parseFloat(stats.average)) ? 'fill-current' : ''}`} />
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Reviews</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Pending Approval</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-2 text-orange-600">{stats.pending}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Flagged</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-2 text-red-600">{stats.flagged}</h3>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search reviews..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f37021] outline-none"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
            >
              <option>All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading reviews...</div>
          ) : filteredReviews.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No reviews found.</div>
          ) : (
            filteredReviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors group">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold overflow-hidden">
                      {review.user_avatar ? (
                        <img src={review.user_avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        review.user_name.charAt(0)
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-gray-900">{review.user_name}</h4>
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : ''}`} />
                          ))}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          review.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {review.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                      <h5 className="text-sm font-bold text-gray-800">{review.title}</h5>
                      <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                      <div className="flex items-center gap-4 pt-2">
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!review.is_approved && (
                      <button 
                        onClick={() => approveReview(review.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                        title="Approve"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button 
                      onClick={() => setDeleteConfirmId(review.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Review?</h3>
            <p className="text-gray-500 text-center text-sm mb-6">
              This action cannot be undone. Are you sure you want to delete this review?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => deleteReview(deleteConfirmId)}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

