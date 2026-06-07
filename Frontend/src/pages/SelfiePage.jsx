import { useState, useRef, useCallback, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Camera, Download, RotateCcw, X, Sparkles, AlertTriangle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function SelfiePage() {
  const { saveSelfie } = useApp();
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [compositeImage, setCompositeImage] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const [error, setError] = useState(null);
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

  // Send selfie to backend, which calls Gemini 3 Pro image gen to insert
  // Lucy into the photo as a hyper-realistic friend standing next to the user.
  const composeLucy = useCallback(async (selfieData) => {
    setError(null);
    try {
      const res = await fetch(`${API_URL}/selfie/compose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: selfieData }),
      });
      const data = await res.json();
      if (!res.ok || !data.image) {
        throw new Error(data.error || 'Gemini did not return an image.');
      }
      setCompositeImage(data.image);
      saveSelfie(data.image);
    } catch (err) {
      console.error('Selfie compose failed:', err);
      setError(err.message || 'Could not generate selfie.');
    } finally {
      setProcessing(false);
    }
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
    composeLucy(imageData);
  }, [facingMode, stopCamera, composeLucy]);

  const downloadImage = useCallback(() => {
    if (!compositeImage) return;
    const a = document.createElement('a');
    a.href = compositeImage;
    a.download = `lucy-selfie-${Date.now()}.jpg`;
    a.click();
  }, [compositeImage]);

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const imageData = ev.target?.result;
      if (typeof imageData === 'string') {
        setCapturedImage(imageData);
        setProcessing(true);
        composeLucy(imageData);
      }
    };
    reader.readAsDataURL(file);
  }, [composeLucy]);

  const reset = useCallback(() => {
    setCapturedImage(null);
    setCompositeImage(null);
    setProcessing(false);
    setError(null);
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
      {processing && (
        <div className="flex-1 flex flex-col items-center justify-center text-center" style={{ padding: '0 32px' }}>
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
            Generating with Gemini 3 Pro — can take 20–40 seconds
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !processing && !compositeImage && (
        <div className="flex-1 flex flex-col items-center justify-center text-center" style={{ padding: '0 32px' }}>
          <AlertTriangle size={40} style={{ color: '#ef4444', marginBottom: '20px' }} />
          <p style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Couldn't generate selfie
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '300px' }}>
            {error}
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
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
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
                boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
                border: 'none',
              }}
            >
              <Camera size={18} />
              Start camera
            </button>

            {/* File upload fallback */}
            <div
              style={{
                marginTop: '20px',
                padding: '16px 20px',
                borderRadius: '14px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                  }}
                >
                  or upload an image
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <span
                  style={{
                    fontSize: '13px',
                    color: 'var(--accent)',
                    fontWeight: 500,
                  }}
                >
                  Choose file
                </span>
              </label>
            </div>
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
