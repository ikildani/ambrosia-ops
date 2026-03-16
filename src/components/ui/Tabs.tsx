'use client';

import { cn } from '@/lib/utils/cn';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex border-b border-subtle">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'px-4 py-2.5 text-sm font-medium transition-colors',
            'border-b-2 -mb-px',
            activeTab === tab.id
              ? 'border-teal-400 text-teal-400'
              : 'border-transparent text-secondary hover:text-primary hover:border-slate-600',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
