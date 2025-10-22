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
  const { login } = useAuth();

  const handleLogin = () => {
    login(returnTo);
  };

  return (
    <button
      onClick={handleLogin}
      className={`px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors duration-300 font-oxanium font-semibold ${className}`}
      style={{ fontFamily: 'var(--font-oxanium)' }}
    >
      CAS Login
    </button>
  );
}