import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Image as ImageIcon, 
  Star, 
  Ticket, 
  Mail, 
  FileText, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Menu, 
  X,
  Bell,
  Search,
  User,
  Home,
  Clock,
  ExternalLink,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import LogoutModal from '../../components/LogoutModal';

const sidebarItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { 
    name: 'Products', 
    icon: Package, 
    path: '/admin/products',
    children: [
      { name: 'Stickers', path: '/admin/products?category=stickers' },
      { name: 'Labels', path: '/admin/products?category=labels' },
      { name: 'Magnets', path: '/admin/products?category=magnets' },
      { name: 'Buttons', path: '/admin/products?category=buttons' },
      { name: 'Packaging', path: '/admin/products?category=packaging' },
      { name: 'Apparel', path: '/admin/products?category=apparel' },
      { name: 'Acrylics', path: '/admin/products?category=acrylics' },
      { name: 'More Products', path: '/admin/products?category=more' },
    ]
  },
  { name: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
  { name: 'Users', icon: Users, path: '/admin/users' },
  { name: 'Artwork Uploads', icon: ImageIcon, path: '/admin/artworks' },
  { name: 'Reviews', icon: Star, path: '/admin/reviews' },
  { name: 'Discounts / Coupons', icon: Ticket, path: '/admin/coupons' },
  { name: 'Settings', icon: Settings, path: '/admin/settings' },
];

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const [isProductsOpen, setIsProductsOpen] = useState(location.pathname.startsWith('/admin/products'));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ orders: any[], products: any[], users: any[] }>({ orders: [], products: [], users: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Notification state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Try to fetch from orders table since notifications table might not exist
        const { data: orders, error } = await supabase
          .from('orders')
          .select('id, created_at, total_price, status')
          .order('created_at', { ascending: false })
          .limit(20);
        
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
          setUnreadCount(mappedNotifications.filter(n => !n.is_read).length);
        }
      } catch (err) {
        console.error('Error fetching notifications from orders:', err);
      }
    };

    fetchNotifications();
    
    // Subscribe to new orders
    const channel = supabase
      .channel('admin-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const newNotification = {
          id: `order-${payload.new.id}`,
          orderId: payload.new.id,
          title: 'New Order Received',
          message: `Order #${payload.new.id} for $${payload.new.total_price} has been placed.`,
          type: 'order',
          created_at: payload.new.created_at || new Date().toISOString(),
          is_read: false,
          link: `/admin/orders`
        };
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults({ orders: [], products: [], users: [] });
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      // Search Orders
      const { data: orders } = await supabase
        .from('orders')
        .select('id, total_price, status')
        .or(`id.eq.${parseInt(query) || 0}`);

      // Search Products
      const { data: products } = await supabase
        .from('products')
        .select('id, name, category')
        .ilike('name', `%${query}%`);

      // Search Users
      const { data: users } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`);

      setSearchResults({
        orders: orders || [],
        products: products || [],
        users: users || []
      });
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const markAsRead = (id: string) => {
    const readNotifications = JSON.parse(localStorage.getItem('admin_read_notifications') || '[]');
    if (!readNotifications.includes(id)) {
      const newRead = [...readNotifications, id];
      localStorage.setItem('admin_read_notifications', JSON.stringify(newRead));
      
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;

    const readNotifications = JSON.parse(localStorage.getItem('admin_read_notifications') || '[]');
    const newRead = [...new Set([...readNotifications, ...unreadIds])];
    localStorage.setItem('admin_read_notifications', JSON.stringify(newRead));

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    closeSidebarOnMobile();
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    logout();
    navigate('/login');
    setIsLogoutModalOpen(false);
  };

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={confirmLogout} 
      />
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop */}
      <aside className={`fixed inset-y-0 left-0 bg-[#1a1a1a] text-white flex flex-col transition-all duration-300 ease-in-out z-40 ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} lg:translate-x-0 lg:static ${isSidebarOpen ? 'lg:w-64' : 'lg:w-[65px]'}`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-800 shrink-0">
          <Link 
            to="/admin" 
            onClick={closeSidebarOnMobile}
            className={`flex items-center gap-2 font-bold text-xl ${!isSidebarOpen ? 'lg:hidden' : 'block'}`}
          >
            <div className="w-8 h-8 bg-[#f37021] rounded flex items-center justify-center text-white">S</div>
            <span>Admin Panel</span>
          </Link>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-gray-800 rounded hidden lg:block">
            <Menu className="w-5 h-5" />
          </button>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 hover:bg-gray-800 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 mt-4 px-2 space-y-1 overflow-y-auto custom-scrollbar">
          <Link
            to="/"
            onClick={closeSidebarOnMobile}
            className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-blue-900/20 text-blue-400 mb-4"
          >
            <Home className="w-5 h-5" />
            <span className={`${!isSidebarOpen ? 'lg:hidden' : 'block'}`}>Back to Home</span>
          </Link>

          {sidebarItems.map((item) => (
            <div key={item.name}>
              {item.children ? (
                <div>
                  <button 
                    onClick={() => setIsProductsOpen(!isProductsOpen)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors hover:bg-gray-800 ${location.pathname === '/admin/products' && location.search === '' ? 'bg-[#f37021] text-white' : location.pathname.startsWith('/admin/products') ? 'text-white' : 'text-gray-400'}`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className={`${!isSidebarOpen ? 'lg:hidden' : 'block'}`}>{item.name}</span>
                    </div>
                    {isSidebarOpen && <ChevronDown className={`w-4 h-4 transition-transform ${isProductsOpen ? 'rotate-180' : ''}`} />}
                  </button>
                  {isProductsOpen && isSidebarOpen && (
                    <div className="ml-9 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          to={child.path}
                          onClick={closeSidebarOnMobile}
                          className={`block px-3 py-1.5 text-sm rounded-md transition-colors ${location.search.includes(`category=${child.name.toLowerCase()}`) || (child.name === 'More Products' && location.search.includes('category=more')) ? 'text-white bg-gray-800' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  onClick={closeSidebarOnMobile}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-gray-800 ${location.pathname === item.path ? 'bg-[#f37021] text-white' : 'text-gray-400'}`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className={`${!isSidebarOpen ? 'lg:hidden' : 'block'}`}>{item.name}</span>
                </Link>
              )}
            </div>
          ))}
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-red-900/20 text-red-400 mt-8"
          >
            <LogOut className="w-5 h-5" />
            <span className={`${!isSidebarOpen ? 'lg:hidden' : 'block'}`}>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded">
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative hidden sm:block" ref={searchRef}>
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                placeholder="Search orders, products, users..." 
                className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-[#f37021] w-64 transition-all focus:w-80"
              />

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Search Results</span>
                    {isSearching && <div className="w-4 h-4 border-2 border-[#f37021] border-t-transparent rounded-full animate-spin"></div>}
                  </div>
                  <div className="max-h-96 overflow-y-auto p-2 space-y-4">
                    {searchResults.orders.length > 0 && (
                      <div>
                        <h4 className="px-2 text-[10px] font-bold text-gray-400 uppercase mb-1">Orders</h4>
                        {searchResults.orders.map(order => (
                          <Link 
                            key={order.id} 
                            to={`/admin/orders`} 
                            onClick={() => setShowSearchResults(false)}
                            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <ShoppingCart className="w-4 h-4 text-orange-500" />
                              <span className="text-sm font-medium text-gray-700">Order #{order.id}</span>
                            </div>
                            <span className="text-xs font-bold text-gray-900">${order.total_price}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {searchResults.products.length > 0 && (
                      <div>
                        <h4 className="px-2 text-[10px] font-bold text-gray-400 uppercase mb-1">Products</h4>
                        {searchResults.products.map(product => (
                          <Link 
                            key={product.id} 
                            to={`/admin/products?category=${product.category}`} 
                            onClick={() => setShowSearchResults(false)}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <Package className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-gray-700">{product.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {searchResults.users.length > 0 && (
                      <div>
                        <h4 className="px-2 text-[10px] font-bold text-gray-400 uppercase mb-1">Users</h4>
                        {searchResults.users.map(u => (
                          <Link 
                            key={u.id} 
                            to={`/admin/users`} 
                            onClick={() => setShowSearchResults(false)}
                            className="flex flex-col p-2 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-green-500" />
                              <span className="text-sm font-medium text-gray-700">{u.full_name}</span>
                            </div>
                            <span className="text-[10px] text-gray-400 ml-6">{u.email}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {!isSearching && searchResults.orders.length === 0 && searchResults.products.length === 0 && searchResults.users.length === 0 && (
                      <div className="p-8 text-center">
                        <Search className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No results found for "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsNotificationDrawerOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-full relative"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user?.fullName || 'Admin'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || 'Administrator'}</p>
              </div>
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border border-gray-300">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-gray-400" />
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>

        {/* Notification Drawer / Offcanvas */}
        <AnimatePresence>
          {isNotificationDrawerOpen && (
            <div className="fixed inset-0 z-50 flex justify-end">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                onClick={() => setIsNotificationDrawerOpen(false)}
              />
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col"
              >
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[#f37021]" />
                    <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-full">
                        {unreadCount} NEW
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-[10px] font-bold text-[#f37021] hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                    <button 
                      onClick={() => setIsNotificationDrawerOpen(false)}
                      className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${notification.is_read ? 'bg-white border-gray-100' : 'bg-orange-50 border-orange-100 shadow-sm'}`}
                      onClick={() => {
                        markAsRead(notification.id);
                        setIsNotificationDrawerOpen(false);
                        navigate('/admin/settings', { state: { activeTab: 'notifications' } });
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg shrink-0 ${notification.type === 'order' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                          {notification.type === 'order' ? <ShoppingCart className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-gray-900 mb-0.5">{notification.title}</h3>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">{notification.message}</p>
                            <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {!notification.is_read && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="text-[10px] font-bold text-[#f37021] hover:underline"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Bell className="w-8 h-8 text-gray-200" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No notifications yet</h3>
                    <p className="text-sm text-gray-500">We'll notify you when something important happens.</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button 
                  onClick={() => {
                    setIsNotificationDrawerOpen(false);
                    navigate('/admin/settings', { state: { activeTab: 'notifications' } });
                  }}
                  className="w-full py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-all shadow-sm"
                >
                  View All Notifications
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
