import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { supabase } from '@/lib/supabase'

// 强制动态渲染，确保 Vercel 构建时不会因缺少环境配置而失败
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // 1. 获取所有激活的 RSS 数据源 (对应 99Food 自动化情报采集体系)
    const { data: quellen, error: qError } = await supabase
      .from('data_sources')
      .select('*')
      .eq('is_active', true)
      .eq('type', 'RSS')

    if (qError || !quellen) {
      console.error('[Crawler] Source Fetch Error:', qError)
      return NextResponse.json({ success: false, error: 'Failed to fetch data sources' }, { status: 500 })
    }

    let newEntries = 0

    // 2. 遍历数据源进行情报抓取
    for (const q of quellen) {
      try {
        const targetUrl = q.url_or_config
        if (!targetUrl) continue

        const { data } = await axios.get(targetUrl, { 
          timeout: 10000,
          headers: { 'User-Agent': 'Operatix-B Intelligence Bot' }
        })
        
        const $ = cheerio.load(data, { xmlMode: true })
        const items = $('item').toArray()

        for (const item of items) {
          const titel = $(item).find('title').text().trim()
          const link = $(item).find('link').text().trim()
          const pubDate = $(item).find('pubDate').text()
          const description = $(item).find('description').text()

          if (!titel || !link) continue

          // 3. 查重逻辑：基于 URL 确保情报唯一性
          const { data: exists } = await supabase
            .from('auto_entries')
            .select('id')
            .eq('url', link)
            .maybeSingle()

          if (!exists) {
            // 4. 巴西市场竞品动态自动映射 (KeeTa vs iFood)
            const isKeeta = q.name.toLowerCase().includes('keeta')
            const competitorId = isKeeta ? 1 : 2 

            // 5. 格式化并存入情报表
            const { error: insertError } = await supabase
              .from('auto_entries')
              .insert([{
                titel,
                zusammenfassung: description?.replace(/<[^>]*>/g, '').slice(0, 300),
                url: link,
                quelle: q.name || 'RSS_FEED',
                competitor_id: competitorId,
                veroeffentlicht: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
                ist_gelesen: false
              }])

            if (!insertError) newEntries++
          }
        }
      } catch (err) {
        console.error(`[Crawler] Failed to process source ${q.name}:`, err)
      }
    }

    return NextResponse.json({ 
      success: true, 
      newEntries, 
      timestamp: new Date().toISOString(),
      market: 'Brazil'
    })

  } catch (err: any) {
    console.error('[Crawler Global Crash]:', err)
    return NextResponse.json({ success: false, error: 'Internal pipeline error' }, { status: 500 })
  }
}