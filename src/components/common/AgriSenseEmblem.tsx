import React from 'react';

interface AgriSenseEmblemProps {
  className?: string;
}

export const AgriSenseEmblem: React.FC<AgriSenseEmblemProps> = ({ className = 'h-8 w-8' }) => {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-[0_2px_4px_rgba(27,94,32,0.3)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="46" fill="#1B5E20" stroke="#81C784" strokeWidth="2.5" />
        {/* Stylized leaf & AI digital pulse icon */}
        <path
          d="M50 18 C32 26 26 46 34 68 C38 64 45 61 50 61 C55 61 62 64 66 68 C74 46 68 26 50 18 Z"
          fill="#4CAF50"
        />
        <path
          d="M50 24 C40 33 37 48 42 62 C45 60 48 59 50 59 C52 59 55 60 58 62 C63 48 60 33 50 24 Z"
          fill="#81C784"
        />
        {/* Central digital sensor / neural node core */}
        <circle cx="50" cy="46" r="5" fill="#FFFFFF" />
        <line x1="50" y1="36" x2="50" y2="41" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="50" y1="51" x2="50" y2="57" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="50" cy="34" r="2.5" fill="#FFD54F" />
        <circle cx="50" cy="59" r="2.5" fill="#FFD54F" />
        {/* Golden grain ear base accent */}
        <path
          d="M38 74 C44 70 56 70 62 74 C58 77 52 79 50 82 C48 79 42 77 38 74 Z"
          fill="#FFB300"
        />
      </svg>
    </div>
  );
};
