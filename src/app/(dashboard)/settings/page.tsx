'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  User,
  Bell,
  Plug,
  Database,
  Download,
  Upload,
  ExternalLink,
  Check,
  AlertCircle,
} from 'lucide-react';

/* -------------------------------------------------- */
/* NOTIFICATION TOGGLES                                */
/* -------------------------------------------------- */

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  defaultOn: boolean;
}

const notificationSettings: NotificationSetting[] = [
  {
    id: 'new_deals',
    label: 'Email notifications for new deals',
    description: 'Receive an email when a new deal is added to the pipeline.',
    defaultOn: true,
  },
  {
    id: 'weekly_digest',
    label: 'Weekly digest email',
    description: 'Summary of pipeline activity, upcoming tasks, and team updates every Monday.',
    defaultOn: true,
  },
  {
    id: 'stale_alerts',
    label: 'Stale relationship alerts',
    description: 'Get notified when a contact or company has not been engaged in 30+ days.',
    defaultOn: false,
  },
  {
    id: 'task_reminders',
    label: 'Task due reminders',
    description: 'Receive reminders 24 hours before a task is due.',
    defaultOn: true,
  },
];

/* -------------------------------------------------- */
/* INTEGRATIONS                                        */
/* -------------------------------------------------- */

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: 'connected' | 'not_configured' | 'available';
  url?: string;
}

const integrations: Integration[] = [
  {
    id: 'terrain',
    name: 'Terrain',
    description: 'Market intelligence platform — indications, competitive landscapes, and market sizing.',
    icon: ExternalLink,
    status: 'connected',
    url: 'terrain.ambrosiaventures.co',
  },
  {
    id: 'benchmarker',
    name: 'Benchmarker',
    description: 'Deal valuation calculator — comparable transactions, DCF, and sensitivity analysis.',
    icon: ExternalLink,
    status: 'not_configured',
    url: 'calculator.ambrosiaventures.co',
  },
  {
    id: 'clinical_trials',
    name: 'ClinicalTrials.gov',
    description: 'Public clinical trial registry — search trials, sponsors, and investigators.',
    icon: ExternalLink,
    status: 'available',
  },
];

/* -------------------------------------------------- */
/* PAGE COMPONENT                                      */
/* -------------------------------------------------- */

export default function SettingsPage() {
  const [notifications, setNotifications] = useState<Record<string, boolean>>(
    Object.fromEntries(notificationSettings.map((n) => [n.id, n.defaultOn])),
  );

  const toggleNotification = (id: string) => {
    setNotifications((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Manage your account and platform configuration"
      />

      <div className="space-y-6 max-w-3xl">
        {/* -------------------------------------------------- */}
        {/* PROFILE                                             */}
        {/* -------------------------------------------------- */}
        <Card
          className="animate-[slideUp_0.4s_ease-out]"
          style={{ animationDelay: '0ms', animationFillMode: 'both' }}
        >
          <div className="flex items-center gap-3 mb-5">
            <User className="h-5 w-5 text-teal-400" />
            <h2 className="text-base font-medium text-slate-100">Profile</h2>
          </div>

          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-teal-500/15 border border-teal-500/25 text-teal-400 font-display text-2xl">
              IK
            </div>

            {/* Fields */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="input-label">Full Name</label>
                <input type="text" className="input" defaultValue="Issa Kildani" />
              </div>
              <div>
                <label className="input-label">Email</label>
                <input
                  type="email"
                  className="input opacity-60 cursor-not-allowed"
                  defaultValue="issa@ambrosiaventures.co"
                  readOnly
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="input-label mb-0">Role</label>
                <Badge variant="teal">Admin</Badge>
              </div>
              <div className="pt-2">
                <Button size="sm">Save Changes</Button>
              </div>
            </div>
          </div>
        </Card>

        {/* -------------------------------------------------- */}
        {/* NOTIFICATIONS                                       */}
        {/* -------------------------------------------------- */}
        <Card
          className="animate-[slideUp_0.4s_ease-out]"
          style={{ animationDelay: '80ms', animationFillMode: 'both' }}
        >
          <div className="flex items-center gap-3 mb-5">
            <Bell className="h-5 w-5 text-teal-400" />
            <h2 className="text-base font-medium text-slate-100">Notifications</h2>
          </div>

          <div className="space-y-4">
            {notificationSettings.map((setting) => (
              <div
                key={setting.id}
                className="flex items-center justify-between gap-4 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-slate-200">{setting.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{setting.description}</p>
                </div>
                <button
                  onClick={() => toggleNotification(setting.id)}
                  className={`
                    relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
                    border-2 border-transparent transition-colors duration-200
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50
                    ${notifications[setting.id] ? 'bg-teal-500' : 'bg-navy-700'}
                  `}
                  role="switch"
                  aria-checked={notifications[setting.id]}
                >
                  <span
                    className={`
                      pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg
                      transform transition-transform duration-200
                      ${notifications[setting.id] ? 'translate-x-5' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* -------------------------------------------------- */}
        {/* INTEGRATIONS                                        */}
        {/* -------------------------------------------------- */}
        <Card
          className="animate-[slideUp_0.4s_ease-out]"
          style={{ animationDelay: '160ms', animationFillMode: 'both' }}
        >
          <div className="flex items-center gap-3 mb-5">
            <Plug className="h-5 w-5 text-teal-400" />
            <h2 className="text-base font-medium text-slate-100">Integrations</h2>
          </div>

          <div className="space-y-4">
            {integrations.map((integration) => {
              const IntIcon = integration.icon;
              return (
                <div
                  key={integration.id}
                  className="flex items-center justify-between gap-4 rounded-lg bg-navy-800/50 border border-subtle px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-navy-700 border border-subtle">
                      <IntIcon className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200">{integration.name}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {integration.description}
                      </p>
                      {integration.url && (
                        <p className="text-xs font-mono text-slate-600 mt-0.5">
                          {integration.url}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {integration.status === 'connected' && (
                      <>
                        <Badge variant="green">
                          <Check className="h-3 w-3" />
                          Connected
                        </Badge>
                        <Button variant="ghost" size="sm">
                          Test Connection
                        </Button>
                      </>
                    )}
                    {integration.status === 'not_configured' && (
                      <>
                        <Badge variant="amber">
                          <AlertCircle className="h-3 w-3" />
                          Not Configured
                        </Badge>
                        <Button variant="secondary" size="sm">
                          Configure
                        </Button>
                      </>
                    )}
                    {integration.status === 'available' && (
                      <Badge variant="green">
                        <Check className="h-3 w-3" />
                        Available
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* -------------------------------------------------- */}
        {/* DATA MANAGEMENT                                     */}
        {/* -------------------------------------------------- */}
        <Card
          className="animate-[slideUp_0.4s_ease-out]"
          style={{ animationDelay: '240ms', animationFillMode: 'both' }}
        >
          <div className="flex items-center gap-3 mb-5">
            <Database className="h-5 w-5 text-teal-400" />
            <h2 className="text-base font-medium text-slate-100">Data Management</h2>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary">
              <Download className="h-4 w-4" />
              Export All Data
            </Button>
            <Button variant="secondary">
              <Upload className="h-4 w-4" />
              Import Companies (CSV)
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}
