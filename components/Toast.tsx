'use client';
import { createContext, useCallback, useContext, useRef, useState } from 'react';

type ToastKind = 'default' | 'success' | 'error';
interface Toast { id: number; msg: string; kind: ToastKind }

const Ctx = createContext<(msg: string, kind?: ToastKind) => void>(() => {});

export function useToast() { return useContext(Ctx); }

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const show = useCallback((msg: string, kind: ToastKind = 'default') => {
    const id = ++counter.current;
    setToasts(t => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  return (
    <Ctx.Provider value={show}>
      {children}
      <div className="fc-toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`fc-toast ${t.kind}`}>{t.msg}</div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
