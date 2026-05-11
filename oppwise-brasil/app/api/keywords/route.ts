import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'

export async function GET() {
  const keywords = await prisma.monitoringKeyword.findMany()
  return NextResponse.json(keywords)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { keyword } = body
  await prisma.monitoringKeyword.create({ data: { keyword } })
  return NextResponse.json({ success: true })
}