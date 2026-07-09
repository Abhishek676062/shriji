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
  title: "Shriji AI | Geeta AI Chatbot | Shreeji Online | श्रीजी",
  description: "Experience the profound wisdom of the Bhagavad Gita navigating emotional insights tailored specifically for modern-day existential crises via deep semantic chunking. Talk to Shriji, the ultimate Geeta AI Chatbot. भगवद गीता के ज्ञान और श्री कृष्ण के मार्गदर्शन से अपने जीवन की समस्याओं का समाधान पाएं।",
  keywords: [
    "shriji", "shreeji online", "geeta ai chatbot", "bhagavad gita ai", "krishna ai", "spiritual ai guide", "shriji ai",
    "श्रीजी", "श्रीजी ऑनलाइन", "गीता एआई", "गीता चैटबॉट", "भगवद गीता एआई", "कृष्णा एआई"
  ],
  metadataBase: new URL('https://www.shriji.online'),
  alternates: {
    canonical: '/',
    languages: {
      'en-US': '/',
      'hi-IN': '/',
    },
  },
  openGraph: {
    title: 'Shriji AI | Geeta AI Chatbot | श्रीजी',
    description: 'Experience the profound wisdom of the Bhagavad Gita tailored specifically for modern-day existential crises. भगवद गीता के ज्ञान से समाधान पाएं।',
    url: 'https://www.shriji.online',
    siteName: 'Shriji',
    images: [
      {
        url: '/icons/apple-touch-icon.png',
        width: 192,
        height: 192,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shriji AI | Geeta AI Chatbot',
    description: 'Your compassionate guide to the Bhagavad Gita.',
  },
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
        {/* JSON-LD Schema for AEO/GEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "WebSite",
                  "@id": "https://www.shriji.online/#website",
                  "url": "https://www.shriji.online/",
                  "name": "Shriji",
                  "description": "Geeta AI Chatbot and Spiritual Guide",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://www.shriji.online/chat?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "Organization",
                  "@id": "https://www.shriji.online/#organization",
                  "name": "Shriji AI",
                  "url": "https://www.shriji.online/",
                  "logo": "https://www.shriji.online/icons/icon-192.png",
                  "sameAs": [
                    "https://www.shriji.online"
                  ]
                }
              ]
            })
          }}
        />
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
