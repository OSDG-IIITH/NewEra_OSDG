'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface CASMaintenanceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CASMaintenanceModal({ isOpen, onClose }: CASMaintenanceModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-cyan-500 rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                    aria-label="Close"
                >
                    <X size={24} />
                </button>

                <div className="text-center">
                    <div className="mb-4">
                        <div className="inline-block p-3 bg-cyan-500/10 rounded-full">
                            <svg
                                className="w-12 h-12 text-cyan-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-4 font-oxanium">
                        CAS Login Temporarily Unavailable
                    </h2>

                    <p className="text-gray-300 text-lg mb-6 font-space-mono">
                        We are working with the college to get CAS login back. Please standby.
                    </p>

                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors duration-300 font-oxanium font-semibold"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
}
