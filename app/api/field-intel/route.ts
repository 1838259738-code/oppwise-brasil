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

    // 1. 读取文件并转换为标准的 Base64 字符串
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    let base64Image = buffer.toString('base64')
    
    // 🛡️ 安全清洗：确保 Base64 字符串内部没有夹带多余的 Data URL 头部信息
    base64Image = base64Image.replace(/^data:image\/\w+;base64,/, '')
    
    const mimeType = file.type || 'image/jpeg'

    // 2. 上传图片到 Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `field_${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
    const filePath = `uploads/${fileName}`

    const { error: storageError } = await supabase.storage
      .from('intelligence')
      .upload(filePath, buffer, { contentType: file.type, upsert: true })

    if (storageError) throw new Error('Image storage upload failed')

    const { data: { publicUrl } } = supabase.storage.from('intelligence').getPublicUrl(filePath)
    const competitorName = competitorId === '1' ? 'KeeTa' : 'iFood'

    // ==========================================
    // 🧠 3. 战略级 AI 像素视觉硬核精算引擎 (Vision Ingestion 修正)
    // ==========================================
    let aiSummary = "AI analysis failed, but record was saved."
    const apiKey = process.env.DEEPSEEK_API_KEY
    
    if (apiKey) {
      try {
        const systemPrompt = `你现在是 99Food 部署在拉美前线的最高阶“AI 视觉情报精算引擎（AI Vision Strategic Engine）”。
你接入该系统的核心任务是：突破人眼的局限，像素级深度解构竞对（iFood、KeeTa、Rappi）的客户端截图，提取出高机密的补贴手段和价格欺诈/心理学策略。

⚠️ 【核心红线禁令】：
1. 严禁胡编乱造、严禁说毫无数据支撑的废话，必须假设用户回传这张截图，是因为截图的画面细节里隐藏着精细的价格攻势。请把焦点死死锁定在图片像素本身！
2. 绝对不允许仅仅根据用户传过来的辅助分类标签进行套话复读。

请对图片画面中真正出现的以下元素执行拉网式审计，并产出专家级长篇内参：
1. 【隐藏价格梯度解密】：仔细辨认图片中的各种“小字”、原价划线价与现价的真实对冲。是否存在配送费（Taxa de entrega）阶梯式减免、是否绑定了特权会籍（如 iFood Clube）才能触发。算出其真实的 AOV 拦截阻击线。
2. 【视觉欺诈与行动点拦截】：图片中的 Banner 视觉、弹窗、或者结算页，是如何利用色彩、高亮、倒计时（Contagem regressiva）来强行洗脑用户下单的？竞品在流失路径上设下了怎样的 Paywall？
3. 【供给端商户排他特征】：图片中露出的具体商户名称是什么？是否有“Exclusive / Exclusivo”标签？从画面排版能看出竞品本周在主推哪类 KA 品类？

请使用严格、冷峻的大厂产品与运营总监视角，使用中英双语输出结构化的反制行动指南（Growth Strategy Framework）。
格式必须使用系统的结构化标记：
### 🎯 前线视觉像素级精算 (Pixel-Level Vision Audit)
* **像素点细节还原**: [在此诚实打印你从图片像素、数字、横幅小字中真正看出来的价格和策略事实，没有看到就说没看到，绝不臆想]

### 💰 补贴与价格梯度解密 (Subsidy & AOV Calibration)
* **杠杆拆解**: [拆解真实的折扣比例、起送价门槛、配送费扣点转嫁，以及竞品是在亏本赚流量还是在提高单均毛利]

### ⚔️ 99Food 产品与用户运营反制案 (Growth Execution Playbook)
* **战术对攻方案**: [给产品和用户运营团队最直接、可立刻灰度上线的反制策略代码注入或券包部署建议]`

        const userPrompt = `[CRITICAL FIELD DATA FOR CONTEXTUAL REFERENCE]
- Competitor Name: ${competitorName}
- Market/City Location: ${city}
- Screen Context/Touchpoint: ${screenType}
- Target User Segment (Life Cycle): ${userProfile}
- Intelligence Title: ${title}
- Operation Tags: ${tags}
- Hand-written Field Notes by Local Staff: "${notes}"`

        // 🚀 核心对齐：采用通用多模态消息体，组装绝对标准的图片数据载荷
        const imagePayloadUrl = `data:${mimeType};base64,${base64Image}`

        const dsResponse = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${apiKey}` 
          },
          body: JSON.stringify({
            // 💡 提示：如果使用官方标准多模态，请确保你的 API Key 对应的账户开通了视觉模型权限
            // 如果 deepseek 侧模型网关有微调，可根据官方最新公告将此处模型名改为 "deepseek-chat" 或 "deepseek-vl"
            model: "deepseek-chat", 
            messages: [
              { role: "system", content: systemPrompt },
              {
                role: "user",
                content: [
                  { type: "text", text: userPrompt },
                  {
                    type: "image_url",
                    image_url: {
                      url: imagePayloadUrl // 灌入干净清洗后的 Data URL
                    }
                  }
                ]
              }
            ],
            temperature: 0.1, 
            max_tokens: 2000
          }),
          signal: AbortSignal.timeout(30000) 
        })

        if (dsResponse.ok) {
          const dsData = await dsResponse.json()
          aiSummary = dsData.choices[0].message.content.trim()
        } else {
          const errText = await dsResponse.text()
          // 打印出详细的错误文本，如果是权限或模型名问题，能在日志一目了然
          aiSummary = `AI Core Error: ${dsResponse.status}. Raw Response: ${errText.substring(0, 150)}`
        }
      } catch (aiError: any) {
        aiSummary = `AI Strategic Pipeline vision error: ${aiError.message || aiError}`
      }
    } else {
      aiSummary = "AI Core API Key configuration error in the current deployment environment."
    }

    // 4. 写入前线情报大盘表
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

    // 5. 同步写入 materials 素材库
    await supabase.from('materials').insert([{
      titel: `[Field Intel] ${title}`,
      beschreibung: `城市商圈: ${city}\n触达场景: ${screenType}\n用户分层: ${userProfile}\n核心标签: ${tags}\n前线手记: ${notes}\n\n${aiSummary}`,
      competitor_id: parseInt(competitorId),
      url: publicUrl,
      aufnahmeDatum: new Date().toISOString(),
    }])

    return NextResponse.json({ success: true, data: fieldData })

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Unknown Server Error' }, { status: 500 })
  }
}