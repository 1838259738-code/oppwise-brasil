import { 
  FileText, 
  Download, 
  Plus, 
  TrendingUp, 
  Calendar, 
  ArrowRight,
  PieChart,
  Target,
  Zap // ⚡️ 已经补上了这个小闪电图标的引用
} from 'lucide-react'

// 强制动态渲染
export const dynamic = 'force-dynamic'

export default function ReportsPage() {
  // 模拟的报表数据
  const reports = [
    { id: 1, title: 'KeeTa Q3 Expansion Strategy Analysis', type: 'Market Share', date: 'Oct 15, 2026', format: 'PDF', status: 'Ready' },
    { id: 2, title: 'iFood Membership Pricing Impact', type: 'Pricing Intel', date: 'Oct 10, 2026', format: 'Excel', status: 'Ready' },
    { id: 3, title: 'SP Region Courier Subsidy Comparison', type: 'Operations', date: 'Oct 05, 2026', format: 'PDF', status: 'Ready' },
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
              <p className="text-gray-400 font-medium mt-1">Compiled insights and strategic teardowns for LATAM</p>
            </div>
          </div>
          <button className="bg-[#FFD111] text-[#333] px-8 py-4 rounded-[24px] font-black uppercase tracking-widest text-sm hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2">
            <Plus size={18} /> Generate New
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 左侧：报告列表 */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-[#333] flex items-center gap-2 mb-4 px-2">
              <TrendingUp size={18} className="text-[#FFD111]" /> Recent Deliverables
            </h3>
            
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="bg-white rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all border border-gray-50 flex items-center justify-between group">
                  <div className="flex items-center gap-6">
                    {/* 图标区 */}
                    <div className="bg-[#F8F9FA] p-4 rounded-2xl group-hover:bg-[#FFD111]/10 transition-colors">
                      {report.format === 'PDF' ? (
                        <FileText size={28} className="text-[#333]" />
                      ) : (
                        <PieChart size={28} className="text-[#333]" />
                      )}
                    </div>
                    {/* 文本区 */}
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-black text-[#FFD111] bg-[#333] px-2 py-0.5 rounded-md uppercase">
                          {report.type}
                        </span>
                        <span className="flex items-center gap-1 text-gray-400 text-xs font-bold">
                          <Calendar size={12} /> {report.date}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-[#333] group-hover:text-[#FFD111] transition-colors">
                        {report.title}
                      </h4>
                    </div>
                  </div>
                  
                  {/* 操作区 */}
                  <div className="flex items-center gap-4">
                    <button className="bg-gray-50 hover:bg-[#FFD111] text-[#333] p-3 rounded-full transition-colors">
                      <Download size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full py-6 mt-4 text-sm font-black uppercase text-gray-400 hover:text-[#333] flex items-center justify-center gap-2 transition-colors">
              View Archive <ArrowRight size={16} />
            </button>
          </div>

          {/* 右侧：洞察摘要 & 自动生成入口 */}
          <div className="space-y-6">
            <div className="bg-[#FFD111] rounded-[32px] p-8 text-[#333] shadow-lg relative overflow-hidden">
              <div className="absolute top-[-20px] right-[-20px] opacity-10">
                <Target size={150} />
              </div>
              <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6">AI Summary Engine</h4>
              <p className="text-xl font-black leading-tight mb-6">
                Auto-generate monthly competitor tear-downs from your synchronized intelligence streams.
              </p>
              <button className="bg-[#333] text-white w-full py-4 rounded-[20px] font-bold uppercase text-sm hover:bg-black transition-colors flex justify-between items-center px-6">
                <span>Run Monthly Script</span>
                <Zap size={16} className="text-[#FFD111]" />
              </button>
            </div>

            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
               <h4 className="font-bold text-[#333] mb-6 flex items-center gap-2">
                 Data Coverage
               </h4>
               <div className="space-y-4">
                 <div>
                   <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase">
                     <span>Raw Intel Parsed</span>
                     <span className="text-[#333]">1,248</span>
                   </div>
                   <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-[#FFD111] w-[85%] rounded-full" />
                   </div>
                 </div>
                 <div>
                   <div className="flex justify-between text-xs font-bold text-gray-400 mb-2 uppercase">
                     <span>Field Screenshots</span>
                     <span className="text-[#333]">342</span>
                   </div>
                   <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-[#333] w-[45%] rounded-full" />
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