import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Printer, 
  Package,
  Calendar,
  User,
  DollarSign,
  ChevronDown,
  ShoppingCart
} from 'lucide-react';

interface Order {
  id: number;
  user_id: number;
  customer_name: string;
  customer_email: string;
  total_price: number;
  status: string;
  created_at: string;
  items_summary: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [dateRange, setDateRange] = useState('All Time');
  const [sortBy, setSortBy] = useState('Newest First');
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.dropdown-container')) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;

      if (ordersData && ordersData.length > 0) {
        // Fetch profiles
        const userIds = [...new Set(ordersData.map(o => o.user_id).filter(Boolean))];
        let profilesData: any[] = [];
        if (userIds.length > 0) {
          const { data } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', userIds);
          profilesData = data || [];
        }

        // Fetch order items
        const orderIds = ordersData.map(o => o.id);
        let itemsData: any[] = [];
        if (orderIds.length > 0) {
          const { data } = await supabase
            .from('order_items')
            .select('order_id, name, quantity')
            .in('order_id', orderIds);
          itemsData = data || [];
        }

        const formattedOrders = ordersData.map(order => {
          const profile = profilesData?.find(p => p.id === order.user_id);
          const items = itemsData?.filter(i => i.order_id === order.id) || [];
          const itemsSummary = items.map(i => `${i.quantity}x ${i.name}`).join(', ');

          return {
            ...order,
            customer_name: profile?.full_name || 'Guest',
            customer_email: profile?.email || 'No email',
            items_summary: itemsSummary || 'No items'
          };
        });

        setOrders(formattedOrders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (orderId: number, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
        
      if (!error) fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'approved': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'printing': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'shipped': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      (order.id?.toString() || '').includes(searchQuery) ||
      (order.customer_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (order.customer_email?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'All Statuses' || (order.status?.toLowerCase() || '') === statusFilter.toLowerCase();
    
    let matchesDate = true;
    if (dateRange !== 'All Time') {
      const orderDate = new Date(order.created_at || 0);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - orderDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (dateRange === 'Last 7 Days') matchesDate = diffDays <= 7;
      if (dateRange === 'Last 30 Days') matchesDate = diffDays <= 30;
      if (dateRange === 'This Year') matchesDate = orderDate.getFullYear() === now.getFullYear();
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  }).sort((a, b) => {
    if (sortBy === 'Newest First') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    if (sortBy === 'Oldest First') return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
    if (sortBy === 'Highest Amount') return (b.total_price || 0) - (a.total_price || 0);
    if (sortBy === 'Lowest Amount') return (a.total_price || 0) - (b.total_price || 0);
    return 0;
  });

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage customer orders and fulfillment</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by Order ID, Customer Name or Email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#f37021] outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#f37021]"
          >
            <option>All Statuses</option>
            <option>Pending</option>
            <option>Approved</option>
            <option>Printing</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#f37021]"
          >
            <option>All Time</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Year</option>
          </select>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#f37021]"
          >
            <option>Newest First</option>
            <option>Oldest First</option>
            <option>Highest Amount</option>
            <option>Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-visible">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Products</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-3 border-[#f37021] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm text-gray-500">Loading orders...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900">#ORD-{order.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                        {(order.customer_name || '?').charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{order.customer_name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{order.customer_email || 'No email'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 line-clamp-1 max-w-[200px]">{order.items_summary || 'No items'}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-gray-900">${(order.total_price || 0).toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status || 'pending')}`}>
                      {order.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm text-gray-600">{new Date(order.created_at || 0).toLocaleDateString()}</p>
                    <p className="text-[10px] text-gray-400">{new Date(order.created_at || 0).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="relative dropdown-container inline-block">
                      <button 
                        onClick={() => setOpenDropdownId(openDropdownId === order.id ? null : order.id)}
                        className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      
                      {openDropdownId === order.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden text-left">
                          <div className="py-1">
                            <button 
                              onClick={() => { updateStatus(order.id, 'approved'); setOpenDropdownId(null); }}
                              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4 text-blue-500" /> Mark as Approved
                            </button>
                            <button 
                              onClick={() => { updateStatus(order.id, 'printing'); setOpenDropdownId(null); }}
                              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Printer className="w-4 h-4 text-purple-500" /> Mark as Printing
                            </button>
                            <button 
                              onClick={() => { updateStatus(order.id, 'shipped'); setOpenDropdownId(null); }}
                              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Truck className="w-4 h-4 text-indigo-500" /> Mark as Shipped
                            </button>
                            <button 
                              onClick={() => { updateStatus(order.id, 'delivered'); setOpenDropdownId(null); }}
                              className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Package className="w-4 h-4 text-green-500" /> Mark as Delivered
                            </button>
                            <div className="h-px bg-gray-100 my-1"></div>
                            <button 
                              onClick={() => { updateStatus(order.id, 'cancelled'); setOpenDropdownId(null); }}
                              className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <XCircle className="w-4 h-4" /> Cancel Order
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No orders found</h3>
            <p className="text-gray-500">When customers buy products, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
