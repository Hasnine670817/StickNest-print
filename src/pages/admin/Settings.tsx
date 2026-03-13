import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  User, 
  Lock, 
  Truck, 
  DollarSign, 
  CreditCard, 
  Globe, 
  Bell, 
  Shield, 
  Save, 
  CheckCircle,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ChevronRight,
  Monitor,
  Smartphone,
  ShoppingCart,
  Clock,
  ExternalLink,
  Upload,
  Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }
    
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      
      alert('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Error updating password:', err);
      alert('Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  // Profile Form State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [imageUrlInput, setImageUrlInput] = useState(user?.profileImage || '');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setProfileImage(user.profileImage || '');
      setImageUrlInput(user.profileImage || '');
    }
  }, [user]);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  useEffect(() => {
    if (activeTab === 'notifications') {
      fetchNotifications();
    }
  }, [activeTab]);

  const fetchNotifications = async () => {
    setIsLoadingNotifications(true);
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, created_at, total_price, status')
        .order('created_at', { ascending: false });
      
      if (!error && orders) {
        const readNotifications = JSON.parse(localStorage.getItem('admin_read_notifications') || '[]');
        
        const mappedNotifications = orders.map(order => ({
          id: `order-${order.id}`,
          orderId: order.id,
          title: 'New Order Received',
          message: `Order #${order.id} for $${order.total_price} is ${order.status}.`,
          type: 'order',
          created_at: order.created_at,
          is_read: readNotifications.includes(`order-${order.id}`),
          link: `/admin/orders`
        }));
        
        setNotifications(mappedNotifications);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const markAsRead = (id: string) => {
    const readNotifications = JSON.parse(localStorage.getItem('admin_read_notifications') || '[]');
    if (!readNotifications.includes(id)) {
      const newRead = [...readNotifications, id];
      localStorage.setItem('admin_read_notifications', JSON.stringify(newRead));
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          profile_image: profileImage
        })
        .eq('id', user.id);

      if (error) throw error;

      updateProfile({ fullName, profileImage });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
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
        setProfileImage(base64String);
        setImageUrlInput(''); // Clear URL input when file is uploaded
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlUpdate = () => {
    if (imageUrlInput) {
      setProfileImage(imageUrlInput);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Admin Profile', icon: User },
    { id: 'security', name: 'Security', icon: Lock },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your admin profile and global store settings</p>
        </div>
        {showSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-bold animate-in fade-in slide-in-from-top-2">
            <CheckCircle className="w-4 h-4" /> Settings updated successfully!
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <aside className="lg:w-64 shrink-0">
          <nav className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-[#f37021] text-white shadow-lg shadow-orange-100' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1 space-y-8">
          {activeTab === 'profile' && (
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">Admin Profile</h2>
              </div>
              <div className="p-6 space-y-8">
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-3xl bg-gray-100 border-4 border-white shadow-xl flex items-center justify-center relative overflow-hidden">
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-gray-300" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors"
                          title="Upload Image"
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
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-gray-900">{fullName || 'Admin User'}</h3>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-[#f37021] uppercase tracking-wider mt-2">
                        {user?.role || 'Administrator'}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Profile Image URL</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input 
                            type="text" 
                            value={imageUrlInput}
                            onChange={(e) => setImageUrlInput(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#f37021] outline-none"
                          />
                        </div>
                        <button 
                          onClick={handleUrlUpdate}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
                        >
                          Apply URL
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                    <input 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
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
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#f37021] text-white rounded-xl font-bold flex items-center gap-2 hover:bg-[#e56a17] transition-all disabled:opacity-50 shadow-lg shadow-orange-100"
                >
                  {isSaving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>
            </section>
          )}

          {activeTab === 'security' && (
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">Security Settings</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-700">Change Password</h3>
                  <div className="grid grid-cols-1 gap-4 max-w-md">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">New Password</label>
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#f37021] outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Confirm New Password</label>
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#f37021] outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={handlePasswordUpdate}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#f37021] text-white rounded-xl font-bold flex items-center gap-2 hover:bg-[#e56a17] transition-all shadow-lg shadow-orange-100 disabled:opacity-50"
                >
                  {isSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </section>
          )}

          {activeTab === 'shipping' && (
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">Shipping & Tax Configuration</h2>
              </div>
              <div className="p-6 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-700">Shipping Zones</h3>
                    <button className="text-xs font-bold text-[#f37021] hover:underline flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add Zone
                    </button>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: 'Domestic (USA)', cost: '$5.00', free: 'Over $50' },
                      { name: 'International', cost: '$15.00', free: 'Over $150' },
                    ].map((zone) => (
                      <div key={zone.name} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors group">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Globe className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{zone.name}</p>
                            <p className="text-xs text-gray-500">Flat Rate: {zone.cost} • Free {zone.free}</p>
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
                </div>

                <div className="pt-6 border-t border-gray-100 space-y-4">
                  <h3 className="text-sm font-bold text-gray-700">Tax Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Default Tax Rate (%)</label>
                      <input 
                        type="number" 
                        defaultValue="8.5"
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#f37021] outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-6">
                      <input type="checkbox" id="tax-inclusive" className="w-4 h-4 rounded border-gray-300 text-[#f37021] focus:ring-[#f37021]" />
                      <label htmlFor="tax-inclusive" className="text-sm font-medium text-gray-700">Prices include tax</label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-[#f37021] text-white rounded-xl font-bold flex items-center gap-2 hover:bg-[#e56a17] transition-all shadow-lg shadow-orange-100"
                >
                  Save Shipping Settings
                </button>
              </div>
            </section>
          )}

          {activeTab === 'notifications' && (
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
                  <p className="text-xs text-gray-500">Manage and view all your system alerts</p>
                </div>
                <button 
                  onClick={fetchNotifications}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Clock className={`w-4 h-4 text-gray-400 ${isLoadingNotifications ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="p-6">
                {isLoadingNotifications ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="w-10 h-10 border-4 border-[#f37021] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-gray-500">Loading notifications...</p>
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`p-4 rounded-xl border transition-all ${notification.is_read ? 'bg-white border-gray-100' : 'bg-orange-50 border-orange-100 shadow-sm'}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl shrink-0 ${notification.type === 'order' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                            {notification.type === 'order' ? <ShoppingCart className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="text-sm font-bold text-gray-900">{notification.title}</h3>
                              <span className="text-[10px] text-gray-400">
                                {new Date(notification.created_at).toLocaleDateString()} {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{notification.message}</p>
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => navigate('/admin/orders')}
                                className="text-xs font-bold text-[#f37021] hover:underline flex items-center gap-1"
                              >
                                View Details <ExternalLink className="w-3 h-3" />
                              </button>
                              {!notification.is_read && (
                                <button 
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs font-bold text-gray-400 hover:text-gray-600"
                                >
                                  Mark as read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Bell className="w-10 h-10 text-gray-200" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No notifications</h3>
                    <p className="text-sm text-gray-500 max-w-xs">You don't have any notifications at the moment. New alerts will appear here.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === 'payment' && (
            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">Payment Gateways</h2>
              </div>
              <div className="p-6 space-y-6">
                {[
                  { name: 'Stripe', status: 'Connected', icon: '💳' },
                  { name: 'PayPal', status: 'Connected', icon: '🅿️' },
                  { name: 'Apple Pay', status: 'Disconnected', icon: '🍎' },
                ].map((gateway) => (
                  <div key={gateway.name} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl">
                        {gateway.icon}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{gateway.name}</p>
                        <p className={`text-xs font-bold ${gateway.status === 'Connected' ? 'text-green-500' : 'text-gray-400'}`}>
                          {gateway.status}
                        </p>
                      </div>
                    </div>
                    <button className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                      gateway.status === 'Connected' 
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                        : 'bg-[#f37021] text-white hover:bg-[#e56a17]'
                    }`}>
                      {gateway.status === 'Connected' ? 'Configure' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function Edit2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}
