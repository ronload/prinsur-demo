import { redirect } from "next/navigation";

interface WorkspaceClientsProps {
  params: Promise<{ locale: string }>;
}

export default async function WorkspaceClients({ params }: WorkspaceClientsProps) {
  const { locale } = await params;

  // Redirect to existing agent clients page
  redirect(`/${locale}/agent/clients`);
}