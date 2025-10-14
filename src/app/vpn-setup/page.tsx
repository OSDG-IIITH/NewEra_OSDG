'use client';

import { VPNWizardProvider, useVPNWizard } from '@/contexts/VPNWizardContext';
import StepTracker from '@/components/vpn/StepTracker';
import Step1Authentication from '@/components/vpn/Step1Authentication';
import Step2CommandExecution from '@/components/vpn/Step2CommandExecution';
import Step3Success from '@/components/vpn/Step3Success';
import WispBotDelayed from '@/components/WispBotDelayed';
import { Terminal } from 'lucide-react';
import { useState } from 'react';
import { useEffect } from 'react';

function VPNSetupContent() {
  const { currentStep, hasStarted, setHasStarted, osInfo, commandData, errorText } = useVPNWizard();
  const [openWispChat, setOpenWispChat] = useState(false);
  
  const tagline = 'Automated configuration for internal network access - outside';
  const [typedTagline, setTypedTagline] = useState('');
  const [showTagCursor, setShowTagCursor] = useState(true);

  useEffect(() => {
    if (!hasStarted) {
      let i = 0;
      const speed = 20; // fast typing
      let typerId: number | undefined;
      let blinkId: number | undefined;

      typerId = window.setInterval(() => {
        if (i <= tagline.length) {
          setTypedTagline(tagline.slice(0, i));
          i++;
        } else {
          if (typerId !== undefined) window.clearInterval(typerId);
          // stop blinking and remove cursor once typing finishes
          if (blinkId !== undefined) window.clearInterval(blinkId);
          setShowTagCursor(false);
        }
      }, speed) as unknown as number;

      blinkId = window.setInterval(() => setShowTagCursor((s) => !s), 500) as unknown as number;

      return () => {
        if (typerId !== undefined) window.clearInterval(typerId);
        if (blinkId !== undefined) window.clearInterval(blinkId);
      };
    }
  }, [hasStarted, tagline]);

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-3xl mx-auto text-center space-y-8 px-4">
          <h1 className="text-6xl font-oxanium font-bold text-white tracking-tight">
            IIIT-H VPN Setup
          </h1>

          <p className="text-gray-400 text-lg font-mono">
            {typedTagline}
            {showTagCursor && <span className="inline-block ml-1 w-2 h-5 bg-gray-400 align-middle" />}
          </p>

          <button
            onClick={() => setHasStarted(true)}
            className="mt-8 bg-black border border-blue-500/50 hover:border-blue-400 text-blue-400 hover:text-blue-300 font-mono py-3 px-8 transition-all duration-300"
          >
            &gt; Start setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">

          {/* Step Tracker */}
          <div className="mb-8">
            <StepTracker />
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {currentStep === 1 && <Step1Authentication />}
            {currentStep === 2 && <Step2CommandExecution onError={() => setOpenWispChat(true)} />}
            {currentStep === 3 && <Step3Success />}
          </div>
        </div>
      </div>

      {/* VPN Troubleshooting WISP Bot */}
      <WispBotDelayed 
        mode="vpn-troubleshooting"
        vpnContext={{ osInfo, commandData, errorText }}
        forceOpen={openWispChat}
        onForceHandled={() => setOpenWispChat(false)}
        onOpenChat={() => setOpenWispChat(false)}
      />
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