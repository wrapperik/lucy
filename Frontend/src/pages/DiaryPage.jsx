import HeroCard from '../components/HeroCard';
import DiaryEntry from '../components/DiaryEntry';
import { useApp } from '../context/AppContext';

export default function DiaryPage() {
  const { entries } = useApp();

  return (
    <div id="diary-page" className="pb-safe">
      <HeroCard />
      <div className="flex flex-col" style={{ gap: '20px', marginTop: '20px' }}>
        {entries.map((entry, index) => (
          <DiaryEntry key={entry.id} entry={entry} index={index} />
        ))}
      </div>
    </div>
  );
}
