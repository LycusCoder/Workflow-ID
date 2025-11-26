import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import ProtectedLayout from "@/components/ProtectedLayout";
import { ProtectedRouteMiddleware } from '@/contexts/AuthContext';
import DashboardLayout from './{dashboard}/layout';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WorkFlow ID - Modern Workplace Management",
  description: "Face recognition attendance and task management for modern teams",
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
        <AuthProvider>
          <ProtectedRouteMiddleware>
           {children}
          </ProtectedRouteMiddleware>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
