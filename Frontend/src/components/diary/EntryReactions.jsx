import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';

const EMOJIS = ['❤️', '🔥', '😢', '✨'];
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const LOCAL_KEY = 'lucy-reactions';

/** Read local reactions from localStorage */
function getLocalReactions() {
  try {
    const saved = localStorage.getItem(LOCAL_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

/** Save local reactions to localStorage */
function saveLocalReactions(data) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
}

export default function EntryReactions({ entryId }) {
  const { currentUser, usingBackend } = useApp();
  const [counts, setCounts] = useState({});
  const [userReactions, setUserReactions] = useState([]);
  const [animatingEmoji, setAnimatingEmoji] = useState(null);

  // Generate a stable guest ID if not logged in
  const getUserId = useCallback(() => {
    if (currentUser?.id) return currentUser.id;
    let guestId = localStorage.getItem('lucy-guest-id');
    if (!guestId) {
      guestId = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem('lucy-guest-id', guestId);
    }
    return guestId;
  }, [currentUser]);

  // Fetch reactions on mount
  useEffect(() => {
    if (usingBackend) {
      // Try backend first
      const fetchReactions = async () => {
        try {
          const userId = getUserId();
          const res = await fetch(`${API_URL}/reactions/${entryId}?userId=${userId}`);
          if (res.ok) {
            const data = await res.json();
            setCounts(data.counts || {});
            setUserReactions(data.userReactions || []);
            return;
          }
        } catch {
          // Fall through to local
        }
        // Fallback to local
        loadLocal();
      };
      fetchReactions();
    } else {
      loadLocal();
    }

    function loadLocal() {
      const all = getLocalReactions();
      const entryData = all[entryId] || {};
      const userId = getUserId();
      // Build counts from all users
      const c = {};
      const ur = [];
      for (const [uid, emojis] of Object.entries(entryData)) {
        for (const emoji of emojis) {
          c[emoji] = (c[emoji] || 0) + 1;
          if (uid === userId) ur.push(emoji);
        }
      }
      setCounts(c);
      setUserReactions(ur);
    }
  }, [entryId, getUserId, usingBackend]);

  const handleToggle = async (emoji) => {
    const userId = getUserId();
    const wasActive = userReactions.includes(emoji);

    // Optimistic update
    setUserReactions((prev) =>
      wasActive ? prev.filter((e) => e !== emoji) : [...prev, emoji]
    );
    setCounts((prev) => ({
      ...prev,
      [emoji]: Math.max(0, (prev[emoji] || 0) + (wasActive ? -1 : 1)),
    }));

    // Trigger pop animation
    setAnimatingEmoji(emoji);
    setTimeout(() => setAnimatingEmoji(null), 400);

    if (usingBackend) {
      // Sync to backend
      try {
        const res = await fetch(`${API_URL}/reactions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entryId, userId, emoji }),
        });
        if (res.ok) {
          const data = await res.json();
          setCounts(data.counts || {});
          setUserReactions(data.userReactions || []);
          return;
        }
      } catch {
        // Fall through to revert
      }
      // Revert on failure
      setUserReactions((prev) =>
        wasActive ? [...prev, emoji] : prev.filter((e) => e !== emoji)
      );
      setCounts((prev) => ({
        ...prev,
        [emoji]: Math.max(0, (prev[emoji] || 0) + (wasActive ? 1 : -1)),
      }));
    } else {
      // Save to localStorage
      const all = getLocalReactions();
      if (!all[entryId]) all[entryId] = {};
      if (!all[entryId][userId]) all[entryId][userId] = [];

      if (wasActive) {
        all[entryId][userId] = all[entryId][userId].filter((e) => e !== emoji);
      } else {
        all[entryId][userId].push(emoji);
      }
      saveLocalReactions(all);
    }
  };

  return (
    <div
      className="flex items-center justify-center"
      style={{ gap: '10px', padding: '8px 0' }}
    >
      {EMOJIS.map((emoji) => {
        const isActive = userReactions.includes(emoji);
        const count = counts[emoji] || 0;
        const isAnimating = animatingEmoji === emoji;

        return (
          <button
            key={emoji}
            onClick={() => handleToggle(emoji)}
            className={`reaction-btn${isActive ? ' active' : ''}${isAnimating ? ' animate-pop' : ''}`}
            aria-label={`React with ${emoji}`}
          >
            <span className="reaction-emoji">{emoji}</span>
            {count > 0 && <span className="reaction-count">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
