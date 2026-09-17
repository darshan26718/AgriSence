import React from 'react';

interface LeafVisualizerProps {
  type: 'blast_spindle' | 'leaf_blight' | 'rust_pustule' | 'bollworm_damage' | 'aphid_colony' | 'healthy_canopy' | string;
  imageSrc?: string;
  showBoundingBoxes?: boolean;
  confidence?: number;
  label?: string;
}

export const LeafVisualizer: React.FC<LeafVisualizerProps> = ({
  type,
  imageSrc,
  showBoundingBoxes = true,
  confidence = 0.94,
  label,
}) => {
  return (
    <div
      id="leaf-visualizer-container"
      className="relative w-full aspect-4/3 max-h-72 sm:max-h-80 rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/60 shadow-inner flex items-center justify-center group"
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt="Field crop sample"
          className="w-full h-full object-cover"
        />
      ) : (
        /* Synthetic high-detail SVG agricultural leaf and symptom simulation */
        <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4">
          <svg
            viewBox="0 0 320 240"
            className="w-full h-full max-w-sm drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
          >
            <defs>
              <linearGradient id="healthyLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="50%" stopColor="#15803d" />
                <stop offset="100%" stopColor="#14532d" />
              </linearGradient>
              <linearGradient id="blightLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#84cc16" />
                <stop offset="40%" stopColor="#a16207" />
                <stop offset="80%" stopColor="#451a03" />
              </linearGradient>
              <radialGradient id="targetRingGrad" cx="50%" cy="50%" r="50%">
                <stop offset="20%" stopColor="#292524" />
                <stop offset="50%" stopColor="#78350f" />
                <stop offset="80%" stopColor="#ca8a04" />
                <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Base Leaf Stem & Blade */}
            {type === 'bollworm_damage' ? (
              /* Cotton Boll shape */
              <g>
                <path
                  d="M160,50 C110,60 90,110 90,150 C90,195 125,215 160,215 C195,215 230,195 230,150 C230,110 210,60 160,50 Z"
                  fill="#15803d"
                  stroke="#166534"
                  strokeWidth="3"
                />
                {/* Cotton bracts */}
                <path d="M120,40 C140,55 150,60 160,50 C170,60 180,55 200,40" fill="none" stroke="#14532d" strokeWidth="4" />
                {/* Insect entry borehole with frass */}
                <circle cx="145" cy="140" r="14" fill="#292524" stroke="#78350f" strokeWidth="2.5" />
                <circle cx="145" cy="140" r="8" fill="#0c0a09" />
                <path d="M138,135 Q145,130 152,136 Q150,146 140,145 Z" fill="#451a03" />
                <circle cx="160" cy="155" r="3" fill="#ca8a04" />
                <circle cx="152" cy="162" r="2.5" fill="#ca8a04" />
              </g>
            ) : (
              /* Lanceolate or Ovate Leaf Blade */
              <g>
                <path
                  d="M160,20 C100,70 60,140 100,205 C130,225 190,225 220,205 C260,140 220,70 160,20 Z"
                  fill={type === 'healthy_canopy' ? 'url(#healthyLeafGrad)' : 'url(#blightLeafGrad)'}
                  stroke={type === 'healthy_canopy' ? '#15803d' : '#854d0e'}
                  strokeWidth="2.5"
                />
                {/* Central Leaf Midrib Vein */}
                <path d="M160,20 Q158,110 160,220" fill="none" stroke="#22c55e" strokeWidth="3" opacity="0.6" />
                <path d="M160,70 Q130,90 90,110" fill="none" stroke="#22c55e" strokeWidth="1.5" opacity="0.4" />
                <path d="M160,70 Q190,90 230,110" fill="none" stroke="#22c55e" strokeWidth="1.5" opacity="0.4" />
                <path d="M160,120 Q125,140 85,160" fill="none" stroke="#22c55e" strokeWidth="1.5" opacity="0.4" />
                <path d="M160,120 Q195,140 235,160" fill="none" stroke="#22c55e" strokeWidth="1.5" opacity="0.4" />

                {/* Specific Symptom Markings */}
                {type === 'blast_spindle' && (
                  <g>
                    {/* Primary Spindle Lesion */}
                    <path
                      d="M130,110 Q145,95 160,110 Q145,125 130,110 Z"
                      fill="#e2e8f0"
                      stroke="#78350f"
                      strokeWidth="2"
                    />
                    <path
                      d="M110,140 Q135,120 160,140 Q135,160 110,140 Z"
                      fill="#cbd5e1"
                      stroke="#991b1b"
                      strokeWidth="2.5"
                    />
                    {/* Necrotic center */}
                    <ellipse cx="135" cy="140" rx="12" ry="5" fill="#475569" />
                  </g>
                )}

                {type === 'leaf_blight' && (
                  <g>
                    {/* Concentric Target Board Spot */}
                    <ellipse cx="140" cy="130" rx="28" ry="24" fill="url(#targetRingGrad)" />
                    <ellipse cx="140" cy="130" rx="18" ry="15" fill="none" stroke="#78350f" strokeWidth="2" />
                    <ellipse cx="140" cy="130" rx="10" ry="8" fill="none" stroke="#451a03" strokeWidth="2" />
                    <circle cx="140" cy="130" r="4" fill="#1c1917" />
                    {/* Secondary spot */}
                    <ellipse cx="185" cy="95" rx="16" ry="14" fill="url(#targetRingGrad)" />
                    <ellipse cx="185" cy="95" rx="9" ry="8" fill="none" stroke="#78350f" strokeWidth="1.5" />
                  </g>
                )}

                {type === 'rust_pustule' && (
                  <g>
                    {/* Parallel Yellow-Orange Stripe Rust Pustules */}
                    {[80, 95, 110, 125, 140, 155, 170].map((y, i) => (
                      <rect
                        key={i}
                        x={145 + (i % 2) * 8}
                        y={y}
                        width="6"
                        height="12"
                        rx="3"
                        fill="#f97316"
                        stroke="#c2410c"
                        strokeWidth="1"
                      />
                    ))}
                    {[85, 100, 115, 130, 145, 160].map((y, i) => (
                      <rect
                        key={`b-${i}`}
                        x={165 - (i % 2) * 8}
                        y={y}
                        width="5"
                        height="10"
                        rx="2.5"
                        fill="#eab308"
                        stroke="#ca8a04"
                        strokeWidth="1"
                      />
                    ))}
                  </g>
                )}

                {type === 'aphid_colony' && (
                  <g>
                    {/* Aphid cluster on shoot */}
                    {[
                      [150, 60], [158, 65], [145, 70], [162, 75],
                      [152, 85], [142, 80], [165, 88], [155, 95]
                    ].map(([cx, cy], idx) => (
                      <ellipse
                        key={idx}
                        cx={cx}
                        cy={cy}
                        rx="4.5"
                        ry="3.5"
                        fill="#84cc16"
                        stroke="#4d7c0f"
                        strokeWidth="1"
                      />
                    ))}
                    {/* Sticky honeydew drop */}
                    <circle cx="150" cy="115" r="3" fill="#38bdf8" opacity="0.8" />
                  </g>
                )}
              </g>
            )}

            {/* AI Computer Vision Bounding Box Overlay */}
            {showBoundingBoxes && type !== 'healthy_canopy' && (
              <g className="animate-pulse">
                <rect
                  x="95"
                  y="85"
                  width="110"
                  height="85"
                  rx="6"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
                {/* Corner crosshairs */}
                <line x1="90" y1="85" x2="105" y2="85" stroke="#ef4444" strokeWidth="3" />
                <line x1="95" y1="80" x2="95" y2="95" stroke="#ef4444" strokeWidth="3" />
                <line x1="195" y1="170" x2="210" y2="170" stroke="#ef4444" strokeWidth="3" />
                <line x1="205" y1="160" x2="205" y2="175" stroke="#ef4444" strokeWidth="3" />
              </g>
            )}
          </svg>
        </div>
      )}

      {/* High-Tech HUD Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent bg-size-[100%_4px] opacity-40" />

      {/* Top Banner Tag */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900/85 backdrop-blur-md border border-slate-700/80 text-[11px] text-emerald-400 font-mono tracking-wider shadow-sm">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
        AI VISION DETECTOR v2.4
      </div>

      {/* Confidence Pill */}
      {confidence && (
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-slate-900/90 backdrop-blur-md border border-emerald-500/40 text-[11px] text-emerald-300 font-mono tracking-wide shadow-md">
          CONFIDENCE: {(confidence * 100).toFixed(1)}%
        </div>
      )}

      {/* Lesion Label */}
      {label && (
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/90 backdrop-blur-md border border-slate-700 text-[11px] text-slate-200 font-medium truncate max-w-[55%]">
          {label}
        </div>
      )}
    </div>
  );
};
