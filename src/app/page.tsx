"use client";
import React, { useEffect, useState, useRef } from "react";

const FULL_FORM_LINES = [
  { letter: "O", word: "pen" },
  { letter: "S", word: "ource" },
  { letter: "D", word: "evelopers" },
  { letter: "G", word: "roup" },
];

const OSDG_TEXT = "OSDG";

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);
  const [animationPhase, setAnimationPhase] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [expandedText, setExpandedText] = useState<string[]>(["", "", "", ""]);
  const [currentExpandingIndex, setCurrentExpandingIndex] = useState(0);
  const [showSplit, setShowSplit] = useState(false);
  const [typedCommand, setTypedCommand] = useState("");
  const [showAbout, setShowAbout] = useState(false);
  const [consoleVisible, setConsoleVisible] = useState(false);
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [activeLine, setActiveLine] = useState(-1);
  const [hasAnimated, setHasAnimated] = useState(false);
  const command = "osdg@iiith:~$ sudo man osdg";
  const aboutRef = useRef<HTMLDivElement>(null);

  const aboutLines = [
    "",
    "ABOUT",
    "    OSDG - Open Source Developers Group, IIIT Hyderabad",
    "-------------------------------------------------------------------",
    "",
    "DESCRIPTION",
    "    The Open Source Developers Group (OSDG) is the premier club at IIIT Hyderabad.",
    " ",
    "    And as a distinguished arm of the Center for Open Source, IIIT-H, OSDG empowers passionate contributors for mastering open-source development.",
    " ",
    "    Through competitive programs like Google Summer of Code, impactful projects, and dynamic events, we set the benchmark for open-source excellence.",
    "-------------------------------------------------------------------"
  ];

  // Main animation sequence
  useEffect(() => {
    let typeInterval: NodeJS.Timeout;
    let expandCharInterval: NodeJS.Timeout;

    // Phase 0: Blank screen (1.2 seconds)
    // Phase 0.5: Pre-expand frame for corners (start at 1s)
    const preCornerTimer = setTimeout(() => {
      setAnimationPhase(0.5); // Frame prepares for corners
    }, 1000);

    // Phase 1: Corners forming (appears in pre-expanded space)
    const cornersTimer = setTimeout(() => {
      setAnimationPhase(1);
    }, 2200);

    // Phase 1.5: Expand frame for OSDG text (before typing)
    const preTextTimer = setTimeout(() => {
      setAnimationPhase(1.5); // Frame expands for OSDG
    }, 3000);

    // Phase 2: Type OSDG (character by character)
    const typingTimer = setTimeout(() => {
      setAnimationPhase(2);
      let charIndex = 0;
      typeInterval = setInterval(() => {
        if (charIndex <= OSDG_TEXT.length) {
          setTypedText(OSDG_TEXT.slice(0, charIndex));
          charIndex++;
        } else {
          clearInterval(typeInterval);
          // First expand the frame for full form
          setTimeout(() => {
            setAnimationPhase(2.5); // Trigger frame expansion to final size
            // Then show split transition
            setTimeout(() => {
              setShowSplit(true);
              // After split animation, start word expansion
              setTimeout(() => {
                setAnimationPhase(3);
                // Start typing each word character by character
                let wordIndex = 0;
                let charIndex = 0;
                
                const typeNextChar = () => {
              if (wordIndex < FULL_FORM_LINES.length) {
                const currentWord = FULL_FORM_LINES[wordIndex].word;
                
                if (charIndex <= currentWord.length) {
                  setExpandedText((prev) => {
                    const newText = [...prev];
                    newText[wordIndex] = currentWord.slice(0, charIndex);
                    return newText;
                  });
                  charIndex++;
                } else {
                  // Move to next word
                  wordIndex++;
                  charIndex = 0;
                  if (wordIndex >= FULL_FORM_LINES.length) {
                    clearInterval(expandCharInterval);
                    return;
                  }
                }
              }
            };
            
            expandCharInterval = setInterval(typeNextChar, 50);
              }, 1000); // Time for split animation
            }, 1200); // Frame expansion time (smooth & elegant)
          }, 1200); // Pause before frame expansion
        }
      }, 250);
    }, 4200);

    return () => {
      clearTimeout(preCornerTimer);
      clearTimeout(cornersTimer);
      clearTimeout(preTextTimer);
      clearTimeout(typingTimer);
      if (typeInterval) clearInterval(typeInterval);
      if (expandCharInterval) clearInterval(expandCharInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!aboutRef.current || hasAnimated) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setConsoleVisible(true);
            setHasAnimated(true);
            let i = 0;
            const interval = setInterval(() => {
              setTypedCommand(command.slice(0, i + 1));
              i++;
              if (i === command.length) {
                clearInterval(interval);
                setTimeout(() => {
                  let lineIndex = 0;
                  const lineInterval = setInterval(() => {
                    setTypedLines((prev) => [...prev, aboutLines[lineIndex]]);
                    setActiveLine(lineIndex);
                    lineIndex++;
                    if (lineIndex === aboutLines.length) {
                      clearInterval(lineInterval);
                      setShowAbout(true);
                      setActiveLine(-1);
                    }
                  }, 600);
                }, 600);
              }
            }, 100);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(aboutRef.current);
    return () => observer.disconnect();
  }, [hasAnimated, command, aboutLines]);

  return (
    <div className="min-h-screen bg-black bg-gradient-to-b from-black to-blue-900/30 text-white font-sans scroll-smooth">
      {/* Hero Section */}
      <section className="flex flex-col justify-center items-center min-h-screen text-center relative overflow-hidden px-4">
        <div className="flex flex-col items-center justify-center">
          {/* Tech Frame Animation Container */}
          <div className="relative inline-block">
            {/* Top Left Corner SVG */}
            <svg
              className={`absolute transition-all duration-[1200ms] ease-in-out ${
                animationPhase >= 0.5 ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                top: animationPhase >= 2.5 ? '-40px' : animationPhase >= 1.5 ? '-15px' : '-5px',
                left: animationPhase >= 2.5 ? '-40px' : animationPhase >= 1.5 ? '-15px' : '-5px',
                width: '80px',
                height: '80px',
              }}
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 20,0 L 0,0 L 0,20 L 0,100 L 2,100 L 2,2 L 100,2 L 100,0 L 20,0 Z"
                fill="#22d3ee"
                className="transition-all duration-700"
              />
              <rect x="0" y="25" width="2" height="8" fill="#22d3ee" opacity="0.6" />
              <rect x="0" y="40" width="2" height="5" fill="#22d3ee" opacity="0.4" />
              <rect x="0" y="50" width="2" height="3" fill="#22d3ee" opacity="0.3" />
              <path d="M 8,8 L 8,92" stroke="#22d3ee" strokeWidth="1" opacity="0.3" />
              <path d="M 8,8 L 92,8" stroke="#22d3ee" strokeWidth="1" opacity="0.3" />
            </svg>

            {/* Bottom Right Corner SVG */}
            <svg
              className={`absolute transition-all duration-[1200ms] ease-in-out ${
                animationPhase >= 0.5 ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                bottom: animationPhase >= 2.5 ? '-40px' : animationPhase >= 1.5 ? '-15px' : '-5px',
                right: animationPhase >= 2.5 ? '-40px' : animationPhase >= 1.5 ? '-15px' : '-5px',
                width: '80px',
                height: '80px',
              }}
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 80,100 L 100,100 L 100,80 L 100,0 L 98,0 L 98,98 L 0,98 L 0,100 L 80,100 Z"
                fill="#22d3ee"
                className="transition-all duration-700"
              />
              <rect x="98" y="65" width="2" height="8" fill="#22d3ee" opacity="0.6" />
              <rect x="98" y="50" width="2" height="5" fill="#22d3ee" opacity="0.4" />
              <rect x="98" y="40" width="2" height="3" fill="#22d3ee" opacity="0.3" />
              <path d="M 92,92 L 92,8" stroke="#22d3ee" strokeWidth="1" opacity="0.3" />
              <path d="M 92,92 L 8,92" stroke="#22d3ee" strokeWidth="1" opacity="0.3" />
            </svg>

            {/* Main Title Container */}
            <div
              className={`font-bold font-oxanium transition-all duration-[1200ms] ease-in-out ${
                animationPhase >= 2 ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                padding: animationPhase >= 2.5 ? '3rem 4rem' : animationPhase >= 1.5 ? '2rem 3rem' : '1.5rem 2rem',
              }}
            >
              {/* Phase 2: Type out OSDG */}
              {animationPhase >= 2 && animationPhase < 3 && !showSplit && (
                <div 
                  className="text-cyan-400 font-bold tracking-wider"
                  style={{
                    fontSize: 'clamp(3.5rem, 10vw, 7rem)',
                  }}
                >
                  {typedText}
                </div>
              )}

              {/* Phase 2.5: Split OSDG into two lines with smooth transition */}
              {showSplit && animationPhase < 3 && (
                <div className="flex flex-col items-center justify-center gap-0.1 transition-all duration-700 ease-out">
                  <div 
                    className="text-cyan-400 font-bold tracking-wider transition-all duration-700"
                    style={{
                      fontSize: 'clamp(3.5rem, 10vw, 7rem)',
                    }}
                  >
                    OS
                  </div>
                  <div 
                    className="text-cyan-400 font-bold tracking-wider transition-all duration-700"
                    style={{
                      fontSize: 'clamp(3.5rem, 10vw, 7rem)',
                    }}
                  >
                    DG
                  </div>
                </div>
              )}
              
              {/* Phase 3: Expand each letter inline to full word */}
              {animationPhase >= 3 && (
                <div className="flex flex-col items-center justify-center gap-0.1">
                  {/* First Line: Open Source */}
                  <div className="flex items-baseline justify-center">
                    {FULL_FORM_LINES.slice(0, 2).map((line, idx) => (
                      <div
                        key={line.letter}
                        className="inline-flex items-baseline"
                        style={{
                          fontSize: 'clamp(3.5rem, 10vw, 7rem)',
                        }}
                      >
                        <span className="text-cyan-400 font-bold">{line.letter}</span>
                        <span 
                          className="text-white transition-all duration-300"
                          style={{
                            fontSize: 'clamp(3.5rem, 10vw, 7rem)',
                            lineHeight: '0.1',
                          }}
                        >
                          {expandedText[idx]}
                        </span>
                        {idx === 0 && (
                          <span className="mx-3 md:mx-4"></span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Second Line: Developers Group */}
                  <div className="flex items-baseline justify-center mt-[-40px]">
                    {FULL_FORM_LINES.slice(2, 4).map((line, idx) => (
                      <div
                        key={line.letter}
                        className="inline-flex items-baseline"
                        style={{
                          fontSize: 'clamp(3.5rem, 10vw, 7rem)',
                        }}
                      >
                        <span className="text-cyan-400 font-bold">{line.letter}</span>
                        <span 
                          className="text-white transition-all duration-300"
                          style={{
                            fontSize: 'clamp(3.5rem, 10vw, 7rem)',
                          }}
                        >
                          {expandedText[idx + 2]}
                        </span>
                        {idx === 0 && (
                          <span className="mx-3 md:mx-4"></span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tagline - Show after animation completes */}
          {animationPhase >= 3 && expandedText.length === 4 && (
            <p className="mt-8 md:mt-12 text-base md:text-xl text-gray-400 max-w-2xl px-4 transition-all duration-1000 opacity-0 animate-fadeIn">
              Where elite minds meet open source — to build, disrupt, and lead the future - openly.
            </p>
          )}
        </div>
      </section>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
          animation-delay: 0.5s;
        }
      `}</style>

      {/* About Section */}
      <section
        id="about"
        ref={aboutRef}
        className="flex justify-center items-center min-h-[90vh] py-20 text-green-400 font-mono p-6"
      >
        <div
          className={`max-w-3xl w-full bg-[#000000] rounded-2xl shadow-lg p-6 transform transition-all duration-700 ease-out ${
            consoleVisible ? "scale-100 opacity-100" : "scale-75 opacity-0"
          }`}
        >
          {/* Command Line */}
          <p className="text-lg">
            {typedCommand}
            {!showAbout && <span className="animate-pulse">|</span>}
          </p>

          {/* Fake sudo password prompt */}
          {typedCommand === command && !showAbout && (
            <p className="mt-2">[sudo] password for osdg: ••••••••</p>
          )}

          {/* Output like a man page typed line by line */}
          {typedLines.length > 0 && (
            <div className="mt-6 whitespace-pre-line text-gray-200">
              {typedLines.map((line, idx) => {
                const safeLine = line || "";
                const isKnownHeader = safeLine.trim() === "NAME" || safeLine.trim() === "DESCRIPTION";
                const isSectionHeader = 
                  (safeLine.trim() !== "" && safeLine === safeLine.toUpperCase()) || isKnownHeader;
                const isSeparator = /^[-]+$/.test(safeLine.trim());

                let lineClass = "ml-4 mt-2 text-gray-200";

                if (safeLine.trim() === "") {
                  lineClass = "my-6";
                } else if (isSectionHeader) {
                  lineClass = "font-bold mt-4 text-cyan-400 uppercase";
                } else if (isSeparator) {
                  lineClass = "mt-2 text-gray-500";
                }

                return (
                  <p key={idx} className={lineClass}>
                    {safeLine}
                    {idx === activeLine && <span className="animate-pulse">|</span>}
                  </p>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}