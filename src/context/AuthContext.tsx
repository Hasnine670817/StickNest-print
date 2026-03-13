import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  fullName: string;
  profileImage?: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileData) {
            const userData: User = {
              id: session.user.id,
              email: session.user.email || '',
              fullName: profileData.full_name || session.user.user_metadata?.full_name || 'User',
              profileImage: profileData.profile_image || '',
              role: profileData.role,
            };
            setUser(userData);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(userData));
          }
        } else {
          // Fallback to local storage if no session (e.g., dummy admin)
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
          }
        }
      } catch (err) {
        console.error('Error checking auth session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('user');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = (userData: User) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateProfile = (updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const newUser = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
