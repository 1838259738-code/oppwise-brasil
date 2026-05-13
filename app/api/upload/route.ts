import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 强制动态渲染，防止 Vercel 在 Build 阶段试图连接数据库
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    const wettbewerberId = formData.get('wettbewerberId')
    const kategorieId = formData.get('kategorieId')
    const titel = formData.get('titel') as string
    const beschreibung = formData.get('beschreibung') as string

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
    }

    // 1. 在实际业务中，这里通常会将图片上传到 Supabase Storage
    // 目前为了逻辑跑通，我们先模拟一个文件 URL 存入数据库
    const virtualPath = `upload_${Date.now()}_${files[0].name}`

    // 2. 插入数据到 Supabase (完全取代 prisma.material.create)
    const { data, error } = await supabase
      .from('materials')
      .insert([
        {
          titel,
          beschreibung,
          competitor_id: wettbewerberId ? parseInt(wettbewerberId as string) : null,
          category_id: kategorieId ? parseInt(kategorieId as string) : null,
          url: virtualPath, // 线上建议存公网链接
          aufnahmeDatum: new Date().toISOString(),
        }
      ])
      .select()

    if (error) {
      console.error('[Supabase Upload Error]:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('[Upload Pipeline Crash]:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}