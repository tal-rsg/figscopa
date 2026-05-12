'use client';
import { useEffect } from 'react';

interface Props { open: boolean; onClose: () => void; children: React.ReactNode }

export default function Modal({ open, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fc-modal-backdrop" onClick={onClose} role="dialog" aria-modal>
      <div className="fc-modal" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
