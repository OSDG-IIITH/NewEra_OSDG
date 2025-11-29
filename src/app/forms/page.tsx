// Forms Page - Main entry point for Vetal Forms Connector
// /forms

'use client';

import React from 'react';
import VetalFormsConnector from '@/components/VetalFormsConnector';
import { useAuth } from '@/contexts/AuthContext';

export default function FormsPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Vetal Forms
          </h1>
          <p className="text-gray-600 mb-6">
            Create forms through conversation with Vetal AI. Please log in to continue.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 8rem)' }}>
          <VetalFormsConnector />
        </div>
      </div>
    </div>
  );
}
