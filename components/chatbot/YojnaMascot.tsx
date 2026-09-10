'use client';

import React from 'react';

interface MascotProps {
  className?: string;
  size?: number;
}

export function YojnaMascot({ className = 'w-full h-full', size = 100 }: MascotProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Yojna Setu Mascot"
    >
      <defs>
        {/* Background gradient */}
        <radialGradient id="bgGrad" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#255bb5" />
          <stop offset="70%" stopColor="#1a3d82" />
          <stop offset="100%" stopColor="#11295e" />
        </radialGradient>

        {/* Golden Sun Crown Gradient */}
        <linearGradient id="sunGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="60%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>

        {/* Turban Orange/Red Gradient */}
        <linearGradient id="turbanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="40%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>

        {/* Face Gradient for 3D depth */}
        <radialGradient id="faceGrad" cx="46%" cy="42%" r="58%">
          <stop offset="0%" stopColor="#fff5eb" />
          <stop offset="70%" stopColor="#fed7aa" />
          <stop offset="100%" stopColor="#fbcfe8" />
        </radialGradient>

        {/* Scarf Green Gradient */}
        <linearGradient id="greenScarf" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>

        {/* Shadow filter */}
        <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* 1. Deep Blue Circular Base */}
      <circle cx="50" cy="50" r="49" fill="url(#bgGrad)" />

      {/* 2. Golden Sun-Ray Crown Points (Radiating like in reference image) */}
      <g id="sunburst-crown" filter="url(#softShadow)">
        {/* Point 1 (Top Center) */}
        <polygon points="50,11 44,24 56,24" fill="url(#sunGrad)" />
        {/* Point 2 (Top Left 1) */}
        <polygon points="37,16 34,28 45,26" fill="url(#sunGrad)" />
        {/* Point 3 (Top Left 2) */}
        <polygon points="26,24 26,37 36,32" fill="url(#sunGrad)" />
        {/* Point 4 (Mid Left 3) */}
        <polygon points="19,37 22,48 31,41" fill="url(#sunGrad)" />
        {/* Point 5 (Top Right 1) */}
        <polygon points="63,16 55,26 66,28" fill="url(#sunGrad)" />
        {/* Point 6 (Top Right 2) */}
        <polygon points="74,24 64,32 74,37" fill="url(#sunGrad)" />
        {/* Point 7 (Mid Right 3) */}
        <polygon points="81,37 69,41 78,48" fill="url(#sunGrad)" />
      </g>

      {/* 3. Outer Orange/Red Headdress Band */}
      <path
        d="M 24 54 C 23 30 77 30 76 54 C 76 68 70 76 67 78 C 50 82 50 82 33 78 C 30 76 24 68 24 54 Z"
        fill="url(#turbanGrad)"
        filter="url(#softShadow)"
      />

      {/* 4. Golden Inner Headdress Trim Line */}
      <path
        d="M 28 52 C 28 35 72 35 72 52 C 72 63 68 70 65 73 C 50 77 50 77 35 73 C 32 70 28 63 28 52 Z"
        fill="#fbbf24"
      />

      {/* 5. Decorative Headband Pattern with Red/Gold Dots */}
      <path
        d="M 30 50 C 30 38 70 38 70 50"
        stroke="#b91c1c"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* 6. Cute 3D Round Face */}
      <ellipse cx="50" cy="54" rx="19" ry="17.5" fill="url(#faceGrad)" />

      {/* 7. Rosy Cheeks */}
      <ellipse cx="37" cy="58" rx="3.5" ry="2.2" fill="#fb7185" opacity="0.45" />
      <ellipse cx="63" cy="58" rx="3.5" ry="2.2" fill="#fb7185" opacity="0.45" />

      {/* 8. Cheerful Arched Eyebrows */}
      <path
        d="M 39 44 C 41 42 45 43 46 45"
        stroke="#78350f"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M 61 44 C 59 42 55 43 54 45"
        stroke="#78350f"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* 9. Big Joyful Expressive Dark Eyes */}
      {/* Left Eye */}
      <ellipse cx="43" cy="50" rx="3.4" ry="4.2" fill="#1e1b4b" />
      <circle cx="41.8" cy="48.5" r="1.4" fill="#ffffff" />
      <circle cx="44.2" cy="51.8" r="0.6" fill="#ffffff" />

      {/* Right Eye */}
      <ellipse cx="57" cy="50" rx="3.4" ry="4.2" fill="#1e1b4b" />
      <circle cx="55.8" cy="48.5" r="1.4" fill="#ffffff" />
      <circle cx="58.2" cy="51.8" r="0.6" fill="#ffffff" />

      {/* 10. Small Cute Nose */}
      <path
        d="M 49 53 C 49 55 51 55 51 53"
        stroke="#d97706"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* 11. Big Warm Open Smile */}
      <path
        d="M 42.5 57 C 44 65 56 65 57.5 57 Z"
        fill="#991b1b"
      />
      {/* Cute tongue */}
      <path
        d="M 46 61 C 48 64 52 64 54 61 C 52 60 48 60 46 61 Z"
        fill="#f43f5e"
      />

      {/* 12. Indian Tricolor Collar / Scarf at bottom */}
      {/* Saffron/Red Left side */}
      <path
        d="M 33 74 C 36 78 44 80 47 79 L 45 84 C 37 84 31 80 29 76 Z"
        fill="#ea580c"
      />
      {/* White center collar */}
      <path
        d="M 44 77 C 48 78 52 78 56 77 L 55 83 C 51 84 49 84 45 83 Z"
        fill="#ffffff"
      />
      {/* Green Right side */}
      <path
        d="M 53 79 C 56 80 64 78 67 74 L 71 76 C 69 80 63 84 55 84 Z"
        fill="url(#greenScarf)"
      />
    </svg>
  );
}
