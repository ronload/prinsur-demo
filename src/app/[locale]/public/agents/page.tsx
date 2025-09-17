import { redirect } from "next/navigation";

interface PublicAgentsProps {
  params: Promise<{ locale: string }>;
}

export default async function PublicAgents({ params }: PublicAgentsProps) {
  const { locale } = await params;

  // Redirect to existing agents page
  redirect(`/${locale}/consumer/agents`);
}