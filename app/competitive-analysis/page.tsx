import { supabase } from '@/lib/supabase'
import AnalysenClient from './AnalysenClient'
export const dynamic = 'force-dynamic'

export default async function CompetitiveAnalysisPage() {
  // 1. 封装一个“防弹”查询函数：即使某张表没建好，或者字段名不对，页面也绝对不会崩溃白屏
  const safeFetch = async (tableName: string, selectQuery: string, orderByCol?: string) => {
    try {
      let query = supabase.from(tableName).select(selectQuery)
      if (orderByCol) {
        query = query.order(orderByCol, { ascending: false }).limit(100)
      }
      const { data, error } = await query
      if (error) throw error
      return data || []
    } catch (err) {
      console.error(`[Supabase Fetch Error - ${tableName}]:`, err)
      return [] // 报错时返回空数组，保护页面正常渲染
    }
  }

  // 2. 并发请求所有数据 (Supabase 的关联查询写法是 '*, 表名(*)')
  const [automatische, materialien, fieldIntel, kategorien, wettbewerber] = await Promise.all([
    safeFetch('auto_entries', '*, competitors(*), categories(*)', 'created_at'),
    safeFetch('materials', '*, competitors(*), categories(*)', 'created_at'),
    safeFetch('field_intel', '*, competitors(*)', 'created_at'),
    safeFetch('categories', '*'),
    safeFetch('competitors', '*')
  ])

  // 3. 混合数据流：增加超级容错处理，兼容旧字段和新字段
  const mixed = [
    ...automatische.map((a: any) => ({
      type: 'auto' as const,
      id: `a-${a.id}`,
      titel: a.titel || a.title || 'Untitled Auto Entry',
      beschreibung: a.zusammenfassung || a.summary || '',
      wettbewerber: a.competitors?.name || (a.competitor_id === '2' ? 'iFood' : 'KeeTa'),
      farbe: a.competitors?.color || (a.competitor_id === '2' ? '#EA1D2C' : '#FFCC00'),
      kategorie: a.categories?.name || 'News',
      datum: a.veroeffentlicht || a.created_at,
      quelle: a.quelle || 'RSS',
      dateien: null,
    })),
    ...materialien.map((m: any) => ({
      type: 'manual' as const,
      id: `m-${m.id}`,
      titel: m.titel || m.title || 'Untitled Material',
      beschreibung: m.beschreibung || m.description || '',
      wettbewerber: m.competitors?.name || (m.competitor_id === '2' ? 'iFood' : 'KeeTa'),
      farbe: m.competitors?.color || (m.competitor_id === '2' ? '#EA1D2C' : '#FFCC00'),
      kategorie: m.categories?.name || 'Manual Upload',
      datum: m.aufnahmeDatum || m.created_at,
      quelle: 'Manual',
      // 这里完美对接了我们刚才做的新版上传 API：直接读取 m.url
      dateien: m.url ? [m.url] : (m.dateiPfade ? JSON.parse(m.dateiPfade) : []), 
    })),
    ...fieldIntel.map((f: any) => ({
      type: 'field' as const,
      id: `f-${f.id}`,
      titel: f.titel || f.title || 'Field Intel Report',
      beschreibung: f.aiSummary || f.summary || '',
      wettbewerber: f.competitors?.name || (f.competitor_id === '2' ? 'iFood' : 'KeeTa'),
      farbe: f.competitors?.color || (f.competitor_id === '2' ? '#EA1D2C' : '#FFCC00'),
      kategorie: 'Field Intel',
      datum: f.createdAt || f.created_at,
      quelle: 'Field Intel',
      dateien: f.url ? [f.url] : (f.dateiPfade ? JSON.parse(f.dateiPfade) : []),
      extra: {
        stadt: f.stadt || f.city,
        screenType: f.screenType,
        userProfile: f.userProfile,
        priceFindings: f.priceFindings,
        strategyTags: f.strategyTags,
      }
    })),
  ].sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime())

  // 4. 99Food 风格 UI 包装层
  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* 标题区：保持与之前页面一致的撞色风格 */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Competitive Analysis</h2>
          <p className="text-gray-500 mt-2">Filter and analyze multi-source intelligence.</p>
        </div>
        <div className="bg-[#FFCC00] text-gray-900 px-4 py-2 rounded-xl font-bold text-sm shadow-[0_4px_14px_0_rgba(255,204,0,0.39)] inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z"></path></svg>
          {mixed.length} Records Synced
        </div>
      </div>

      {/* 客户端组件，负责渲染筛选项和卡片 */}
      <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100">
        <AnalysenClient
          initialData={mixed}
          kategorien={kategorien}
          wettbewerber={wettbewerber}
        />
      </div>
    </div>
  )
}