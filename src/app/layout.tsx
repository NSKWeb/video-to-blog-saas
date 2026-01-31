import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Video to Blog - AI-Powered Video Transcription & Blog Generation",
  description: "Transform your videos into high-quality blog posts with AI. Transcribe videos, generate SEO-optimized content, and publish directly to WordPress.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <Header />
          {/* AdSense Placement: Top Banner Ad (Leaderboard 728x90 or Responsive) */}
          <main className="flex-1">{children}</main>
          {/* AdSense Placement: Bottom Banner Ad (Leaderboard 728x90 or Responsive) */}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
