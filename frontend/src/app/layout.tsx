import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { LanguageProvider } from "@/lib/i18n";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const notoDevanagari = Noto_Sans_Devanagari({ 
  subsets: ["devanagari"], 
  weight: ["400", "600", "700"],
  variable: '--font-noto-devanagari'
});

export const metadata: Metadata = {
  title: "Shriji AI | Your Compassionate Guide to the Bhagavad Gita",
  description: "Experience the profound wisdom of the Bhagavad Gita navigating emotional insights tailored specifically for modern-day existential crises via deep semantic chunking.",
  manifest: "/manifest.json",
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Shriji AI',
  },
};

export const viewport: Viewport = {
  themeColor: '#E57300',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Shriji AI" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className={`${inter.variable} ${notoDevanagari.variable} font-sans text-cream min-h-screen flex flex-col`}>
        <LanguageProvider>
          <Navbar />
          {/* Main Application Container */}
          <main className="flex-1 w-full mx-auto px-2 sm:px-4" style={{maxWidth: '1200px'}}>
            {children}
          </main>
          <Footer />
        </LanguageProvider>

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
