import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Lock, Info, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [address, setAddress] = useState('');
  const [zip, setZip] = useState('');
  // Ensure paymentMethod is correctly managed
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'credit-card'>('credit-card');

  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const discount = cartItems.length > 1 ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  const isFormValid = email.includes('@') && fullName.trim() !== '' && address.trim() !== '' && zip.trim() !== '';

  const handlePlaceOrder = async () => {
    if (!isFormValid) {
      alert('Please fill in all required fields.');
      return;
    }
    
    try {
      // Insert order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user?.id || null, // Might need to be UUID if logged in, else null
          total_price: total,
          status: 'pending',
          shipping_address: address,
          payment_method: paymentMethod
        }])
        .select()
        .single();
        
      if (orderError) throw orderError;
      
      if (orderData) {
        // Insert order items
        const orderItems = cartItems.map(item => ({
          order_id: orderData.id,
          name: item.name,
          quantity: item.quantity,
          price: item.pricePerUnit || (item.totalPrice / item.quantity) || 0,
          artwork: item.artwork || item.image || 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&q=80&w=200'
        }));
        
        const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
        if (itemsError) throw itemsError;

        // Create notification for admin
        try {
          await supabase.from('notifications').insert([{
            title: 'New Order Received',
            message: `Order #${orderData.id} has been placed by ${fullName}.`,
            type: 'order',
            link: `/admin/orders`,
            is_read: false
          }]);
        } catch (nErr) {
          console.warn('Failed to create notification:', nErr);
        }
      }

      clearCart();
      navigate('/order-success');
    } catch (err) {
      console.error(err);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1140px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content - Left Column */}
          <div className="lg:col-span-8">
            <h1 className="text-[32px] font-bold text-[#333333] mb-6">Express checkout</h1>
            
            {/* Google Pay Button */}
            <div className="mb-8">
              <button className="w-full bg-black text-white h-[44px] rounded flex items-center justify-center gap-2 font-medium hover:bg-gray-900 transition-colors">
                <span className="text-[18px]">Buy with</span>
                <svg className="h-5 w-auto" viewBox="0 0 40 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.38 12.04C4.24 12.04 3.28 11.64 2.5 10.84C1.72 10.04 1.33 9.04 1.33 7.84C1.33 6.64 1.72 5.64 2.5 4.84C3.28 4.04 4.24 3.64 5.38 3.64C6.52 3.64 7.48 4.04 8.26 4.84C9.04 5.64 9.43 6.64 9.43 7.84C9.43 9.04 9.04 10.04 8.26 10.84C7.48 11.64 6.52 12.04 5.38 12.04ZM5.38 10.32C6.02 10.32 6.56 10.08 7 9.6C7.44 9.12 7.66 8.53 7.66 7.84C7.66 7.15 7.44 6.56 7 6.08C6.56 5.6 6.02 5.36 5.38 5.36C4.74 5.36 4.2 5.6 3.76 6.08C3.32 6.56 3.1 7.15 3.1 7.84C3.1 8.53 3.32 9.12 3.76 9.6C4.2 10.08 4.74 10.32 5.38 10.32ZM14.94 12.04C13.8 12.04 12.84 11.64 12.06 10.84C11.28 10.04 10.89 9.04 10.89 7.84C10.89 6.64 11.28 5.64 12.06 4.84C12.84 4.04 13.8 3.64 14.94 3.64C16.08 3.64 17.04 4.04 17.82 4.84C18.6 5.64 18.99 6.64 18.99 7.84C18.99 9.04 18.6 10.04 17.82 10.84C17.04 11.64 16.08 12.04 14.94 12.04ZM14.94 10.32C15.58 10.32 16.12 10.08 16.56 9.6C17 9.12 17.22 8.53 17.22 7.84C17.22 7.15 17 6.56 16.56 6.08C16.12 5.6 15.58 5.36 14.94 5.36C14.3 5.36 13.76 5.6 13.32 6.08C12.88 6.56 12.66 7.15 12.66 7.84C12.66 8.53 12.88 9.12 13.32 9.6C13.76 10.08 14.3 10.32 14.94 10.32ZM24.5 12.04C23.36 12.04 22.4 11.64 21.62 10.84C20.84 10.04 20.45 9.04 20.45 7.84C20.45 6.64 20.84 5.64 21.62 4.84C22.4 4.04 23.36 3.64 24.5 3.64C25.64 3.64 26.6 4.04 27.38 4.84C28.16 5.64 28.55 6.64 28.55 7.84C28.55 9.04 28.16 10.04 27.38 10.84C26.6 11.64 25.64 12.04 24.5 12.04ZM24.5 10.32C25.14 10.32 25.68 10.08 26.12 9.6C26.56 9.12 26.78 8.53 26.78 7.84C26.78 7.15 26.56 6.56 26.12 6.08C25.68 5.6 25.14 5.36 24.5 5.36C23.86 5.36 23.32 5.6 22.88 6.08C22.44 6.56 22.22 7.15 22.22 7.84C22.22 8.53 22.44 9.12 22.88 9.6C23.32 10.08 23.86 10.32 24.5 10.32ZM34.06 12.04C32.92 12.04 31.96 11.64 31.18 10.84C30.4 10.04 30.01 9.04 30.01 7.84C30.01 6.64 30.4 5.64 31.18 4.84C31.96 4.04 32.92 3.64 34.06 3.64C35.2 3.64 36.16 4.04 36.94 4.84C37.72 5.64 38.11 6.64 38.11 7.84C38.11 9.04 37.72 10.04 36.94 10.84C36.16 11.64 35.2 12.04 34.06 12.04ZM34.06 10.32C34.7 10.32 35.24 10.08 35.68 9.6C36.12 9.12 36.34 8.53 36.34 7.84C36.34 7.15 36.12 6.56 35.68 6.08C35.24 5.6 34.7 5.36 34.06 5.36C33.42 5.36 32.88 5.6 32.44 6.08C32 6.56 31.78 7.15 31.78 7.84C31.78 8.53 32 9.12 32.44 9.6C32.88 10.08 33.42 10.32 34.06 10.32Z" fill="white"/>
                </svg>
                <span className="text-[18px] font-bold">Pay</span>
              </button>
              <p className="text-[11px] text-[#555555] mt-3 text-center">
                By continuing with your payment, you agree to Sticker Mule's <a href="#" className="text-[#0066cc] underline">privacy policy</a> and <a href="#" className="text-[#0066cc] underline">terms</a>.
              </p>
            </div>

            {/* Contact Info */}
            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#333333] mb-4">Contact info</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-bold text-[#333333] mb-1.5">
                    Email address <span className="text-gray-400 font-normal italic">Required</span>
                  </label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-[44px] border border-gray-300 rounded px-3 focus:outline-none focus:ring-1 focus:ring-[#f37021]"
                  />
                </div>
              </div>
            </section>

            {/* Shipping Info */}
            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#333333] mb-4">Shipping info</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-bold text-[#333333] mb-1.5">
                    Country <span className="text-gray-400 font-normal italic">Required</span>
                  </label>
                  <div className="relative">
                    <select className="w-full h-[44px] border border-gray-300 rounded px-3 appearance-none focus:outline-none focus:ring-1 focus:ring-[#f37021]">
                      <option>United States</option>
                      <option>Bangladesh</option>
                      <option>Canada</option>
                      <option>United Kingdom</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[#333333] mb-1.5">
                    Full name <span className="text-gray-400 font-normal italic">Required</span>
                  </label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-[44px] border border-gray-300 rounded px-3 focus:outline-none focus:ring-1 focus:ring-[#f37021]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[#333333] mb-1.5">
                    Company <span className="text-gray-400 font-normal italic">Optional</span>
                  </label>
                  <input 
                    type="text" 
                    className="w-full h-[44px] border border-gray-300 rounded px-3 focus:outline-none focus:ring-1 focus:ring-[#f37021]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[#333333] mb-1.5">
                    Street address <span className="text-gray-400 font-normal italic">Required</span>
                  </label>
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full h-[44px] border border-gray-300 rounded px-3 focus:outline-none focus:ring-1 focus:ring-[#f37021]"
                    />
                    <input 
                      type="text" 
                      className="w-full h-[44px] border border-gray-300 rounded px-3 focus:outline-none focus:ring-1 focus:ring-[#f37021]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-bold text-[#333333] mb-1.5">
                      ZIP code <span className="text-gray-400 font-normal italic">Required</span>
                    </label>
                    <input 
                      type="text" 
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      className="w-full h-[44px] border border-gray-300 rounded px-3 focus:outline-none focus:ring-1 focus:ring-[#f37021]"
                    />
                  </div>
                  <div className="flex items-end pb-3">
                    <span className="text-[12px] text-[#555555]">Enter ZIP for city and state</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-[#333333] mb-1.5">
                    Phone <span className="text-gray-400 font-normal italic">Optional</span>
                  </label>
                  <input 
                    type="tel" 
                    className="w-full h-[44px] border border-gray-300 rounded px-3 focus:outline-none focus:ring-1 focus:ring-[#f37021]"
                  />
                </div>
              </div>
            </section>

            {/* Delivery Date */}
            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#333333] mb-2">Delivery date</h2>
              <p className="text-[14px] text-[#555555]">Enter your shipping info to see possible delivery dates.</p>
            </section>

            {/* Billing Info */}
            <section className="mb-10">
              <h2 className="text-[24px] font-bold text-[#333333] mb-4">Billing info</h2>
              
              <div className="border border-gray-200 rounded overflow-hidden">
                {/* PayPal Option */}
                <label className={`flex items-center justify-between p-4 cursor-pointer border-b border-gray-200 ${paymentMethod === 'paypal' ? 'bg-[#f0f7ff]' : ''}`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="payment" 
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                      className="w-4 h-4 text-[#0066cc]"
                    />
                    <span className="text-[15px] font-medium">PayPal</span>
                  </div>
                  <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" className="h-6" />
                </label>

                {/* Credit Card Option */}
                <label className={`flex items-center justify-between p-4 cursor-pointer ${paymentMethod === 'credit-card' ? 'bg-[#f0f7ff]' : ''}`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="payment" 
                      checked={paymentMethod === 'credit-card'}
                      onChange={() => setPaymentMethod('credit-card')}
                      className="w-4 h-4 text-[#0066cc]"
                    />
                    <span className="text-[15px] font-medium">Credit card</span>
                  </div>
                  <div className="flex gap-1">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-4" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-4" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png" alt="Amex" className="h-4" />
                  </div>
                </label>

                {/* Credit Card Details */}
                {paymentMethod === 'credit-card' && (
                  <div className="p-6 bg-white border-t border-gray-200 space-y-4">
                    <div>
                      <label className="block text-[13px] font-bold text-[#333333] mb-1.5">Card number</label>
                      <input 
                        type="text" 
                        placeholder="1234 1234 1234 1234"
                        className="w-full h-[44px] border border-gray-300 rounded px-3 focus:outline-none focus:ring-1 focus:ring-[#f37021]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[13px] font-bold text-[#333333] mb-1.5">Expiration date</label>
                        <input 
                          type="text" 
                          placeholder="MM / YY"
                          className="w-full h-[44px] border border-gray-300 rounded px-3 focus:outline-none focus:ring-1 focus:ring-[#f37021]"
                        />
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-[#333333] mb-1.5">Security code</label>
                        <input 
                          type="text" 
                          placeholder="CVC"
                          className="w-full h-[44px] border border-gray-300 rounded px-3 focus:outline-none focus:ring-1 focus:ring-[#f37021]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[13px] font-bold text-[#333333] mb-1.5">Country</label>
                      <div className="relative">
                        <select className="w-full h-[44px] border border-gray-300 rounded px-3 appearance-none focus:outline-none focus:ring-1 focus:ring-[#f37021]">
                          <option>Bangladesh</option>
                          <option>United States</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-[#0066cc] focus:ring-[#0066cc]" />
                  <span className="text-[14px] text-[#333333]">Billing address same as shipping</span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 mt-1 rounded border-gray-300 text-[#0066cc] focus:ring-[#0066cc]" />
                  <div className="flex flex-col">
                    <span className="text-[14px] text-[#333333]">Save on your next purchase</span>
                    <span className="text-[12px] text-gray-500">Subscribe to our newsletter and get exclusive offers and discounts.</span>
                  </div>
                </label>
              </div>
            </section>

            {/* Info Box */}
            <div className="bg-[#f9f9f9] border border-gray-200 rounded p-4 flex items-start gap-3 mb-8">
              <Info className="w-5 h-5 text-gray-400 mt-0.5" />
              <p className="text-[14px] text-[#333333]">You won't be charged until you approve your proof.</p>
            </div>

            {/* Place Order Button */}
            <button 
              onClick={handlePlaceOrder}
              className={`w-full h-[64px] rounded font-bold text-[20px] transition-colors mb-6 shadow-sm ${
                isFormValid 
                  ? 'bg-[#f37021] hover:bg-[#e0661e] text-white' 
                  : 'bg-[#a5c7f9] text-white cursor-not-allowed'
              }`}
            >
              Place your order
            </button>

            <p className="text-[12px] text-[#555555] text-center">
              By clicking Place your order, you agree to Sticker Mule's <a href="#" className="text-[#0066cc] underline">privacy policy</a> and <a href="#" className="text-[#0066cc] underline">terms</a>.
            </p>
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-[#f4f4f4] rounded-lg p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[18px] font-bold text-[#333333]">Order summary</h2>
                <img src="https://i.ibb.co.com/m5S88G9h/digicert.png" alt="Digicert" className="h-8" />
              </div>

              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-[14px]">
                    <div>
                      <p className="font-bold text-[#333333]">{item.name}</p>
                      <p className="text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-[#333333]">${Math.round(item.totalPrice)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                {discount > 0 && (
                  <div className="flex justify-between text-[14px]">
                    <span className="text-[#2e7d32] font-bold">Discount for multiple designs</span>
                    <span className="text-[#2e7d32] font-bold">-${Math.round(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#333333]">Subtotal</span>
                  <span className="text-[#333333]">${Math.round(total)}</span>
                </div>
              </div>

              <div className="border-t border-gray-300 mt-4 pt-4 flex justify-between items-center">
                <span className="text-[18px] font-bold text-[#333333]">Total</span>
                <span className="text-[18px] font-bold text-[#333333]">${Math.round(total)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
