'use client';

import { useEffect } from 'react';

interface OSInfo {
  name: string;
  version: string;
  architecture: string;
}

export function detectOS(): OSInfo {
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;
  
  let osName = 'Unknown';
  let osVersion = 'Unknown';
  let architecture = 'Unknown';

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
  } else if (userAgent.indexOf('Mac') !== -1) {
    osName = 'macOS';
    const match = userAgent.match(/Mac OS X (\d+)[._](\d+)[._]?(\d+)?/);
    if (match) {
      osVersion = `${match[1]}.${match[2]}${match[3] ? '.' + match[3] : ''}`;
    }
  } else if (userAgent.indexOf('Linux') !== -1) {
    osName = 'Linux';
    // Try to detect distribution
    if (userAgent.indexOf('Ubuntu') !== -1) osName = 'Ubuntu';
    else if (userAgent.indexOf('Fedora') !== -1) osName = 'Fedora';
    else if (userAgent.indexOf('Debian') !== -1) osName = 'Debian';
  }

  // Detect architecture
  if (userAgent.indexOf('x86_64') !== -1 || userAgent.indexOf('Win64') !== -1 || userAgent.indexOf('WOW64') !== -1) {
    architecture = 'x64';
  } else if (userAgent.indexOf('arm') !== -1 || userAgent.indexOf('aarch64') !== -1) {
    architecture = 'ARM';
  } else {
    architecture = 'x86';
  }

  return { name: osName, version: osVersion, architecture };
}

export function getOSIcon(osName: string): string {
  const name = osName.toLowerCase();
  // Backwards-compatible: return emoji if called elsewhere
  if (name.includes('windows')) return '🪟';
  if (name.includes('mac')) return '🍎';
  if (name.includes('ios') || name.includes('ipad')) return '🍎';
  if (name.includes('android')) return '🤖';
  if (name.includes('linux') || name.includes('ubuntu') || name.includes('debian') || name.includes('fedora')) return '🐧';
  return '💻';
}

// New: return a public path to an OS logo image. Images are expected in /public
export function getOSLogo(osName: string): string {
  const name = osName.toLowerCase();
  if (name.includes('windows')) return '/win11.png';
  if (name.includes('ubuntu')) return '/ubuntu.png';
  if (name.includes('debian')) return '/debian.png';
  if (name.includes('fedora')) return '/fedora.png';
  if (name.includes('arch')) return '/arch.png';
  if (name.includes('ipad')) return '/iPadOS.png';
  if (name.includes('ios') || name.includes('iphone')) return '/iOS.png';
  if (name.includes('android')) return '/android.png';
  if (name.includes('mac') || name.includes('darwin') || name.includes('macos')) return '/mac.png';
  if (name.includes('linux')) return '/linux.png';
  // default fallback
  return '/linux.png';
}

export function getVPNDownloadURL(osName: string): string {
  const name = osName.toLowerCase();
  if (name.includes('windows')) {
    return 'https://vpn.iiit.ac.in/file/windows.ovpn';
  } else if (name.includes('ubuntu') || name.includes('debian')) {
    return 'https://vpn.iiit.ac.in/file/ubuntu.ovpn';
  } else {
    return 'https://vpn.iiit.ac.in/file/linux.ovpn';
  }
}