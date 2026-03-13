import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle, MapPin, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  artwork: string;
}

interface OrderDetails {
  id: string;
  total_price: number;
  status: string;
  created_at: string;
  items: OrderItem[];
  shipping_address: string | null;
  payment_method: string | null;
}

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('id, total_price, status, created_at, shipping_address, payment_method')
          .eq('id', orderId)
          .single();

        if (orderError) throw orderError;

        if (orderData) {
          const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select(`
              id,
              name,
              quantity,
              price,
              artwork
            `)
            .eq('order_id', orderId);

          if (itemsError) throw itemsError;

          const formattedItems = itemsData?.map((item: any) => ({
            id: item.id,
            name: item.name || 'Unknown Product',
            quantity: item.quantity,
            price: item.price,
            artwork: item.artwork || 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=200'
          })) || [];

          setOrder({
            id: orderData.id,
            total_price: orderData.total_price,
            status: orderData.status,
            created_at: orderData.created_at,
            items: formattedItems,
            shipping_address: orderData.shipping_address || null,
            payment_method: orderData.payment_method || null
          });
        }
      } catch (err) {
        console.error('Failed to fetch order details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4f4f4] flex items-center justify-center">
        <div className="text-gray-500">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#f4f4f4] flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-[#333333] mb-4">Order not found</h1>
        <button 
          onClick={() => navigate('/dashboard')}
          className="bg-[#f37021] text-white px-6 py-2 rounded font-bold"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] py-12 px-4 sm:px-8">
      <div className="max-w-[1000px] mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-[#0066cc] font-bold hover:underline mb-8"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-[32px] font-bold text-[#333333]">Order #{order.id}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(order.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1 text-green-600 font-bold uppercase tracking-wider">
                <CheckCircle className="w-4 h-4" />
                {order.status}
              </span>
            </div>
          </div>
          <button 
            onClick={() => window.print()}
            className="bg-white border border-gray-300 text-[#333333] px-6 py-2 rounded font-bold hover:bg-gray-50 transition-colors"
          >
            Download Invoice
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-[#333333]">Items</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {order.items.map((item) => (
                  <div key={item.id} className="p-6 flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <h3 className="font-bold text-[#333333]">{item.name}</h3>
                        <span className="font-bold text-[#333333]">${Math.round(item.price)}</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">Quantity: {item.quantity}</p>
                      {item.artwork && (
                        <div className="text-xs bg-gray-50 border border-gray-100 rounded px-2 py-1 inline-block text-gray-600 truncate max-w-[200px] sm:max-w-[400px]">
                          Artwork: {item.artwork}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-[#333333]">Total</span>
                  <span className="text-2xl font-bold text-[#333333]">${Math.round(order.total_price)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Info Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-gray-400" />
                <h3 className="font-bold text-[#333333]">Shipping Address</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {order.shipping_address || 'No address provided'}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <h3 className="font-bold text-[#333333]">Payment Method</h3>
              </div>
              <p className="text-sm text-gray-600">
                {order.payment_method || 'No payment method provided'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
