import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata = {
  title: 'Air Quality Monitor',
  description: 'Real-time air quality monitoring from ESP32 sensor',
  manifest: '/manifest.json',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1e293b',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="antialiased bg-gray-50">
        <Sidebar />
        <main className="md:ml-64 p-4 md:p-8">
          {children}
        </main>
      </body>
    </html>
  )
}
