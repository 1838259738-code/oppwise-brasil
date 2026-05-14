import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    
    const files = formData.getAll('files') as File[]
    const wettbewerberId = formData.get('wettbewerberId') as string
    const kategorieId = formData.get('kategorieId') as string
    const titel = formData.get('titel') as string
    const beschreibung = formData.get('beschreibung') as string

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
    }

    const file = files[0]

    // 1. 将前端传来的 File 对象转换为 Buffer 流
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // 清理文件名中的特殊字符，防止 URL 报错
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')
    const filePath = `uploads/${Date.now()}_${safeFileName}`

    // 2. 将真实的图片文件上传到 Supabase Storage ('intelligence' 桶)
    const { error: storageError } = await supabase.storage
      .from('intelligence')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (storageError) {
      console.error('[Storage Error]:', storageError)
      return NextResponse.json({ error: 'Image upload failed' }, { status: 500 })
    }

    // 3. 获取刚刚上传的图片的真实公网 URL
    const { data: { publicUrl } } = supabase.storage
      .from('intelligence')
      .getPublicUrl(filePath)

    // 4. 将带有真实 URL 的情报存入数据库表
    const { data, error } = await supabase
      .from('materials')
      .insert([
        {
          titel: titel || 'Untitled Intelligence',
          beschreibung: beschreibung || '',
          competitor_id: wettbewerberId ? parseInt(wettbewerberId) : null,
          category_id: kategorieId ? parseInt(kategorieId) : null,
          url: publicUrl, // <--- 关键：这里存入了真实的 https 链接
          aufnahmeDatum: new Date().toISOString(),
        }
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('[Upload API Crash]:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}