import React from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Hero() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <section className="bg-[#f37021] text-white px-4 sm:px-8 py-12 md:py-20 overflow-hidden">
      <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row items-center">
        <div className="md:w-[55%] z-10 md:pr-8 text-center md:text-left">
          <h1 className="text-[40px] sm:text-[48px] md:text-[40px] font-bold mb-4 leading-[1.1] tracking-tight">Buy and sell<br className="hidden sm:block"/> custom products</h1>
          <p className="text-[18px] sm:text-[20px] md:text-lg mb-8 font-medium">Free worldwide shipping. Fast turnaround. 24/7 support.</p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-6 justify-center md:justify-start">
            <button 
              onClick={() => navigate('/marketplace')}
              className="bg-[#0066cc] hover:bg-[#005bb5] text-white px-8 py-3.5 md:px-7 lg:px-8 md:py-2.5 lg:py-3.5 rounded text-lg md:text-base lg:text-lg font-bold transition-colors w-full sm:w-auto"
            >
              Shop now
            </button>
            <button 
              onClick={() => navigate('/marketplace')}
              className="bg-[#cc5a1b] hover:bg-[#b85118] text-white px-8 py-3.5 md:px-7 lg:px-8 md:py-2.5 lg:py-3.5 rounded text-lg md:text-base lg:text-lg font-bold transition-colors w-full sm:w-auto"
            >
              Start selling
            </button>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start text-[14px] sm:text-[15px] md:text-xs lg:text-[15px] font-medium space-y-2 sm:space-y-0">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-[#ffc107] fill-current mr-1.5" />
              <span>4.7 from <a href="#" className="underline hover:text-gray-200">350,314 reviews</a></span>
            </div>
            <span className="hidden sm:inline mx-3">•</span>
            <span>Trusted by <a href="#" className="underline hover:text-gray-200">28,527 sellers</a></span>
          </div>
        </div>
        <div className="md:w-[45%] mt-12 md:mt-0 relative w-full max-w-md mx-auto md:max-w-none">
          {/* Collage Placeholder */}
          <img src="https://images.unsplash.com/photo-1572375992501-4b0892d50c69?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Stickers Collage" className="w-full h-auto object-cover rounded-xl transform md:rotate-2 shadow-2xl mix-blend-luminosity opacity-80 hover:mix-blend-normal hover:opacity-100 transition-all duration-500" style={{ filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.2))' }} />
        </div>
      </div>
    </section>
  );
}
