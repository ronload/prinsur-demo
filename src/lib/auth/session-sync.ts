import { User } from '@/contexts/auth-context';

/**
 * Server-side session synchronization utilities
 * Ensures consistency between client-side auth context and server-side cookies
 */

export async function syncClientToServer(user: User | null): Promise<void> {
  try {
    if (user) {
      // Set server-side cookie when user logs in
      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user, action: 'login' }),
      });
    } else {
      // Clear server-side cookie when user logs out
      await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'logout' }),
      });
    }
  } catch (error) {
    console.error('Failed to sync session with server:', error);
    // In production, you might want to handle this more gracefully
    // e.g., retry mechanism, error reporting to monitoring service
  }
}

export async function validateServerSession(): Promise<{ user: User } | null> {
  try {
    const response = await fetch('/api/auth/validate', {
      method: 'GET',
      credentials: 'include', // Include cookies
    });

    if (response.ok) {
      return await response.json();
    }

    return null;
  } catch (error) {
    console.error('Failed to validate server session:', error);
    return null;
  }
}

/**
 * Middleware helper to ensure session consistency
 * Call this in layouts or components that need auth state
 */
export function useSessionSync() {
  // This would be implemented as a custom hook in a real application
  // For now, we'll use the existing auth context pattern

  return {
    syncToServer: syncClientToServer,
    validateSession: validateServerSession,
  };
}