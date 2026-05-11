'use client'

import { useState, useRef } from 'react'
import { UploadCloud, MapPin, Tag, Loader2 } from 'lucide-react'

export default function FieldIntelPage() {
  const [titel, setTitel] = useState('')
  const [wettbewerber, setWettbewerber] = useState('1')
  const [stadt, setStadt] = useState('')
  const [screenType, setScreenType] = useState('Homepage Feed')
  const [userProfile, setUserProfile] = useState('New user')
  const [tags, setTags] = useState('')
  const [notizen, setNotizen] = useState('')
  const [files, setFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const screenTypes = [
    'Homepage Feed',
    'Restaurant Listing',
    'Coupon / Promo Page',
    'Checkout / Price Breakdown',
    'Membership / Subscription',
    'Push Notification',
    'Other',
  ]
  const userProfiles = [
    'New user',
    'Existing user',
    'Prime / Subscription user',
    'Specific device/language',
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titel.trim()) return setError('Title required')
    if (!files || files.length === 0) return setError('Screenshot required')

    setUploading(true)
    setError('')
    setResult(null)

    const formData = new FormData()
    formData.append('titel', titel)
    formData.append('wettbewerberId', wettbewerber)
    formData.append('stadt', stadt)
    formData.append('screenType', screenType)
    formData.append('userProfile', userProfile)
    formData.append('tags', tags)
    formData.append('notizen', notizen)
    Array.from(files).forEach(file => formData.append('files', file))

    try {
      const res = await fetch('/api/field-intel', { method: 'POST', body: formData })
      if (res.ok) {
        const data = await res.json()
        setResult(data)
      } else {
        setError('Upload failed')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* 左侧上传表单 */}
      <div className="lg:w-1/2 bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Field Intel</h2>
        <p className="text-sm text-db-gray mb-4">
          Submit screenshots from Brazilian users for AI‑powered competitive analysis.
        </p>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              className="w-full border border-db-border rounded px-3 py-2"
              placeholder="e.g. Keeta SP new user coupon"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Competitor *</label>
              <select
                value={wettbewerber}
                onChange={(e) => setWettbewerber(e.target.value)}
                className="w-full border border-db-border rounded px-3 py-2"
              >
                <option value="1">Keeta</option>
                <option value="2">iFood</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City *</label>
              <input
                type="text"
                value={stadt}
                onChange={(e) => setStadt(e.target.value)}
                className="w-full border border-db-border rounded px-3 py-2"
                placeholder="São Paulo"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Screen Type</label>
              <select
                value={screenType}
                onChange={(e) => setScreenType(e.target.value)}
                className="w-full border border-db-border rounded px-3 py-2"
              >
                {screenTypes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">User Profile</label>
              <select
                value={userProfile}
                onChange={(e) => setUserProfile(e.target.value)}
                className="w-full border border-db-border rounded px-3 py-2"
              >
                {userProfiles.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full border border-db-border rounded px-3 py-2"
              placeholder="free delivery, dynamic pricing"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Quick Notes (PT/EN)</label>
            <textarea
              value={notizen}
              onChange={(e) => setNotizen(e.target.value)}
              className="w-full border border-db-border rounded px-3 py-2"
              rows={2}
              placeholder="Observations from the field..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Screenshot(s) *</label>
            {/* 👇 关键修复：添加 relative */}
            <div className="relative border-2 border-dashed border-db-border rounded p-6 text-center cursor-pointer hover:bg-db-light">
              <UploadCloud className="mx-auto text-db-gray mb-2" />
              <p className="text-sm text-db-gray">PNG, JPG (max 3)</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setFiles(e.target.files)}
                className="absolute inset-0 opacity-0"
                style={{ cursor: 'pointer' }}
              />
            </div>
            {files && <p className="text-sm mt-1">{files.length} file(s) selected</p>}
          </div>

          {error && <p className="text-db-red text-sm">{error}</p>}

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-db-red text-white py-2 rounded font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading && <Loader2 size={18} className="animate-spin" />}
            {uploading ? 'Analyzing...' : 'Upload & Analyze'}
          </button>
        </form>
      </div>

      {/* 右侧分析结果 */}
      <div className="lg:w-1/2">
        {result ? (
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-xl font-bold mb-2">Analysis Result</h3>
            <div className="mb-4 flex gap-2">
              {result.data?.dateiPfade &&
                JSON.parse(result.data.dateiPfade).map((f: string, i: number) => (
                  <img
                    key={i}
                    src={`/uploads/${f}`}
                    className="w-32 h-32 object-cover rounded border"
                  />
                ))}
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">Extracted Text</p>
                <p className="text-xs text-db-gray bg-db-light p-2 rounded whitespace-pre-wrap">
                  {result.data?.extractedText ||
                    '(Simulated – integrate Vision API for real extraction)'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Price Findings</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {result.data?.priceFindings ? (
                    JSON.parse(result.data.priceFindings).map((p: any, i: number) => (
                      <span
                        key={i}
                        className="bg-db-red/10 text-db-red px-2 py-0.5 rounded text-xs"
                      >
                        {p.label}: {p.value}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-db-gray">None detected</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">Strategy Tags</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {result.data?.strategyTags ? (
                    JSON.parse(result.data.strategyTags).map((t: string, i: number) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 bg-gray-200 px-2 py-0.5 rounded text-xs"
                      >
                        <Tag size={12} />
                        {t}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-db-gray">No strategy detected</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium">AI Summary</p>
                <p className="text-sm text-db-gray bg-db-light p-2 rounded">
                  {result.data?.aiSummary ||
                    '(Simulated summary – replace with real Vision API call)'}
                </p>
              </div>
              <div className="text-xs text-db-gray flex gap-4">
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {result.data?.stadt}
                </span>
                <span>{result.data?.userProfile}</span>
                <span>{result.data?.screenType}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded shadow h-full flex items-center justify-center text-db-gray">
            <p>Upload a screenshot to see AI analysis here.</p>
          </div>
        )}
      </div>
    </div>
  )
}