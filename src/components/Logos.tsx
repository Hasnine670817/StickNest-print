import React from 'react';

export default function Logos() {
  return (
    <section className="py-12 md:py-16 px-4 bg-white">
      <div className="max-w-[1100px] mx-auto flex flex-wrap justify-center items-center gap-x-8 sm:gap-x-12 gap-y-8 sm:gap-y-10">
        {/* Logos approximated with text/colors */}
        <div className="flex items-center text-[#d50032] font-bold text-lg sm:text-xl tracking-tighter"><div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#d50032] mr-2"></div>lululemon</div>
        <div className="text-2xl sm:text-3xl font-black italic tracking-tighter text-black">NIKE</div>
        <div className="text-xl sm:text-2xl font-bold tracking-tighter"><span className="text-[#4285F4]">G</span><span className="text-[#EA4335]">o</span><span className="text-[#FBBC05]">o</span><span className="text-[#4285F4]">g</span><span className="text-[#34A853]">l</span><span className="text-[#EA4335]">e</span></div>
        <div className="flex items-center text-[#0061FF] font-bold text-xl sm:text-2xl tracking-tight"><div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#0061FF] mr-2 transform rotate-45"></div>Dropbox</div>
        <div className="text-2xl sm:text-3xl font-black text-[#E50914] tracking-tighter" style={{fontFamily: 'Arial Black, sans-serif'}}>NETFLIX</div>
        <div className="text-xl sm:text-2xl font-bold text-[#1877F2] tracking-tight">facebook</div>
        <div className="flex items-center text-[#737373] font-bold text-xl sm:text-2xl tracking-tight">
          <div className="grid grid-cols-2 gap-0.5 mr-2">
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#F25022]"></div><div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#7FBA00]"></div>
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#00A4EF]"></div><div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#FFB900]"></div>
          </div>
          Microsoft
        </div>
        <div className="text-xl sm:text-2xl font-bold text-black tracking-tight">GitHub</div>
      </div>
    </section>
  );
}
