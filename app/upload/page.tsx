'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UploadCloud } from 'lucide-react'

export default function UploadPage() {
  const router = useRouter()
  const [titel, setTitel] = useState('')
  const [beschreibung, setBeschreibung] = useState('')
  const [wettbewerber, setWettbewerber] = useState('1')
  const [kategorie, setKategorie] = useState('1')
  const [aufnahmeDatum, setAufnahmeDatum] = useState(new Date().toISOString().slice(0,10))
  const [files, setFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titel.trim()) return setError('Title is required')
    if (!files || files.length === 0) return setError('Please select at least one file')

    setUploading(true)
    setError('')

    // 构建表单数据
    const formData = new FormData()
    // 目前后端仅处理单文件，我们取第一个文件上传
    formData.append('file', files[0]) 
    formData.append('titel', titel)
    formData.append('beschreibung', beschreibung)
    formData.append('wettbewerberId', wettbewerber)
    formData.append('kategorieId', kategorie)
    formData.append('aufnahmeDatum', aufnahmeDatum)

    try {
      const res = await fetch('/api/upload', { 
        method: 'POST', 
        body: formData 
      })
      
      const result = await res.json()

      if (res.ok && result.success) {
        // 上传成功后跳转到库页面，查看 iFood/KeeTa 调研结果
        router.push('/library')
        router.refresh()
      } else {
        setError(result.error || 'Upload failed')
      }
    } catch (err) {
      setError('Network error, please check connection')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Upload Material</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4 border border-db-border">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            type="text" value={titel} onChange={e => setTitel(e.target.value)}
            className="w-full border border-db-border rounded px-3 py-2 focus:ring-1 focus:ring-db-red outline-none"
            placeholder="Title (CN, EN, PT possible)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={beschreibung} onChange={e => setBeschreibung(e.target.value)}
            className="w-full border border-db-border rounded px-3 py-2 focus:ring-1 focus:ring-db-red outline-none" 
            rows={3}
            placeholder="Optional description"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Competitor *</label>
            <select value={wettbewerber} onChange={e => setWettbewerber(e.target.value)} className="w-full border border-db-border rounded px-3 py-2 outline-none">
              <option value="1">Keeta</option>
              <option value="2">iFood</option>
              <option value="3">Both</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select value={kategorie} onChange={e => setKategorie(e.target.value)} className="w-full border border-db-border rounded px-3 py-2 outline-none">
              <option value="1">Price Action</option>
              <option value="2">Coupon</option>
              <option value="3">Expansion</option>
              <option value="4">Menu Change</option>
              <option value="5">Marketing Campaign</option>
              <option value="6">Partnership</option>
              <option value="7">Other</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date of Capture *</label>
          <input
            type="date" value={aufnahmeDatum} onChange={e => setAufnahmeDatum(e.target.value)}
            className="w-full border border-db-border rounded px-3 py-2 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Upload Files *</label>
          <div className="relative border-2 border-dashed border-db-border rounded p-6 text-center cursor-pointer hover:bg-db-light transition-colors">
            <UploadCloud className="mx-auto text-db-gray mb-2" />
            <p className="text-sm text-db-gray">PNG, JPG, PDF (max 5 files)</p>
            <input
              type="file" multiple accept="image/*,.pdf,.docx"
              onChange={e => setFiles(e.target.files)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          {files && <p className="text-sm mt-1 text-db-red font-medium">{files.length} file(s) selected</p>}
        </div>
        {error && <p className="text-db-red text-sm font-bold">{error}</p>}
        <button
          type="submit" disabled={uploading}
          className="w-full bg-db-red text-white py-2 rounded font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {uploading ? 'Processing...' : 'Upload'}
        </button>
      </form>
    </div>
  )
}