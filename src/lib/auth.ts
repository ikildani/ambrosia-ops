import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export type UserRole = 'admin' | 'partner' | 'vp' | 'analyst' | 'associate';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

// Get authenticated user with their role from team_members
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: teamMember } = await supabase
      .from('team_members')
      .select('role')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email || '',
      role: (teamMember?.role as UserRole) || 'analyst',
    };
  } catch {
    return null;
  }
}

// Check if user has required role
export function hasRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

// Role hierarchy: admin > partner > vp > analyst > associate
const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 5,
  partner: 4,
  vp: 3,
  analyst: 2,
  associate: 1,
};

export function hasMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
}

// Return 403 response
export function forbidden(message = 'Insufficient permissions') {
  return NextResponse.json({ error: message }, { status: 403 });
}
