import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Signup() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create or update profile (upsert prevents duplicate key errors if a trigger already created it)
        const { error: profileError } = await supabase.from('profiles').upsert([{
          id: authData.user.id,
          email: email,
          full_name: fullName,
          role: 'user'
        }]);

        if (profileError) throw profileError;

        login({
          id: authData.user.id,
          email: email,
          fullName: fullName,
          role: 'user',
        });
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#f37021] flex flex-col relative min-h-[calc(100vh-60px)]">
      <div className="flex-1 flex items-center justify-center p-4 my-8">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-[420px] p-8 md:p-10 z-10">
          <button className="w-full border border-gray-300 rounded py-2.5 flex items-center justify-center hover:bg-gray-50 transition-colors mb-6">
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="font-bold text-gray-700 text-[15px]">Sign up with Google</span>
          </button>

          <div className="flex items-center mb-6">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-gray-500 text-sm">or</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm font-medium">{error}</div>}

          <form onSubmit={handleSignup}>
            <div className="mb-4">
              <label className="block text-[14px] font-bold text-gray-800 mb-1.5">Name</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="Name"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-[14px] font-bold text-gray-800 mb-1.5">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="Email"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-[14px] font-bold text-gray-800 mb-1.5">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors pr-10"
                  placeholder="Password (6 characters minimum)"
                  required
                  minLength={6}
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <a href="#" className="text-gray-500 text-[13px] font-bold underline hover:text-gray-700">Add referral code</a>
            </div>

            <div className="mb-6 text-[12px] text-gray-600 leading-relaxed">
              By signing up, you agree to Sticker Mule's <br/>
              <a href="#" className="text-[#0066cc] hover:underline">privacy policy</a> and <a href="#" className="text-[#0066cc] hover:underline">terms</a>
            </div>

            <button 
              type="submit"
              className="w-full bg-[#e56a17] hover:bg-[#d45f15] text-white py-3 rounded font-bold text-[16px] transition-colors mb-6"
            >
              Sign up
            </button>

            <div className="text-center text-[14px] text-gray-600">
              or <Link to="/login" className="text-[#0066cc] font-bold hover:underline">log in</Link>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}
