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

  const startScanner = async () => {
    setResult(null);
    setScanError(null);
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
          // QR code successfully scanned — strip wrapping URL if present
          const code = extractCode(decodedText);
          const unlockResult = tryQrUnlock(code);
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
      const denied = err?.name === 'NotAllowedError' || err?.message?.includes('Permission');
      setScanError(denied
        ? 'Camera permission denied. Allow camera access in your browser settings and try again.'
        : 'Could not start the camera. Make sure no other app is using it.');
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

        {/* Scanner container — always in DOM so Html5Qrcode can find the element */}
        <div className="w-full flex flex-col items-center" style={{ display: scanning ? 'flex' : 'none' }}>
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
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ border: '3px solid transparent' }}
            >
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
