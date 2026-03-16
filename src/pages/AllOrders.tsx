import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, Clock, CheckCircle, ChevronRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';

interface Order {
  id: number;
  total_price: number;
  status: string;
  created_at: string;
  items_summary: string;
}

export default function AllOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (ordersError) throw ordersError;
        
        if (ordersData && ordersData.length > 0) {
          const orderIds = ordersData.map(o => o.id);
          const { data: itemsData } = await supabase
            .from('order_items')
            .select('order_id, name, quantity')
            .in('order_id', orderIds);

          const formattedOrders = ordersData.map(order => {
            const items = itemsData?.filter(i => i.order_id === order.id) || [];
            const itemsSummary = items.map(i => `${i.quantity}x ${i.name}`).join(', ');
            return {
              ...order,
              items_summary: itemsSummary || 'No items'
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

  return (
    <div className="min-h-screen bg-[#f4f4f4] py-12 px-4 sm:px-8">
      <div className="max-w-[1000px] mx-auto">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-[#0066cc] font-bold hover:underline mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>

        <h1 className="text-[32px] font-bold text-[#333333] mb-8">All Orders</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {isLoading ? (
              <div className="p-12 text-center">
                <LoadingSpinner />
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
                <button 
                  onClick={() => navigate('/')}
                  className="bg-[#f37021] text-white px-6 py-2 rounded font-bold hover:bg-[#e0661e] transition-colors"
                >
                  Start shopping
                </button>
              </div>
            ) : (
              orders.map((order) => (
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
    </div>
  );
}
