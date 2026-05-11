import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'
import { v4 as uuidv4 } from 'uuid'
import OpenAI from 'openai'

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
})

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const titel = formData.get('titel') as string
    const wettbewerberId = parseInt(formData.get('wettbewerberId') as string)
    const stadt = formData.get('stadt') as string
    const screenType = formData.get('screenType') as string
    const userProfile = formData.get('userProfile') as string
    const tags = formData.get('tags') as string || ''
    const notizen = formData.get('notizen') as string || ''
    const files = formData.getAll('files') as File[]

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
    }

    // ---------- 内存中处理第一张图片，构建 base64 ----------
    const firstFile = files[0]
    const arrayBuffer = await firstFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const mimeType = firstFile.type || 'image/jpeg'
    const base64Image = buffer.toString('base64')

    // 生成一个虚拟文件名用于记录（但实际不存磁盘）
    const virtualPath = `${uuidv4()}.${mimeType.split('/')[1] || 'jpg'}`

    // ---------- 调用 DeepSeek 分析 ----------
    let extractedText = ''
    let priceFindings: any[] = []
    let strategyTags: string[] = []
    let aiSummary = ''

    const competitorName = wettbewerberId === 1 ? 'Keeta' : 'iFood'
    const prompt = `You are a competitive analyst for Brazilian food delivery apps.
Analyze the attached screenshot from ${competitorName} in ${stadt}, captured for user profile "${userProfile}".
Screenshot type: ${screenType}.
1. Extract all visible text (especially prices, delivery fee, minimum order, discounts, membership info, UI elements like countdowns or banners).
2. Identify any pricing or discount findings in JSON array format: [{"label": "delivery_fee", "value": "R$ X.XX"}, ...].
3. Infer the likely operational strategy (e.g., new_user_acquisition, loyalty_discount, dynamic_pricing_test, etc.) and return as a JSON array of strings.
4. Write a concise English summary (2-3 sentences).

Return your response as a JSON object with keys: extracted_text, price_findings, strategy_tags, ai_summary. 
Do not include any additional text.`

    try {
      const completion = await deepseek.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      })

      const content = completion.choices[0].message.content || '{}'
      const parsed = JSON.parse(content)
      extractedText = parsed.extracted_text || ''
      priceFindings = parsed.price_findings || []
      strategyTags = parsed.strategy_tags || []
      aiSummary = parsed.ai_summary || ''
    } catch (apiError: any) {
      console.error('DeepSeek API error:', apiError)
      aiSummary = `AI analysis failed: ${apiError.message || 'Unknown error'}`
      extractedText = ''
    }

    // ---------- 写入数据库（文件路径仅记录虚拟名，实际上不可访问） ----------
    const record = await prisma.fieldIntel.create({
      data: {
        titel,
        wettbewerberId,
        stadt,
        screenType,
        userProfile,
        tags,
        notizen,
        extractedText,
        priceFindings: JSON.stringify(priceFindings),
        strategyTags: JSON.stringify(strategyTags),
        aiSummary,
        dateiPfade: JSON.stringify([virtualPath]),   // 仅供记录
      },
    })

    // 注意：由于文件未实际存储，预览链接 /uploads/... 将无法访问。
    // 如需后续查看图片，请集成云存储（如 Cloudinary）。

    return NextResponse.json({ success: true, data: record })
  } catch (error: any) {
    console.error('Field Intel upload error:', error)
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
  }
}