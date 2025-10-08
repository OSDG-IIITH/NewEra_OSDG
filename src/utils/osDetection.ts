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

  // Detect OS
  if (userAgent.indexOf('Win') !== -1) {
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
  if (name.includes('windows')) return '🪟';
  if (name.includes('mac')) return '🍎';
  if (name.includes('linux') || name.includes('ubuntu') || name.includes('debian') || name.includes('fedora')) return '🐧';
  return '💻';
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