import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "VerbaFlow",
  description: "Master spontaneous public speaking with 1,300+ prompts, AI research briefings, and fluency analytics.",
  metadataBase: new URL("https://verbaflow.vercel.app"),
  verification: {
    google: "uWaKXvizX7DpjnXm4070Pe9NJ2DSn1xtF2Ofx36Xtp4",
  },
  openGraph: {
    title: "VerbaFlow",
    siteName: "VerbaFlow",
    description: "Master spontaneous public speaking with 1,300+ prompts, AI research briefings, and fluency analytics.",
    url: "https://verbaflow.vercel.app",
    type: "website",
    images: [
      {
        url: "/logo.jpg",
        width: 1024,
        height: 1024,
        alt: "VerbaFlow Logo",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/logo.jpg", type: "image/jpeg" },
      { url: "/favicon.ico", sizes: "any" }
    ],
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "VerbaFlow",
    "alternateName": ["VerbaFlow Impromptu Speaking"],
    "url": "https://verbaflow.vercel.app",
    "logo": "https://verbaflow.vercel.app/logo.jpg"
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <title>VerbaFlow</title>
        <meta name="google-site-verification" content="uWaKXvizX7DpjnXm4070Pe9NJ2DSn1xtF2Ofx36Xtp4" />
        <meta property="og:site_name" content="VerbaFlow" />
        <link rel="icon" href="/logo.jpg" type="image/jpeg" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="shortcut icon" href="/logo.jpg" />
        <link rel="apple-touch-icon" href="/logo.jpg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans transition-colors duration-200 bg-[#0e0d0b] text-[#ffffff]">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
