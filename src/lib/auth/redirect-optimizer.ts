import { User } from '@/contexts/auth-context';

/**
 * Enterprise-grade role-based redirect optimization system
 * Provides intelligent routing based on user roles, context, and business logic
 */

export interface RedirectContext {
  currentPath: string;
  intendedPath?: string;
  userAgent?: string;
  timestamp: number;
}

export interface RedirectRule {
  fromRole: User['type'];
  toRole?: User['type'];
  condition: (user: User, context: RedirectContext) => boolean;
  redirect: (locale: string, user: User, context: RedirectContext) => string;
  priority: number;
}

/**
 * Get the optimal redirect path for a user based on their role and context
 */
export function getOptimalRedirect(
  user: User,
  locale: string,
  context: RedirectContext
): string {
  // Apply redirect rules in priority order
  const applicableRules = REDIRECT_RULES
    .filter(rule => rule.fromRole === user.type && rule.condition(user, context))
    .sort((a, b) => b.priority - a.priority);

  if (applicableRules.length > 0) {
    return applicableRules[0].redirect(locale, user, context);
  }

  // Fallback to default role-based redirect
  return getDefaultRedirect(user.type, locale);
}

/**
 * Get the default redirect path for a user role
 */
export function getDefaultRedirect(userType: User['type'], locale: string): string {
  switch (userType) {
    case 'consumer':
      return `/${locale}/app/dashboard`;
    case 'agent':
    case 'manager':
    case 'admin':
      return `/${locale}/workspace/dashboard`;
    default:
      return `/${locale}/`;
  }
}

/**
 * Check if a path is accessible for a given user role
 */
export function isPathAccessible(path: string, userType: User['type']): boolean {
  // Extract the route section from the path
  const pathParts = path.split('/').filter(Boolean);
  const routeSection = pathParts[1]; // Skip locale

  switch (userType) {
    case 'consumer':
      return ['app', 'public', 'auth'].includes(routeSection);
    case 'agent':
      return ['app', 'workspace', 'public', 'auth'].includes(routeSection);
    case 'manager':
      return ['app', 'workspace', 'public', 'auth'].includes(routeSection);
    case 'admin':
      return true; // Admin can access everything
    default:
      return ['public', 'auth'].includes(routeSection);
  }
}

/**
 * Get suggested alternative paths when access is denied
 */
export function getSuggestedPaths(
  user: User,
  locale: string,
  deniedPath: string
): { label: string; path: string }[] {
  const suggestions: { label: string; path: string }[] = [];

  // Always suggest going back to their dashboard
  suggestions.push({
    label: user.type === 'consumer' ? '用戶儀表板' : '工作台',
    path: getDefaultRedirect(user.type, locale),
  });

  // Role-specific suggestions
  if (user.type === 'consumer') {
    suggestions.push(
      { label: '保險方案', path: `/${locale}/app/insurance` },
      { label: '個人資料', path: `/${locale}/app/profile` }
    );
  } else if (['agent', 'manager', 'admin'].includes(user.type)) {
    suggestions.push(
      { label: '客戶管理', path: `/${locale}/workspace/clients` },
      { label: '保單管理', path: `/${locale}/workspace/policies` }
    );

    if (['manager', 'admin'].includes(user.type)) {
      suggestions.push(
        { label: '報表分析', path: `/${locale}/workspace/reports` }
      );
    }

    // Also suggest user view
    suggestions.push({
      label: '切換到用戶視圖',
      path: `/${locale}/app/dashboard`,
    });
  }

  return suggestions.slice(0, 4); // Limit to 4 suggestions
}

/**
 * Enterprise redirect rules
 * Rules are evaluated in priority order (higher number = higher priority)
 */
const REDIRECT_RULES: RedirectRule[] = [
  // High priority: First-time users should complete profile
  {
    fromRole: 'consumer',
    condition: (user, context) => {
      // This would check if user profile is incomplete in a real app
      // For demo purposes, we'll use a simple heuristic
      return context.currentPath.includes('/app') && !context.currentPath.includes('/profile');
    },
    redirect: (locale, user, context) => `/${locale}/app/profile`,
    priority: 100,
  },

  // Medium priority: Redirect agents from consumer paths to workspace
  {
    fromRole: 'agent',
    condition: (user, context) => context.currentPath.includes('/consumer'),
    redirect: (locale, user, context) => `/${locale}/workspace/dashboard`,
    priority: 80,
  },

  // Medium priority: Redirect managers/admins from basic agent paths to advanced workspace
  {
    fromRole: 'manager',
    condition: (user, context) => context.currentPath === `/${context.currentPath.split('/')[1]}/workspace/dashboard`,
    redirect: (locale, user, context) => `/${locale}/workspace/reports`,
    priority: 70,
  },

  {
    fromRole: 'admin',
    condition: (user, context) => context.currentPath === `/${context.currentPath.split('/')[1]}/workspace/dashboard`,
    redirect: (locale, user, context) => `/${locale}/workspace/settings`,
    priority: 75,
  },

  // Low priority: Time-based redirects (business hours optimization)
  {
    fromRole: 'agent',
    condition: (user, context) => {
      const hour = new Date().getHours();
      return hour >= 9 && hour <= 17 && context.currentPath.includes('/dashboard');
    },
    redirect: (locale, user, context) => `/${locale}/workspace/clients`,
    priority: 30,
  },
];

/**
 * Log redirect decisions for analytics and optimization
 */
export function logRedirect(
  user: User,
  fromPath: string,
  toPath: string,
  reason: string
): void {
  // In production, this would send to your analytics/monitoring service
  console.log(`[REDIRECT] User ${user.email} (${user.type}) redirected from ${fromPath} to ${toPath}. Reason: ${reason}`);
}