import React from "react";

export const Logo: React.FC = () => {
  return (
    <div className="flex flex-col items-start select-none h-11" id="em-logo-container">
      <svg
        viewBox="0 0 220 125"
        className="h-full w-auto border border-slate-200/60 rounded overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Red rectangular badge with the exact vibrant corporate crimson from the image */}
        <rect x="0" y="0" width="220" height="95" fill="#a81515" />

        {/* Thin parallel white stripes running horizontally behind the letters */}
        <line x1="0" y1="36" x2="220" y2="36" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" />
        <line x1="0" y1="41" x2="220" y2="41" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" />
        <line x1="0" y1="46" x2="220" y2="46" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" />
        <line x1="0" y1="51" x2="220" y2="51" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" />
        <line x1="0" y1="56" x2="220" y2="56" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.3" />

        {/* Giant white serif "EM" letters styled identically to the original logo */}
        <text
          x="110"
          y="71"
          fill="#ffffff"
          fontSize="76"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontWeight="bold"
          textAnchor="middle"
          letterSpacing="1"
        >
          EM
        </text>

        {/* Elegant solid partition line */}
        <line x1="0" y1="95" x2="220" y2="95" stroke="#e2e8f0" strokeWidth="1" />

        {/* White bottom band container for high contrast */}
        <rect x="0" y="95" width="220" height="30" fill="#ffffff" />

        {/* "EFFICIENT MANUFACTURING" black capital letter typography */}
        <text
          x="110"
          y="114"
          fill="#1e293b"
          fontSize="12"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          textAnchor="middle"
          letterSpacing="0.8"
        >
          EFFICIENT MANUFACTURING
        </text>
      </svg>
    </div>
  );
};
