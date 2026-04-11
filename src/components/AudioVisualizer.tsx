'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';

interface AudioVisualizerProps {
  src: string;
  title: string;
}

export default function AudioVisualizer({ src, title }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Audio Context and Nodes Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  const setupAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;

      if (audioRef.current) {
        const source = ctx.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(ctx.destination);
        sourceRef.current = source;
      }

      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
    }
  };

  const draw = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    const renderFrame = () => {
      animationRef.current = requestAnimationFrame(renderFrame);

      analyser.getByteFrequencyData(dataArray);

      // Clear canvas with transparent background
      ctx.clearRect(0, 0, width, height);

      const numDots = 120;
      const baseRadius = width * 0.25;

      for (let i = 0; i < numDots; i++) {
        // Map data to dot
        const value = dataArray[i % bufferLength];
        const percent = value / 255;
        
        // Calculate position based on a spherical/fibonacci distribution or simple circles
        const angle = (i / numDots) * Math.PI * 2;
        // Introduce some visual randomness based on frequency
        const offset = percent * (width * 0.15); 
        
        const r = baseRadius + offset + (Math.random() * 5);
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;

        // Alternate colors
        const isBlue = i % 3 === 0;
        ctx.fillStyle = isBlue ? 'rgba(34, 211, 238, 0.8)' : 'rgba(255, 255, 255, 0.7)'; // Cyan/White
        ctx.beginPath();
        const dotSize = 1.5 + (percent * 2);
        ctx.arc(x, y, dotSize, 0, 2 * Math.PI);
        ctx.fill();
      }
    };

    renderFrame();
  };

  const togglePlay = () => {
    setupAudio();

    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
        draw();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h4 className="text-white font-oxanium font-bold mb-4 text-center">{title}</h4>
      <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
        <canvas 
          ref={canvasRef} 
          width={300} 
          height={300} 
          className="absolute inset-0 w-full h-full"
        />
        
        <button 
          onClick={togglePlay}
          className="z-10 p-4 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:scale-105 transition-all duration-300 backdrop-blur-md"
        >
          {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
        </button>

        <audio 
          ref={audioRef} 
          src={src} 
          onEnded={() => setIsPlaying(false)}
          crossOrigin="anonymous"
        />
      </div>
    </div>
  );
}