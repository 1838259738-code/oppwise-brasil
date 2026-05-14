'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  TrendingUp, 
  UploadCloud, 
  ScanEye, 
  Database, 
  Settings2, 
  FileBox,
  Zap,
  ClipboardList // <-- 1. 引入了新的看板图标
} from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Home', path: '/', icon: LayoutDashboard },
    { name: 'Competitive Analysis', path: '/competitive-analysis', icon: TrendingUp },
    { name: 'Ops Requests', path: '/requests', icon: ClipboardList }, // <-- 2. 新增的需求中心导航
    { name: 'Upload Material', path: '/upload', icon: UploadCloud },
    { name: 'Field Intel', path: '/field-intel', icon: ScanEye },
    { name: 'Material Library', path: '/library', icon: Database },
    { name: 'Data Sources', path: '/data-sources', icon: Settings2 },
    { name: 'Reports', path: '/reports', icon: FileBox },
  ]

  return (
    <div className="w-72 bg-[#1E1E1E] min-h-screen flex flex-col border-r border-[#333] shadow-2xl relative z-50">
      {/* Logo 区域 */}
      <div className="p-8">
        <Link href="/" className="flex flex-col gap-1 group">
          <div className="flex items-center gap-2">
            <div className="bg-[#FFD111] p-1.5 rounded-lg group-hover:scale-110 transition-transform">
              <Zap size={20} className="text-[#333] fill-current" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">
              Oppwise
            </h1>
          </div>
          <p className="text-[#FFD111] text-[10px] font-black uppercase tracking-[0.2em] ml-9">
            Brazil Operations
          </p>
        </Link>
      </div>

      {/* 导航菜单 */}
      <div className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.path
          const Icon = item.icon

          return (
            <Link key={item.name} href={item.path}>
              <div
                className={`flex items-center gap-4 px-4 py-3.5 rounded-[20px] transition-all duration-300 font-bold text-sm ${
                  isActive 
                    ? 'bg-[#FFD111] text-[#333] shadow-[0_4px_20px_rgba(255,209,17,0.2)] scale-105' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white hover:pl-6'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-[#333]' : 'text-gray-500'} />
                {item.name}
              </div>
            </Link>
          )
        })}
      </div>

      {/* 底部版本信息 */}
      <div className="p-6 m-4 bg-black/20 rounded-[24px] border border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#FFD111] to-orange-400 p-[2px]">
            <div className="h-full w-full bg-[#333] rounded-full border-2 border-[#1E1E1E]" />
          </div>
          <div>
            <p className="text-white text-xs font-bold">Admin User</p>
            <p className="text-gray-500 text-[10px] uppercase font-bold">Growth Team</p>
          </div>
        </div>
      </div>
    </div>
  )
}