'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';

export default function UserProfile({ className = '' }: { className?: string }) {
  const { user, logout, loading } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-300 h-8 w-8 rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={logout}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="p-2 rounded-full bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-300 transition-all duration-300 group"
        aria-label="Logout"
      >
        <LogOut className="w-5 h-5" />
      </button>
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-3 z-50 animate-fadeIn">
          <div className="text-sm font-medium text-gray-200 mb-1">
            {user.name}
          </div>
          <div className="text-xs text-gray-400 mb-2">
            {user.email}
          </div>
          {user.username && (
            <div className="text-xs text-gray-500">
              @{user.username}
            </div>
          )}
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="text-xs text-red-400 font-medium">
              Click to logout
            </div>
          </div>
        </div>
      )}
    </div>
  );
}