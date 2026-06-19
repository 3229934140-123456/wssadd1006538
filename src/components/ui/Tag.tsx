import { cn } from '@/utils';

interface TagProps {
  children: React.ReactNode;
  color?: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'gray';
  className?: string;
  onRemove?: () => void;
}

const colorStyles: Record<string, string> = {
  red: 'bg-red-50 text-red-600 border-red-200',
  orange: 'bg-orange-50 text-orange-600 border-orange-200',
  yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  green: 'bg-green-50 text-green-600 border-green-200',
  blue: 'bg-blue-50 text-blue-600 border-blue-200',
  purple: 'bg-purple-50 text-purple-600 border-purple-200',
  pink: 'bg-pink-50 text-pink-600 border-pink-200',
  gray: 'bg-slate-50 text-slate-600 border-slate-200',
};

export function Tag({ children, color = 'gray', className, onRemove }: TagProps) {
  return (
    <span
      className={cn(
        'tag border',
        colorStyles[color],
        onRemove && 'pr-1.5',
        className
      )}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:bg-black/10 rounded-full p-0.5 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}
