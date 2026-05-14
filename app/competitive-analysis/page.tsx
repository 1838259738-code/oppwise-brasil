'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Zap, TrendingUp, Globe, Clock, ChevronRight, BarChart3, RefreshCw } from 'lucide-react'

export default function CompetitiveAnalysis() {
  const [news, setNews] = useState<any[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 1. 拉取真实数据
  const fetchIntelligence = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from('auto_entries')
      .select(`*, competitors(name, color)`)
      .order('veroeffentlicht', { ascending: false })
    
    if (data) setNews(data)
    if (error) console.error("Fetch error:", error)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchIntelligence()
  }, [])

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const res = await fetch('/api/crawl', { method: 'GET' })
      const result = await res.json()
      if (result.success) {
        await fetchIntelligence()
      }
    } catch (error) {
      console.error("Failed to trigger sync:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  // ==========================================
  // 🧠 核心数据引擎：动态计算真实指标
  // ==========================================

  // A. 计算竞品情报声量份额 (KeeTa vs iFood)
  const keetaCount = news.filter(item => item.competitor_id === 1 || item.competitors?.name?.toLowerCase().includes('keeta')).length
  const ifoodCount = news.filter(item => item.competitor_id === 2 || item.competitors?.name?.toLowerCase().includes('ifood')).length
  const totalCompetitorIntel = keetaCount + ifoodCount || 1 // 防止除以 0
  const keetaShare = Math.round((keetaCount / totalCompetitorIntel) * 100)
  const ifoodShare = 100 - keetaShare

  // B. 动态关键词匹配器（同时兼容葡语和英语）
  const getSegmentCount = (keywords: string[]) => {
    return news.filter(item => {
      const textBlock = `${item.titel} ${item.zusammenfassung}`.toLowerCase()
      return keywords.some(kw => textBlock.includes(kw))
    }).length
  }

  // C. 生成真实的策略分段数据
  const segments = [
    { 
      label: 'Pricing Strategy', 
      count: getSegmentCount(['price', 'preço', 'desconto', 'discount', 'taxa', 'frete', 'cobranc']) 
    },
    { 
      label: 'Subsidy Efficiency', 
      count: getSegmentCount(['subsidy', 'subsídio', 'cupom', 'coupon', 'promo', 'offer', 'grátis', 'voucher']) 
    },
    { 
      label: 'Merchant Growth', 
      count: getSegmentCount(['merchant', 'restaurante', 'loja', 'store', 'partner', 'parceiro', 'b2b']) 
    },
    { 
      label: 'User Retention', 
      count: getSegmentCount(['retention', 'fidelidade', 'loyalty', 'clube', 'assinatura', 'prime', 'vip']) 
    }
  ]

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 顶部控制台 */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm flex flex-col md:flex-row justify-between items-center border border-gray-100">
          <div className="flex items-center gap-6">
            <div className="bg-[#FFD111] p-5 rounded-[24px] shadow-inner">
              <TrendingUp size={32} className="text-[#333]" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-[#333] tracking-tight">Intelligence Stream</h2>
              <p className="text-gray-400 font-medium text-sm">Real-time competitor tracking: KeeTa & iFood Brazil</p>
            </div>
          </div>
          
          <div className="flex gap-4 mt-6 md:mt-0">
             <button 
               onClick={handleSync}
               disabled={isSyncing}
               className={`px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-2 transition-all ${
                 isSyncing 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-[#FFD111] text-[#333] hover:shadow-lg hover:-translate-y-1'
               }`}
             >
               <RefreshCw size={18} className={isSyncing ? 'animate-spin text-gray-400' : 'text-[#333]'} />
               {isSyncing ? 'Syncing...' : 'Run Crawler'}
             </button>
             
             <div className="px-6 py-3 rounded-2xl bg-[#333] text-[#FFD111] font-bold text-sm flex items-center gap-2">
               <BarChart3 size={16} /> {news?.length || 0} Records Synced
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：自动化情报流 */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-[#333] flex items-center gap-2 mb-2 px-2">
              <Globe size={18} className="text-[#FFD111]" /> Latest Market Movements
            </h3>
            
            {isLoading ? (
              <div className="bg-white rounded-[32px] p-12 flex justify-center items-center border border-gray-100 shadow-sm">
                 <RefreshCw size={32} className="animate-spin text-[#FFD111]" />
              </div>
            ) : news && news.length > 0 ? (
              news.map((item) => (
                <div key={item.id} className="bg-white rounded-[28px] p-7 shadow-sm hover:shadow-md transition-all flex gap-6 border border-gray-50 group border-l-[6px]" style={{ borderLeftColor: item.competitors?.color || '#eee' }}>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-[#333] bg-[#FFD111] px-2.5 py-1 rounded-full uppercase tracking-wider">
                        {item.quelle || 'GLOBAL NEWS'}
                      </span>
                      <span className="flex items-center gap-1 text-gray-300 text-[10px] font-bold">
                        <Clock size={12} /> {item.veroeffentlicht ? new Date(item.veroeffentlicht).toLocaleDateString('pt-BR') : 'RECENT'}
                      </span>
                    </div>
                    <h4 className="text-xl font-bold text-[#333] group-hover:text-[#FFD111] transition-colors leading-snug">
                      {item.titel}
                    </h4>
                    <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                      {item.zusammenfassung}
                    </p>
                    <div className="pt-2">
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-[11px] font-black uppercase text-[#333] hover:underline flex items-center gap-1">
                        Open Report <ChevronRight size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-[32px] border-4 border-dashed border-gray-100 py-32 flex flex-col items-center justify-center text-center">
                <div className="bg-gray-50 p-6 rounded-full mb-4">
                  <Zap size={48} className="text-gray-200" />
                </div>
                <p className="text-gray-300 font-bold text-xl italic uppercase tracking-tighter">Waiting for intelligence flow...</p>
                <p className="text-gray-400 text-sm mt-2">Click <strong className="text-[#333]">RUN CRAWLER</strong> to start ingestion</p>
              </div>
            )}
          </div>

          {/* 右侧：真实的策略分析面板 */}
          <div className="space-y-6">
            
            {/* 策略分类 */}
            <div className="bg-[#333] rounded-[32px] p-8 text-white shadow-xl">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#FFD111] mb-8 border-b border-white/10 pb-4">Strategy Segments</h4>
              <div className="space-y-4">
                {segments.map((tag) => (
                  <div key={tag.label} className="flex justify-between items-center group cursor-pointer p-2 hover:bg-white/5 rounded-xl transition-colors">
                    <span className="font-bold text-md group-hover:text-[#FFD111] transition-colors">{tag.label}</span>
                    <span className="bg-white/10 text-[10px] px-2 py-1 rounded-md text-gray-400 group-hover:text-[#FFD111]">
                      {/* 如果数据为0，显示 00 保持 UI 对齐 */}
                      {tag.count < 10 ? `0${tag.count}` : tag.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 声量份额 */}
            <div className="bg-[#FFD111] rounded-[32px] p-8 text-[#333] shadow-lg">
               <h4 className="font-black italic text-xl uppercase tracking-tighter mb-1">Brazil Intel</h4>
               <p className="text-xs font-bold opacity-60 mb-4 uppercase">Intel Share of Voice</p>
               
               {/* 动态比例条 */}
               <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden flex">
                  <div className="h-full bg-[#333] transition-all duration-1000 ease-out" style={{ width: `${news.length > 0 ? keetaShare : 0}%` }}></div>
                  <div className="h-full bg-white/50 transition-all duration-1000 ease-out" style={{ width: `${news.length > 0 ? ifoodShare : 0}%` }}></div>
               </div>
               
               {/* 动态数字 */}
               <div className="flex justify-between mt-2 font-black text-[10px]">
                  <span>KEETA {news.length > 0 ? keetaShare : 0}%</span>
                  <span>IFOOD {news.length > 0 ? ifoodShare : 0}%</span>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}