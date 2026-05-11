import { prisma } from '../../lib/db'
import AnalysenClient from './AnalysenClient'

export default async function CompetitiveAnalysisPage() {
  const [automatische, materialien, fieldIntel, kategorien, wettbewerber] = await Promise.all([
    prisma.automatischerEintrag.findMany({
      orderBy: { erfasstAm: 'desc' },
      include: { wettbewerber: true, kategorie: true },
      take: 100,
    }),
    prisma.material.findMany({
      orderBy: { createdAt: 'desc' },
      include: { wettbewerber: true, kategorie: true },
      take: 100,
    }),
    prisma.fieldIntel.findMany({
      orderBy: { createdAt: 'desc' },
      include: { wettbewerber: true },
      take: 100,
    }),
    prisma.kategorie.findMany(),
    prisma.wettbewerber.findMany(),
  ])

  // 混合数据流
  const mixed = [
    ...automatische.map(a => ({
      type: 'auto' as const,
      id: `a-${a.id}`,
      titel: a.titel,
      beschreibung: a.zusammenfassung,
      wettbewerber: a.wettbewerber.name,
      farbe: a.wettbewerber.farbe,
      kategorie: a.kategorie?.name ?? 'Unknown',
      datum: a.veroeffentlicht || a.erfasstAm,
      quelle: a.quelle,
      dateien: null,
    })),
    ...materialien.map(m => ({
      type: 'manual' as const,
      id: `m-${m.id}`,
      titel: m.titel,
      beschreibung: m.beschreibung,
      wettbewerber: m.wettbewerber.name,
      farbe: m.wettbewerber.farbe,
      kategorie: m.kategorie.name,
      datum: m.aufnahmeDatum,
      quelle: 'Manual',
      dateien: m.dateiPfade ? JSON.parse(m.dateiPfade) : [],
    })),
    ...fieldIntel.map(f => ({
      type: 'field' as const,
      id: `f-${f.id}`,
      titel: f.titel,
      beschreibung: f.aiSummary,
      wettbewerber: f.wettbewerber.name,
      farbe: f.wettbewerber.farbe,
      kategorie: 'Field Intel',
      datum: f.createdAt,
      quelle: 'Field Intel',
      dateien: f.dateiPfade ? JSON.parse(f.dateiPfade) : [],
      extra: {
        stadt: f.stadt,
        screenType: f.screenType,
        userProfile: f.userProfile,
        priceFindings: f.priceFindings,
        strategyTags: f.strategyTags,
      }
    })),
  ].sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime())

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Competitive Analysis</h2>
      <AnalysenClient
        initialData={mixed}
        kategorien={kategorien}
        wettbewerber={wettbewerber}
      />
    </div>
  )
}