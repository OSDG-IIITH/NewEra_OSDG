'use client';

import { useVPNWizard } from '@/contexts/VPNWizardContext';
import { CheckCircle2, Circle } from 'lucide-react';

const STEPS = [
  { number: 1, title: 'Authenticate'},
  { number: 2, title: 'Paste in Terminal'},
  { number: 3, title: 'Done'},
];

export default function StepTracker() {
  const { currentStep } = useVPNWizard();

  return (
    <div className="w-full py-6 bg-black">
      {/* Use a centered container and evenly spaced items */}
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-center space-x-6">
          {STEPS.map((step, index) => (
            <div key={step.number} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 border rounded-md transition-all duration-300 font-mono
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
                </div>
              </div>

              {/* Connector Line (fixed width so centering works) */}
              {index < STEPS.length - 1 && (
                <div
                  className={`
                    w-16 h-px mx-4 transition-all duration-300 self-center
                    ${currentStep > step.number ? 'bg-green-500/50' : 'bg-blue-500/30'}
                  `}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}