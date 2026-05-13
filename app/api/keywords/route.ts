import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
export const dynamic = 'force-dynamic'

// 1. 获取关键词列表
export async function GET() {
  // 优先尝试标准英文表名
  let { data: keywords, error } = await supabase
    .from('keywords')
    .select('*')
    .order('id', { ascending: false })

  if (error) {
    // 报错时尝试退回到旧的德文/类名表名
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('MonitoringKeyword')
      .select('*')
      .order('id', { ascending: false })
      
    if (fallbackError) {
      return NextResponse.json({ error: fallbackError.message }, { status: 500 })
    }
    keywords = fallbackData
  }

  return NextResponse.json(keywords)
}

// 2. 新增监控关键词
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { keyword } = body

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 })
    }

    // 尝试插入新表 (自动识别字段映射)
    let { error } = await supabase
      .from('keywords')
      .insert([{ 
        keyword: keyword,
        word: keyword // 冗余映射，防止数据库列名用了德文的 'wort'
      }])

    if (error) {
      // 失败则尝试插入旧表
      const { error: fallbackError } = await supabase
        .from('MonitoringKeyword')
        .insert([{ keyword }])
        
      if (fallbackError) {
        return NextResponse.json({ error: fallbackError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}