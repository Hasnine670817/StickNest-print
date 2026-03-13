import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Package, Calendar, Mail } from 'lucide-react';

export default function OrderSuccess() {
  const navigate = useNavigate();
  const orderNumber = Math.floor(Math.random() * 9000000) + 1000000;

  return (
    <div className="min-h-screen bg-white py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>
        
        <h1 className="text-[40px] font-bold text-[#333333] mb-4">Thank you for your order!</h1>
        <p className="text-[18px] text-gray-600 mb-12">
          Your order <span className="font-bold text-[#333333]">#{orderNumber}</span> has been placed successfully.
          We've sent a confirmation email to your inbox.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-[#f9f9f9] p-6 rounded-xl border border-gray-100">
            <Package className="w-8 h-8 text-[#f37021] mx-auto mb-4" />
            <h3 className="font-bold text-[#333333] mb-2">Proofing</h3>
            <p className="text-[14px] text-gray-500">We'll send you a digital proof within 4 hours.</p>
          </div>
          <div className="bg-[#f9f9f9] p-6 rounded-xl border border-gray-100">
            <Calendar className="w-8 h-8 text-[#f37021] mx-auto mb-4" />
            <h3 className="font-bold text-[#333333] mb-2">Production</h3>
            <p className="text-[14px] text-gray-500">Once approved, your order goes into production.</p>
          </div>
          <div className="bg-[#f9f9f9] p-6 rounded-xl border border-gray-100">
            <Mail className="w-8 h-8 text-[#f37021] mx-auto mb-4" />
            <h3 className="font-bold text-[#333333] mb-2">Shipping</h3>
            <p className="text-[14px] text-gray-500">You'll receive a tracking number when it ships.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto bg-[#333333] text-white px-8 py-4 rounded-lg font-bold hover:bg-black transition-colors"
          >
            Go to dashboard
          </button>
          <button 
            onClick={() => navigate('/')}
            className="w-full sm:w-auto border-2 border-[#333333] text-[#333333] px-8 py-4 rounded-lg font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            Continue shopping
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
