import { type HTMLAttributes } from 'react';

/*

default : black, green border, no shadow
panel : green with shadow
terminal : black with shadow

Examples:

<Container variant="default" label="default">
  <Text variant="muted">variant default</Text>
</Container>
<Container variant="panel" label="panel">
  <Text variant="dim">variant panel</Text>
</Container>
<Container variant="terminal" label="terminal">
  <Text variant="prompt">variant terminal</Text>
</Container>

*/

export type ContainerVariant = 'default' | 'panel' | 'terminal';

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  variant?: ContainerVariant;
  label?: string;
}

const variantClasses: Record<ContainerVariant, string> = {
  default: 'bg-black/80 border border-dim',

  panel: 'bg-dim/40 ' + 'shadow-[0_0_12px_0_rgba(0,255,65,0.15)]',

  terminal: 'bg-black/40 ' + 'shadow-[0_0_12px_0_rgba(0,255,65,0.15)]',
};

export default function Container({
  variant = 'default',
  label,
  className = '',
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={['relative font-mono p-4', variantClasses[variant], className].join(' ')}
      {...props}
    >
      {label && (
        <span className="absolute -top-px left-3 -translate-y-1/2 bg-black/90 px-1 text-xs text-default uppercase tracking-widest">
          {label}
        </span>
      )}
      {children}
    </div>
  );
}
