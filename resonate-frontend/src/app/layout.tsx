import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, SignedOut } from '@clerk/nextjs';
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from 'react-hot-toast';
import { GlobalLoaderWrapper } from "@/components/Contexts/LoadingContexts.js";
import { Providers } from "./Providers";

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
            <Toaster position="top-center" />
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}