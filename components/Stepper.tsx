'use client';

interface Props { value: number; onChange: (v: number) => void; min?: number; max?: number }

export default function Stepper({ value, onChange, min = 0, max = 99 }: Props) {
  return (
    <div className="fc-stepper">
      <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="diminuir">−</button>
      <span className="fc-stepper-val">{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="aumentar">+</button>
    </div>
  );
}
