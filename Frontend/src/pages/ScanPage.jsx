import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Html5Qrcode } from 'html5-qrcode';
import { ScanLine, X, CheckCircle, XCircle, QrCode } from 'lucide-react';

/**
 * Extract the QR payload from either a raw value (e.g. "LUCY-DAY02-WALK")
 * or a deep-link URL like "https://app/scan?code=LUCY-DAY02-WALK".
 */
function extractCode(scanned) {
  if (!scanned) return scanned;
  try {
    const u = new URL(scanned);
    const c = u.searchParams.get('code');
    if (c) return c;
  } catch {
    // not a URL, treat raw
  }
  return scanned;
}

export default function ScanPage() {
  const { tryQrUnlock, entries } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null); // { success, entry }
  const [scanError, setScanError] = useState(null);
  const scannerRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-unlock when arriving via a deep-link QR (e.g. /scan?code=LUCY-DAY02).
  // Wait until entries are loaded so tryQrUnlock can find a match.
  useEffect(() => {
    const codeParam = searchParams.get('code');
    if (!codeParam || entries.length === 0) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      const unlockResult = tryQrUnlock(extractCode(codeParam));
      setResult(unlockResult);
      const next = new URLSearchParams(searchParams);
      next.delete('code');
      setSearchParams(next, { replace: true });
    });
    return () => { cancelled = true; };
  }, [searchParams, entries, tryQrUnlock, setSearchParams]);

  const startScanner = () => {
    setResult(null);
    setScanError(null);
    setScanning(true); // show container first so Html5Qrcode can measure it
  };

  // Start the actual camera once the container is visible
  useEffect(() => {
    if (!scanning) return;
    let cancelled = false;

    const init = async () => {
      try {
        const scanner = new Html5Qrcode('qr-reader');
        if (cancelled) return;
        scannerRef.current = scanner;
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
          (decodedText) => {
            const code = extractCode(decodedText);
            const unlockResult = tryQrUnlock(code);
            setResult(unlockResult);
            stopScanner();
          },
          () => {}
        );
      } catch (err) {
        if (cancelled) return;
        console.error('Scanner error:', err);
        setScanning(false);
        const denied = err?.name === 'NotAllowedError' || err?.message?.includes('Permission');
        setScanError(denied
          ? 'Camera permission denied. Allow camera access in your browser settings and try again.'
          : 'Could not start the camera. Make sure no other app is using it.');
      }
    };

    init();
    return () => { cancelled = true; };
  }, [scanning]);

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
      <div style={{ padding: '28px 16px 0' }}>
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
          className="font-serif"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            color: 'var(--text-primary)',
            fontSize: '32px',
            fontWeight: 700,
            lineHeight: 1.15,
            marginBottom: '8px',
          }}
        >
          Scan to unlock.
        </h1>
        <p style={{ fontSize: '14px', lineHeight: 1.55, color: 'var(--text-secondary)' }}>
          Find Lucy's QR codes hidden at each location. Each one reveals the next chapter.
        </p>
      </div>

      {/* Scanner area */}
      <div className="flex-1 flex flex-col items-center justify-center" style={{ padding: '24px 16px' }}>
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
              className="font-serif"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1.3,
                marginBottom: '8px',
              }}
            >
              Ready to scan.
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
                boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
              }}
            >
              <ScanLine size={20} />
              Open scanner
            </button>
            {scanError && (
              <p style={{ marginTop: '16px', fontSize: '13px', color: '#ef4444', maxWidth: '280px', textAlign: 'center' }}>
                {scanError}
              </p>
            )}
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
              
              {/* Custom Centered Viewfinder Scan Box Overlay */}
              <div
                className="absolute inset-0 pointer-events-none flex items-center justify-center"
                style={{ zIndex: 5 }}
              >
                {/* 240px wide cutout box (approx 70% of 340px max) */}
                <div
                  style={{
                    width: '70%',
                    height: '70%',
                    position: 'relative',
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)', // Draws outer shaded area
                    borderRadius: '16px',
                  }}
                >
                  {/* Top-Left Corner */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '24px',
                      height: '24px',
                      borderTop: '4px solid #FFFFFF',
                      borderLeft: '4px solid #FFFFFF',
                      borderTopLeftRadius: '8px',
                    }}
                  />
                  {/* Top-Right Corner */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '24px',
                      height: '24px',
                      borderTop: '4px solid #FFFFFF',
                      borderRight: '4px solid #FFFFFF',
                      borderTopRightRadius: '8px',
                    }}
                  />
                  {/* Bottom-Left Corner */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '24px',
                      height: '24px',
                      borderBottom: '4px solid #FFFFFF',
                      borderLeft: '4px solid #FFFFFF',
                      borderBottomLeftRadius: '8px',
                    }}
                  />
                  {/* Bottom-Right Corner */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '24px',
                      height: '24px',
                      borderBottom: '4px solid #FFFFFF',
                      borderRight: '4px solid #FFFFFF',
                      borderBottomRightRadius: '8px',
                    }}
                  />

                  {/* Animated scan line inside the box */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '8px',
                      right: '8px',
                      height: '2px',
                      background: 'linear-gradient(90deg, transparent, #FFFFFF, transparent)',
                      animation: 'scanLine 2.5s ease-in-out infinite',
                      top: '50%',
                    }}
                  />
                </div>
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
                  className="font-serif"
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '26px',
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
                  className="font-serif"
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '26px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                  }}
                >
                  Not recognised.
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
                boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
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
