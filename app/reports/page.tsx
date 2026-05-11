'use client'

import { useState } from 'react'

export default function ReportsPage() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [competitor, setCompetitor] = useState('all')
  const [type, setType] = useState('all')
  const [generating, setGenerating] = useState(false)

  const generateReport = async () => {
    setGenerating(true)
    const params = new URLSearchParams({ von: from, bis: to, wettbewerber: competitor, typ: type })
    const res = await fetch(`/api/report?${params}`)
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `OppWise_Report_${from}_${to}.csv`
    a.click()
    setGenerating(false)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Reports</h2>
      <div className="bg-white p-6 rounded shadow max-w-md">
        <div className="space-y-3">
          <div>
            <label className="block text-sm">From</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm">To</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm">Competitor</label>
            <select value={competitor} onChange={e => setCompetitor(e.target.value)} className="w-full border px-3 py-2 rounded">
              <option value="all">All</option>
              <option value="Keeta">Keeta</option>
              <option value="iFood">iFood</option>
            </select>
          </div>
          <div>
            <label className="block text-sm">Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full border px-3 py-2 rounded">
              <option value="all">All</option>
              <option value="manual">Manual</option>
              <option value="auto">Auto</option>
              <option value="field">Field Intel</option>
            </select>
          </div>
          <button
            onClick={generateReport}
            disabled={generating || !from || !to}
            className="w-full bg-db-red text-white py-2 rounded disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Download CSV'}
          </button>
        </div>
      </div>
    </div>
  )
}