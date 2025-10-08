'use client';

import { useEffect, useState } from 'react';
import { useVPNWizard } from '@/contexts/VPNWizardContext';
import { Copy, Check, Terminal, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function Step2CommandExecution() {
  const {
    osInfo,
    commandData,
    setCommandData,
    isLoading,
    setIsLoading,
    setCurrentStep,
    setErrorText,
  } = useVPNWizard();

  const [copied, setCopied] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    if (osInfo && !commandData) {
      generateCommand();
    }
  }, [osInfo, commandData]);

  const generateCommand = async () => {
    if (!osInfo) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/vpn/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-command',
          os: osInfo.name,
          osVersion: osInfo.version,
          architecture: osInfo.architecture,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate command');

      const data = await response.json();
      setCommandData(data);
    } catch (error) {
      console.error('Error generating command:', error);
      setErrorText('Failed to generate command. Please try manual installation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (commandData) {
      navigator.clipboard.writeText(commandData.command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSuccess = () => {
    setCurrentStep(3);
  };

  const handleError = () => {
    // This will be handled in the main wizard component
    // which will show the error troubleshooting chat
    const errorModal = document.getElementById('error-troubleshooting');
    if (errorModal) {
      errorModal.classList.remove('hidden');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400"></div>
        <p className="text-gray-400 font-mono text-sm">generating command...</p>
      </div>
    );
  }

  if (!commandData) {
    return (
      <div className="bg-black border border-red-500/30 p-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-red-400" />
          <div>
            <h3 className="text-white font-mono text-sm">command generation failed</h3>
            <p className="text-gray-400 text-sm mt-1 font-mono">
              refresh or use manual installation
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      {/* Admin Warning */}
      {commandData.requiresAdmin && (
        <div className="bg-black border border-yellow-500/30 p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <h4 className="text-yellow-400 font-mono text-sm">root access required</h4>
              <p className="text-gray-400 text-sm mt-1 font-mono">
                run with administrator/sudo privileges
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Terminal Shell Window - Like macOS Terminal */}
      <div className="bg-[#1e1e1e] border border-gray-700 rounded-lg overflow-hidden shadow-2xl">
        {/* Terminal Header with Traffic Lights */}
        <div className="bg-[#2d2d2d] px-4 py-3 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            </div>
            <span className="text-gray-400 text-xs font-mono ml-4">terminal</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-2 bg-transparent border border-gray-600 hover:border-gray-500 text-gray-400 hover:text-gray-300 text-xs px-3 py-1 font-mono transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                <span>copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>copy</span>
              </>
            )}
          </button>
        </div>
        
        {/* Terminal Body */}
        <div className="bg-black p-6 overflow-x-auto">
          <code className="text-green-400 font-mono text-sm whitespace-pre-wrap break-all leading-relaxed">
            {commandData.command}
          </code>
        </div>
      </div>

      {/* Collapsible Instructions */}
      <div className="bg-black border border-blue-500/30">
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-500/5 transition-colors"
        >
          <span className="text-white font-mono text-sm">instructions</span>
          {showInstructions ? (
            <ChevronUp className="w-5 h-5 text-blue-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-blue-400" />
          )}
        </button>
        
        {showInstructions && (
          <div className="px-4 py-4 border-t border-blue-500/30">
            <div className="prose prose-invert prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-gray-400 text-sm font-mono">
                {commandData.instructions}
              </pre>
            </div>
            
            {commandData.notes && (
              <div className="mt-4 border border-blue-500/30 p-3">
                <p className="text-blue-400 text-sm font-mono">
                  <strong>note:</strong> {commandData.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expected Output */}
      <div className="bg-black border border-blue-500/30 p-4">
        <h4 className="text-white font-mono text-sm mb-2">expected output</h4>
        <p className="text-green-400 text-sm font-mono bg-black border border-green-500/20 p-3">
          {commandData.expectedOutput}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={handleSuccess}
          className="flex-1 bg-black border border-green-500/50 hover:border-green-400 text-green-400 hover:text-green-300 font-mono py-3 px-6 transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <Check className="w-5 h-5" />
          <span>success</span>
        </button>
        
        <button
          onClick={handleError}
          className="flex-1 bg-black border border-red-500/50 hover:border-red-400 text-red-400 hover:text-red-300 font-mono py-3 px-6 transition-all duration-300 flex items-center justify-center space-x-2"
        >
          <AlertCircle className="w-5 h-5" />
          <span>error</span>
        </button>
      </div>
    </div>
  );
}