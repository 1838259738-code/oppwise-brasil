import { prisma } from '../lib/db'
import Link from 'next/link'

export default async function HomePage() {
  const [autoEntries, materialCount, fieldIntelCount, unreadCount] = await Promise.all([
    prisma.automatischerEintrag.findMany({
      orderBy: { erfasstAm: 'desc' },
      take: 6,
      include: { wettbewerber: true },
    }),
    prisma.material.count(),
    prisma.fieldIntel.count(),
    prisma.automatischerEintrag.count({ where: { istGelesen: false } }),
  ])

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-db-dark">Home</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-db-gray">Total Materials</p>
          <p className="text-3xl font-bold">{materialCount}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-db-gray">Field Intel Reports</p>
          <p className="text-3xl font-bold">{fieldIntelCount}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-db-gray">Unread Entries</p>
          <p className="text-3xl font-bold text-db-red">{unreadCount}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-sm text-db-gray">Last Update</p>
          <p className="text-lg font-medium">
            {autoEntries[0]?.erfasstAm.toLocaleString('en-US') ?? 'No data'}
          </p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-semibold">Latest Activity</h3>
          <Link href="/competitive-analysis" className="text-db-red text-sm hover:underline">
            View all →
          </Link>
        </div>
        <div className="space-y-3">
          {autoEntries.length === 0 ? (
            <p className="text-db-gray italic">No automatic entries yet.</p>
          ) : (
            autoEntries.map((e) => (
              <div key={e.id} className="bg-white p-4 rounded shadow flex items-start gap-4">
                <span
                  className="w-3 h-3 rounded-full mt-1.5"
                  style={{ backgroundColor: e.wettbewerber.farbe }}
                />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{e.titel}</h4>
                    <span className="text-xs text-db-gray">{e.quelle}</span>
                  </div>
                  <p className="text-sm text-db-gray mt-1">{e.zusammenfassung}</p>
                  <div className="flex gap-4 mt-2 text-xs text-db-gray">
                    <span>{e.wettbewerber.name}</span>
                    <span>{e.veroeffentlicht?.toLocaleDateString('en-US')}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}