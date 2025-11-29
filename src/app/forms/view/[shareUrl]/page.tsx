// Form View Page - Public form viewing and response submission
// /forms/view/[shareUrl]

'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface FormQuestion {
  id: string;
  type: string;
  label: string;
  description?: string;
  required: boolean;
  options?: string[];
}

interface FormSection {
  id: string;
  title: string;
  description?: string;
  questions: FormQuestion[];
}

interface Form {
  id: string;
  title: string;
  description?: string;
  structure: {
    sections: FormSection[];
  };
  anonymous: boolean;
  editable_responses: boolean;
}

export default function FormViewPage() {
  const params = useParams();
  const shareUrl = params.shareUrl as string;
  
  const [form, setForm] = useState<Form | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const fetchForm = async () => {
    try {
      const response = await fetch(`/api/forms/view/${shareUrl}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load form');
      }

      setForm(data.form);
    } catch (err: any) {
      setError(err.message || 'Failed to load form');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareUrl]);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Validate required fields
      if (form) {
        for (const section of form.structure.sections) {
          for (const question of section.questions) {
            if (question.required && !answers[question.id]) {
              throw new Error(`Please answer: ${question.label}`);
            }
          }
        }
      }

      const response = await fetch('/api/forms/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shareUrl,
          answers,
          anonymous: form?.anonymous,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit response');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md p-8 bg-white rounded-lg shadow-lg text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-600 mb-4">
            Response Submitted!
          </h1>
          <p className="text-gray-600">
            Thank you for your response.
          </p>
        </div>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Form Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {form.title}
            </h1>
            {form.description && (
              <p className="text-gray-600">{form.description}</p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {form.structure.sections.map((section) => (
              <div key={section.id} className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {section.title}
                </h2>
                {section.description && (
                  <p className="text-gray-600 mb-4">{section.description}</p>
                )}

                <div className="space-y-6">
                  {section.questions.map((question) => (
                    <div key={question.id}>
                      <label className="block text-gray-700 font-medium mb-2">
                        {question.label}
                        {question.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      
                      {question.description && (
                        <p className="text-sm text-gray-500 mb-2">
                          {question.description}
                        </p>
                      )}

                      {/* Render input based on type */}
                      {question.type === 'text' || question.type === 'email' || question.type === 'number' ? (
                        <input
                          type={question.type}
                          value={answers[question.id] || ''}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required={question.required}
                        />
                      ) : question.type === 'textarea' ? (
                        <textarea
                          value={answers[question.id] || ''}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          rows={4}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required={question.required}
                        />
                      ) : question.type === 'radio' && question.options ? (
                        <div className="space-y-2">
                          {question.options.map((option, idx) => (
                            <label key={idx} className="flex items-center">
                              <input
                                type="radio"
                                name={question.id}
                                value={option}
                                checked={answers[question.id] === option}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                className="mr-2"
                                required={question.required}
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      ) : question.type === 'checkbox' && question.options ? (
                        <div className="space-y-2">
                          {question.options.map((option, idx) => (
                            <label key={idx} className="flex items-center">
                              <input
                                type="checkbox"
                                value={option}
                                checked={(answers[question.id] || []).includes(option)}
                                onChange={(e) => {
                                  const current = answers[question.id] || [];
                                  const newValue = e.target.checked
                                    ? [...current, option]
                                    : current.filter((v: string) => v !== option);
                                  handleAnswerChange(question.id, newValue);
                                }}
                                className="mr-2"
                              />
                              {option}
                            </label>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              {submitting ? 'Submitting...' : 'Submit Response'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
