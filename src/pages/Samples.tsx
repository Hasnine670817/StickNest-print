import React, { useEffect, useState } from 'react';
import { Play, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_active: boolean;
}

export default function Samples() {
  const [isPlaying, setIsPlaying] = useState(false);
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const samples = products.filter(p => p.category === 'samples' && p.is_active);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('category', 'samples')
          .eq('is_active', true);
        
        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const reviews = [
    { initials: 'SS', color: 'bg-[#e9d5ff] text-[#6b21a8]', title: 'Labels', author: 'Sharon Simpson', time: '18 hours ago', text: 'Sticker mule always provide professional customer service and perfect quality. Always willing to assist. My labels were perfect and the delivery time was superb and earlier than expected.' },
    { initials: 'T', color: 'bg-[#7e22ce] text-white', title: 'Feels so good!', author: 'Tia Mack', time: '19 hours ago', text: 'I wasn\'t expecting the texture to feel this silky. Definitely not regular labels.' },
    { initials: 'G', color: 'bg-[#ec4899] text-white', title: 'Absolutely gorgeous .', author: 'German ortecho', time: '2 days ago', text: 'Always great quality thanks.' },
    { initials: 'J', color: 'bg-[#64748b] text-white', title: 'Great looking', author: 'Jen H', time: '2 days ago', text: 'Stickers! Affordable price too.' },
    { initials: 'B', color: 'bg-[#57534e] text-white', title: 'The awesome job', author: 'Robert Howard', time: '2 days ago', text: 'Well done' },
  ];

  return (
    <div className="w-full bg-white">
      {/* Hero */}
      <section className="bg-[#f4f4f4] py-12 md:py-20 px-4">
        <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
            <h1 className="text-3xl md:text-[40px] font-bold text-[#333333] mb-4 leading-tight">Sample pack for $1</h1>
            <p className="text-[#555555] mb-6 text-[16px] md:text-[18px]">Each pack contains stickers, labels, and magnets.<br className="hidden md:block"/>Free shipping</p>
            <button 
              onClick={() => addToCart({
                name: 'Sample pack',
                image: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                size: 'Standard',
                quantity: 1,
                pricePerUnit: 1,
                totalPrice: 1
              })}
              className="bg-[#0066cc] hover:bg-[#005bb5] text-white font-bold py-3 px-8 rounded text-[16px] md:text-[18px] transition-colors"
            >
              Add to cart
            </button>
          </div>
          <div className="md:w-1/2 flex justify-center md:justify-end">
            <img src="https://images.unsplash.com/photo-1572375992501-4b0892d50c69?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" alt="Sample Pack" className="max-w-full h-auto object-contain drop-shadow-2xl mix-blend-multiply" />
          </div>
        </div>
      </section>

      {/* Custom Samples Grid */}
      <section className="py-16 md:py-24 px-4 bg-white">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="text-[24px] md:text-[32px] font-bold text-center text-[#333333] mb-12 md:mb-16">Or, get custom samples using your artwork.</h2>
          
          <div className="flex flex-wrap justify-center gap-x-4 md:gap-x-8 gap-y-12">
            {samples.map((product) => (
              <Link 
                key={product.id} 
                to={`/product/${product.name?.toLowerCase().replace(/\s+/g, '-') || 'product'}`} 
                state={{ image: product.image_url, name: product.name, price: product.price }}
                className="flex flex-col items-center text-center group cursor-pointer w-[100%] sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1.5rem)] max-w-[280px] rounded-xl hover:bg-[#E8E8E8] transition-all duration-300 py-4 px-4"
              >
                <div className="h-[180px] md:h-[200px] flex items-center justify-center mb-4 overflow-hidden w-full">
                  <img src={product.image_url} alt={product.name} className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300" />
                </div>
                <h3 className="font-bold text-[#333333] text-[16px] md:text-[17px]">{product.name}</h3>
                <p className="text-[#555555] mt-1 text-[14px] md:text-[15px]">${product.price.toFixed(2)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-16 md:py-24 px-4 bg-white">
        <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="md:w-1/2 relative w-full">
            {isPlaying ? (
              <div className="w-full h-[250px] sm:h-[300px] rounded-lg shadow-md overflow-hidden bg-black flex items-center justify-center">
                <video 
                  src="https://www.w3schools.com/html/mov_bbb.mp4" 
                  className="w-full h-full object-cover"
                  controls 
                  autoPlay 
                />
              </div>
            ) : (
              <>
                <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Custom Samples Video" className="w-full rounded-lg shadow-md object-cover h-[250px] sm:h-[300px]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button 
                    onClick={() => setIsPlaying(true)}
                    className="w-[60px] h-[40px] sm:w-[72px] sm:h-[48px] bg-[#cc5a1b]/90 hover:bg-[#cc5a1b] rounded-lg flex items-center justify-center transition-colors shadow-lg"
                  >
                    <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-current ml-1" />
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="md:w-1/2 text-center md:text-left">
            <h2 className="text-[24px] sm:text-[28px] md:text-[32px] font-bold mb-4 sm:mb-6 text-[#333333] leading-tight">Try custom samples before placing a large order</h2>
            <p className="text-[#555555] text-[15px] sm:text-[16px] leading-[1.6]">
              Order a small batch of custom printed stickers, labels or packaging to see how your design looks in real life. You'll get a free online proof, fast 4 day turnaround and free shipping. It's an inexpensive way to test us out and explore our product line.
            </p>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 md:py-24 px-4 bg-white">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-[24px] md:text-[28px] font-bold text-[#333333] mb-10">Reviews for samples</h2>
          
          {/* Stats */}
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-12 border-b border-gray-200 pb-12 gap-8 md:gap-0 text-center">
            <div className="flex flex-col items-center md:w-1/3">
              <span className="text-[36px] md:text-[40px] font-bold text-[#333333] mb-2 leading-none">4.8 / 5</span>
              <div className="flex text-[#ffc107]">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
            </div>
            <div className="flex flex-col items-center md:w-1/3">
              <span className="text-[36px] md:text-[40px] font-bold text-[#333333] mb-2 leading-none">39,732</span>
              <span className="text-[#555555] text-[15px]">Total reviews</span>
            </div>
            <div className="flex flex-col items-center md:w-1/3">
              <span className="text-[36px] md:text-[40px] font-bold text-[#333333] mb-2 leading-none">95%</span>
              <span className="text-[#555555] text-[15px]">Would order again</span>
            </div>
          </div>

          {/* Review List */}
          <div className="space-y-8 md:space-y-10">
            {reviews.map((review, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-4 md:gap-6">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-[20px] md:text-[22px] font-normal shrink-0 ${review.color}`}>
                  {review.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex text-[#ffc107]">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-[14px] h-[14px] fill-current" />)}
                    </div>
                    <span className="font-bold text-[#333333] text-[15px]">{review.title}</span>
                  </div>
                  <div className="text-[13px] text-[#555555] mb-2">
                    <span className="font-bold text-[#333333]">{review.author}</span> <span className="ml-1">{review.time}</span>
                  </div>
                  <p className="text-[#555555] text-[14px] md:text-[15px] leading-relaxed">
                    {review.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button className="bg-[#f4f4f4] hover:bg-[#e8e8e8] text-[#333333] font-bold py-2.5 px-6 rounded transition-colors text-[14px] md:text-[15px]">
              See all reviews
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
