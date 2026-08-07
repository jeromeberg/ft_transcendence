//import type { UserStatus } from "@backend/common/types";

interface StatusProps {
  status: string;
  hoverText?: string;
}

// TODO cursor-help ?

export function Status({ status, hoverText }: StatusProps) {
  const colors: Record<string, string> = {
    ONLINE: 'bg-green-500',
    IN_GAME: 'bg-yellow-500',
    OFFLINE: 'bg-gray-500',
  };

  return (
    <span
      className={`relative -top-[2px] inline-block w-3 h-3 align-middle ${colors[status] || colors.OFFLINE}`}
      title={hoverText}
    />
  );
}
