import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    
    // 强制统一使用 'files' 作为文件字段
    const files = formData.getAll('files') as File[]
    const title = formData.get('title') as string
    const competitorId = formData.get('competitorId')
    const city = formData.get('city') as string
    const screenType = formData.get('screenType') as string
    const userProfile = formData.get('userProfile') as string
    const tags = formData.get('tags') as string
    const notes = formData.get('notes') as string

    if (files.length === 0) {
      return NextResponse.json({ error: 'No screenshot uploaded' }, { status: 400 })
    }

    // 虚拟路径存储
    const virtualPath = `field_${Date.now()}_${files[0].name}`

    // 写入 Supabase
    const { data, error } = await supabase
      .from('field_intel')
      .insert([
        {
          titel: title || 'Untitled Field Intel',
          competitor_id: competitorId ? parseInt(competitorId as string) : null,
          stadt: city,
          screen_type: screenType,
          user_profile: userProfile,
          tags: tags,
          notizen: notes,
          url: virtualPath,
          // 模拟 AI 处理后的初始状态
          ai_summary: "AI Analysis pending...", 
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('[Supabase Field Intel Error]:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('[Field Intel API Crash]:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}