"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Press_Start_2P, Space_Mono } from "next/font/google";

const pressStart2P = Press_Start_2P({
    weight: "400",
    subsets: ["latin"],
    variable: "--font-press-start",
});

const spaceMono = Space_Mono({
    weight: ["400", "700"],
    subsets: ["latin"],
    variable: "--font-space-mono",
});

export default function HackIIITCountdown() {
    const [timeLeft, setTimeLeft] = useState("--:--:--");
    const [isFinished, setIsFinished] = useState(false);
    const [timerColor, setTimerColor] = useState("#ffffff");

    useEffect(() => {
        // Target: 5 PM on 25 Jan 2026
        const target = new Date("2026-01-25T17:00:00+05:30").getTime();

        const updateTimer = () => {
            const now = new Date().getTime();
            const diff = target - now;

            if (diff <= 0) {
                setIsFinished(true);
                setTimeLeft("00:00:00");
                setTimerColor("#ea2264"); // Final red/pink color
            } else {
                const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((diff % (1000 * 60)) / 1000);

                // Pad with zeros for mono alignment
                const hStr = h < 10 ? `0${h}` : h;
                const mStr = m < 10 ? `0${m}` : m;
                const sStr = s < 10 ? `0${s}` : s;

                setTimeLeft(`${hStr}:${mStr}:${sStr}`);

                // Dynamic Color Logic: White -> Red as time approaches
                // Start transitioning 3 hours before
                const threeHours = 3 * 60 * 60 * 1000;
                if (diff > threeHours) {
                    setTimerColor("#ffffff");
                } else {
                    // Calculate ratio (0 = now/end, 1 = 3 hours away)
                    const ratio = Math.max(0, diff / threeHours);

                    // Interpolate between White (255, 255, 255) and Redish Pink (255, 60, 100)
                    // Actually, let's go towards a vibrant Red-Orange
                    // White: 255, 255, 255
                    // Target: 255, 50, 50 (Red)

                    const g = Math.floor(50 + (205 * ratio)); // 50 at end, 255 at start
                    const b = Math.floor(50 + (205 * ratio)); // 50 at end, 255 at start

                    setTimerColor(`rgb(255, ${g}, ${b})`);
                }
            }
        };

        updateTimer(); // Initial call
        const timerId = setInterval(updateTimer, 1000);

        return () => clearInterval(timerId);
    }, []);

    return (
        <div className={`countdown-container ${pressStart2P.variable} ${spaceMono.variable}`}>
            <div className="grid-overlay" />
            <div className="ambient-glow" />

            <main className="main-content">
                <h1 className="hackiiit-title">HACKIIIT 2026</h1>

                <div className="timer-text" style={{ color: timerColor }}>
                    {isFinished ? "FINISHED" : timeLeft}
                </div>

                <div className="logos">
                    <div className="logo-wrapper">
                        <Image
                            src="/hackiiit/OSDG-logo.png"
                            alt="OSDG Logo"
                            width={120}
                            height={60}
                            className="logo-img"
                        />
                    </div>
                    <div className="logo-wrapper">
                        <Image
                            src="/hackiiit/jane_street_logo.png"
                            alt="Jane Street Logo"
                            width={120}
                            height={60}
                            className="logo-img"
                        />
                    </div>
                </div>
            </main>

            <style jsx global>{`
        :root {
          --black: #000000;
          --blue: #0d1164;
          --purple: #640d5f;
          --pink: #ea2264;
          --peach: #f78d60;
          --glass: rgba(255, 255, 255, 0.03);
          --border: rgba(255, 255, 255, 0.1);
        }

        html, body {
          font-family: var(--font-press-start);
          background: var(--black);
          color: #fff;
          margin: 0;
          padding: 0;
          overflow: hidden;
          height: 100%;
          width: 100%;
        }
        
        .countdown-container {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            width: 100%;
            position: relative;
        }

        .main-content {
            z-index: 10;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 20px;
        }

        .hackiiit-title {
          font-family: var(--font-press-start);
          font-size: clamp(2rem, 8vw, 5rem);
          color: #fff;
          text-shadow: 4px 4px var(--purple);
          margin: 0;
          letter-spacing: -2px;
          margin-bottom: 20px;
        }

        .timer-text {
          font-family: var(--font-press-start);

          font-size: clamp(3rem, 12vw, 8rem);
          font-weight: bold;
          line-height: 1;
          transition: color 1s linear, text-shadow 1s linear;
        }
        
        .logos {
            display: flex;
            gap: 40px;
            align-items: center;
            justify-content: center;
            margin-top: 60px;
        }

        .logo-wrapper {
             transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
             background: rgba(255, 255, 255, 0.05);
             padding: 15px;
             border-radius: 16px;
             border: 1px solid var(--border);
             backdrop-filter: blur(5px);
       }
        
       .logo-wrapper:hover {
          transform: scale(1.05) translateY(-5px);
          border-color: var(--pink);
          background: rgba(255, 255, 255, 0.1);
          box-shadow: 0 10px 30px rgba(234, 34, 100, 0.2);
       }

       .logo-img {
          height: 40px; 
          width: auto;
          object-fit: contain;
          filter: brightness(0) invert(1);
          opacity: 0.8;
          transition: 0.3s;
       }

       .logo-wrapper:hover .logo-img {
          filter: brightness(1) invert(0);
          opacity: 1;
       }

       .grid-overlay {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(100, 13, 95, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100, 13, 95, 0.15) 1px, transparent 1px);
          background-size: 50px 50px;
          z-index: 0;
          pointer-events: none;
        }

        .ambient-glow {
          position: fixed;
          width: 100vmax;
          height: 100vmax;
          background: radial-gradient(
            circle,
            rgba(199, 27, 27, 0.4) 0%,
            transparent 90%
          );
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 1;
          animation: pulse 4s infinite alternate;
        }

        @keyframes pulse {
            0% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
        }

        @media (max-width: 768px) {
            .
            .logos {
                gap: 20px;
                margin-top: 40px;
            }
            .logo-img {
                height: 30px;
            }
            .logo-wrapper {
                padding: 10px;
            }
            .hackiiit-title {
                margin-bottom: 10px;
            }
        }
      `}</style>
        </div>
    );
}
