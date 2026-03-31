import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kerala AI Checker | Fact-Check WhatsApp Messages",
  description: "A digital guardian for identifying fraudulent intent, phishing links, and social engineering scams in Malayalam and Manglish WhatsApp forwards.",
  keywords: ["Kerala AI Checker", "WhatsApp scam detector", "Malayalam fact checker", "cybersecurity", "phishing detection", "Gemini AI", "Kerala Digital Trust"],
  openGraph: {
    title: "Kerala AI Checker | Malayalam Scam Detector",
    description: "Protect your loved ones from digital scams. AI-powered fact-checking for Malayalam and Manglish messages.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
