import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PeopleBook — Rayland Inc.',
  description: 'Rayland Inc Recruiting Pipeline Portal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className="bg-gray-50 text-gray-900 font-sans antialiased">{children}</body>
    </html>
  )
}
