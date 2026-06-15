import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "LX Obsidian Labs - Premium E-Learning Platform",
  description: "Access expert-led courses, track your progress with interactive lessons, and earn verified certificates. Start your learning journey today.",
  keywords: ["e-learning", "online courses", "education", "LX Obsidian Labs", "certificates"],
  openGraph: {
    title: "LX Obsidian Labs - Premium E-Learning Platform",
    description: "Learn anything, anywhere, anytime with expert-led courses and verified certificates.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-background antialiased">
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
