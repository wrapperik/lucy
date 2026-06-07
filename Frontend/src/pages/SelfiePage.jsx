import { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Camera, Download, RotateCcw, X, Sparkles, AlertTriangle, Trash2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function SelfiePage() {
  const {
    selfies,
    generateSelfie,
    deleteSelfie,
    selfieGenerating,
    selfieResultImage,
    selfieError,
    resetSelfieGenState
  } = useApp();

  const [cameraActive, setCameraActive] = useState(false);
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
      setCameraActive(true);
    } catch (err) {
      console.error('Camera access denied:', err);
    }
  }, [facingMode]);

  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraActive]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

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
    stopCamera();
    generateSelfie(imageData);
  }, [facingMode, stopCamera, generateSelfie]);

  const downloadImage = useCallback(() => {
    if (!selfieResultImage) return;
    const a = document.createElement('a');
    a.href = selfieResultImage;
    a.download = `lucy-selfie-${Date.now()}.jpg`;
    a.click();
  }, [selfieResultImage]);

  const reset = useCallback(() => {
    resetSelfieGenState();
  }, [resetSelfieGenState]);

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
      {cameraActive && !selfieGenerating && (
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
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
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
      {selfieGenerating && (
        <div className="flex-1 flex flex-col items-center justify-center text-center" style={{ padding: '40px 32px' }}>
          <Sparkles size={44} className="animate-spin-slow" style={{ color: 'var(--accent)', marginBottom: '24px' }} />
          <p
            className="font-serif"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.4
            }}
          >
            Lucy is joining your photo...
          </p>
          <p style={{ fontSize: '14px', marginTop: '10px', color: 'var(--text-muted)' }}>
            Can take 20–40 seconds
          </p>
        </div>
      )}

      {/* Error state */}
      {selfieError && !selfieGenerating && (
        <div className="flex-1 flex flex-col items-center justify-center text-center" style={{ padding: '40px 32px' }}>
          <AlertTriangle size={40} style={{ color: '#ef4444', marginBottom: '20px' }} />
          <p style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Couldn't generate selfie
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '300px' }}>
            {selfieError}
          </p>
          <button
            onClick={reset}
            className="flex items-center font-semibold transition-transform active:scale-95"
            style={{
              gap: '8px',
              padding: '12px 26px',
              borderRadius: '999px',
              fontSize: '14px',
              background: 'linear-gradient(135deg, var(--accent-light), var(--accent-dark))',
              color: 'white',
              border: 'none',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
            }}
          >
            <RotateCcw size={16} />
            Try again
          </button>
        </div>
      )}

      {/* Composite result */}
      {selfieResultImage && !selfieGenerating && (
        <div className="flex-1 flex flex-col animate-fade-in-up" style={{ padding: '20px 16px 0' }}>
          <div
            className="overflow-hidden"
            style={{
              borderRadius: '20px',
              border: '1px solid var(--border-card)',
              boxShadow: 'var(--card-shadow)',
              marginBottom: '16px',
            }}
          >
            <img src={selfieResultImage} alt="Selfie with Lucy" className="w-full" />
          </div>
          <div className="flex" style={{ gap: '12px', marginBottom: '24px' }}>
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
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                cursor: 'pointer',
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
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={16} />
              Retake
            </button>
          </div>
        </div>
      )}

      {/* Initial idle state */}
      {!cameraActive && !selfieGenerating && !selfieResultImage && !selfieError && (
        <div className="flex-1 flex flex-col" style={{ padding: '0 16px 40px' }}>
          {/* Upper content area */}
          <div className="flex-1 flex flex-col items-center justify-center text-center" style={{ padding: '40px 0 20px' }}>
            {/* Lucy avatar preview */}
            <div
              className="relative animate-float"
              style={{ marginBottom: '24px' }}
            >
              <div
                className="overflow-hidden"
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '28px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                }}
              >
                <img
                  src="/sketched-logo.jpeg"
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
              className="font-serif"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                color: 'var(--text-primary)',
                fontSize: '30px',
                fontWeight: 700,
                lineHeight: 1.25,
                maxWidth: '300px',
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

            {/* Selfie limit counter */}
            <div
              style={{
                marginTop: '20px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: selfies.length >= 5 ? '#ef4444' : 'var(--text-secondary)',
                fontFamily: "'Space Mono', monospace",
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '99px',
                background: 'var(--bg-card-inner)',
                border: '1px solid var(--border-card)',
              }}
            >
              <span>{selfies.length} / 5 SELFIES USED</span>
            </div>

            <button
              onClick={startCamera}
              disabled={selfies.length >= 5}
              className="flex items-center font-semibold transition-transform active:scale-95"
              style={{
                gap: '10px',
                marginTop: '24px',
                padding: '14px 36px',
                borderRadius: '999px',
                fontSize: '15px',
                background: selfies.length >= 5
                  ? 'var(--text-muted)'
                  : 'linear-gradient(135deg, var(--accent-light), var(--accent-dark))',
                color: 'white',
                boxShadow: selfies.length >= 5 ? 'none' : '0 8px 28px rgba(0, 0, 0, 0.08)',
                border: 'none',
                cursor: selfies.length >= 5 ? 'not-allowed' : 'pointer',
                opacity: selfies.length >= 5 ? 0.6 : 1,
              }}
            >
              <Camera size={18} />
              Start camera
            </button>

            {selfies.length >= 5 && (
              <p
                style={{
                  fontSize: '12px',
                  color: '#ef4444',
                  marginTop: '12px',
                  maxWidth: '260px',
                  lineHeight: 1.4,
                }}
              >
                Selfie limit reached. Delete an existing selfie from your memories below to take another.
              </p>
            )}
          </div>

          {/* Selfie History Grid */}
          {selfies.length > 0 && (
            <div
              className="animate-fade-in-up"
              style={{
                marginTop: '16px',
                paddingTop: '28px',
                borderTop: '1px solid var(--border-card)',
                width: '100%',
              }}
            >
              <h3
                className="font-serif"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '16px',
                  textAlign: 'left',
                }}
              >
                Your Selfie Memories.
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                }}
              >
                {selfies.map((selfie) => (
                  <div
                    key={selfie.id}
                    className="relative overflow-hidden"
                    style={{
                      borderRadius: '16px',
                      border: '1px solid var(--border-card)',
                      background: 'var(--bg-card-inner)',
                      aspectRatio: '0.75',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <img
                      src={selfie.url}
                      alt="Lucy Selfie"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    {/* Action overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.65), transparent)',
                        padding: '10px',
                        display: 'flex',
                        gap: '8px',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <button
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = selfie.url;
                          a.download = `lucy-selfie-${selfie.id}.jpg`;
                          a.click();
                        }}
                        style={{
                          padding: '6px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.25)',
                          backdropFilter: 'blur(4px)',
                          border: 'none',
                          color: '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Download"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm("Delete this selfie permanently?")) {
                            deleteSelfie(selfie.id);
                          }
                        }}
                        style={{
                          padding: '6px',
                          borderRadius: '8px',
                          background: 'rgba(239, 68, 68, 0.25)',
                          backdropFilter: 'blur(4px)',
                          border: 'none',
                          color: '#FF4D4D',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom disclaimer */}
          <p
            style={{
              fontSize: '11.5px',
              color: 'var(--text-muted)',
              textAlign: 'center',
              paddingTop: '32px',
            }}
          >
            Lucy isn't really there. The photo will say otherwise.
          </p>
        </div>
      )}
    </div>
  );
}
