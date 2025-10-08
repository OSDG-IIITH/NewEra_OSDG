'use client';

import { useState, useRef } from 'react';
import { useVPNWizard } from '@/contexts/VPNWizardContext';
import { Send, Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function ErrorTroubleshootingChat() {
  const { osInfo, commandData, errorText, setErrorText } = useVPNWizard();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendError = async () => {
    if (!errorText.trim() && !uploadedImage) return;

    const userMessage = errorText || 'I uploaded a screenshot of the error';
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/vpn/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'diagnose-error',
          errorText: errorText || 'Screenshot provided',
          os: osInfo?.name,
          command: commandData?.command,
        }),
      });

      if (!response.ok) throw new Error('Failed to diagnose error');

      const diagnosis = await response.json();
      
      const assistantMessage = `
**Diagnosis:** ${diagnosis.diagnosis}

**Solution:**
${diagnosis.solution}

${diagnosis.alternativeCommand ? `**Try this command instead:**
\`\`\`
${diagnosis.alternativeCommand}
\`\`\`` : ''}

**Common Cause:** ${diagnosis.commonCause}

**Prevention Tip:** ${diagnosis.preventionTip}
      `.trim();

      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
      setErrorText('');
      setUploadedImage(null);
    } catch (error) {
      console.error('Error diagnosing:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error while analyzing your problem. Please try again or consult the manual installation guide.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      id="error-troubleshooting"
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden"
    >
      <div className="bg-black border border-blue-500/30 max-w-3xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-blue-500/30 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-mono text-white">error diagnosis</h3>
            <p className="text-sm text-gray-400 font-mono">ai troubleshooting assistant</p>
          </div>
          <button
            onClick={() => {
              document.getElementById('error-troubleshooting')?.classList.add('hidden');
            }}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-black">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 py-12 font-mono">
              <p className="mb-4 text-sm">&gt; describe your error or upload screenshot</p>
              <p className="text-sm text-gray-500">ai will analyze and provide solution</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 font-mono text-sm ${
                  message.role === 'user'
                    ? 'bg-blue-500/10 border border-blue-500/30 text-blue-300'
                    : 'bg-black border border-green-500/30 text-green-400'
                }`}
              >
                <div className="space-y-2">
                  {message.content.split('\n').map((line, i) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return (
                        <p key={i} className="font-bold mb-2 text-white">
                          {line.replace(/\*\*/g, '')}
                        </p>
                      );
                    } else if (line.startsWith('```')) {
                      return null; // Skip code fence markers
                    } else if (line.trim()) {
                      return <p key={i} className="mb-2">{line}</p>;
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-black border border-green-500/30 p-4 flex items-center space-x-2">
                <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
                <span className="text-green-400 font-mono text-sm">analyzing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="px-6 py-4 border-t border-blue-500/30 bg-black">
          {uploadedImage && (
            <div className="mb-3 relative inline-block">
              <img
                src={uploadedImage}
                alt="Error screenshot"
                className="max-h-32 border border-blue-500/30"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 p-1"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          <div className="flex space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-black border border-blue-500/50 hover:border-blue-400 text-blue-400 p-3 transition-colors"
              title="Upload screenshot"
            >
              <ImageIcon className="w-5 h-5" />
            </button>

            <textarea
              value={errorText}
              onChange={(e) => setErrorText(e.target.value)}
              placeholder="paste error message or describe the issue..."
              className="flex-1 bg-black border border-blue-500/30 text-green-400 placeholder:text-gray-500 px-4 py-3 resize-none focus:outline-none focus:border-blue-400 font-mono text-sm"
              rows={3}
            />

            <button
              onClick={handleSendError}
              disabled={(!errorText.trim() && !uploadedImage) || isLoading}
              className="bg-black border border-green-500/50 hover:border-green-400 disabled:border-gray-700 disabled:cursor-not-allowed text-green-400 disabled:text-gray-600 p-3 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}