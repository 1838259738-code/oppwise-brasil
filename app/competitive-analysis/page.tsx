'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Activity, Radio, BarChart3, Globe, Zap, RefreshCw, MessageSquare, Newspaper, Trophy } from 'lucide-react'

export default function CompetitiveAnalysis() {
  const router = useRouter()
  const [news, setNews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 1. 客户端异步拉取，确保刷新键能即时生效
  const loadRadarData = async () => {
    setIsRefreshing(true)
    const { data } = await supabase
      .from('auto_entries')
      .select('*, competitors(name, color)')
      .order('created_at', { ascending: false })
      .limit(60)
    
    if (data) setNews(data)
    setIsLoading(false)
    setIsRefreshing(false)
  }

  useEffect(() => {
    loadRadarData()
  }, [])

  // 2. 触发强制无缝刷新
  const handleRefresh = async () => {
    await loadRadarData()
    router.refresh() // 同步刷新 Next.js 服务端缓存
  }

  // 3. 动态计算真实的 Share of Voice (根据数据库现有实时流精算)
  const competitorStats = news.reduce((acc: any, item: any) => {
    const compName = item.competitors?.name || 'Industry / 大盘'
    const compColor = item.competitors?.color || '#999'
    if (!acc[compName]) acc[compName] = { count: 0, color: compColor }
    acc[compName].count += 1
    return acc
  }, {})

  const totalNews = news.length || 1
  const statsArray = Object.entries(competitorStats).sort((a: any, b: any) => b[1].count - a[1].count)

  // 💡 4. 核心功能：根据标题和关键词，在前端动态识别并打上“来源标签”和“大事件勋章”，完美涵盖世界杯/合作等
  const getSourceBadge = (title: string, url: string) => {
    const t = title.toLowerCase()
    if (url.includes('reddit')) return { name: 'Reddit BR', color: 'bg-[#FF4500]/10 text-[#FF4500]', icon: MessageSquare }
    if (url.includes('twitter') || url.includes('x.com')) return { name: 'X / Twitter', color: 'bg-black/10 text-black', icon: MessageSquare }
    if (t.includes('copa') || t.includes('world cup') || t.includes('fifa')) return { name: 'World Cup / 世界杯', color: 'bg-green-600/10 text-green-600', icon: Trophy }
    if (t.includes('parceria') || t.includes('sign') || t.includes('partnership') || t.includes('acordo')) return { name: 'Partnership / 战略合作', color: 'bg-blue-600/10 text-blue-600', icon: Newspaper }
    return { name: 'Valor Econômico', color: 'bg-gray-600/10 text-gray-600', icon: Newspaper }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* Header / 头部声明 */}
        <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between border border-gray-100 gap-4">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="bg-[#333] p-4 rounded-[18px] md:rounded-[24px] shadow-lg text-[#FFD111]">
              <Radio size={28} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-[#333] tracking-tight">Macro Radar Center</h2>
              <p className="text-gray-400 font-medium text-xs md:text-sm mt-0.5">
                全自动公域多源情报监听大盘 / 24/7 Automated OSINT Intelligence Stream
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* 左侧：真实的声量占比精算面板 (Share of Voice) */}
          <div className="lg:col-span-2 bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="text-base md:text-lg font-bold text-[#333] flex items-center gap-2 mb-6">
                <BarChart3 size={18} className="text-[#FFD111]" /> 
                <span>Share of Voice / 实时大盘声量占比 (Recent Signals)</span>
              </h3>
              
              {/* 真实级联进度条 */}
              <div className="h-5 w-full rounded-full overflow-hidden flex bg-gray-100 shadow-inner mb-6">
                {isLoading ? (
                  <div className="h-full w-full bg-gray-200 animate-pulse" />
                ) : (
                  statsArray.map(([name, data]: any) => (
                    <div 
                      key={name} 
                      style={{ width: `${(data.count / totalNews) * 100}%`, backgroundColor: data.color }}
                      className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                    />
                  ))
                )}
              </div>

              {/* 动态计算渲染的图例标签 */}
              <div className="flex flex-wrap gap-3">
                {isLoading ? (
                  <div className="text-xs text-gray-400">Calculating stats...</div>
                ) : (
                  statsArray.map(([name, data]: any) => (
                    <div key={name} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                      <span className="font-bold text-[#333] text-xs">{name}</span>
                      <span className="font-black text-gray-400 text-[11px] ml-1">{Math.round((data.count / totalNews) * 100)}%</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            <p className="text-[10px] text-gray-400 font-bold mt-6 pt-4 border-t border-gray-50 uppercase tracking-widest">
              * Data dynamically calculated via active system records. / 数据基于系统现有记录流动态精算。
            </p>
          </div>

          {/* 右侧：雷达引擎控制台（带前端物理刷新键 ⚡） */}
          <div className="bg-[#FFD111] rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-md relative overflow-hidden text-[#333] flex flex-col justify-between min-h-[220px]">
            <Globe size={120} className="absolute -right-4 -bottom-4 opacity-10" />
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">OSINT Scraper Engine</h4>
                <span className="bg-[#333] text-[#FFD111] text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">LIVE</span>
              </div>
              <div className="text-4xl font-black my-2">{isLoading ? '...' : news.length}</div>
              <p className="font-bold text-[#333]/70 text-xs uppercase tracking-wide">Active Tracked Signals / 已捕获时效信号</p>
            </div>
            
            {/* 🔄 这里就是你需要的物理刷新按钮！ */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="mt-4 w-full bg-[#333] text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Re-indexing...' : 'Refresh Stream / 刷新引擎'}
            </button>
          </div>

          {/* 底部：多源融合情报流 */}
          <div className="lg:col-span-3 bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100">
             <h3 className="text-base md:text-lg font-bold text-[#333] flex items-center gap-2 mb-6">
              <Activity size={18} className="text-[#FFD111]" /> 
              <span>Multi-Source Live Intel Feed / 多源情报实效流</span>
            </h3>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-50 rounded-2xl animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {news.map((item) => {
                  const badge = getSourceBadge(item.titel, item.url || '')
                  const BadgeIcon = badge.icon
                  
                  return (
                    <a 
                      href={item.url || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      key={item.id} 
                      className="group block bg-gray-50 rounded-[20px] p-5 hover:bg-[#333] transition-colors border border-gray-100 hover:border-[#333] flex flex-col justify-between"
                    >
                      <div>
                        {/* 动态多源标签与时间戳 */}
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                          <div className="flex items-center gap-1.5">
                            <span 
                              className="text-[9px] font-black uppercase px-2 py-0.5 rounded text-white shadow-sm" 
                              style={{ backgroundColor: item.competitors?.color || '#999' }}
                            >
                              {item.competitors?.name || 'Industry'}
                            </span>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded flex items-center gap-1 ${badge.color}`}>
                              <BadgeIcon size={10} /> {badge.name}
                            </span>
                          </div>
                          <span className="text-gray-400 text-[10px] font-bold group-hover:text-gray-400/80">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {/* 情报标题 */}
                        <h4 className="font-bold text-[#333] text-xs md:text-sm line-clamp-3 group-hover:text-white transition-colors leading-snug">
                          {item.titel}
                        </h4>
                      </div>
                      
                      <div className="text-[10px] text-gray-400 mt-4 pt-2 border-t border-gray-100/10 group-hover:text-[#FFD111] font-black tracking-wider uppercase text-right">
                        Inspect Source →
                      </div>
                    </a>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}