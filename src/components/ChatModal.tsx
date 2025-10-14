"use client";

import React, { useState, useRef, useEffect } from "react";
import { Upload, X } from "lucide-react";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "general" | "vpn-troubleshooting";
  vpnContext?: {
    osInfo?: { name: string; version?: string; architecture?: string } | null;
    commandData?: { command: string } | null;
    errorText?: string | null;
  };
}

export default function ChatModal({ isOpen, onClose, mode = "general", vpnContext }: ChatModalProps) {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    { 
      role: "assistant", 
      content: mode === "vpn-troubleshooting" 
        ? "I'm WISP. I will solve VPN setup errors that ur dumb ass can't. Describe the issue or upload a screenshot."
        : "I'm WISP. What do you want?" 
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Reset messages when mode changes or modal opens
    if (isOpen) {
      setMessages([
        { 
          role: "assistant", 
          content: mode === "vpn-troubleshooting" 
            ? "I'm WISP. I can solve VPN setup errors that ur dumb ass can't. Describe the issue or upload a screenshot."
            : "I'm WISP. What do you want?" 
        }
      ]);
      setUploadedImage(null);
      setInputValue("");
    }
  }, [isOpen, mode]);

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
      fileInputRef.current.value = "";
    }
  };

  const handleSend = async () => {
    if ((!inputValue.trim() && !uploadedImage) || isLoading) return;

    const userMessage = inputValue.trim() || (uploadedImage ? "I uploaded a screenshot of the error" : "");
    setInputValue("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    if (mode === "vpn-troubleshooting") {
      // Call Gemini API for VPN troubleshooting
      try {
        const response = await fetch("/api/vpn/gemini", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "diagnose-error",
            errorText: userMessage,
            os: vpnContext?.osInfo?.name,
            command: vpnContext?.commandData?.command,
            hasImage: !!uploadedImage,
          }),
        });

        if (!response.ok) throw new Error("Failed to diagnose error");

        const diagnosis = await response.json();
        
        const assistantMessage = `**Diagnosis:** ${diagnosis.diagnosis}

**Solution:**
${diagnosis.solution}

${diagnosis.alternativeCommand ? `**Try this command instead:**
\`\`\`
${diagnosis.alternativeCommand}
\`\`\`` : ""}

**Common Cause:** ${diagnosis.commonCause}

**Prevention Tip:** ${diagnosis.preventionTip}`;

        setMessages(prev => [...prev, { role: "assistant", content: assistantMessage }]);
        setUploadedImage(null);
      } catch (error) {
        console.error("Error diagnosing:", error);
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I encountered an error while analyzing your problem. Please try again or consult the manual installation guide.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Placeholder for future RAG API call (general IIIT knowledge)
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { 
            role: "assistant", 
            content: "I'm currently in development mode. Once integrated with the institute's internal files, I'll be able to answer your questions!" 
          }
        ]);
        setIsLoading(false);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-black border-2 border-green-500 rounded-lg w-full max-w-2xl h-[600px] flex flex-col shadow-2xl shadow-green-500/20 animate-fade-in pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-green-500/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <path
                    d="M 100 30 C 60 30, 40 50, 40 90 L 40 150 C 40 155, 45 160, 50 160 L 50 145 C 50 140, 55 135, 60 135 C 65 135, 70 140, 70 145 L 70 160 C 70 165, 75 170, 80 170 L 80 150 C 80 145, 85 140, 90 140 C 95 140, 100 145, 100 150 L 100 170 C 100 175, 105 180, 110 180 L 110 150 C 110 145, 115 140, 120 140 C 125 140, 130 145, 130 150 L 130 170 C 130 175, 135 170, 140 170 L 140 145 C 140 140, 145 135, 150 135 C 155 135, 160 140, 160 145 L 160 160 C 160 155, 160 150, 160 150 L 160 90 C 160 50, 140 30, 100 30 Z"
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="6"
                  />
                  <circle cx="75" cy="75" r="12" fill="#4ade80" />
                  <circle cx="125" cy="75" r="12" fill="#4ade80" />
                </svg>
              </div>
              <h2 className="text-green-500 font-bold text-xl">WISP AI</h2>
            </div>
            <button
              onClick={onClose}
              className="text-green-500 hover:text-green-400 transition-colors text-2xl font-bold"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === "user"
                      ? "bg-green-500/20 text-green-100 border border-green-500/30"
                      : "bg-gray-900 text-gray-100 border border-green-500/20"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-900 text-gray-100 border border-green-500/20 rounded-lg p-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-green-500/30">
            {/* Image upload preview (VPN mode only) */}
            {mode === "vpn-troubleshooting" && uploadedImage && (
              <div className="mb-3 relative inline-block">
                <img
                  src={uploadedImage}
                  alt="Error screenshot"
                  className="max-h-32 border border-green-500/30 rounded"
                />
                <button
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 p-1 rounded-full"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            )}

            <div className="flex gap-2">
              {/* Image upload button (VPN mode only) */}
              {mode === "vpn-troubleshooting" && (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-gray-900 border border-green-500/30 hover:border-green-500 text-green-400 p-2 rounded-lg transition-colors"
                    title="Upload screenshot"
                  >
                    <Upload className="w-5 h-5" />
                  </button>
                </>
              )}

              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={mode === "vpn-troubleshooting" ? "Describe the error or upload screenshot..." : "Disturb me and u will see me in ur evals :P"}
                className="flex-1 bg-gray-900 text-gray-100 border border-green-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-green-500 placeholder-gray-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || (!inputValue.trim() && !uploadedImage)}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-black font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
