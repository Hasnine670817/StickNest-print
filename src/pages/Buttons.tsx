import React, { useEffect, useState } from 'react';
import { Star, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Feature from '../components/Feature';
import LoadingSpinner from '../components/LoadingSpinner';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  banner_image_url?: string;
  is_active: boolean;
}

interface Review {
  id: number;
  user_name: string;
  user_avatar: string | null;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
}

export default function Buttons() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const buttons = products.filter(p => p.category === 'buttons' && p.is_active);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('category', 'buttons')
          .eq('is_active', true);
        
        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('is_approved', true)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (error) throw error;
        setReviews(data || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };

    fetchProducts();
    fetchReviews();
  }, []);

  const stats = {
    average: reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '4.8',
    total: reviews.length > 0 ? reviews.length.toLocaleString() : '185,984',
    recommend: '96%'
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#f37021] text-white py-12 px-4 sm:px-8">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-between items-center md:items-center">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-[40px] md:text-[48px] font-bold leading-tight mb-2">Custom buttons</h1>
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
        </div>
      </section>

      {/* Grid Section */}
      <section className="bg-[#f4f4f4] py-16 px-4 sm:px-8">
        <div className="max-w-[1100px] mx-auto">
          {isLoading ? (
            <LoadingSpinner />
          ) : buttons.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-12">
              {buttons.map((product) => (
                <Link 
                  key={product.id} 
                  to={`/product/${product.name?.toLowerCase().replace(/\s+/g, '-') || 'product'}`} 
                  state={{ 
                    image: product.image_url, 
                    name: product.name, 
                    price: product.price,
                    banner_image_url: product.banner_image_url
                  }}
                  className="flex flex-col items-center text-center group cursor-pointer rounded-xl py-4 px-4 hover:bg-[#E8E8E8] transition-all duration-300"
                >
                  <div className="w-full flex items-center justify-center mb-4">
                    <img 
                      src={product.image_url || 'https://picsum.photos/seed/placeholder/200/200'} 
                      alt={product.name} 
                      className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-[15px] text-[#333333] font-medium">{product.name}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500">No buttons available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* Feature Section 1 */}
      <Feature 
        title="Free shipping, free online proofs, fast turnaround."
        description="Custom buttons are the fastest and easiest way to promote your business, product, or event – and Our Store is the easiest way to buy custom buttons. We'll make beautiful vinyl custom buttons from any artwork, logo, or photo. Order your custom buttons in seconds and receive free online proofs, free worldwide shipping and super fast turnaround."
        videoSrc="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
        imageSrc="https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      />

      {/* Feature Section 2 */}
      <section className="py-20 px-4 sm:px-8 bg-white border-t border-gray-100">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <h2 className="text-[28px] md:text-[32px] font-bold text-[#333333] mb-4">Durable, weather resistant vinyl stickers</h2>
            <p className="text-[16px] text-[#333333] leading-relaxed">
              Print custom buttons in any shape or size on premium vinyl. Don't stress about quality and durability. Our custom buttons feature a special laminate that protects them from exposure to wind, rain and sunlight. You can even put them in your dishwasher and have them come out looking brand new.
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
          <h2 className="text-[28px] font-bold text-[#333333] mb-10">Reviews for custom buttons</h2>
          
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start text-center mb-12 gap-8 sm:gap-0">
            <div>
              <div className="text-[40px] font-bold text-[#333333] leading-none mb-2">{stats.average} / 5</div>
              <div className="flex justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.round(parseFloat(stats.average)) ? 'text-[#ffc107] fill-current' : 'text-gray-300'}`} />
                ))}
              </div>
            </div>
            <div>
              <div className="text-[40px] font-bold text-[#333333] leading-none mb-2">{stats.total}</div>
              <div className="text-[15px] text-[#333333]">Total reviews</div>
            </div>
            <div>
              <div className="text-[40px] font-bold text-[#333333] leading-none mb-2">{stats.recommend}</div>
              <div className="text-[15px] text-[#333333]">Would order again</div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mb-8"></div>
          
          <div className="space-y-10">
            {reviews.length === 0 ? (
              <p className="text-center text-gray-500 py-10">No reviews yet. Be the first to write one!</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-[18px] font-bold shrink-0 overflow-hidden">
                    {review.user_avatar ? (
                      <img src={review.user_avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      review.user_name.charAt(0)
                    )}
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      <div className="flex mr-3">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-[#ffc107] fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="font-bold text-[#333333] text-[15px]">{review.title}</span>
                    </div>
                    <div className="text-[13px] text-gray-500 mb-2">
                      <span className="font-bold text-[#333333]">{review.user_name}</span> {new Date(review.created_at).toLocaleDateString()}
                    </div>
                    <p className="text-[15px] text-[#333333] leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <Link to="/deals" className="mt-10 mx-auto block w-fit bg-[#f4f4f4] hover:bg-[#e8e8e8] text-[#333333] font-bold py-3 px-6 rounded transition-colors text-[15px]">
            Write a review
          </Link>
        </div>
      </section>

    </div>
  );
}
