import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, Lock, Share2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeItem, isCartLoading } = useCart();
  const { user } = useAuth();

  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const discount = cartItems.length > 1 ? subtotal * 0.1 : 0; // Simple discount logic for multiple designs
  const total = subtotal - discount;

  const handleCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      navigate('/checkout', { state: { items: cartItems, total } });
    }
  };

  if (isCartLoading) {
    return (
      <div className="min-h-screen bg-white py-20 px-4 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#f37021] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Loading your cart...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white py-20 px-4 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-[#333333] mb-4">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <button 
          onClick={() => navigate('/')}
          className="bg-[#f37021] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#e0661e] transition-colors flex items-center"
        >
          Start shopping
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-[56px] font-bold text-[#333333] mb-12 tracking-tight">Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Cart Items List */}
          <div className="lg:col-span-8">
            <div className="border-b border-gray-200 pb-2 mb-6 grid grid-cols-12 text-[11px] font-bold text-[#333333] uppercase tracking-wider">
              <div className="col-span-7">Description</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-1"></div>
            </div>

            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item.id} className="grid grid-cols-12 items-center gap-4 pb-6 border-b border-gray-100 last:border-0">
                  {/* Description */}
                  <div className="col-span-7 flex items-start gap-4">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-[72px] h-[72px] rounded-lg object-cover border border-gray-100 shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[17px] font-bold text-[#0066cc] hover:underline cursor-pointer leading-tight">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[15px] text-[#333333] mt-0.5">
                        <span>{item.size}</span>
                        <Link to={`/product/${item.name?.toLowerCase().replace(/\s+/g, '-') || 'product'}`} className="text-[#0066cc] hover:underline font-bold">Edit</Link>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        {item.artwork ? (
                          item.artwork.startsWith('data:image') ? (
                            <div className="flex items-center gap-2">
                              <img src={item.artwork} alt="Artwork" className="w-8 h-8 rounded border border-gray-200 object-cover" />
                              <span className="text-[12px] text-gray-500 font-medium">Custom artwork</span>
                            </div>
                          ) : (
                            <span className="text-[14px] text-[#555555] truncate block max-w-[150px]">{item.artwork}</span>
                          )
                        ) : (
                          <Link to="/upload-artwork" className="text-[#0066cc] text-[14px] hover:underline font-bold">Upload artwork</Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-2 flex justify-center">
                    <input 
                      type="number" 
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                      className="w-[72px] h-[44px] border border-gray-300 rounded text-[16px] text-center font-normal focus:outline-none focus:ring-1 focus:ring-[#f37021]"
                      min="1"
                    />
                  </div>

                  {/* Total */}
                  <div className="col-span-2 text-right">
                    <span className="text-[20px] font-bold text-[#333333]">${Math.round(item.totalPrice)}</span>
                  </div>

                  {/* Remove */}
                  <div className="col-span-1 flex justify-end">
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors group"
                    >
                      <X className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Discount Section */}
            {discount > 0 && (
              <div className="mt-10 pt-6 border-t border-gray-200 flex justify-between items-center">
                <span className="text-[18px] font-bold text-[#2e7d32]">Discount for multiple designs</span>
                <span className="text-[20px] font-bold text-[#2e7d32]">-${Math.round(discount)}</span>
              </div>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-[#f4f4f4] rounded-xl p-8 sticky top-8">
              <div className="text-center mb-6">
                <h2 className="text-[24px] font-bold text-[#333333]">Subtotal: ${Math.round(total)}</h2>
              </div>
              
              <button 
                onClick={handleCheckout}
                className="w-full bg-[#f37021] text-white py-4 rounded-lg font-bold text-[22px] hover:bg-[#e0661e] transition-all shadow-md flex items-center justify-center gap-2 mb-6"
              >
                Checkout
                <Lock className="w-5 h-5 fill-current" />
              </button>

              <button className="w-full flex items-center justify-center gap-2 text-[#0066cc] font-bold hover:underline text-[15px]">
                <Share2 className="w-4 h-4" />
                Share your cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
