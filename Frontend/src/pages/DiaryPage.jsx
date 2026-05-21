import HeroCard from '../components/HeroCard';
import DiaryEntry from '../components/DiaryEntry';
import { useApp } from '../context/AppContext';
import { Loader2, WifiOff } from 'lucide-react';

export default function DiaryPage() {
  const { entries, entriesLoading, usingBackend } = useApp();

  return (
    <div id="diary-page" className="pb-safe">
      <HeroCard />

      {/* Connection status badge */}
      <div className="flex items-center justify-center" style={{ marginTop: '16px' }}>
        <div
          className="flex items-center"
          style={{
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '999px',
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            fontFamily: "'Space Mono', monospace",
            background: usingBackend ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
            color: usingBackend ? '#22c55e' : '#ef4444',
            border: `1px solid ${usingBackend ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
          }}
        >
          {usingBackend ? (
            <>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
              LIVE · MongoDB Atlas
            </>
          ) : (
            <>
              <WifiOff size={11} />
              OFFLINE · Static data
            </>
          )}
        </div>
      </div>

      {/* Loading state */}
      {entriesLoading && entries.length === 0 && (
        <div className="flex items-center justify-center" style={{ padding: '60px 0' }}>
          <Loader2 size={28} className="animate-spin-slow" style={{ color: 'var(--accent)' }} />
        </div>
      )}

      {/* Diary entries */}
      <div className="flex flex-col" style={{ gap: '20px', marginTop: '20px' }}>
        {entries.map((entry, index) => (
          <DiaryEntry key={entry.id} entry={entry} index={index} />
        ))}
      </div>

      {/* Empty state */}
      {!entriesLoading && entries.length === 0 && (
        <div
          className="flex flex-col items-center justify-center text-center"
          style={{ padding: '60px 20px' }}
        >
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
            No diary entries yet.
          </p>
          <p style={{ fontSize: '13px', marginTop: '6px', color: 'var(--text-muted)' }}>
            Add entries from the Admin console.
          </p>
        </div>
      )}
    </div>
  );
}
