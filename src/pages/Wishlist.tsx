import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, ArrowLeft, Package, Loader2, X, AlertTriangle } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { motion, AnimatePresence } from "motion/react";

interface WishlistItem {
  id: string;
  design_id: string;
  marketplace_designs: {
    id: string;
    title: string;
    author_name: string;
    image_url: string;
    category: string;
  };
}

export default function Wishlist() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<WishlistItem | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchWishlist();
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const { data, error } = await supabase
        .from("wishlist")
        .select(`
          id,
          design_id,
          marketplace_designs (
            id,
            title,
            author_name,
            image_url,
            category
          )
        `)
        .eq("user_id", user?.id);

      if (error) throw error;
      setItems(data as any || []);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async () => {
    if (!itemToDelete) return;
    
    setRemovingId(itemToDelete.id);
    try {
      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("id", itemToDelete.id);

      if (error) throw error;

      // Update likes_count in marketplace_designs
      const { error: updateError } = await supabase.rpc('decrement_likes', { row_id: itemToDelete.design_id });
      if (updateError) {
        // Fallback if RPC doesn't exist
        const { data: currentData } = await supabase
          .from('marketplace_designs')
          .select('likes_count')
          .eq('id', itemToDelete.design_id)
          .single();
        
        await supabase
          .from('marketplace_designs')
          .update({ likes_count: Math.max(0, (currentData?.likes_count || 0) - 1) })
          .eq('id', itemToDelete.design_id);
      }

      setItems(prev => prev.filter(item => item.id !== itemToDelete.id));
      setItemToDelete(null);
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-[#f4f4f4] py-8 sm:py-12 px-4 sm:px-8">
      <div className="max-w-[1000px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <button 
              onClick={() => navigate("/dashboard")}
              className="text-sm text-gray-500 hover:text-[#333] flex items-center gap-1 mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
            <h1 className="text-[28px] sm:text-[32px] font-bold text-[#333333] flex items-center gap-3">
              My Wishlist
              <span className="text-lg font-normal text-gray-400">({items.length})</span>
            </h1>
          </div>
          <Link 
            to="/marketplace"
            className="bg-white border border-gray-300 text-[#333333] px-6 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-colors text-center"
          >
            Browse Marketplace
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-gray-300" />
            </div>
            <h2 className="text-xl font-bold text-[#333333] mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Save your favorite designs from the marketplace to easily find them later.
            </p>
            <Link 
              to="/marketplace"
              className="inline-block bg-[#f37021] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#e0661e] transition-all shadow-lg shadow-orange-100"
            >
              Explore Designs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div 
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-all flex flex-col"
              >
                <Link to={`/marketplace/${item.marketplace_designs.id}`} className="block aspect-square bg-gray-50 relative overflow-hidden shrink-0">
                  <img 
                    src={item.marketplace_designs.image_url} 
                    alt={item.marketplace_designs.title}
                    className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        setItemToDelete(item);
                      }}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Link>
                <div className="p-5 flex flex-col flex-1">
                  <div className="text-[10px] font-bold text-[#f37021] uppercase tracking-wider mb-1">
                    {item.marketplace_designs.category}
                  </div>
                  <Link 
                    to={`/marketplace/${item.marketplace_designs.id}`}
                    className="font-bold text-[#333333] hover:text-[#0066cc] transition-colors line-clamp-1 mb-1"
                  >
                    {item.marketplace_designs.title}
                  </Link>
                  <p className="text-xs text-gray-500 mb-6">by {item.marketplace_designs.author_name}</p>
                  
                  <div className="mt-auto">
                    <Link 
                      to={`/marketplace/${item.marketplace_designs.id}`}
                      className="block w-full bg-gray-50 text-[#333333] py-2.5 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors text-center border border-gray-100"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setItemToDelete(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative z-10 p-6"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-red-50 rounded-full mb-4 mx-auto">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Remove from wishlist?</h3>
              <p className="text-gray-500 text-center text-sm mb-6">
                Are you sure you want to remove <span className="font-bold text-gray-700">"{itemToDelete.marketplace_designs.title}"</span> from your wishlist?
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={removeFromWishlist}
                  disabled={removingId === itemToDelete.id}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                >
                  {removingId === itemToDelete.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Remove"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
