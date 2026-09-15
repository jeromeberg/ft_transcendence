import type { ReactNode } from 'react';
import { Container } from '@/components';
import type { ContainerVariant } from '@/components/Container';

interface SidebarProps {
  children: ReactNode;
  variant?: ContainerVariant | null;
}

export default function Sidebar({ children, variant }: SidebarProps) {
  return (
    <Container variant={variant ?? 'default'} className="h-full">
      {children}
    </Container>
  );
}
