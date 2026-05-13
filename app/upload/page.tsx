'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-react'

export default function UploadPage() {
  const router = useRouter()
  const [titel, setTitel] = useState('')
  const [beschreibung, setBeschreibung] = useState('')
  const [wettbewerber, setWettbewerber] = useState('1')
  const [kategorie, setKategorie] = useState('1')
  const [aufnahmeDatum, setAufnahmeDatum] = useState(new Date().toISOString().slice(0,10))
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titel.trim()) return setError('Title is required')
    if (!file) return setError('Please select an intelligence file')

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)
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
        router.push('/library')
        router.refresh()
      } else {
        setError(result.error || 'Upload failed')
      }
    } catch (err) {
      setError('Network connection failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* 头部标题区：99Food 风格的鲜明对比 */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Upload Material</h2>
        <p className="text-gray-500 mt-2">Log competitor activities for market intelligence.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 space-y-6">
        
        {/* Title Input */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Title <span className="text-yellow-500">*</span></label>
          <input
            type="text" value={titel} onChange={e => setTitel(e.target.value)}
            className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 bg-gray-50 text-gray-900 outline-none focus:bg-white focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 transition-all"
            placeholder="e.g., iFood Weekend Coupon Surge"
          />
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
          <textarea
            value={beschreibung} onChange={e => setBeschreibung(e.target.value)}
            className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 bg-gray-50 text-gray-900 outline-none focus:bg-white focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 transition-all resize-none" 
            rows={3}
            placeholder="Key insights or translation notes..."
          />
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Competitor <span className="text-yellow-500">*</span></label>
            <div className="relative">
              <select value={wettbewerber} onChange={e => setWettbewerber(e.target.value)} className="w-full appearance-none border-2 border-gray-100 rounded-xl px-4 py-3 bg-gray-50 text-gray-900 font-medium outline-none focus:bg-white focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 transition-all cursor-pointer">
                <option value="1">KeeTa</option>
                <option value="2">iFood</option>
                <option value="3">Both</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Category <span className="text-yellow-500">*</span></label>
            <div className="relative">
              <select value={kategorie} onChange={e => setKategorie(e.target.value)} className="w-full appearance-none border-2 border-gray-100 rounded-xl px-4 py-3 bg-gray-50 text-gray-900 font-medium outline-none focus:bg-white focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 transition-all cursor-pointer">
                <option value="1">Price Action</option>
                <option value="2">Coupon & Subsidy</option>
                <option value="3">Expansion</option>
                <option value="4">Menu Change</option>
                <option value="5">Marketing Campaign</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Date Input */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Date of Capture <span className="text-yellow-500">*</span></label>
          <input
            type="date" value={aufnahmeDatum} onChange={e => setAufnahmeDatum(e.target.value)}
            className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 bg-gray-50 text-gray-900 outline-none focus:bg-white focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 transition-all"
          />
        </div>

        {/* Upload Zone */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Intelligence Asset <span className="text-yellow-500">*</span></label>
          <div className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${file ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 hover:border-yellow-400 hover:bg-gray-50'}`}>
            {!file ? (
              <>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UploadCloud className="text-yellow-600 w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-gray-900">Click or drag file to upload</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF up to 10MB</p>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="text-green-600 w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  {file.name}
                </p>
                <p className="text-xs text-yellow-600 font-medium mt-2 hover:underline cursor-pointer">
                  Change file
                </p>
              </div>
            )}
            <input
              type="file" accept="image/*,.pdf"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {error}
          </div>
        )}
        
        {/* Submit Button - 99Food Signature Yellow */}
        <button
          type="submit" disabled={uploading}
          className="w-full bg-[#FFCC00] text-gray-900 py-4 rounded-xl font-extrabold text-lg hover:bg-[#F0C000] active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 transition-all shadow-[0_4px_14px_0_rgba(255,204,0,0.39)] hover:shadow-[0_6px_20px_rgba(255,204,0,0.23)]"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Uploading Asset...
            </span>
          ) : (
            'Sync to Database'
          )}
        </button>
      </form>
    </div>
  )
}