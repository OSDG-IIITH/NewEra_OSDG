'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function UserProfile({ className = '' }: { className?: string }) {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-300 h-8 w-32 rounded"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <div className="text-right">
        <div className="text-sm font-medium text-gray-200">
          {user.name}
        </div>
        {user.rollno && (
          <div className="text-xs text-gray-400">
            {user.rollno}
          </div>
        )}
      </div>
      <button
        onClick={logout}
        className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors duration-300"
      >
        Logout
      </button>
    </div>
  );
}