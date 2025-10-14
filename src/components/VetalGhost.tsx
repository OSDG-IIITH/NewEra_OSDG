"use client";

import React from "react";

interface VetalGhostProps {
  className?: string;
  onClick?: () => void;
}

export default function VetalGhost({ className = "", onClick }: VetalGhostProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
      aria-label="Vetal AI"
    >
      {/* Ghost body outline - head and sides */}
      <path
        d="M 100 30 
           C 60 30, 40 50, 40 90
           L 40 145"
        fill="none"
        stroke="#4ade80"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 160 145
           L 160 90
           C 160 50, 140 30, 100 30"
        fill="none"
        stroke="#4ade80"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Left eye */}
      <circle cx="75" cy="75" r="12" fill="#4ade80" />

      {/* Right eye */}
      <circle cx="125" cy="75" r="12" fill="#4ade80" />

      {/* Bottom wavy legs - each with independent animation */}
      {/* Leg 1 */}
      <path
        d="M 40 145 L 40 160 Q 40 175, 48 175 L 48 155 Q 48 145, 55 145"
        fill="none"
        stroke="#4ade80"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <animate
          attributeName="d"
          dur="0.9s"
          repeatCount="indefinite"
          values="
            M 40 145 L 40 160 Q 40 175, 48 175 L 48 155 Q 48 145, 55 145;
            M 40 145 L 40 162 Q 40 177, 48 177 L 48 153 Q 48 143, 55 143;
            M 40 145 L 40 158 Q 40 173, 48 173 L 48 157 Q 48 147, 55 147;
            M 40 145 L 40 160 Q 40 175, 48 175 L 48 155 Q 48 145, 55 145"
        />
      </path>

      {/* Leg 2 */}
      <path
        d="M 55 145 Q 62 145, 62 155 L 62 180 Q 62 190, 72 190 L 72 160 Q 72 148, 80 148"
        fill="none"
        stroke="#4ade80"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <animate
          attributeName="d"
          dur="1.1s"
          repeatCount="indefinite"
          values="
            M 55 145 Q 62 145, 62 155 L 62 180 Q 62 190, 72 190 L 72 160 Q 72 148, 80 148;
            M 55 147 Q 62 147, 62 157 L 62 178 Q 62 188, 72 188 L 72 162 Q 72 150, 80 150;
            M 55 143 Q 62 143, 62 153 L 62 182 Q 62 192, 72 192 L 72 158 Q 72 146, 80 146;
            M 55 145 Q 62 145, 62 155 L 62 180 Q 62 190, 72 190 L 72 160 Q 72 148, 80 148"
        />
      </path>

      {/* Leg 3 - center (tallest) */}
      <path
        d="M 80 148 Q 88 148, 88 160 L 88 185 Q 88 195, 100 195 Q 112 195, 112 185 L 112 160 Q 112 148, 120 148"
        fill="none"
        stroke="#4ade80"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <animate
          attributeName="d"
          dur="0.8s"
          repeatCount="indefinite"
          values="
            M 80 148 Q 88 148, 88 160 L 88 185 Q 88 195, 100 195 Q 112 195, 112 185 L 112 160 Q 112 148, 120 148;
            M 80 150 Q 88 150, 88 162 L 88 183 Q 88 193, 100 193 Q 112 193, 112 183 L 112 162 Q 112 150, 120 150;
            M 80 146 Q 88 146, 88 158 L 88 187 Q 88 197, 100 197 Q 112 197, 112 187 L 112 158 Q 112 146, 120 146;
            M 80 148 Q 88 148, 88 160 L 88 185 Q 88 195, 100 195 Q 112 195, 112 185 L 112 160 Q 112 148, 120 148"
        />
      </path>

      {/* Leg 4 */}
      <path
        d="M 120 148 Q 128 148, 128 160 L 128 190 Q 128 200, 138 190 L 138 155 Q 138 145, 145 145"
        fill="none"
        stroke="#4ade80"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <animate
          attributeName="d"
          dur="1.05s"
          repeatCount="indefinite"
          values="
            M 120 148 Q 128 148, 128 160 L 128 190 Q 128 200, 138 190 L 138 155 Q 138 145, 145 145;
            M 120 150 Q 128 150, 128 162 L 128 188 Q 128 198, 138 188 L 138 157 Q 138 147, 145 147;
            M 120 146 Q 128 146, 128 158 L 128 192 Q 128 202, 138 192 L 138 153 Q 138 143, 145 143;
            M 120 148 Q 128 148, 128 160 L 128 190 Q 128 200, 138 190 L 138 155 Q 138 145, 145 145"
        />
      </path>

      {/* Leg 5 */}
      <path
        d="M 145 145 Q 152 145, 152 155 L 152 175 Q 152 185, 160 175 L 160 145"
        fill="none"
        stroke="#4ade80"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <animate
          attributeName="d"
          dur="0.95s"
          repeatCount="indefinite"
          values="
            M 145 145 Q 152 145, 152 155 L 152 175 Q 152 185, 160 175 L 160 145;
            M 145 147 Q 152 147, 152 157 L 152 173 Q 152 183, 160 173 L 160 145;
            M 145 143 Q 152 143, 152 153 L 152 177 Q 152 187, 160 177 L 160 145;
            M 145 145 Q 152 145, 152 155 L 152 175 Q 152 185, 160 175 L 160 145"
        />
      </path>
    </svg>
  );
}
