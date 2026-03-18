import React, { useState, useEffect } from 'react';
import { Star, X } from 'lucide-react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTranslation } from 'react-i18next';

const sizes = [
  { name: '2" x 2"', priceFactor: 1 },
  { name: '3" x 3"', priceFactor: 1.5 },
  { name: '4" x 4"', priceFactor: 2 },
  { name: '5" x 5"', priceFactor: 2.5 },
  { name: 'Custom size', priceFactor: 3 },
];

const quantities = [
  { amount: 50, price: 60 },
  { amount: 100, price: 73, save: '39%' },
  { amount: 200, price: 95, save: '60%' },
  { amount: 300, price: 115, save: '68%' },
  { amount: 500, price: 152, save: '75%' },
  { amount: 1000, price: 232, save: '81%' },
  { amount: 2000, price: 371, save: '85%' },
  { amount: 3000, price: 496, save: '86%' },
  { amount: 5000, price: 723, save: '88%' },
  { amount: 10000, price: 1225, save: '90%' },
];

interface ProductData {
  id: string;
  name: string;
  description: string;
  image_url: string;
  banner_image_url?: string;
  price: number;
}

export default function ProductDetail() {
  const { name } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { t } = useTranslation();
  
  const [product, setProduct] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [selectedQuantity, setSelectedQuantity] = useState(quantities[0]);
  const [customWidth, setCustomWidth] = useState('3');
  const [customHeight, setCustomHeight] = useState('3');
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [sampleWidth, setSampleWidth] = useState('3');
  const [sampleHeight, setSampleHeight] = useState('3');

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        // Try to find by slug-like name
        const searchName = name?.replace(/-/g, ' ');
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .ilike('name', searchName || '')
          .single();
        
        if (error) {
          console.error('Error fetching product:', error);
          // Fallback to location state if available
          if (location.state) {
            setProduct({
              id: 'fallback',
              name: location.state.name,
              description: 'Custom products are a fast and easy way to promote your business, brand, or event.',
              image_url: location.state.image,
              banner_image_url: location.state.banner_image_url,
              price: location.state.price || 0
            });
          }
        } else {
          setProduct(data);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [name, location.state]);

  const getPriceFactor = () => {
    if (selectedSize.name === 'Custom size') {
      const width = parseFloat(customWidth) || 1;
      const height = parseFloat(customHeight) || 1;
      return Math.max(width, height) / 2;
    }
    return selectedSize.priceFactor;
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Product not found</h2>
        <p className="text-gray-500 mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/')} className="bg-[#f37021] text-white px-6 py-2 rounded font-bold">Back to Home</button>
      </div>
    );
  }

  const currentPriceFactor = getPriceFactor();
  const totalPrice = selectedQuantity.price * currentPriceFactor;

  const handleContinue = () => {
    navigate('/upload-artwork', {
      state: {
        product: { name: product.name, image: product.image_url },
        size: selectedSize.name === 'Custom size' ? { name: `${customWidth}" x ${customHeight}"` } : selectedSize,
        quantity: selectedQuantity,
        price: totalPrice
      }
    });
  };

  const handleSampleContinue = () => {
    navigate('/upload-artwork', {
      state: {
        product: { name: product.name, image: product.image_url },
        size: { name: `${sampleWidth}" x ${sampleHeight}"` },
        quantity: { amount: 10, price: 9 },
        price: 9
      }
    });
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: `url(${product.banner_image_url || 'https://i.ibb.co.com/j9q6K4Ds/die-cart-bg.webp'})`,
        backgroundColor: '#EFEFEF'
      }}
    >
      <div className="min-h-screen">
        <div className="max-w-[1100px] mx-auto p-3 sm:p-6 md:p-8 lg:p-12 grid grid-cols-1 md:grid-cols-[1fr_280px] lg:grid-cols-[auto_315px] gap-6 md:gap-8 lg:gap-12">
          {/* Left Side: Product Info */}
          <div className="order-1 px-1">
            <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3 mb-4">
              <h1 className="text-2xl md:text-2xl lg:text-3xl font-bold text-[#333333] leading-tight">{product.name}</h1>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-[#ffc107] fill-current" />
                ))}
                <span className="ml-2 text-xs md:text-sm font-bold text-[#333333]">89,122 reviews</span>
              </div>
            </div>
            <p className="text-sm md:text-base text-[#333333] mb-6 leading-relaxed opacity-90">
              {product.description || `Custom ${product.name?.toLowerCase()} are a fast and easy way to promote your business, brand, or event. Perfect for laptops, water bottles, and more. Thick, durable vinyl protects your stickers from scratches, water, and sunlight. They’re even dishwasher safe.`}
            </p>
            <button 
              type="button" 
              onClick={() => setIsSampleModalOpen(true)}
              className="text-xs md:text-sm py-2.5 px-5 border border-[#D2D2D2] hover:bg-[#E8E8E8] rounded-md bg-white font-bold transition-colors shadow-sm active:bg-gray-100"
            >
              Order samples
            </button>
          </div>

          {/* Right Side: Configuration Panel */}
          <div className="order-2 border bg-white border-gray-200 rounded-2xl p-4 sm:p-5 lg:p-6 h-fit shadow-lg md:[box-shadow:0_0_0_5px_rgba(0,0,0,.15)] mx-1">
            <div className="mb-6 md:mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base md:text-lg font-bold text-[#333333]">Select a size</h2>
                <button className="text-xs md:text-sm text-[#0066cc] font-bold hover:underline">Size help</button>
              </div>
              <div className="space-y-3">
                {sizes.map((size) => (
                  <div key={size.name}>
                    <label className="flex items-center mb-2 cursor-pointer text-xs md:text-sm group">
                      <input
                        type="radio"
                        name="size"
                        className="w-4 h-4 text-[#f37021] focus:ring-[#f37021] cursor-pointer"
                        checked={selectedSize.name === size.name}
                        onChange={() => setSelectedSize(size)}
                      />
                      <span className="ml-2 text-[#333333] font-bold group-hover:text-[#f37021] transition-colors">{size.name}</span>
                    </label>
                    {size.name === 'Custom size' && selectedSize.name === 'Custom size' && (
                      <div className="flex items-center gap-2 mb-4 ml-6 animate-in fade-in slide-in-from-left-2 duration-200">
                        <input
                          type="number"
                          value={customWidth}
                          onChange={(e) => setCustomWidth(e.target.value)}
                          className="w-14 md:w-16 border border-gray-300 rounded-lg p-2 text-center font-bold text-sm focus:border-[#f37021] outline-none"
                          min="1"
                        />
                        <span className="text-gray-400 text-sm">×</span>
                        <input
                          type="number"
                          value={customHeight}
                          onChange={(e) => setCustomHeight(e.target.value)}
                          className="w-14 md:w-16 border border-gray-300 rounded-lg p-2 text-center font-bold text-sm focus:border-[#f37021] outline-none"
                          min="1"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6 md:mb-8">
              <h2 className="text-base md:text-lg font-bold text-[#333333] mb-4">Select a quantity</h2>
              <div className="max-h-[250px] md:max-h-[300px] overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
                {quantities.map((qty) => (
                  <label key={qty.amount} className="flex items-center text-xs md:text-sm justify-between mb-0 cursor-pointer hover:bg-gray-50 p-2.5 rounded-xl transition-colors group">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="quantity"
                        className="w-4 h-4 text-[#f37021] focus:ring-[#f37021] cursor-pointer"
                        checked={selectedQuantity.amount === qty.amount}
                        onChange={() => setSelectedQuantity(qty)}
                      />
                      <span className="ml-2 text-[#333333] font-bold group-hover:text-[#f37021] transition-colors">{qty.amount}</span>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                      <span className="text-[#333333] font-bold">${(qty.price * currentPriceFactor).toFixed(2)}</span>
                      {qty.save && <span className="text-green-600 text-[9px] md:text-[10px] font-bold bg-green-50 px-2 py-0.5 rounded-full whitespace-nowrap">Save {qty.save}</span>}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-2xl md:text-3xl font-bold text-[#333333]">${totalPrice.toFixed(2)}</span>
                  <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">Includes free shipping</p>
                </div>
                <span className="text-xs md:text-sm text-gray-500 font-bold">${(totalPrice / selectedQuantity.amount).toFixed(2)} / unit</span>
              </div>
              <button 
                onClick={handleContinue}
                className="w-full bg-[#f37021] hover:bg-[#e0661e] text-white font-bold py-3.5 md:py-4 rounded-xl text-base md:text-lg transition-all active:scale-[0.98] shadow-lg shadow-[#f37021]/20"
              >
                Continue
              </button>
              <p className="text-center text-xs md:text-sm text-gray-500 mt-4">Next: upload artwork →</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Modal */}
      <AnimatePresence>
        {isSampleModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSampleModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-[4px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-[480px] p-6 sm:p-8 md:p-10 lg:p-12 text-center max-h-[92vh] overflow-y-auto"
            >
              <button 
                onClick={() => setIsSampleModalOpen(false)}
                className="absolute top-5 right-5 p-2.5 text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 rounded-full hover:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-[#333333] mb-3 md:mb-4 leading-tight mt-4">Get custom samples</h2>
              <p className="text-sm md:text-base text-gray-600 mb-8 md:mb-12">Order 10 custom samples for $9. Free shipping.</p>

              <div className="flex items-center justify-center gap-4 md:gap-6 lg:gap-8 mb-10 md:mb-14">
                <div className="relative">
                  <input
                    type="number"
                    value={sampleWidth}
                    onChange={(e) => setSampleWidth(e.target.value)}
                    className="w-16 h-12 md:w-20 md:h-14 lg:w-24 lg:h-16 border-2 border-orange-100 rounded-2xl text-center text-lg md:text-xl lg:text-2xl font-bold focus:border-[#f37021] focus:ring-8 focus:ring-[#f37021]/5 outline-none transition-all"
                  />
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white px-2 text-[9px] font-bold text-[#f37021] uppercase tracking-widest">Width</span>
                </div>
                <span className="text-gray-300 text-2xl font-light">×</span>
                <div className="relative">
                  <input
                    type="number"
                    value={sampleHeight}
                    onChange={(e) => setSampleHeight(e.target.value)}
                    className="w-16 h-12 md:w-20 md:h-14 lg:w-24 lg:h-16 border-2 border-gray-100 rounded-2xl text-center text-lg md:text-xl lg:text-2xl font-bold focus:border-[#f37021] focus:ring-8 focus:ring-[#f37021]/5 outline-none transition-all"
                  />
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white px-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Height</span>
                </div>
              </div>

              <button
                onClick={handleSampleContinue}
                className="w-full bg-[#f37021] hover:bg-[#e0661e] text-white font-bold py-4 md:py-5 rounded-2xl text-base md:text-lg lg:text-xl transition-all shadow-xl shadow-[#f37021]/30 active:scale-[0.98] mb-6"
              >
                Order 10 samples for $9
              </button>

              <p className="text-[10px] md:text-sm text-gray-400 font-semibold tracking-wide">Next: upload artwork →</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

