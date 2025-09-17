/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/config";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LoadingProvider } from "@/components/providers/loading-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ThemeIcon } from "@/components/theme-icon";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Prinsur - Smart Insurance Matching",
  description: "A transparent, efficient, and user-centric insurance ecosystem",
  manifest: "/manifest.json",
  icons: {
    icon: [
      {
        url: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: [
      {
        url: "/icon-light-512.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Prinsur" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeIcon />
          <LoadingProvider>
            <AuthProvider>
              <NextIntlClientProvider messages={messages}>
                <div className="relative flex min-h-screen flex-col">
                  <Header />
                  <main className="flex-1 pt-14">{children}</main>
                  <Footer locale={locale} />
                </div>
              </NextIntlClientProvider>
            </AuthProvider>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
