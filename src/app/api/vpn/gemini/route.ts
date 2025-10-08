import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface CommandGenerationRequest {
  os: string;
  osVersion?: string;
  architecture?: string;
}

interface ErrorDiagnosisRequest {
  errorText: string;
  os: string;
  command: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    if (action === 'generate-command') {
      return await generateVPNCommand(data as CommandGenerationRequest);
    } else if (action === 'diagnose-error') {
      return await diagnoseError(data as ErrorDiagnosisRequest);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

async function generateVPNCommand(data: CommandGenerationRequest) {
  // Generate one-line copy-paste commands that auto-download and execute scripts
  const osLower = data.os.toLowerCase();
  
  // Use localhost for development, production URL for deployment
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://osdg.iiit.ac.in' 
    : 'http://localhost:3000';
  
  let command = '';
  let scriptName = '';
  let platform = '';
  let requiresAdmin = true;
  let instructions = '';
  let expectedOutput = '';
  let notes = '';
  
  if (osLower.includes('windows')) {
    // Windows: PowerShell one-liner that downloads and executes
    command = `irm ${baseUrl}/scripts/setup-vpn.ps1 | iex`;
    scriptName = 'Windows PowerShell';
    platform = 'Windows';
    instructions = `1. Download your .ovpn config file to Downloads folder (save as 'windows.ovpn')\n2. Right-click PowerShell and select "Run as Administrator"\n3. Copy and paste the command above\n4. Press Enter and follow the prompts`;
    expectedOutput = 'OpenVPN Connect will be installed, your config imported, and VPN connected automatically';
    notes = 'Ensure your .ovpn file is named "windows.ovpn" and saved in Downloads folder';
  } else if (osLower.includes('ubuntu') || osLower.includes('debian') || osLower.includes('mint') || osLower.includes('pop')) {
    // Debian/Ubuntu: curl one-liner
    command = `curl -fsSL ${baseUrl}/scripts/setup-vpn-debian.sh | bash`;
    scriptName = 'Debian/Ubuntu';
    platform = 'Ubuntu/Debian';
    instructions = `1. Download your .ovpn config file to Downloads folder (save as 'linux.ovpn')\n2. Open terminal (Ctrl+Alt+T)\n3. Copy and paste the command above\n4. Press Enter (you'll be prompted for sudo password)`;
    expectedOutput = 'OpenVPN 3 will be installed, your config imported, and VPN session started automatically';
    notes = 'Ensure your .ovpn file is named "linux.ovpn" and saved in ~/Downloads folder';
  } else if (osLower.includes('fedora') || osLower.includes('rhel') || osLower.includes('centos') || osLower.includes('alma') || osLower.includes('rocky')) {
    // Fedora/RHEL: curl one-liner
    command = `curl -fsSL ${baseUrl}/scripts/setup-vpn-fedora.sh | bash`;
    scriptName = 'Fedora/RHEL';
    platform = 'Fedora/RHEL';
    instructions = `1. Download your .ovpn config file to Downloads folder (save as 'linux.ovpn')\n2. Open terminal\n3. Copy and paste the command above\n4. Press Enter (you'll be prompted for sudo password)`;
    expectedOutput = 'OpenVPN 3 will be installed via DNF/YUM, config imported, and VPN connected automatically';
    notes = 'Ensure your .ovpn file is named "linux.ovpn" and saved in ~/Downloads folder';
  } else if (osLower.includes('arch') || osLower.includes('manjaro') || osLower.includes('endeavour')) {
    // Arch Linux: curl one-liner
    command = `curl -fsSL ${baseUrl}/scripts/setup-vpn-arch.sh | bash`;
    scriptName = 'Arch Linux';
    platform = 'Arch Linux';
    instructions = `1. Download your .ovpn config file to Downloads folder (save as 'linux.ovpn')\n2. Open terminal\n3. Copy and paste the command above\n4. Press Enter (you'll be prompted for sudo password)`;
    expectedOutput = 'OpenVPN will be installed via pacman, config imported, and VPN started with systemd';
    notes = 'Ensure your .ovpn file is named "linux.ovpn" and saved in ~/Downloads folder';
  } else if (osLower.includes('mac') || osLower.includes('darwin')) {
    // macOS: curl one-liner
    command = `curl -fsSL ${baseUrl}/scripts/setup-vpn-macos.sh | bash`;
    scriptName = 'macOS';
    platform = 'macOS';
    instructions = `1. Download your .ovpn config file to Downloads folder (save as 'macos.ovpn')\n2. Open Terminal (Cmd+Space, type "Terminal")\n3. Copy and paste the command above\n4. Press Enter and follow the prompts`;
    expectedOutput = 'OpenVPN Connect will be installed (via Homebrew or direct download), config imported, and GUI will open automatically';
    notes = 'Ensure your .ovpn file is named "macos.ovpn" and saved in Downloads folder';
  } else {
    // Default to general Linux
    command = `curl -fsSL ${baseUrl}/scripts/setup-vpn-debian.sh | bash`;
    scriptName = 'Linux';
    platform = 'Linux';
    instructions = `1. Download your .ovpn config file to Downloads folder (save as 'linux.ovpn')\n2. Open terminal\n3. Copy and paste the command above\n4. Press Enter (you'll be prompted for sudo password)`;
    expectedOutput = 'OpenVPN 3 will be installed, your config imported, and VPN session started automatically';
    notes = 'Ensure your .ovpn file is named "linux.ovpn" and saved in ~/Downloads folder';
  }

  const response = {
    command: command,
    requiresAdmin: requiresAdmin,
    instructions: instructions,
    expectedOutput: expectedOutput,
    notes: `✅ ONE-LINE SETUP: Just copy, paste in terminal, and press Enter!\n\n${notes}\n\nThis command automatically downloads and executes our tested setup script. No manual downloads or multiple steps needed.`,
    scriptName: scriptName,
    platform: platform
  };

  return NextResponse.json(response);
}

async function diagnoseError(data: ErrorDiagnosisRequest) {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2048,
    }
  });

  const prompt = `You are an expert troubleshooter helping a student at IIIT Hyderabad who encountered an error while setting up OpenVPN.

CONTEXT:
- OS: ${data.os}
- Command they ran: ${data.command}
- Error they got: ${data.errorText}

TASK: Diagnose the error and provide a solution.

OUTPUT FORMAT (JSON):
{
  "diagnosis": "Clear explanation of what went wrong",
  "solution": "Step-by-step solution to fix the issue",
  "alternativeCommand": "If needed, provide a corrected or alternative command",
  "commonCause": "The most likely cause of this error",
  "preventionTip": "How to avoid this error in the future"
}

Analyze and respond:`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();
  
  // Parse the JSON response from Gemini
  let parsedResponse;
  try {
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/```\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      parsedResponse = JSON.parse(jsonMatch[1]);
    } else {
      parsedResponse = JSON.parse(response);
    }
  } catch (e) {
    console.error('Failed to parse Gemini error diagnosis:', response);
    parsedResponse = {
      diagnosis: 'Unable to automatically diagnose the error.',
      solution: 'Please try the manual installation steps from the IIIT-H VPN documentation.',
      alternativeCommand: null,
      commonCause: 'Unknown error',
      preventionTip: 'Ensure you have administrator/sudo privileges and a stable internet connection.'
    };
  }

  return NextResponse.json(parsedResponse);
}

// Fallback commands if Gemini fails
function getManualCommand(os: string): string {
  const osLower = os.toLowerCase();
  
  if (osLower.includes('windows')) {
    return 'powershell -Command "Start-Process powershell -Verb RunAs -ArgumentList \'Invoke-WebRequest -Uri https://swupdate.openvpn.org/community/releases/OpenVPN-2.6.8-I001-amd64.msi -OutFile $env:TEMP\\openvpn.msi; Start-Process msiexec.exe -ArgumentList \'/i\', \'$env:TEMP\\openvpn.msi\', \'/quiet\', \'/norestart\' -Wait\'"';
  } else if (osLower.includes('mac') || osLower.includes('darwin')) {
    return 'brew install openvpn && sudo cp ~/Downloads/ubuntu.ovpn /usr/local/etc/openvpn/iiith.ovpn';
  } else {
    return 'sudo apt-get update && sudo apt-get install -y openvpn && sudo cp ~/Downloads/ubuntu.ovpn /etc/openvpn/iiith.conf';
  }
}

function getManualInstructions(os: string): string {
  const osLower = os.toLowerCase();
  
  if (osLower.includes('windows')) {
    return '1. Open PowerShell as Administrator\n2. Paste and run the command\n3. Wait for installation to complete\n4. Import the .ovpn file in OpenVPN GUI';
  } else if (osLower.includes('mac') || osLower.includes('darwin')) {
    return '1. Open Terminal\n2. Paste and run the command (enter password when prompted)\n3. OpenVPN will be configured automatically';
  } else {
    return '1. Open Terminal\n2. Paste and run the command (enter sudo password when prompted)\n3. OpenVPN will be installed and configured';
  }
}