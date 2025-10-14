'use client';

import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function Step3Success() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto p-6">
      {/* Celebration Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-ping bg-green-500/20 opacity-20"></div>
            <div className="relative border border-green-500 p-6 rounded-md">
              <CheckCircle2 className="w-16 h-16 text-green-400" />
            </div>
          </div>
        </div>
        
        <h2 className="text-3xl font-mono text-white">
          Setup Complete
        </h2>
        <p className="text-lg text-gray-400 font-mono">
          VPN ready to use
        </p>
      </div>

      {/* Connection Instructions */}
  <div className="bg-black border border-blue-500/30 p-6 rounded-md">
        <div className="flex items-start space-x-3 mb-4">
          <div>
            <h3 className="text-sm font-mono text-white mb-3">
              &gt; Connection Steps
            </h3>
            <ol className="space-y-3 text-gray-400 font-mono text-sm">
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">1.</span>
                <span>Locate OpenVPN icon in system tray</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">2.</span>
                <span>Click icon</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">3.</span>
                <span>Select &quot;Connect&quot;</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">4.</span>
                <span>Enter IIIT-H credentials (not LDAP)</span>
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Important Notes */}
  <div className="bg-black border border-yellow-500/30 p-5 rounded-md">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div className="space-y-2">
            <h4 className="text-yellow-400 font-mono text-sm">Important</h4>
            <ul className="space-y-2 text-gray-400 text-sm font-mono">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>VPN works outside campus only</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Disconnect: Click OpenVPN in systems tray &gt; Disconnect</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Close Button */}
      <div className="text-center">
        <button
          onClick={() => window.location.reload()}
          className="bg-black border border-blue-500/50 hover:border-blue-400 text-blue-400 hover:text-blue-300 font-mono py-3 px-8 transition-all duration-300 rounded-md"
        >
          close
        </button>
      </div>
    </div>
  );
}