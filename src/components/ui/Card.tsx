import { cn } from '@/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover, onClick, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'card',
        hover && 'card-hover cursor-pointer',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

Card.Header = function CardHeader({ children, className }: CardHeaderProps) {
  return <div className={cn('px-5 py-4 border-b border-slate-100', className)}>{children}</div>;
};

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

Card.Body = function CardBody({ children, className }: CardBodyProps) {
  return <div className={cn('p-5', className)}>{children}</div>;
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

Card.Footer = function CardFooter({ children, className }: CardFooterProps) {
  return <div className={cn('px-5 py-4 border-t border-slate-100', className)}>{children}</div>;
};
