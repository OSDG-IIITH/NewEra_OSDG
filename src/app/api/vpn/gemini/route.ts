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

    if (action === 'diagnose-error') {
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
  // generate-command moved to local utility. This route only performs error diagnosis via Gemini.
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