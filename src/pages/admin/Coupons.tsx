import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Plus, 
  Ticket, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Percent, 
  Clock,
  Search,
  Filter,
  MoreVertical,
  ChevronRight
} from 'lucide-react';

interface Coupon {
  id: number;
  code: string;
  discount_percentage: number;
  expiry_date: string;
  is_active: boolean;
  show_on_deals: boolean;
  is_hero: boolean;
  description: string;
  created_at: string;
}

export default function Coupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discount_percentage: '',
    expiry_date: '',
    description: '',
    show_on_deals: false,
    is_hero: false
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setCoupons(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // If setting as hero, unset other heroes first
      if (formData.is_hero) {
        await supabase.from('coupons').update({ is_hero: false }).eq('is_hero', true);
      }

      const { error } = await supabase.from('coupons').insert([{
        code: formData.code,
        discount_percentage: parseFloat(formData.discount_percentage),
        expiry_date: formData.expiry_date ? new Date(formData.expiry_date).toISOString() : null,
        description: formData.description,
        show_on_deals: formData.show_on_deals,
        is_hero: formData.is_hero,
        is_active: true
      }]);

      if (!error) {
        setIsModalOpen(false);
        setFormData({ code: '', discount_percentage: '', expiry_date: '', description: '', show_on_deals: false, is_hero: false });
        fetchCoupons();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('coupons').update({ is_active: !currentStatus }).eq('id', id);
      if (!error) fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleShowOnDeals = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('coupons').update({ show_on_deals: !currentStatus }).eq('id', id);
      if (!error) fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleHero = async (id: number, currentStatus: boolean) => {
    try {
      // If setting as hero, unset other heroes first
      if (!currentStatus) {
        await supabase.from('coupons').update({ is_hero: false }).eq('is_hero', true);
      }
      const { error } = await supabase.from('coupons').update({ is_hero: !currentStatus }).eq('id', id);
      if (!error) fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCoupon = async (id: number) => {
    try {
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (!error) {
        setDeleteConfirmId(null);
        fetchCoupons();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discounts & Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage promotional discount codes</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#f37021] text-white rounded-lg font-semibold hover:bg-[#e56a17] transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Create New Coupon
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Coupons</p>
              <h3 className="text-2xl font-bold text-gray-900">{coupons.filter(c => c.is_active).length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Average Discount</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {coupons.length > 0 
                  ? (coupons.reduce((acc, c) => acc + (c.discount_percentage || 0), 0) / coupons.length).toFixed(1) 
                  : 0}%
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-xl text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Redeemed</p>
              <h3 className="text-2xl font-bold text-gray-900">1,240</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search coupons..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f37021] outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Coupon Code</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Expiry Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">On Deals</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Hero Banner</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-3 border-[#f37021] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm text-gray-500">Loading coupons...</p>
                    </div>
                  </td>
                </tr>
              ) : coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                        <Ticket className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-gray-900 font-mono tracking-wider">{coupon.code || 'UNKNOWN'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900">{coupon.discount_percentage || 0}% OFF</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(coupon.expiry_date || 0).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => toggleShowOnDeals(coupon.id, coupon.show_on_deals)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        coupon.show_on_deals ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {coupon.show_on_deals ? 'Visible' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => toggleHero(coupon.id, coupon.is_hero)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        coupon.is_hero ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {coupon.is_hero ? 'Hero' : 'Set Hero'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => toggleStatus(coupon.id, coupon.is_active)}
                        className={`p-2 rounded-lg transition-colors ${
                          coupon.is_active ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {coupon.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmId(coupon.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {coupons.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No coupons found</h3>
            <p className="text-gray-500">Create your first discount code to boost sales.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Create New Coupon</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <XCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Coupon Code</label>
                <input 
                  type="text" 
                  required
                  value={formData.code}
                  onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#f37021] outline-none font-mono uppercase tracking-widest"
                  placeholder="SUMMER25"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Discount Percentage (%)</label>
                <div className="relative">
                  <Percent className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="number" 
                    required
                    min="1"
                    max="100"
                    value={formData.discount_percentage}
                    onChange={e => setFormData({...formData, discount_percentage: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#f37021] outline-none"
                    placeholder="25"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description (Optional)</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#f37021] outline-none text-sm"
                  placeholder="e.g. Special summer discount for all customers"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Expiry Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="date" 
                    required
                    value={formData.expiry_date}
                    onChange={e => setFormData({...formData, expiry_date: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#f37021] outline-none"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2 py-2">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    id="show_on_deals"
                    checked={formData.show_on_deals}
                    onChange={e => setFormData({...formData, show_on_deals: e.target.checked})}
                    className="w-4 h-4 text-[#f37021] focus:ring-[#f37021] border-gray-300 rounded"
                  />
                  <label htmlFor="show_on_deals" className="text-sm font-bold text-gray-700 cursor-pointer">
                    Show on Deals Page
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    id="is_hero"
                    checked={formData.is_hero}
                    onChange={e => setFormData({...formData, is_hero: e.target.checked})}
                    className="w-4 h-4 text-[#f37021] focus:ring-[#f37021] border-gray-300 rounded"
                  />
                  <label htmlFor="is_hero" className="text-sm font-bold text-gray-700 cursor-pointer">
                    Set as Hero Banner Deal
                  </label>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-[#f37021] text-white font-bold rounded-lg hover:bg-[#e56a17] transition-colors shadow-lg shadow-orange-200"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Coupon?</h3>
            <p className="text-gray-500 text-center text-sm mb-6">
              This action cannot be undone. Are you sure you want to delete this coupon?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => deleteCoupon(deleteConfirmId)}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
