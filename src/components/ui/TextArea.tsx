import { cn } from '@/utils';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

export function TextArea({
  label,
  error,
  wrapperClassName,
  className,
  id,
  rows = 4,
  ...props
}: TextAreaProps) {
  const inputId = id || props.name;

  return (
    <div className={cn('space-y-1.5', wrapperClassName)}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={cn(
          'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'transition-all duration-200 resize-none',
          error && 'border-danger-400 focus:ring-danger-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  );
}
