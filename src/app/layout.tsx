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
  verification: {
    google: "uWaKXvizX7DpjnXm4070Pe9NJ2DSn1xtF2Ofx36Xtp4",
  },
  icons: {
    icon: [
      { url: "/logo.jpg", type: "image/jpeg" },
      { url: "/favicon.ico" }
    ],
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <head>
        <title>VerbaFlow</title>
        <meta name="google-site-verification" content="uWaKXvizX7DpjnXm4070Pe9NJ2DSn1xtF2Ofx36Xtp4" />
        <link rel="icon" href="/logo.jpg" type="image/jpeg" />
        <link rel="shortcut icon" href="/logo.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/logo.jpg" />
      </head>
      <body className="min-h-full flex flex-col font-sans transition-colors duration-200 bg-[#0e0d0b] text-[#ffffff]">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
