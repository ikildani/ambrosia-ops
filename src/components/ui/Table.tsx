import { type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className={cn('data-table-wrapper max-h-[70vh] overflow-y-auto', className)}>
      <table className="data-table">
        {children}
      </table>
    </div>
  );
}
