import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Heart, 
  ShoppingCart, 
  Share2, 
  ChevronDown, 
  Info, 
  Truck, 
  Printer, 
  ShieldCheck, 
  Star,
  MessageSquare,
  ArrowLeft,
  Check,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import ShareModal from "../components/ShareModal";
import { motion, AnimatePresence } from "motion/react";

interface Product {
  id: string;
  title: string;
  author_name: string;
  author_avatar: string;
  image_url: string;
  likes_count: number;
  cart_count: string;
  category: string;
  created_at: string;
}

const quantityOptions = [
  { label: "1 sticker", price: 5, perSticker: 5 },
  { label: "4 stickers", price: 8, perSticker: 2, save: "60%" },
  { label: "10 stickers", price: 15, perSticker: 1.5, save: "70%" },
  { label: "25 stickers", price: 30, perSticker: 1.2, save: "76%" },
  { label: "50 stickers", price: 50, perSticker: 1, save: "80%" },
];

export default function MarketplaceProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuantity, setSelectedQuantity] = useState(quantityOptions[0]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlisting, setIsWishlisting] = useState(false);
  const [showUnwishlistConfirm, setShowUnwishlistConfirm] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from("marketplace_designs")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setProduct(data);

        // Check if wishlisted
        if (user) {
          const { data: wishlistData } = await supabase
            .from("wishlist")
            .select("id")
            .eq("user_id", user.id)
            .eq("design_id", id)
            .single();
          
          if (wishlistData) setIsWishlisted(true);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, user]);

  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart({
      name: product.title,
      image: product.image_url,
      size: "4.21 x 0.75 in",
      quantity: parseInt(selectedQuantity.label),
      pricePerUnit: selectedQuantity.perSticker,
      totalPrice: selectedQuantity.price,
      design_id: product.id,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const toggleWishlist = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!product || isWishlisting) return;

    if (isWishlisted) {
      setShowUnwishlistConfirm(true);
      return;
    }

    setIsWishlisting(true);
    try {
      // Add to wishlist
      const { error } = await supabase
        .from("wishlist")
        .insert([{ user_id: user.id, design_id: product.id }]);
      
      if (error) throw error;

      // Update likes_count in marketplace_designs
      const { error: updateError } = await supabase.rpc('increment_likes', { row_id: product.id });
      if (updateError) {
        // Fallback if RPC doesn't exist
        const { data: currentData } = await supabase
          .from('marketplace_designs')
          .select('likes_count')
          .eq('id', product.id)
          .single();
        
        await supabase
          .from('marketplace_designs')
          .update({ likes_count: (currentData?.likes_count || 0) + 1 })
          .eq('id', product.id);
      }

      // Update local state for immediate feedback
      setProduct(prev => prev ? { ...prev, likes_count: (prev.likes_count || 0) + 1 } : null);

      setIsWishlisted(true);
    } catch (err) {
      console.error("Error adding to wishlist:", err);
    } finally {
      setIsWishlisting(false);
    }
  };

  const confirmUnwishlist = async () => {
    if (!product || !user) return;

    setIsWishlisting(true);
    try {
      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("design_id", product.id);
      
      if (error) throw error;

      // Update likes_count in marketplace_designs
      const { error: updateError } = await supabase.rpc('decrement_likes', { row_id: product.id });
      if (updateError) {
        // Fallback if RPC doesn't exist
        const { data: currentData } = await supabase
          .from('marketplace_designs')
          .select('likes_count')
          .eq('id', product.id)
          .single();
        
        await supabase
          .from('marketplace_designs')
          .update({ likes_count: Math.max(0, (currentData?.likes_count || 0) - 1) })
          .eq('id', product.id);
      }

      // Update local state for immediate feedback
      setProduct(prev => prev ? { ...prev, likes_count: Math.max(0, (prev.likes_count || 0) - 1) } : null);

      setIsWishlisted(false);
      setShowUnwishlistConfirm(false);
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    } finally {
      setIsWishlisting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
      <button 
        onClick={() => navigate("/marketplace")}
        className="text-[#0066cc] font-bold hover:underline flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </button>
    </div>
  );

  return (
    <div className="bg-white min-h-screen pb-20">
      <ShareModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        product={product}
        shareUrl={window.location.href}
      />

      <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-8">
        {/* Breadcrumbs / Back */}
        <button 
          onClick={() => navigate("/marketplace")}
          className="mb-8 text-gray-500 hover:text-[#333] flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Marketplace
        </button>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Left Column: Image */}
          <div className="flex-1">
            <div className="relative aspect-square bg-[#f4f4f4] rounded-lg overflow-hidden border border-gray-100 shadow-sm">
              <img 
                src={product.image_url} 
                alt={product.title} 
                className="w-full h-full object-contain p-8"
              />
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => setIsShareModalOpen(true)}
                  className="p-2.5 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
                <button 
                  onClick={toggleWishlist}
                  disabled={isWishlisting}
                  className={`p-2.5 bg-white rounded-lg shadow-md transition-colors border border-gray-100 ${isWishlisted ? 'text-red-500' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {isWishlisting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="w-full md:w-[380px] lg:w-[420px] flex flex-col">
            <div className="mb-6">
              <h1 className="text-[24px] md:text-[32px] font-bold text-[#333] leading-tight mb-2">
                {product.title}
              </h1>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-red-500 rounded-sm flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <p className="text-[15px] text-gray-600">
                  Die cut stickers by <span className="text-[#0066cc] hover:underline cursor-pointer font-medium">{product.author_name}</span>
                </p>
              </div>
            </div>

            {/* Size */}
            <div className="mb-6">
              <h3 className="text-[14px] font-bold text-[#333] mb-2">Size</h3>
              <div className="flex items-center gap-2 text-[14px] text-gray-600">
                <span>4.21 × 0.75 in</span>
                <Info className="w-4 h-4 text-[#0066cc] cursor-pointer" />
              </div>
            </div>

            {/* Quantity Dropdown */}
            <div className="mb-6 relative">
              <h3 className="text-[14px] font-bold text-[#333] mb-2">Quantity</h3>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md hover:border-gray-400 transition-all bg-white"
              >
                <span className="text-[15px] text-[#333]">
                  {selectedQuantity.label} • ${selectedQuantity.price}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-xl z-20 overflow-hidden"
                  >
                    {quantityOptions.map((option) => (
                      <button
                        key={option.label}
                        onClick={() => {
                          setSelectedQuantity(option);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between transition-colors ${selectedQuantity.label === option.label ? 'bg-blue-50' : ''}`}
                      >
                        <div className="flex flex-col">
                          <span className="text-[15px] font-medium text-[#333]">{option.label}</span>
                          <span className="text-[12px] text-gray-500">${option.perSticker} per sticker</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[15px] font-bold text-[#333]">${option.price}</span>
                          {option.save && (
                            <div className="text-[11px] font-bold text-green-600">Save {option.save}</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {selectedQuantity.save && (
                <p className="mt-2 text-[13px] text-green-600 font-medium">
                  Save {selectedQuantity.save} when you add {selectedQuantity.label}
                </p>
              )}
            </div>

            {/* Price & Shipping */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span className="text-[24px] font-bold text-[#333]">${selectedQuantity.price}</span>
                <span className="text-[15px] text-gray-500">+ Free shipping</span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button 
              onClick={handleAddToCart}
              disabled={isAdded}
              className={`w-full py-4 rounded-md font-bold text-[16px] transition-all shadow-md flex items-center justify-center gap-2 ${
                isAdded 
                ? "bg-green-600 text-white" 
                : "bg-[#ff7a00] hover:bg-[#e66e00] text-white"
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-5 h-5" /> Added to cart
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" /> Add to cart
                </>
              )}
            </button>

            {/* Secondary Buttons (Commented out for now) */}
            {/* 
            <div className="grid grid-cols-2 gap-3 mt-3">
              <button className="py-3 border border-gray-300 rounded-md font-bold text-[14px] text-[#333] hover:bg-gray-50 transition-colors">
                Send as a gift
              </button>
              <button className="py-3 border border-gray-300 rounded-md font-bold text-[14px] text-[#333] hover:bg-gray-50 transition-colors">
                Run a giveaway
              </button>
            </div>
            */}

            {/* Features List */}
            <div className="mt-8 space-y-4 border-t border-gray-100 pt-8">
              <div className="flex items-center gap-3 text-gray-600">
                <Truck className="w-5 h-5 text-gray-400" />
                <span className="text-[14px]">Free shipping</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Printer className="w-5 h-5 text-gray-400" />
                <span className="text-[14px]">Full color printing</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <ShieldCheck className="w-5 h-5 text-gray-400" />
                <span className="text-[14px]">
                  Durable & <span className="text-[#0066cc] hover:underline cursor-pointer">weatherproof</span>
                </span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-[14px] font-bold text-[#333]">
                  4.9 <span className="text-gray-400 font-normal">(89,195)</span>
                </span>
              </div>
            </div>

            {/* Stats Footer */}
            <div className="mt-8 pt-8 border-t border-gray-100 flex items-center gap-6 text-[13px] font-medium text-gray-500">
              <div className="flex items-center gap-1.5 hover:text-[#333] cursor-pointer">
                <Heart className="w-4 h-4" />
                <span>{product.likes_count} likes</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-[#333] cursor-pointer">
                <ShoppingCart className="w-4 h-4" />
                <span>{product.cart_count} orders</span>
              </div>
              <div className="flex items-center gap-1.5 hover:text-[#333] cursor-pointer">
                <MessageSquare className="w-4 h-4" />
                <span>0 comments</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showUnwishlistConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUnwishlistConfirm(false)}
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
                Are you sure you want to remove <span className="font-bold text-gray-700">"{product.title}"</span> from your wishlist?
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowUnwishlistConfirm(false)}
                  className="flex-1 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmUnwishlist}
                  disabled={isWishlisting}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                >
                  {isWishlisting ? (
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
