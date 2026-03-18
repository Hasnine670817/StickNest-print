import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  Edit, 
  ExternalLink,
  Heart,
  ShoppingCart,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../../components/LoadingSpinner';
import { motion, AnimatePresence } from 'motion/react';

interface MarketplaceDesign {
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

export default function AdminMarketplace() {
  const [designs, setDesigns] = useState<MarketplaceDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDesign, setEditingDesign] = useState<MarketplaceDesign | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MarketplaceDesign | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image_url' | 'author_avatar') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `marketplace/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);
        
      setDesignForm({ ...designForm, [field]: data.publicUrl });
      console.log('Upload successful, URL:', data.publicUrl);
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Error uploading file: ' + (err as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  // New/Edit design form state
  const [designForm, setDesignForm] = useState({
    title: '',
    author_name: '',
    author_avatar: '',
    image_url: '',
    category: 'Stickers',
    likes_count: 0,
    cart_count: '0'
  });

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('marketplace_designs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDesigns(data || []);
    } catch (err) {
      console.error('Error fetching designs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('marketplace_designs')
        .insert([designForm])
        .select();

      if (error) throw error;
      
      setDesigns([data[0], ...designs]);
      setIsAddModalOpen(false);
      resetForm();
    } catch (err) {
      console.error('Error adding design:', err);
      alert('Failed to add design.');
    }
  };

  const handleUpdateDesign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDesign) return;

    try {
      const { data, error } = await supabase
        .from('marketplace_designs')
        .update(designForm)
        .eq('id', editingDesign.id)
        .select();

      if (error) throw error;
      
      setDesigns(designs.map(d => d.id === editingDesign.id ? data[0] : d));
      setIsEditModalOpen(false);
      setEditingDesign(null);
      resetForm();
    } catch (err) {
      console.error('Error updating design:', err);
      alert('Failed to update design.');
    }
  };

  const resetForm = () => {
    setDesignForm({
      title: '',
      author_name: '',
      author_avatar: '',
      image_url: '',
      category: 'Stickers',
      likes_count: 0,
      cart_count: '0'
    });
  };

  const openEditModal = (design: MarketplaceDesign) => {
    setEditingDesign(design);
    setDesignForm({
      title: design.title,
      author_name: design.author_name,
      author_avatar: design.author_avatar,
      image_url: design.image_url,
      category: design.category,
      likes_count: design.likes_count,
      cart_count: design.cart_count
    });
    setIsEditModalOpen(true);
  };

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
      alert('Failed to delete design. Please check permissions.');
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredDesigns = designs.filter(design => {
    const matchesSearch = design.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         design.author_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || design.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketplace Management</h1>
          <p className="text-gray-500">Manage designs and products in the marketplace</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-[#f37021] hover:bg-[#e66012] text-white px-4 py-2 rounded-lg font-bold transition-all shadow-md"
        >
          <Plus className="w-5 h-5" />
          Add New Design
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search designs or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#f37021] focus:border-transparent outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 w-5 h-5" />
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#f37021] outline-none"
          >
            <option value="All">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Designs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDesigns.map((design) => (
          <div key={design.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden group hover:shadow-lg transition-all">
            <div className="aspect-[4/3] relative bg-gray-100">
              <img 
                src={design.image_url} 
                alt={design.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => openEditModal(design)}
                  className="p-2 bg-white/90 hover:bg-blue-50 text-blue-600 rounded-lg shadow-sm transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setItemToDelete(design)}
                  disabled={isDeleting === design.id}
                  className="p-2 bg-white/90 hover:bg-red-50 text-red-600 rounded-lg shadow-sm transition-colors"
                >
                  {isDeleting === design.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="absolute bottom-2 left-2">
                <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold rounded uppercase">
                  {design.category}
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-1">{design.title}</h3>
              <div className="flex items-center gap-2 mb-4">
                <img src={design.author_avatar} alt={design.author_name} className="w-5 h-5 rounded-full" />
                <span className="text-xs text-gray-500 truncate">{design.author_name}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <div className="flex items-center gap-3 text-gray-400">
                  <div className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5" />
                    <span className="text-xs">{design.likes_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span className="text-xs">{design.cart_count}</span>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400">
                  {new Date(design.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}

        {filteredDesigns.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <ImageIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No designs found</h3>
            <p className="text-gray-500">Try adjusting your filters or add a new design.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(isAddModalOpen || isEditModalOpen) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                setEditingDesign(null);
                resetForm();
              }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
                <h2 className="text-xl font-bold text-gray-900">
                  {isEditModalOpen ? 'Edit Design' : 'Add New Design'}
                </h2>
                <button 
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setIsEditModalOpen(false);
                    setEditingDesign(null);
                    resetForm();
                  }} 
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <XCircle className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              <form onSubmit={isEditModalOpen ? handleUpdateDesign : handleAddDesign} className="p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Design Title</label>
                  <input 
                    required
                    type="text" 
                    value={designForm.title}
                    onChange={(e) => setDesignForm({...designForm, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#f37021] outline-none"
                    placeholder="e.g. Awesome Sticker Pack"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Author Name</label>
                    <input 
                      required
                      type="text" 
                      value={designForm.author_name}
                      onChange={(e) => setDesignForm({...designForm, author_name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#f37021] outline-none"
                      placeholder="Author name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                    <select 
                      value={designForm.category}
                      onChange={(e) => setDesignForm({...designForm, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#f37021] outline-none"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Design Image</label>
                  <div className="flex flex-col gap-3">
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'image_url')}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#f37021] outline-none"
                    />
                    {isUploading && <p className="text-sm text-[#f37021]">Uploading...</p>}
                    <p className="text-xs text-gray-500">Or paste URL:</p>
                    <input 
                      required
                      type="url" 
                      value={designForm.image_url}
                      onChange={(e) => setDesignForm({...designForm, image_url: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#f37021] outline-none"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Author Avatar</label>
                  <div className="flex flex-col gap-3">
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'author_avatar')}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#f37021] outline-none"
                    />
                    <p className="text-xs text-gray-500">Or paste URL:</p>
                    <input 
                      required
                      type="url" 
                      value={designForm.author_avatar}
                      onChange={(e) => setDesignForm({...designForm, author_avatar: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#f37021] outline-none"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                </div>
                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setIsEditModalOpen(false);
                      setEditingDesign(null);
                      resetForm();
                    }}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all order-2 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-2.5 bg-[#f37021] text-white rounded-xl font-bold hover:bg-[#e66012] transition-all shadow-md order-1 sm:order-2"
                  >
                    {isEditModalOpen ? 'Update Design' : 'Add Design'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
