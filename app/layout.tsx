import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "@/lib/i18n/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { SoundInitializer } from "@/components/sound-initializer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Claim Your Rewards • Grow A Garden",
  description: "Complete offers to earn Garden rewards - Official Garden Game rewards site",

  // Updated Favicon
  icons: {
    icon: "https://i.postimg.cc/rFgTr4qB/1387433373097787534.png",
    shortcut: "https://i.postimg.cc/rFgTr4qB/1387433373097787534.png",
    apple: "https://i.postimg.cc/rFgTr4qB/1387433373097787534.png",
  },

  // Open Graph tags for Discord/WhatsApp/Telegram link previews
  openGraph: {
    title: "Claim Your Rewards • Grow A Garden",
    description:
      "Complete offers to earn exclusive Garden rewards! Get Sheckles, pets, and more from the Official Garden Game.",
    url: "https://your-domain.com",
    siteName: "Grow A Garden Rewards",
    images: [
      {
        url: "/images/social-preview.jpeg",
        width: 1200,
        height: 630,
        alt: "Grow A Garden Rewards - Claim exclusive rewards",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Claim Your Rewards • Grow A Garden",
    description: "Complete offers to earn exclusive Garden rewards! Get Sheckles, pets, and more.",
    images: ["/images/social-preview.jpeg"],
  },

  // Remove any generator or other metadata that might reference v0
  generator: "Garden Rewards System",
  applicationName: "Grow A Garden Rewards",
  referrer: "origin-when-cross-origin",
  keywords: ["garden", "rewards", "roblox", "gaming", "pets", "sheckles"],
  authors: [{ name: "Garden Game Team" }],
  creator: "Garden Game Team",
  publisher: "Garden Game Team",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="https://i.postimg.cc/rFgTr4qB/1387433373097787534.png" />
        <link rel="shortcut icon" href="https://i.postimg.cc/rFgTr4qB/1387433373097787534.png" />
        <link rel="apple-touch-icon" href="https://i.postimg.cc/rFgTr4qB/1387433373097787534.png" />
      </head>
      <body className={inter.className}>
        <LanguageProvider>
          <SoundInitializer />
          {children}
          <LanguageSwitcher />
        </LanguageProvider>
      </body>
    </html>
  )
}
