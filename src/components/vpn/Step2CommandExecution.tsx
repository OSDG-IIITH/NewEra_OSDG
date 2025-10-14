'use client';

import { useEffect, useState } from 'react';
import { useVPNWizard } from '@/contexts/VPNWizardContext';
import { Copy, Check, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { generateVPNCommand } from '@/utils/vpnCommands';

interface Step2CommandExecutionProps {
  onError?: () => void;
}

export default function Step2CommandExecution({ onError }: Step2CommandExecutionProps) {
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
      setIsLoading(true);
      try {
        const data = generateVPNCommand({ os: osInfo.name, osVersion: osInfo.version, architecture: osInfo.architecture });
        setCommandData(data as any);
      } catch (err) {
        console.error('Error generating command:', err);
        setErrorText('Failed to generate command. Please try manual installation.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [osInfo, commandData, setCommandData, setErrorText, setIsLoading]);

  const handleCopy = async () => {
    if (commandData) {
      try {
        // Try modern clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(commandData.command);
        } else {
          // Fallback for non-secure contexts (IP addresses)
          const textArea = document.createElement('textarea');
          textArea.value = commandData.command;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
        // Still show copied feedback even if it fails
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleSuccess = () => {
    setCurrentStep(3);
  };

  const handleError = () => {
    // Trigger WISP bot to open with VPN troubleshooting context
    if (onError) {
      onError();
    }
  };

  // Check if this is a mobile platform (iOS/iPadOS/Android)
  const isMobilePlatform = commandData?.platform && ['iOS', 'iPadOS', 'Android'].includes(commandData.platform);

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
      <div className="bg-black border border-red-500/30 p-6 rounded-md">
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
              <h4 className="text-yellow-400 font-mono text-sm">Root access required</h4>
              <p className="text-gray-400 text-sm mt-1 font-mono">
                Run with administrator/sudo privileges
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Command display with copy-only button */}
      {!isMobilePlatform ? (
        <div className="bg-[#1e1e1e] border border-gray-700 rounded-lg overflow-hidden shadow-2xl">
          <div className="p-4">
            <div className="relative">
              <pre className="m-0 pr-12 overflow-x-auto">
                <code className="text-green-400 font-mono text-sm whitespace-pre-wrap break-all leading-relaxed">
                  {commandData.command}
                </code>
              </pre>

              {/* prominent copy button (icon-only) */}
              <button
                onClick={handleCopy}
                title={copied ? 'Copied' : 'Copy command'}
                aria-label={copied ? 'Copied' : 'Copy command'}
                className="absolute top-[-0.4rem] right-2 z-10 bg-[#1e1e1e] border border-gray-600 hover:border-gray-500 text-gray-400 hover:text-gray-300 p-2 rounded-md shadow-sm"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Mobile platform - show download button */
        <div className="bg-black border border-blue-500/30 p-6 rounded-lg text-center space-y-4">
          <p className="text-gray-300 font-mono text-sm">Download your VPN configuration file</p>
          <a
            href={commandData.command}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-mono py-3 px-8 rounded-md transition-all duration-300"
          >
            Download .ovpn file
          </a>
          <p className="text-gray-500 text-xs font-mono">(requires IIIT login)</p>
        </div>
      )}

      {/* Collapsible Instructions */}
      <div className="bg-black border border-blue-500/30 rounded-md">
        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-500/5 transition-colors rounded-md"
        >
          <span className="text-white font-mono text-sm">Instruction</span>
          {showInstructions ? (
            <ChevronUp className="w-5 h-5 text-blue-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-blue-400" />
          )}
        </button>
        
          {showInstructions && (
          <div className="px-4 py-4 border-t border-blue-500/30 rounded-b-md">
            <div className="prose prose-invert prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-gray-400 text-sm font-mono">
                {commandData.instructions}
              </pre>
            </div>
            
            {commandData.notes && (
              <div className="mt-4 border border-blue-500/30 p-3 rounded-md">
                {isMobilePlatform ? (
                  <a 
                    href={commandData.notes.replace('App Store: ', '').replace('Play Store: ', '')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 text-sm font-mono hover:text-blue-300 transition-colors"
                  >
                    <strong>Download OpenVPN app →</strong>
                  </a>
                ) : (
                  <p className="text-blue-400 text-sm font-mono">
                    <strong>note:</strong> {commandData.notes}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>


      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={handleSuccess}
          className="flex-1 bg-black border border-green-500/50 hover:border-green-400 text-green-400 hover:text-green-300 font-mono py-3 px-6 transition-all duration-300 flex items-center justify-center space-x-2 rounded-md"
        >
          <Check className="w-5 h-5" />
          <span>Success</span>
        </button>
        
        <button
          onClick={handleError}
          className="flex-1 bg-black border border-red-500/50 hover:border-red-400 text-red-400 hover:text-red-300 font-mono py-3 px-6 transition-all duration-300 flex items-center justify-center space-x-2 rounded-md"
        >
          <AlertCircle className="w-5 h-5" />
          <span>Error</span>
        </button>
      </div>
    </div>
  );
}