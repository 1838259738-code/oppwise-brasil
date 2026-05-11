'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DatenquellenClient({ quellen, keywords }) {
  const router = useRouter()
  const [showAddSource, setShowAddSource] = useState(false)
  const [showAddKeyword, setShowAddKeyword] = useState(false)

  const toggleSource = async (id: number, aktiv: boolean) => {
    await fetch('/api/data-sources', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, aktiv: !aktiv }),
    })
    router.refresh()
  }

  const addSource = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    await fetch('/api/data-sources', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(form)),
      headers: { 'Content-Type': 'application/json' },
    })
    router.refresh()
    setShowAddSource(false)
  }

  const addKeyword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    await fetch('/api/keywords', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(form)),
      headers: { 'Content-Type': 'application/json' },
    })
    router.refresh()
    setShowAddKeyword(false)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Data Sources & Live Feeds</h2>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Automated Sources</h3>
          <button onClick={() => setShowAddSource(!showAddSource)} className="text-db-red text-sm">
            + New Source
          </button>
        </div>
        {showAddSource && (
          <form onSubmit={addSource} className="bg-white p-4 rounded shadow mb-4 space-y-2">
            <input name="name" placeholder="Name" className="w-full border px-2 py-1 rounded" required />
            <select name="typ" className="w-full border px-2 py-1 rounded">
              <option value="RSS">RSS</option>
              <option value="IMAP">IMAP</option>
              <option value="Keyword">Keyword</option>
            </select>
            <input name="urlOderConfig" placeholder="URL or Config" className="w-full border px-2 py-1 rounded" required />
            <button type="submit" className="bg-db-red text-white px-4 py-1 rounded text-sm">Add</button>
          </form>
        )}
        <ul className="space-y-2">
          {quellen.map(q => (
            <li key={q.id} className="bg-white p-3 rounded shadow flex justify-between items-center">
              <div>
                <span className="font-medium">{q.name}</span>
                <span className="text-xs ml-2 text-db-gray">{q.typ}</span>
                <p className="text-sm text-db-gray truncate">{q.urlOderConfig}</p>
              </div>
              <button
                onClick={() => toggleSource(q.id, q.aktiv)}
                className={`px-3 py-1 rounded text-sm ${q.aktiv ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
              >
                {q.aktiv ? 'Active' : 'Inactive'}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Monitoring Keywords</h3>
          <button onClick={() => setShowAddKeyword(!showAddKeyword)} className="text-db-red text-sm">
            + New Keyword
          </button>
        </div>
        {showAddKeyword && (
          <form onSubmit={addKeyword} className="bg-white p-4 rounded shadow mb-4 flex gap-2">
            <input name="keyword" placeholder="Keyword (PT/EN)" className="flex-1 border px-2 py-1 rounded" required />
            <button type="submit" className="bg-db-red text-white px-4 py-1 rounded text-sm">Add</button>
          </form>
        )}
        <div className="flex flex-wrap gap-2">
          {keywords.map(k => (
            <span key={k.id} className="bg-white border px-3 py-1 rounded-full text-sm">
              {k.keyword}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={async () => {
            await fetch('/api/crawl', { method: 'POST' })
            alert('Crawler started')
          }}
          className="bg-db-red text-white px-6 py-2 rounded font-medium"
        >
          Fetch Now
        </button>
        <p className="text-xs text-db-gray mt-1">Runs all active sources and saves new entries.</p>
      </div>
    </div>
  )
}