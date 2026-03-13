import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

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

export default function ProductDetail() {
  const { name } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const product = location.state as { image: string, name: string } | undefined;
  
  const title = product?.name || (name ? name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Product');
  const image = product?.image || "https://picsum.photos/seed/diecut/600/400";
  
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [selectedQuantity, setSelectedQuantity] = useState(quantities[0]);
  const [customWidth, setCustomWidth] = useState('3');
  const [customHeight, setCustomHeight] = useState('3');

  const getPriceFactor = () => {
    if (selectedSize.name === 'Custom size') {
      const width = parseFloat(customWidth) || 1;
      const height = parseFloat(customHeight) || 1;
      // Formula: max dimension / 2 (matches the predefined sizes)
      return Math.max(width, height) / 2;
    }
    return selectedSize.priceFactor;
  };

  const currentPriceFactor = getPriceFactor();
  const totalPrice = selectedQuantity.price * currentPriceFactor;

  const handleContinue = () => {
    navigate('/upload-artwork', {
      state: {
        product: { name: title, image },
        size: selectedSize.name === 'Custom size' ? { name: `${customWidth}" x ${customHeight}"` } : selectedSize,
        quantity: selectedQuantity,
        price: totalPrice
      }
    });
  };

  return (
    <div className="max-w-[1100px] mx-auto p-4 md:py-12 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Left Side: Product Info & Image */}
      <div>
        <h1 className="text-4xl font-bold text-[#333333] mb-2">{title}</h1>
        <div className="flex items-center mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-5 h-5 text-[#ffc107] fill-current" />
          ))}
          <span className="ml-2 font-bold text-[#333333]">89,122 reviews</span>
        </div>
        <p className="text-[#333333] mb-6">
          Custom {title?.toLowerCase() || 'products'} are a fast and easy way to promote your business, brand, or event. Perfect for laptops, water bottles, and more. Thick, durable vinyl protects your stickers from scratches, water, and sunlight. They’re even dishwasher safe.
        </p>
        <img src={image} alt={title} className="w-full rounded-xl" />
      </div>

      {/* Right Side: Configuration Panel */}
      <div className="border border-gray-200 rounded-lg p-6 h-fit">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-[#333333]">Select a size</h2>
            <button className="text-sm text-[#0066cc] font-bold hover:underline">Size help</button>
          </div>
          {sizes.map((size) => (
            <div key={size.name}>
              <label className="flex items-center mb-2 cursor-pointer">
                <input
                  type="radio"
                  name="size"
                  className="w-4 h-4 text-[#f37021] focus:ring-[#f37021]"
                  checked={selectedSize.name === size.name}
                  onChange={() => setSelectedSize(size)}
                />
                <span className="ml-2 text-[#333333] font-bold">{size.name}</span>
              </label>
              {size.name === 'Custom size' && selectedSize.name === 'Custom size' && (
                <div className="flex items-center gap-2 mb-4 ml-6">
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    className="w-16 border border-gray-300 rounded p-1 text-center"
                    min="1"
                  />
                  <span>x</span>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                    className="w-16 border border-gray-300 rounded p-1 text-center"
                    min="1"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold text-[#333333] mb-4">Select a quantity</h2>
          <div className="space-y-2">
            {quantities.map((qty) => (
              <label key={qty.amount} className="flex items-center justify-between mb-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="quantity"
                    className="w-4 h-4 text-[#f37021] focus:ring-[#f37021]"
                    checked={selectedQuantity.amount === qty.amount}
                    onChange={() => setSelectedQuantity(qty)}
                  />
                  <span className="ml-2 text-[#333333] font-bold">{qty.amount}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[#333333] font-bold">${(qty.price * currentPriceFactor).toFixed(2)}</span>
                  {qty.save && <span className="text-green-600 text-sm font-bold">Save {qty.save}</span>}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex justify-between items-center mb-6">
            <span className="text-3xl font-bold text-[#333333]">${totalPrice.toFixed(2)}</span>
            <span className="text-sm text-gray-500">${(totalPrice / selectedQuantity.amount).toFixed(2)} / sticker</span>
          </div>
          <button 
            onClick={handleContinue}
            className="w-full bg-[#f37021] hover:bg-[#e0661e] text-white font-bold py-4 rounded text-lg transition-colors"
          >
            Continue
          </button>
          <p className="text-center text-sm text-gray-500 mt-4">Next: upload artwork →</p>
        </div>
      </div>
    </div>
  );
}

