import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google'

import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const _playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })
const _jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'Night Archivist | AI-Powered Investigative Assistant',
  description: 'Reconstruct truth from fragmented evidence. Upload video, text, and audio evidence to extract events, build timelines, and generate case narratives.',
}

export const viewport: Viewport = {
  themeColor: '#0a0c10',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${_inter.variable} ${_playfair.variable} ${_jetbrains.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
