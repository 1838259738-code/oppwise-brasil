import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    const title = formData.get('title') as string
    const competitorId = formData.get('competitorId') as string
    const city = formData.get('city') as string
    const screenType = formData.get('screenType') as string
    const userProfile = formData.get('userProfile') as string
    const tags = formData.get('tags') as string
    const notes = formData.get('notes') as string

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No screenshot uploaded' }, { status: 400 })
    }

    const file = files[0]

    // 1. 真实上传图片到 Supabase
    const fileExt = file.name.split('.').pop()
    const fileName = `field_${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
    const filePath = `uploads/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: storageError } = await supabase.storage
      .from('intelligence')
      .upload(filePath, buffer, { contentType: file.type, upsert: true })

    if (storageError) throw new Error('Image storage upload failed')

    const { data: { publicUrl } } = supabase.storage.from('intelligence').getPublicUrl(filePath)
    const competitorName = competitorId === '1' ? 'KeeTa' : 'iFood'

    // 2. 调用 DeepSeek AI
    let aiSummary = "AI analysis failed, but record was saved."
    const apiKey = process.env.DEEPSEEK_API_KEY
    
    if (apiKey) {
      try {
        const systemPrompt = `You are a Senior Growth Marketing Analyst for the Brazilian food delivery market. Analyze the intel and provide a sharp, 30-word strategic summary focusing on pricing or subsidies.`
        const userPrompt = `Competitor: ${competitorName}\nCity: ${city}\nContext: ${screenType}\nTarget: ${userProfile}\nTitle: ${title}\nTags: ${tags}\nNotes: ${notes}\nOutput ONLY the strategy summary.`

        const dsResponse = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
            temperature: 0.3
          }),
          signal: AbortSignal.timeout(8000) 
        })

        if (dsResponse.ok) {
          const dsData = await dsResponse.json()
          aiSummary = dsData.choices[0].message.content.trim()
        }
      } catch (aiError) {
        aiSummary = "DeepSeek AI timeout or error."
      }
    } else {
      aiSummary = "DeepSeek API Key is missing in Vercel environment."
    }

    // 3. 写入数据库
    const { data: fieldData, error: fieldError } = await supabase
      .from('field_intel')
      .insert([{
        titel: title || 'Untitled Field Intel',
        competitor_id: parseInt(competitorId),
        stadt: city,
        screen_type: screenType,
        user_profile: userProfile,
        tags: tags,
        notizen: notes,
        url: publicUrl,
        ai_summary: aiSummary,
        created_at: new Date().toISOString()
      }]).select().single()

    if (fieldError) throw fieldError

    // 同步到 materials 表 (Intelligence Hub)
    await supabase.from('materials').insert([{
      titel: `[Field Intel] ${title}`,
      beschreibung: aiSummary,
      competitor_id: parseInt(competitorId),
      url: publicUrl,
      aufnahmeDatum: new Date().toISOString(),
    }])

    return NextResponse.json({ success: true, data: fieldData })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}