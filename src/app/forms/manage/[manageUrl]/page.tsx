// Form Management Page - Owner's view with responses and analytics
// /forms/manage/[manageUrl]

'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface FormData {
  id: string;
  title: string;
  slug: string;
  description?: string;
  live: boolean;
  opens?: string;
  closes?: string;
  anonymous: boolean;
  max_responses?: number;
  individual_limit: number;
  editable_responses: boolean;
  created_at: string;
  modified: string;
  shareUrl: string;
  manageUrl: string;
}

interface Response {
  id: string;
  status: string;
  answers: Record<string, any>;
  submitted_at?: string;
  created_at: string;
}

interface Analytics {
  total_responses: number;
  submitted_responses: number;
  draft_responses: number;
  last_response_at?: string;
}

export default function FormManagePage() {
  const params = useParams();
  const manageUrl = params.manageUrl as string;
  const { user, loading: authLoading } = useAuth();
  
  const [form, setForm] = useState<FormData | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      fetchFormData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manageUrl, user, authLoading]);

  const fetchFormData = async () => {
    try {
      const response = await fetch(`/api/forms/manage/${manageUrl}`, {
        headers: {
          'x-user-email': user?.email || '',
          'x-user-name': user?.name || '',
          'x-user-handle': user?.username || '',
        },
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load form');
      }

      setForm(data.form);
      setResponses(data.responses);
      setAnalytics(data.analytics);
    } catch (err: any) {
      setError(err.message || 'Failed to load form');
    } finally {
      setLoading(false);
    }
  };

  const toggleLive = async () => {
    if (!form) return;
    
    setUpdateLoading(true);
    try {
      const response = await fetch(`/api/forms/manage/${manageUrl}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || '',
          'x-user-name': user?.name || '',
          'x-user-handle': user?.username || '',
        },
        body: JSON.stringify({
          live: !form.live,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update form');
      }

      setForm(prev => prev ? { ...prev, live: !prev.live } : null);
    } catch (err: any) {
      alert(err.message || 'Failed to update form');
    } finally {
      setUpdateLoading(false);
    }
  };

  const deleteForm = async () => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/forms/manage/${manageUrl}`, {
        method: 'DELETE',
        headers: {
          'x-user-email': user?.email || '',
          'x-user-name': user?.name || '',
          'x-user-handle': user?.username || '',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete form');
      }

      alert('Form deleted successfully');
      window.location.href = '/forms';
    } catch (err: any) {
      alert(err.message || 'Failed to delete form');
    }
  };

  if (authLoading || loading) {
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
        <div className="max-w-md p-8 bg-white rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 mb-6">
            Please log in to manage this form.
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

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error || 'Form not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {form.title}
              </h1>
              {form.description && (
                <p className="text-gray-600 mb-4">{form.description}</p>
              )}
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  form.live 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {form.live ? '🟢 Live' : '⚫ Draft'}
                </span>
                <span className="text-sm text-gray-500">
                  Created: {new Date(form.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={toggleLive}
                disabled={updateLoading}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  form.live
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    : 'bg-green-600 text-white hover:bg-green-700'
                } disabled:opacity-50`}
              >
                {form.live ? 'Unpublish' : 'Publish'}
              </button>
              <button
                onClick={deleteForm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Share Links */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Share Links</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Public Form:</span>
                <a
                  href={form.shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:underline break-all"
                >
                  {form.shareUrl}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Total Responses</h3>
              <p className="text-3xl font-bold text-gray-800">{analytics.total_responses}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Submitted</h3>
              <p className="text-3xl font-bold text-green-600">{analytics.submitted_responses}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-500 text-sm font-medium mb-2">Drafts</h3>
              <p className="text-3xl font-bold text-yellow-600">{analytics.draft_responses}</p>
            </div>
          </div>
        )}

        {/* Responses */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Responses</h2>
          
          {responses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No responses yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Submitted At</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Answers</th>
                  </tr>
                </thead>
                <tbody>
                  {responses.map((response) => (
                    <tr key={response.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {response.submitted_at
                          ? new Date(response.submitted_at).toLocaleString()
                          : 'Not submitted'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          response.status === 'submitted'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {response.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <details>
                          <summary className="cursor-pointer text-blue-600 hover:underline">
                            View answers
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto">
                            {JSON.stringify(response.answers, null, 2)}
                          </pre>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
