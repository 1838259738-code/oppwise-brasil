'use client'

import { useState } from 'react'
import { UploadCloud, Zap, Target, MapPin, CheckCircle2 } from 'lucide-react'

export default function FieldIntelPage() {
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: '', competitorId: '1', city: 'São Paulo', screenType: 'Checkout Page', userProfile: 'New User', tags: '', notes: ''
  })
  const [isUploading, setIsUploading] = useState(false)
  const [aiResult, setAiResult] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return alert('Please upload a screenshot first!')
    
    setIsUploading(true)
    setAiResult(null)

    const data = new FormData()
    data.append('files', file)
    Object.entries(formData).forEach(([key, value]) => data.append(key, value))

    try {
      // 这里去呼叫我们真正的后端 API
      const res = await fetch('/api/field-intel', { method: 'POST', body: data })
      const result = await res.json()
      
      if (result.success) {
        setAiResult(result.data)
        setFile(null)
      } else {
        alert('Upload failed: ' + result.error)
      }
    } catch (err) {
      alert('Network error occurred.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm flex items-center gap-6 border border-gray-100">
          <div className="bg-[#FFD111] p-4 rounded-[24px] shadow-inner">
             <Target size={32} className="text-[#333]" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-[#333] tracking-tight">Field Intel Upload</h2>
            <p className="text-gray-400 font-medium mt-1">Submit raw competitor screenshots for DeepSeek AI analysis</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：情报提交表单 */}
          <form onSubmit={handleSubmit} className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-6">
            
            <div className={`relative border-2 border-dashed rounded-[24px] p-10 text-center transition-all ${file ? 'border-[#FFD111] bg-[#FFD111]/10' : 'border-gray-300 hover:border-[#FFD111] bg-gray-50'}`}>
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
              {file ? (
                <div className="flex flex-col items-center"><CheckCircle2 className="text-[#FFD111] mb-2" size={32} /><span className="font-bold text-[#333]">{file.name}</span></div>
              ) : (
                <div className="flex flex-col items-center text-gray-400"><UploadCloud size={32} className="mb-2" /><span className="font-bold">Drop intelligence screenshot here</span></div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2 col-span-2">
                 <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Intel Title</label>
                 <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#FFD111]" placeholder="e.g. iFood Lunch Subsidy" />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Competitor</label>
                 <select value={formData.competitorId} onChange={e => setFormData({...formData, competitorId: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#FFD111]">
                   <option value="1">KeeTa</option><option value="2">iFood</option>
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-black uppercase text-gray-400 tracking-widest">City</label>
                 <input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#FFD111]" />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Screen Context</label>
                 <input value={formData.screenType} onChange={e => setFormData({...formData, screenType: e.target.value})} className="w-full bg-gray-50 p-4 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#FFD111]" />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Operation Tags</label>
                 <input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="e.g. Free Delivery" className="w-full bg-gray-50 p-4 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#FFD111]" />
               </div>
               <div className="space-y-2 col-span-2">
                 <label className="text-xs font-black uppercase text-gray-400 tracking-widest">Field Notes</label>
                 <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={3} className="w-full bg-gray-50 p-4 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[#FFD111]" />
               </div>
            </div>

            <button type="submit" disabled={isUploading} className={`w-full py-5 rounded-[20px] font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 ${isUploading ? 'bg-gray-200 text-gray-400' : 'bg-[#333] text-[#FFD111] hover:bg-black hover:shadow-xl hover:-translate-y-1'}`}>
              {isUploading ? 'Extracting via DeepSeek...' : <><Zap size={18} /> Upload & Analyze</>}
            </button>
          </form>

          {/* 右侧：AI 结果控制台 */}
          <div className="bg-[#333] rounded-[32px] p-8 shadow-xl text-white">
            <h4 className="text-[#FFD111] font-black text-xs uppercase tracking-[0.2em] mb-8 border-b border-white/10 pb-4">DeepSeek Neural Engine</h4>
            
            {aiResult ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white/10 p-6 rounded-2xl border border-white/5">
                  <p className="text-xs font-black text-gray-400 mb-2 uppercase">Strategic Summary</p>
                  <p className="text-xl font-bold leading-relaxed">{aiResult.ai_summary}</p>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-gray-400 bg-black/20 p-4 rounded-xl">
                  <span>Intel ID: {aiResult.id}</span>
                  <span className="text-green-400 flex items-center gap-1"><CheckCircle2 size={14}/> Synced to Hub</span>
                </div>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center opacity-50">
                <Zap size={48} className="mb-4 text-gray-500" />
                <p className="font-bold uppercase tracking-widest">Waiting for field input</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}