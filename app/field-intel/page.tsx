import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  console.log('🚀 [Step 1] API Hit! Starting field-intel process...')

  try {
    const formData = await req.formData()
    console.log('✅ [Step 2] FormData parsed successfully.')

    const files = formData.getAll('files') as File[]
    const title = formData.get('title') as string
    const competitorId = formData.get('competitorId') as string
    
    console.log(`📦 [Step 3] Received data: Title=${title}, Files count=${files.length}, CompId=${competitorId}`)

    if (!files || files.length === 0) {
      console.log('❌ [Error] No files found in request.')
      return NextResponse.json({ error: 'No screenshot uploaded' }, { status: 400 })
    }

    const file = files[0]
    const fileExt = file.name.split('.').pop()
    const fileName = `field_${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
    const filePath = `uploads/${fileName}`

    // 将 File 转为 Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    console.log('✅ [Step 4] File converted to buffer. Uploading to Supabase Storage...')

    const { error: storageError } = await supabase.storage
      .from('intelligence')
      .upload(filePath, buffer, { contentType: file.type, upsert: true })

    if (storageError) {
      console.error('❌ [Storage Error]:', storageError)
      throw new Error(`Storage upload failed: ${storageError.message}`)
    }

    const { data: { publicUrl } } = supabase.storage.from('intelligence').getPublicUrl(filePath)
    console.log('✅ [Step 5] Storage upload successful. Public URL:', publicUrl)

    // AI 部分
    let aiSummary = "AI analysis skipped for debugging."
    const apiKey = process.env.DEEPSEEK_API_KEY
    
    console.log(`🤖 [Step 6] Starting DeepSeek API call. Key present? ${!!apiKey}`)

    if (apiKey) {
      try {
        const dsResponse = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [{ role: "user", content: `Write a 10-word summary for: ${title}` }],
            temperature: 0.3
          }),
          signal: AbortSignal.timeout(8000) 
        })

        if (!dsResponse.ok) {
          const errText = await dsResponse.text()
          console.error('❌ [DeepSeek API Error]:', errText)
          aiSummary = `DeepSeek Error: ${dsResponse.status}`
        } else {
          const dsData = await dsResponse.json()
          aiSummary = dsData.choices[0].message.content.trim()
          console.log('✅ [Step 7] DeepSeek success! Summary:', aiSummary)
        }
      } catch (aiError) {
        console.error('❌ [DeepSeek Catch Error]:', aiError)
        aiSummary = "DeepSeek API failed or timed out."
      }
    }

    console.log('💾 [Step 8] Writing to Supabase database...')
    
    const { data: fieldData, error: fieldError } = await supabase
      .from('field_intel')
      .insert([{
        titel: title || 'Untitled Field Intel',
        competitor_id: parseInt(competitorId) || 1,
        url: publicUrl,
        ai_summary: aiSummary,
        created_at: new Date().toISOString()
      }]).select().single()

    if (fieldError) {
       console.error('❌ [DB Field Intel Error]:', fieldError)
       throw fieldError
    }

    console.log('🎉 [Step 9] All done! Returning success.')
    return NextResponse.json({ success: true, data: fieldData })

  } catch (err: any) {
    console.error('💥 [FATAL CRASH]:', err)
    return NextResponse.json({ error: err.message || 'Unknown Server Error' }, { status: 500 })
  }
}