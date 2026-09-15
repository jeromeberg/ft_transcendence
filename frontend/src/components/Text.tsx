import { type HTMLAttributes } from 'react';

/*

Examples:

<Text variant="default">default</Text>
<Text variant="dim">dim</Text>
<Text variant="muted">muted</Text>
<Text variant="accent">accent</Text>
<Text variant="error">error</Text>
<Text variant="prompt">prompt</Text>
<Text size="xs">Extra small</Text>
<Text size="sm">small</Text>

*/

type TextVariant = 'default' | 'dim' | 'muted' | 'accent' | 'error' | 'prompt';
type TextSize = 'xs' | 'sm' | 'base';

interface TextProps extends HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  size?: TextSize;
  as?: 'p' | 'span' | 'label' | 'li';
}

const textVariantClasses: Record<TextVariant, string> = {
  default: 'text-default',
  dim: 'text-dim',
  muted: 'text-muted',
  accent: 'text-accent',
  error: 'text-danger',
  prompt: "text-default before:content-['>_']",
};

const textSizeClasses: Record<TextSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
};

export function Text({
  variant = 'default',
  size = 'sm',
  as: Tag = 'p',
  className = '',
  children,
  ...props
}: TextProps) {
  return (
    <Tag
      className={['font-mono', textVariantClasses[variant], textSizeClasses[size], className].join(
        ' ',
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
