import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Save, 
  Image as ImageIcon, 
  Layout, 
  Tag, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  Edit2,
  ChevronRight,
  Monitor,
  Smartphone,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function Content() {
  const [content, setContent] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase.from('content').select('*');
      if (error) throw error;
      setContent(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (key: string, value: string) => {
    setIsSaving(true);
    try {
      // Upsert logic: check if exists first
      const existing = content.find(c => c.key === key);
      
      let error;
      if (existing) {
        const res = await supabase.from('content').update({ value }).eq('key', key);
        error = res.error;
      } else {
        const res = await supabase.from('content').insert([{ key, value }]);
        error = res.error;
      }

      if (!error) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        fetchContent();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const getContentValue = (key: string) => {
    return content.find(c => c.key === key)?.value || '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-sm text-gray-500 mt-1">Customize your homepage banners, deals, and marketplace content</p>
        </div>
        {showSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-bold animate-in fade-in slide-in-from-top-2">
            <CheckCircle className="w-4 h-4" /> Changes saved successfully!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Sections */}
        <div className="lg:col-span-2 space-y-8">
          {/* Homepage Banners */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Layout className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Homepage Banners</h2>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-400">
                  <Monitor className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-400">
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-700">Main Hero Banner</h3>
                  <button className="text-xs font-bold text-[#f37021] hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Add Slide
                  </button>
                </div>
                <div className="p-4 border border-gray-200 rounded-xl space-y-4">
                  <div className="aspect-[21/9] bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden relative group">
                    <img 
                      src="https://picsum.photos/seed/banner1/1200/400" 
                      alt="Banner" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button className="px-4 py-2 bg-white rounded-lg text-sm font-bold text-gray-900 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> Change Image
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Headline</label>
                      <input 
                        type="text" 
                        defaultValue="Custom Stickers for Everyone"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f37021] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Button Text</label>
                      <input 
                        type="text" 
                        defaultValue="Shop Now"
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f37021] outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Sub-headline</label>
                      <input 
                        type="text" 
                        defaultValue="High quality vinyl stickers with free shipping worldwide."
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f37021] outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button 
                      onClick={() => handleSave('hero_banner', 'updated')}
                      className="px-4 py-2 bg-[#f37021] text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#e56a17] transition-colors"
                    >
                      <Save className="w-4 h-4" /> Save Banner
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Deals Section */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                  <Tag className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Deals & Promotions</h2>
              </div>
              <button className="text-xs font-bold text-[#f37021] hover:underline flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Deal
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">10 Custom Stickers for $1</p>
                      <p className="text-xs text-gray-500">Active • Ends in 3 days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="bg-[#1a1a1a] text-white p-6 rounded-2xl shadow-xl">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Content Health</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">SEO Score</span>
                <span className="text-sm font-bold text-green-400">92/100</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5">
                <div className="bg-green-400 h-1.5 rounded-full w-[92%]"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Image Optimization</span>
                <span className="text-sm font-bold text-yellow-400">78%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5">
                <div className="bg-yellow-400 h-1.5 rounded-full w-[78%]"></div>
              </div>
            </div>
            <button className="w-full mt-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" /> Run Content Audit
            </button>
          </div>

          {/* Marketplace Content */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Marketplace</h3>
            </div>
            <div className="space-y-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                Control which artist designs are featured on the marketplace landing page.
              </p>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700">
                  Featured Artists <ChevronRight className="w-4 h-4" />
                </button>
                <button className="w-full flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700">
                  Trending Collections <ChevronRight className="w-4 h-4" />
                </button>
                <button className="w-full flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-700">
                  New Arrivals <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
