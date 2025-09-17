import { redirect } from "next/navigation";

interface AppPoliciesProps {
  params: Promise<{ locale: string }>;
}

export default async function AppPolicies({ params }: AppPoliciesProps) {
  const { locale } = await params;

  // Redirect to existing policies page
  redirect(`/${locale}/consumer/policies`);
}