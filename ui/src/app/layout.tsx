import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { WalletProvider } from "@/components/WalletProvider";
import { ReactQueryClientProvider } from "@/components/ReactQueryClientProvider";
import { AutoConnectProvider } from "@/components/AutoConnectProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PlayLab",
  description: "PlayLab",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AutoConnectProvider>
          <ReactQueryClientProvider>
            <WalletProvider>
              <Toaster />
              <Sonner />
              {children}
            </WalletProvider>
          </ReactQueryClientProvider>
        </AutoConnectProvider>
      </body>
    </html>
  );
}
