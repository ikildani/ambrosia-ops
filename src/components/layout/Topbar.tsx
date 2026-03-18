'use client';

import { Search, Bell } from 'lucide-react';

export function Topbar() {
  return (
    <header
      style={{
        height: '64px',
        background: '#07101e',
        borderBottom: '1px solid rgba(100,116,139,0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        padding: '0 40px',
        gap: '20px',
      }}
    >
      <div className="relative flex-1" style={{ maxWidth: '560px' }}>
        <Search
          className="absolute top-1/2 -translate-y-1/2"
          style={{ left: '16px', width: '16px', height: '16px', color: '#475569' }}
        />
        <input
          type="text"
          placeholder="Search companies, contacts, deals..."
          style={{
            width: '100%',
            background: '#0d1b2e',
            border: '1px solid rgba(100,116,139,0.12)',
            borderRadius: '8px',
            color: '#f0f4f8',
            fontSize: '14px',
            padding: '10px 16px 10px 44px',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      </div>

      <div className="ml-auto flex items-center" style={{ gap: '16px' }}>
        <button
          className="relative rounded-lg transition-colors"
          style={{ padding: '10px', color: '#64748b' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.background = '#102236'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent'; }}
        >
          <Bell style={{ width: '18px', height: '18px' }} />
        </button>

        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#004d40',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 600,
            color: '#5fd4e3',
            letterSpacing: '0.05em',
          }}
        >
          AV
        </div>
      </div>
    </header>
  );
}
