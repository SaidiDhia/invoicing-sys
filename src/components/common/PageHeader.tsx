import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

interface PageHeaderProps {
  className?: string;
  title: string;
  description?: string;
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children?: React.ReactNode;
}

export function PageHeader({
  className,
  title,
  description,
  level = 'h1',
  children
}: PageHeaderProps) {
  const titleClassName = cn(
    'font-bold tracking-tight',
    level === 'h1'
      ? 'text-2xl md:text-3xl'
      : level === 'h2'
        ? 'text-xl md:text-2xl'
        : level === 'h3'
          ? 'text-lg md:text-xl'
          : level === 'h4'
            ? 'text-base md:text-lg'
            : level === 'h5'
              ? 'text-sm md:text-base'
              : level === 'h6'
                ? 'text-xs md:text-sm'
                : ''
  );

  const descriptionClassName = cn(
    'text-muted-foreground',
    level === 'h1' || level === 'h2' || level === 'h3'
      ? 'text-sm md:text-base'
      : 'text-xs md:text-sm'
  );

  return (
    <div className={cn('space-y-0.5 py-5 sm:py-0', className)}>
      <div className="flex flex-row justify-between items-center">
        <div className="my-3 lg:my-5">
          <h1 className={titleClassName}>{title}</h1>
          <p className={descriptionClassName}>{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
