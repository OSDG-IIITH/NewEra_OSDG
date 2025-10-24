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
    console.log('[Auth] Login initiated, returnTo:', returnTo);
    
    // Build the CAS login URL directly with localhost callback
    const serviceUrl = `http://localhost:3000/api/auth/cas/callback?returnTo=${encodeURIComponent(returnTo)}`;
    const casLoginUrl = `https://login.iiit.ac.in/cas/login?service=${encodeURIComponent(serviceUrl)}`;
    
    console.log('[Auth] CAS login URL:', casLoginUrl);
    
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    console.log('[Auth] Opening popup window');
    
    // Open CAS login in a popup window
    const popup = window.open(
      casLoginUrl,
      'CAS Login',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );
    
    if (!popup) {
      console.error('[Auth] Popup was blocked!');
      alert('Popup was blocked. Please allow popups for this site and try again.');
      return;
    }
    
    console.log('[Auth] Popup opened successfully');
    console.log('[Auth] Setting up message listener');
    
    // Listen for messages from the popup
    const handleMessage = (event: MessageEvent) => {
      console.log('[Auth] Received message:', event);
      console.log('[Auth] Message origin:', event.origin);
      console.log('[Auth] Message data:', event.data);
      
      // Accept messages from osdg.in (where the callback page actually runs)
      // Also accept from localhost for local development
      const allowedOrigins = ['https://osdg.in', 'http://localhost:3000'];
      
      if (!allowedOrigins.some(origin => event.origin === origin)) {
        console.warn('[Auth] Rejected message from origin:', event.origin);
        return;
      }
      
      if (event.data.type === 'CAS_AUTH_SUCCESS') {
        console.log('[Auth] ✅ CAS authentication successful!');
        console.log('[Auth] User data received:', event.data.user);
        
        // Set user data from the popup
        setUser(event.data.user);
        
        // Cache in sessionStorage
        if (typeof window !== 'undefined') {
          console.log('[Auth] Caching user in sessionStorage');
          sessionStorage.setItem('cas-user', JSON.stringify(event.data.user));
        }
        
        console.log('[Auth] User logged in successfully');
        console.log('[Auth] Current user state will update on next render');
        
        // Clean up listener
        window.removeEventListener('message', handleMessage);
        console.log('[Auth] Message listener removed');
        
        // Close popup if still open
        if (popup && !popup.closed) {
          console.log('[Auth] Closing popup');
          popup.close();
        }
        
        // Navigate or reload
        if (event.data.returnTo && event.data.returnTo !== '/') {
          console.log('[Auth] Redirecting to:', event.data.returnTo);
          window.location.href = event.data.returnTo;
        } else {
          console.log('[Auth] Reloading page to update UI');
          window.location.reload();
        }
      } else if (event.data.type === 'CAS_AUTH_ERROR') {
        console.error('[Auth] ❌ CAS authentication error:', event.data.error);
        alert('Authentication failed: ' + event.data.error + '. Please try again.');
        
        // Clean up
        window.removeEventListener('message', handleMessage);
        if (popup && !popup.closed) {
          popup.close();
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    console.log('[Auth] Message listener added');
    
    // Monitor popup status
    const checkPopup = setInterval(() => {
      if (popup.closed) {
        console.log('[Auth] Popup was closed by user');
        clearInterval(checkPopup);
        window.removeEventListener('message', handleMessage);
      }
    }, 500);
    
    // Clear interval after 5 minutes
    setTimeout(() => {
      clearInterval(checkPopup);
      console.log('[Auth] Popup monitoring stopped');
    }, 300000);
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