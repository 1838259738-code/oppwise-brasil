import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 获取所有数据源
export async function GET() {
  // 增加容错：优先查英文表名，查不到则回退到旧德文表名
  let { data: sources, error } = await supabase.from('data_sources').select().order('id', { ascending: false })
  
  if (error) {
    const { data: fallbackData, error: fallbackError } = await supabase.from('datenquelle').select().order('id', { ascending: false })
    if (fallbackError) {
      return NextResponse.json({ error: fallbackError.message }, { status: 500 })
    }
    sources = fallbackData
  }
  
  return NextResponse.json(sources)
}

// 创建新数据源
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, typ, urlOderConfig } = body

  // 这里的映射逻辑保证了无论你数据库列名是英文还是德文，都能成功插入
  const { error } = await supabase.from('data_sources').insert([
    { 
      name, 
      type: typ, 
      url_or_config: urlOderConfig,
      is_active: true 
    }
  ]).select()

  // 如果 data_sources 表还没建，尝试插入旧的 datenquelle 表
  if (error) {
    const { error: fallbackError } = await supabase.from('datenquelle').insert([
      { name, typ, urlOderConfig, aktiv: true }
    ])
    if (fallbackError) return NextResponse.json({ error: fallbackError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// 更新数据源状态 (开启/关闭)
export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, aktiv } = body

  // 尝试更新新表
  const { error } = await supabase
    .from('data_sources')
    .update({ is_active: aktiv })
    .eq('id', id)

  // 如果失败，更新旧表
  if (error) {
    const { error: fallbackError } = await supabase
      .from('datenquelle')
      .update({ aktiv: aktiv })
      .eq('id', id)
    
    if (fallbackError) return NextResponse.json({ error: fallbackError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}