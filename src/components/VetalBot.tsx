"use client";

import React, { useState } from "react";
import VetalGhost from "./VetalGhost";
import ChatModal from "./ChatModal";

export default function VetalBot() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {/* Vetal Bot Button */}
      <div className="fixed bottom-32 right-5 z-40 animate-crawl-in">
        <div
          onClick={() => setIsChatOpen(true)}
          className="w-16 h-16 cursor-pointer hover:scale-110 transition-transform duration-300 animate-float"
        >
          <VetalGhost className="w-full h-full drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
        </div>
      </div>

      {/* Chat Modal */}
      <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}
