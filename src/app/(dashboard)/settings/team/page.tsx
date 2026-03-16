'use client';

import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  UserPlus,
  MoreHorizontal,
  Check,
  X,
  Mail,
} from 'lucide-react';

/* -------------------------------------------------- */
/* TYPES & METADATA                                    */
/* -------------------------------------------------- */

type Role = 'admin' | 'partner' | 'vp' | 'analyst' | 'associate';
type Status = 'active' | 'inactive';

const ROLE_BADGE: Record<Role, 'teal' | 'blue' | 'amber' | 'slate'> = {
  admin: 'teal',
  partner: 'blue',
  vp: 'amber',
  analyst: 'slate',
  associate: 'slate',
};

const ROLE_LABEL: Record<Role, string> = {
  admin: 'Admin',
  partner: 'Partner',
  vp: 'VP',
  analyst: 'Analyst',
  associate: 'Associate',
};

/* -------------------------------------------------- */
/* MOCK DATA                                           */
/* -------------------------------------------------- */

interface TeamMember {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: Role;
  status: Status;
  lastActive: string;
}

const mockTeam: TeamMember[] = [
  {
    id: '1',
    name: 'Issa Kildani',
    email: 'issa@ambrosiaventures.co',
    initials: 'IK',
    role: 'admin',
    status: 'active',
    lastActive: 'Just now',
  },
  {
    id: '2',
    name: 'Alex Rivera',
    email: 'alex@ambrosiaventures.co',
    initials: 'AR',
    role: 'partner',
    status: 'active',
    lastActive: '2h ago',
  },
  {
    id: '3',
    name: 'Dr. Maya Patel',
    email: 'maya@ambrosiaventures.co',
    initials: 'MP',
    role: 'vp',
    status: 'active',
    lastActive: '1d ago',
  },
  {
    id: '4',
    name: 'Jordan Lee',
    email: 'jordan@ambrosiaventures.co',
    initials: 'JL',
    role: 'analyst',
    status: 'active',
    lastActive: '3h ago',
  },
  {
    id: '5',
    name: 'Sam Rodriguez',
    email: 'sam@ambrosiaventures.co',
    initials: 'SR',
    role: 'associate',
    status: 'active',
    lastActive: '5h ago',
  },
];

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
            {mockTeam.map((member, i) => (
              <tr
                key={member.id}
                style={{ animationDelay: `${(i + 1) * 60}ms`, animationFillMode: 'both' }}
                className="animate-[fadeIn_0.3s_ease-out]"
              >
                <td>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-500/15 border border-teal-500/25 text-xs font-medium text-teal-400">
                      {member.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-100">{member.name}</p>
                      <p className="text-xs text-slate-500">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <Badge variant={ROLE_BADGE[member.role]}>
                    {ROLE_LABEL[member.role]}
                  </Badge>
                </td>
                <td>
                  <Badge variant={member.status === 'active' ? 'green' : 'red'}>
                    {member.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td>
                  <span className="text-xs text-slate-400 font-mono">{member.lastActive}</span>
                </td>
                <td className="text-right">
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
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
