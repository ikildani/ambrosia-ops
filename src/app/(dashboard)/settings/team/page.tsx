'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  UserPlus,
  Check,
  X,
  Mail,
} from 'lucide-react';

/* -------------------------------------------------- */
/* TYPES & METADATA                                    */
/* -------------------------------------------------- */

/* -------------------------------------------------- */
/* TEAM DATA (loaded from Supabase in future)          */
/* -------------------------------------------------- */

/* -------------------------------------------------- */
/* ROLE PERMISSIONS MATRIX                             */
/* -------------------------------------------------- */

interface PermissionRow {
  label: string;
  partner: string;
  vp: string;
  analyst: string;
  associate: string;
}

const permissions: PermissionRow[] = [
  { label: 'All Deals', partner: 'full', vp: 'full', analyst: 'full', associate: 'view' },
  { label: 'Confidential Deals', partner: 'full', vp: 'full', analyst: 'none', associate: 'none' },
  { label: 'Fee Data', partner: 'full', vp: 'full', analyst: 'none', associate: 'none' },
  { label: 'Team Management', partner: 'full', vp: 'none', analyst: 'none', associate: 'none' },
  { label: 'Knowledge Base', partner: 'full', vp: 'full', analyst: 'full', associate: 'full' },
  { label: 'Audit Log', partner: 'full', vp: 'view', analyst: 'none', associate: 'none' },
];

/* -------------------------------------------------- */
/* PAGE COMPONENT                                      */
/* -------------------------------------------------- */

export default function TeamPage() {
  return (
    <>
      <PageHeader
        title="Team"
        subtitle="Manage team members and roles"
        actions={
          <Button>
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
        }
      />

      {/* -------------------------------------------------- */}
      {/* TEAM MEMBERS TABLE                                  */}
      {/* -------------------------------------------------- */}
      <Card
        className="mb-6 overflow-hidden animate-[slideUp_0.4s_ease-out]"
        style={{ animationDelay: '0ms', animationFillMode: 'both' }}
      >
        <table className="data-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Active</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5}>
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <p className="text-sm text-slate-500">
                    Team members will appear here once they sign in with their @ambrosiaventures.co email.
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>

      {/* -------------------------------------------------- */}
      {/* PENDING INVITATIONS                                 */}
      {/* -------------------------------------------------- */}
      <Card
        className="mb-6 animate-[slideUp_0.4s_ease-out]"
        style={{ animationDelay: '120ms', animationFillMode: 'both' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Mail className="h-5 w-5 text-teal-400" />
          <h2 className="text-base font-medium text-slate-100">Pending Invitations</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-slate-500">No pending invitations</p>
        </div>
      </Card>

      {/* -------------------------------------------------- */}
      {/* ROLE PERMISSIONS                                    */}
      {/* -------------------------------------------------- */}
      <Card
        className="overflow-hidden animate-[slideUp_0.4s_ease-out]"
        style={{ animationDelay: '200ms', animationFillMode: 'both' }}
      >
        <h2 className="text-base font-medium text-slate-100 mb-4">
          Role Permissions
        </h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Permission</th>
              <th className="text-center">Partner</th>
              <th className="text-center">VP</th>
              <th className="text-center">Analyst</th>
              <th className="text-center">Associate</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((row) => (
              <tr key={row.label}>
                <td className="text-sm font-medium text-slate-200">{row.label}</td>
                <td className="text-center">
                  <PermissionCell value={row.partner} />
                </td>
                <td className="text-center">
                  <PermissionCell value={row.vp} />
                </td>
                <td className="text-center">
                  <PermissionCell value={row.analyst} />
                </td>
                <td className="text-center">
                  <PermissionCell value={row.associate} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

/* -------------------------------------------------- */
/* PERMISSION CELL                                     */
/* -------------------------------------------------- */

function PermissionCell({ value }: { value: string }) {
  if (value === 'full') {
    return (
      <span className="inline-flex items-center justify-center">
        <Check className="h-4 w-4 text-green-400" />
      </span>
    );
  }
  if (value === 'view') {
    return (
      <span className="text-xs text-slate-400 font-medium">View only</span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center">
      <X className="h-4 w-4 text-red-400/60" />
    </span>
  );
}
