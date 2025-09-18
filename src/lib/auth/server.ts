import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { User } from '@/contexts/auth-context';

// Server-side session management
export async function getServerSession(): Promise<{ user: User } | null> {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('prinsur_user');

    if (!userCookie?.value) {
      return null;
    }

    // In production, this would verify JWT token or session with database
    const user = JSON.parse(userCookie.value) as User;

    // Basic validation
    if (!user.id || !user.email || !user.type) {
      return null;
    }

    return { user };
  } catch (error) {
    console.error('Error getting server session:', error);
    return null;
  }
}

// Server-side authentication guard
export async function requireAuth(locale: string): Promise<User> {
  const session = await getServerSession();

  if (!session?.user) {
    redirect(`/${locale}/auth/login`);
  }

  return session.user;
}

// Server-side role guard
export async function requireRole(
  locale: string,
  allowedRoles: User['type'][]
): Promise<User> {
  const user = await requireAuth(locale);

  if (!allowedRoles.includes(user.type)) {
    // Redirect to appropriate dashboard based on user role
    const redirectPath = getRoleRedirectPath(user.type, locale);
    redirect(redirectPath);
  }

  return user;
}

// Helper function to get redirect path for role (with optimization)
function getRoleRedirectPath(userType: User['type'], locale: string): string {
  // Use the new redirect optimizer for better UX
  const { getDefaultRedirect } = require('./redirect-optimizer');
  return getDefaultRedirect(userType, locale);
}

// Check if user has specific permission (future expansion)
export function hasServerPermission(user: User, permission: string): boolean {
  // This would integrate with the RBAC system we created earlier
  // For now, basic role-based checks
  switch (permission) {
    case 'app:access':
      return ['consumer', 'agent', 'manager', 'admin'].includes(user.type);
    case 'workspace:access':
      return ['agent', 'manager', 'admin'].includes(user.type);
    case 'admin:access':
      return user.type === 'admin';
    default:
      return false;
  }
}