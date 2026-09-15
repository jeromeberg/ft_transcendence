import { type HTMLAttributes } from 'react';

/*

Examples:

<Heading level={1}>Heading h1</Heading>
<Heading level={2}>Heading h2</Heading>
<Heading level={3}>Heading h3</Heading>
<Heading level={4}>Heading h4</Heading>

*/

type HeadingLevel = 1 | 2 | 3 | 4 | 5;

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: HeadingLevel;
}

const headingClasses: Record<HeadingLevel, string> = {
  1: 'text-3xl tracking-[0.3em] uppercase',
  2: 'text-2xl tracking-[0.2em] uppercase',
  3: 'text-lg  tracking-[0.15em] uppercase',
  4: 'text-base tracking-widest uppercase',
  5: 'text-sm tracking-widest uppercase',
};

export function Heading({ level = 1, className = '', children, ...props }: HeadingProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
  return (
    <Tag
      className={['font-mono font-bold text-default', headingClasses[level], className].join(' ')}
      {...props}
    >
      {children}
    </Tag>
  );
}
