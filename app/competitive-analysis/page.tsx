import { supabase } from '@/lib/supabase'
import { Activity, Radio, BarChart3, Globe, Zap, FileText } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CompetitiveAnalysis() {
  // 1. 获取所有情报新闻 (包含 KeeTa, iFood 和新加入的 Rappi)
  const { data: news } = await supabase
    .from('auto_entries')
    .select('*, competitors(name, color)')
    .order('created_at', { ascending: false })
    .limit(100) // 获取最近100条用于分析

  // 2. 动态计算所有竞品的 Share of Voice (声量占比)
  const competitorStats = (news || []).reduce((acc: any, item: any) => {
    const compName = item.competitors?.name || 'Unknown'
    const compColor = item.competitors?.color || '#999'
    if (!acc[compName]) acc[compName] = { count: 0, color: compColor }
    acc[compName].count += 1
    return acc
  }, {})

  const totalNews = news?.length || 1 // 避免除以0
  const statsArray = Object.entries(competitorStats).sort((a: any, b: any) => b[1].count - a[1].count)

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm flex items-center gap-6 border border-gray-100">
          <div className="bg-[#333] p-4 rounded-[24px] shadow-lg">
            <Radio size={32} className="text-[#FFD111]" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-[#333] tracking-tight">Macro Radar</h2>
            <p className="text-gray-400 font-medium mt-1">Real-time automated intelligence from public domains</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 左侧：动态声量大盘 (Share of Voice) */}
          <div className="lg:col-span-2 bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-[#333] flex items-center gap-2 mb-6">
              <BarChart3 size={18} className="text-[#FFD111]" /> Share of Voice (Recent 100 Signals)
            </h3>
            
            {/* 动态进度条 */}
            <div className="h-6 w-full rounded-full overflow-hidden flex mb-6 bg-gray-100 shadow-inner">
              {statsArray.map(([name, data]: any) => (
                <div 
                  key={name} 
                  style={{ width: `${(data.count / totalNews) * 100}%`, backgroundColor: data.color }}
                  className="h-full transition-all duration-1000"
                  title={`${name}: ${data.count}`}
                />
              ))}
            </div>

            {/* 动态图例 */}
            <div className="flex flex-wrap gap-4">
              {statsArray.map(([name, data]: any) => (
                <div key={name} className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
                  <span className="font-bold text-[#333] text-sm">{name}</span>
                  <span className="font-black text-gray-400 text-xs ml-2">{Math.round((data.count / totalNews) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* 右侧：爬虫引擎状态 */}
          <div className="bg-[#FFD111] rounded-[32px] p-8 shadow-md relative overflow-hidden text-[#333]">
            <Globe size={120} className="absolute -right-4 -bottom-4 opacity-10" />
            <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-2">OSINT Engine</h4>
            <div className="text-4xl font-black mb-1">{totalNews}</div>
            <p className="font-bold text-[#333]/70 text-sm mb-6">Active signals tracked</p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-white/40 p-3 rounded-xl font-bold text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Google News Aggregator
              </div>
              <div className="flex items-center gap-2 bg-white/40 p-3 rounded-xl font-bold text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> RSS Strategy Feeds
              </div>
            </div>
          </div>

          {/* 底部：动态情报信息流 (包含 Rappi 新闻) */}
          <div className="lg:col-span-3 bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
             <h3 className="text-lg font-bold text-[#333] flex items-center gap-2 mb-6">
              <Activity size={18} className="text-[#FFD111]" /> Live Intel Feed
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {news?.slice(0, 12).map((item) => (
                <a href={item.url} target="_blank" key={item.id} className="group block bg-gray-50 rounded-[24px] p-6 hover:bg-[#333] transition-colors border border-gray-100 hover:border-[#333]">
                  <div className="flex items-center gap-2 mb-3">
                    <span 
                      className="text-[10px] font-black uppercase px-2 py-1 rounded text-white" 
                      style={{ backgroundColor: item.competitors?.color || '#999' }}
                    >
                      {item.competitors?.name || 'Industry'}
                    </span>
                    <span className="text-gray-400 text-[10px] font-bold group-hover:text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="font-bold text-[#333] text-sm line-clamp-3 group-hover:text-white transition-colors">
                    {item.titel}
                  </h4>
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}