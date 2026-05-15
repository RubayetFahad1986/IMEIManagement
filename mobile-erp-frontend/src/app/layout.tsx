import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RootLayoutClient from "./layout-client";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mobile ERP - IMEI Management",
  description: "Advanced SaaS ERP for Mobile IMEI Tracking",
};

import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <GoogleOAuthProvider clientId="647349813371-ur9jsvrncn7gl7ukm7ku17g6g5flo79p.apps.googleusercontent.com">
          <LanguageProvider>
            <ThemeProvider>
              <RootLayoutClient>{children}</RootLayoutClient>
            </ThemeProvider>
          </LanguageProvider>
        </GoogleOAuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
