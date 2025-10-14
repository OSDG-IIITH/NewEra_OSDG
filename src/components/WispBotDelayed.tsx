"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import WispGhost from "./WispGhost";
import ChatModal from "./ChatModal";

interface WispBotDelayedProps {
  mode?: "general" | "vpn-troubleshooting";
  vpnContext?: {
    osInfo?: { name: string; version?: string; architecture?: string } | null;
    commandData?: { command: string } | null;
    errorText?: string | null;
  };
  onOpenChat?: () => void;
  forceOpen?: boolean; // External control to force chat open
  onForceHandled?: () => void; // callback to inform parent that forceOpen was handled / should be cleared
}

export default function WispBotDelayed({ mode = "general", vpnContext, onOpenChat, forceOpen, onForceHandled }: WispBotDelayedProps) {
  const pathname = usePathname();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showBot, setShowBot] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Hide global WISP on VPN setup page (it has its own VPN-specific instance)
  const isVPNSetupPage = pathname === "/vpn-setup";
  const shouldHideGlobalBot = isVPNSetupPage && mode === "general";

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBot(true);
    }, 2200); // 2.2s to match socials tray collapse
    return () => clearTimeout(timer);
  }, []);

  // Handle external force open
  useEffect(() => {
    if (forceOpen && !isChatOpen) {
      setIsChatOpen(true);
      if (onOpenChat) onOpenChat();
      if (onForceHandled) onForceHandled();
    }
  }, [forceOpen, isChatOpen, onOpenChat, onForceHandled]);

  const handleOpenChat = () => {
    setIsChatOpen(true);
    if (onOpenChat) onOpenChat();
  };

  if (!showBot || shouldHideGlobalBot) return null;

  return (
    <>
      {/* WISP Bot Button + hover tray */}
      <div className="fixed bottom-32 right-5 z-30 animate-crawl-in">
        <div
          className="relative flex items-center"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          {/* Tray that opens to the left */}
          <div
            role="region"
            aria-hidden={!isHovering}
            className={`absolute right-20 bottom-4 flex items-center overflow-hidden wisp-tray z-50 ${isHovering ? 'w-64 pr-3 pointer-events-auto' : 'w-0 pr-0 pointer-events-none'}`}
          >
            <div className="w-full bg-black border-2 border-green-500 rounded-l-full py-2 pl-3 pr-3 drop-shadow-[0_0_18px_rgba(74,222,128,0.12)] flex items-center justify-start">
              <div className="text-green-300 text-xs leading-4 whitespace-normal break-words">
                {mode === "vpn-troubleshooting" 
                  ? "Having VPN setup issues? What do you think I am here for?!"
                  : "Huh! You approaching me? I hold IIIT matter within."}
              </div>
            </div>
          </div>

          <div
            onClick={handleOpenChat}
            className="w-16 h-16 cursor-pointer hover:scale-110 transition-transform duration-300 animate-float"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleOpenChat();
              if (e.key === 'Escape') setIsHovering(false);
            }}
            onFocus={() => setIsHovering(true)}
            onBlur={() => setIsHovering(false)}
          >
            <WispGhost className="w-full h-full drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      <ChatModal 
        isOpen={isChatOpen} 
        onClose={() => {
          setIsChatOpen(false);
          if (onForceHandled) onForceHandled();
        }}
        mode={mode}
        vpnContext={vpnContext}
      />
    </>
  );
}
