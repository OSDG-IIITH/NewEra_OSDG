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
      <div className="max-w-3xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-center space-x-2 sm:space-x-4 md:space-x-6">
          {STEPS.map((step, index) => (
            <div key={step.number} className="flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 border rounded-md transition-all duration-300 font-mono
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
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <span className="text-xs sm:text-sm font-bold">{step.number}</span>
                  )}
                </div>
                <div className="mt-1 sm:mt-2 text-center max-w-[80px] sm:max-w-none">
                  <div
                    className={`
                      text-[10px] sm:text-xs font-mono whitespace-nowrap
                      ${currentStep >= step.number ? 'text-white' : 'text-gray-600'}
                    `}
                  >
                    {step.title}
                  </div>
                </div>
              </div>

              {/* Connector Line (responsive width) */}
              {index < STEPS.length - 1 && (
                <div
                  className={`
                    w-8 sm:w-12 md:w-16 h-px mx-2 sm:mx-3 md:mx-4 transition-all duration-300 self-center
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