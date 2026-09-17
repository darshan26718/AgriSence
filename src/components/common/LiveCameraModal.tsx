import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  RefreshCw,
  Check,
  X,
  AlertTriangle,
  Sparkles,
  Zap,
  Maximize2,
  Scan,
  ShieldAlert,
  Info,
} from 'lucide-react';

interface LiveCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
  title?: string;
  subtitle?: string;
  accentColor?: 'emerald' | 'amber' | 'cyan';
}

// Generate realistic botanical specimen frame for testing/demonstration if hardware is unavailable
const generateDemoSpecimenDataUrl = (): string => {
  const canvas = document.createElement('canvas');
  canvas.width = 960;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background - agricultural plot backdrop
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 720);
  bgGrad.addColorStop(0, '#0f2415');
  bgGrad.addColorStop(1, '#07130b');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 960, 720);

  // Soft field blur spots
  ctx.fillStyle = 'rgba(45, 106, 79, 0.2)';
  ctx.beginPath();
  ctx.arc(180, 180, 150, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(800, 520, 200, 0, Math.PI * 2);
  ctx.fill();

  // Central leaf blade specimen
  ctx.save();
  ctx.translate(480, 360);
  ctx.rotate(-0.12);

  // Main leaf blade outline
  ctx.beginPath();
  ctx.moveTo(0, -250);
  ctx.bezierCurveTo(180, -170, 220, 90, 40, 260);
  ctx.bezierCurveTo(-20, 270, -40, 270, -60, 260);
  ctx.bezierCurveTo(-220, 90, -180, -170, 0, -250);
  ctx.closePath();

  // Leaf gradient
  const leafGrad = ctx.createRadialGradient(-20, -40, 30, 0, 0, 280);
  leafGrad.addColorStop(0, '#52b788');
  leafGrad.addColorStop(0.5, '#2d6a4f');
  leafGrad.addColorStop(1, '#1b4332');
  ctx.fillStyle = leafGrad;
  ctx.fill();
  ctx.strokeStyle = '#74c69d';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Midrib vein
  ctx.beginPath();
  ctx.moveTo(0, -240);
  ctx.quadraticCurveTo(6, 0, -8, 265);
  ctx.strokeStyle = '#95d5b2';
  ctx.lineWidth = 5;
  ctx.stroke();

  // Lateral veins
  const veinPairs = [
    [-170, -110], [-90, -50], [-10, 10], [70, 70], [150, 130], [210, 190]
  ];
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = 'rgba(149, 213, 178, 0.65)';
  veinPairs.forEach(([yStart, yEnd]) => {
    ctx.beginPath();
    ctx.moveTo(0, yStart);
    ctx.quadraticCurveTo(60, yStart - 10, 130, yEnd);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, yStart);
    ctx.quadraticCurveTo(-60, yStart - 10, -130, yEnd);
    ctx.stroke();
  });

  // Pathology lesion spots (chlorosis and necrotic margins)
  const lesions = [
    { x: 45, y: -75, r: 28, color: '#7f1d1d', halo: '#ea580c' },
    { x: -50, y: 45, r: 34, color: '#450a0a', halo: '#d97706' },
    { x: 30, y: 120, r: 22, color: '#7f1d1d', halo: '#eab308' },
    { x: -70, y: -50, r: 17, color: '#450a0a', halo: '#b45309' },
  ];

  lesions.forEach(l => {
    ctx.beginPath();
    ctx.arc(l.x, l.y, l.r + 14, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(234, 179, 8, 0.3)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2);
    ctx.fillStyle = l.halo;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(l.x, l.y, l.r * 0.65, 0, Math.PI * 2);
    ctx.fillStyle = l.color;
    ctx.fill();
  });

  ctx.restore();

  // HUD Timestamp stamp
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '13px monospace';
  ctx.fillText('OPTICAL SPECIMEN ACQUIRED - 1080p MACRO CALIBRATION', 35, 685);

  return canvas.toDataURL('image/jpeg', 0.92);
};

