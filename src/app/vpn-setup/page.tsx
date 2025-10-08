'use client';

import { VPNWizardProvider, useVPNWizard } from '@/contexts/VPNWizardContext';
import StepTracker from '@/components/vpn/StepTracker';
import Step1Authentication from '@/components/vpn/Step1Authentication';
import Step2CommandExecution from '@/components/vpn/Step2CommandExecution';
import Step3Success from '@/components/vpn/Step3Success';
import ErrorTroubleshootingChat from '@/components/vpn/ErrorTroubleshootingChat';
import { Terminal } from 'lucide-react';

function VPNSetupContent() {
  const { currentStep, hasStarted, setHasStarted } = useVPNWizard();

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-3xl mx-auto text-center space-y-8 px-4">
          <div className="inline-flex items-center space-x-2 border border-blue-500/30 px-4 py-2">
            <Terminal className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-mono">vpn-setup</span>
          </div>

          <h1 className="text-6xl font-bold text-white tracking-tight">
            IIIT-H VPN Setup
          </h1>

          <p className="text-gray-400 text-lg font-mono">
            Automated configuration for IIIT Hyderabad network access
          </p>

          <button
            onClick={() => setHasStarted(true)}
            className="mt-8 bg-black border border-blue-500/50 hover:border-blue-400 text-blue-400 hover:text-blue-300 font-mono py-3 px-8 transition-all duration-300"
          >
            &gt; start setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-mono text-white mb-2">
              vpn-setup-wizard
            </h2>
            <p className="text-gray-400 font-mono text-sm">
              automated iiit-h network configuration
            </p>
          </div>

          {/* Step Tracker */}
          <div className="mb-8">
            <StepTracker />
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {currentStep === 1 && <Step1Authentication />}
            {currentStep === 2 && <Step2CommandExecution />}
            {currentStep === 3 && <Step3Success />}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-blue-500/30">
            <div className="flex items-center justify-between text-sm text-gray-400 font-mono">
              <div>
                support:{' '}
                <a
                  href="mailto:osdg@students.iiit.ac.in"
                  className="text-blue-400 hover:text-blue-300"
                >
                  osdg@students.iiit.ac.in
                </a>
              </div>
              <div>
                step {currentStep}/3
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Troubleshooting Modal */}
      <ErrorTroubleshootingChat />
    </div>
  );
}

export default function VPNSetupPage() {
  return (
    <VPNWizardProvider>
      <VPNSetupContent />
    </VPNWizardProvider>
  );
}