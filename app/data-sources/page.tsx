import { supabase } from '@/lib/supabase'
import DatenquellenClient from './DatenquellenClient'

export default async function DataSourcesPage() {
  // 1. 防弹查询函数：自动处理表名不存在的情况
  const safeFetch = async (tableName: string, fallbackTableName: string) => {
    try {
      // 优先尝试标准英文表名
      const { data, error } = await supabase.from(tableName).select('*').order('id', { ascending: false })
      if (error) {
        // 如果报错，尝试退回到旧的德文表名
        const { data: fallbackData } = await supabase.from(fallbackTableName).select('*').order('id', { ascending: false })
        return fallbackData || []
      }
      return data || []
    } catch (err) {
      console.error(`[Supabase Fetch Error - ${tableName}]:`, err)
      return []
    }
  }

  // 2. 并发获取数据 (尝试新表名 data_sources / keywords，如果找不到自动找旧表名)
  const [rawSources, rawKeywords] = await Promise.all([
    safeFetch('data_sources', 'Datenquelle'),
    safeFetch('keywords', 'MonitoringKeyword'),
  ])

  // 3. 字段映射兼容层：无论你数据库里用的是英文还是德文字段，到了前端统统能正常显示
  const datenquellen = rawSources.map((q: any) => ({
    id: q.id,
    name: q.name || q.titel || 'Unnamed Source',
    typ: q.type || q.typ || 'RSS',
    urlOderConfig: q.url_or_config || q.urlOderConfig || q.url || '',
    aktiv: q.is_active !== undefined ? q.is_active : (q.aktiv !== undefined ? q.aktiv : true)
  }))

  const keywords = rawKeywords.map((k: any) => ({
    id: k.id,
    keyword: k.keyword || k.wort || ''
  }))

  return (
    <div className="bg-gray-50 min-h-screen">
      <DatenquellenClient quellen={datenquellen} keywords={keywords} />
    </div>
  )
}