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

    // --------- 将文件转为 base64，不再写入磁盘 ---------
    const fileBuffers: { buffer: Buffer; mimeType: string; originalName: string }[] = []
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const mimeType = file.type || 'image/jpeg'
      fileBuffers.push({ buffer, mimeType, originalName: file.name })
    }

    // 模拟保存路径（存入 DB 用）
    const savedPaths = fileBuffers.map(() => `${uuidv4()}.jpg`)
    // 注意：实际文件没有落地，所以 Material Library 里无法预览图片。
    // 如果需要预览，后续可接云存储；暂时保存路径仅供记录。

    // --------- 调用 DeepSeek 分析第一张图 ---------
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

    if (fileBuffers.length > 0) {
      const { buffer, mimeType } = fileBuffers[0]
      const base64Image = buffer.toString('base64')

      try {
        const completion = await deepseek.chat.completions.create({
          model: 'deepseek-chat', // 若报错不支持图片，可尝试 'deepseek-reasoner'
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
        extractedText = parsed.extracted_text || content
        priceFindings = parsed.price_findings || []
        strategyTags = parsed.strategy_tags || []
        aiSummary = parsed.ai_summary || content
      } catch (apiError: any) {
        console.error('DeepSeek API error:', apiError)
        aiSummary = `AI analysis failed: ${apiError.message || 'Unknown error'}`
        extractedText = ''
      }
    }

    // --------- 写入数据库 ---------
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
        dateiPfade: JSON.stringify(savedPaths),
      },
    })

    return NextResponse.json({ success: true, data: record })
  } catch (error: any) {
    console.error('Field Intel upload error:', error)
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
  }
}