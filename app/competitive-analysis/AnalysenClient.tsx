// 文件路径: app/competitive-analysis/AnalysenClient.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Loader2, BarChart3, PieChart, TrendingUp, Zap } from 'lucide-react'

interface ShareMetric {
  name: string
  value: number
  count: number
  color: string
}

interface DashboardData {
  totalVolume: number
  shares: ShareMetric[]
  lastUpdated: string
}

export default function AnalysenClient() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 🚀 核心：击穿缓存的绝对清空实时抓取引擎
  const fetchLiveMetrics = async () => {
    setIsRefreshing(true)
    setError(null)
    try {
      // 通过强制追加当前毫秒级时间戳，彻底摧毁浏览器和 CDN 的 5 月历史缓存死锁
      const res = await fetch(`/api/keywords?t=${Date.now()}`, {
        cache: 'no-store', // 💡 显式命令浏览器：绝对不准查阅本地存根
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-store'
        }
      })

      if (!res.ok) throw new Error(`HTTP Error! Status: ${res.status}`)
      
      const result = await res.json()
      if (result.success && result.data) {
        setData(result.data) // 将最新清洗出的 6 月大盘占比塞入状态机，触发图表重绘
      } else {
        throw new Error(result.error || 'Data pipeline resolved empty.')
      }
    } catch (err: any) {
      console.error('❌ Failed to sync production metrics:', err)
      setError(err.message || 'Pipeline offline')
    } finally {
      setIsRefreshing(false)
    }
  }

  // 初始挂载时加载最新真实大盘数据
  useEffect(() => {
    fetchLiveMetrics()
  }, [])

  // 🚀 点击右侧刷新旋钮触发的硬核对攻动作
  const handleRefreshClick = async () => {
    // 1. 穿透拉取最新大盘声量 JSON
    await fetchLiveMetrics()
    // 2. 强刷 Next.js 服务端上下文，逼迫页面上其他异步挂载的关联服务器组件同步扫描 Supabase 最新物理状态
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* 1. 大盘动态指标卡片 */}
      <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
        
        {/* Header 区域：包含右侧的核心刷新旋钮 */}
        <div className="flex items-center justify-between border-b border-gray-50 pb-5 mb-6">
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-[#333] uppercase tracking-wider flex items-center gap-2 italic">
              <PieChart className="text-[#FFD111]" size={16} /> 实时大盘声量占比 (Real-time SOV Matrix)
            </h3>
            <p className="text-[11px] text-gray-400 font-medium">
              通过分布式 OSINT 数据管道实时监控拉美核心商圈的活跃声量指数
            </p>
          </div>
          
          {/* 🚀 右侧硬核刷新按钮 */}
          <button 
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="p-2.5 hover:bg-gray-50 rounded-xl transition-all text-gray-400 hover:text-[#333] disabled:opacity-40 border border-transparent hover:border-gray-100 bg-gray-50/50"
            title="Force Revalidate Pipeline / 强刷实时大盘"
          >
            {isRefreshing ? (
              <Loader2 size={16} className="animate-spin text-[#FFD111]" />
            ) : (
              <RefreshCw size={16} className="active:scale-95 transition-transform" />
            )}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs font-bold text-red-600">
            ⚠️ 实时同步中断: {error} (正在读取本地安全隔离存根)
          </div>
        )}

        {/* 2. 视觉占比渲染条 (100% 动态对齐最新 6 月数据) */}
        {data ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {data.shares.map((share, idx) => (
                <div key={idx} className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100/50 space-y-1">
                  <span className="text-[11px] font-black uppercase text-gray-400 tracking-wider block">{share.name}</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-[#333] tracking-tight">{share.value}%</span>
                    <span className="text-xs text-gray-400 font-bold">({share.count} 样本)</span>
                  </div>
                </div>
              ))}
            </div>

          {/* 满血动态进度条条形图 */}
<div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden flex p-0.5 border border-gray-200/50">
  {data.shares.map((share, idx) => (
    <div 
      key={idx}
      className="h-full transition-all duration-700 ease-out first:rounded-l-full last:rounded-r-full"
      // 🚀 完美的单 style 属性合并，一次性把宽度和竞对主色砸进去
      style={{ 
        width: `${share.value}%`, 
        backgroundColor: share.color 
      }}
    />
  ))}
</div>


            <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider pt-2">
              <span className="flex items-center gap-1 text-green-600"><Zap size={10}/> Data Pipeline Secure / 通道安全</span>
              <span>最后穿透同步时间: {new Date(data.lastUpdated).toLocaleTimeString()}</span>
            </div>
          </div>
        ) : (
          <div className="h-40 flex flex-col items-center justify-center text-center space-y-2">
            <Loader2 className="animate-spin text-[#FFD111]" size={24} />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">正在穿透物理 Schema 缓存层...</p>
          </div>
        )}

      </div>
    </div>
  )
}