import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Upload, 
  X, 
  Check, 
  ArrowLeft, 
  Image as ImageIcon, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  Tag
} from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

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

export default function StoreUpload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!editId);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string>('');
  const [storeLogo, setStoreLogo] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    category: 'Stickers',
    image_url: '',
  });

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchStore = async () => {
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('id, name, logo_url')
          .eq('owner_id', user.id)
          .single();

        if (error) throw error;
        setStoreId(data.id);
        setStoreName(data.name);
        setStoreLogo(data.logo_url);

        if (editId) {
          const { data: design, error: designError } = await supabase
            .from('marketplace_designs')
            .select('*')
            .eq('id', editId)
            .eq('store_id', data.id)
            .single();

          if (designError) throw designError;
          setFormData({
            title: design.title,
            category: design.category,
            image_url: design.image_url
          });
        }
      } catch (err) {
        console.error('Error fetching store:', err);
        navigate('/create-store');
      } finally {
        setFetching(false);
      }
    };

    fetchStore();
  }, [user, navigate, editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId || !user) return;

    setLoading(true);
    setError(null);

    try {
      if (editId) {
        const { error: updateError } = await supabase
          .from('marketplace_designs')
          .update({
            title: formData.title,
            category: formData.category,
            image_url: formData.image_url,
          })
          .eq('id', editId);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('marketplace_designs')
          .insert([
            {
              store_id: storeId,
              title: formData.title,
              category: formData.category,
              image_url: formData.image_url,
              author_name: storeName,
              author_avatar: storeLogo || 'https://picsum.photos/seed/avatar/200/200',
              likes_count: 0,
              cart_count: 0
            }
          ]);

        if (insertError) throw insertError;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/store-dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Error saving design:', err);
      setError(err.message || 'Failed to save design. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#f37021]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] py-12 px-4">
      <div className="max-w-[800px] mx-auto">
        <button 
          onClick={() => navigate('/store-dashboard')}
          className="flex items-center text-[#0066cc] font-bold hover:underline mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {editId ? 'Edit Design' : 'Upload New Design'}
              </h1>
              <p className="text-gray-500 text-sm">Add your artwork to the marketplace.</p>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <ImageIcon className="w-6 h-6 text-[#f37021]" />
            </div>
          </div>

          <div className="p-8">
            {success ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Design {editId ? 'updated' : 'uploaded'} successfully!
                </h2>
                <p className="text-gray-500">Redirecting you to your dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column: Preview */}
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700">Design Preview</label>
                    <div className="aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden relative group">
                      {formData.image_url ? (
                        <>
                          <img 
                            src={formData.image_url} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, image_url: ''})}
                            className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white text-red-500 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-6">
                          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                            <Upload className="w-8 h-8 text-gray-300" />
                          </div>
                          <p className="text-sm text-gray-400">Enter an image URL to see a preview</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Details */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Design Title *</label>
                      <input 
                        required
                        type="text" 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f37021] outline-none transition-all"
                        placeholder="e.g. Space Cat Sticker"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Category *</label>
                      <div className="relative">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select 
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f37021] outline-none transition-all appearance-none bg-white"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Image URL *</label>
                      <input 
                        required
                        type="url" 
                        value={formData.image_url}
                        onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f37021] outline-none transition-all"
                        placeholder="https://example.com/artwork.jpg"
                      />
                      <p className="text-[11px] text-gray-400 mt-2">
                        Use a high-quality image URL (PNG, JPG, or SVG).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => navigate('/store-dashboard')}
                    className="flex-1 py-4 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={loading || !formData.image_url || !formData.title}
                    className="flex-[2] py-4 bg-[#f37021] text-white rounded-xl font-bold text-lg hover:bg-[#e0661e] transition-all shadow-lg shadow-[#f37021]/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-6 h-6" />
                        {editId ? 'Update Design' : 'Publish Design'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
