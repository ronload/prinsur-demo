import { redirect } from "next/navigation";

interface PublicProductsProps {
  params: Promise<{ locale: string }>;
}

export default async function PublicProducts({ params }: PublicProductsProps) {
  const { locale } = await params;

  // Redirect to existing insurance products page
  redirect(`/${locale}/consumer/insurance`);
}