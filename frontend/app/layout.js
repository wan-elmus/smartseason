import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const metadata = {
  title: {
    default: 'SmartSeason - Field Monitoring System',
    template: '%s | SmartSeason'
  },
  description: 'Agricultural field monitoring and management platform for Kenyan farmers. Track crop progress, manage field agents, and monitor field health in real-time.',
  keywords: ['agriculture', 'farming', 'field monitoring', 'crop management', 'Kenya', 'smart farming'],
  authors: [{ name: 'SmartSeason Team' }],
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'SmartSeason - Field Monitoring System',
    description: 'Track crop progress, manage field agents, and monitor field health.',
    type: 'website',
    locale: 'en_KE',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}