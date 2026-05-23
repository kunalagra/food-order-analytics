import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito_Sans } from "next/font/google";
import { CredentialsProvider } from "@/lib/credentials-context";
import "./globals.css";

const nunitoSans = Nunito_Sans({ variable: "--font-sans", subsets: ["latin"] });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Food Aggregator - Your Orders, Unified",
  description:
    "View your food delivery order history from Zomato, Swiggy, and more in one place.",
};

import { Sidebar } from "@/components/layout/sidebar";
import { ThemeProvider } from "@/components/theme-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunitoSans.variable}`}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <CredentialsProvider>
            <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
              <Sidebar />
              <main className="flex-1 lg:pl-64 w-full">
                <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8 w-full">
                  {children}
                </div>
              </main>
            </div>
          </CredentialsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
