'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function BibliothekClient({ materialien }) {
  const [search, setSearch] = useState('')
  const filtered = materialien.filter(m =>
    m.titel.toLowerCase().includes(search.toLowerCase()) ||
    (m.beschreibung && m.beschreibung.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Material Library</h2>
        <Link href="/upload" className="bg-db-red text-white px-4 py-2 rounded text-sm">
          + New Material
        </Link>
      </div>
      <input
        type="text"
        placeholder="Search library..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border border-db-border rounded px-3 py-2 mb-4"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <p className="text-db-gray col-span-full">No materials found.</p>
        ) : (
          filtered.map(m => {
            const files = JSON.parse(m.dateiPfade || '[]')
            return (
              <div key={m.id} className="bg-white rounded shadow overflow-hidden">
                {files.length > 0 && files[0].match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img
                    src={`/uploads/${files[0]}`}
                    alt={m.titel}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-db-light flex items-center justify-center text-db-gray text-sm">
                    PDF / DOCX
                  </div>
                )}
                <div className="p-3">
                  <h3 className="font-medium truncate">{m.titel}</h3>
                  <div className="flex gap-2 mt-1 text-xs">
                    <span className="px-2 py-0.5 rounded" style={{ backgroundColor: m.wettbewerber.farbe + '20', color: m.wettbewerber.farbe }}>
                      {m.wettbewerber.name}
                    </span>
                    <span className="bg-gray-100 px-2 py-0.5 rounded">{m.kategorie.name}</span>
                  </div>
                  <p className="text-xs text-db-gray mt-2">
                    {new Date(m.aufnahmeDatum).toLocaleDateString('en-US')} · {files.length} file(s)
                  </p>
                  <div className="mt-2 flex gap-2">
                    {files.map((f, i) => (
                      <a key={i} href={`/uploads/${f}`} target="_blank" className="text-db-red text-xs underline">View</a>
                    ))}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}