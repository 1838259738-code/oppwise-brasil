'use client'

import { useState } from 'react'
import { Filter, X, MapPin, Tag } from 'lucide-react'

export default function AnalysenClient({ initialData, kategorien, wettbewerber }) {
  const [filterWettbewerb, setFilterWettbewerb] = useState('')
  const [filterKategorie, setFilterKategorie] = useState('')
  const [filterSuche, setFilterSuche] = useState('')

  const filtered = initialData.filter(item => {
    if (filterWettbewerb && item.wettbewerber !== filterWettbewerb) return false
    if (filterKategorie && item.kategorie !== filterKategorie) return false
    if (filterSuche && !item.titel.toLowerCase().includes(filterSuche.toLowerCase())) return false
    return true
  })

  return (
    <>
      <div className="bg-white p-4 rounded shadow mb-6 flex flex-wrap gap-3 items-center">
        <Filter size={18} className="text-db-gray" />
        <select
          value={filterWettbewerb}
          onChange={(e) => setFilterWettbewerb(e.target.value)}
          className="border border-db-border rounded px-2 py-1 text-sm"
        >
          <option value="">All Competitors</option>
          {wettbewerber.map((w: any) => (
            <option key={w.id} value={w.name}>{w.name}</option>
          ))}
        </select>
        <select
          value={filterKategorie}
          onChange={(e) => setFilterKategorie(e.target.value)}
          className="border border-db-border rounded px-2 py-1 text-sm"
        >
          <option value="">All Categories</option>
          {kategorien.map((k: any) => (
            <option key={k.id} value={k.name}>{k.name}</option>
          ))}
          <option value="Field Intel">Field Intel</option>
        </select>
        <input
          type="text"
          placeholder="Search (English, Portuguese, Chinese)..."
          value={filterSuche}
          onChange={(e) => setFilterSuche(e.target.value)}
          className="border border-db-border rounded px-3 py-1 text-sm flex-1 min-w-[200px]"
        />
        {(filterWettbewerb || filterKategorie || filterSuche) && (
          <button
            onClick={() => { setFilterWettbewerb(''); setFilterKategorie(''); setFilterSuche('') }}
            className="text-db-red text-sm flex items-center gap-1"
          >
            <X size={14} /> Clear filters
          </button>
        )}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <p className="text-db-gray italic">No entries found.</p>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded shadow flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.farbe }}
                />
                <div className="w-px h-full bg-db-border mt-1" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-semibold">{item.titel}</h3>
                  <span className="text-xs bg-db-light px-2 py-0.5 rounded">
                    {item.type === 'auto' ? 'Auto' : item.type === 'field' ? 'Field Intel' : 'Manual'}
                  </span>
                </div>
                <p className="text-sm text-db-gray mt-1">{item.beschreibung}</p>
                <div className="flex flex-wrap gap-2 mt-2 text-xs">
                  <span className="bg-db-red/10 text-db-red px-2 py-0.5 rounded">{item.wettbewerber}</span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded">{item.kategorie}</span>
                  <span>{new Date(item.datum).toLocaleDateString('en-US')}</span>
                  <span>{item.quelle}</span>
                  {item.extra?.stadt && (
                    <span className="flex items-center gap-1"><MapPin size={12} />{item.extra.stadt}</span>
                  )}
                </div>
                {item.extra?.priceFindings && (
                  <div className="mt-2 bg-db-light p-2 rounded text-xs">
                    {JSON.parse(item.extra.priceFindings).map((p: any, i: number) => (
                      <span key={i} className="mr-3">
                        {p.label}: <strong>{p.value}</strong>
                      </span>
                    ))}
                  </div>
                )}
                {item.extra?.strategyTags && (
                  <div className="mt-1 flex gap-1 flex-wrap">
                    {JSON.parse(item.extra.strategyTags).map((t: string, i: number) => (
                      <span key={i} className="bg-gray-200 px-1.5 py-0.5 rounded text-xs flex items-center gap-1">
                        <Tag size={10} />{t}
                      </span>
                    ))}
                  </div>
                )}
                {item.dateien && item.dateien.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {item.dateien.map((pfad: string, idx: number) => (
                      <a
                        key={idx}
                        href={`/uploads/${pfad}`}
                        target="_blank"
                        className="text-db-red underline text-sm"
                      >
                        Attachment {idx + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}