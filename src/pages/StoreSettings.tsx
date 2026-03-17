import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, ArrowLeft, Loader2, CheckCircle, AlertCircle, Globe, Instagram, Twitter, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function StoreSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [storeId, setStoreId] = useState<string | null>(null);

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

    const fetchStore = async () => {
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        if (error) throw error;
        
        setStoreId(data.id);
        setFormData({
          name: data.name || '',
          description: data.description || '',
          logo_url: data.logo_url || '',
          banner_url: data.banner_url || '',
          website_url: data.website_url || '',
          instagram_url: data.instagram_url || '',
          twitter_url: data.twitter_url || ''
        });
      } catch (err) {
        console.error('Error fetching store:', err);
        navigate('/create-store');
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId || !user) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from('stores')
        .update(formData)
        .eq('id', storeId);

      if (updateError) throw updateError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error updating store:', err);
      setError(err.message || 'Failed to update store. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

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
              <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
              <p className="text-gray-500 text-sm">Update your store profile and social links.</p>
            </div>
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <Store className="w-6 h-6 text-[#f37021]" />
            </div>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-3 text-green-600">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">Store settings updated successfully!</p>
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
                  disabled={saving}
                  className="w-full py-4 bg-[#f37021] text-white rounded-xl font-bold text-lg hover:bg-[#e0661e] transition-all shadow-lg shadow-[#f37021]/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-6 h-6" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
