import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, ChevronRight, Check, Search, Filter, X, Loader2, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import LoadingSpinner from "../components/LoadingSpinner";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

// Categories definition
const categories = [
  "Stickers",
  "Labels",
  "Magnets",
  "Buttons",
  "Packaging",
  "Apparel",
  "Acrylics",
  "More products"
];

export default function Marketplace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Popular");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [isWishlisting, setIsWishlisting] = useState<string | null>(null);
  const [itemToUnwishlist, setItemToUnwishlist] = useState<any | null>(null);
  const itemsPerPage = 12;

  const [hasStore, setHasStore] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('marketplace_designs')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching marketplace designs:', error);
        } else {
          setProducts(data || []);
        }

        // Fetch user's wishlist
        if (user) {
          const { data: wishlistData } = await supabase
            .from('wishlist')
            .select('design_id')
            .eq('user_id', user.id);
          
          if (wishlistData) {
            setWishlistIds(new Set(wishlistData.map(item => item.design_id)));
          }

          // Check if user has a store
          const { data: storeData } = await supabase
            .from('stores')
            .select('id')
            .eq('owner_id', user.id)
            .single();
          
          setHasStore(!!storeData);
        } else {
          setHasStore(false);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user]);

  const toggleWishlist = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    if (isWishlisting) return;

    // If already in wishlist, show confirmation modal
    if (wishlistIds.has(productId)) {
      const product = products.find(p => p.id === productId);
      setItemToUnwishlist(product);
      return;
    }

    // Otherwise, add directly
    setIsWishlisting(productId);
    try {
      const { error } = await supabase
        .from("wishlist")
        .insert([{ user_id: user.id, design_id: productId }]);
      
      if (error) throw error;

      // Update likes_count in marketplace_designs
      const { error: updateError } = await supabase.rpc('increment_likes', { row_id: productId });
      if (updateError) {
        // Fallback if RPC doesn't exist
        const { data: currentData } = await supabase
          .from('marketplace_designs')
          .select('likes_count')
          .eq('id', productId)
          .single();
        
        await supabase
          .from('marketplace_designs')
          .update({ likes_count: (currentData?.likes_count || 0) + 1 })
          .eq('id', productId);
      }

      // Update local state for immediate feedback
      setProducts(prev => prev.map(p => 
        p.id === productId 
          ? { ...p, likes_count: (p.likes_count || 0) + 1 } 
          : p
      ));

      setWishlistIds(prev => {
        const next = new Set(prev);
        next.add(productId);
        return next;
      });
    } catch (err) {
      console.error("Error adding to wishlist:", err);
    } finally {
      setIsWishlisting(null);
    }
  };

  const confirmUnwishlist = async () => {
    if (!itemToUnwishlist || !user) return;

    setIsWishlisting(itemToUnwishlist.id);
    try {
      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("user_id", user.id)
        .eq("design_id", itemToUnwishlist.id);
      
      if (error) throw error;

      // Update likes_count in marketplace_designs
      const { error: updateError } = await supabase.rpc('decrement_likes', { row_id: itemToUnwishlist.id });
      if (updateError) {
        // Fallback if RPC doesn't exist
        const { data: currentData } = await supabase
          .from('marketplace_designs')
          .select('likes_count')
          .eq('id', itemToUnwishlist.id)
          .single();
        
        await supabase
          .from('marketplace_designs')
          .update({ likes_count: Math.max(0, (currentData?.likes_count || 0) - 1) })
          .eq('id', itemToUnwishlist.id);
      }

      // Update local state for immediate feedback
      setProducts(prev => prev.map(p => 
        p.id === itemToUnwishlist.id 
          ? { ...p, likes_count: Math.max(0, (p.likes_count || 0) - 1) } 
          : p
      ));

      setWishlistIds(prev => {
        const next = new Set(prev);
        next.delete(itemToUnwishlist.id);
        return next;
      });
      setItemToUnwishlist(null);
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    } finally {
      setIsWishlisting(null);
    }
  };

  // Calculate counts for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    categories.forEach(cat => {
      counts[cat] = products.filter(p => p.category === cat).length;
    });
    return counts;
  }, [products]);

  // Filter and sort products based on active tab and selected categories
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }

    if (activeTab === "Following") {
      result = result.filter(
        (p) =>
          p.author === "Claude Code" || p.author === "Constantino For Congress" || p.author_name === "Claude Code",
      );
    } else if (activeTab === "Newest") {
      result.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA || b.id - a.id;
      });
    } else {
      // Popular
      result.sort((a, b) => (b.likes_count || b.likes) - (a.likes_count || a.likes));
    }

    return result;
  }, [activeTab, selectedCategories, products]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Get current page products
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleTabClick = (tab: string) => {
    setLoading(true);
    setActiveTab(tab);
    setCurrentPage(1); // Reset page when tab changes
    setTimeout(() => setLoading(false), 300); // Simulate a short loading delay
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Generate pagination numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Top Navigation Tabs */}
      <div className="border-b border-gray-200 sticky top-0 bg-white z-30">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex items-center justify-between">
          <div className="flex gap-4 sm:gap-8">
            {["Popular", "Following", "Newest"].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`py-4 text-[14px] sm:text-[15px] border-b-4 transition-all ${
                  activeTab === tab
                    ? "text-[#333] border-[#ff7a00]"
                    : "text-gray-500 border-transparent hover:text-[#333]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Mobile Filter Button */}
          <button 
            onClick={() => setIsFilterDrawerOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-[13px] font-bold text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {selectedCategories.length > 0 && (
              <span className="w-5 h-5 bg-[#ff7a00] text-white rounded-full flex items-center justify-center text-[10px]">
                {selectedCategories.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Drawer (Mobile/Tablet) */}
      <AnimatePresence>
        {isFilterDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterDrawerOpen(false)}
              className="fixed inset-0 bg-black/40 z-[60] lg:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[300px] bg-white z-[70] lg:hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <button 
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Categories</h3>
                  <div className="relative mb-4">
                    <input
                      type="text"
                      placeholder="Find a category"
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      className="w-full border border-gray-200 rounded-lg py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-[#ff7a00]"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                  <div className="space-y-3">
                    {categories
                      .filter(cat => cat.toLowerCase().includes(categorySearch.toLowerCase()))
                      .map(category => {
                        const count = categoryCounts[category] || 0;
                        const isSelected = selectedCategories.includes(category);
                        return (
                          <label key={category} className="flex items-center justify-between group cursor-pointer">
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 border rounded flex items-center justify-center transition-all ${isSelected ? 'bg-black border-black' : 'border-gray-200'}`}>
                                {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />}
                              </div>
                              <span className={`text-sm ${isSelected ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                                {category}
                              </span>
                            </div>
                            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}>
                              {count}
                            </span>
                            <input
                              type="checkbox"
                              className="hidden"
                              checked={isSelected}
                              onChange={() => {
                                if (isSelected) {
                                  setSelectedCategories(selectedCategories.filter(c => c !== category));
                                } else {
                                  setSelectedCategories([...selectedCategories, category]);
                                }
                                setCurrentPage(1);
                              }}
                            />
                          </label>
                        );
                      })}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
                <button 
                  onClick={() => {
                    setSelectedCategories([]);
                    setCurrentPage(1);
                  }}
                  className="flex-1 py-3 text-sm font-bold text-gray-600 hover:text-gray-900"
                >
                  Reset
                </button>
                <button 
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="flex-1 py-3 bg-black text-white rounded-xl font-bold text-sm shadow-lg shadow-black/10"
                >
                  Show Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left Column: Products Grid */}
        <div className="flex-1">
          {loading ? (
            <LoadingSpinner />
          ) : currentProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProducts.map((product) => (
                <Link 
                  to={`/marketplace/${product.id}`}
                  key={product.id} 
                  className="group cursor-pointer"
                >
                  {/* Image Container */}
                  <div className="bg-[#f4f4f4] aspect-[4/3] rounded-md overflow-hidden mb-3 relative group/img">
                    <img
                      src={product.image_url || product.image}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover/img:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => toggleWishlist(e, product.id)}
                        className={`p-1.5 bg-white rounded-lg shadow-sm transition-colors ${wishlistIds.has(product.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                      >
                        {isWishlisting === product.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Heart className={`w-4 h-4 ${wishlistIds.has(product.id) ? 'fill-current' : ''}`} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <img
                        src={product.author_avatar || product.avatar}
                        alt={product.author_name || product.author}
                        className="w-6 h-6 rounded-full shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="overflow-hidden">
                        <h3 className="text-[13px] font-bold text-[#333] truncate leading-tight group-hover:text-[#0066cc] transition-colors">
                          {product.title}
                        </h3>
                        <p className="text-[12px] text-gray-500 truncate leading-tight mt-0.5">
                          {product.author_name || product.author}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 shrink-0 ml-2 text-gray-400">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 fill-current" />
                        <span className="text-[12px] font-medium">
                          {product.likes_count ?? product.likes}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ShoppingCart className="w-3.5 h-3.5 fill-current" />
                        <span className="text-[12px] font-medium">
                          {product.cart_count ?? product.cart}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-[#333] mb-1">No designs found</h3>
              <p className="text-gray-500 max-w-xs mx-auto">
                We couldn't find any designs matching your selected filters. Try adjusting your categories or search.
              </p>
              <button 
                onClick={() => {
                  setSelectedCategories([]);
                  setCategorySearch("");
                }}
                className="mt-6 text-[#0066cc] font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="mt-12 flex flex-col items-center">
              <div className="flex items-center gap-1 mb-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 px-3 flex items-center justify-center border border-gray-200 text-gray-600 rounded text-sm hover:bg-gray-50 gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" /> Prev
                </button>
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-8 h-8 flex items-center justify-center border rounded text-sm ${
                      currentPage === page
                        ? "border-[#0066cc] text-[#0066cc] font-medium"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 px-3 flex items-center justify-center border border-gray-200 text-gray-600 rounded text-sm hover:bg-gray-50 gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[13px] text-gray-500">
                Page{" "}
                <span className="font-bold text-[#0066cc]">{currentPage}</span>{" "}
                of {totalPages}
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Sidebar */}
        <div className="w-full lg:w-[280px] shrink-0 flex flex-col gap-10">
          {/* Sell your merch */}
          <div className="bg-gray-50 lg:bg-transparent p-6 lg:p-0 rounded-xl lg:rounded-none border border-gray-100 lg:border-none">
            <h2 className="text-[18px] font-bold text-[#333] mb-2">
              Sell your merch
            </h2>
            <p className="text-[14px] text-gray-600 mb-4 leading-relaxed">
              We handle fulfillment and support so you can focus on making
              money.
            </p>
            <div className="flex flex-col gap-2">
              {hasStore ? (
                <Link 
                  to="/store-dashboard"
                  className="w-full bg-[#0066cc] hover:bg-[#0052a3] text-white font-bold py-2.5 px-4 rounded transition-colors text-[15px] flex items-center justify-center gap-2"
                >
                  Manage your store
                </Link>
              ) : (
                <Link 
                  to="/create-store"
                  className="w-full bg-[#0066cc] hover:bg-[#0052a3] text-white font-bold py-2.5 px-4 rounded transition-colors text-[15px] flex items-center justify-center gap-2"
                >
                  Create a store
                </Link>
              )}
              <button className="w-full bg-[#f4f4f4] hover:bg-[#e5e5e5] text-[#333] font-bold py-2.5 px-4 rounded transition-colors text-[15px]">
                Learn more
              </button>
            </div>
          </div>

          {/* Product Categories Filter (Desktop Only) */}
          <div className="hidden lg:block">
            <h2 className="text-[18px] font-bold text-[#333] mb-2 uppercase tracking-tight">
              Product Categories
            </h2>
            <div className="h-px bg-gray-200 w-full mb-6"></div>

            {/* Search Category */}
            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Find a category"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full border border-gray-300 rounded-md py-2.5 pl-4 pr-10 text-[15px] focus:outline-none focus:border-gray-400"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>

            {/* Category List */}
            <div className="flex flex-col gap-3">
              {categories
                .filter(cat => cat.toLowerCase().includes(categorySearch.toLowerCase()))
                .map(category => {
                  const count = categoryCounts[category] || 0;
                  const isSelected = selectedCategories.includes(category);
                  
                  return (
                    <label key={category} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 border rounded flex items-center justify-center transition-all ${isSelected ? 'bg-black border-black' : 'border-gray-300 group-hover:border-gray-400'}`}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />}
                        </div>
                        <span className={`text-[16px] transition-colors ${isSelected ? 'font-bold text-[#333]' : 'text-gray-600 group-hover:text-[#333]'}`}>
                          {category}
                        </span>
                      </div>
                      <span className={`text-[12px] font-bold px-1.5 py-0.5 rounded min-w-[24px] text-center transition-colors ${isSelected ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {count}
                      </span>
                      <input
                        type="checkbox"
                        className="hidden"
                        checked={isSelected}
                        onChange={() => {
                          if (isSelected) {
                            setSelectedCategories(selectedCategories.filter(c => c !== category));
                          } else {
                            setSelectedCategories([...selectedCategories, category]);
                          }
                          setCurrentPage(1); // Reset to first page on filter change
                        }}
                      />
                    </label>
                  );
                })}
            </div>
            
            {selectedCategories.length > 0 && (
              <button 
                onClick={() => {
                  setSelectedCategories([]);
                  setCurrentPage(1);
                }}
                className="mt-6 text-[14px] font-bold text-[#0066cc] hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {itemToUnwishlist && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setItemToUnwishlist(null)}
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
                Are you sure you want to remove <span className="font-bold text-gray-700">"{itemToUnwishlist.title}"</span> from your wishlist?
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setItemToUnwishlist(null)}
                  className="flex-1 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmUnwishlist}
                  disabled={isWishlisting === itemToUnwishlist.id}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                >
                  {isWishlisting === itemToUnwishlist.id ? (
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
