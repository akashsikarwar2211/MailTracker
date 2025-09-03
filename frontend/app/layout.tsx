import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'InspMail - Email Analysis System',
  description: 'Analyze email headers, receiving chains, and ESP types with our comprehensive email analysis system.',
  keywords: 'email analysis, IMAP, email headers, ESP detection, receiving chain',
  authors: [{ name: 'InspMail Team' }],
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
