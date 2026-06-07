import HeroCard from '../components/HeroCard';
import DiaryEntry from '../components/DiaryEntry';
import { useApp } from '../context/AppContext';
import { StarsLinear } from '@solar-icons/react-perf';

export default function DiaryPage() {
  const { entries, entriesLoading } = useApp();

  return (
    <div id="diary-page" className="pb-safe">
      <HeroCard />

      {/* Loading state */}
      {entriesLoading && entries.length === 0 && (
        <div className="flex items-center justify-center" style={{ padding: '60px 0' }}>
          <StarsLinear size={28} className="animate-spin-slow" style={{ color: 'var(--accent)' }} />
        </div>
      )}

      {/* Diary entries */}
      <div className="flex flex-col" style={{ gap: '20px', padding: '0', marginTop: '20px' }}>
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
