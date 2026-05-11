import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'

export async function GET() {
  const sources = await prisma.datenquelle.findMany()
  return NextResponse.json(sources)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, typ, urlOderConfig } = body
  await prisma.datenquelle.create({ data: { name, typ, urlOderConfig } })
  return NextResponse.json({ success: true })
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { id, aktiv } = body
  await prisma.datenquelle.update({ where: { id }, data: { aktiv } })
  return NextResponse.json({ success: true })
}