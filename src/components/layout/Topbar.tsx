'use client';

import { Search, Bell } from 'lucide-react';

export function Topbar() {
  return (
    <header className="topbar">
      <div className="relative flex-1 max-w-lg">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search companies, contacts, deals..."
          className="input pl-12 py-2.5 bg-navy-800 border-transparent focus:border-teal-500"
        />
      </div>

      <div className="ml-auto flex items-center gap-5">
        <button className="relative p-2.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-navy-700 transition-colors">
          <Bell className="w-[18px] h-[18px]" />
        </button>

        <div className="w-9 h-9 rounded-full bg-teal-700 flex items-center justify-center text-xs font-semibold text-teal-200 tracking-wide">
          AV
        </div>
      </div>
    </header>
  );
}
