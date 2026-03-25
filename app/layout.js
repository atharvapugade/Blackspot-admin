import './globals.css'
import Navbar from './components/Navbar'

export const metadata = {
  title: 'Blackspot Detection System - Admin Panel',
  description: 'Blackspot detection system admin panel',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-blue-50 flex flex-col">
        <Navbar />
        <div className="container mx-auto px-4 py-6 flex-1">
          <header className="text-center mb-6">
            <div className="header-card rounded-xl p-4 mb-4 max-w-4xl mx-auto">
              <h1 className="title-gradient text-4xl font-bold mb-2 tracking-tight">Blackspot Detection System</h1>
              <h2 className="subtitle-accent text-xl font-medium">Admin Panel</h2>
              <div className="accent-line mt-3 w-20 h-1 mx-auto rounded-full"></div>
            </div>
          </header>
          <main className="main-content rounded-2xl p-6 max-w-6xl mx-auto flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}