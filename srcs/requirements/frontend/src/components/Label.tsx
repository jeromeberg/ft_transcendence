import { type HTMLAttributes } from 'react';

/*

Examples:

<Label>Je suis un label</Label>

*/

interface LabelProps extends HTMLAttributes<HTMLSpanElement> {
  htmlFor?: string;
}

export function Label({ className = '', children, htmlFor, ...props }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={['font-mono text-xs uppercase tracking-[0.3em] text-dim', className].join(' ')}
      {...props}
    >
      {children}
    </label>
  );
}
