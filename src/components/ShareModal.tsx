import React, { useState } from "react";
import { X, Copy, Check, Link as LinkIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    title: string;
    author_name: string;
    image_url: string;
  };
  shareUrl: string;
}

export default function ShareModal({ isOpen, onClose, product, shareUrl }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-10"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Share item</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              {/* Product Preview */}
              <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4 mb-6 border border-gray-100">
                <div className="w-16 h-16 bg-white rounded-lg border border-gray-100 overflow-hidden shrink-0">
                  <img src={product.image_url} alt={product.title} className="w-full h-full object-contain p-2" />
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-gray-900 truncate">{product.title}</h3>
                  <p className="text-sm text-gray-500 truncate">Die cut stickers</p>
                  <p className="text-xs text-gray-400 mt-1">by <span className="text-[#0066cc] font-medium">{product.author_name}</span></p>
                </div>
              </div>

              {/* Link Input */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <LinkIcon className="w-4 h-4 text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    readOnly 
                    value={shareUrl}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 outline-none focus:ring-2 focus:ring-[#ff7a00]/20"
                  />
                </div>
                <button 
                  onClick={handleCopy}
                  className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg whitespace-nowrap ${
                    copied 
                    ? "bg-green-600 text-white shadow-green-100" 
                    : "bg-[#0066cc] text-white hover:bg-[#0052a3] shadow-blue-100"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Social Share (Optional) */}
            <div className="px-6 pb-8 flex justify-center gap-6">
              {/* You can add social icons here if needed */}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
