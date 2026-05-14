import { supabase } from '@/lib/supabase'
import { FileText, Download, Plus, TrendingUp, Calendar, ArrowRight, Target, Zap, PieChart } from 'lucide-react'

// 强制不缓存，实时拉取真实报表数据
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ReportsPage() {
  // 从数据库实时获取真实数据统计
  const { count: crawlerCount } = await supabase.from('auto_entries').select('*', { count: 'exact', head: true })
  const { count: materialCount } = await supabase.from('materials').select('*', { count: 'exact', head: true })
  
  // 拉取最新的 3 条竞争情报，用来动态生成真实报表标题
  const { data: recentNews } = await supabase
    .from('auto_entries')
    .select('*, competitors(name)')
    .order('id', { ascending: false })
    .limit(3)

  const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })

  // 基于真实数据动态生成报表条目
  const reports = recentNews && recentNews.length > 0 
    ? recentNews.map((news: any, index: number) => ({
        id: news.id,
        title: `${news.competitors?.name || 'LATAM'} Strategy: ${news.titel ? news.titel.substring(0, 30) : 'Market Update'}...`,
        type: index === 0 ? 'Pricing Intel' : 'Market Share',
        date: news.veroeffentlicht ? new Date(news.veroeffentlicht).toLocaleDateString() : 'Recent',
        format: index % 2 === 0 ? 'PDF' : 'Excel'
      }))
    : [
        // 如果数据库全空，显示默认的空状态占位
        { id: 1, title: `Brazil Food Delivery Overview (${currentMonth})`, type: 'Operations', date: 'Pending', format: 'PDF' }
      ]

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 顶部控制台 */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm flex flex-col md:flex-row justify-between items-center border border-gray-100 gap-6">
          <div className="flex items-center gap-6">
            <div className="bg-[#333] p-4 rounded-[24px] shadow-lg">
              <FileText size={32} className="text-[#FFD111]" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-[#333] tracking-tight">Intelligence Reports</h2>
              <p className="text-gray-400 font-medium mt-1">Compiled insights and strategic teardowns based on real-time data</p>
            </div>
          </div>
          <button className="bg-[#FFD111] text-[#333] px-8 py-4 rounded-[24px] font-black uppercase tracking-widest text-sm hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2">
            <Plus size={18} /> Generate New
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 左侧：动态报告列表 */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-[#333] flex items-center gap-2 mb-4 px-2">
              <TrendingUp size={18} className="text-[#FFD111]" /> Auto-Generated Deliverables
            </h3>
            
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="bg-white rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all border border-gray-50 flex items-center justify-between group">
                  <div className="flex items-center gap-6">
                    <div className="bg-[#F8F9FA] p-4 rounded-2xl group-hover:bg-[#FFD111]/10 transition-colors">
                      {report.format === 'PDF' ? <FileText size={28} className="text-[#333]" /> : <PieChart size={28} className="text-[#333]" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-black text-[#FFD111] bg-[#333] px-2 py-0.5 rounded-md uppercase">{report.type}</span>
                        <span className="flex items-center gap-1 text-gray-400 text-xs font-bold"><Calendar size={12} /> {report.date}</span>
                      </div>
                      <h4 className="text-lg font-bold text-[#333] group-hover:text-[#FFD111] transition-colors">
                        {report.title}
                      </h4>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button className="bg-gray-50 hover:bg-[#FFD111] text-[#333] p-3 rounded-full transition-colors">
                      <Download size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右侧：真实的覆盖率统计面板 */}
          <div className="space-y-6">
            <div className="bg-[#FFD111] rounded-[32px] p-8 text-[#333] shadow-lg relative overflow-hidden">
              <div className="absolute top-[-20px] right-[-20px] opacity-10">
                <Target size={150} />
              </div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6">AI Summary Engine</h4>
              <p className="text-xl font-black leading-tight mb-6">
                Compile {crawlerCount || 0} news entries and {materialCount || 0} visual assets into a monthly teardown.
              </p>
              <button className="bg-[#333] text-white w-full py-4 rounded-[20px] font-bold uppercase text-sm hover:bg-black transition-colors flex justify-between items-center px-6">
                <span>Run {currentMonth} Script</span>
                <Zap size={16} className="text-[#FFD111]" />
              </button>
            </div>

            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
               <h4 className="font-bold text-[#333] mb-6 flex items-center gap-2">Data Coverage</h4>
               <div className="space-y-4">
                 <div>
                   <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase">
                     <span>Raw Intel Parsed</span>
                     <span className="text-[#333]">{crawlerCount || 0}</span>
                   </div>
                   <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                     {/* 进度条长度根据数据量真实变化 */}
                     <div className="h-full bg-[#FFD111] rounded-full" style={{ width: `${Math.min(((crawlerCount || 0) / 100) * 100, 100)}%` }} />
                   </div>
                 </div>
                 <div>
                   <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase">
                     <span>Field Screenshots</span>
                     <span className="text-[#333]">{materialCount || 0}</span>
                   </div>
                   <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-[#333] rounded-full" style={{ width: `${Math.min(((materialCount || 0) / 50) * 100, 100)}%` }} />
                   </div>
                 </div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}