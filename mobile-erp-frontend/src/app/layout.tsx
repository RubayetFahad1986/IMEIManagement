import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RootLayoutClient from "./layout-client";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mobile ERP - IMEI & Warranty Management Shop Software",
  description: "Worldwide mobile management shop software. Advanced IMEI management for mobile, warranty management, IMEI warranty claims, IMEI-wise profit, stock tracking, and reselling features. Serving Bangladesh (Dhaka, Chittagong), Dubai, Oman, Saudi Arabia, and globally.",
  keywords: [
    "mobile management shop",
    "imei management for mobile",
    "warranty management",
    "imei warranty claim",
    "imei wise profit",
    "stock management",
    "reselling feature",
    "mobile shop software",
    "mobile erp",
    "Bangladesh",
    "Dhaka",
    "Chittagong",
    "Dubai",
    "Oman",
    "Saudi Arabia",
    "Worldwide"
  ].join(", "),
  authors: [{ name: "MobileERP" }],
  creator: "MobileERP",
  openGraph: {
    title: "Mobile ERP - IMEI Management & Mobile Shop Software",
    description: "Ultimate software for mobile management shops. Features include IMEI management, warranty management, IMEI warranty claims, IMEI-wise profit tracking, stock control, and reselling.",
    url: "https://www.mobileerp.com",
    siteName: "MobileERP",
    images: [
      {
        url: "/globe.svg",
        width: 800,
        height: 600,
        alt: "Mobile ERP Global Management",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mobile ERP - IMEI & Warranty Management",
    description: "Worldwide mobile management shop software. Advanced IMEI management for mobile, warranty claims, stock, and reselling.",
    images: ["/globe.svg"],
  },
  alternates: {
    canonical: "https://www.mobileerp.com",
  },
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
      </body>
    </html>
  );
}
