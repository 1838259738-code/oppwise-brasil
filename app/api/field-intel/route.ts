import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { prisma } from '../../../lib/db'
import { v4 as uuidv4 } from 'uuid'
import OpenAI from 'openai'

// 将 OpenAI 客户端指向 DeepSeek
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
})

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const titel = formData.get('titel') as string
  const wettbewerberId = parseInt(formData.get('wettbewerberId') as string)
  const stadt = formData.get('stadt') as string
  const screenType = formData.get('screenType') as string
  const userProfile = formData.get('userProfile') as string
  const tags = formData.get('tags') as string || ''
  const notizen = formData.get('notizen') as string || ''
  const files = formData.getAll('files') as File[]

  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })

  const savedPaths: string[] = []
  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = path.extname(file.name)
    const filename = `${uuidv4()}${ext}`
    await writeFile(path.join(uploadDir, filename), buffer)
    savedPaths.push(filename)
  }

  let extractedText = ''
  let priceFindings: any[] = []
  let strategyTags: string[] = []
  let aiSummary = ''

  if (savedPaths.length > 0) {
    const imagePath = path.join(uploadDir, savedPaths[0])
    const { readFileSync } = await import('fs')
    const imageBuffer = readFileSync(imagePath)
    const base64Image = imageBuffer.toString('base64')
    const mimeType = path.extname(savedPaths[0]).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg'

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
      // 调用 DeepSeek 模型（支持视觉的 deepseek-chat 或 deepseek-reasoner）
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
    } catch (error) {
      console.error('DeepSeek Vision error:', error)
      extractedText = 'AI analysis failed, please retry.'
    }
  }

  const record = await prisma.fieldIntel.create({
    data: {
      titel,
      wettbewerberId,
      stadt,
      screenType,
      userProfile,
      tags,
      dateiPfade: JSON.stringify(savedPaths),
      notizen,
      extractedText,
      priceFindings: JSON.stringify(priceFindings),
      strategyTags: JSON.stringify(strategyTags),
      aiSummary,
    },
  })

  return NextResponse.json({ success: true, data: record })
}