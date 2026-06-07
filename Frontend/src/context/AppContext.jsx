/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import staticEntries from '../data/entries';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const AppContext = createContext();

export function useApp() {
  return useContext(AppContext);
}

/**
 * Map a backend entry document into the shape the frontend components expect.
 */
function mapBackendEntry(e) {
  return {
    id: e._id,
    day: String(e.day).padStart(2, '0'),
    title: e.title,
    duration: e.duration || '0:00',
    lockType: e.triggerType === 'none' ? 'none' : e.triggerType,
    quote: e.caption ? `"${e.caption}"` : '',
    recordedAt: e.recordedAt ? `RECORDED ${e.recordedAt.toUpperCase()}` : '',
    thumbnail: e.posterUrl || '/lucy-vlog-thumb.png',
    videoUrl: e.videoUrl || null,
    // Lock specifics
    qrCode: e.qrCode || null,
    lockMessage: e.triggerHint || '',
    lockHint: e.triggerHint || '',
    cameraPrompt: e.cameraPrompt || '',
    lockDuration: (e.lockDuration || 5) * 60 * 1000,
    nextLocationHint: e.nextLocationHint || '',
    isLastEntry: !!e.isLastEntry,
  };
}

export function AppProvider({ children }) {
  // App Loading Screen (2.5s initial delay for premium feeling)
  const [appLoading, setAppLoading] = useState(true);

  const [onboardingCompleted, setOnboardingCompleted] = useState(() => {
    return localStorage.getItem('lucy-onboarding-completed') === 'true';
  });

  // User auth state
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('lucy-user');
    return saved ? JSON.parse(saved) : null;
  });

  // Camera permissions explanation screen state
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(() => {
    return localStorage.getItem('lucy-camera-permission-granted') === 'true';
  });

  // Entries (fetched from API, falls back to static)
  const [entries, setEntries] = useState(staticEntries);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [entriesError, setEntriesError] = useState(null);
  const [usingBackend, setUsingBackend] = useState(false);

  // Ref to prevent double-fetch in StrictMode
  const fetchedRef = useRef(false);

  // Fetch entries from backend
  const fetchEntries = useCallback(async () => {
    setEntriesLoading(true);
    setEntriesError(null);
    try {
      const res = await fetch(`${API_URL}/entries`);
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data = await res.json();
      if (data.length > 0) {
        setEntries(data.map(mapBackendEntry));
        setUsingBackend(true);
      } else {
        setEntries(staticEntries);
        setUsingBackend(true);
      }
    } catch {
      setUsingBackend(false);
    } finally {
      setEntriesLoading(false);
    }
  }, []);

  // Public refresh function — called by admin page after saving
  const refreshEntries = useCallback(async () => {
    await fetchEntries();
  }, [fetchEntries]);

  // Initial fetch on mount
  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchEntries();
    }
  }, [fetchEntries]);

  // Loading screen timer (runs safely on mount/remount in StrictMode)
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 2200);
    
    return () => clearTimeout(timer);
  }, []);

  // Track which entries are unlocked
  const [unlockedEntries, setUnlockedEntries] = useState(() => {
    const saved = localStorage.getItem('lucy-unlocked');
    const defaults = staticEntries.filter(e => e.lockType === 'none').map(e => String(e.id));
    if (saved) {
      const parsed = JSON.parse(saved);
      return [...new Set([...defaults, ...parsed.map(String)])];
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

  // Sync isAdmin with currentUser role
  useEffect(() => {
    if (currentUser) {
      const isUserAdmin = currentUser.role === 'admin';
      setIsAdmin(isUserAdmin);
      localStorage.setItem('lucy-admin', isUserAdmin ? 'true' : 'false');
    } else {
      const savedAdmin = localStorage.getItem('lucy-admin') === 'true';
      setIsAdmin(savedAdmin);
    }
  }, [currentUser]);

  // Selfie photos taken
  const [selfies, setSelfies] = useState(() => {
    const saved = localStorage.getItem('lucy-selfies');
    return saved ? JSON.parse(saved) : [];
  });

  const [selfieGenerating, setSelfieGenerating] = useState(false);
  const [selfieCapturedImage, setSelfieCapturedImage] = useState(null);
  const [selfieResultImage, setSelfieResultImage] = useState(null);
  const [selfieError, setSelfieError] = useState(null);

  // Scanned QR codes history
  const [scannedCodes, setScannedCodes] = useState(() => {
    const saved = localStorage.getItem('lucy-scanned');
    return saved ? JSON.parse(saved) : [];
  });

  // Auto-unlock entries with lockType 'none' when entries load from API
  useEffect(() => {
    const noneIds = entries.filter(e => e.lockType === 'none').map(e => String(e.id));
    if (noneIds.length > 0) {
      setUnlockedEntries(prev => {
        const updated = [...new Set([...prev, ...noneIds])];
        if (updated.length !== prev.length) return updated;
        return prev;
      });
    }
  }, [entries]);

  // Sync unlocked entries when signed in or when new ones unlock
  useEffect(() => {
    localStorage.setItem('lucy-unlocked', JSON.stringify(unlockedEntries));
    
    // Sync with backend if logged in
    if (currentUser?.id) {
      const syncProgress = async () => {
        try {
          const res = await fetch(`${API_URL}/auth/sync-unlocked`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser.id,
              unlockedEntries
            })
          });
          if (res.ok) {
            const data = await res.json();
            // Merge merged unlocked list from DB back to state
            const serverUnlocked = data.unlockedEntries.map(String);
            setUnlockedEntries(prev => [...new Set([...prev, ...serverUnlocked])]);
          }
        } catch (e) {
          console.warn('Could not sync unlocked entries to server:', e);
        }
      };
      syncProgress();
    }
  }, [unlockedEntries, currentUser]);

  // Update clock
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Unlock an entry
  const unlockEntry = useCallback((entryId) => {
    setUnlockedEntries(prev => {
      const id = String(entryId);
      if (prev.includes(id)) return prev;
      return [...prev, id];
    });
  }, []);

  // Check if entry is unlocked
  const isEntryUnlocked = useCallback((entryId) => {
    return unlockedEntries.includes(String(entryId));
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
      setScannedCodes(prev => {
        const updated = [...new Set([...prev, scannedValue])];
        localStorage.setItem('lucy-scanned', JSON.stringify(updated));
        return updated;
      });
      return { success: true, entry: matchingEntry };
    }
    return { success: false, entry: null };
  }, [entries, unlockEntry]);

  // Reset selfie generation state
  const resetSelfieGenState = useCallback(() => {
    setSelfieCapturedImage(null);
    setSelfieResultImage(null);
    setSelfieError(null);
    setSelfieGenerating(false);
  }, []);

  // Upload image to Cloudinary (using unsigned preset)
  const uploadSelfieToCloudinary = async (base64Image) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !preset || cloudName === 'your_cloud_name' || preset === 'your_unsigned_preset') {
      console.warn('Cloudinary not configured for selfies, using local base64 fallback.');
      return base64Image;
    }

    const formData = new FormData();
    formData.append('file', base64Image);
    formData.append('upload_preset', preset);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error?.message || 'Cloudinary upload failed');
      }

      const data = await res.json();
      return data.secure_url || base64Image;
    } catch (err) {
      console.error('Cloudinary selfie upload error:', err);
      return base64Image;
    }
  };

  // Sync selfies list to server
  const syncSelfiesWithServer = async (userId, selfiesList) => {
    try {
      const res = await fetch(`${API_URL}/auth/sync-selfies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          selfies: selfiesList
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data.selfies || selfiesList;
      }
    } catch (e) {
      console.warn('Could not sync selfies with server:', e);
    }
    return selfiesList;
  };

  // Generate a selfie
  const generateSelfie = useCallback(async (capturedBase64) => {
    if (!currentUser?.id) {
      setSelfieError('Please log in to create a selfie.');
      return;
    }

    setSelfieGenerating(true);
    setSelfieCapturedImage(capturedBase64);
    setSelfieResultImage(null);
    setSelfieError(null);

    try {
      // 1. Compose selfie with Lucy on backend
      const res = await fetch(`${API_URL}/selfie/compose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: capturedBase64, userId: currentUser.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Selfie generation failed.');
      }

      const compositeB64 = data.image;

      // 2. Upload composite to Cloudinary
      const cloudinaryUrl = await uploadSelfieToCloudinary(compositeB64);

      // 3. Update selfies list state
      const newSelfie = {
        id: String(Date.now()),
        url: cloudinaryUrl,
        timestamp: new Date().toISOString()
      };

      setSelfies(prev => {
        const updatedSelfies = [...prev, newSelfie];
        localStorage.setItem('lucy-selfies', JSON.stringify(updatedSelfies));
        // Async sync to DB
        syncSelfiesWithServer(currentUser.id, updatedSelfies);
        return updatedSelfies;
      });

      setSelfieResultImage(cloudinaryUrl);
    } catch (err) {
      console.error('generateSelfie error:', err);
      setSelfieError(err.message || 'Could not generate selfie.');
    } finally {
      setSelfieGenerating(false);
    }
  }, [currentUser]);

  // Delete a selfie
  const deleteSelfie = useCallback(async (selfieId) => {
    const idToDelete = String(selfieId);
    setSelfies(prev => {
      const updatedSelfies = prev.filter(s => String(s.id) !== idToDelete);
      localStorage.setItem('lucy-selfies', JSON.stringify(updatedSelfies));
      if (currentUser?.id) {
        syncSelfiesWithServer(currentUser.id, updatedSelfies);
      }
      return updatedSelfies;
    });
  }, [currentUser]);

  // Complete onboarding
  const completeOnboarding = useCallback(() => {
    setOnboardingCompleted(true);
    localStorage.setItem('lucy-onboarding-completed', 'true');
  }, []);

  // Camera permissions prompt wrapper
  const requestCameraPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Stop the stream immediately, we only wanted to request permission
      stream.getTracks().forEach(track => track.stop());
      setCameraPermissionGranted(true);
      localStorage.setItem('lucy-camera-permission-granted', 'true');
      return true;
    } catch (err) {
      console.warn('Camera permission denied or not supported:', err);
      // Still set true in state to bypass prompt if user decides or if browser mocks it
      setCameraPermissionGranted(true);
      localStorage.setItem('lucy-camera-permission-granted', 'true');
      return false;
    }
  }, []);

  // Register User
  const registerUser = useCallback(async (username, email, password, role = 'user', adminCode = '') => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role, adminCode })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      
      setCurrentUser(data);
      localStorage.setItem('lucy-user', JSON.stringify(data));
      // Load user's unlocked entries
      if (data.unlockedEntries && data.unlockedEntries.length > 0) {
        setUnlockedEntries(prev => [...new Set([...prev, ...data.unlockedEntries.map(String)])]);
      }
      if (data.selfies) {
        setSelfies(data.selfies);
        localStorage.setItem('lucy-selfies', JSON.stringify(data.selfies));
      } else {
        setSelfies([]);
        localStorage.removeItem('lucy-selfies');
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Cannot connect to authentication server' };
    }
  }, []);

  // Login User
  const loginUser = useCallback(async (emailOrUsername, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername, password })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Invalid credentials' };
      }
      
      setCurrentUser(data);
      localStorage.setItem('lucy-user', JSON.stringify(data));
      // Merge user's unlocked entries
      if (data.unlockedEntries && data.unlockedEntries.length > 0) {
        setUnlockedEntries(prev => [...new Set([...prev, ...data.unlockedEntries.map(String)])]);
      }
      if (data.selfies) {
        setSelfies(data.selfies);
        localStorage.setItem('lucy-selfies', JSON.stringify(data.selfies));
      } else {
        setSelfies([]);
        localStorage.removeItem('lucy-selfies');
      }
      return { success: true };
    } catch {
      return { success: false, error: 'Cannot connect to authentication server' };
    }
  }, []);

  // Logout User
  const logoutUser = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('lucy-user');
    localStorage.removeItem('lucy-admin');
    localStorage.removeItem('lucy-selfies');
    setSelfies([]);
    setIsAdmin(false);
    resetSelfieGenState();
    // Keep local unlocks or reset to defaults
    const defaults = staticEntries.filter(e => e.lockType === 'none').map(e => String(e.id));
    setUnlockedEntries(defaults);
    localStorage.setItem('lucy-unlocked', JSON.stringify(defaults));
  }, [resetSelfieGenState]);

  const value = {
    appLoading,
    onboardingCompleted,
    completeOnboarding,
    currentUser,
    registerUser,
    loginUser,
    logoutUser,
    cameraPermissionGranted,
    requestCameraPermission,
    entries,
    entriesLoading,
    entriesError,
    usingBackend,
    refreshEntries,
    unlockedEntries,
    unlockEntry,
    isEntryUnlocked,
    currentTime,
    arrivalTime,
    getTimeRemaining,
    tryQrUnlock,
    scannedCodes,
    isAdmin,
    selfies,
    generateSelfie,
    deleteSelfie,
    selfieGenerating,
    selfieCapturedImage,
    selfieResultImage,
    selfieError,
    resetSelfieGenState,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
