'use client';

import { useEffect, useState } from 'react';
import { useVPNWizard } from '@/contexts/VPNWizardContext';
import { detectOS, getOSLogo, getVPNDownloadURL, LINUX_DISTROS } from '@/utils/osDetection';
import Image from 'next/image';
import { Download, ExternalLink, CheckCircle } from 'lucide-react';

export default function Step1Authentication() {
  const { osInfo, setOSInfo, setHasDownloaded, setCurrentStep } = useVPNWizard();
  const [isAuthWindowOpen, setIsAuthWindowOpen] = useState(false);
  const [downloadConfirmed, setDownloadConfirmed] = useState(false);
  const [showDistroSelection, setShowDistroSelection] = useState(false);
  const [selectedDistro, setSelectedDistro] = useState<string>('');

  useEffect(() => {
    const detected = detectOS();
    setOSInfo(detected);
    
    // Show distro selection if Linux with unknown distro
    if (detected.name.toLowerCase().includes('linux') && 
        (detected.distro === 'unknown' || !detected.distro)) {
      setShowDistroSelection(true);
    }
  }, [setOSInfo]);

  const handleDistroSelect = (distroId: string) => {
    setSelectedDistro(distroId);
    
    // Update OS info with selected distro
    if (osInfo) {
      const distroMap: { [key: string]: string } = {
        'ubuntu': 'Ubuntu',
        'debian': 'Debian',
        'fedora': 'Fedora',
        'arch': 'Arch'
      };
      
      const updatedOSInfo = {
        ...osInfo,
        distro: distroMap[distroId] || distroId,
        name: distroMap[distroId] || osInfo.name
      };
      
      setOSInfo(updatedOSInfo);
      setShowDistroSelection(false);
    }
  };

  const handleOpenAuthWindow = () => {
    if (!osInfo) return;
    
    const downloadURL = getVPNDownloadURL(osInfo.name, osInfo.distro);
    const authWindow = window.open(downloadURL, '_blank', 'width=800,height=600');
    setIsAuthWindowOpen(true);
  };

  const handleConfirmDownload = () => {
    setDownloadConfirmed(true);
    setHasDownloaded(true);
    
    // Move to next step after a short delay
    setTimeout(() => {
      setCurrentStep(2);
    }, 500);
  };

  if (!osInfo) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  // Show Linux distro selection screen
  if (showDistroSelection) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto p-6">
        <div className="bg-black border border-blue-500/30 p-6 rounded-md">
          <h3 className="text-lg font-mono text-white mb-2">
            Select Your Linux Distribution
          </h3>
          <p className="text-gray-400 text-sm font-mono mb-6">
            We couldn&apos;t automatically detect your distro. Please select it manually:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LINUX_DISTROS.map((distro) => (
              <button
                key={distro.id}
                onClick={() => handleDistroSelect(distro.id)}
                className={`bg-black border ${
                  selectedDistro === distro.id
                    ? 'border-cyan-400 bg-cyan-500/10'
                    : 'border-blue-500/30 hover:border-blue-400'
                } p-4 rounded-md transition-all duration-300 flex items-center space-x-4`}
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  <Image
                    src={distro.logo}
                    alt={`${distro.name} logo`}
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <div className="text-left">
                  <div className="text-white font-mono text-sm">
                    {distro.name}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-6">
      {/* OS Detection Card */}
  <div className="bg-black border border-blue-500/30 p-6 rounded-md">
        <h3 className="text-sm font-mono text-white mb-3">
          Detected System
        </h3>
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 flex items-center justify-center">
            <Image
              src={getOSLogo(osInfo.name)}
              alt={`${osInfo.name} logo`}
              width={48}
              height={48}
              className="object-contain rounded-md"
            />
          </div>
          <div>
            <div className="text-white font-mono text-lg">{osInfo.name}</div>
            <div className="text-gray-400 text-sm font-mono">
              {osInfo.version} • {osInfo.architecture}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions Card */}
  <div className="bg-black border border-blue-500/30 p-6 rounded-md">
        <h3 className="text-sm font-mono text-white mb-3">
          &gt; Process
        </h3>
        <ol className="space-y-2 text-gray-400 font-mono text-sm">
          <li className="flex items-start">
            <span className="text-blue-400 mr-2">1.</span>
            <span>Authenticate via CAS - config (.ovpn) file gets downloaded</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-400 mr-2">2.</span>
            <span>Paste code in terminal (Admin/Root access)</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-400 mr-2">3.</span>
            <span>Done</span>
          </li>
        </ol>
      </div>

      {/* Action Button */}
      {!downloadConfirmed && (
        !isAuthWindowOpen && (
          <button
            onClick={handleOpenAuthWindow}
            className="w-full bg-black border border-blue-500/50 hover:border-blue-400 text-blue-400 hover:text-blue-300 font-mono py-4 px-6 transition-all duration-300 flex items-center justify-center space-x-2 rounded-md"
          >
            <ExternalLink className="w-5 h-5" />
            <span>open authentication</span>
          </button>
        )
      )}

      {/* Waiting for Download Confirmation: show while popup is open or when popup was closed but user hasn't confirmed */}
  {isAuthWindowOpen && !downloadConfirmed && (
        <div className="space-y-4">
          <div className="bg-black border border-yellow-500/30 p-6 rounded-md">
            <div className="flex items-center space-x-3 mb-3">
              <div className="animate-pulse">
                <Download className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-sm font-mono text-white">
                Confirm Download
              </h3>
            </div>
            <p className="text-gray-400 text-sm font-mono">
              -Ensure config file downloads to default downloads folder of the system.<br />-If not {'-->'} move the config file to downloads folder.
            </p>
          </div>

          <button
            onClick={handleConfirmDownload}
            className="w-full bg-black border border-green-500/50 hover:border-green-400 text-green-400 hover:text-green-300 font-mono py-4 px-6 transition-all duration-300 flex items-center justify-center space-x-2 rounded-md"
          >
            <CheckCircle className="w-5 h-5" />
            <span>downloaded</span>
          </button>

          {/* re-open button removed by request */}
        </div>
      )}

      {/* Success State */}
      {downloadConfirmed && (
        <div className="bg-black border border-green-500/30 p-6 animate-pulse rounded-md">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <span className="text-green-400 font-mono text-sm">
              generating setup command...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}