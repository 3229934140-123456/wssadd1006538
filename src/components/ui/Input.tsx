import { cn } from '@/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  wrapperClassName?: string;
}

export function Input({
  label,
  error,
  leftIcon,
  wrapperClassName,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || props.name;

  return (
    <div className={cn('space-y-1.5', wrapperClassName)}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          className={cn(
            'input',
            leftIcon && 'pl-10',
            error && 'border-danger-400 focus:ring-danger-500',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger-500">{error}</p>}
    </div>
  );
}
