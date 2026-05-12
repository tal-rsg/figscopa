'use client';

export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <span className="fc-logo" style={{ height: size }}>
      <svg viewBox="0 0 32 32" width={size} height={size}>
        <path d="M16 2 L 28 9 L 28 23 L 16 30 L 4 23 L 4 9 Z" fill="var(--fc-accent)" />
        <path d="M11 11 H 22 M 11 16 H 19 M 11 11 V 22" stroke="white" strokeWidth="2.4" strokeLinecap="square" fill="none" />
      </svg>
      <span className="fc-logo-text">FigsCopa</span>
    </span>
  );
}
