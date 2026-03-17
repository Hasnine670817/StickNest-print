import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ArrowLeft, Loader2, CheckCircle, AlertCircle, Globe, Instagram, Twitter } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function CreateStore() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingStore, setCheckingStore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo_url: '',
    banner_url: '',
    website_url: '',
    instagram_url: '',
    twitter_url: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const checkExistingStore = async () => {
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('id')
          .eq('owner_id', user.id)
          .single();

        if (data) {
          navigate('/store-dashboard');
        }
      } catch (err) {
        // No store found, which is what we want
      } finally {
        setCheckingStore(false);
      }
    };

    checkExistingStore();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('stores')
        .insert([
          {
            owner_id: user.id,
            ...formData
          }
        ]);

      if (insertError) throw insertError;

      setSuccess(true);
      setTimeout(() => {
        navigate('/store-dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('Error creating store:', err);
      setError(err.message || 'Failed to create store. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingStore) {
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
          onClick={() => navigate('/marketplace')}
          className="flex items-center text-[#0066cc] font-bold hover:underline mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Marketplace
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="bg-[#f37021] p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Store className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Create your store</h1>
                <p className="text-white/80">Start selling your designs to thousands of customers.</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {success ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Store created successfully!</h2>
                <p className="text-gray-500">Redirecting you to your dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Store Name *</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f37021] outline-none transition-all"
                      placeholder="e.g. Creative Stickers Studio"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                    <textarea 
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f37021] outline-none transition-all resize-none"
                      placeholder="Tell customers about your store and your design style..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Logo URL</label>
                    <input 
                      type="url" 
                      value={formData.logo_url}
                      onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f37021] outline-none transition-all"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Banner URL</label>
                    <input 
                      type="url" 
                      value={formData.banner_url}
                      onChange={(e) => setFormData({...formData, banner_url: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f37021] outline-none transition-all"
                      placeholder="https://example.com/banner.jpg"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 pt-4 border-t border-gray-100">Social Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="url" 
                          value={formData.website_url}
                          onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f37021] outline-none transition-all"
                          placeholder="Website"
                        />
                      </div>
                      <div className="relative">
                        <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="url" 
                          value={formData.instagram_url}
                          onChange={(e) => setFormData({...formData, instagram_url: e.target.value})}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f37021] outline-none transition-all"
                          placeholder="Instagram"
                        />
                      </div>
                      <div className="relative">
                        <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                          type="url" 
                          value={formData.twitter_url}
                          onChange={(e) => setFormData({...formData, twitter_url: e.target.value})}
                          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#f37021] outline-none transition-all"
                          placeholder="Twitter"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[#f37021] text-white rounded-xl font-bold text-lg hover:bg-[#e0661e] transition-all shadow-lg shadow-[#f37021]/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Store className="w-6 h-6" />
                        Create Store
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
