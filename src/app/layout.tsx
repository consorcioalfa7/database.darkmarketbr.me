import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

// Domain configuration
const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || "database.darkmarketbr.me";
const APP_URL = `https://${DOMAIN}`;
const APP_NAME = "DarkToolsLabs DataBase";
const APP_DESCRIPTION = "Sistema de gerenciamento de sites e BINs com IA integrada. Powered by @DarkMarket_Oficial";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#10b981" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "dark light",
};

export const metadata: Metadata = {
  // Basic metadata
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: [
    "DarkToolsLabs",
    "DarkMarket",
    "Database",
    "BINs",
    "Gerenciamento de Sites",
    "Gateways de Pagamento",
    "PagBank",
    "PagarMe",
    "NUVEM SHOP",
    "Assistente IA",
    "Cartões",
  ],
  authors: [{ name: "DarkToolsLabs", url: "https://t.me/DarkToolsLabs" }],
  creator: "DarkMarket_Oficial",
  publisher: "DarkToolsLabs",
  
  // URLs
  metadataBase: new URL(APP_URL),
  alternates: {
    canonical: "/",
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Icons
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/icons/icon.svg",
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  
  // Manifest for PWA
  manifest: "/manifest.json",
  
  // Open Graph
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: APP_URL,
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: APP_NAME,
        type: "image/png",
      },
    ],
  },
  
  // Twitter
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: ["/og-image.png"],
    creator: "@DarkMarket_Oficial",
  },
  
  // App info
  applicationName: APP_NAME,
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: "black-translucent",
    startupImage: [
      { url: "/icons/icon-512x512.png", media: "(device-width: 320px)" },
    ],
  },
  
  // Format detection
  formatDetection: {
    telephone: false,
    date: true,
    address: false,
    email: false,
  },
  
  // Category
  category: "business",
  
  // Other
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "msapplication-TileColor": "#10b981",
    "msapplication-config": "/browserconfig.xml",
  },
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: APP_NAME,
  description: APP_DESCRIPTION,
  url: APP_URL,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "BRL",
  },
  author: {
    "@type": "Organization",
    name: "DarkToolsLabs",
    url: "https://t.me/DarkToolsLabs",
  },
  screenshot: `${APP_URL}/screenshots/desktop.png`,
  featureList: [
    "Gerenciamento de Sites",
    "Dicionário de BINs",
    "Importação em Massa",
    "Assistente IA",
    "Filtros Avançados",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        
        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#10b981" media="(prefers-color-scheme: light)" />
        
        {/* iOS specific */}
        <meta name="apple-mobile-web-app-title" content="DarkTools DB" />
        
        {/* Windows tiles */}
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration.scope);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
