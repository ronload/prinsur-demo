import { redirect } from "next/navigation";

interface AppProfileProps {
  params: Promise<{ locale: string }>;
}

export default async function AppProfile({ params }: AppProfileProps) {
  const { locale } = await params;

  // Redirect to existing profile page
  redirect(`/${locale}/consumer/profile`);
}