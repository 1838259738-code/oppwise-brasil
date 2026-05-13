'use client'

import { useState } from 'react'
import { Camera, MapPin, Zap, CheckCircle2, UploadCloud, ScanEye } from 'lucide-react'

export default function FieldIntel() {
  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    title: '', competitorId: '1', city: 'São Paulo', 
    screenType: 'Homepage Feed', userProfile: 'New User', tags: '', notes: ''
  })
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSync = async () => {
    if (!file) {
      setError('Please upload a screenshot first.')
      return
    }
    setIsUploading(true)
    setError('')

    const data = new FormData()
    // 这里的 'files' 必须和后端 formData.getAll('files') 对齐
    data.append('files', file)
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value)
    })

    try {
      // 确保路径与你的 API 文件所在路径一致
      const res = await fetch('/api/field-intel', { method: 'POST', body: data })
      const json = await res.json()
      
      if (!res.ok) throw new Error(json.error)
      
      setResult(json.data)
      setFile(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 顶部标题栏 */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm flex items-center gap-6 border border-gray-100">
          <div className="bg-[#FFD111] p-4 rounded-[24px] shadow-inner">
            <ScanEye size={32} className="text-[#333]" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-[#333] tracking-tight">Field Intelligence</h2>
            <p className="text-gray-400 font-medium mt-1">Submit app screenshots from Brazilian users for AI strategy extraction.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：表单区 */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-6 relative overflow-hidden">
            {/* 装饰色块 */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD111]/10 rounded-bl-[100px] -z-10" />

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Title *</label>
                <input name="title" onChange={handleInputChange} placeholder="e.g. KeeTa SP new user coupon" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#FFD111] focus:bg-white outline-none transition-all font-medium text-[#333]" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Competitor *</label>
                  <select name="competitorId" onChange={handleInputChange} className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#FFD111] outline-none font-bold text-[#333]">
                    <option value="1">KeeTa</option>
                    <option value="2">iFood</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">City *</label>
                  <input name="city" onChange={handleInputChange} defaultValue="São Paulo" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#FFD111] outline-none font-medium text-[#333]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Screen Type</label>
                  <select name="screenType" onChange={handleInputChange} className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#FFD111] outline-none font-medium text-[#333]">
                    <option>Homepage Feed</option>
                    <option>Checkout Page</option>
                    <option>Store Menu</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400">User Profile</label>
                  <select name="userProfile" onChange={handleInputChange} className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#FFD111] outline-none font-medium text-[#333]">
                    <option>New User</option>
                    <option>Active User</option>
                    <option>Churned User</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Tags</label>
                <input name="tags" onChange={handleInputChange} placeholder="free delivery, dynamic pricing" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#FFD111] outline-none font-medium text-[#333]" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Quick Notes</label>
                <textarea name="notes" onChange={handleInputChange} rows={3} placeholder="Observations from the field..." className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#FFD111] outline-none font-medium text-[#333] resize-none" />
              </div>

              {/* 上传区域 */}
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Screenshot *</label>
                <div className={`relative border-2 border-dashed rounded-[24px] p-8 transition-colors text-center ${file ? 'border-[#FFD111] bg-[#FFD111]/5' : 'border-gray-200 bg-gray-50'}`}>
                  <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  {file ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle2 className="text-[#FFD111] mb-2" size={32} />
                      <span className="font-bold text-[#333]">{file.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <UploadCloud size={32} className="mb-2" />
                      <span className="font-bold">PNG, JPG (max 3MB)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold">{error}</div>}

            <button onClick={handleSync} disabled={isUploading || !file} className={`w-full py-5 rounded-[24px] font-black uppercase tracking-widest text-lg transition-all flex items-center justify-center gap-2 ${isUploading || !file ? 'bg-gray-100 text-gray-300' : 'bg-[#FFD111] text-[#333] hover:shadow-lg hover:-translate-y-1'}`}>
              {isUploading ? 'Extracting Data...' : <><Zap size={20} /> Upload & Analyze</>}
            </button>
          </div>

          {/* 右侧：AI 分析结果区 */}
          <div className="bg-[#333] rounded-[32px] p-8 shadow-xl text-white flex flex-col items-center justify-center min-h-[600px] relative overflow-hidden">
             {/* 右侧背景纹理 */}
             <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#FFF 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
             
             {result ? (
               <div className="relative z-10 w-full space-y-6">
                 <div className="inline-block bg-[#FFD111] text-[#333] px-4 py-1 rounded-full font-black uppercase text-xs tracking-widest">
                   Extraction Complete
                 </div>
                 <h3 className="text-3xl font-black text-white">{result.titel}</h3>
                 
                 <div className="bg-white/10 p-6 rounded-3xl space-y-4 backdrop-blur-md">
                   <h4 className="text-[#FFD111] font-bold text-sm uppercase tracking-widest border-b border-white/10 pb-2">Extracted Strategy</h4>
                   <p className="text-gray-300 leading-relaxed font-medium">
                     {/* 这里未来接深思或者 Gemini 的分析结果，暂时显示默认文案 */}
                     {result.ai_summary || 'The AI model has detected promotional elements and dynamic pricing adjustments in this screenshot. Detailed JSON breakdown will appear here.'}
                   </p>
                 </div>

                 <div className="flex gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl flex-1">
                      <p className="text-gray-500 text-xs uppercase font-bold mb-1">City</p>
                      <p className="font-bold flex items-center gap-1"><MapPin size={14}/> {result.stadt}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl flex-1">
                      <p className="text-gray-500 text-xs uppercase font-bold mb-1">Profile</p>
                      <p className="font-bold">{result.user_profile}</p>
                    </div>
                 </div>
               </div>
             ) : (
               <div className="relative z-10 text-center space-y-4">
                 <div className="bg-white/10 p-6 rounded-full inline-block mb-4">
                   <Camera size={48} className="text-[#FFD111]" />
                 </div>
                 <h3 className="text-2xl font-black">AI Vision Engine</h3>
                 <p className="text-gray-400 font-medium max-w-sm">Upload a Brazilian delivery app screenshot to automatically extract pricing, coupons, and strategic shifts.</p>
               </div>
             )}
          </div>

        </div>
      </div>
    </div>
  )
}