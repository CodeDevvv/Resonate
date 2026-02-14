import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, SignedOut } from '@clerk/nextjs';
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { Providers } from "./Providers";
import Navbar from "@/components/layout/Navbar";
import { GlobalLoaderWrapper } from '@/context/LoadingContext'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Resonate",
  description: "Resonate AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Providers>
            <GlobalLoaderWrapper />
            <SignedOut>
              <Navbar />
            </SignedOut>
            <Toaster position="bottom-left" />
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}