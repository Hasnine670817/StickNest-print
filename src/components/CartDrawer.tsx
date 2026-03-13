import React from 'react';
import { X, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleCheckout = () => {
    onClose();
    navigate('/cart');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-[400px] bg-white z-[101] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#f37021]" />
                <h2 className="text-lg font-bold text-[#333333]">Your Cart ({cartItems.length})</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingCart className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-[#333333] mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
                  <button
                    onClick={onClose}
                    className="bg-[#f37021] text-white px-6 py-2 rounded font-bold hover:bg-[#e0661e] transition-colors"
                  >
                    Start shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-md object-cover border border-gray-50"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-[#333333] text-sm truncate">{item.name}</h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{item.size}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-gray-200 rounded">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="px-2 py-0.5 hover:bg-gray-100 text-gray-600"
                          >
                            -
                          </button>
                          <span className="px-2 py-0.5 text-xs font-medium border-x border-gray-200">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-0.5 hover:bg-gray-100 text-gray-600"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-bold text-[#333333] text-sm">${Math.round(item.totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600 font-medium">Subtotal</span>
                  <span className="text-xl font-bold text-[#333333]">${Math.round(subtotal)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-[#f37021] hover:bg-[#e0661e] text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
                >
                  View Cart & Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
