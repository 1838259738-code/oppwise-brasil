import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

// 🚀 核心：禁用缓存，每次进入或刷新首页时，百分之百重新执行后端查询
export const dynamic = 'force-dynamic'
export const revalidate = 0

// 1. 初始化 Supabase 引擎 / Initialize Supabase Engine
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function HomePage() {
  
  // 2. 封装容错查询
  const getCount = async (table: string, match?: object) => {
    let query = supabase.from(table).select('*', { count: 'exact', head: true })
    if (match) query = query.match(match)
    const { count, error } = await query
    return error ? 0 : count ?? 0
  }

  const getAutoEntries = async () => {
    const { data, error } = await supabase
      .from('auto_entries')
      .select('*, competitors(*)')
      .order('created_at', { ascending: false })
      .limit(6)
    return error ? [] : data
  }

  // 3. 并发拉取数据库指标 / Fetch metrics concurrently
  const [autoEntries, materialCount, fieldIntelCount, unreadCount] = await Promise.all([
    getAutoEntries(),
    getCount('materials'),
    getCount('field_intel'),
    getCount('auto_entries', { ist_gelesen: false }),
  ])

  // 4. 动态计算最后同步时间 / Calculate Last Sync Timestamp Dynamically
  const latestSyncTimestamp = autoEntries.length > 0 && autoEntries[0]?.created_at
    ? new Date(autoEntries[0].created_at)
    : new Date()

  const syncTimeString = `${latestSyncTimestamp.toLocaleString('zh-CN', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} / ${latestSyncTimestamp.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`

  return (
    <div className="space-y-10 max-w-7xl mx-auto py-8 px-4">
      
      {/* 🚀 视觉洗白：重构为高级、扁平的 99Food 官方中台双语标题区 */}
      <div className="border-b border-gray-100 pb-6">
        <div className="flex items-center gap-3">
          {/* 用一个精致的垂直黄色色块取代之前突兀的粗红线 */}
          <div className="w-1.5 h-8 bg-[#FFD111] rounded-full" />
          <h2 className="text-2xl md:text-3xl font-black text-[#333] tracking-tight">
            Dashboard
          </h2>
          <span className="text-gray-300 font-light text-xl md:text-2xl">|</span>
          <span className="text-gray-500 font-bold text-base md:text-lg mt-0.5">
            数据主控台
          </span>
        </div>
        <p className="text-xs md:text-sm font-medium text-gray-400 mt-2 ml-4">
          Market Intelligence Overview & Real-time Signals Tracker / 全量市场竞争情报综述与实效信号追踪
        </p>
      </div>

      {/* 数据看板卡片区 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between">
          <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Total Materials / 聚合资产总量</p>
          <p className="text-4xl font-extrabold text-gray-900 mt-2">{materialCount}</p>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between">
          <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Field Intel / 前线实效提报</p>
          <p className="text-4xl font-extrabold text-gray-900 mt-2">{fieldIntelCount}</p>
        </div>
        
        <div className="bg-[#FFD111] p-6 rounded-3xl shadow-[0_8px_30px_rgba(255,209,17,0.2)] border border-[#FFD111]/30 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-xl group-hover:scale-110 transition-transform"></div>
          <p className="text-xs font-black text-gray-800 uppercase tracking-wider relative z-10">Unread Alerts / 未读时效预警</p>
          <p className="text-4xl font-extrabold text-gray-900 mt-2 relative z-10">{unreadCount}</p>
        </div>
        
        <div className="bg-gray-900 p-6 rounded-3xl shadow-lg border border-gray-800 flex flex-col justify-between relative">
          <div className="absolute top-4 right-4 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-mono font-black text-green-400 tracking-widest uppercase">LIVE</span>
          </div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Last Sync / 系统最近同步</p>
          <p className="text-xs font-bold text-white mt-3 leading-snug font-mono">
            {syncTimeString}
          </p>
        </div>
      </div>

      {/* 最新动态列表 */}
      <div>
        <div className="flex justify-between items-end mb-6">
          <div className="space-y-0.5">
            <h3 className="text-xl font-black text-gray-900 tracking-tight">Latest Activity / 实时情报监听流</h3>
            <p className="text-xs text-gray-400 font-bold">由分布式数据管线毫秒级同步回传 / Distributed OSINT pipeline updates</p>
          </div>
          <Link href="/competitive-analysis" className="text-yellow-600 text-xs font-black uppercase tracking-wider hover:text-yellow-700 transition-colors flex items-center gap-1 pb-1">
            View all / 查看全部
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </Link>
        </div>
        
        <div className="space-y-4">
          {autoEntries.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-10 text-center">
              <p className="text-gray-500 font-medium text-sm">No automated intelligence entries fetched yet. / 暂无公共管道情报信号流输入。</p>
            </div>
          ) : (
            autoEntries.map((e: any) => (
              <div key={e.id} className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex items-start gap-5 hover:border-[#FFD111] transition-all cursor-pointer group">
                <span
                  className="w-3.5 h-3.5 rounded-full mt-1.5 flex-shrink-0 shadow-inner"
                  style={{ backgroundColor: e.competitors?.color || '#FFD111' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="font-bold text-gray-900 text-base md:text-lg truncate group-hover:text-yellow-600 transition-colors">
                      {e.titel || 'Untitled Alert'}
                    </h4>
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap font-mono shadow-sm">
                      {e.quelle || 'OSINT Scraper'}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                    {e.zusammenfassung || 'No detailed strategy digest available. / 暂无结构化摘要描述。'}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-4 text-[10px] font-black text-gray-400 uppercase tracking-wider font-mono">
                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                      TARGET: {e.competitors?.name || 'Industry 大盘'}
                    </span>
                    <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      INGESTED: {e.created_at ? new Date(e.created_at).toLocaleDateString('zh-CN') : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}