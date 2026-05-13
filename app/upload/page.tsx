'use client'

import { useState } from 'react'
import { Upload, Database, CheckCircle2, AlertCircle } from 'lucide-react'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [competitorId, setCompetitorId] = useState('1') // 默认 1: KeeTa, 2: iFood
  const [isSyncing, setIsSyncing] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSync = async () => {
    if (!file) {
      setStatus({ type: 'error', msg: 'Please select a file first.' })
      return
    }

    setIsSyncing(true)
    setStatus(null)

    const formData = new FormData()
    // 关键修正：确保键名 'files' 与后端 getAll('files') 完全一致
    formData.append('files', file)
    formData.append('titel', title)
    formData.append('wettbewerberId', competitorId)
    formData.append('beschreibung', 'Manual upload from intelligence portal')

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        // 注意：不要手动设置 Content-Type header
      })

      const result = await response.json()

      if (!response.ok) throw new Error(result.error || 'Upload failed')

      setStatus({ type: 'success', msg: 'Intelligence asset synced to database.' })
      setFile(null)
      setTitle('')
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-6">
      {/* 标题部分 - DB Industrial Style */}
      <div className="border-l-8 border-[#FF0000] pl-6 py-2">
        <h1 className="text-4xl font-black tracking-tighter uppercase italic text-[#333]">
          Intelligence Ingest
        </h1>
        <p className="text-gray-500 font-mono text-sm mt-1">OPERATIX-B / BRAZIL MARKET</p>
      </div>

      <div className="bg-white border-2 border-gray-100 p-8 shadow-sm space-y-6">
        {/* 文件上传区域 */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-gray-400">
            Intelligence Asset *
          </label>
          <div className={`relative border-2 border-dashed rounded-lg p-10 transition-colors ${file ? 'border-green-400 bg-green-50/30' : 'border-[#FFD111] bg-[#FFD111]/5'}`}>
            <input 
              type="file" 
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="text-center space-y-2">
              {file ? (
                <div className="flex flex-col items-center animate-in fade-in zoom-in">
                  <div className="bg-green-100 p-3 rounded-full text-green-600 mb-2">
                    <CheckCircle2 size={32} />
                  </div>
                  <span className="font-bold text-gray-700">{file.name}</span>
                  <button className="text-xs text-amber-600 underline">Change file</button>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <Upload size={40} className="mb-2" />
                  <p className="text-sm font-medium">Drag screenshot or click to browse</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 表单字段 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400">Target Competitor</label>
            <select 
              value={competitorId}
              onChange={(e) => setCompetitorId(e.target.value)}
              className="w-full p-3 border-2 border-gray-100 font-bold focus:border-[#FF0000] outline-none"
            >
              <option value="1">KeeTa (Yellow)</option>
              <option value="2">iFood (Red)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400">Intelligence Title</label>
            <input 
              type="text"
              placeholder="e.g. Campaign Banner BRL 15"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border-2 border-gray-100 font-bold focus:border-[#FF0000] outline-none"
            />
          </div>
        </div>

        {/* 状态反馈 */}
        {status && (
          <div className={`p-4 flex items-center gap-3 border-l-4 ${status.type === 'success' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'}`}>
            {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="text-sm font-bold">{status.msg}</span>
          </div>
        )}

        {/* 提交按钮 */}
        <button
          onClick={handleSync}
          disabled={isSyncing || !file}
          className={`w-full py-5 flex items-center justify-center gap-3 text-xl font-black uppercase italic tracking-tighter transition-all shadow-[0_4px_0_0_#CC0000] active:translate-y-1 active:shadow-none ${isSyncing || !file ? 'bg-gray-200 text-gray-400 shadow-none' : 'bg-[#FFD111] text-[#333] hover:bg-[#FFC400]'}`}
        >
          {isSyncing ? (
            <div className="animate-spin rounded-full h-6 w-6 border-4 border-black border-t-transparent" />
          ) : (
            <>
              <Database size={24} />
              Sync to Database
            </>
          )}
        </button>
      </div>
    </div>
  )
}