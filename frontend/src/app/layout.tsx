import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "YouFix - AI Fault Diagnosis & Repair Protocols",
  description:
    "Instant physical fault diagnosis for household and automotive issues powered by Google Gemini Vision, FastAPI, and Supabase.",
  keywords: [
    "AI repair",
    "fault diagnosis",
    "leaking pipe",
    "clogged drain",
    "flat tire",
    "electrical hazard",
    "overheating engine",
    "Gemini Vision",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
