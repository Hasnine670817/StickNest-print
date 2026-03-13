import React from 'react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Are you sure you want to logout?</h2>
        <p className="text-gray-500 mb-8">You will be logged out of your account.</p>
        <div className="flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
