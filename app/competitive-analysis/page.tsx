import { supabase } from '@/lib/supabase'
import { Zap, TrendingUp, Globe, Clock, ChevronRight, BarChart3 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CompetitiveAnalysis() {
  // 从自动情报表拉取数据，并关联竞品颜色
  const { data: news, error } = await supabase
    .from('auto_entries')
    .select(`*, competitors(name, color)`)
    .order('veroeffentlicht', { ascending: false })

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 顶部状态栏：99Food 活力黄 */}
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
            
            {news && news.length > 0 ? (
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
                      <a href={item.url} target="_blank" className="text-[11px] font-black uppercase text-[#333] hover:underline flex items-center gap-1">
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
                <p className="text-gray-400 text-sm mt-2">Trigger /api/crawl to start ingestion</p>
              </div>
            )}
          </div>

          {/* 右侧：策略筛选面板 */}
          <div className="space-y-6">
            <div className="bg-[#333] rounded-[32px] p-8 text-white shadow-xl">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#FFD111] mb-8 border-b border-white/10 pb-4">Strategy Segments</h4>
              <div className="space-y-4">
                {[
                  { label: 'Pricing Strategy', count: '12' },
                  { label: 'Subsidy Efficiency', count: '08' },
                  { label: 'Merchant Growth', count: '05' },
                  { label: 'User Retention', count: '14' }
                ].map((tag) => (
                  <div key={tag.label} className="flex justify-between items-center group cursor-pointer p-2 hover:bg-white/5 rounded-xl transition-colors">
                    <span className="font-bold text-md group-hover:text-[#FFD111] transition-colors">{tag.label}</span>
                    <span className="bg-white/10 text-[10px] px-2 py-1 rounded-md text-gray-400 group-hover:text-[#FFD111]">{tag.count}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-[#FFD111] rounded-[32px] p-8 text-[#333] shadow-lg">
               <h4 className="font-black italic text-xl uppercase tracking-tighter mb-1">Brazil Intel</h4>
               <p className="text-xs font-bold opacity-60 mb-4 uppercase">KeeTa vs iFood Share</p>
               <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden flex">
                  <div className="h-full bg-[#333]" style={{ width: '42%' }}></div>
                  <div className="h-full bg-white/50" style={{ width: '58%' }}></div>
               </div>
               <div className="flex justify-between mt-2 font-black text-[10px]">
                  <span>KEETA 42%</span>
                  <span>IFOOD 58%</span>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}