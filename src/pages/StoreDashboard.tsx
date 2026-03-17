import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Store, 
  Plus, 
  Settings, 
  LayoutGrid, 
  TrendingUp, 
  Users, 
  Heart, 
  ShoppingCart, 
  Edit, 
  Trash2, 
  Loader2, 
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  Globe,
  Instagram,
  Twitter,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

interface StoreData {
  id: string;
  name: string;
  description: string;
  logo_url: string;
  banner_url: string;
  website_url: string;
  instagram_url: string;
  twitter_url: string;
}

interface Design {
  id: string;
  title: string;
  image_url: string;
  category: string;
  likes_count: number;
  cart_count: number;
  created_at: string;
}

export default function StoreDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<StoreData | null>(null);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Design | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchStoreData = async () => {
      try {
        // Fetch store
        const { data: storeData, error: storeError } = await supabase
          .from('stores')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        if (storeError) throw storeError;
        setStore(storeData);

        // Fetch designs
        const { data: designsData, error: designsError } = await supabase
          .from('marketplace_designs')
          .select('*')
          .eq('store_id', storeData.id)
          .order('created_at', { ascending: false });

        if (designsError) throw designsError;
        setDesigns(designsData || []);

      } catch (err) {
        console.error('Error fetching store data:', err);
        navigate('/create-store');
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [user, navigate]);

  const handleDeleteDesign = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(itemToDelete.id);
    try {
      const { error } = await supabase
        .from('marketplace_designs')
        .delete()
        .eq('id', itemToDelete.id);

      if (error) throw error;
      setDesigns(designs.filter(d => d.id !== itemToDelete.id));
      setItemToDelete(null);
    } catch (err) {
      console.error('Error deleting design:', err);
      alert('Failed to delete design.');
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!store) return null;

  const totalLikes = designs.reduce((acc, d) => acc + (d.likes_count || 0), 0);
  const totalSales = designs.reduce((acc, d) => acc + (d.cart_count || 0), 0);

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      {/* Store Banner */}
      <div className="h-48 sm:h-64 lg:h-80 bg-gray-200 relative overflow-hidden">
        {store.banner_url ? (
          <img src={store.banner_url} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-[#f37021] to-[#ff9d5c]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-32 relative z-10 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Info */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-24 h-24 bg-white rounded-2xl shadow-md border-4 border-white -mt-16 mb-4 overflow-hidden">
                  {store.logo_url ? (
                    <img src={store.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <Store className="w-10 h-10 text-gray-300" />
                    </div>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
                <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                  {store.description || 'No description provided.'}
                </p>
              </div>

              <div className="flex justify-center gap-4 mb-8">
                {store.website_url && (
                  <a href={store.website_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:text-[#f37021] transition-colors">
                    <Globe className="w-5 h-5" />
                  </a>
                )}
                {store.instagram_url && (
                  <a href={store.instagram_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:text-[#f37021] transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {store.twitter_url && (
                  <a href={store.twitter_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-50 rounded-lg text-gray-400 hover:text-[#f37021] transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                )}
              </div>

              <div className="space-y-2">
                <Link 
                  to="/store-settings"
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
                >
                  <Settings className="w-4 h-4" />
                  Store Settings
                </Link>
                <Link 
                  to={`/marketplace?store=${store.id}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Public Page
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <Heart className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Likes</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{totalLikes}</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 text-gray-400 mb-1">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Sales</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{totalSales}</div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 sm:p-6 mb-8 border border-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#f37021] rounded-2xl shadow-lg shadow-[#f37021]/20">
                  <LayoutGrid className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Your Designs</h2>
                  <p className="text-sm text-gray-500 font-medium">Manage and track your marketplace items</p>
                </div>
                <span className="hidden sm:flex px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                  {designs.length} Items
                </span>
              </div>
              <Link 
                to="/store-upload"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#f37021] text-white rounded-xl font-bold text-sm hover:bg-[#e0661e] transition-all shadow-lg shadow-[#f37021]/30 transform hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5" />
                Upload New Design
              </Link>
            </div>

            {designs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {designs.map((design) => (
                  <motion.div 
                    layout
                    key={design.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden bg-gray-50">
                      <img 
                        src={design.image_url} 
                        alt={design.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button 
                          onClick={() => navigate(`/store-upload?edit=${design.id}`)}
                          className="p-3 bg-white rounded-xl text-gray-900 hover:bg-[#f37021] hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => setItemToDelete(design)}
                          disabled={isDeleting === design.id}
                          className="p-3 bg-white rounded-xl text-red-600 hover:bg-red-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75"
                        >
                          {isDeleting === design.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900 truncate pr-4">{design.title}</h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-gray-100 text-gray-500 rounded">
                          {design.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Heart className="w-4 h-4" />
                          <span className="text-xs font-bold">{design.likes_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ShoppingCart className="w-4 h-4" />
                          <span className="text-xs font-bold">{design.cart_count || 0}</span>
                        </div>
                        <div className="ml-auto text-[10px] font-medium">
                          {new Date(design.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ImageIcon className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No designs yet</h3>
                <p className="text-gray-500 max-w-sm mx-auto mb-8">
                  Start uploading your artwork to the marketplace and start earning from every sale.
                </p>
                <Link 
                  to="/store-upload"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-[#f37021] text-white rounded-xl font-bold hover:bg-[#e0661e] transition-all shadow-lg shadow-[#f37021]/20"
                >
                  <Plus className="w-5 h-5" />
                  Upload Your First Design
                </Link>
              </div>
            )}
          </div>
        </div>
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
              <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Design?</h3>
              <p className="text-gray-500 text-center text-sm mb-6">
                Are you sure you want to delete <span className="font-bold text-gray-700">"{itemToDelete.title}"</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteDesign}
                  disabled={isDeleting === itemToDelete.id}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                >
                  {isDeleting === itemToDelete.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Delete"
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
