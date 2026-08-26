import React from 'react';

export default function YojnaWheelIllustration({ className = '' }: { className?: string }) {
  return (
    <div className={`relative w-full max-w-[440px] aspect-[4/3] flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 400 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
        aria-label="Yojna Setu Government Scheme Portal Wheel Illustration"
      >
        <defs>
          <linearGradient id="wheel-navy" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B3A68" />
            <stop offset="50%" stopColor="#002D5B" />
            <stop offset="100%" stopColor="#001F3F" />
          </linearGradient>
          <linearGradient id="center-orange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF9933" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
          <linearGradient id="badge-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="badge-green" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4ADE80" />
            <stop offset="100%" stopColor="#16A34A" />
          </linearGradient>
          <linearGradient id="badge-purple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#9333EA" />
          </linearGradient>
          <linearGradient id="badge-amber" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* Foundation & Base Stand */}
        <g id="stand" filter="url(#soft-shadow)">
          <path d="M 120 270 L 150 215 L 250 215 L 280 270 Z" fill="url(#wheel-navy)" />
          <rect x="100" y="265" width="200" height="12" rx="4" fill="#001F3F" />
          <line x1="160" y1="240" x2="240" y2="240" stroke="#38BDF8" strokeWidth="2" opacity="0.6" />
        </g>

        {/* Outer Wheel Rim */}
        <circle cx="200" cy="140" r="105" stroke="url(#wheel-navy)" strokeWidth="16" filter="url(#soft-shadow)" />
        <circle cx="200" cy="140" r="95" stroke="#38BDF8" strokeWidth="2" strokeDasharray="4 4" opacity="0.8" />
        <circle cx="200" cy="140" r="62" stroke="url(#wheel-navy)" strokeWidth="8" />

        {/* Wheel Spokes (12 Architectural Spokes with static coordinates to prevent hydration mismatch) */}
        {[
          { x2: 296, y2: 140 },
          { x2: 283.1, y2: 188 },
          { x2: 248, y2: 223.1 },
          { x2: 200, y2: 236 },
          { x2: 152, y2: 223.1 },
          { x2: 116.9, y2: 188 },
          { x2: 104, y2: 140 },
          { x2: 116.9, y2: 92 },
          { x2: 152, y2: 56.9 },
          { x2: 200, y2: 44 },
          { x2: 248, y2: 56.9 },
          { x2: 283.1, y2: 92 },
        ].map((spoke, i) => (
          <line
            key={i}
            x1="200"
            y1="140"
            x2={spoke.x2}
            y2={spoke.y2}
            stroke="#0B3A68"
            strokeWidth="3"
          />
        ))}

        {/* Stepped Support Ramps for People around the Wheel */}
        <path d="M 75 190 L 115 150 L 115 160 L 75 200 Z" fill="#002D5B" />
        <path d="M 325 190 L 285 150 L 285 160 L 325 200 Z" fill="#002D5B" />
        <path d="M 95 110 L 125 130" stroke="#002D5B" strokeWidth="4" />
        <path d="M 305 110 L 275 130" stroke="#002D5B" strokeWidth="4" />

        {/* Central Hub Emblem - Yojna Setu E-Portal */}
        <g id="hub" filter="url(#soft-shadow)">
          <circle cx="200" cy="140" r="30" fill="url(#center-orange)" stroke="#FFFFFF" strokeWidth="3" />
          <circle cx="200" cy="140" r="25" fill="#FFFFFF" opacity="0.2" />
          <text x="200" y="132" fontSize="6.5" fontWeight="bold" fill="#FFFFFF" textAnchor="middle" letterSpacing="0.5">
            YOJNA SETU
          </text>
          <text x="200" y="142" fontSize="13" fontWeight="900" fill="#FFFFFF" textAnchor="middle">
            ₹
          </text>
          <text x="200" y="150" fontSize="5.5" fontWeight="bold" fill="#FFFFFF" textAnchor="middle" letterSpacing="0.5">
            E-PORTAL
          </text>
        </g>

        {/* Floating Scheme / Vocational Icons along Spokes */}
        {/* 1. Agriculture / Green (Top-Left) */}
        <g transform="translate(145, 80)" filter="url(#soft-shadow)">
          <rect x="-11" y="-11" width="22" height="22" rx="5" fill="url(#badge-green)" />
          <path d="M -4 4 C -4 -4, 4 -4, 4 4 Z" fill="#FFFFFF" />
          <line x1="0" y1="4" x2="0" y2="7" stroke="#FFFFFF" strokeWidth="1.5" />
        </g>

        {/* 2. Education / Graduation Cap (Top) */}
        <g transform="translate(200, 52)" filter="url(#soft-shadow)">
          <rect x="-11" y="-11" width="22" height="22" rx="5" fill="url(#badge-blue)" />
          <polygon points="0,-4 7,-1 0,2 -7,-1" fill="#FFFFFF" />
          <path d="M -4 1 L -4 4 C -4 6, 4 6, 4 4 L 4 1" fill="#FFFFFF" />
        </g>

        {/* 3. Transport / Vehicle (Top-Right) */}
        <g transform="translate(255, 80)" filter="url(#soft-shadow)">
          <rect x="-11" y="-11" width="22" height="22" rx="5" fill="url(#badge-amber)" />
          <rect x="-6" y="-3" width="12" height="6" rx="1.5" fill="#FFFFFF" />
          <circle cx="-3" cy="4" r="2" fill="#FFFFFF" />
          <circle cx="3" cy="4" r="2" fill="#FFFFFF" />
        </g>

        {/* 4. Business & Finance (Right) */}
        <g transform="translate(275, 140)" filter="url(#soft-shadow)">
          <rect x="-11" y="-11" width="22" height="22" rx="5" fill="url(#badge-blue)" />
          <rect x="-6" y="-5" width="12" height="10" rx="1" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
          <line x1="-3" y1="-2" x2="3" y2="-2" stroke="#FFFFFF" strokeWidth="1.5" />
        </g>

        {/* 5. Clean Tech / Solar (Bottom-Right) */}
        <g transform="translate(252, 200)" filter="url(#soft-shadow)">
          <rect x="-11" y="-11" width="22" height="22" rx="5" fill="url(#badge-green)" />
          <circle cx="0" cy="0" r="5" fill="#FFFFFF" />
          <line x1="0" y1="-7" x2="0" y2="-5" stroke="#FFFFFF" strokeWidth="1.5" />
          <line x1="0" y1="5" x2="0" y2="7" stroke="#FFFFFF" strokeWidth="1.5" />
          <line x1="-7" y1="0" x2="-5" y2="0" stroke="#FFFFFF" strokeWidth="1.5" />
          <line x1="5" y1="0" x2="7" y2="0" stroke="#FFFFFF" strokeWidth="1.5" />
        </g>

        {/* 6. Micro Enterprise / Women Artisan (Bottom-Left) */}
        <g transform="translate(148, 200)" filter="url(#soft-shadow)">
          <rect x="-11" y="-11" width="22" height="22" rx="5" fill="url(#badge-purple)" />
          <path d="M -5 3 L 0 -5 L 5 3 Z" fill="#FFFFFF" />
          <circle cx="0" cy="4" r="1.5" fill="#FFFFFF" />
        </g>

        {/* 7. Loan / Subsidies (Left) */}
        <g transform="translate(125, 140)" filter="url(#soft-shadow)">
          <rect x="-11" y="-11" width="22" height="22" rx="5" fill="url(#badge-amber)" />
          <text x="0" y="4" fontSize="11" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">
            %
          </text>
        </g>

        {/* Stylized Diverse Community Beneficiaries Standing on Spokes & Stairs */}
        {/* Figure 1: Woman Entrepreneur with Saree (Left Ramp) */}
        <g id="person-1" transform="translate(85, 150)">
          <circle cx="0" cy="-20" r="4.5" fill="#EA580C" />
          <path d="M -4 -14 C -4 -16, 4 -16, 4 -14 L 6 4 L -6 4 Z" fill="#EA580C" />
          <path d="M -2 -14 L 5 -2" stroke="#FDBA74" strokeWidth="1.5" />
          <line x1="-2" y1="4" x2="-2" y2="12" stroke="#C2410C" strokeWidth="2.5" />
          <line x1="2" y1="4" x2="2" y2="12" stroke="#C2410C" strokeWidth="2.5" />
        </g>

        {/* Figure 2: Student with Book (Top Left) */}
        <g id="person-2" transform="translate(145, 38)">
          <circle cx="0" cy="-14" r="4" fill="#0284C7" />
          <path d="M -3.5 -9 L 3.5 -9 L 4 3 L -4 3 Z" fill="#0284C7" />
          <rect x="2" y="-5" width="4" height="6" rx="0.5" fill="#F8FAFC" />
          <line x1="-1.5" y1="3" x2="-1.5" y2="10" stroke="#0369A1" strokeWidth="2" />
          <line x1="1.5" y1="3" x2="1.5" y2="10" stroke="#0369A1" strokeWidth="2" />
        </g>

        {/* Figure 3: Youth Professional / Tech (Top Right) */}
        <g id="person-3" transform="translate(255, 38)">
          <circle cx="0" cy="-14" r="4" fill="#16A34A" />
          <path d="M -4 -9 L 4 -9 L 4.5 3 L -4.5 3 Z" fill="#16A34A" />
          <line x1="-1.5" y1="3" x2="-1.5" y2="10" stroke="#15803D" strokeWidth="2" />
          <line x1="1.5" y1="3" x2="1.5" y2="10" stroke="#15803D" strokeWidth="2" />
        </g>

        {/* Figure 4: Artisan with tool (Right Ramp) */}
        <g id="person-4" transform="translate(315, 150)">
          <circle cx="0" cy="-20" r="4.5" fill="#0B3A68" />
          <path d="M -4.5 -14 L 4.5 -14 L 5 4 L -5 4 Z" fill="#0B3A68" />
          <line x1="-2" y1="4" x2="-2" y2="12" stroke="#001F3F" strokeWidth="2.5" />
          <line x1="2" y1="4" x2="2" y2="12" stroke="#001F3F" strokeWidth="2.5" />
        </g>

        {/* Figure 5: Farmer Beneficiary (Bottom Left) */}
        <g id="person-5" transform="translate(110, 230)">
          <circle cx="0" cy="-16" r="4" fill="#D97706" />
          <path d="M -4 -11 L 4 -11 L 5 2 L -5 2 Z" fill="#D97706" />
          <line x1="-2" y1="2" x2="-2" y2="10" stroke="#B45309" strokeWidth="2" />
          <line x1="2" y1="2" x2="2" y2="10" stroke="#B45309" strokeWidth="2" />
        </g>

        {/* Figure 6: Small Shop Owner (Bottom Right) */}
        <g id="person-6" transform="translate(290, 230)">
          <circle cx="0" cy="-16" r="4" fill="#9333EA" />
          <path d="M -4 -11 L 4 -11 L 5 2 L -5 2 Z" fill="#9333EA" />
          <line x1="-2" y1="2" x2="-2" y2="10" stroke="#7E22CE" strokeWidth="2" />
          <line x1="2" y1="2" x2="2" y2="10" stroke="#7E22CE" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}
