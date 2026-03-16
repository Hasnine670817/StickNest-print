import React, { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const productCategories = [
    { name: 'Stickers', icon: 'https://i.ibb.co.com/CKJ76LNx/stickres.png', path: '/stickers', keywords: ['sticker', 'custom stickers', 'vinyl'] },
    { name: 'Labels', icon: 'https://i.ibb.co.com/PvbtDxXf/labels.png', path: '/labels', keywords: ['label', 'product labels', 'packaging'] },
    { name: 'Magnets', icon: 'https://i.ibb.co.com/LhvTv3dv/magnets.png', path: '/magnets', keywords: ['magnet', 'fridge magnet', 'car magnet'] },
    { name: 'Buttons', icon: 'https://i.ibb.co.com/JW7DWdJh/buttons.png', path: '/buttons', keywords: ['button', 'pin', 'badge'] },
    { name: 'Packaging', icon: 'https://i.ibb.co.com/FkxSdt7B/packaging.png', path: '/packaging', keywords: ['packaging', 'box', 'tape', 'mailer'] },
    { name: 'Apparel', icon: 'https://i.ibb.co.com/wrjF6ynr/apparel.png', path: '/apparel', keywords: ['t-shirt', 'shirt', 'clothing', 'apparel'] },
    { name: 'Acrylics', icon: 'https://i.ibb.co.com/4ndRCLBY/acrylics.png', path: '/acrylics', keywords: ['acrylic', 'keychain', 'charm', 'standee'] },
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setSearchTerm('');
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSuggestions([]);
      return;
    }

    const filtered = productCategories.filter(cat => 
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setSuggestions(filtered);
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-4 sm:pt-20 px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="p-3 sm:p-4 border-b border-gray-100 flex items-center gap-3 sm:gap-4">
          <SearchIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for products..."
            className="flex-1 bg-transparent border-none outline-none text-base sm:text-lg text-gray-800 placeholder:text-gray-400 py-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'Enter' && suggestions.length > 0) {
                navigate(suggestions[0].path);
                onClose();
              }
            }}
          />
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {searchTerm.trim() === '' ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">Popular searches</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Stickers', 'Labels', 'Magnets', 'Packaging'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSearchTerm(tag)}
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-full text-sm font-medium text-gray-700 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group text-left"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <img src={item.icon} alt={item.name} className="w-10 h-10 object-contain" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-500">{item.keywords.join(', ')}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-[#f37021] group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-900 font-bold mb-1">No results found for "{searchTerm}"</p>
              <p className="text-gray-500 text-sm">Try searching for something else or browse our categories.</p>
            </div>
          )}
        </div>

        <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[10px] sm:text-[11px] text-gray-400 font-medium uppercase tracking-wider">
          <div className="hidden sm:flex gap-4">
            <span className="flex items-center gap-1"><kbd className="bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-sm text-gray-600">ENTER</kbd> to select</span>
            <span className="flex items-center gap-1"><kbd className="bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-sm text-gray-600">ESC</kbd> to close</span>
          </div>
          <span className="w-full sm:w-auto text-center sm:text-right">Search powered by Supabase</span>
        </div>
      </div>
    </div>
  );
}
