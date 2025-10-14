'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface OSInfo {
  name: string;
  version: string;
  architecture: string;
}

interface CommandData {
  command: string;
  requiresAdmin: boolean;
  instructions: string;
  expectedOutput: string;
  notes: string;
  scriptName: string;
  platform: string;
}

interface VPNWizardContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  osInfo: OSInfo | null;
  setOSInfo: (info: OSInfo) => void;
  hasDownloaded: boolean;
  setHasDownloaded: (downloaded: boolean) => void;
  hasStarted: boolean;
  setHasStarted: (started: boolean) => void;
  commandData: CommandData | null;
  setCommandData: (data: CommandData) => void;
  errorText: string;
  setErrorText: (error: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const VPNWizardContext = createContext<VPNWizardContextType | undefined>(undefined);

export function VPNWizardProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [osInfo, setOSInfo] = useState<OSInfo | null>(null);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [commandData, setCommandData] = useState<CommandData | null>(null);
  const [errorText, setErrorText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  return (
    <VPNWizardContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        osInfo,
        setOSInfo,
        hasDownloaded,
        setHasDownloaded,
        hasStarted,
        setHasStarted,
        commandData,
        setCommandData,
        errorText,
        setErrorText,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </VPNWizardContext.Provider>
  );
}

export function useVPNWizard() {
  const context = useContext(VPNWizardContext);
  if (!context) {
    throw new Error('useVPNWizard must be used within VPNWizardProvider');
  }
  return context;
}