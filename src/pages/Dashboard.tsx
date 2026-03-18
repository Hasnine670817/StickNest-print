import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, Clock, CheckCircle, ChevronRight, User, Save, XCircle, Upload, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LogoutModal from '../components/LogoutModal';
import LoadingSpinner from '../components/LoadingSpinner';

interface Order {
  id: number;
  total_price: number;
  status: string;
  created_at: string;
  items_summary: string;
  has_rejected_artwork?: boolean;
}

export default function Dashboard() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    profileImage: ''
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setEditFormData({
        fullName: user.fullName,
        profileImage: user.profileImage || ''
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (ordersError) throw ordersError;
        
        if (ordersData && ordersData.length > 0) {
          const orderIds = ordersData.map(o => o.id);
          const { data: itemsData } = await supabase
            .from('order_items')
            .select('order_id, name, quantity')
            .in('order_id', orderIds);

          // Fetch artwork statuses for these orders
          const { data: artworksData } = await supabase
            .from('artworks')
            .select('order_id, status')
            .in('order_id', orderIds);

          const formattedOrders = ordersData.map(order => {
            const items = itemsData?.filter(i => i.order_id === order.id) || [];
            const itemsSummary = items.map(i => `${i.quantity}x ${i.name}`).join(', ');
            
            // Check if any artwork for this order is rejected
            const hasRejected = artworksData?.some(a => a.order_id === order.id && a.status === 'rejected');
            
            return {
              ...order,
              items_summary: itemsSummary || 'No items',
              has_rejected_artwork: !!hasRejected
            };
          });
          setOrders(formattedOrders);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editFormData.fullName,
          profile_image: editFormData.profileImage
        })
        .eq('id', user.id);

      if (error) throw error;

      updateProfile({ 
        fullName: editFormData.fullName, 
        profileImage: editFormData.profileImage 
      });
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setEditFormData(prev => ({ ...prev, profileImage: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 bg-[#f4f4f4] py-12 px-4 sm:px-8">
      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={() => {
          logout();
          navigate('/login');
          setIsLogoutModalOpen(false);
        }} 
      />
      <div className="max-w-[1000px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-[32px] font-bold text-[#333333]">Hi, {user?.fullName || 'there'}!</h1>
            <p className="text-gray-600">Welcome back to your dashboard.</p>
          </div>
          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className="bg-white border border-gray-300 text-[#333333] px-6 py-2 rounded font-bold hover:bg-gray-50 transition-colors self-start md:self-center"
          >
            Log out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#333333]">Recent Orders</h2>
                <Link to="/all-orders" className="text-sm text-[#0066cc] font-bold cursor-pointer hover:underline">View all</Link>
              </div>
              
              <div className="divide-y divide-gray-100">
                {isLoading ? (
                  <div className="p-12 text-center">
                    <LoadingSpinner />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="p-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
                    <button className="bg-[#f37021] text-white px-6 py-2 rounded font-bold hover:bg-[#e0661e] transition-colors">
                      Start shopping
                    </button>
                  </div>
                ) : (
                  orders.slice(0, 5).map((order) => (
                    <div 
                      key={order.id} 
                      onClick={() => navigate(`/order-details/${order.id}`)}
                      className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <span className="font-bold text-[#333333]">Order #{order.id}</span>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {new Date(order.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-bold text-[#333333]">${Math.round(order.total_price)}</div>
                            <div className="flex items-center gap-1 text-[11px] font-bold text-green-600 uppercase tracking-wider">
                              <CheckCircle className="w-3 h-3" />
                              {order.status}
                            </div>
                            {order.has_rejected_artwork && (
                              <div className="text-[10px] font-bold text-red-600 uppercase mt-1">
                                Action Required
                              </div>
                            )}
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {order.items_summary}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Account Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-[#f37021] flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    user?.fullName.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-[#333333]">{user?.fullName}</h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              <h3 className="font-bold text-[#333333] mb-4 border-t border-gray-100 pt-4">Account Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Account Status</label>
                  <p className="text-green-600 font-bold">Active</p>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full mt-4 text-sm text-[#0066cc] font-bold hover:underline text-left"
                >
                  Edit profile
                </button>
                <Link 
                  to="/wishlist"
                  className="block w-full mt-2 text-sm text-[#0066cc] font-bold hover:underline text-left"
                >
                  My Wishlist
                </Link>
              </div>
            </div>

            <div className="bg-[#333333] rounded-xl shadow-sm p-6 text-white">
              <h3 className="font-bold mb-2">Need help?</h3>
              <p className="text-sm text-gray-300 mb-6">Our support team is available 24/7 to assist you with your orders.</p>
              <button className="w-full bg-white text-[#333333] py-2 rounded font-bold hover:bg-gray-100 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
              <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <XCircle className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-gray-100 border-2 border-gray-100 flex items-center justify-center relative overflow-hidden shadow-inner">
                    {editFormData.profileImage ? (
                      <img src={editFormData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-gray-300" />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
                      >
                        <Upload className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                
                <div className="flex-1 space-y-4 w-full">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Profile Image URL</label>
                    <div className="relative">
                      <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        value={editFormData.profileImage.startsWith('data:') ? '' : editFormData.profileImage}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, profileImage: e.target.value }))}
                        placeholder="https://example.com/image.jpg"
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#f37021] outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 italic">Upload a file or paste a URL</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={editFormData.fullName}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#f37021] outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address (Read Only)</label>
                  <input 
                    type="email" 
                    value={user?.email}
                    readOnly
                    className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 bg-[#f37021] text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-[#e56a17] transition-all disabled:opacity-50 shadow-lg shadow-orange-100"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <><Save className="w-4 h-4" /> Save Changes</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
