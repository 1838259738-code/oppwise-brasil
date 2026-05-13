import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 强制动态渲染，确保 Vercel 构建时不会因为缺少环境变量或数据库连接而崩溃
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    
    // 获取上传的文件列表，统一使用 'files' 键名
    const files = formData.getAll('files') as File[]
    const wettbewerberId = formData.get('wettbewerberId')
    const kategorieId = formData.get('kategorieId')
    const titel = formData.get('titel') as string
    const beschreibung = formData.get('beschreibung') as string

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
    }

    // 模拟存储路径
    const virtualPath = `upload_${Date.now()}_${files[0].name}`

    // 将情报素材插入 Supabase 数据库
    const { data, error } = await supabase
      .from('materials')
      .insert([
        {
          titel: titel || 'Untitled Intelligence',
          beschreibung: beschreibung || '',
          competitor_id: wettbewerberId ? parseInt(wettbewerberId as string) : null,
          category_id: kategorieId ? parseInt(kategorieId as string) : null,
          url: virtualPath,
          aufnahmeDatum: new Date().toISOString(),
        }
      ])
      .select()
      .single()

    // --- 修复点：确保变量名一致性 ---
    if (error) {
      console.error('[Supabase DB Error]:', error)
      // 原来的代码这里误写成了 dbError.message
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('[Upload API Crash]:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}