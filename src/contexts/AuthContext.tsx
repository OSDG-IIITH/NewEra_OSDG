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
      console.log('[Auth] === FETCH USER STARTED ===');
      
      // First check URL params for CAS auth return
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const casAuth = urlParams.get('casAuth');
        const username = urlParams.get('username');
        const name = urlParams.get('name');
        const email = urlParams.get('email');
        
        console.log('[Auth] URL Params check:', { casAuth, username, name, email });
        
        if (casAuth === 'success' && username) {
          console.log('[Auth] ✅ CAS authentication found in URL!');
          
          const userData = {
            username,
            name: name || username,
            email: email || `${username}@students.iiit.ac.in`,
          };
          
          console.log('[Auth] Setting user from URL params:', userData);
          setUser(userData);
          
          // Cache in sessionStorage
          sessionStorage.setItem('cas-user', JSON.stringify(userData));
          console.log('[Auth] User cached in sessionStorage');
          
          // Clean up URL params
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
          console.log('[Auth] URL cleaned');
          
          setLoading(false);
          return;
        }
        
        // Check for error params
        const error = urlParams.get('error');
        if (error) {
          console.error('[Auth] ❌ Authentication error in URL:', error);
          alert(`Authentication failed: ${error}. Please try again.`);
          
          // Clean up URL
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
          setLoading(false);
          return;
        }
      }
      
      // Check sessionStorage for cached user
      if (typeof window !== 'undefined') {
        const cachedUser = sessionStorage.getItem('cas-user');
        if (cachedUser) {
          console.log('[Auth] Found cached user in sessionStorage');
          const userData = JSON.parse(cachedUser);
          console.log('[Auth] Cached user:', userData);
          setUser(userData);
          setLoading(false);
          return;
        }
      }
      
      console.log('[Auth] No user found, user is logged out');
      setUser(null);
    } catch (error) {
      console.error('[Auth] Error fetching user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (returnTo: string = '/') => {
    console.log('=== AUTH: LOGIN STARTED ===');
    console.log('[Auth] ReturnTo:', returnTo);
    
    // Do a full page redirect to CAS login (no popup)
    const loginUrl = `/api/auth/cas/login?returnTo=${encodeURIComponent(returnTo)}`;
    
    console.log('[Auth] Redirecting to:', loginUrl);
    
    // Full page redirect
    window.location.href = loginUrl;
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