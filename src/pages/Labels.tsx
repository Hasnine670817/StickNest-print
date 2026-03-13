import React, { useEffect, useState } from 'react';
import { Star, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Feature from '../components/Feature';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  is_active: boolean;
}

export default function Labels() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const labels = products.filter(p => p.category === 'labels' && p.is_active);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('category', 'labels')
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
    {
      initials: 'WD',
      bg: 'bg-blue-100',
      title: 'Perfect Quality Every Time!',
      name: 'Wendy Daniels',
      time: '3 hours ago',
      text: 'Our Store never disappoints. I\'ve used them over and over again and they are consistent. The quality is top notch.'
    },
    {
      initials: 'AL',
      bg: 'bg-purple-100',
      title: 'Best stickers ever',
      name: 'Amber Lynch',
      time: '13 hours ago',
      text: 'I ordered 3 sticker packs from 3 different companies at the same time. Our Store was the cheapest, fastest delivery, and over all best quality. I have ordered from them multiple times and have never been let down, they will be my go to.'
    },
    {
      initials: 'MT',
      bg: 'bg-green-100',
      title: 'Great stickers',
      name: 'Mary Tran',
      time: '15 hours ago',
      text: 'Good stickers. Nice feel to them and great stickiness.'
    },
    {
      initials: 'MT',
      bg: 'bg-green-100',
      title: 'Excellent stickers',
      name: 'Mary Tran',
      time: '15 hours ago',
      text: 'Stickers are great! Nice feel to them! Good stick to them.'
    },
    {
      initials: 'd',
      bg: 'bg-purple-800 text-white',
      title: 'Perfect quality bigger than expected',
      name: 'draco ots',
      time: '16 hours ago',
      text: 'Awesome will definitely be shopping again'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#f37021] text-white py-12 px-4 sm:px-8">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-between items-center md:items-center">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-[40px] md:text-[48px] font-bold leading-tight mb-2">Custom labels</h1>
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start text-[15px] font-medium space-y-2 sm:space-y-0">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-[#ffc107] fill-current" />
                ))}
                <span className="ml-2 font-bold">185,984 reviews</span>
              </div>
              <span className="hidden sm:inline mx-3">•</span>
              <span className="font-bold">Free shipping</span>
            </div>
          </div>
          <Link to="/samples" className="bg-[#e0661e] hover:bg-[#d45b19] transition-colors text-white px-6 py-2.5 rounded font-bold text-[15px]">
            Get samples
          </Link>
        </div>
      </section>

      {/* Grid Section */}
      <section className="bg-[#f4f4f4] py-16 px-4 sm:px-8">
        <div className="max-w-[1100px] mx-auto">
          {labels.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-12">
              {labels.map((product) => (
                <Link 
                  key={product.id} 
                  to={`/product/${product.name?.toLowerCase().replace(/\s+/g, '-') || 'product'}`} 
                  state={{ image: product.image_url, name: product.name, price: product.price }}
                  className="flex flex-col items-center text-center group cursor-pointer rounded-xl py-4 px-4 hover:bg-[#E8E8E8] transition-all duration-300"
                >
                  <div className="w-full flex items-center justify-center mb-4">
                    <img 
                      src={product.image_url || 'https://picsum.photos/seed/placeholder/200/200'} 
                      alt={product.name} 
                      className="w-full aspect-square object-cover rounded-xl border-[6px] border-white shadow-md group-hover:scale-105 transition-transform duration-300" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-[15px] text-[#333333] font-medium">{product.name}</span>
                  <span className="text-[13px] text-[#f37021] font-bold mt-1">From ${(product.price || 0).toFixed(2)}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500">No labels available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Feature Section 1 */}
      <Feature 
        title="Free shipping, free online proofs, fast turnaround."
        description="Custom labels are the fastest and easiest way to promote your business, product, or event – and Our Store is the easiest way to buy custom labels. We'll make beautiful vinyl custom labels from any artwork, logo, or photo. Order your custom labels in seconds and receive free online proofs, free worldwide shipping and super fast turnaround."
        videoSrc="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        imageSrc="https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      />

      {/* Feature Section 2 */}
      <section className="py-20 px-4 sm:px-8 bg-white border-t border-gray-100">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h2 className="text-[28px] md:text-[32px] font-bold text-[#333333] mb-4">Durable, weather resistant vinyl stickers</h2>
            <p className="text-[16px] text-[#333333] leading-relaxed">
              Print custom labels in any shape or size on premium vinyl. Don't stress about quality and durability. Our custom labels feature a special laminate that protects them from exposure to wind, rain and sunlight. You can even put them in your dishwasher and have them come out looking brand new.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <img src="https://i.ibb.co.com/QvrPTG5N/gallery-1.jpg" alt="Climbing with sticker" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="flex flex-col gap-4">
              <img src="https://i.ibb.co.com/Q3SLTWWF/gallery-2.jpg" alt="Sandwich sticker" className="w-full h-[calc(50%-0.5rem)] object-cover rounded-lg" />
              <img src="https://i.ibb.co.com/WpHwVx8M/gallery-3.jpg" alt="Triangle sticker" className="w-full h-[calc(50%-0.5rem)] object-cover rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 px-4 sm:px-8 bg-white border-t border-gray-100">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="text-[28px] font-bold text-[#333333] mb-10">Reviews for custom labels</h2>
          
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start text-center mb-12 gap-8 sm:gap-0">
            <div>
              <div className="text-[40px] font-bold text-[#333333] leading-none mb-2">4.8 / 5</div>
              <div className="flex justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-[#ffc107] fill-current" />
                ))}
              </div>
            </div>
            <div>
              <div className="text-[40px] font-bold text-[#333333] leading-none mb-2">185,984</div>
              <div className="text-[15px] text-[#333333]">Total reviews</div>
            </div>
            <div>
              <div className="text-[40px] font-bold text-[#333333] leading-none mb-2">96%</div>
              <div className="text-[15px] text-[#333333]">Would order again</div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mb-8"></div>
          
          <div className="space-y-10">
            {reviews.map((review, idx) => (
              <div key={idx} className="flex gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-[18px] font-bold shrink-0 ${review.bg}`}>
                  {review.initials}
                </div>
                <div>
                  <div className="flex items-center mb-1">
                    <div className="flex mr-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-[#ffc107] fill-current" />
                      ))}
                    </div>
                    <span className="font-bold text-[#333333] text-[15px]">{review.title}</span>
                  </div>
                  <div className="text-[13px] text-gray-500 mb-2">
                    <span className="font-bold text-[#333333]">{review.name}</span> {review.time}
                  </div>
                  <p className="text-[15px] text-[#333333] leading-relaxed">
                    {review.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="mt-10 mx-auto block bg-[#f4f4f4] hover:bg-[#e8e8e8] text-[#333333] font-bold py-3 px-6 rounded transition-colors text-[15px]">
            See all reviews
          </button>
        </div>
      </section>

    </div>
  );
}
