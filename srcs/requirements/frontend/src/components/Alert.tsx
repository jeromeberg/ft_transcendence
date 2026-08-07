import { type HTMLAttributes, useState } from 'react';

/*

Examples:

<Alert variant="info">An information</Alert>
<Alert variant="success">Congratulations!</Alert>
<Alert variant="warning">Be careful!</Alert>
<Alert variant="error">It's broken!</Alert>
<Alert variant="info" hidable>Can be hidden</Alert>
<Alert variant="success" tag="CUSTOM">Custom tag.</Alert>

*/

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  tag?: string;
  hidable?: boolean;
  onHide?: () => void;
}

const config: Record<AlertVariant, { tag: string; classes: string }> = {
  info: {
    tag: 'INFO',
    classes: 'border-dim text-default bg-muted',
  },
  success: {
    tag: 'OK',
    classes: 'border-default text-default bg-muted',
  },
  warning: {
    tag: 'WARN',
    classes: 'border-accent text-accent bg-black',
  },
  error: {
    tag: 'ERR',
    classes: 'border-danger text-danger bg-[#1a0000]',
  },
};

export default function Alert({
  variant = 'info',
  tag,
  hidable = false,
  onHide,
  className = '',
  children,
  ...props
}: AlertProps) {
  const [Hidden, setHidden] = useState(false);

  if (Hidden) return null;

  const { tag: defaultTag, classes } = config[variant];
  const label = tag ?? defaultTag;

  function handleHide() {
    setHidden(true);
    onHide?.();
  }

  return (
    <div
      role="alert"
      className={[
        'flex items-start gap-3 border px-4 py-3 font-mono text-sm',
        classes,
        className,
      ].join(' ')}
      {...props}
    >
      <span className="shrink-0 font-bold tracking-widest uppercase opacity-80">[{label}]</span>
      <span className="flex-1">{children}</span>
      {hidable && (
        <button
          onClick={handleHide}
          aria-label="Hide"
          className="shrink-0 opacity-50 hover:opacity-100 cursor-pointer transition-opacity leading-none"
        >
          Close
        </button>
      )}
    </div>
  );
}
