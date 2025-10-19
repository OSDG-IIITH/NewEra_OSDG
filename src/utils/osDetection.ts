'use client';

import { useEffect } from 'react';

interface OSInfo {
  name: string;
  version: string;
  architecture: string;
  distro?: string; // For Linux distributions
}

export function detectOS(): OSInfo {
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;
  
  let osName = 'Unknown';
  let osVersion = 'Unknown';
  let architecture = 'Unknown';
  let distro: string | undefined = undefined;

  // Detect mobile OS first
  if (/iPad|iPad Simulator/i.test(userAgent) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    osName = 'iPadOS';
    const match = userAgent.match(/OS (\d+)[._](\d+)[._]?(\d+)?/);
    if (match) {
      osVersion = `${match[1]}.${match[2]}${match[3] ? '.' + match[3] : ''}`;
    }
  } else if (/iPhone|iPod/i.test(userAgent)) {
    osName = 'iOS';
    const match = userAgent.match(/OS (\d+)[._](\d+)[._]?(\d+)?/);
    if (match) {
      osVersion = `${match[1]}.${match[2]}${match[3] ? '.' + match[3] : ''}`;
    }
  } else if (/Android/i.test(userAgent)) {
    osName = 'Android';
    const match = userAgent.match(/Android (\d+\.?\d*)/);
    if (match) {
      osVersion = match[1];
    }
  } else if (userAgent.indexOf('Win') !== -1) {
    osName = 'Windows';
    // Try to detect Windows version
    if (userAgent.indexOf('Windows NT 10.0') !== -1) osVersion = '10/11';
    else if (userAgent.indexOf('Windows NT 6.3') !== -1) osVersion = '8.1';
    else if (userAgent.indexOf('Windows NT 6.2') !== -1) osVersion = '8';
    else if (userAgent.indexOf('Windows NT 6.1') !== -1) osVersion = '7';
  } else if (userAgent.indexOf('Mac') !== -1 && !(/iPad|iPhone|iPod/i.test(userAgent))) {
    osName = 'macOS';
    const match = userAgent.match(/Mac OS X (\d+)[._](\d+)[._]?(\d+)?/);
    if (match) {
      osVersion = `${match[1]}.${match[2]}${match[3] ? '.' + match[3] : ''}`;
    }
  } else if (userAgent.indexOf('Linux') !== -1) {
    osName = 'Linux';
    
    // Try to detect distribution (note: browsers don't usually expose this)
    // These checks are unreliable - user-agent rarely includes distro info
    const lowerUA = userAgent.toLowerCase();
    
    if (lowerUA.includes('ubuntu')) {
      distro = 'Ubuntu';
      osName = 'Ubuntu';
    } else if (lowerUA.includes('fedora')) {
      distro = 'Fedora';
      osName = 'Fedora';
    } else if (lowerUA.includes('debian')) {
      distro = 'Debian';
      osName = 'Debian';
    } else if (lowerUA.includes('arch')) {
      distro = 'Arch';
      osName = 'Arch';
    } else if (lowerUA.includes('centos')) {
      distro = 'CentOS';
      osName = 'CentOS';
    } else if (lowerUA.includes('rhel') || lowerUA.includes('red hat')) {
      distro = 'RHEL';
      osName = 'RHEL';
    } else {
      // Cannot determine distro - will need manual selection
      distro = 'unknown';
    }
  }

  // Detect architecture
  if (userAgent.indexOf('x86_64') !== -1 || userAgent.indexOf('Win64') !== -1 || userAgent.indexOf('WOW64') !== -1 || platform.includes('64')) {
    architecture = 'x64';
  } else if (userAgent.indexOf('arm') !== -1 || userAgent.indexOf('aarch64') !== -1 || userAgent.indexOf('ARM') !== -1) {
    architecture = 'ARM';
  } else if (platform.includes('arm') || platform.includes('ARM')) {
    architecture = 'ARM';
  } else {
    architecture = 'x86';
  }

  return { name: osName, version: osVersion, architecture, distro };
}

