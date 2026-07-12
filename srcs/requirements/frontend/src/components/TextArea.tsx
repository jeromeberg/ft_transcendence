import { type TextareaHTMLAttributes, forwardRef } from 'react';

/*

Examples:

<TextArea label="Default" placeholder="type something here" value="value"/>
<TextArea variant="ghost" label="Ghost" placeholder="ghost" />
<TextArea label="error" placeholder="error" defaultValue="error" error="This field is required"/>
<TextArea label="Disabled" placeholder="disabled" disabled />

*/

type TextAreaVariant = 'default' | 'ghost';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: TextAreaVariant;
  label?: string;
  error?: string;
}

const variantClasses: Record<TextAreaVariant, string> = {
  default:
    'bg-black border border-dim text-default ' +
    'placeholder-muted ' +
    'focus:outline-none focus:border-default focus:shadow-[0_0_8px_0_rgba(0,255,65,0.25)]',

  ghost:
    'bg-transparent border-b border-dim text-default ' +
    'placeholder-muted ' +
    'focus:outline-none focus:border-default',
};

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { variant = 'default', label, error, className = '', rows = 4, ...props },
  ref,
) {
  return (
    <div className="flex flex-col gap-1 font-mono w-full">
      {label && <label className="text-xs uppercase tracking-widest text-dim">{label}</label>}

      <div className="relative flex items-start">
        <span className="absolute left-3 top-2 text-default select-none pointer-events-none opacity-70">
          &gt;
        </span>
        <textarea
          ref={ref}
          rows={rows}
          className={[
            'w-full pl-7 pr-3 py-2 text-sm transition-colors duration-100 caret-default resize-vertical',
            variantClasses[variant],
            error
              ? 'border-danger focus:border-danger focus:shadow-[0_0_8px_0_rgba(255,49,49,0.25)]'
              : '',
            className,
          ].join(' ')}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-danger tracking-wide">! {error}</span>}
    </div>
  );
});

export default TextArea;
