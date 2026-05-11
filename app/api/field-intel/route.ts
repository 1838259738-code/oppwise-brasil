import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { prisma } from '../../../lib/db'
import { v4 as uuidv4 } from 'uuid'

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

  // ----------- 模拟 AI 分析 -----------
  // 在未来连接真实 Vision API 时，此处会替换为真实的 OCR + GPT 调用。
  const extractedText = `Simulated text extraction for screenshot from ${stadt}.`;
  const priceFindings = [
    { label: 'delivery_fee', value: 'R$ 5.99' },
    { label: 'coupon_discount', value: '-R$ 10.00' },
  ];
  const strategyTags = ['new_user_acquisition', 'free_delivery'];
  const aiSummary = `In ${stadt}, ${wettbewerberId === 1 ? 'Keeta' : 'iFood'} is offering free delivery for new users, combined with a R$10 coupon on first order. This suggests a strong push for new user acquisition.`;

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