export const LiveCameraModal: React.FC<LiveCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Optical Field Camera Scanner',
  subtitle = 'Position leaf lesion or pest within viewfinder crosshairs',
  accentColor = 'emerald',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Active stream stored in a ref to decouple hardware lifecycle from re-render dependencies
  const streamRef = useRef<MediaStream | null>(null);
  const activeSessionIdRef = useRef<number>(0);

  const [isStreamActive, setIsStreamActive] = useState<boolean>(false);
  const [isVideoReady, setIsVideoReady] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);

  // Helper to reliably stop all video tracks without triggering re-render cascades
  const stopCurrentStream = useCallback(() => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach(track => {
          try {
            track.stop();
          } catch {
            // Ignore track stop errors
          }
        });
      } catch {
        // Ignore stream stop errors
      }
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsStreamActive(false);
    setIsVideoReady(false);
    setTorchOn(false);
    setHasTorch(false);
  }, []);

  // Safe camera startup with cascading constraint fallbacks
  const startCamera = useCallback(async (facing: 'environment' | 'user') => {
    const sessionId = ++activeSessionIdRef.current;
    setIsInitializing(true);
    setErrorMessage(null);
    setIsVideoReady(false);

    // Stop previous hardware stream
    stopCurrentStream();

    // Check MediaDevices API availability
    if (!navigator?.mediaDevices?.getUserMedia) {
      setErrorMessage(
        'Camera API (getUserMedia) is unavailable in this browser context. Please allow permissions or use file upload.'
      );
      setIsInitializing(false);
      return;
    }

    try {
      // Check for available videoinput devices safely
      try {
        if (navigator.mediaDevices.enumerateDevices) {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter(d => d.kind === 'videoinput');
          setHasMultipleCameras(videoDevices.length > 1);
        }
      } catch {
        // Non-fatal
      }

      let mediaStream: MediaStream | null = null;
      let lastError: any = null;

      // Tier 1: Ideal facingMode and standard resolution
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch (err1) {
        lastError = err1;
        // Tier 2: Plain facingMode
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: facing },
            audio: false,
          });
        } catch (err2) {
          lastError = err2;
          // Tier 3: Basic generic video constraint
          try {
            mediaStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: false,
            });
          } catch (err3) {
            lastError = err3;
          }
        }
      }

      if (!mediaStream) {
        throw lastError || new Error('Failed to acquire video stream');
      }

      // Check if session changed while awaiting getUserMedia
      if (sessionId !== activeSessionIdRef.current) {
        mediaStream.getTracks().forEach(t => t.stop());
        return;
      }

      streamRef.current = mediaStream;
      setIsStreamActive(true);

      // Check for torch / flashlight support safely
      try {
        const videoTrack = mediaStream.getVideoTracks()[0];
        if (videoTrack) {
          const capabilities = (videoTrack.getCapabilities?.() || {}) as { torch?: boolean };
          setHasTorch(Boolean(capabilities.torch));
        }
      } catch {
        setHasTorch(false);
      }

      // Bind to video element
      const video = videoRef.current;
      if (video) {
        video.srcObject = mediaStream;
        video.muted = true;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');

        try {
          await video.play();
        } catch (playErr) {
          console.warn('Camera video play was deferred or blocked by browser:', playErr);
        }
      }

      setIsInitializing(false);
    } catch (err: any) {
      if (sessionId !== activeSessionIdRef.current) return;
      console.warn('Camera access exception:', err);

      let msg = 'Could not access optical camera sensor.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission was denied. Please allow camera permissions in your browser URL bar or device settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera hardware found on this system.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg = 'Camera is currently locked or in use by another tab/app. Please close other camera tabs and retry.';
      } else if (err.name === 'OverconstrainedError') {
        msg = 'Camera resolution constraints could not be satisfied by this hardware.';
      } else {
        msg = err.message || 'Unable to open optical camera stream.';
      }

      setErrorMessage(msg);
      setIsInitializing(false);
    }
  }, [stopCurrentStream]);

  // Trigger camera start when modal opens or facing mode toggles
  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      startCamera(facingMode);
    } else {
      stopCurrentStream();
      setCapturedImage(null);
      setErrorMessage(null);
    }

    return () => {
      stopCurrentStream();
    };
  }, [isOpen, facingMode, startCamera, stopCurrentStream]);

  // Keep video element bound to the stream even across view/render changes
  useEffect(() => {
    const video = videoRef.current;
    if (video && streamRef.current && isStreamActive && !capturedImage) {
      if (video.srcObject !== streamRef.current) {
        video.srcObject = streamRef.current;
        video.muted = true;
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.play().catch(() => {});
      }
    }
  }, [isStreamActive, capturedImage]);

  // Toggle front / rear camera cleanly without duplicate calls
  const toggleFacingMode = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Toggle torch / flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      const nextState = !torchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextState }],
      });
      setTorchOn(nextState);
    } catch (e) {
      console.warn('Torch constraint failed:', e);
    }
  };

  // Capture current video frame to canvas
  const handleSnap = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const width = video.videoWidth > 0 ? video.videoWidth : 1280;
    const height = video.videoHeight > 0 ? video.videoHeight : 720;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.save();
      // Mirror horizontally if user front camera
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedImage(dataUrl);
    }
  };

  // Load a simulated specimen feed if physical camera is blocked or unavailable
  const handleUseDemoSpecimen = () => {
    const demoUrl = generateDemoSpecimenDataUrl();
    setCapturedImage(demoUrl);
    setErrorMessage(null);
    stopCurrentStream();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      stopCurrentStream();
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    // Restart camera if stream was killed
    if (!streamRef.current) {
      startCamera(facingMode);
    }
  };

  const handleModalClose = () => {
    stopCurrentStream();
    setCapturedImage(null);
    onClose();
  };

  if (!isOpen) return null;

  const colorStyles = {
    emerald: {
      border: 'border-emerald-500/40',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      btn: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
      reticle: 'border-emerald-400',
      laser: 'bg-emerald-400/70 shadow-[0_0_15px_#10b981]',
    },
    amber: {
      border: 'border-amber-500/40',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      btn: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
      reticle: 'border-amber-400',
      laser: 'bg-amber-400/70 shadow-[0_0_15px_#f59e0b]',
    },
    cyan: {
      border: 'border-cyan-500/40',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      btn: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950',
      reticle: 'border-cyan-400',
      laser: 'bg-cyan-400/70 shadow-[0_0_15px_#06b6d4]',
    },
  }[accentColor];

  return (
    <div
      id="live-camera-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:px-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 z-10">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${colorStyles.badge}`}>
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                {title}
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {capturedImage ? 'Preview Frame' : 'Live Optical Feed'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 hidden sm:block">{subtitle}</p>
            </div>
          </div>

          <button
            id="camera-close-btn"
            onClick={handleModalClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Close camera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Area */}
        <div className="relative flex-1 min-h-[320px] sm:min-h-[420px] bg-black flex items-center justify-center overflow-hidden">
          {/* Hidden Canvas used for frame capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Active Video Stream - Kept mounted to prevent hardware flicker / blank on retake */}
          {!errorMessage && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onLoadedMetadata={() => {
                setIsVideoReady(true);
                videoRef.current?.play().catch(() => {});
              }}
              onCanPlay={() => {
                setIsVideoReady(true);
              }}
              className={`w-full h-full object-cover max-h-[65vh] transition-opacity duration-200 ${
                capturedImage ? 'hidden' : 'block'
              } ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />
          )}

          {/* Captured Still Preview */}
          {capturedImage && (
            <img
              src={capturedImage}
              alt="Captured Foliage Specimen"
              className="w-full h-full object-contain max-h-[65vh] animate-fadeIn"
            />
          )}

          {/* Viewfinder Reticle & HUD Overlay (shown when stream is active) */}
          {!capturedImage && !errorMessage && !isInitializing && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
              {/* Center Target Box */}
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 max-w-[80vw] max-h-[80vw] border border-white/20 rounded-2xl">
                {/* Corner Brackets */}
                <div
                  className={`absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 rounded-tl-lg ${colorStyles.reticle}`}
                />
                <div
                  className={`absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 rounded-tr-lg ${colorStyles.reticle}`}
                />
                <div
                  className={`absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 rounded-bl-lg ${colorStyles.reticle}`}
                />
                <div
                  className={`absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 rounded-br-lg ${colorStyles.reticle}`}
                />

                {/* Center Crosshair Marker */}
                <div className="absolute inset-0 flex items-center justify-center opacity-40">
                  <div className="w-8 h-0.5 bg-white" />
                  <div className="h-8 w-0.5 bg-white -ml-4" />
                </div>

                {/* Animated Scanning Laser Line */}
                <div
                  className={`absolute left-0 right-0 h-0.5 animate-pulse ${colorStyles.laser}`}
                  style={{
                    top: '50%',
                    animation: 'scanLaser 2.6s ease-in-out infinite alternate',
                  }}
                />
              </div>

              {/* Real-time HUD Status */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-mono text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  SENSOR ACTIVE
                </span>
                <span className="px-2 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-slate-300 font-mono">
                  {facingMode === 'environment' ? 'BACK CAMERA' : 'FRONT CAMERA'}
                </span>
              </div>

              <div className="absolute bottom-4 text-center px-4 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-xs text-slate-200">
                Align affected foliage or pest within target box
              </div>
            </div>
          )}

          {/* Loading State */}
          {isInitializing && !errorMessage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 gap-3 text-slate-300 z-10">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-xs font-semibold">Initializing optical camera sensor...</p>
              <p className="text-[11px] text-slate-400">Requesting hardware stream</p>
            </div>
          )}

          {/* Error / Permission Block */}
          {errorMessage && (
            <div className="p-6 max-w-md text-center space-y-4 z-20">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <CameraOff className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-100">Camera Notice</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{errorMessage}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => startCamera(facingMode)}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry Camera
                </button>
                <button
                  onClick={handleUseDemoSpecimen}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs text-slate-950 font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Simulate Specimen
                </button>
                <button
                  onClick={handleModalClose}
                  className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between gap-3">
          {/* Left tools: Flip & Torch */}
          <div className="flex items-center gap-2">
            {hasMultipleCameras && !capturedImage && (
              <button
                onClick={toggleFacingMode}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Switch front / rear camera"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Flip</span>
              </button>
            )}

            {hasTorch && !capturedImage && (
              <button
                onClick={toggleTorch}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  torchOn
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-slate-100'
                }`}
                title="Toggle torch / flashlight"
              >
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Torch</span>
              </button>
            )}
          </div>

          {/* Center / Right controls */}
          <div className="flex items-center gap-2.5">
            {!capturedImage ? (
              <button
                id="camera-snap-btn"
                onClick={handleSnap}
                disabled={isInitializing || !!errorMessage || !isVideoReady}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${colorStyles.btn}`}
              >
                <Scan className="w-4 h-4" />
                Capture Specimen
              </button>
            ) : (
              <>
                <button
                  id="camera-retake-btn"
                  onClick={handleRetake}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retake
                </button>
                <button
                  id="camera-confirm-btn"
                  onClick={handleConfirm}
                  className={`px-5 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-transform hover:scale-[1.02] ${colorStyles.btn}`}
                >
                  <Check className="w-4 h-4" /> Run AI Diagnosis
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

