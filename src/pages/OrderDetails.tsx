import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle, MapPin, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';

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

          // Fetch artwork status from artworks table
          const { data: artworksData } = await supabase
            .from('artworks')
            .select('file_url, status, rejection_reason')
            .eq('order_id', orderId);

          const formattedItems = itemsData?.map((item: any) => {
            const artworkInfo = artworksData?.find(a => a.file_url === item.artwork);
            return {
              id: item.id,
              name: item.name || 'Unknown Product',
              quantity: item.quantity,
              price: item.price,
              artwork: item.artwork || 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=200',
              artwork_status: artworkInfo?.status || 'pending',
              artwork_rejection_reason: artworkInfo?.rejection_reason
            };
          }) || [];

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
        <LoadingSpinner />
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
            <div className="flex items-center gap-4 text-sm text-[#6b7280] mt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(order.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1 text-[#16a34a] font-bold uppercase tracking-wider">
                <CheckCircle className="w-4 h-4" />
                {order.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] overflow-hidden">
              <div className="p-6 border-b border-[#f3f4f6]">
                <h2 className="text-xl font-bold text-[#333333]">Items</h2>
              </div>
              <div className="divide-y divide-[#f3f4f6]">
                {order.items.map((item) => (
                  <div key={item.id} className="p-6 flex gap-4">
                    <div className="w-20 h-20 bg-[#f3f4f6] rounded-lg flex items-center justify-center shrink-0">
                      <Package className="w-8 h-8 text-[#9ca3af]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <h3 className="font-bold text-[#333333]">{item.name}</h3>
                        <span className="font-bold text-[#333333]">${Math.round(item.price)}</span>
                      </div>
                      <p className="text-sm text-[#6b7280] mb-2">Quantity: {item.quantity}</p>
                      {item.artwork && (
                        <div className="space-y-2">
                          <div className="text-xs bg-[#f9fafb] border border-[#f3f4f6] rounded px-2 py-1 inline-block text-[#4b5563] truncate max-w-[200px] sm:max-w-[400px]">
                            Artwork: {item.artwork}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                              item.artwork_status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                              item.artwork_status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                              'bg-yellow-100 text-yellow-700 border-yellow-200'
                            }`}>
                              Artwork {item.artwork_status}
                            </span>
                          </div>

                          {item.artwork_status === 'rejected' && item.artwork_rejection_reason && (
                            <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                              <p className="text-xs text-red-700 font-bold mb-1">Action Required:</p>
                              <p className="text-xs text-red-600 italic mb-2">"{item.artwork_rejection_reason}"</p>
                              <button 
                                onClick={() => navigate('/dashboard')}
                                className="text-[11px] font-bold text-[#0066cc] hover:underline flex items-center gap-1"
                              >
                                Re-upload Artwork
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-[#f9fafb] border-t border-[#f3f4f6]">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-[#333333]">Total</span>
                  <span className="text-2xl font-bold text-[#333333]">${Math.round(order.total_price)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Info Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-[#9ca3af]" />
                <h3 className="font-bold text-[#333333]">Shipping Address</h3>
              </div>
              <p className="text-sm text-[#4b5563] leading-relaxed">
                {order.shipping_address || 'No address provided'}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-[#e5e7eb] p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-[#9ca3af]" />
                <h3 className="font-bold text-[#333333]">Payment Method</h3>
              </div>
              <p className="text-sm text-[#4b5563]">
                {order.payment_method || 'No payment method provided'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
