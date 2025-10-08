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
            <div className="relative border border-green-500 p-6">
              <CheckCircle2 className="w-16 h-16 text-green-400" />
            </div>
          </div>
        </div>
        
        <h2 className="text-3xl font-mono text-white">
          setup_complete
        </h2>
        <p className="text-lg text-gray-400 font-mono">
          vpn ready to use
        </p>
      </div>

      {/* Connection Instructions */}
      <div className="bg-black border border-blue-500/30 p-6">
        <div className="flex items-start space-x-3 mb-4">
          <div>
            <h3 className="text-sm font-mono text-white mb-3">
              &gt; connection_steps
            </h3>
            <ol className="space-y-3 text-gray-400 font-mono text-sm">
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">1.</span>
                <span>locate openvpn icon in system tray</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">2.</span>
                <span>right-click icon</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">3.</span>
                <span>select &quot;connect&quot;</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">4.</span>
                <span>enter iiit-h credentials</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">5.</span>
                <span>icon turns <span className="text-green-400">green</span> when connected</span>
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-black border border-yellow-500/30 p-5">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div className="space-y-2">
            <h4 className="text-yellow-400 font-mono text-sm">important</h4>
            <ul className="space-y-2 text-gray-400 text-sm font-mono">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>vpn works outside campus only</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>disconnect: right-click &gt; disconnect</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>access internal resources when connected</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* What You Can Access */}
      <div className="bg-black border border-green-500/30 p-5">
        <h4 className="text-green-400 font-mono text-sm mb-3">accessible_resources</h4>
        <ul className="space-y-2 text-gray-400 text-sm font-mono">
          <li className="flex items-start">
            <span className="text-green-400 mr-2">✓</span>
            <span>internal portals</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-400 mr-2">✓</span>
            <span>library resources</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-400 mr-2">✓</span>
            <span>lab servers</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-400 mr-2">✓</span>
            <span>network storage</span>
          </li>
        </ul>
      </div>

      {/* Close Button */}
      <div className="text-center">
        <button
          onClick={() => window.location.reload()}
          className="bg-black border border-blue-500/50 hover:border-blue-400 text-blue-400 hover:text-blue-300 font-mono py-3 px-8 transition-all duration-300"
        >
          close
        </button>
      </div>
    </div>
  );
}