import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Html5Qrcode } from 'html5-qrcode';
import { ScanLine, X, CheckCircle, XCircle, QrCode } from 'lucide-react';

export default function ScanPage() {
  const { tryQrUnlock } = useApp();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null); // { success, entry }
  const scannerRef = useRef(null);
  const containerRef = useRef(null);

  const startScanner = async () => {
    setResult(null);
    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // QR code successfully scanned
          const unlockResult = tryQrUnlock(decodedText);
          setResult(unlockResult);
          stopScanner();
        },
        () => {
          // scan failure - ignore, keep scanning
        }
      );
      setScanning(true);
    } catch (err) {
      console.error('Scanner error:', err);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch {
        // ignore cleanup errors
      }
      scannerRef.current = null;
    }
    setScanning(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div
      id="scan-page"
      className="pb-safe flex flex-col"
      style={{ minHeight: 'calc(100vh - var(--nav-height))' }}
    >
      {/* Header */}
      <div style={{ padding: '28px 20px 0' }}>
        <p
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            fontFamily: "'Space Mono', monospace",
            marginBottom: '10px',
          }}
        >
          QR SCANNER
        </p>
        <h1
          style={{
            fontFamily: "'Outfit', sans-serif",
            color: 'var(--text-primary)',
            fontSize: '28px',
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: '8px',
          }}
        >
          Scan to unlock
        </h1>
        <p style={{ fontSize: '14px', lineHeight: 1.55, color: 'var(--text-secondary)' }}>
          Find Lucy's QR codes hidden at each location. Each one reveals the next chapter.
        </p>
      </div>

      {/* Scanner area */}
      <div className="flex-1 flex flex-col items-center justify-center" style={{ padding: '24px 20px' }}>
        {!scanning && !result && (
          <div className="flex flex-col items-center text-center">
            <div
              className="flex items-center justify-center animate-float"
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '28px',
                background: 'var(--accent-glow)',
                border: '1px solid var(--accent-glow-strong)',
                marginBottom: '28px',
              }}
            >
              <QrCode size={44} style={{ color: 'var(--accent)' }} />
            </div>
            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '22px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.3,
                marginBottom: '8px',
              }}
            >
              Ready to scan
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '28px', maxWidth: '260px' }}>
              Point your camera at a QR code to unlock the next diary entry.
            </p>
            <button
              onClick={startScanner}
              className="flex items-center font-semibold transition-transform active:scale-95"
              style={{
                gap: '10px',
                padding: '14px 32px',
                borderRadius: '999px',
                fontSize: '15px',
                background: 'linear-gradient(135deg, var(--accent-light), var(--accent-dark))',
                color: 'white',
                border: 'none',
                boxShadow: '0 8px 28px rgba(243, 129, 85, 0.25)',
              }}
            >
              <ScanLine size={20} />
              Open scanner
            </button>
          </div>
        )}

        {/* Active scanner */}
        {scanning && (
          <div className="w-full flex flex-col items-center">
            <div
              className="relative w-full overflow-hidden"
              style={{
                borderRadius: '20px',
                border: '1px solid var(--border-card)',
                maxWidth: '340px',
                aspectRatio: '1',
              }}
            >
              <div id="qr-reader" ref={containerRef} style={{ width: '100%' }} />
              {/* Scanning overlay corners */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ border: '3px solid transparent' }}
              >
                {/* Animated scan line */}
                <div
                  className="absolute left-4 right-4"
                  style={{
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
                    animation: 'scanLine 2s ease-in-out infinite',
                    top: '50%',
                  }}
                />
              </div>
            </div>
            <button
              onClick={stopScanner}
              className="flex items-center font-medium transition-transform active:scale-95"
              style={{
                gap: '8px',
                marginTop: '20px',
                padding: '12px 24px',
                borderRadius: '14px',
                fontSize: '14px',
                background: 'var(--bg-card)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-card)',
              }}
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="flex flex-col items-center text-center animate-fade-in-up">
            {result.success ? (
              <>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.25)',
                    marginBottom: '20px',
                  }}
                >
                  <CheckCircle size={40} style={{ color: '#22c55e' }} />
                </div>
                <h2
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '24px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}
                >
                  Entry unlocked!
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Day {result.entry.day} — {result.entry.title}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '28px' }}>
                  Go to the Diary to watch it.
                </p>
              </>
            ) : (
              <>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    marginBottom: '20px',
                  }}
                >
                  <XCircle size={40} style={{ color: '#ef4444' }} />
                </div>
                <h2
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '24px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}
                >
                  Not recognised
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '28px' }}>
                  This QR code doesn't match any of Lucy's diary entries.
                </p>
              </>
            )}
            <button
              onClick={() => setResult(null)}
              className="flex items-center font-semibold transition-transform active:scale-95"
              style={{
                gap: '10px',
                padding: '14px 32px',
                borderRadius: '999px',
                fontSize: '15px',
                background: 'linear-gradient(135deg, var(--accent-light), var(--accent-dark))',
                color: 'white',
                border: 'none',
                boxShadow: '0 8px 28px rgba(243, 129, 85, 0.25)',
              }}
            >
              <ScanLine size={18} />
              Scan again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
