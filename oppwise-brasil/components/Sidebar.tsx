'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BarChart3,
  Upload,
  Library,
  Settings,
  FileText,
  Camera,
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/competitive-analysis', label: 'Competitive Analysis', icon: BarChart3 },
  { href: '/upload', label: 'Upload Material', icon: Upload },
  { href: '/field-intel', label: 'Field Intel', icon: Camera },
  { href: '/library', label: 'Material Library', icon: Library },
  { href: '/data-sources', label: 'Data Sources', icon: Settings },
  { href: '/reports', label: 'Reports', icon: FileText },
]

export default function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-64 bg-db-dark text-white flex flex-col">
      <div className="p-5 border-b border-db-gray">
        <h1 className="text-xl font-bold tracking-tight text-db-red uppercase">
          OppWise
        </h1>
        <p className="text-xs text-gray-400 mt-1">Brazil Operations</p>
      </div>
      <nav className="flex-1 pt-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-db-red text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="p-4 text-xs text-gray-500 border-t border-db-gray">
        v1.0 · DB Design System
      </div>
    </aside>
  )
}