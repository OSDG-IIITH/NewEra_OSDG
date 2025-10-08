'use client';

import { useVPNWizard } from '@/contexts/VPNWizardContext';
import { CheckCircle2, Circle } from 'lucide-react';

const STEPS = [
  { number: 1, title: 'Authenticate', description: 'Download VPN config' },
  { number: 2, title: 'Setup', description: 'Run the command' },
  { number: 3, title: 'Done', description: 'Connect to VPN' },
];

export default function StepTracker() {
  const { currentStep } = useVPNWizard();

  return (
    <div className="w-full py-6 bg-black">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {STEPS.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  flex items-center justify-center w-10 h-10 border transition-all duration-300 font-mono
                  ${
                    currentStep > step.number
                      ? 'bg-black border-green-500 text-green-400'
                      : currentStep === step.number
                      ? 'bg-black border-blue-400 text-blue-400'
                      : 'bg-black border-gray-700 text-gray-600'
                  }
                `}
              >
                {currentStep > step.number ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-bold">{step.number}</span>
                )}
              </div>
              <div className="mt-2 text-center">
                <div
                  className={`
                    text-xs font-mono
                    ${currentStep >= step.number ? 'text-white' : 'text-gray-600'}
                  `}
                >
                  {step.title}
                </div>
                <div
                  className={`
                    text-xs font-mono
                    ${currentStep >= step.number ? 'text-gray-500' : 'text-gray-700'}
                  `}
                >
                  {step.description}
                </div>
              </div>
            </div>

            {/* Connector Line */}
            {index < STEPS.length - 1 && (
              <div
                className={`
                  flex-1 h-px mx-4 transition-all duration-300
                  ${currentStep > step.number ? 'bg-green-500/50' : 'bg-blue-500/30'}
                `}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}