'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginButton({ 
  className = '', 
  returnTo = '/' 
}: { 
  className?: string;
  returnTo?: string;
}) {
  const { login, loading } = useAuth();

  const handleLogin = () => {
    login(returnTo);
  };

  return (
    <button
      onClick={handleLogin}
      disabled={loading}
      className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? 'Loading...' : 'CAS Login'}
    </button>
  );
}