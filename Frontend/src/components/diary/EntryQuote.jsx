export default function EntryQuote({ quote, recordedAt }) {
  return (
    <div style={{ padding: '14px 22px 20px' }}>
      <p
        style={{
          fontSize: '13.5px',
          fontStyle: 'italic',
          lineHeight: 1.65,
          color: 'var(--text-secondary)',
        }}
      >
        {quote}
      </p>
      <p
        style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.15em',
          marginTop: '14px',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          fontFamily: "'Space Mono', monospace",
        }}
      >
        {recordedAt}
      </p>
    </div>
  );
}
