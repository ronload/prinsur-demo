import { requireAuth, hasServerPermission } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
import AppNavigation from '@/components/navigation/app-navigation';
import AppErrorBoundary from '@/components/error-boundary/app-error-boundary';

// Force dynamic rendering for server-side auth
export const dynamic = 'force-dynamic';

// Enterprise-level app layout with server-side authentication
export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Server-side authentication check
  const user = await requireAuth(locale);

  // Check app access permission
  if (!hasServerPermission(user, 'app:access')) {
    redirect(`/${locale}/unauthorized`);
  }

  return (
    <AppErrorBoundary>
      <div className="app-layout">
        <AppNavigation locale={locale} />
        <main className="app-content">
          {children}
        </main>
      </div>
    </AppErrorBoundary>
  );
}