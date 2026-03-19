import type { Metadata } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const notoDevanagari = Noto_Sans_Devanagari({ 
  subsets: ["devanagari"], 
  weight: ["400", "600", "700"],
  variable: '--font-noto-devanagari'
});

export const metadata: Metadata = {
  title: "Shriji AI | Your Compassionate Guide to the Bhagavad Gita",
  description: "Experience the profound wisdom of the Bhagavad Gita navigating emotional insights tailored specifically for modern-day existential crises via deep semantic chunking.",
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🪷</text></svg>',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${notoDevanagari.variable} font-sans text-cream min-h-screen flex flex-col`}>
        <Navbar />

        {/* Main Application Container */}
        <main className="flex-1 w-full mx-auto" style={{maxWidth: '1200px'}}>
          {children}
        </main>
      </body>
    </html>
  );
}
