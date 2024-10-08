import './globals.css'

export const metadata = {
  title: 'StreamingPro Dashboard',
  description: 'Dashboard para gestionar inputs y outputs de StreamingPro',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-900 text-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  )
}