'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ClipboardList, Plus, MapPin, Target, CheckCircle2, Clock, UploadCloud, Zap } from 'lucide-react'

export default function OpsRequests() {
  const [requests, setRequests] = useState<any[]>([])
  const [selectedReq, setSelectedReq] = useState<any>(null)
  
  // 新建需求的表单状态
  const [showNewForm, setShowNewForm] = useState(false)
  const [newReq, setNewReq] = useState({ title: '', description: '', competitor: 'iFood', city: 'São Paulo' })
  
  // 上传与 AI 状态
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [aiResult, setAiResult] = useState('')

  // 1. 获取需求列表
  const fetchRequests = async () => {
    const { data } = await supabase.from('intel_requests').select('*').order('created_at', { ascending: false })
    if (data) setRequests(data)
  }

  useEffect(() => { fetchRequests() }, [])

  // 2. 创建新需求
  const handleCreateRequest = async () => {
    if (!newReq.title) return
    await supabase.from('intel_requests').insert([newReq])
    setShowNewForm(false)
    setNewReq({ title: '', description: '', competitor: 'iFood', city: 'São Paulo' })
    fetchRequests()
  }

  // 3. 针对需求上传情报并触发 AI (复用你刚修好的 Field Intel API)
  const handleUploadForRequest = async () => {
    if (!file || !selectedReq) return
    setIsUploading(true)

    const formData = new FormData()
    formData.append('files', file)
    formData.append('title', `[Fulfill] ${selectedReq.title}`)
    formData.append('competitorId', selectedReq.competitor === 'KeeTa' ? '1' : '2')
    formData.append('city', selectedReq.city)
    formData.append('screenType', 'Targeted Request')
    formData.append('userProfile', 'Any')
    formData.append('tags', 'Ops Fulfill')
    formData.append('notes', selectedReq.description)

    try {
      const res = await fetch('/api/field-intel', { method: 'POST', body: formData })
      const json = await res.json()
      
      if (json.success) {
        // 更新任务状态为已完成
        await supabase.from('intel_requests').update({ status: 'Fulfilled' }).eq('id', selectedReq.id)
        setAiResult(json.data.ai_summary)
        fetchRequests()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsUploading(false)
      setFile(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm flex justify-between items-center border border-gray-100">
          <div className="flex items-center gap-6">
            <div className="bg-[#FFD111] p-4 rounded-[24px] shadow-inner">
              <ClipboardList size={32} className="text-[#333]" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-[#333] tracking-tight">Ops Requests</h2>
              <p className="text-gray-400 font-medium mt-1">Dispatch target missions to field team and collect intel</p>
            </div>
          </div>
          <button 
            onClick={() => setShowNewForm(!showNewForm)}
            className="bg-[#333] text-white px-6 py-3 rounded-[20px] font-bold text-sm flex items-center gap-2 hover:bg-black transition-colors"
          >
            <Plus size={18} /> New Request
          </button>
        </div>

        {/* 新建需求表单 (折叠) */}
        {showNewForm && (
          <div className="bg-[#FFD111] rounded-[32px] p-8 shadow-md text-[#333] flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-black uppercase tracking-widest">Mission Title</label>
              <input value={newReq.title} onChange={e => setNewReq({...newReq, title: e.target.value})} placeholder="e.g. Check iFood Lunch Delivery Fee" className="w-full p-3 rounded-xl border-none outline-none font-bold" />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-xs font-black uppercase tracking-widest">Details</label>
              <input value={newReq.description} onChange={e => setNewReq({...newReq, description: e.target.value})} placeholder="Specific requirements..." className="w-full p-3 rounded-xl border-none outline-none font-bold" />
            </div>
            <div className="w-40 space-y-2">
              <label className="text-xs font-black uppercase tracking-widest">Competitor</label>
              <select value={newReq.competitor} onChange={e => setNewReq({...newReq, competitor: e.target.value})} className="w-full p-3 rounded-xl border-none outline-none font-bold">
                <option>iFood</option><option>KeeTa</option>
              </select>
            </div>
            <button onClick={handleCreateRequest} className="bg-[#333] text-white px-8 py-3 h-[48px] rounded-xl font-black uppercase tracking-wider hover:bg-black">Dispatch</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* 左侧：任务列表 */}
          <div className="space-y-4">
            {requests.map(req => (
              <div 
                key={req.id} 
                onClick={() => { setSelectedReq(req); setAiResult(''); setFile(null); }}
                className={`bg-white rounded-[24px] p-6 cursor-pointer border-2 transition-all ${selectedReq?.id === req.id ? 'border-[#FFD111] shadow-md scale-[1.02]' : 'border-transparent shadow-sm hover:border-gray-200'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-[#333]">{req.title}</h3>
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${req.status === 'Fulfilled' ? 'bg-green-100 text-green-700' : 'bg-[#FFD111] text-[#333]'}`}>
                    {req.status}
                  </span>
                </div>
                <p className="text-gray-400 text-sm font-medium mb-4">{req.description}</p>
                <div className="flex gap-4 text-xs font-bold text-gray-400">
                  <span className="flex items-center gap-1"><Target size={14} /> {req.competitor}</span>
                  <span className="flex items-center gap-1"><MapPin size={14} /> {req.city}</span>
                </div>
              </div>
            ))}
            {requests.length === 0 && <p className="text-gray-400 font-bold p-4 text-center">No active requests.</p>}
          </div>

          {/* 右侧：任务详情与上传区 */}
          {selectedReq ? (
            <div className="bg-[#333] rounded-[32px] p-8 shadow-xl text-white sticky top-8">
              <div className="mb-8 border-b border-white/10 pb-6">
                 <h4 className="text-[#FFD111] font-black text-xs uppercase tracking-widest mb-2">Selected Mission</h4>
                 <h2 className="text-2xl font-bold">{selectedReq.title}</h2>
              </div>

              {selectedReq.status === 'Fulfilled' && !aiResult ? (
                 <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-[24px] flex items-center gap-4">
                   <CheckCircle2 size={32} className="text-green-400" />
                   <div>
                     <h3 className="font-bold text-green-400">Mission Accomplished</h3>
                     <p className="text-sm text-green-400/80">Intel has been uploaded and stored in the Hub.</p>
                   </div>
                 </div>
              ) : (
                <div className="space-y-6">
                  {/* 直接复用 Field Intel 概念的上传框 */}
                  <div className={`relative border-2 border-dashed rounded-[24px] p-10 transition-colors text-center ${file ? 'border-[#FFD111] bg-[#FFD111]/10' : 'border-gray-500 bg-white/5 hover:border-gray-400'}`}>
                    <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    {file ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle2 className="text-[#FFD111] mb-2" size={32} />
                        <span className="font-bold text-white">{file.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <UploadCloud size={32} className="mb-2" />
                        <span className="font-bold">Drop target intel screenshot here</span>
                      </div>
                    )}
                  </div>

                  <button onClick={handleUploadForRequest} disabled={isUploading || !file} className={`w-full py-4 rounded-[20px] font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 ${isUploading || !file ? 'bg-white/10 text-gray-500' : 'bg-[#FFD111] text-[#333] hover:shadow-[0_0_20px_rgba(255,209,17,0.4)]'}`}>
                    {isUploading ? 'Extracting via DeepSeek...' : <><Zap size={18} /> Fulfill & Analyze</>}
                  </button>
                  
                  {/* AI 结果区 */}
                  {aiResult && (
                    <div className="mt-6 bg-white/10 p-6 rounded-3xl space-y-3 backdrop-blur-md border border-white/10">
                      <h4 className="text-[#FFD111] font-bold text-xs uppercase tracking-widest">AI Strategy Extracted</h4>
                      <p className="text-gray-200 leading-relaxed font-medium text-sm">{aiResult}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-[32px] border-4 border-dashed border-gray-100 h-64 flex flex-col items-center justify-center text-gray-300 font-bold uppercase tracking-widest">
              Select a mission to upload intel
            </div>
          )}

        </div>
      </div>
    </div>
  )
}