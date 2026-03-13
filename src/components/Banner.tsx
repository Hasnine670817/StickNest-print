import React from 'react';
import { Gift, Target, Store, Image as ImageIcon } from 'lucide-react';

export default function Banner() {
  return (
    <section className="pb-16 md:pb-20 px-4 bg-white">
      <div className="max-w-[1000px] mx-auto bg-[#f4f4f4] rounded-xl p-6 md:p-8 lg:px-10 lg:py-8 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-6 md:gap-4 lg:gap-0">
        <div className="flex flex-col lg:flex-row items-center md:items-start lg:items-center w-full md:w-auto">
          <div className="flex -space-x-3 lg:mr-8 mb-4 md:mb-3 lg:mb-0">
            <div className="w-12 h-12 rounded-full bg-[#0066cc] flex items-center justify-center text-white border-2 border-[#f4f4f4] z-40 shadow-sm"><Gift className="w-6 h-6" /></div>
            <div className="w-12 h-12 rounded-full bg-[#6633cc] flex items-center justify-center text-white border-2 border-[#f4f4f4] z-30 shadow-sm"><Target className="w-6 h-6" /></div>
            <div className="w-12 h-12 rounded-full bg-[#f37021] flex items-center justify-center text-white border-2 border-[#f4f4f4] z-20 shadow-sm"><Store className="w-6 h-6" /></div>
            <div className="w-12 h-12 rounded-full bg-[#00cc66] flex items-center justify-center text-white border-2 border-[#f4f4f4] z-10 shadow-sm"><ImageIcon className="w-6 h-6" /></div>
          </div>
          <div className="md:text-left">
            <h3 className="text-[20px] sm:text-[22px] font-bold text-[#333333] flex flex-wrap justify-center md:justify-start items-center mb-1 gap-2">
              Sell, publish, and get paid with <span className="bg-[#777777] text-white text-[11px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">PRO</span>
            </h3>
            <p className="text-[#555555] text-[14px] sm:text-[15px]">Everything you need to run your business for just $9/mo.</p>
          </div>
        </div>
        <button className="bg-[#0066cc] hover:bg-[#005bb5] text-white px-8 py-3.5 rounded text-[15px] font-bold whitespace-nowrap transition-colors w-full sm:w-auto shrink-0 md:mt-0 mt-2">Upgrade to Pro</button>
      </div>
    </section>
  );
}
