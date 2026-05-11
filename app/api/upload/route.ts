import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { prisma } from '../../../lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const titel = formData.get('titel') as string
  const beschreibung = formData.get('beschreibung') as string
  const wettbewerberId = parseInt(formData.get('wettbewerberId') as string)
  const kategorieId = parseInt(formData.get('kategorieId') as string)
  const aufnahmeDatum = new Date(formData.get('aufnahmeDatum') as string)
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

  await prisma.material.create({
    data: {
      titel,
      beschreibung,
      wettbewerberId,
      kategorieId,
      aufnahmeDatum,
      dateiPfade: JSON.stringify(savedPaths),
    },
  })

  return NextResponse.json({ success: true })
}