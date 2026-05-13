import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const von = searchParams.get('von')
  const bis = searchParams.get('bis')
  const wettbewerber = searchParams.get('wettbewerber')
  const typ = searchParams.get('typ') || 'all'

  // 1. 基础校验
  if (!von || !bis) {
    return new NextResponse('Missing date range', { status: 400 })
  }

  const startDate = new Date(von).toISOString()
  const endDate = new Date(bis)
  endDate.setHours(23, 59, 59, 999)
  const endDateISO = endDate.toISOString()

  // 2. 准备 CSV 表头
  const rows: string[] = ['Type,Title,Description,Competitor,Category,Date,Source,City,User Profile,Strategy Tags']

  /**
   * 辅助函数：构建带过滤条件的查询
   * 使用 !inner 确保根据关联表（竞品名）进行的过滤能够生效
   */
  const buildQuery = (table: string, dateCol: string) => {
    let query = supabase
      .from(table)
      .select(`*, competitors!inner(*), categories(*)`)
      .gte(dateCol, startDate)
      .lte(dateCol, endDateISO)
    
    if (wettbewerber && wettbewerber !== 'all') {
      query = query.eq('competitors.name', wettbewerber)
    }
    return query
  }

  // 3. 并行抓取并格式化数据
  const tasks = []

  // 处理手动上传素材 (Manual Materials)
  if (typ === 'all' || typ === 'manual') {
    tasks.push(
      buildQuery('materials', 'aufnahmeDatum').then(({ data }) => {
        data?.forEach((m: any) => {
          rows.push(`Manual,"${m.titel}","${(m.beschreibung || '').replace(/"/g, '""')}",${m.competitors?.name},${m.categories?.name},${m.aufnahmeDatum},-,-,-,-`)
        })
      })
    )
  }

  // 处理自动化爬虫情报 (Auto Entries)
  if (typ === 'all' || typ === 'auto') {
    tasks.push(
      buildQuery('auto_entries', 'created_at').then(({ data }) => {
        data?.forEach((a: any) => {
          rows.push(`Auto,"${a.titel}","${(a.zusammenfassung || '').replace(/"/g, '""')}",${a.competitors?.name},${a.categories?.name || 'Unknown'},${a.created_at},${a.quelle},-,-,-`)
        })
      })
    )
  }

  // 处理现场情报报告 (Field Intel)
  if (typ === 'all' || typ === 'field') {
    tasks.push(
      buildQuery('field_intel', 'created_at').then(({ data }) => {
        data?.forEach((f: any) => {
          // 处理 JSON 格式的策略标签
          const tags = typeof f.strategy_tags === 'string' ? f.strategy_tags : JSON.stringify(f.strategy_tags || [])
          rows.push(`Field Intel,"${f.titel}","${(f.ai_summary || '').replace(/"/g, '""')}",${f.competitors?.name},Field Intel,${f.created_at},Field,${f.stadt || '-'},${f.user_profile || '-'},"${tags.replace(/"/g, '""')}"`)
        })
      })
    )
  }

  await Promise.all(tasks)

  // 4. 生成并返回 CSV
  const csv = rows.join('\n')
  
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="99food_report_${von}_to_${bis}.csv"`,
    },
  })
}