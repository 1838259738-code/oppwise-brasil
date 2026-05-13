import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import OpenAI from 'openai'

export async function POST(req: NextRequest) {
  // 1. 运行时安全检查
  if (!process.env.DEEPSEEK_API_KEY) {
    return NextResponse.json({ error: 'DeepSeek API Key not configured' }, { status: 500 })
  }

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
      return NextResponse.json({ error: 'No screenshot provided' }, { status: 400 })
    }

    // --- 处理视觉数据：将第一张图转为 Base64 供 AI 读取 ---
    const firstFile = files[0]
    const arrayBuffer = await firstFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const mimeType = firstFile.type || 'image/jpeg'
    const base64Image = buffer.toString('base64')
    
    // 生成一个虚拟文件名（后续如果你对接 Supabase Storage，可以作为文件 Key）
    const virtualPath = `${uuidv4()}.${mimeType.split('/')[1] || 'jpg'}`

    // --- 初始化 DeepSeek 客户端 (OpenAI 兼容模式) ---
    const deepseek = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com',
    })

    // --- 构建 AI 提示词 (针对巴西外卖市场优化) ---
    const competitorName = wettbewerberId === 1 ? 'Keeta' : 'iFood'
    const prompt = `You are a competitive analyst for Brazilian food delivery apps. 
Analyze this ${competitorName} screenshot from ${stadt} (Profile: ${userProfile}).
Extract prices, fees, and strategy info. 
Return ONLY a JSON object with: extracted_text, price_findings (array), strategy_tags (array), ai_summary.`

    let aiResult = {
      extracted_text: '',
      price_findings: [],
      strategy_tags: [],
      ai_summary: 'Analysis pending or failed.'
    }

    // --- 核心步骤：调用 AI 视觉模型 ---
    try {
      const completion = await deepseek.chat.completions.create({
        model: 'deepseek-chat', // 或者使用 deepseek-vision
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: { url: `data:${mimeType};base64,${base64Image}` },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' }
      })

      const content = completion.choices[0].message.content || '{}'
      const parsed = JSON.parse(content)
      aiResult = {
        extracted_text: parsed.extracted_text || '',
        price_findings: parsed.price_findings || [],
        strategy_tags: parsed.strategy_tags || [],
        ai_summary: parsed.ai_summary || ''
      }
    } catch (apiError: any) {
      console.error('[DeepSeek API Error]:', apiError)
      aiResult.ai_summary = `AI analysis failed: ${apiError.message}`
    }

    // --- 写入 Supabase 数据库 (替换掉 Prisma) ---
    const { data: record, error: dbError } = await supabase
      .from('field_intel')
      .insert([{
        titel,
        competitor_id: wettbewerberId,
        stadt,
        screen_type: screenType,
        user_profile: userProfile,
        tags,
        notizen,
        extracted_text: aiResult.extracted_text,
        price_findings: JSON.stringify(aiResult.price_findings),
        strategy_tags: JSON.stringify(aiResult.strategy_tags),
        ai_summary: aiResult.ai_summary,
        url: virtualPath, // 存入 url 字段供展示组件读取
      }])
      .select()
      .single()

    if (dbError) {
      console.error('[Supabase DB Error]:', dbError)
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: record })

  } catch (error: any) {
    console.error('[Field Intel Upload Crash]:', error)
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 })
  }
}