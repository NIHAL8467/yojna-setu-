import React from 'react';

interface YojnaSetuLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function YojnaSetuLogo({
  className = '',
  showText = true,
  size = 'md',
}: YojnaSetuLogoProps) {
  // Dimensional presets
  const sizeMap = {
    sm: { iconWidth: 36, iconHeight: 28, textClass: 'text-sm' },
    md: { iconWidth: 48, iconHeight: 38, textClass: 'text-base sm:text-lg' },
    lg: { iconWidth: 64, iconHeight: 50, textClass: 'text-xl sm:text-2xl' },
    xl: { iconWidth: 96, iconHeight: 75, textClass: 'text-2xl sm:text-3xl' },
  };

  const { iconWidth, iconHeight, textClass } = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* High-Fidelity SVG Emblem matching the uploaded Yojna Setu Artwork */}
      <svg
        width={iconWidth}
        height={iconHeight}
        viewBox="0 0 200 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
        aria-label="Yojna Setu Emblem"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="ys-orange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
          <linearGradient id="ys-green" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#15803D" />
          </linearGradient>
          <linearGradient id="ys-bridge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#004A8F" />
            <stop offset="50%" stopColor="#003366" />
            <stop offset="100%" stopColor="#002244" />
          </linearGradient>
          <linearGradient id="ys-coin" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>
          <linearGradient id="ys-river" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="50%" stopColor="#BAE6FD" />
            <stop offset="100%" stopColor="#E0F2FE" />
          </linearGradient>
          <filter id="ys-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* River Water Path at Bottom */}
        <path
          d="M 50 135 C 75 125, 125 145, 150 135 C 130 148, 70 148, 50 135 Z"
          fill="url(#ys-river)"
          opacity="0.8"
        />

        {/* Rural Village Backdrop (Left side - Orange/Amber) */}
        <g id="village-left" opacity="0.95">
          {/* Tree */}
          <circle cx="34" cy="78" r="10" fill="#F59E0B" />
          <circle cx="28" cy="85" r="8" fill="#D97706" />
          <circle cx="40" cy="85" r="8" fill="#F59E0B" />
          <rect x="32" y="88" width="4" height="12" rx="1" fill="#B45309" />
          {/* Cottage / House */}
          <polygon points="46,88 56,80 66,88" fill="#EA580C" />
          <rect x="48" y="88" width="16" height="12" fill="#FDBA74" />
          <rect x="53" y="93" width="5" height="7" fill="#9A3412" />
        </g>

        {/* Urban City Backdrop (Right side - Green) */}
        <g id="city-right" opacity="0.95">
          {/* Tall building */}
          <rect x="156" y="65" width="14" height="35" rx="1.5" fill="#16A34A" />
          <rect x="159" y="68" width="2" height="3" fill="#BBF7D0" />
          <rect x="165" y="68" width="2" height="3" fill="#BBF7D0" />
          <rect x="159" y="74" width="2" height="3" fill="#BBF7D0" />
          <rect x="165" y="74" width="2" height="3" fill="#BBF7D0" />
          <rect x="159" y="80" width="2" height="3" fill="#BBF7D0" />
          <rect x="165" y="80" width="2" height="3" fill="#BBF7D0" />
          {/* Medium building */}
          <rect x="142" y="74" width="12" height="26" rx="1" fill="#22C55E" />
          <rect x="145" y="78" width="2" height="3" fill="#DCFCE7" />
          <rect x="149" y="78" width="2" height="3" fill="#DCFCE7" />
          <rect x="145" y="84" width="2" height="3" fill="#DCFCE7" />
          <rect x="149" y="84" width="2" height="3" fill="#DCFCE7" />
          {/* Small building with red beacon dot */}
          <rect x="134" y="82" width="8" height="18" fill="#4ADE80" />
          <circle cx="138" cy="80" r="1.5" fill="#EF4444" />
          {/* Scholar / Student Silhouette */}
          <polygon points="172,82 178,79 184,82 178,85" fill="#15803D" />
          <circle cx="178" cy="88" r="3" fill="#16A34A" />
          <path d="M 172 98 C 172 92, 184 92, 184 98 Z" fill="#15803D" />
        </g>

        {/* Central Arched Bridge Structure */}
        <g id="bridge" filter="url(#ys-shadow)">
          {/* Top Roadway Arch */}
          <path
            d="M 18 106 C 55 86, 145 86, 182 106 L 180 112 C 145 92, 55 92, 20 112 Z"
            fill="url(#ys-bridge)"
          />
          {/* Bridge Railing Spindles */}
          <line x1="45" y1="99" x2="45" y2="105" stroke="#003366" strokeWidth="2" strokeLinecap="round" />
          <line x1="65" y1="94" x2="65" y2="102" stroke="#003366" strokeWidth="2" strokeLinecap="round" />
          <line x1="85" y1="91" x2="85" y2="100" stroke="#003366" strokeWidth="2" strokeLinecap="round" />
          <line x1="100" y1="90" x2="100" y2="100" stroke="#003366" strokeWidth="2" strokeLinecap="round" />
          <line x1="115" y1="91" x2="115" y2="100" stroke="#003366" strokeWidth="2" strokeLinecap="round" />
          <line x1="135" y1="94" x2="135" y2="102" stroke="#003366" strokeWidth="2" strokeLinecap="round" />
          <line x1="155" y1="99" x2="155" y2="105" stroke="#003366" strokeWidth="2" strokeLinecap="round" />
          
          {/* Main Arches */}
          {/* Left Arch */}
          <path
            d="M 28 116 C 30 116, 42 108, 62 108 C 80 108, 86 116, 88 116 L 82 116 C 80 112, 74 110, 62 110 C 50 110, 36 112, 34 116 Z"
            fill="url(#ys-bridge)"
          />
          {/* Center Grand Arch */}
          <path
            d="M 68 116 C 72 104, 85 96, 100 96 C 115 96, 128 104, 132 116 L 126 116 C 122 106, 112 100, 100 100 C 88 100, 78 106, 74 116 Z"
            fill="url(#ys-bridge)"
          />
          {/* Right Arch */}
          <path
            d="M 112 116 C 114 116, 120 108, 138 108 C 156 108, 168 116, 172 116 L 166 116 C 164 112, 150 110, 138 110 C 126 110, 120 112, 118 116 Z"
            fill="url(#ys-bridge)"
          />

          {/* Solid Pier Support Base */}
          <rect x="62" y="112" width="10" height="7" rx="1.5" fill="#002244" />
          <rect x="128" y="112" width="10" height="7" rx="1.5" fill="#002244" />
        </g>

        {/* Two Human Figures Joining Hands */}
        {/* Left Figure (Orange / Saffron) */}
        <g id="figure-left">
          {/* Head */}
          <circle cx="72" cy="30" r="10" fill="url(#ys-orange)" filter="url(#ys-shadow)" />
          {/* Torso & Arm reaching up to coin */}
          <path
            d="M 60 76 C 58 64, 66 48, 74 44 C 77 42, 82 45, 85 49 C 89 42, 94 36, 96 32 C 97 30, 99 31, 98 33 C 94 40, 88 52, 84 62 C 81 70, 79 78, 77 82 C 73 82, 63 80, 60 76 Z"
            fill="url(#ys-orange)"
            filter="url(#ys-shadow)"
          />
        </g>

        {/* Right Figure (Green) */}
        <g id="figure-right">
          {/* Head */}
          <circle cx="128" cy="30" r="10" fill="url(#ys-green)" filter="url(#ys-shadow)" />
          {/* Torso & Arm reaching up to coin */}
          <path
            d="M 140 76 C 142 64, 134 48, 126 44 C 123 42, 118 45, 115 49 C 111 42, 106 36, 104 32 C 103 30, 101 31, 102 33 C 106 40, 112 52, 116 62 C 119 70, 121 78, 123 82 C 127 82, 137 80, 140 76 Z"
            fill="url(#ys-green)"
            filter="url(#ys-shadow)"
          />
        </g>

        {/* Rupee Coin Medal in Center Held by Both Hands */}
        <g id="rupee-coin" filter="url(#ys-shadow)">
          {/* Outer Ring */}
          <circle cx="100" cy="22" r="14" fill="#FFFFFF" stroke="#003366" strokeWidth="2.5" />
          <circle cx="100" cy="22" r="11" fill="#F8FAFC" />
          {/* ₹ Symbol */}
          <text
            x="100"
            y="28"
            fontFamily="Arial, sans-serif"
            fontSize="14"
            fontWeight="bold"
            fill="#003366"
            textAnchor="middle"
          >
            ₹
          </text>
        </g>
      </svg>

      {/* Typography: "Yojna Setu" */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-baseline gap-1">
            <span className={`font-black tracking-tight text-[#003366] ${textClass}`}>
              Yojna
            </span>
            <span className={`font-black tracking-tight text-[#16A34A] ${textClass}`}>
              Setu
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase -mt-0.5">
            National Scheme Bridge Portal
          </span>
        </div>
      )}
    </div>
  );
}
