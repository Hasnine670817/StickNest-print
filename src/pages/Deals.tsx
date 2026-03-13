import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Calendar, Smartphone, Sparkles, Check } from 'lucide-react';
import Feature from '../components/Feature';
import Logos from '../components/Logos';

export default function Deals() {
  const reviews = [
    {
      id: 1,
      name: 'The Chubbaka',
      time: '2 days ago',
      title: 'Beauty',
      text: 'Is amazing',
      avatar: 'https://i.ibb.co.com/8N4p4t9/chubbaka.png',
      rating: 5
    },
    {
      id: 2,
      name: 'Steelwing',
      time: '3 days ago',
      title: 'Super Quality!',
      text: 'Loved these, they came out perfect!',
      avatar: 'https://i.ibb.co.com/9tQ5M2K/steelwing.png',
      rating: 5
    },
    {
      id: 3,
      name: 'karen golembeski',
      time: '4 days ago',
      title: 'Best H2O stickers EVER',
      text: 'This is my 5th order with Sticker Mule, and you keep impressing me with your service and quality. The logo/design I sent you was blah, but with just a bit of editing, you made the stickers have wow factor! I can\'t wait for our school to receive them for our PTO fundraiser!',
      avatar: 'KG',
      rating: 5
    },
    {
      id: 4,
      name: 'Cody Mahurin',
      time: '5 days ago',
      title: 'Literally Jaw Dropping',
      text: 'Ordered a holographic sticker for a stained glass design for the first time. When I pulled them out of the package, I audibly said, "holy crap!" out of uncontrolled reaction. My wife even said, "oh wow!" as soon as she saw them. It looks more like a work of art than a sticker.',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      rating: 5
    },
    {
      id: 5,
      name: 'Frank Falls',
      time: '10 days ago',
      title: 'Great looking sticker. Quick production and ship.',
      text: 'Great looking sticker. Quick production and ship.',
      avatar: 'FF',
      rating: 5
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#ff9900] via-[#ff8800] to-[#ffaa00] py-16 md:py-24 px-4 flex flex-col items-center justify-center text-center">
        {/* Background Image Overlay to simulate the stickers */}
        <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-overlay" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
        
        <div className="relative z-10 max-w-[800px] mx-auto flex flex-col items-center">
          <h1 className="text-white text-[50px] md:text-[72px] font-bold leading-tight mb-2 drop-shadow-md tracking-tight">
            $29 for 50
          </h1>
          <h2 className="text-white text-[28px] md:text-[36px] font-bold mb-4 drop-shadow-md">
            Custom 3" × 3" holographic stickers
          </h2>
          <p className="text-white text-[20px] mb-8 drop-shadow-sm">
            Normally $80. Free shipping.
          </p>
          
          <button className="bg-[#0066cc] hover:bg-[#005bb5] text-white font-bold py-4 px-12 rounded-md text-[20px] transition-colors mb-4 shadow-lg">
            Order now
          </button>
          
          <p className="text-white text-[16px]">
            Or, <Link to="/stickers" className="font-bold hover:underline">shop all quantities</Link>
          </p>
        </div>
      </section>

      {/* Timer Bar */}
      <div className="bg-[#6b5233] text-white text-center py-4 px-4 text-[16px]">
        Order in the next <span className="font-bold">4 days</span> to get this limited time offer.
      </div>

      {/* Features Grid */}
      <section className="py-20 px-4 max-w-[1000px] mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {/* Feature 1 */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 mb-6 relative flex items-center justify-center text-[#ff7a00]">
              <Calendar className="w-16 h-16 stroke-[1]" />
              <span className="absolute text-[22px] font-normal mt-2">4</span>
            </div>
            <h3 className="text-[20px] font-bold text-[#333333] mb-3">Free shipping in 4 days</h3>
            <p className="text-[#555555] text-[16px] leading-relaxed mb-4">
              Get your holographic stickers fast with 4 day turnaround and free shipping.
            </p>
            <a href="#" className="text-[#0056b3] font-bold text-[15px] hover:underline">Get a delivery estimate</a>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 mb-6 relative flex items-center justify-center text-[#ff7a00]">
              <Smartphone className="w-16 h-16 stroke-[1]" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-[-2px]">
                <Check className="w-6 h-6 stroke-[2]" />
              </div>
            </div>
            <h3 className="text-[20px] font-bold text-[#333333] mb-3">Get an online proof</h3>
            <p className="text-[#555555] text-[16px] leading-relaxed mb-4">
              Review your proof shortly after checkout and request changes until you're happy.
            </p>
            <a href="#" className="text-[#0056b3] font-bold text-[15px] hover:underline">Watch our process</a>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 mb-6 flex items-center justify-center text-[#ff7a00]">
              <Sparkles className="w-16 h-16 stroke-[1]" />
            </div>
            <h3 className="text-[20px] font-bold text-[#333333] mb-3">Colorful & shiny</h3>
            <p className="text-[#555555] text-[16px] leading-relaxed mb-4">
              Durable holographic vinyl gives your stickers a unique rainbow sheen.
            </p>
            <a href="#" className="text-[#0056b3] font-bold text-[15px] hover:underline">See them in action</a>
          </div>
        </div>
      </section>

      {/* Video Feature Section */}
      <Feature 
        title="Flux capacitor not included"
        description="Use holographic effects to enhance existing designs. Upload your plain-color logo, drawing or photo and we'll create a custom holographic sticker that's cut to your specifications. Work with us directly to ensure your stickers look totally awesome."
      />

      {/* Reviews Section */}
      <section className="py-20 px-4 max-w-[1000px] mx-auto w-full">
        <h2 className="text-[32px] font-bold text-[#333333] mb-16 text-center md:text-left">Reviews for holographic stickers</h2>
        
        {/* Stats */}
        <div className="flex flex-col md:flex-row justify-between items-center text-center mb-20 gap-10 md:gap-0">
          <div className="flex flex-col items-center w-full md:w-1/3">
            <div className="text-[48px] md:text-[56px] font-bold text-[#333333] leading-none mb-3">4.8 / 5</div>
            <div className="flex text-[#ffc107] mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-current" />
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center w-full md:w-1/3">
            <div className="text-[48px] md:text-[56px] font-bold text-[#333333] leading-none mb-3">18,294</div>
            <div className="text-[#555555] text-[16px]">Total reviews</div>
          </div>
          <div className="flex flex-col items-center w-full md:w-1/3">
            <div className="text-[48px] md:text-[56px] font-bold text-[#333333] leading-none mb-3">95%</div>
            <div className="text-[#555555] text-[16px]">Would order again</div>
          </div>
        </div>

        {/* Review List */}
        <div className="space-y-12">
          {reviews.map((review) => (
            <div key={review.id} className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                {review.avatar.length <= 2 ? (
                  <div className="w-14 h-14 rounded-full bg-[#e9ecef] text-[#495057] flex items-center justify-center font-bold text-[20px]">
                    {review.avatar}
                  </div>
                ) : (
                  <img src={review.avatar} alt={review.name} className="w-14 h-14 rounded-full object-cover" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex text-[#ffc107]">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="font-bold text-[#333333] text-[16px]">{review.title}</span>
                </div>
                <div className="flex items-center gap-2 mb-3 text-[14px]">
                  <span className="font-bold text-[#333333]">{review.name}</span>
                  <span className="text-[#777777]">{review.time}</span>
                </div>
                <p className="text-[#555555] text-[16px] leading-relaxed">
                  {review.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <button className="bg-[#f8f9fa] hover:bg-[#e2e6ea] text-[#333333] font-bold py-3 px-8 rounded transition-colors text-[16px]">
            See all reviews
          </button>
        </div>
      </section>

      {/* Logos Section */}
      <Logos />
    </div>
  );
}
