'use client';

import { VPNWizardProvider, useVPNWizard } from '@/contexts/VPNWizardContext';
import StepTracker from './StepTracker';
import Step1Authentication from './Step1Authentication';
import Step2CommandExecution from './Step2CommandExecution';
import Step3Success from './Step3Success';
import { X } from 'lucide-react';

function WizardContent({ onClose }: { onClose: () => void }) {
  const { currentStep } = useVPNWizard();

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-black border border-blue-500/30 max-w-5xl w-full my-8">
        {/* Header */}
        <div className="px-6 py-6 border-b border-blue-500/30 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-mono text-white mb-2">
              vpn-setup-wizard
            </h2>
            <p className="text-gray-400 font-mono text-sm">
              automated iiit-h network configuration
            </p>
          </div>
        </div>

        {/* Step Tracker */}
        <div className="border-b border-blue-500/30">
          <StepTracker />
        </div>

        {/* Step Content */}
        <div className="p-6 min-h-[400px]">
          {currentStep === 1 && <Step1Authentication />}
          {currentStep === 2 && <Step2CommandExecution />}
          {currentStep === 3 && <Step3Success />}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-blue-500/30">
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

  {/* VPN troubleshooting is handled by the global/ page-specific Vetal bot now */}
    </div>
  );
}

export default function VPNSetupWizard({ onClose }: { onClose: () => void }) {
  return (
    <VPNWizardProvider>
      <WizardContent onClose={onClose} />
    </VPNWizardProvider>
  );
}