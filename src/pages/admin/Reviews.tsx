import React, { useState } from 'react';
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
  Clock
} from 'lucide-react';

const mockReviews = [
  { id: 1, customer: 'John Doe', rating: 5, comment: 'Great quality stickers! The colors are vibrant and they stick really well.', product: 'Custom Die Cut Stickers', date: '2 days ago', status: 'approved' },
  { id: 2, customer: 'Sarah Smith', rating: 4, comment: 'Very nice, but shipping took a bit longer than expected.', product: 'Vinyl Lettering', date: '1 week ago', status: 'pending' },
  { id: 3, customer: 'Mike Johnson', rating: 5, comment: 'Perfect for my brand. Will order again!', product: 'Clear Stickers', date: '2 weeks ago', status: 'approved' },
];

export default function Reviews() {
  const [reviews, setReviews] = useState(mockReviews);

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
            <h3 className="text-2xl font-bold text-gray-900">4.8</h3>
            <div className="flex text-yellow-400">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Reviews</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">1,240</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Pending Approval</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-2 text-orange-600">12</h3>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Flagged</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-2 text-red-600">3</h3>
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
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f37021] outline-none"
            />
          </div>
          <div className="flex gap-2">
            <select className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none">
              <option>All Ratings</option>
              <option>5 Stars</option>
              <option>4 Stars</option>
              <option>3 Stars</option>
              <option>2 Stars</option>
              <option>1 Star</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {reviews.map((review) => (
            <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors group">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                    {review.customer.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-gray-900">{review.customer}</h4>
                      <div className="flex text-yellow-400">
                        {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        review.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {review.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                    <div className="flex items-center gap-4 pt-2">
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3" /> {review.product}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {review.date}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {review.status === 'pending' && (
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg" title="Flag">
                    <Flag className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Trash2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}

function ShoppingBag(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
