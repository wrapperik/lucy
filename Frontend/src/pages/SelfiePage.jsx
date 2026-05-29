import { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Camera, Download, RotateCcw, X, Sparkles } from 'lucide-react';

export default function SelfiePage() {
  const { saveSelfie } = useApp();
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [compositeImage, setCompositeImage] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.error('Camera access denied:', err);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const composeLucy = useCallback((selfieData) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const selfieImg = new Image();
    selfieImg.onload = () => {
      canvas.width = selfieImg.width;
      canvas.height = selfieImg.height;
      ctx.drawImage(selfieImg, 0, 0);
      const lucyImg = new Image();
      lucyImg.crossOrigin = 'anonymous';
      lucyImg.onload = () => {
        const lucySize = Math.min(canvas.width, canvas.height) * 0.35;
        const x = canvas.width - lucySize - 20;
        const y = canvas.height - lucySize - 20;
        ctx.save();
        ctx.globalAlpha = 0.88;
        ctx.beginPath();
        ctx.arc(x + lucySize / 2, y + lucySize / 2, lucySize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(lucyImg, x, y, lucySize, lucySize);
        ctx.restore();
        ctx.beginPath();
        ctx.arc(x + lucySize / 2, y + lucySize / 2, lucySize / 2 + 2, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(243, 129, 85, 0.6)';
        ctx.lineWidth = 3;
        ctx.stroke();
        const result = canvas.toDataURL('image/jpeg', 0.9);
        setCompositeImage(result);
        setProcessing(false);
        saveSelfie(result);
      };
      lucyImg.src = '/lucy-avatar.png';
    };
    selfieImg.src = selfieData;
  }, [saveSelfie]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImage(imageData);
    stopCamera();
    setProcessing(true);
    setTimeout(() => composeLucy(imageData), 2000);
  }, [facingMode, stopCamera, composeLucy]);

  const downloadImage = useCallback(() => {
    if (!compositeImage) return;
    const a = document.createElement('a');
    a.href = compositeImage;
    a.download = `lucy-selfie-${Date.now()}.jpg`;
    a.click();
  }, [compositeImage]);

  const reset = useCallback(() => {
    setCapturedImage(null);
    setCompositeImage(null);
    setProcessing(false);
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div
      id="selfie-page"
      className="pb-safe flex flex-col"
      style={{ minHeight: 'calc(100vh - var(--nav-height))' }}
    >
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera active view */}
      {cameraActive && (
        <div
          className="relative flex-1 overflow-hidden"
          style={{
            margin: '20px 16px 0',
            borderRadius: '20px',
            background: 'var(--bg-card)',
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
          />
          <div
            className="absolute left-0 right-0 flex items-center justify-center"
            style={{ bottom: '28px', gap: '24px' }}
          >
            <button
              onClick={() => { stopCamera(); reset(); }}
              className="flex items-center justify-center backdrop-blur-sm transition-transform active:scale-90"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.50)',
              }}
            >
              <X size={20} className="text-white" />
            </button>
            <button
              onClick={capturePhoto}
              className="flex items-center justify-center transition-transform active:scale-90"
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-light), var(--accent-dark))',
                border: '4px solid rgba(255,255,255,0.30)',
                boxShadow: '0 4px 20px rgba(243, 129, 85, 0.3)',
              }}
            >
              <Camera size={26} className="text-white" />
            </button>
            <button
              onClick={() => {
                stopCamera();
                setFacingMode(p => p === 'user' ? 'environment' : 'user');
                setTimeout(startCamera, 100);
              }}
              className="flex items-center justify-center backdrop-blur-sm transition-transform active:scale-90"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.50)',
              }}
            >
              <RotateCcw size={18} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Processing state */}
      {processing && (
        <div className="flex-1 flex flex-col items-center justify-center text-center" style={{ padding: '0 32px' }}>
          <Sparkles size={44} className="animate-spin-slow" style={{ color: 'var(--accent)', marginBottom: '24px' }} />
          <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
            Lucy is joining your photo...
          </p>
          <p style={{ fontSize: '14px', marginTop: '10px', color: 'var(--text-muted)' }}>
            AI compositing in progress
          </p>
        </div>
      )}

      {/* Composite result */}
      {compositeImage && !processing && (
        <div className="flex-1 flex flex-col" style={{ padding: '20px 16px 0' }}>
          <div
            className="overflow-hidden"
            style={{
              borderRadius: '20px',
              border: '1px solid var(--border-card)',
              boxShadow: 'var(--card-shadow)',
              marginBottom: '16px',
            }}
          >
            <img src={compositeImage} alt="Selfie with Lucy" className="w-full" />
          </div>
          <div className="flex" style={{ gap: '12px' }}>
            <button
              onClick={downloadImage}
              className="flex-1 flex items-center justify-center font-semibold transition-transform active:scale-[0.97]"
              style={{
                gap: '8px',
                padding: '14px',
                borderRadius: '14px',
                fontSize: '14px',
                background: 'linear-gradient(135deg, var(--accent-light), var(--accent-dark))',
                color: 'white',
                border: 'none',
                boxShadow: '0 4px 16px rgba(243, 129, 85, 0.25)',
              }}
            >
              <Download size={18} />
              Save photo
            </button>
            <button
              onClick={reset}
              className="flex items-center justify-center font-medium transition-transform active:scale-[0.97]"
              style={{
                gap: '8px',
                padding: '14px 20px',
                borderRadius: '14px',
                fontSize: '14px',
                background: 'var(--bg-card)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-card)',
              }}
            >
              <RotateCcw size={16} />
              Retake
            </button>
          </div>
        </div>
      )}

      {/* Initial idle state */}
      {!cameraActive && !capturedImage && !processing && (
        <div className="flex-1 flex flex-col" style={{ padding: '0 16px' }}>
          {/* Upper content area */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            {/* Lucy avatar preview */}
            <div
              className="relative animate-float"
              style={{ marginBottom: '32px' }}
            >
              <div
                className="overflow-hidden"
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '28px',
                  border: '2px solid var(--accent-glow-strong)',
                  boxShadow: '0 8px 32px rgba(243, 129, 85, 0.15)',
                }}
              >
                <img
                  src="/lucy-avatar.png"
                  alt="Lucy"
                  className="w-full h-full object-cover"
                  style={{ opacity: 0.9 }}
                />
              </div>
              <div
                className="absolute flex items-center justify-center"
                style={{
                  bottom: '-6px',
                  right: '-6px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent-light), var(--accent-dark))',
                  border: '3px solid var(--bg-app)',
                }}
              >
                <Camera size={14} className="text-white" />
              </div>
            </div>

            <p
              style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                fontFamily: "'Space Mono', monospace",
                marginBottom: '12px',
              }}
            >
              SELFIE WITH LUCY
            </p>
            <h2
              style={{
                fontFamily: "'Outfit', sans-serif",
                color: 'var(--text-primary)',
                fontSize: '26px',
                fontWeight: 700,
                lineHeight: 1.3,
                maxWidth: '280px',
              }}
            >
              Take a selfie. Lucy<br />will quietly join you.
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                marginTop: '12px',
                lineHeight: 1.55,
                maxWidth: '300px',
              }}
            >
              She'll appear in the corner of your photo — like she was there all along.
            </p>
            <button
              onClick={startCamera}
              className="flex items-center font-semibold transition-transform active:scale-95"
              style={{
                gap: '10px',
                marginTop: '32px',
                padding: '14px 36px',
                borderRadius: '999px',
                fontSize: '15px',
                background: 'linear-gradient(135deg, var(--accent-light), var(--accent-dark))',
                color: 'white',
                boxShadow: '0 8px 28px rgba(243, 129, 85, 0.25)',
                border: 'none',
              }}
            >
              <Camera size={18} />
              Start camera
            </button>
          </div>

          {/* Bottom disclaimer */}
          <p
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              textAlign: 'center',
              paddingBottom: '8px',
            }}
          >
            Lucy isn't really there. The photo will say otherwise.
          </p>
        </div>
      )}
    </div>
  );
}