// Return a public path to an OS logo image
export function getOSLogo(osName: string): string {
  const name = osName.toLowerCase();
  if (name.includes('windows')) return '/win11.png';
  if (name.includes('ubuntu')) return '/ubuntu.png';
  if (name.includes('debian')) return '/debian.png';
  if (name.includes('fedora') || name.includes('centos') || name.includes('rhel')) return '/fedora.png';
  if (name.includes('arch')) return '/arch.png';
  if (name.includes('ipad')) return '/iPadOS.png';
  if (name.includes('ios') || name.includes('iphone')) return '/iOS.png';
  if (name.includes('android')) return '/android.png';
  if (name.includes('mac') || name.includes('darwin') || name.includes('macos')) return '/mac.png';
  if (name.includes('linux')) return '/linux.png';
  return '/linux.png';
}

export function getVPNDownloadURL(osName: string, distro?: string): string {
  const name = osName.toLowerCase();
  
  if (name.includes('windows')) {
    return 'https://vpn.iiit.ac.in/file/windows.ovpn';
  } else if (name.includes('mac') || name.includes('darwin') || name.includes('macos')) {
    return 'https://vpn.iiit.ac.in/file/generic.ovpn';
  } else if (name.includes('ubuntu') || name.includes('debian') || distro === 'Ubuntu' || distro === 'Debian') {
    return 'https://vpn.iiit.ac.in/file/ubuntu_new.ovpn';
  } else if (name.includes('fedora') || name.includes('centos') || name.includes('rhel') || distro === 'Fedora' || distro === 'CentOS' || distro === 'RHEL') {
    return 'https://vpn.iiit.ac.in/file/linux.ovpn';
  } else if (name.includes('arch') || distro === 'Arch') {
    return 'https://vpn.iiit.ac.in/file/linux.ovpn';
  } else {
    return 'https://vpn.iiit.ac.in/file/linux.ovpn';
  }
}

// Get the correct setup script URL based on OS/distro
export function getSetupScriptURL(osName: string, distro?: string): string {
  const name = osName.toLowerCase();
  const baseURL = 'http://10.2.135.116:3000/scripts'; // Replace with your actual domain
  
  if (name.includes('windows')) {
    return `${baseURL}/setup-vpn.ps1`;
  } else if (name.includes('mac') || name.includes('darwin') || name.includes('macos')) {
    return `${baseURL}/setup-vpn-macos.sh`;
  } else if (name.includes('ubuntu') || name.includes('debian') || distro === 'Ubuntu' || distro === 'Debian') {
    return `${baseURL}/setup-vpn-debian.sh`;
  } else if (name.includes('fedora') || name.includes('centos') || name.includes('rhel') || distro === 'Fedora' || distro === 'CentOS' || distro === 'RHEL') {
    return `${baseURL}/setup-vpn-fedora.sh`;
  } else if (name.includes('arch') || distro === 'Arch') {
    return `${baseURL}/setup-vpn-arch.sh`;
  } else {
    // Default to Debian for unknown Linux
    return `${baseURL}/setup-vpn-debian.sh`;
  }
}

// Get the copy-paste command
export function getOneLineCommand(osName: string, distro?: string): string {
  const scriptURL = getSetupScriptURL(osName, distro);
  const name = osName.toLowerCase();
  
  if (name.includes('windows')) {
    return `irm ${scriptURL} | iex`;
  } else {
    return `curl -fsSL ${scriptURL} | bash`;
  }
}

// List of Linux distributions for manual selection
export const LINUX_DISTROS = [
  { id: 'ubuntu', name: 'Ubuntu / Linux Mint / Pop!_OS', logo: '/ubuntu.png' },
  { id: 'debian', name: 'Debian', logo: '/debian.png' },
  { id: 'fedora', name: 'Fedora / RHEL / CentOS / AlmaLinux / Rocky', logo: '/fedora.png' },
  { id: 'arch', name: 'Arch Linux / Manjaro / EndeavourOS', logo: '/arch.png' },
];
