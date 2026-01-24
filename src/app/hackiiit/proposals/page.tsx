"use client"
import React, { useEffect, useState, useRef, useCallback } from "react"

const API_URL = "/api/proposals";

export default function ProposalsPage() {
  const [teamName, setTeamName] = useState("")
  const [email, setEmail] = useState("")
  const [proposal, setProposal] = useState("")
  
  const [status, setStatus] = useState<string | null>(null) // null = New/Not Found
  const [comment, setComment] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [firstLoadDone, setFirstLoadDone] = useState(false)

  // Visual Refs
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  // Mouse effect
  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    const glow = glowRef.current;
    if (!cursor || !follower || !glow) return;

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = mouseX + "px";
      cursor.style.top = mouseY + "px";
      glow.style.left = mouseX + "px";
      glow.style.top = mouseY + "px";
    };

    const animateFollower = () => {
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;
      follower.style.left = followerX + "px";
      follower.style.top = followerY + "px";
      requestAnimationFrame(animateFollower);
    };

    window.addEventListener("mousemove", handleMouseMove);
    requestAnimationFrame(animateFollower);

    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const fetchStatus = useCallback(async (isPolling = false) => {
    if (!teamName || !email) return;
    
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: 'check',
          teamName: teamName.trim(),
          email: email.trim()
        })
      });
      
      const data = await res.json();
      
      if (res.ok && !data.error) {
        // Found existing proposal
        setStatus(data.status);
        setComment(data.comment || "");
        
        // Update proposal text ONLY if:
        // 1. We are NOT polling (initial load for this team/email combo)
        // 2. OR the proposal is locked (not rejected), so we always show latest status/content
        if (!isPolling || (data.status && data.status.toLowerCase() !== 'rejected')) {
             setProposal(data.proposal || "");
        }
        
        if (!isPolling) setMessage("");
      } else {
        // Not found or error
        if (data.error && data.error.includes("No proposal found")) {
            setStatus(null); // It's a new proposal
            setComment("");
            // Do NOT clear proposal here, user might be typing a new one
        }
        if (!isPolling && !data.error?.includes("No proposal found")) {
            // Real error
             console.error(data.error);
        }
      }
    } catch (err) {
      console.error("Fetch error", err);
    }
  }, [teamName, email]);

  // Initial Check when Team/Email changes (Debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
        if (teamName && email) {
            setLoading(true);
            fetchStatus(false).finally(() => {
                setLoading(false);
                setFirstLoadDone(true);
            });
        }
    }, 800);
    return () => clearTimeout(timer);
  }, [teamName, email, fetchStatus]);

  // Polling every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
        if (teamName && email) {
            fetchStatus(true);
        }
    }, 5000);
    return () => clearInterval(interval);
  }, [teamName, email, fetchStatus]);


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: 'submit',
          teamName,
          pocEmail: email,
          proposal
        })
      });
      const data = await res.json();
      if (res.ok && !data.error) {
        setMessage(data.message || "Proposal submitted successfully!");
        // Refresh status immediately to lock the form if needed
        fetchStatus(false);
      } else {
        setMessage(data.error || "Submission failed. Please try again.");
      }
    } catch (err: any) {
      setMessage("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const isLocked = status !== null && status.toLowerCase() !== 'rejected';
  
  return (
    <div className="min-h-screen relative overflow-hidden text-white selection:bg-[#ea2264] selection:text-white pb-20">
      {/* Background & Effects */}
      <div className="fixed inset-0 bg-black z-[-1]" />
      <div className="grid-overlay fixed inset-0 z-0 pointer-events-none" />
      <div id="cursor" ref={cursorRef} className="hidden md:block" />
      <div id="cursor-follower" ref={followerRef} className="hidden md:block" />
      <div ref={glowRef} className="fixed w-[600px] h-[600px] rounded-full bg-[#0d1164] opacity-20 blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0" />

      {/* Styles */}
      <style jsx global>{`
        :root {
          --black: #000000;
          --blue: #0d1164;
          --pink: #ea2264;
          --peach: #f78d60;
          --glass: rgba(255, 255, 255, 0.03);
          --border: rgba(255, 255, 255, 0.1);
        }
        body { font-family: "Plus Jakarta Sans", sans-serif; background: var(--black); }
        .grid-overlay {
          background-image:
            linear-gradient(rgba(100, 13, 95, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100, 13, 95, 0.15) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        #cursor { width: 8px; height: 8px; background: var(--peach); border-radius: 50%; position: fixed; pointer-events: none; z-index: 9999; }
        #cursor-follower { width: 30px; height: 30px; border: 1px solid var(--pink); border-radius: 50%; position: fixed; pointer-events: none; z-index: 9998; transition: transform 0.1s; }
        
        .glass-input {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          color: white;
          transition: all 0.3s ease;
        }
        .glass-input:focus {
          outline: none;
          border-color: var(--pink);
          box-shadow: 0 0 15px rgba(234, 34, 100, 0.3);
          background: rgba(255, 255, 255, 0.1);
        }
        .glass-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: rgba(0,0,0,0.3);
        }
      `}</style>
      
      <div className="relative z-10 container mx-auto px-4 py-20 max-w-2xl">
         <h1 className="text-4xl md:text-6xl font-bold mb-2 tracking-tight text-center">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ea2264] to-[#f78d60]">
               HackIIIT 2026
            </span> Proposals
         </h1>
         <p className="text-center text-gray-400 mb-12">
            Get. Set. Go.
         </p>

         <div className="bg-[#0f0f13] border border-white/10 p-8 rounded-2xl shadow-2xl backdrop-blur-xl transition-all duration-500">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Identification Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Team Name</label>
                        <input
                            required
                            type="text"
                            placeholder="as submitted during registration"
                            value={teamName}
                            onChange={e => setTeamName(e.target.value)}
                            className="glass-input w-full p-3 rounded-lg"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider">POC Email</label>
                        <input
                            required
                            type="email"
                            placeholder="POC Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="glass-input w-full p-3 rounded-lg"
                        />
                    </div>
                </div>

                {/* Status Banner */}
                {status && (
                    <div className="flex flex-col gap-2 animate-fade-in">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold tracking-tight text-white mb-2">Proposal Status</h3>
                            <span className={`px-3 py-1 rounded text-sm font-semibold uppercase ${
                                status.toLowerCase() === 'accepted' ? 'text-green-400 bg-green-900/20 border border-green-500/20' :
                                status.toLowerCase() === 'rejected' ? 'text-red-400 bg-red-900/20 border border-red-500/20' :
                                'text-yellow-400 bg-yellow-900/20 border border-yellow-500/20'
                            }`}>
                                {status}
                            </span>
                        </div>
                        {comment && (
                             <div className="text-sm bg-white/5 p-3 rounded border border-white/10 text-gray-300">
                                {comment}
                             </div>
                        )}
                        {status.toLowerCase() === 'rejected' && (
                            <p className="text-xs text-red-400 mt-1">Re-submit below.</p>
                        )}
                    </div>
                )}

                {/* Proposal Text Area */}
                <div className="space-y-2 relative">
                    <label className="text-sm font-semibold text-gray-400 uppercase tracking-wider block">
                        Project Proposal
                    </label>
                    <textarea
                        required
                        rows={8}
                        disabled={isLocked}
                        placeholder={isLocked ? "Proposal submitted." : "Describe your project idea in detail..."}
                        value={proposal}
                        onChange={e => setProposal(e.target.value)}
                        className={`glass-input w-full p-3 rounded-lg resize-none ${isLocked ? 'text-gray-400' : ''}`}
                    />
                </div>

                {/* Submit Button */}
                {!isLocked && (
                    <button
                        type="submit"
                        disabled={loading || !teamName || !email}
                        className="w-full py-4 bg-gradient-to-r from-[#ea2264] to-[#f78d60] rounded-lg font-bold text-lg hover:shadow-[0_0_30px_rgba(234,34,100,0.5)] transition-shadow disabled:opacity-50 disabled:cursor-not-allowed text-white uppercase tracking-wide"
                    >
                        {loading ? "Processing..." : (status?.toLowerCase() === 'rejected' ? "Re-submit Proposal" : "Submit")}
                    </button>
                )}

                {/* Message Banner */}
                {message && (
                    <div className={`p-3 rounded-lg text-center text-sm ${
                        message.toLowerCase().includes("fail") || message.toLowerCase().includes("error") 
                        ? "bg-red-500/10 text-red-200 border border-red-500/20" 
                        : "bg-green-500/10 text-green-200 border border-green-500/20"
                    }`}>
                        {message}
                    </div>
                )}
            </form>
         </div>
      </div>
    </div>
  )
}
