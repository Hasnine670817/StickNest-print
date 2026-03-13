import React from 'react';
import { Link } from 'react-router-dom';

export default function Categories() {
  return (
    <section className="bg-[#f4f4f4] pt-12 pb-16">
      <div className="max-w-[1100px] mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:flex-wrap justify-center gap-x-8 lg:gap-x-0 gap-y-8">
          {[
            { name: 'Stickers', icon: 'https://i.ibb.co.com/CKJ76LNx/stickres.png', path: '/stickers' },
            { name: 'Labels', icon: 'https://i.ibb.co.com/PvbtDxXf/labels.png', path: '/labels' },
            { name: 'Magnets', icon: 'https://i.ibb.co.com/LhvTv3dv/magnets.png', path: '/magnets' },
            { name: 'Buttons', icon: 'https://i.ibb.co.com/JW7DWdJh/buttons.png', path: '/buttons' },
            { name: 'Packaging', icon: 'https://i.ibb.co.com/FkxSdt7B/packaging.png', path: '/packaging' },
            { name: 'Apparel', icon: 'https://i.ibb.co.com/wrjF6ynr/apparel.png', path: '/apparel' },
            { name: 'Acrylics', icon: 'https://i.ibb.co.com/4ndRCLBY/acrylics.png', path: '/acrylics' },
            { name: 'More Products', icon: 'https://i.ibb.co.com/4ndRCLBY/acrylics.png', path: '/more-products' },
          ].map((cat) => (
            <Link key={cat.name} to={cat.path} className="flex flex-col items-center cursor-pointer group py-6 px-6 rounded-md hover:bg-[#E8E8E8] transition-all duration-300">
              <div className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] bg-tranaparent mb-3 sm:mb-4 overflow-hidden border-2 border-transparent transition-all duration-200 transform group-hover:-translate-y-1">
                <img src={cat.icon} alt={cat.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-[14px] sm:text-[15px] font-medium text-[#333333]">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
