import { useState } from 'react';

interface PillButtonProps {
  children: React.ReactNode;
  color: 'red' | 'blue';
  onClick?: () => void;
}

const COLORS = {
  red: {
    main: 'rgb(213, 46, 46)',
    bg: 'rgba(213, 46, 46, 0.36)',
    pattern: 'rgba(213, 46, 46, 0.073)',
  },
  blue: {
    main: 'rgb(46, 115, 213)',
    bg: 'rgba(46, 115, 213, 0.36)',
    pattern: 'rgba(46, 115, 213, 0.073)',
  },
};

export default function PillButton({ children, color, onClick }: PillButtonProps) {
  const [hovered, setHovered] = useState(false);
  const c = COLORS[color];

  const gridSize = hovered ? '10px 10px' : '15px 15px';

  const style: React.CSSProperties = {
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.5rem',
    background: `
      radial-gradient(circle, ${c.bg} 0%, rgba(0,0,0,0) 95%),
      linear-gradient(${c.pattern} 1px, transparent 1px),
      linear-gradient(to right, ${c.pattern} 1px, transparent 1px)
    `,
    backgroundSize: `cover, ${gridSize}, ${gridSize}`,
    backgroundPosition: 'center center, center center, center center',
    borderImage: `radial-gradient(circle, ${c.main} 0%, rgba(0,0,0,0) 100%) 1`,
    borderWidth: '1px 0 1px 0',
    borderStyle: 'solid',
    color: c.main,
    padding: window.innerWidth < 640 ? '0.6rem 1.5rem' : '1rem 3rem',
    fontWeight: 700,
    fontSize: window.innerWidth < 640 ? '0.9rem' : '1.5rem',
    fontFamily: 'monospace',
    transition: 'background-size 0.2s ease-in-out',
  };

  return (
    <button
      style={style}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </button>
  );
}
