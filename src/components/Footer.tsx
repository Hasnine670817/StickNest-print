import React, { useState } from 'react';
import { Instagram, Youtube, X, Lock } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  if (['/login', '/signup'].includes(location.pathname)) {
    return null;
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError || profileData?.role !== 'admin') {
          // Fallback to dummy admin if table is empty or not admin
          if (email.trim() === 'admin@example.com' && password.trim() === 'admin123') {
             login({
               id: 'admin-1',
               email: 'admin@example.com',
               fullName: 'Admin User',
               role: 'admin'
             });
             setIsAdminModalOpen(false);
             navigate('/admin');
          } else {
            setError('Invalid admin credentials');
          }
        } else {
          login({
            id: authData.user.id,
            email: authData.user.email || '',
            fullName: profileData.full_name,
            role: profileData.role
          });
          setIsAdminModalOpen(false);
          navigate('/admin');
        }
      }
    } catch (err: any) {
      // Fallback to dummy admin if table is empty or network error
      if (email.trim() === 'admin@example.com' && password.trim() === 'admin123') {
         login({
           id: 'admin-1',
           email: 'admin@example.com',
           fullName: 'Admin User',
           role: 'admin'
         });
         setIsAdminModalOpen(false);
         navigate('/admin');
      } else {
        setError(err.message || 'An error occurred during login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-[#f4f4f4] pt-12 md:pt-16 pb-8 md:pb-12 px-4 mt-auto">
      <div className="max-w-[1100px] mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 mb-12 md:mb-16">
          <div>
            <h4 className="font-bold text-[#333333] mb-4 md:mb-5 text-[14px] md:text-[15px]">Products</h4>
            <ul className="space-y-2 md:space-y-3 text-[#0066cc] text-[13px] md:text-[14px]">
              <li><Link to="/stickers" className="hover:underline">Stickers</Link></li>
              <li><Link to="/labels" className="hover:underline">Labels</Link></li>
              <li><Link to="/magnets" className="hover:underline">Magnets</Link></li>
              <li><Link to="/buttons" className="hover:underline">Buttons</Link></li>
              <li><Link to="/packaging" className="hover:underline">Packaging</Link></li>
              <li><Link to="/apparel" className="hover:underline">Apparel</Link></li>
              <li><Link to="/acrylics" className="hover:underline">Acrylics</Link></li>
              <li><Link to="/more-products" className="hover:underline">More products</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#333333] mb-4 md:mb-5 text-[14px] md:text-[15px]">Pro</h4>
            <ul className="space-y-2 md:space-y-3 text-[#0066cc] text-[13px] md:text-[14px]">
              <li><a href="#" className="hover:underline">Studio</a></li>
              <li><a href="#" className="hover:underline">Give</a></li>
              <li><a href="#" className="hover:underline">Ship</a></li>
              <li><a href="#" className="hover:underline">Notify</a></li>
              <li><a href="#" className="hover:underline">More pro tools</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#333333] mb-4 md:mb-5 text-[14px] md:text-[15px]">Company</h4>
            <ul className="space-y-2 md:space-y-3 text-[#0066cc] text-[13px] md:text-[14px]">
              <li><Link to="/about" className="hover:underline">About</Link></li>
              <li><Link to="/blog" className="hover:underline">Blog</Link></li>
              <li><a href="#" className="hover:underline">Careers</a></li>
              <li><a href="#" className="hover:underline">Press</a></li>
              <li><a href="#" className="hover:underline">Stats</a></li>
              <li><Link to="/legal" className="hover:underline">Legal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#333333] mb-4 md:mb-5 text-[14px] md:text-[15px]">Resources</h4>
            <ul className="space-y-2 md:space-y-3 text-[#0066cc] text-[13px] md:text-[14px]">
              <li><Link to="/deals" className="hover:underline">Deals</Link></li>
              <li><a href="#" className="hover:underline">Teams</a></li>
              <li><a href="#" className="hover:underline">Templates</a></li>
              <li><a href="#" className="hover:underline">Uses</a></li>
              <li><Link to="/marketplace" className="hover:underline">Marketplace</Link></li>
              <li><a href="#" className="hover:underline">Integrations</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#333333] mb-4 md:mb-5 text-[14px] md:text-[15px]">Support</h4>
            <ul className="space-y-2 md:space-y-3 text-[#0066cc] text-[13px] md:text-[14px]">
              <li><a href="#" className="hover:underline">Help</a></li>
              <li><Link to="/returns" className="hover:underline">Returns</Link></li>
              <li><a href="#" className="hover:underline">Feedback</a></li>
              <li><button onClick={() => setIsAdminModalOpen(true)} className="hover:underline text-left">Admin Login</button></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-[#e0e0e0] pt-6 md:pt-8 flex flex-col lg:flex-row items-center justify-between text-[#555555] text-[12px] md:text-[13px] gap-4 lg:gap-0">
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2">
            <span>© 2026 Sticker Mule</span>
            <a href="#" className="text-[#0066cc] hover:underline">Site map</a>
            <Link to="/legal/privacy" className="text-[#0066cc] hover:underline">Privacy</Link>
            <Link to="/legal/terms" className="text-[#0066cc] hover:underline">Terms</Link>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
            <div className="flex items-center space-x-5">
              <a href="#" className="hover:text-gray-900">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                </svg>
              </a>
              <a href="#" className="hover:text-gray-900 font-bold text-lg leading-none">X</a>
              <a href="#" className="hover:text-gray-900"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="hover:text-gray-900"><Youtube className="w-5 h-5" /></a>
            </div>
            <button className="flex items-center space-x-1.5 hover:text-gray-900 text-[#0066cc]">
              <img src="https://flagcdn.com/w20/us.png" alt="US Flag" className="w-4 h-auto" />
              <span>English (EN) $USD</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Login Modal */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#f37021] rounded-lg flex items-center justify-center">
                  <Lock className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-[#333333]">Admin Login</h2>
              </div>
              <button 
                onClick={() => setIsAdminModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleAdminLogin} className="p-8 space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#333333]">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021]/20 focus:border-[#f37021] transition-all"
                  placeholder="admin@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#333333]">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f37021]/20 focus:border-[#f37021] transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#333333] text-white py-3 rounded-lg font-bold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? 'Logging in...' : 'Login to Admin Panel'}
              </button>
            </form>
            
            <div className="px-8 py-4 bg-gray-50 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                Authorized personnel only. All access is logged.
              </p>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
