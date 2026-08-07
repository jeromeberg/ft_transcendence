import type { ReactNode } from 'react';

interface PageWithSidebarProps {
  children: ReactNode;
  sidebar: ReactNode;
  maxWidth?: string;
  fillHeight?: boolean;
  sidebarFull?: boolean;
  centerContent?: boolean;
}

export default function PageWithSidebar({
  children,
  sidebar,
  maxWidth,
  fillHeight,
  sidebarFull,
  centerContent,
}: PageWithSidebarProps) {
  const sidebarHeightClass = fillHeight
    ? sidebarFull
      ? 'overflow-y-auto sm:max-h-[80dvh] pr-1 pb-2'
      : 'overflow-y-auto flex-1 min-h-0 sm:flex-none sm:max-h-[80dvh] pr-1 pb-2'
    : '';
  return (
    <div className={`flex flex-col sm:flex-row gap-6 p-6 ${fillHeight ? 'flex-1 min-h-0' : ''}`}>
      {centerContent && <div className="hidden xl:block xl:w-72 xl:shrink-0 xl:order-first" />}
      <aside className={`w-full sm:w-72 sm:shrink-0 order-2 sm:order-last ${sidebarHeightClass}`}>
        {sidebar}
      </aside>
      <div className={`sm:flex-1 order-1 min-w-0 ${fillHeight ? 'min-h-0 flex flex-col' : ''}`}>
        <div
          className={`w-full mx-auto ${fillHeight ? 'h-full flex flex-col' : ''} ${maxWidth ?? ''}`.trim()}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
