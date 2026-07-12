/*

Examples:

<Avatar username="username" />
<Avatar username="username" src={monImage} size="lg" />

Sizes:

- sm (6x6) -> used for navbar avatar
- md (10*10, default)
- lg (12*12) -> used for /leaderboard
- xl (24*24) -> used for /profile
*/

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  username: string;
  src?: string | null;
  size?: AvatarSize;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-10 h-10',
  lg: 'w-12 h-12 text-xl',
  xl: 'w-24 h-24 text-2xl',
};

export function Avatar({ username, src, size = 'md', className = '' }: AvatarProps) {
  const initial = username.charAt(0).toUpperCase();

  return (
    <div
      className={[
        'shrink-0 border-1 border-default overflow-hidden',
        'flex items-center justify-center font-mono font-bold',
        'text-default bg-black',
        sizeClasses[size],
        className,
      ].join(' ')}
    >
      {src ? (
        <img src={src} alt={username} className="w-full h-full object-cover" />
      ) : (
        <span>{initial}</span>
      )}
    </div>
  );
}
