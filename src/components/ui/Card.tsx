import { type ReactNode, type CSSProperties } from 'react';
import { cn } from '@/lib/utils/cn';

type CardVariant = 'default' | 'elevated' | 'stat';

export interface CardProps {
  variant?: CardVariant;
  className?: string;
  children: ReactNode;
  style?: CSSProperties;
}

const variantClasses: Record<CardVariant, string> = {
  default: 'card',
  elevated: 'card-elevated',
  stat: 'stat-card',
};

export function Card({ variant = 'default', className, children, style }: CardProps) {
  return (
    <div className={cn(variantClasses[variant], className)} style={style}>
      {children}
    </div>
  );
}
