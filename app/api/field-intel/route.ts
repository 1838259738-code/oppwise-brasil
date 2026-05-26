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

    // 1. 上传图片到 Supabase Storage
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

    // ==========================================
    // 🧠 2. 战略级 AI 视觉与情境解析引擎 (去供应商化 / 延长超时)
    // ==========================================
    let aiSummary = "AI analysis failed, but record was saved."
    const apiKey = process.env.DEEPSEEK_API_KEY
    
    if (apiKey) {
      try {
        const systemPrompt = `You are the Chief Growth Officer and Senior Competitive Intelligence Lead for 99Food in Latin America. 
You possess deep expertise in the Brazilian food delivery landscape (iFood, KeeTa, Rappi). 
Your task is to analyze the user-uploaded field intelligence and decode the competitor's hidden strategic intent. 

Format your response perfectly in Markdown with the following bold, executive structure:
### 🎯 战术定位 (Tactics Breakdown)
* **触达场景与核心痛点**: [分析截图所在的 Screen Context，推测用户在何种场景下被触发该机制]
* **用户生命周期指向**: [结合 Target Segment，解读竞品为何在此节点对该类用户进行该动作]

### 💰 补贴与定价精算 (Subsidies & Pricing)
* **杠杆机制机制**: [精准拆解其“新客券包/运费减免/VIP专享价”的真实ROI算盘，竞品是在亏本赚流量还是在提高单均毛利？]
* **供给端转嫁特征**: [评估其活动是由平台单方面疯狂倒贴，还是联合 B2B 商家侧进行的联合扣点扣减？]

### ⚔️ 99Food 破局建议 (Strategic Defense)
* **大盘威胁评级**: [低/中/高 - 给出具体原因]
* **反制行动指南**: [给 99Food 的一线 Growth / Operations 团队提出 2 条具体可执行、防御或对攻的快反方案]

Rules: Ensure your insight is sharp, commercial, and professional. Write the analysis in Chinese, using professional English terms where appropriate (e.g., CAC, AOV, ROI, Churn Rate, Paywall). Avoid vague fluff.`

        const userPrompt = `[CRITICAL FIELD DATA FOR CONTEXTUAL ANALYSIS]
- Competitor Name: ${competitorName}
- Market/City Location: ${city}
- Screen Context/Touchpoint: ${screenType}
- Target User Segment (Life Cycle): ${userProfile}
- Intelligence Title: ${title}
- Operation Tags: ${tags}
- Hand-written Field Notes by Local Staff: "${notes}"

Please generate a comprehensive, deep-dive analysis based on the inputs above.`

        const dsResponse = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              { role: "system", content: systemPrompt }, 
              { role: "user", content: userPrompt }
            ],
            temperature: 0.4
          }),
          // 🚀 核心修复：放宽超时门槛至 30 秒，确保大模型有充足时间输出完整长文本
          signal: AbortSignal.timeout(30000) 
        })

        if (dsResponse.ok) {
          const dsData = await dsResponse.json()
          aiSummary = dsData.choices[0].message.content.trim()
        } else {
          const errText = await dsResponse.text()
          aiSummary = `AI Core Error: ${dsResponse.status}. Unable to complete tactical render.`
        }
      } catch (aiError) {
        aiSummary = "AI Strategic Pipeline timeout or connection density error."
      }
    } else {
      aiSummary = "AI Core API Key configuration error in the current deployment environment."
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

    // 同步到 materials
    await supabase.from('materials').insert([{
      titel: `[Field Intel] ${title}`,
      beschreibung: `Type: ${screenType} | Segment: ${userProfile}\n\n${aiSummary}`,
      competitor_id: parseInt(competitorId),
      url: publicUrl,
      aufnahmeDatum: new Date().toISOString(),
    }])

    return NextResponse.json({ success: true, data: fieldData })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown Server Error' }, { status: 500 })
  }
}