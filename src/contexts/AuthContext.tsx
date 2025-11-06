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
      // First, check sessionStorage for cached user
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
      
      // No user found
      setUser(null);
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (returnTo: string = '/') => {
    console.log('[OSDG.in Auth] Login initiated');
    
    // Open authentication bridge in popup
    const bridgeUrl = `https://osdg.iiit.ac.in/api/auth/bridge?returnTo=osdg.in`;
    
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const popup = window.open(
      bridgeUrl,
      'CAS Login',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    );
    
    console.log('[OSDG.in Auth] Popup opened:', popup);
    
    // Method 1: Listen for postMessage from popup
    const handleMessage = (event: MessageEvent) => {
      console.log('[OSDG.in Auth] Message received via postMessage!');
      console.log('[OSDG.in Auth] Origin:', event.origin);
      console.log('[OSDG.in Auth] Data:', event.data);
      
      // Verify the origin for security - accept both http and https from osdg.iiit.ac.in
      if (event.origin !== 'https://osdg.iiit.ac.in' && event.origin !== 'http://osdg.iiit.ac.in') {
        console.warn('[OSDG.in Auth] Message rejected - invalid origin:', event.origin);
        return;
      }
      
      if (event.data.type === 'CAS_AUTH_SUCCESS') {
        console.log('[OSDG.in Auth] ✅ Authentication successful!');
        console.log('[OSDG.in Auth] User data:', event.data.user);
        
        // Set user data from the popup
        setUser(event.data.user);
        
        // Cache in sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('cas-user', JSON.stringify(event.data.user));
          console.log('[OSDG.in Auth] User cached in sessionStorage');
        }
        
        // Navigate to the return URL if needed
        if (returnTo && returnTo !== '/') {
          console.log('[OSDG.in Auth] Navigating to:', returnTo);
          window.location.href = returnTo;
        }
        
        // Clean up
        window.removeEventListener('message', handleMessage);
        if (popup && !popup.closed) {
          popup.close();
        }
        console.log('[OSDG.in Auth] Popup closed');
      } else if (event.data.type === 'CAS_AUTH_ERROR') {
        console.error('[OSDG.in Auth] ❌ Authentication error:', event.data.error);
        alert('Authentication failed. Please try again.');
        
        // Clean up
        window.removeEventListener('message', handleMessage);
        if (popup && !popup.closed) {
          popup.close();
        }
      }
    };
    
    console.log('[OSDG.in Auth] Adding message listener');
    window.addEventListener('message', handleMessage);
    
    // Method 2: Listen for BroadcastChannel (cross-origin fallback)
    try {
      const channel = new BroadcastChannel('cas_auth_channel');
      console.log('[OSDG.in Auth] BroadcastChannel listener added');
      
      channel.onmessage = (event) => {
        console.log('[OSDG.in Auth] Message received via BroadcastChannel!');
        console.log('[OSDG.in Auth] Data:', event.data);
        
        if (event.data.type === 'CAS_AUTH_SUCCESS') {
          console.log('[OSDG.in Auth] ✅ Authentication successful via BroadcastChannel!');
          
          setUser(event.data.user);
          sessionStorage.setItem('cas-user', JSON.stringify(event.data.user));
          
          channel.close();
          window.removeEventListener('message', handleMessage);
          if (popup && !popup.closed) {
            popup.close();
          }
        }
      };
    } catch (e) {
      console.warn('[OSDG.in Auth] BroadcastChannel not supported:', e);
    }
    
    // Fallback: if popup is blocked, redirect to bridge URL in the same window
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      console.warn('[OSDG.in Auth] Popup blocked! Redirecting in same window...');
      window.removeEventListener('message', handleMessage);
      window.location.href = bridgeUrl;
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