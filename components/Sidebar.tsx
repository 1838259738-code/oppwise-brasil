'use client'

import { useState, useEffect } from 'react'
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
  ClipboardList,
  Menu, // <-- 引入汉堡包图标
  X     // <-- 引入关闭图标
} from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()
  // 控制移动端侧边栏的开关状态
  const [isOpen, setIsOpen] = useState(false)

  // 监听路由变化，移动端点击链接后自动收起侧边栏
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const navItems = [
    { name: 'Home', path: '/', icon: LayoutDashboard },
    { name: 'Competitive Analysis', path: '/competitive-analysis', icon: TrendingUp },
    { name: 'Ops Requests', path: '/requests', icon: ClipboardList },
    { name: 'Upload Material', path: '/upload', icon: UploadCloud },
    { name: 'Field Intel', path: '/field-intel', icon: ScanEye },
    { name: 'Material Library', path: '/library', icon: Database },
    { name: 'Data Sources', path: '/data-sources', icon: Settings2 },
    { name: 'Reports', path: '/reports', icon: FileBox },
  ]

  return (
    <>
      {/* 🚀 移动端专属：悬浮菜单按钮 (仅在小屏幕显示) */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-[#FFD111] text-[#333] p-4 rounded-full shadow-2xl hover:scale-105 transition-transform border-2 border-[#333]"
      >
        <Menu size={24} />
      </button>

      {/* 🚀 移动端专属：黑色半透明遮罩层 (点击空白处收起菜单) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 侧边栏主体：加入动态 transform 实现丝滑抽屉效果 */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#1E1E1E] flex flex-col border-r border-[#333] shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* 移动端专属：右上角关闭按钮 */}
        <button 
          onClick={() => setIsOpen(false)}
          className="lg:hidden absolute top-6 right-6 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>

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
        <div className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
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
    </>
  )
}