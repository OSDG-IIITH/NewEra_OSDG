'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  username: string;
  name: string;
  email: string;
  rollno?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (returnTo?: string) => void;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      // First, check if we have CAS auth data in URL params (from production redirect)
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const casAuth = urlParams.get('casAuth');
        const username = urlParams.get('username');
        const email = urlParams.get('email');
        
        if (casAuth === 'true' && username && email) {
          // Set user from URL params
          setUser({
            username,
            name: username, // We can extract name from email or use username
            email,
          });
          
          // Clean up URL params
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
          setLoading(false);
          return;
        }
      }
      
      // Otherwise, fetch from API
      const response = await fetch('/api/auth/user');
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (returnTo: string = '/') => {
    window.location.href = `/api/auth/cas/login?returnTo=${encodeURIComponent(returnTo)}`;
  };

  const logout = async () => {
    try {
      // Clear localStorage to reset homepage animation on next visit after logout
      if (typeof window !== 'undefined') {
        localStorage.removeItem('homepage-animation-seen');
        sessionStorage.removeItem('homepage-animation-played'); // Clean up old key too
      }
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success && data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        // Fallback: redirect to home page
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: redirect to home page
      window.location.href = '/';
    }
  };

  const refreshUser = () => {
    setLoading(true);
    fetchUser();
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;