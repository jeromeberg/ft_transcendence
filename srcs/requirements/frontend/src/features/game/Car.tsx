import { PALETTES, CAR_COUNT } from './carPalettes';

function CarShape({ variant, p, d }: { variant: number; p: string; d: string }) {
  switch (variant % CAR_COUNT) {
    case 0:
      return (
        <>
          <rect x="2" y="9" width="44" height="11" rx="3" fill={p} />
          <rect x="10" y="3" width="22" height="8" rx="2" fill={d} />
          <circle cx="12" cy="23" r="4" fill="#111827" />
          <circle cx="38" cy="23" r="4" fill="#111827" />
        </>
      );
    case 1:
      return (
        <>
          <rect x="2" y="8" width="46" height="12" rx="2" fill={p} />
          <rect x="8" y="2" width="28" height="8" rx="1" fill={d} />
          <circle cx="12" cy="23" r="4" fill="#111827" />
          <circle cx="40" cy="23" r="4" fill="#111827" />
        </>
      );
    case 2:
      return (
        <>
          <rect x="2" y="6" width="22" height="14" rx="2" fill={p} />
          <rect x="24" y="13" width="26" height="7" rx="1" fill={d} />
          <circle cx="11" cy="23" r="4" fill="#111827" />
          <circle cx="40" cy="23" r="4" fill="#111827" />
        </>
      );
    case 3:
      return (
        <>
          <rect x="4" y="13" width="44" height="7" rx="4" fill={p} />
          <rect x="18" y="7" width="14" height="8" rx="3" fill={d} />
          <rect x="0" y="15" width="6" height="3" rx="1" fill={d} />
          <rect x="46" y="12" width="4" height="6" rx="1" fill={d} />
          <circle cx="13" cy="23" r="4" fill="#111827" />
          <circle cx="39" cy="23" r="4" fill="#111827" />
        </>
      );
    case 4:
      return (
        <>
          <rect x="2" y="5" width="44" height="15" rx="2" fill={p} />
          <rect x="12" y="8" width="8" height="6" rx="1" fill={d} />
          <rect x="24" y="8" width="8" height="6" rx="1" fill={d} />
          <circle cx="11" cy="23" r="4" fill="#111827" />
          <circle cx="39" cy="23" r="4" fill="#111827" />
        </>
      );
    default:
      return (
        <>
          <rect x="2" y="9" width="46" height="11" rx="3" fill={p} />
          <rect x="14" y="3" width="18" height="8" rx="2" fill={d} />
          <rect x="30" y="7" width="12" height="4" rx="2" fill={d} />
          <circle cx="13" cy="23" r="5" fill="#111827" />
          <circle cx="40" cy="23" r="5" fill="#111827" />
        </>
      );
  }
}

type Props = {
  progress?: number;
  variant?: number;
};

export default function Car({ progress = 0, variant = 0 }: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(progress * 100)));
  const [primary, dark] = PALETTES[variant % CAR_COUNT];

  return (
    <div
      className="absolute top-[10px] sm:top-[6px]"
      style={{
        left: `${pct}%`,
        transform: `translateX(-${pct}%)`,
        transition: 'left 220ms linear, transform 220ms linear',
      }}
    >
      <svg
        className="w-10 sm:w-14"
        viewBox="0 0 56 28"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <CarShape variant={variant} p={primary} d={dark} />
      </svg>
    </div>
  );
}
