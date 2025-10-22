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
      // First, check sessionStorage for cached user data
      if (typeof window !== 'undefined') {
        const cachedUser = sessionStorage.getItem('cas-user');
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
          setLoading(false);
          return;
        }
      }
      
      // Check if we have CAS auth data in URL params (fallback method)
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const casAuth = urlParams.get('casAuth');
        const username = urlParams.get('username');
        const email = urlParams.get('email');
        
        if (casAuth === 'true' && username && email) {
          // Set user from URL params
          const userData = {
            username,
            name: username,
            email,
          };
          setUser(userData);
          
          // Cache in sessionStorage
          sessionStorage.setItem('cas-user', JSON.stringify(userData));
          
          // Clean up URL params
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
          setLoading(false);
          return;
        }
      }
      
      // Otherwise, fetch from API (for local development)
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
    // Open CAS login in a popup window for production
    const casLoginUrl = `/api/auth/cas/login?returnTo=${encodeURIComponent(returnTo)}`;
    
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const popup = window.open(
      casLoginUrl,
      'CAS Login',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );
    
    // Listen for messages from the popup
    const handleMessage = (event: MessageEvent) => {
      // Verify the origin for security
      if (event.origin !== 'http://localhost:3000') {
        return;
      }
      
      if (event.data.type === 'CAS_AUTH_SUCCESS') {
        // Set user data from the popup
        setUser(event.data.user);
        
        // Cache in sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('cas-user', JSON.stringify(event.data.user));
        }
        
        // Navigate to the return URL if needed
        if (event.data.returnTo && event.data.returnTo !== '/') {
          window.location.href = event.data.returnTo;
        }
        
        // Clean up
        window.removeEventListener('message', handleMessage);
        if (popup && !popup.closed) {
          popup.close();
        }
      } else if (event.data.type === 'CAS_AUTH_ERROR') {
        console.error('CAS authentication error:', event.data.error);
        alert('Authentication failed. Please try again.');
        
        // Clean up
        window.removeEventListener('message', handleMessage);
        if (popup && !popup.closed) {
          popup.close();
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    // Fallback: if popup is blocked, redirect to CAS login in the same window
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      window.removeEventListener('message', handleMessage);
      window.location.href = casLoginUrl;
    }
  };

  const logout = async () => {
    try {
      // Clear all auth-related storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('homepage-animation-seen');
        sessionStorage.removeItem('homepage-animation-played'); // Clean up old key too
        sessionStorage.removeItem('cas-user'); // Clear CAS user data
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