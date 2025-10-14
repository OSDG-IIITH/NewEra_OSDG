export interface GeneratedCommand {
  command: string;
  requiresAdmin: boolean;
  instructions: string;
  expectedOutput: string;
  notes: string;
  scriptName: string;
  platform: string;
}

export function generateVPNCommand(data: { os: string; osVersion?: string; architecture?: string }): GeneratedCommand {
  const osLower = data.os.toLowerCase();

  // Dynamic base URL that works with both localhost and LAN IPs
  let baseUrl: string;
  if (typeof window !== 'undefined') {
    // Client-side: use current window location
    const protocol = window.location.protocol; // http: or https:
    const host = window.location.host; // includes hostname:port
    baseUrl = `${protocol}//${host}`;
  } else {
    // Server-side fallback
    baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://osdg.iiit.ac.in'
      : 'http://localhost:3000';
  }

  let command = '';
  let scriptName = '';
  let platform = '';
  let requiresAdmin = true;
  let instructions = '';
  let expectedOutput = '';
  let notes = '';

  if (osLower.includes('windows')) {
    command = `irm ${baseUrl}/scripts/setup-vpn.ps1 | iex`;
    scriptName = 'Windows PowerShell';
    platform = 'Windows';
    instructions = `1. Right-click PowerShell and select "Run as Administrator"\n2. Copy and paste the command above\n3. Press Enter`;
    //expectedOutput = 'OpenVPN Connect will be installed, your config imported, and VPN connected automatically';
    //notes = 'Ensure your .ovpn file is named "windows.ovpn" and saved in Downloads folder';
  } else if (osLower.includes('ubuntu') || osLower.includes('debian') || osLower.includes('mint') || osLower.includes('pop')) {
    command = `curl -fsSL ${baseUrl}/scripts/setup-vpn-debian.sh | bash`;
    scriptName = 'Debian/Ubuntu';
    platform = 'Ubuntu/Debian';
    instructions = `1. Open terminal (Ctrl+Alt+T)\n3. Copy and paste the command above\n3. Press Enter (you'll be prompted for sudo password)`;
    //expectedOutput = 'OpenVPN 3 will be installed, your config imported, and VPN session started automatically';
    //notes = 'Ensure your .ovpn file is named "linux.ovpn" and saved in ~/Downloads folder';
  } else if (osLower.includes('fedora') || osLower.includes('rhel') || osLower.includes('centos') || osLower.includes('alma') || osLower.includes('rocky')) {
    command = `curl -fsSL ${baseUrl}/scripts/setup-vpn-fedora.sh | bash`;
    scriptName = 'Fedora/RHEL';
    platform = 'Fedora/RHEL';
    instructions = `1. Open terminal\n3. Copy and paste the command above\n3. Press Enter (you'll be prompted for sudo password)`;
    //expectedOutput = 'OpenVPN 3 will be installed via DNF/YUM, config imported, and VPN connected automatically';
    //notes = 'Ensure your .ovpn file is named "linux.ovpn" and saved in ~/Downloads folder';
  } else if (osLower.includes('arch') || osLower.includes('manjaro') || osLower.includes('endeavour')) {
    command = `curl -fsSL ${baseUrl}/scripts/setup-vpn-arch.sh | bash`;
    scriptName = 'Arch Linux';
    platform = 'Arch Linux';
    instructions = `1. Open terminal\n3. Copy and paste the command above\n4. Press Enter (you'll be prompted for sudo password)`;
    //expectedOutput = 'OpenVPN will be installed via pacman, config imported, and VPN started with systemd';
    //notes = 'Ensure your .ovpn file is named "linux.ovpn" and saved in ~/Downloads folder';
  } else if (osLower.includes('ipad')) {
    command = 'https://vpn.iiit.ac.in/file/generic.ovpn';
    scriptName = 'iPadOS';
    platform = 'iPadOS';
    requiresAdmin = false;
    instructions = `1. Download OpenVPN Connect from App Store\n2. Download config file (requires IIIT login)\n3. Open the downloaded .ovpn file with OpenVPN Connect app`;
    notes = 'App Store: https://apps.apple.com/in/app/openvpn-connect';
  } else if (osLower.includes('iphone') || osLower.includes('ios')) {
    command = 'https://vpn.iiit.ac.in/file/generic.ovpn';
    scriptName = 'iOS';
    platform = 'iOS';
    requiresAdmin = false;
    instructions = `1. Download OpenVPN Connect from App Store\n2. Download config file (requires IIIT login)\n3. Open the downloaded .ovpn file with OpenVPN Connect app`;
    notes = 'App Store: https://apps.apple.com/in/app/openvpn-connect';
  } else if (osLower.includes('android')) {
    command = 'https://vpn.iiit.ac.in/file/android.ovpn';
    scriptName = 'Android';
    platform = 'Android';
    requiresAdmin = false;
    instructions = `1. Install OpenVPN from Play Store\n2. Download config file (requires IIIT login)\n3. Import the .ovpn file into OpenVPN app`;
    notes = 'Play Store: https://play.google.com/store/search?q=openvpn&c=apps';
  } else if (osLower.includes('mac') || osLower.includes('darwin')) {
    command = `curl -fsSL ${baseUrl}/scripts/setup-vpn-macos.sh | bash`;
    scriptName = 'macOS';
    platform = 'macOS';
    instructions = `1. Open Terminal (Cmd+Space, type "Terminal")\n2. Copy and paste the command above\n3. Press Enter`;
    //expectedOutput = 'OpenVPN Connect will be installed (via Homebrew or direct download), config imported, and GUI will open automatically';
    //notes = 'Ensure your .ovpn file is named "macos.ovpn" and saved in Downloads folder';
  } else {
    command = `curl -fsSL ${baseUrl}/scripts/setup-vpn-debian.sh | bash`;
    scriptName = 'Linux';
    platform = 'Linux';
    instructions = `1. Open terminal\n2. Copy and paste the command above\n3. Press Enter (you'll be prompted for sudo password)`;
    //expectedOutput = 'OpenVPN 3 will be installed, your config imported, and VPN session started automatically';
    //notes = 'Ensure your .ovpn file is named "linux.ovpn" and saved in ~/Downloads folder';
  }

  return {
    command,
    requiresAdmin,
    instructions,
    expectedOutput,
    notes,
    scriptName,
    platform,
  };
}
