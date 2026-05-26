'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database, ShieldCheck, Lock, Eye, ArrowRight } from 'lucide-react'

export default function MaterialLibrary() {
  // 身份验证状态
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(false)
  
  // 数据资产状态
  const [materials, setMaterials] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 只有验证通过后，才去 Supabase 拉取真实数据
  useEffect(() => {
    if (!isAuthenticated) return

    async function fetchMaterials() {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('materials')
        .select('*, competitors(name, color)')
        .order('aufnahmeDatum', { ascending: false })
      
      if (!error && data) {
        setMaterials(data)
      }
      setIsLoading(false)
    }
    fetchMaterials()
  }, [isAuthenticated])

  // 密码验证逻辑
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === '88888889') {
      setIsAuthenticated(true)
      setPasswordError(false)
    } else {
      setPasswordError(true)
      setPassword('')
    }
  }

  // 🔒 状态一：未验证时展示的作品集专属锁屏界面
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#333] rounded-[32px] p-8 shadow-2xl text-white border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD111]/5 rounded-full blur-3xl" />
          
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="bg-[#FFD111] p-4 rounded-[24px] text-[#333] shadow-lg animate-bounce">
              <Lock size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
                INTELLIGENCE HUB
              </h2>
              <p className="text-gray-400 text-xs font-medium mt-1.5 max-w-xs">
                此模块包含 99Food 核心竞品敏感商业机密，已启用作品集安全加密保护。
              </p>
            </div>
          </div>

          <form onSubmit={handleVerify} className="mt-8 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] block pl-1">
                ENTER ACCESS KEY / 输入访问密码
              </label>
              <div className="relative flex items-center">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-black/30 border p-4 pr-12 rounded-xl font-mono text-center tracking-[0.3em] text-lg outline-none transition-all ${
                    passwordError 
                      ? 'border-red-500 text-red-400 focus:ring-2 focus:ring-red-500/20' 
                      : 'border-white/10 focus:border-[#FFD111] text-white focus:ring-2 focus:ring-[#FFD111]/10'
                  }`}
                />
                <button 
                  type="submit" 
                  className="absolute right-3 p-2 rounded-lg bg-[#FFD111] text-[#333] hover:scale-105 transition-transform"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {passwordError && (
              <p className="text-red-400 text-xs font-bold text-center animate-pulse">
                ❌ 凭证错误 / Access Denied. Please try again.
              </p>
            )}

            <div className="pt-4 border-t border-white/5 text-center">
              <span className="inline-flex items-center gap-1.5 text-[10px] text-gray-500 font-mono">
                <ShieldCheck size={12} /> SECURE GATEWAY ACTIVE
              </span>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // 🔓 状态二：验证成功，正式渲染情报材料图库
  return (
    <div className="min-h-screen bg-[#F8F9FA] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm flex items-center justify-between border border-gray-100 flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <div className="bg-[#333] p-4 rounded-[24px] shadow-lg text-[#FFD111]">
              <Database size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-[#333] tracking-tight">Material Library</h2>
              <p className="text-gray-400 font-medium mt-1">全量聚合前线回传素材与自动流转的策略资产仓库</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-green-500/10 text-green-600 px-4 py-2 rounded-full font-bold text-xs">
            <ShieldCheck size={16} /> 授权查看中 (CGO Session)
          </div>
        </div>

        {/* 瀑布流/网格图库展示 */}
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400 font-bold uppercase tracking-widest gap-2">
            <div className="w-6 h-6 border-2 border-[#FFD111] border-t-transparent rounded-full animate-spin" />
            Loading Secure Assets...
          </div>
        ) : materials.length === 0 ? (
          <div className="bg-white rounded-[32px] p-16 text-center text-gray-400 border border-gray-100 font-bold">
            暂无资产，请前往 Upload Material 或 Field Intel 提报情报。
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((item) => (
              <div key={item.id} className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-shadow flex flex-col justify-between">
                <div>
                  {/* 图片缩略图 */}
                  <div className="h-48 bg-gray-100 relative group overflow-hidden">
                    <img 
                      src={item.url} 
                      alt={item.titel} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4">
                      <span 
                        className="text-[10px] font-black uppercase px-2 py-1 rounded-md text-white shadow-sm"
                        style={{ backgroundColor: item.competitors?.color || '#999' }}
                      >
                        {item.competitors?.name || 'Industry'}
                      </span>
                    </div>
                  </div>

                  {/* 文本描述区 */}
                  <div className="p-6 space-y-2">
                    <h4 className="font-black text-[#333] text-base line-clamp-1">{item.titel}</h4>
                    <p className="text-gray-500 text-xs font-medium leading-relaxed whitespace-pre-wrap line-clamp-4">
                      {item.beschreibung}
                    </p>
                  </div>
                </div>

                {/* 卡片底部元数据 */}
                <div className="p-6 pt-0 border-t border-gray-50 mt-4 flex items-center justify-between text-[10px] text-gray-400 font-bold">
                  <span>DATE: {new Date(item.aufnahmeDatum).toLocaleDateString()}</span>
                  <a 
                    href={item.url} 
                    target="_blank" 
                    className="flex items-center gap-1 text-[#333] hover:text-[#FFD111] transition-colors"
                  >
                    <Eye size={12} /> VIEW RAW
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}