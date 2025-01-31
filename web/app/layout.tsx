import type { Metadata } from "next";

import "./globals.css";
import { fontSans, fontMono } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Auth Starter",
  description: "A starter template for authentication with Next.js and Express.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontMono.variable} antialiased font-sans`}>
        {children}
      </body>
    </html>
  );
}
