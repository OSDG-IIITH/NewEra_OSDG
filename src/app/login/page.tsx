'use client';

import React, { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import LoginButton from '@/components/LoginButton';
import { useAuth } from '@/contexts/AuthContext';

// Separate component that uses useSearchParams
function LoginContent() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  useEffect(() => {
    // If user is already logged in, redirect to home
    if (user && !loading) {
      window.location.href = '/';
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const getErrorMessage = (errorType: string | null) => {
    switch (errorType) {
      case 'no-ticket':
        return 'No authentication ticket provided. Please try logging in again.';
      case 'validation-failed':
        return 'Authentication validation failed. Please try logging in again.';
      case 'auth-failed':
        return 'Authentication failed. Please try logging in again.';
      case 'cas-not-authorized':
        return 'This application is not yet authorized with IIIT CAS. Please contact the OSDG team or try again later.';
      default:
        return null;
    }
  };

  const errorMessage = getErrorMessage(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-blue-900/30 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            Login to OSDG
          </h2>
          <p className="text-gray-400">
            Use your IIIT Hyderabad credentials to access the portal
          </p>
        </div>
        
        {errorMessage && (
          <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-4">
            <p className="text-red-400 text-sm">{errorMessage}</p>
          </div>
        )}
        
        <div className="flex justify-center">
          <LoginButton className="w-full max-w-xs" />
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <p>
            By logging in, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense wrapper
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
