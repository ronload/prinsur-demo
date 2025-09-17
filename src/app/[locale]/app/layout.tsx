// Enterprise-level app layout (future server-side auth will be added here)
export default async function AppLayout({
  children,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // TODO: Add server-side authentication check
  // const session = await getServerSession();
  // if (!session?.user) redirect(`/${locale}/auth/login`);

  // TODO: Add permission check for app access
  // if (!hasPermission(session.user.role, 'app:access')) {
  //   redirect(`/${locale}/unauthorized`);
  // }

  // For now, just pass through children
  return <>{children}</>;
}