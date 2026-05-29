export default function EntryHeader({ day, duration, title }) {
  return (
    <div style={{ padding: '22px 22px 12px' }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            fontFamily: "'Space Mono', monospace",
          }}
        >
          DAY {day}
        </span>
        <span
          style={{
            fontSize: '11px',
            padding: '4px 10px',
            borderRadius: '8px',
            color: 'var(--accent)',
            fontFamily: "'Space Mono', monospace",
            background: 'var(--accent-glow)',
          }}
        >
          {duration}
        </span>
      </div>
      <h2
        style={{
          fontFamily: "'Outfit', sans-serif",
          color: 'var(--text-primary)',
          fontSize: '24px',
          fontWeight: 700,
          lineHeight: 1.2,
        }}
      >
        {title}
      </h2>
    </div>
  );
}
