// @ts-ignore: Allow side-effect CSS import without type declarations
import './globals.css'
import { ReactNode } from 'react'
import Sidebar from '../components/Sidebar'

export const metadata = {
  title: 'OppWise Brasil - Competitive Ops Hub',
  description: 'Live intelligence dashboard for Keeta and iFood in Brazil',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-db-light p-6">
          {children}
        </main>
      </body>
    </html>
  )
}