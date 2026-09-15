interface ProgressBarProps {
  value: number;
  label?: string;
  max?: number;
  color?: 'accent' | 'dim' | 'default' | 'darkgreen' | 'error' | 'muted';
}

export default function ProgressBar({ value, label, max = 100, color }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const textColor = color === 'accent' ? 'text-accent' : 'text-default';
  const bgColor = color === 'accent' ? 'bg-accent' : 'bg-default';

  return (
    <div className="w-full">
      {label && (
        <div className={`text-xs mb-2 uppercase tracking-widest ${textColor}`}>{label}</div>
      )}
      <div className="relative w-full h-2 bg-black/60 border border-dim overflow-hidden">
        <div
          className={`h-full transition-all duration-200 shadow-[0_0_8px_0_rgba(0,255,65,0.4)] ${bgColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {label && (
        <div className={`text-xs mt-1 text-right ${textColor}`}>{Math.round(percentage)}%</div>
      )}
    </div>
  );
}
