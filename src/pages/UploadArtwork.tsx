import React, { useState, useRef } from 'react';
import { Upload, X, Check, ArrowLeft, Image as ImageIcon, FileText, AlertCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function UploadArtwork() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { product, size, quantity, price } = location.state || {};
  
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = (selectedFile: File) => {
    setFile(selectedFile);
    setIsUploading(true);
    
    // Create preview
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(null);
    }

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
      }
    }, 200);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleContinue = () => {
    if (file && product && size && quantity && price) {
      // Use previewUrl (base64) if available, otherwise fallback to filename
      const artworkData = previewUrl || file.name;
      
      addToCart({
        name: product.name,
        image: product.image,
        size: size.name,
        quantity: quantity.amount,
        pricePerUnit: price / quantity.amount,
        totalPrice: price,
        artwork: artworkData
      });
      navigate('/cart');
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] py-12 px-4">
      <div className="max-w-[1000px] mx-auto">
        {/* Header / Breadcrumbs */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-[#0066cc] font-bold hover:underline"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <div className="flex items-center space-x-4 text-sm font-medium text-gray-500">
            <span className="text-[#333333]">1. Select product</span>
            <span className="text-gray-300">/</span>
            <span className="text-[#f37021] font-bold">2. Upload artwork</span>
            <span className="text-gray-300">/</span>
            <span>3. Review</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Upload Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h1 className="text-3xl font-bold text-[#333333] mb-2">Upload your artwork</h1>
              <p className="text-gray-600 mb-8">We accept any file format. If your file is not ready, you can skip this step and email it to us later.</p>

              {!file ? (
                <div 
                  className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isDragging ? 'border-[#f37021] bg-[#fff7f2]' : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                  }`}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                    <Upload className="w-10 h-10 text-[#f37021]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#333333] mb-2">Choose a file or drag it here</h3>
                  <p className="text-gray-500 text-center max-w-xs">
                    High resolution files (300 dpi or higher) work best.
                  </p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-4 shadow-sm overflow-hidden">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        file.type.startsWith('image/') ? <ImageIcon className="w-6 h-6 text-[#f37021]" /> : <FileText className="w-6 h-6 text-[#f37021]" />
                      )}
                    </div>
                      <div>
                        <h4 className="font-bold text-[#333333] truncate max-w-[200px] sm:max-w-md">{file.name}</h4>
                        <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setFile(null)}
                      className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {isUploading ? (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#f37021] h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  ) : (
                    <div className="flex items-center text-green-600 font-bold text-sm">
                      <Check className="w-4 h-4 mr-2" />
                      Ready to go
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8 flex items-start p-4 bg-blue-50 rounded-lg border border-blue-100">
                <AlertCircle className="w-5 h-5 text-blue-500 mr-3 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-800 leading-relaxed">
                  <strong>Not sure about your artwork?</strong> Don't worry, we'll review your file and send you a free online proof within 4 hours. You can request changes until you're happy.
                </p>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleContinue}
                  disabled={!file || isUploading}
                  className={`flex-1 py-4 rounded-lg font-bold text-lg transition-all ${
                    file && !isUploading 
                      ? 'bg-[#f37021] hover:bg-[#e0661e] text-white shadow-md' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-bold text-[#333333] mb-6">Order summary</h2>
              
              <div className="flex gap-4 mb-6">
                <img 
                  src={product?.image || "https://picsum.photos/seed/diecut/200/200"} 
                  alt={product?.name} 
                  className="w-20 h-20 rounded-lg object-cover border border-gray-100"
                />
                <div>
                  <h3 className="font-bold text-[#333333]">{product?.name || 'Custom Product'}</h3>
                  <p className="text-sm text-gray-500">{size?.name || '3" x 3"'}</p>
                  <p className="text-sm text-gray-500">{quantity?.amount || 50} units</p>
                </div>
              </div>

              <div className="space-y-3 border-t border-gray-100 pt-6 mb-6">
                <div className="flex justify-between text-[#333333]">
                  <span>Subtotal</span>
                  <span className="font-bold">${price?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-[#333333]">
                  <span>Shipping</span>
                  <span className="text-green-600 font-bold">FREE</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-bold text-[#333333]">Total</span>
                  <span className="text-2xl font-bold text-[#333333]">${price?.toFixed(2) || '0.00'}</span>
                </div>
                <p className="text-xs text-gray-500 text-right">Includes all taxes and fees</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
