import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

export default function Returns() {
  const [orderNumber, setOrderNumber] = useState('');
  const [comments, setComments] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!orderNumber || !comments || !file) {
      setError('Please fill out all required fields and attach a photo.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload the file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `returns/${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('return-attachments')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Failed to upload photo: ${uploadError.message}`);
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('return-attachments')
        .getPublicUrl(filePath);

      // 2. Get the current user (if logged in)
      const { data: { user } } = await supabase.auth.getUser();

      // 3. Insert the record into the database
      const { error: dbError } = await supabase
        .from('returns')
        .insert([
          {
            user_id: user?.id || null,
            order_number: orderNumber,
            comments: comments,
            photo_url: publicUrl,
            status: 'pending'
          }
        ]);

      if (dbError) {
        throw new Error(`Failed to submit return request: ${dbError.message}`);
      }

      // Success
      setSuccess(true);
      setOrderNumber('');
      setComments('');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Error submitting return:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section */}
      <div className="bg-[#f37021] py-16 md:py-24 px-4 text-center relative overflow-hidden">
        {/* Decorative elements to mimic the image */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.4) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(255,255,255,0.4) 0%, transparent 20%)', backgroundSize: '100px 100px' }}></div>
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-[56px] font-bold text-white mb-4 tracking-tight leading-tight">
            Returns made easy
          </h1>
          <p className="text-white text-lg md:text-[22px] font-medium leading-snug">
            Have a problem with your order? Send us a photo and we'll<br className="hidden md:block" /> address it. Physical returns are not required.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-[750px] mx-auto px-4 py-12 md:py-16">
        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Request Submitted Successfully!</h2>
            <p className="text-[15px]">We've received your return request and will review it shortly. You don't need to send the physical item back.</p>
            <button 
              onClick={() => setSuccess(false)}
              className="mt-6 bg-[#f37021] hover:bg-[#d9641c] text-white font-bold py-2 px-6 rounded transition-colors"
            >
              Submit Another Request
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-[15px]">
                {error}
              </div>
            )}

            {/* Order Number */}
            <div>
              <label htmlFor="orderNumber" className="block text-[15px] font-bold text-[#333333] mb-2">
                Order number <span className="text-[14px] font-normal italic text-[#777777] ml-1">Required</span>
              </label>
              <input
                type="text"
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full border border-[#cccccc] rounded px-3 py-2.5 text-[15px] focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] transition-colors"
                required
              />
            </div>

            {/* Comments */}
            <div>
              <label htmlFor="comments" className="block text-[15px] font-bold text-[#333333] mb-2">
                Comments <span className="text-[14px] font-normal italic text-[#777777] ml-1">Required</span>
              </label>
              <textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Let us know about any problems with your order."
                className="w-full border border-[#cccccc] rounded px-3 py-3 text-[15px] min-h-[250px] resize-y focus:outline-none focus:border-[#0066cc] focus:ring-1 focus:ring-[#0066cc] transition-colors placeholder:text-[#999999]"
                required
              ></textarea>
            </div>

            {/* File Attachment */}
            <div>
              <label className="block text-[15px] font-bold text-[#333333] mb-2">
                File attachment <span className="text-[14px] font-normal italic text-[#777777] ml-1">Required</span>
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <input
                  type="file"
                  id="fileAttachment"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                  required
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-[#0066cc] hover:bg-[#0052a3] text-white font-bold py-2.5 px-6 rounded text-[15px] transition-colors whitespace-nowrap shadow-sm"
                >
                  Choose photo
                </button>
                <div className="border border-[#cccccc] rounded px-3 py-2.5 w-full sm:max-w-[400px] text-[15px] text-[#555555] bg-white truncate min-h-[42px] flex items-center shadow-sm">
                  {file ? file.name : 'No photo chosen'}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-[#f37021] hover:bg-[#d9641c] text-white font-bold py-3 px-8 rounded text-[16px] transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
