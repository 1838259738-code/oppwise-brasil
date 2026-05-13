import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

// 1. 初始化 Supabase 引擎 (直接使用你配好的环境变量)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export default async function HomePage() {
  // 2. 封装容错查询：哪怕 Supabase 里暂时还没建这些表，网页也不会崩溃，只会显示 0
  const getCount = async (table: string, match?: object) => {
    let query = supabase.from(table).select('*', { count: 'exact', head: true })
    if (match) query = query.match(match)
    const { count, error } = await query
    return error ? 0 : count ?? 0
  }

  const getAutoEntries = async () => {
    const { data, error } = await supabase
      .from('auto_entries') // 假设你的爬虫数据表叫 auto_entries
      .select('*, competitors(*)')
      .order('created_at', { ascending: false })
      .limit(6)
    return error ? [] : data
  }

  // 3. 并发拉取所有数据
  const [autoEntries, materialCount, fieldIntelCount, unreadCount] = await Promise.all([
    getAutoEntries(),
    getCount('materials'),
    getCount('field_intel'),
    getCount('auto_entries', { ist_gelesen: false }),
  ])

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8">
      {/* 标题区 */}
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Dashboard</h2>
        <p className="text-gray-500 mt-1">Market Intelligence Overview</p>
      </div>

      {/* 数据看板：99Food 风格大圆角卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Materials</p>
          <p className="text-4xl font-extrabold text-gray-900 mt-2">{materialCount}</p>
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Field Intel</p>
          <p className="text-4xl font-extrabold text-gray-900 mt-2">{fieldIntelCount}</p>
        </div>
        
        <div className="bg-[#FFCC00] p-6 rounded-3xl shadow-[0_8px_30px_rgba(255,204,0,0.2)] border border-yellow-400 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
          <p className="text-sm font-bold text-gray-800 uppercase tracking-wider relative z-10">Unread Alerts</p>
          <p className="text-4xl font-extrabold text-gray-900 mt-2 relative z-10">{unreadCount}</p>
        </div>
        
        <div className="bg-gray-900 p-6 rounded-3xl shadow-lg border border-gray-800 flex flex-col justify-between">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Last Sync</p>
          <p className="text-xl font-bold text-white mt-2 leading-tight">
            {autoEntries.length > 0 && autoEntries[0]?.created_at 
              ? new Date(autoEntries[0].created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) 
              : 'Waiting for data...'}
          </p>
        </div>
      </div>

      {/* 最新动态列表 */}
      <div>
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Latest Activity</h3>
          <Link href="/competitive-analysis" className="text-yellow-600 font-bold hover:text-yellow-700 transition-colors flex items-center gap-1">
            View all 
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </Link>
        </div>
        
        <div className="space-y-4">
          {autoEntries.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-10 text-center">
              <p className="text-gray-500 font-medium">No automated intelligence entries fetched yet.</p>
            </div>
          ) : (
            autoEntries.map((e: any) => (
              <div key={e.id} className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 flex items-start gap-5 hover:border-yellow-400 transition-colors cursor-pointer group">
                <span
                  className="w-4 h-4 rounded-full mt-1 flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: e.competitors?.color || '#FFCC00' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="font-bold text-gray-900 text-lg truncate group-hover:text-yellow-600 transition-colors">{e.titel || 'Untitled Alert'}</h4>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap">
                      {e.quelle || 'Auto Scraper'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                    {e.zusammenfassung || 'No detailed summary provided.'}
                  </p>
                  <div className="flex items-center gap-4 mt-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                      {e.competitors?.name || 'Unknown Competitor'}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      {e.created_at ? new Date(e.created_at).toLocaleDateString('en-US') : 'N/A'}
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