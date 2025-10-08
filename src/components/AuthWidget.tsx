'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginButton from './LoginButton';
import UserProfile from './UserProfile';

export default function AuthWidget({ className = '' }: { className?: string }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-300 h-8 w-32 rounded"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      {user ? (
        <UserProfile />
      ) : (
        <LoginButton />
      )}
    </div>
  );
}