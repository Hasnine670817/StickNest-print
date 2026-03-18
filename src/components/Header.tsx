import React, { useState } from 'react';
import { Search, ShoppingCart, ChevronDown, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';
import LogoutModal from './LogoutModal';
import SearchModal from './SearchModal';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const { isAuthenticated, user, logout, isLoading: isAuthLoading } = useAuth();
  const { cartCount, isCartLoading } = useCart();

  const isHeaderLoading = isAuthLoading || isCartLoading;

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const productCategories = [
    { name: 'Stickers', icon: 'https://i.ibb.co.com/CKJ76LNx/stickres.png', path: '/stickers' },
    { name: 'Labels', icon: 'https://i.ibb.co.com/PvbtDxXf/labels.png', path: '/labels' },
    { name: 'Magnets', icon: 'https://i.ibb.co.com/LhvTv3dv/magnets.png', path: '/magnets' },
    { name: 'Buttons', icon: 'https://i.ibb.co.com/JW7DWdJh/buttons.png', path: '/buttons' },
    { name: 'Packaging', icon: 'https://i.ibb.co.com/FkxSdt7B/packaging.png', path: '/packaging' },
    { name: 'Apparel', icon: 'https://i.ibb.co.com/wrjF6ynr/apparel.png', path: '/apparel' },
    { name: 'Acrylics', icon: 'https://i.ibb.co.com/4ndRCLBY/acrylics.png', path: '/acrylics' },
    { name: 'More products', icon: 'https://i.ibb.co.com/XrRXYqkj/more-products.png', path: '/more-products' },
  ];

  return (
    <div className="relative z-50">
      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
        onConfirm={() => {
          logout();
          setIsUserMenuOpen(false);
          setIsMobileMenuOpen(false);
          setIsLogoutModalOpen(false);
        }} 
      />
      <SearchModal 
        isOpen={isSearchModalOpen} 
        onClose={() => setIsSearchModalOpen(false)} 
      />
      {/* Navbar */}
      <nav className="bg-[#333333] text-white px-4 flex items-center justify-between text-[15px] font-bold relative z-50">
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center py-3">
            {/* Horse Logo Placeholder */}
            <img className="max-w-[40px] hover:opacity-80" src="https://i.ibb.co.com/MxqJdQgy/horse.png" alt="horse" />
          </Link>
          <div className="hidden lg:flex items-center space-x-6 h-full">
            {/* Products Dropdown */}
            <div 
              className="relative group h-full flex items-center" 
              onMouseEnter={() => setIsProductsOpen(true)} 
              onMouseLeave={() => setIsProductsOpen(false)}
            >
              <a href="#" className="flex items-center hover:text-gray-300 py-4">Products <ChevronDown className="w-4 h-4 ml-1" /></a>
              
              {/* Dropdown Menu */}
              <div className={`absolute top-[100%] left-0 w-[280px] bg-white rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.2)] text-gray-800 transition-all duration-200 z-50 ${isProductsOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                {/* Caret */}
                <div className="absolute -top-2 left-8 w-4 h-4 bg-white transform rotate-45 shadow-[-2px_-2px_4px_rgba(0,0,0,0.05)]"></div>
                
                <div className="py-2 relative bg-white rounded-lg z-10 px-2">
                  {productCategories.map((cat, idx) => (
                    <Link key={idx} to={cat.path} className="flex items-center rounded-lg px-5 py-2.5 hover:bg-[#F3F3F3] transition-colors" onClick={() => setIsProductsOpen(false)}>
                      <img src={cat.icon} alt={cat.name} className="w-10 h-10 mr-4 object-contain drop-shadow-sm rounded-md" />
                      <span className="text-[16px] font-normal text-[#333333]">{cat.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link to="/marketplace" className="hover:text-gray-300 py-4">Marketplace</Link>
            <Link to="/deals" className="hover:text-gray-300 py-4">Deals</Link>
          </div>
        </div>
        <div className="flex items-center space-x-4 lg:space-x-6">
          <button 
            onClick={() => setIsSearchModalOpen(true)}
            className="hover:text-gray-300 py-4"
          >
            <Search className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsCartDrawerOpen(true)}
            className="hover:text-gray-300 py-4 relative cursor-pointer"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && !isHeaderLoading && (
              <span className="absolute top-1 -right-2 bg-[#f37021] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {cartCount}
              </span>
            )}
          </button>
          {isHeaderLoading ? (
            <div className="w-8 h-8 rounded-full bg-gray-600 animate-pulse"></div>
          ) : isAuthenticated ? (
            <div 
              className="relative group h-full flex items-center"
              onMouseEnter={() => setIsUserMenuOpen(true)}
              onMouseLeave={() => setIsUserMenuOpen(false)}
            >
              <button className="flex items-center hover:text-gray-300 py-4 focus:outline-none">
                <div className="w-8 h-8 rounded-full bg-[#f37021] flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(user?.fullName || 'U')
                  )}
                </div>
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              
              {/* User Dropdown Menu */}
              <div className={`absolute top-[100%] right-0 w-[200px] bg-white rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.2)] text-gray-800 transition-all duration-200 z-50 ${isUserMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                {/* Caret */}
                <div className="absolute -top-2 right-4 w-4 h-4 bg-white transform rotate-45 shadow-[-2px_-2px_4px_rgba(0,0,0,0.05)]"></div>
                
                <div className="py-2 relative bg-white rounded-lg z-10">
                  <div className="px-5 py-3 border-b border-gray-100">
                    <p className="text-sm font-bold text-[#333333] truncate">{user?.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="flex items-center px-5 py-2.5 hover:bg-gray-50 transition-colors text-[#f37021] font-bold" onClick={() => setIsUserMenuOpen(false)}>
                      Admin Dashboard
                    </Link>
                  )}
                  <Link to="/dashboard" className="flex items-center px-5 py-2.5 hover:bg-gray-50 transition-colors text-[#333333] font-normal" onClick={() => setIsUserMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <Link to="/wishlist" className="flex items-center px-5 py-2.5 hover:bg-gray-50 transition-colors text-[#333333] font-normal" onClick={() => setIsUserMenuOpen(false)}>
                    My Wishlist
                  </Link>
                  <button 
                    onClick={() => { setIsLogoutModalOpen(true); setIsUserMenuOpen(false); }} 
                    className="w-full text-left flex items-center px-5 py-2.5 hover:bg-gray-50 transition-colors text-[#333333] font-normal"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="hidden lg:block hover:text-gray-300 py-4">Log in</Link>
              <Link to="/signup" className="hidden lg:block hover:text-gray-300 py-4">Sign up</Link>
            </>
          )}
          <button className="lg:hidden hover:text-gray-300 py-4" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartDrawerOpen} onClose={() => setIsCartDrawerOpen(false)} />

      {/* Mobile Menu */}
      <div className={`lg:hidden bg-[#333333] text-white absolute w-full z-40 transition-all duration-300 ease-in-out overflow-y-auto ${isMobileMenuOpen ? 'max-h-[calc(100vh-60px)] opacity-100 visible border-t border-white/10' : 'max-h-0 opacity-0 invisible'}`}>
        <div className="px-4 py-2 flex flex-col space-y-2 pb-6">
          <div className="py-2">
            <button className="flex items-center justify-between w-full font-bold" onClick={() => setIsProductsOpen(!isProductsOpen)}>
              Products <ChevronDown className={`w-4 h-4 transition-transform ${isProductsOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`mt-2 space-y-1 pl-4 transition-all duration-300 ${isProductsOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
              {productCategories.map((cat, idx) => (
                <Link key={idx} to={cat.path} className="flex items-center py-2 text-gray-300 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
                  <img src={cat.icon} alt={cat.name} className="w-6 h-6 mr-3 object-contain rounded" />
                  <span className="text-[15px]">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
          <Link to="/marketplace" className="py-2 font-bold hover:text-gray-300" onClick={() => setIsMobileMenuOpen(false)}>Marketplace</Link>
          <Link to="/deals" className="py-2 font-bold hover:text-gray-300" onClick={() => setIsMobileMenuOpen(false)}>Deals</Link>
          <div className="h-px bg-white/10 my-2"></div>
          {isHeaderLoading ? (
            <div className="h-10 bg-gray-600 animate-pulse rounded"></div>
          ) : isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 py-3 border-b border-white/5 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#f37021] flex items-center justify-center text-white font-bold overflow-hidden">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(user?.fullName || 'U')
                  )}
                </div>
                <div>
                  <p className="font-bold text-white">{user?.fullName}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
              </div>
              {user?.role === 'admin' && (
                <Link to="/admin" className="py-2 font-bold text-[#f37021]" onClick={() => setIsMobileMenuOpen(false)}>Admin Dashboard</Link>
              )}
              <Link to="/dashboard" className="py-2 font-bold hover:text-gray-300" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
              <button onClick={() => setIsLogoutModalOpen(true)} className="py-2 font-bold hover:text-gray-300 text-left">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="py-2 font-bold hover:text-gray-300" onClick={() => setIsMobileMenuOpen(false)}>Log in</Link>
              <Link to="/signup" className="py-2 font-bold hover:text-gray-300" onClick={() => setIsMobileMenuOpen(false)}>Sign up</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
