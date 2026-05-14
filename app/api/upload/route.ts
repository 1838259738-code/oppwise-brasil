import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('files') as File // 获取单个文件
    const wettbewerberId = formData.get('wettbewerberId') as string
    const titel = formData.get('titel') as string
    const beschreibung = formData.get('beschreibung') as string

    if (!file) {
      return NextResponse.json({ error: 'No file found in request' }, { status: 400 })
    }

    // 1. 处理文件名，防止特殊字符导致 URL 失效
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
    const filePath = `uploads/${fileName}`

    // 2. 将 File 转为 Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 3. 上传到 Supabase Storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from('intelligence')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true // 允许覆盖
      })

    if (storageError) {
      console.error('Storage Upload Error:', storageError)
      return NextResponse.json({ error: 'Failed to upload to storage' }, { status: 500 })
    }

    // 4. 获取公网访问链接
    const { data: { publicUrl } } = supabase.storage
      .from('intelligence')
      .getPublicUrl(filePath)

    console.log('Generated Public URL:', publicUrl)

    // 5. 写入数据库 materials 表
    const { data, error: dbError } = await supabase
      .from('materials')
      .insert([
        {
          titel: titel || 'Untitled Intelligence',
          beschreibung: beschreibung || '',
          competitor_id: wettbewerberId ? parseInt(wettbewerberId) : null,
          url: publicUrl, // 确保存入的是完整的 https 链接
          aufnahmeDatum: new Date().toISOString(),
        }
      ])
      .select()

    if (dbError) {
      console.error('Database Insert Error:', dbError)
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('Global API Error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}