import { Suspense } from "react";
import RegisterForm from "./register-form";

interface RegisterPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { locale } = await params;
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-2xl mx-auto">
        <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
          <RegisterForm locale={locale} />
        </Suspense>
      </div>
    </div>
  );
}