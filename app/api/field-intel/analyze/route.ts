import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    
    // 1. 获取前端传来的所有情报参数
    const files = formData.getAll('files') as File[]
    const title = formData.get('title') as string
    const competitorId = formData.get('competitorId') as string
    const city = formData.get('city') as string
    const screenType = formData.get('screenType') as string
    const userProfile = formData.get('userProfile') as string
    const tags = formData.get('tags') as string
    const notes = formData.get('notes') as string

    if (files.length === 0) {
      return NextResponse.json({ error: 'No screenshot uploaded' }, { status: 400 })
    }

    // 虚拟路径存储（后续若需展示图片，可接入 Supabase Storage）
    const virtualPath = `field_${Date.now()}_${files[0].name}`
    const competitorName = competitorId === '1' ? 'KeeTa' : 'iFood'

    // ==========================================
    // 🧠 2. 触发 DeepSeek AI 策略大脑
    // ==========================================
    let aiSummary = "AI analysis failed, but record was saved."
    
    try {
      // 构建专业的外卖竞对分析 Prompt
      const systemPrompt = `You are a Senior Growth Marketing Analyst for the Brazilian food delivery market (competitors: KeeTa, iFood). 
Your task is to analyze field intelligence submitted by local operations and provide a sharp, concise strategic summary (under 40 words). Focus on pricing tactics, subsidy targets, or user acquisition strategies.`
      
      const userPrompt = `
      Please analyze this field intelligence:
      - Competitor: ${competitorName}
      - City: ${city}
      - Screen Context: ${screenType}
      - Targeted User: ${userProfile}
      - Intel Title: ${title}
      - Operation Tags: ${tags}
      - Field Notes: ${notes}
      
      Output ONLY the strategic summary.`

      const dsResponse = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // ⚠️ 记得在你的 Vercel 或 .env.local 中配置这个环境变量
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}` 
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.3 // 低温度，保证分析的专业性和客观性
        })
      })

      if (dsResponse.ok) {
        const dsData = await dsResponse.json()
        aiSummary = dsData.choices[0].message.content.trim()
      } else {
        console.error('[DeepSeek API Error]:', await dsResponse.text())
      }
    } catch (aiError) {
      console.error('[DeepSeek Fetch Error]:', aiError)
    }

    // ==========================================
    // 💾 3. 写入 Supabase 数据库
    // ==========================================
    const { data, error } = await supabase
      .from('field_intel')
      .insert([
        {
          titel: title || 'Untitled Field Intel',
          competitor_id: competitorId ? parseInt(competitorId) : null,
          stadt: city,
          screen_type: screenType,
          user_profile: userProfile,
          tags: tags,
          notizen: notes,
          url: virtualPath,
          ai_summary: aiSummary, // <--- 真实的 DeepSeek 分析结果进去了！
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('[Supabase DB Error]:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 4. 将带有真实 AI 摘要的数据返回给前端
    return NextResponse.json({ success: true, data })

  } catch (err: any) {
    console.error('[Field Intel Global Crash]:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}