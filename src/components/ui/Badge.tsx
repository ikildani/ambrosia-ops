import { type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type BadgeVariant = 'teal' | 'green' | 'amber' | 'red' | 'slate' | 'blue';

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}

export function Badge({ variant = 'teal', className, children }: BadgeProps) {
  return (
    <span className={cn('badge', `badge-${variant}`, className)}>
      {children}
    </span>
  );
}
