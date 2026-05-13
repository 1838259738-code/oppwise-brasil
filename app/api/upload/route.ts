import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 强制动态渲染：防止 Vercel 在构建阶段预渲染此 API 路由
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    
    // 获取上传的文件列表
    const files = formData.getAll('files') as File[]
    const wettbewerberId = formData.get('wettbewerberId')
    const kategorieId = formData.get('kategorieId')
    const titel = formData.get('titel') as string
    const beschreibung = formData.get('beschreibung') as string

    // 基础校验
    if (files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
    }

    // 模拟文件存储路径（生产环境建议上传至 Supabase Storage 并获取真实 URL）
    const virtualPath = `upload_${Date.now()}_${files[0].name}`

    // 写入 Supabase 数据库
    const { data, error } = await supabase
      .from('materials')
      .insert([
        {
          titel: titel || 'Untitled Intelligence',
          beschreibung: beschreibung || '',
          // 确保 ID 转换为数字，否则数据库会报错
          competitor_id: wettbewerberId ? parseInt(wettbewerberId as string) : null,
          category_id: kategorieId ? parseInt(kategorieId as string) : null,
          url: virtualPath,
          // 这里的键名必须与数据库中的列名完全一致
          aufnahmeDatum: new Date().toISOString(),
        }
      ])
      .select()
      .single()

    // 检查数据库写入错误
    if (error) {
      console.error('[Supabase DB Error]:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })

  } catch (err: any) {
    console.error('[Upload API Crash]:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}