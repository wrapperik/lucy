export default function HeroAvatar({ src, alt }) {
  return (
    <div className="relative shrink-0">
      <img
        src={src}
        alt={alt}
        className="rounded-full object-cover"
        style={{
          width: '60px',
          height: '60px',
          border: '2.5px solid rgba(200, 149, 108, 0.35)',
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          bottom: '-1px',
          right: '-1px',
          width: '14px',
          height: '14px',
          backgroundColor: 'var(--accent)',
          border: '2.5px solid var(--bg-card)',
        }}
      />
    </div>
  );
}
