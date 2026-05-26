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
  Menu,
  X,
  Mail
} from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()
  // 控制移动端侧边栏的开关状态 / Responsive Drawer State
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
      {/* 🚀 移动端专属：悬浮菜单按钮 / Floating Menu Button for Mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-[#FFD111] text-[#333] p-4 rounded-full shadow-2xl hover:scale-105 transition-transform border-2 border-[#333]"
      >
        <Menu size={24} />
      </button>

      {/* 🚀 移动端专属：黑色半透明遮罩层 / Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 侧边栏主体 / Main Sidebar Layout */}
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

        {/* Logo 区域 / Branding Area */}
        <div className="p-8 flex-shrink-0">
          <Link href="/" className="flex flex-col gap-2 group">
            <div className="flex items-center gap-2">
              <div className="bg-[#FFD111] p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                <Zap size={20} className="text-[#333] fill-current" />
              </div>
              {/* 🌟 核心升级：主系统代号使用冷峻宏大的 Operatix-B */}
              <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">
                Operatix-B
              </h1>
            </div>
            {/* 🌟 完美挂钩你的真实购买域名，伪装成分布式微服务集群的 Ingestion 节点标签 */}
            <div className="ml-8">
              <span className="text-[#FFD111] text-[9px] font-mono font-bold uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded border border-white/5 inline-block">
                NODE: oppwise-brasil.site
              </span>
            </div>
          </Link>
        </div>

        {/* 导航菜单 / Navigation Items */}
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

        {/* 🚀 底部：高规格个人版权与一键联络名片区 */}
        <div className="p-5 m-4 bg-black/30 rounded-[24px] border border-white/5 flex flex-col gap-2 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            {/* 头像徽章 */}
            <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-[#FFD111] to-orange-500 p-[1.5px] flex-shrink-0">
              <div className="h-full w-full bg-[#333] rounded-full flex items-center justify-center text-[10px] font-black text-[#FFD111] tracking-tighter font-mono">
                RC
              </div>
            </div>
            <div>
              <p className="text-white text-xs font-black tracking-wide">Robert Cao</p>
              <p className="text-gray-500 text-[9px] uppercase font-bold tracking-wider">Product Architect</p>
            </div>
          </div>
          
          {/* 一键邮件联络触发按钮 */}
          <a 
            href="mailto:225030237@link.cuhk.edu.cn" 
            className="flex items-center gap-2 bg-white/5 hover:bg-[#FFD111] text-gray-400 hover:text-[#333] p-2 rounded-xl transition-all border border-white/5 hover:border-[#FFD111] group overflow-hidden"
          >
            <Mail size={13} className="flex-shrink-0 text-gray-500 group-hover:text-[#333]" />
            <span className="text-[10px] font-mono font-bold truncate tracking-tight">
              225030237@link.cuhk.edu.cn
            </span>
          </a>
        </div>

      </div>
    </>
  )
}