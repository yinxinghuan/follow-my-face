export function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return <svg viewBox="0 0 32 32" aria-hidden="true" className={`fmf-arrow fmf-arrow--${direction}`}>
    <path d="M27 16H6M14 7l-9 9 9 9" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}

export function SoundIcon({ muted }: { muted: boolean }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d={muted ? 'm17 9 5 6m0-6-5 6' : 'M17 8c2 2 2 6 0 8'} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
}
