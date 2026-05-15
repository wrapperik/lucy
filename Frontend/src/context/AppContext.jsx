import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import entries from '../data/entries';

const AppContext = createContext();

export function useApp() {
  return useContext(AppContext);
}

export function AppProvider({ children }) {
  // Track which entries are unlocked
  const [unlockedEntries, setUnlockedEntries] = useState(() => {
    const saved = localStorage.getItem('lucy-unlocked');
    const defaults = entries.filter(e => e.lockType === 'none').map(e => e.id);
    if (saved) {
      const parsed = JSON.parse(saved);
      return [...new Set([...defaults, ...parsed])];
    }
    return defaults;
  });

  // Time-lock tracking: when user first arrived
  const [arrivalTime] = useState(() => {
    const saved = localStorage.getItem('lucy-arrival');
    if (saved) return parseInt(saved);
    const now = Date.now();
    localStorage.setItem('lucy-arrival', now.toString());
    return now;
  });

  // Current time display
  const [currentTime, setCurrentTime] = useState(new Date());

  // Admin authenticated
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('lucy-admin') === 'true';
  });

  // Selfie photos taken
  const [selfies, setSelfies] = useState(() => {
    const saved = localStorage.getItem('lucy-selfies');
    return saved ? JSON.parse(saved) : [];
  });

  // Scanned QR codes history
  const [scannedCodes, setScannedCodes] = useState(() => {
    const saved = localStorage.getItem('lucy-scanned');
    return saved ? JSON.parse(saved) : [];
  });

  // Update clock
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Save unlocked entries
  useEffect(() => {
    localStorage.setItem('lucy-unlocked', JSON.stringify(unlockedEntries));
  }, [unlockedEntries]);

  // Unlock an entry
  const unlockEntry = useCallback((entryId) => {
    setUnlockedEntries(prev => {
      if (prev.includes(entryId)) return prev;
      return [...prev, entryId];
    });
  }, []);

  // Check if entry is unlocked
  const isEntryUnlocked = useCallback((entryId) => {
    return unlockedEntries.includes(entryId);
  }, [unlockedEntries]);

  // Get time remaining for time-locked entries
  const getTimeRemaining = useCallback((entry) => {
    if (entry.lockType !== 'time') return 0;
    const elapsed = Date.now() - arrivalTime;
    const remaining = entry.lockDuration - elapsed;
    return Math.max(0, remaining);
  }, [arrivalTime]);

  // Try to unlock via QR code
  const tryQrUnlock = useCallback((scannedValue) => {
    const matchingEntry = entries.find(
      e => e.lockType === 'qr' && e.qrCode === scannedValue
    );
    if (matchingEntry) {
      unlockEntry(matchingEntry.id);
      // Track scanned code
      setScannedCodes(prev => {
        const updated = [...new Set([...prev, scannedValue])];
        localStorage.setItem('lucy-scanned', JSON.stringify(updated));
        return updated;
      });
      return { success: true, entry: matchingEntry };
    }
    return { success: false, entry: null };
  }, [unlockEntry]);

  // Admin login
  const loginAdmin = useCallback((passphrase) => {
    if (passphrase.toLowerCase() === 'lucy') {
      setIsAdmin(true);
      localStorage.setItem('lucy-admin', 'true');
      return true;
    }
    return false;
  }, []);

  // Save selfie
  const saveSelfie = useCallback((imageData) => {
    const newSelfies = [...selfies, { id: Date.now(), image: imageData, timestamp: new Date().toISOString() }];
    setSelfies(newSelfies);
    localStorage.setItem('lucy-selfies', JSON.stringify(newSelfies));
  }, [selfies]);

  const value = {
    entries,
    unlockedEntries,
    unlockEntry,
    isEntryUnlocked,
    currentTime,
    arrivalTime,
    getTimeRemaining,
    tryQrUnlock,
    scannedCodes,
    isAdmin,
    loginAdmin,
    selfies,
    saveSelfie,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
