import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, X } from 'lucide-react';

export default function About() {
  const [activeTab, setActiveTab] = useState('about');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      {/* Hero Section */}
      <div 
        className="relative bg-[#f37021] py-16 md:py-24 flex flex-col items-center justify-center overflow-hidden"
        style={{
          backgroundImage: 'url("/about-hero.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Fallback overlay if image is missing or to ensure text readability */}
        <div className="absolute inset-0 bg-[#f37021]/20"></div>
        
        <div className="relative z-10 text-center px-4">
          <h1 className="text-3xl md:text-[56px] font-bold text-white mb-6 md:mb-10 tracking-tight">
            Hello, we're Stick Nest.
          </h1>
          <button 
            onClick={() => setIsVideoModalOpen(true)}
            className="w-12 h-12 md:w-[72px] md:h-[72px] rounded-full border-[2px] md:border-[3px] border-white flex items-center justify-center mx-auto hover:bg-white/10 transition-colors group"
          >
            <Play className="w-5 h-5 md:w-8 md:h-8 text-white ml-1 group-hover:scale-110 transition-transform" fill="currentColor" />
          </button>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
            <button 
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            {/* 
              To change the video later, simply replace the src URL below with your own video URL.
            */}
            <video 
              className="w-full h-full object-cover"
              src="https://www.w3schools.com/html/mov_bbb.mp4" 
              controls 
              autoPlay 
            />
          </div>
        </div>
      )}

      {/* Sub-navigation */}
      <div className="bg-[#f4f4f4] border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 flex justify-center space-x-6 md:space-x-10">
          <button 
            onClick={() => setActiveTab('about')} 
            className={`py-3 md:py-4 text-sm md:text-[15px] font-bold ${activeTab === 'about' ? 'text-[#333333] border-b-[3px] border-[#f37021]' : 'text-[#555555] hover:text-[#333333] border-b-[3px] border-transparent'}`}
          >
            About
          </button>
          <button 
            onClick={() => setActiveTab('careers')} 
            className={`py-3 md:py-4 text-sm md:text-[15px] font-bold ${activeTab === 'careers' ? 'text-[#333333] border-b-[3px] border-[#f37021]' : 'text-[#555555] hover:text-[#333333] border-b-[3px] border-transparent'}`}
          >
            Careers
          </button>
          <button 
            onClick={() => setActiveTab('press')} 
            className={`py-3 md:py-4 text-sm md:text-[15px] font-bold ${activeTab === 'press' ? 'text-[#333333] border-b-[3px] border-[#f37021]' : 'text-[#555555] hover:text-[#333333] border-b-[3px] border-transparent'}`}
          >
            Press
          </button>
        </div>
      </div>

      {activeTab === 'about' && (
        <>
          {/* Section 1: Aim */}
      <div className="max-w-[1100px] mx-auto px-4 py-10 md:py-12 xl:py-28">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10 xl:gap-24">
          <div className="w-full md:w-1/2">
            <img src="/about-laptop.png" alt="Custom products" className="w-full h-auto object-contain" />
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="text-2xl md:text-3xl xl:text-[32px] font-bold text-[#333333] mb-4 md:mb-6 leading-[1.2]">
              We aim to build an incredible experience for ordering custom products.
            </h2>
            <p className="text-[#555555] text-sm md:text-[15px] leading-[1.6]">
              Wasting time sucks. That's why we relentlessly focus on making it fast and easy to order custom products. Order in seconds and get your products in days. Free proofs, free artwork help, free shipping and fast turnaround are why people love us.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Remote Team */}
      <div className="max-w-[1100px] mx-auto px-4 py-10 md:py-12 xl:py-28">
        <div className="flex flex-col-reverse md:flex-row items-center gap-8 md:gap-24">
          <div className="w-full md:w-[45%]">
            <h2 className="text-2xl md:text-3xl xl:text-[32px] font-bold text-[#333333] mb-4 md:mb-6 leading-[1.2]">
              We are powered by a remote team across 17 countries.
            </h2>
            <p className="text-[#555555] text-sm md:text-[15px] leading-[1.6]">
              Our team comes from diverse backgrounds and 17 countries, but we're all united by a shared set of values. We happily work from the United States, Argentina, Bosnia & Herzegovina, Brazil, Canada, Croatia, Finland, France, Germany, Guatemala, India, Italy, Poland, Slovakia, Spain, Sweden, and the UK.
            </p>
          </div>
          <div className="w-full md:w-[55%]">
            <img src="/about-map.png" alt="Global team map" className="w-full h-auto object-contain" />
          </div>
        </div>
      </div>

      {/* Section 3: Ship Worldwide */}
      <div className="max-w-[1100px] mx-auto px-4 py-10 md:py-12 xl:py-28">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10 xl:gap-24">
          <div className="w-full md:w-1/2">
            <img src="/about-logos.png" alt="Customer logos" className="w-full h-auto object-contain" />
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="text-2xl md:text-3xl xl:text-[32px] font-bold text-[#333333] mb-4 md:mb-6 leading-[1.2]">
              We ship to awesome customers worldwide.
            </h2>
            <p className="text-[#555555] text-sm md:text-[15px] leading-[1.6]">
              Each year we ship worldwide to thousands of customers in 70+ countries. Along with available free worldwide shipping, we support 16 unique languages and 7 currencies (ARS, AUD, CAD, EUR, GBP, MXN, and USD).
            </p>
          </div>
        </div>
      </div>
        </>
      )}

      {activeTab === 'careers' && (
        <div className="max-w-[1100px] mx-auto px-4 py-16 md:py-32 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#333333] mb-3 md:mb-4">Careers</h2>
          <p className="text-[#555555] text-base md:text-lg">This section will be implemented later.</p>
        </div>
      )}

      {activeTab === 'press' && (
        <div className="max-w-[1100px] mx-auto px-4 py-16 md:py-32 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#333333] mb-3 md:mb-4">Press</h2>
          <p className="text-[#555555] text-base md:text-lg">This section will be implemented later.</p>
        </div>
      )}

      {/* Section 4: Work with us (Hidden for now) */}
      {/*
      <div className="max-w-[700px] mx-auto px-4 py-16 md:py-28 text-center">
        <h2 className="text-3xl md:text-[32px] font-bold text-[#333333] mb-6">
          Work with us
        </h2>
        <p className="text-[#555555] text-[15px] leading-[1.6] mb-8">
          We're united by a desire to do great work while maintaining a stress-free work environment that's designed to attract like-minded people who share our culture.
        </p>
        <Link 
          to="/careers" 
          className="inline-block bg-[#0066cc] text-white font-bold py-3 px-8 rounded hover:bg-[#0052a3] transition-colors text-[15px]"
        >
          See our current openings
        </Link>
      </div>
      */}
    </div>
  );
}
