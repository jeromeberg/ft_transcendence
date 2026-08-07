import type { ReactNode } from 'react';

/*
to limit width:
<PageLayout maxWidth="max-w-sm">
*/

interface PageLayoutProps {
  children: ReactNode;
  maxWidth?: string;
  centerY?: boolean;
}

export default function PageLayout({ children, maxWidth, centerY = false }: PageLayoutProps) {
  const layoutClassName = ['flex flex-col gap-6 p-6', centerY ? 'flex-1 justify-center' : '']
    .join(' ')
    .trim();

  return (
    <div className={layoutClassName}>
      <div className={`mx-auto w-full ${maxWidth ?? ''}`}>{children}</div>
    </div>
  );
}
