import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const von = searchParams.get('von')
  const bis = searchParams.get('bis')
  const wettbewerber = searchParams.get('wettbewerber')
  const typ = searchParams.get('typ') || 'all'

  if (!von || !bis) {
    return new NextResponse('Missing date range', { status: 400 })
  }

  const startDate = new Date(von)
  const endDate = new Date(bis)
  endDate.setHours(23, 59, 59, 999)

  // 准备数据行
  const rows: string[] = ['Type,Title,Description,Competitor,Category,Date,Source,City,User Profile,Strategy Tags']

  if (typ === 'all' || typ === 'manual') {
    const materials = await prisma.material.findMany({
      where: {
        aufnahmeDatum: { gte: startDate, lte: endDate },
        ...(wettbewerber !== 'all' ? { wettbewerber: { name: wettbewerber } } : {}),
      },
      include: { wettbewerber: true, kategorie: true },
    })
    materials.forEach(m => {
      rows.push(`Manual,"${m.titel}","${m.beschreibung || ''}",${m.wettbewerber.name},${m.kategorie.name},${m.aufnahmeDatum.toISOString()},-,-,-,-`)
    })
  }

  if (typ === 'all' || typ === 'auto') {
    const autos = await prisma.automatischerEintrag.findMany({
      where: {
        erfasstAm: { gte: startDate, lte: endDate },
        ...(wettbewerber !== 'all' ? { wettbewerber: { name: wettbewerber } } : {}),
      },
      include: { wettbewerber: true, kategorie: true },
    })
    autos.forEach(a => {
      rows.push(`Auto,"${a.titel}","${a.zusammenfassung || ''}",${a.wettbewerber.name},${a.kategorie?.name || 'Unknown'},${a.erfasstAm.toISOString()},${a.quelle},-,-,-`)
    })
  }

  if (typ === 'all' || typ === 'field') {
    const fields = await prisma.fieldIntel.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        ...(wettbewerber !== 'all' ? { wettbewerber: { name: wettbewerber } } : {}),
      },
      include: { wettbewerber: true },
    })
    fields.forEach(f => {
      rows.push(`Field Intel,"${f.titel}","${f.aiSummary || ''}",${f.wettbewerber.name},Field Intel,${f.createdAt.toISOString()},Field,${f.stadt},${f.userProfile},"${(f.strategyTags || '').replace(/"/g, '""')}"`)
    })
  }

  const csv = rows.join('\n')
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="report_${von}_${bis}.csv"`,
    },
  })
}