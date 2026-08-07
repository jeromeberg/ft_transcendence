import { type ElementType, type ComponentPropsWithoutRef } from 'react';

/*

Examples:

// Colors
<Btn variant="primary">primary</Btn>
<Btn variant="secondary">secondary</Btn>
<Btn variant="ghost">ghost</Btn>
<Btn variant="danger">danger</Btn>

// Size
<Btn size="sm">small</Btn>
<Btn size="md">medium</Btn>
<Btn size="lg">large</Btn>

// disabled
<Btn variant="primary" disabled>disabled primary</Btn>
<Btn variant="secondary" disabled>disabled secondary</Btn>
<Btn variant="danger" disabled>disabled danger</Btn>

*/

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'terminal';
type BtnSize = 'sm' | 'md' | 'lg';

type BtnOwnProps<E extends ElementType> = {
  as?: E;
  variant?: BtnVariant;
  size?: BtnSize;
  className?: string;
};

type BtnProps<E extends ElementType = 'button'> = BtnOwnProps<E> &
  Omit<ComponentPropsWithoutRef<E>, keyof BtnOwnProps<E>>;

const variantClasses: Record<BtnVariant, string> = {
  primary:
    'bg-default text-black border border-default ' +
    'hover:bg-dim ' +
    'active:bg-dim ' +
    'disabled:opacity-40 disabled:bg-default disabled:text-black disabled:border-default disabled:cursor-not-allowed disabled:saturate-0',

  secondary:
    'bg-transparent text-default border border-default ' +
    'hover:bg-default hover:text-black ' +
    'active:bg-dim ' +
    'disabled:opacity-30 disabled:cursor-not-allowed',

  ghost:
    'bg-transparent text-default border border-transparent ' +
    'hover:border-dim hover:bg-muted ' +
    'active:bg-dim ' +
    'disabled:opacity-30 disabled:cursor-not-allowed',

  danger:
    'bg-transparent text-danger border border-danger ' +
    'hover:bg-danger hover:text-black ' +
    'active:opacity-80 ' +
    'disabled:opacity-30 disabled:cursor-not-allowed',

  // Terminal command: bracketed dim label that lights up green on hover (matches nav [*] style).
  terminal:
    'bg-transparent text-dim border-0 ' +
    'hover:text-default ' +
    'active:opacity-80 ' +
    'disabled:opacity-30 disabled:cursor-not-allowed',
};

const sizeClasses: Record<BtnSize, string> = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-5 py-2 text-sm',
  lg: 'px-8 py-3 text-base',
};

export default function Btn<E extends ElementType = 'button'>({
  as,
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: BtnProps<E>) {
  const Component = as ?? 'button';
  return (
    <Component
      type={
        !as ? ((props as { type?: 'button' | 'submit' | 'reset' }).type ?? 'button') : undefined
      }
      className={[
        'font-mono uppercase tracking-widest cursor-pointer transition-all duration-100 disabled:pointer-events-none',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </Component>
  );
}
