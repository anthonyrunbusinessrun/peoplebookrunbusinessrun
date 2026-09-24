import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://citruscountyblessings.org'),
  title: { default: 'Citrus County Blessings', template: '%s | Citrus County Blessings' },
  description: 'Providing nutritious food to Citrus County schoolchildren on weekends and throughout the summer.',
  openGraph: { title: 'Citrus County Blessings', description: 'When kids go hungry, everything else stops.', type: 'website' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
