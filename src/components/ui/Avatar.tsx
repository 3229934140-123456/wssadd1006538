import { cn } from '@/utils';
import { User } from 'lucide-react';

interface AvatarProps {
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeStyles = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
  xl: 'w-16 h-16 text-xl',
};

const colors = [
  'bg-primary-100 text-primary-700',
  'bg-info-100 text-info-700',
  'bg-warning-100 text-warning-700',
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
  'bg-green-100 text-green-700',
];

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
  const initial = name ? name.charAt(0) : '';

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-medium',
        colors[colorIndex],
        sizeStyles[size],
        className
      )}
    >
      {initial || <User size={size === 'sm' ? 12 : size === 'md' ? 16 : size === 'lg' ? 20 : 28} />}
    </div>
  );
}
