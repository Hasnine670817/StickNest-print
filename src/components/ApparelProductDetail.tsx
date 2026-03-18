import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface Props {
  product: any;
}

export default function ApparelProductDetail({ product }: Props) {
  const [selectedColor, setSelectedColor] = useState('Black');
  const [selectedSize, setSelectedSize] = useState('L');

  // Mock data for colors and sizes to match the design
  const colors = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Red', hex: '#FF0000' },
    { name: 'Navy', hex: '#1E3A8A' },
    { name: 'Gray', hex: '#808080' },
    { name: 'Orange', hex: '#F97316' },
    { name: 'Green', hex: '#22C55E' }
  ];
  const sizesAdult = ['S', 'M', 'L', 'XL', '2XL'];
  const sizesYouth = ['YS', 'YM', 'YL'];

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Image Collage */}
        <div className="md:col-span-2">
          <h1 className="text-[32px] font-bold text-[#333] leading-tight mb-2">{product.title}</h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <span className="text-sm text-gray-600 font-medium">24,237 reviews</span>
          </div>
          <p className="text-[15px] text-gray-600 mb-8 max-w-xl">
            Turn any design into a custom t-shirt with no minimum order and free 2-day shipping. Printed in full color on soft, 100% ring-spun cotton for unbeatable comfort.
          </p>
          
          {/* Image Grid */}
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Sticky Panel */}
        <div className="md:col-span-1">
          <div className="sticky top-20 border border-gray-300 rounded-lg p-6 shadow-sm bg-white">
            <h3 className="font-bold text-gray-900 mb-4">Select color</h3>
            <div className="flex gap-2 mb-6">
              {colors.map(color => (
                <button 
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`w-8 h-8 rounded-sm border-2 ${selectedColor === color.name ? 'border-black' : 'border-transparent'}`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 mb-6 font-medium">{selectedColor}</p>

            <div className="flex justify-between mb-2">
              <h3 className="font-bold text-gray-900">Enter sizes</h3>
              <span className="text-sm text-[#0066cc] cursor-pointer hover:underline">Size help</span>
            </div>
            
            <div className="mb-4">
              <p className="text-xs font-bold text-gray-500 mb-2">Adult</p>
              <div className="grid grid-cols-5 gap-2">
                {sizesAdult.map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`border ${selectedSize === size ? 'border-black' : 'border-gray-300'} rounded py-2 text-sm font-medium`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <p className="text-xs font-bold text-gray-500 mb-2">Youth</p>
              <div className="grid grid-cols-5 gap-2">
                {sizesYouth.map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`border ${selectedSize === size ? 'border-black' : 'border-gray-300'} rounded py-2 text-sm font-medium`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="text-2xl font-bold text-gray-900">${product.price || 19}</span>
              <span className="text-sm text-gray-500 text-right">${product.price || 19} / shirt<br/>Total shirts: 1</span>
            </div>

            <button className="w-full bg-[#f37021] hover:bg-[#e0661e] text-white font-bold py-4 rounded text-lg transition-all mb-2">
              Continue
            </button>
            <p className="text-center text-sm text-gray-500">Next: upload artwork →</p>
          </div>
        </div>
      </div>
    </div>
  );
}
