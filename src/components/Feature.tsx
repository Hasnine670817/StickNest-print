import React, { useState } from 'react';
import { Play } from 'lucide-react';

interface FeatureProps {
  title?: string;
  description?: string;
  videoSrc?: string;
  imageSrc?: string;
}

export default function Feature({ 
  title = "Free shipping, free online proofs, fast turnaround.", 
  description = "Sticker Mule is the easiest way to buy custom stickers & decals, labels, and other printing online. Order in 60 seconds and we'll turn your designs and illustrations into custom stickers, magnets, buttons, labels and packaging in days. We offer free online proofs, free worldwide shipping and super fast turnaround.",
  videoSrc = "https://www.w3schools.com/html/mov_bbb.mp4",
  imageSrc = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
}: FeatureProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-16 md:py-24 px-4 bg-white">
      <div className="max-w-[1000px] mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
        <div className="md:w-1/2 relative w-full">
          {isPlaying ? (
            <div className="w-full h-[250px] sm:h-[300px] rounded-lg shadow-md overflow-hidden bg-black flex items-center justify-center">
              <video 
                src={videoSrc} 
                className="w-full h-full object-cover"
                controls 
                autoPlay 
              />
            </div>
          ) : (
            <>
              <img src={imageSrc} alt="Feature Video" className="w-full rounded-lg shadow-md object-cover h-[250px] sm:h-[300px]" />
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
          <h2 className="text-[28px] sm:text-[32px] font-bold mb-4 sm:mb-6 text-[#333333] leading-tight">{title}</h2>
          <p className="text-[#555555] text-[15px] sm:text-[16px] leading-[1.6]">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
