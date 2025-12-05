import type { Metadata } from 'next'
import { Roboto } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthGuard } from '@/components/AuthGuard'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'IntraView AI',
  description: 'AI-Powered Real-Time Practice Interview System',
  icons: {
    icon: [
      { url: '/logo-01.png', type: 'image/png' },
      { url: '/logo-01.png', type: 'image/png', sizes: '32x32' },
      { url: '/logo-01.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: [
      { url: '/logo-01.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/logo-01.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.variable} font-sans antialiased`} suppressHydrationWarning>
        <AuthGuard>
          {children}
        </AuthGuard>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
