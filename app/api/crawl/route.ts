import { NextResponse } from 'next/server'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { supabase } from '@/lib/supabase' // 确保这里使用的是我们新配好的 Supabase 路径

export async function POST() {
  // 1. 获取所有激活的 RSS 数据源 (对应 Operatix-B 的双轨情报流：自动采集)
  const { data: quellen, error: qError } = await supabase
    .from('data_sources')
    .select('*')
    .eq('is_active', true)
    .eq('type', 'RSS')

  if (qError || !quellen) {
    return NextResponse.json({ success: false, error: 'Failed to fetch sources' }, { status: 500 })
  }

  let newEntries = 0

  for (const q of quellen) {
    try {
      // 这里的字段映射同时兼容了数据库中的德文和英文命名的可能性
      const targetUrl = q.url_or_config || q.urlOderConfig
      const { data } = await axios.get(targetUrl, { timeout: 8000 })
      const $ = cheerio.load(data, { xmlMode: true })
      const items = $('item').toArray()

      for (const item of items) {
        const titel = $(item).find('title').text().trim()
        const link = $(item).find('link').text().trim()
        const pubDate = $(item).find('pubDate').text()
        const description = $(item).find('description').text()

        if (!titel || !link) continue

        // 2. 检查链接是否已存在 (查重：防止重复抓取同一个 KeeTa 或 iFood 动态)
        const { data: exists } = await supabase
          .from('auto_entries')
          .select('id')
          .eq('url', link)
          .maybeSingle()

        if (!exists) {
          // 3. 动态识别巴西市场竞品
          // 逻辑：如果数据源名称包含 keeta，映射到相应 ID（通常为 1），否则默认为 iFood（通常为 2）
          const isKeeta = q.name.toLowerCase().includes('keeta')
          const competitorId = isKeeta ? 1 : 2 

          // 4. 插入新情报到统一情报池
          const { error: insertError } = await supabase
            .from('auto_entries')
            .insert([{
              titel,
              zusammenfassung: description?.replace(/<[^>]*>/g, '').slice(0, 300),
              url: link,
              quelle: 'RSS',
              competitor_id: competitorId,
              veroeffentlicht: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
              ist_gelesen: false
            }])

          if (!insertError) newEntries++
        }
      }
    } catch (err) {
      console.error(`[Crawler] Error fetching ${q.name}:`, err)
    }
  }

  // 成功完成后，返回新抓取的情报数量
  return NextResponse.json({ success: true, newEntries })
}