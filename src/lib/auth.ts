import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { AppRole } from '@/types/database';

/** Returns the current user or null. */
export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Returns the current user's roles (empty array if not staff). */
export async function getUserRoles(): Promise<AppRole[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
  return (data ?? []).map((r) => r.role as AppRole);
}

/** True if the user holds ANY of the given roles. */
export async function hasAnyRole(roles: AppRole[]): Promise<boolean> {
  const current = await getUserRoles();
  return current.some((r) => roles.includes(r));
}

/** True if the user is any kind of staff/admin. */
export async function isStaff(): Promise<boolean> {
  const roles = await getUserRoles();
  return roles.length > 0;
}
