'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ClipboardList, Plus, Image as ImageIcon, CheckCircle2, Loader2, Calendar, Target, Layers, Trash2, HelpCircle } from 'lucide-react'

export default function OpsRequests() {
  // 状态机
  const [requests, setRequests] = useState<any[]>([])
  const [files, setFiles] = useState<File[]>([]) // 待上传文件队列
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    competitor: 'KeeTa',
    segment: 'New User',
    description: ''
  })

  // 1. 初始化拉取需求看板数据 / Fetch tasks manifestation
  const fetchRequests = async () => {
    setIsLoading(true)
    const { data } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setRequests(data)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  // 2. 批量处理文件选中 / Batch select files
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...selectedFiles])
    }
  }

  // 3. 移除队列中的某张特定图片 / Drop specific photo
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // 4. 核心：提报逻辑（已解除图片必填限制）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title) return alert('Por favor, insira o título! / 请输入任务标题！')

    setIsUploading(true)
    const uploadedUrls: string[] = []

    try {
      // 🚀 只有当用户确实附加了图片时，才执行 Storage 并发上传
      if (files.length > 0) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop()
          const fileName = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`
          const filePath = `requests/${fileName}`

          const arrayBuffer = await file.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)

          const { error: storageError } = await supabase.storage
            .from('intelligence')
            .upload(filePath, buffer, { contentType: file.type, upsert: true })

          if (storageError) throw new Error(`Storage error: ${storageError.message}`)

          const { data: { publicUrl } } = supabase.storage.from('intelligence').getPublicUrl(filePath)
          uploadedUrls.push(publicUrl)
        }
      }

      // 将多图 URL 数组拼接成字符串（若无图片则为空字符串）
      const finalUrlsString = uploadedUrls.length > 0 ? uploadedUrls.join(',') : ''

      // 写入到数据库 requests 表 / Push data payload to database
      const { error: dbError } = await supabase
        .from('requests')
        .insert([{
          title: formData.title,
          competitor: formData.competitor,
          segment: formData.segment,
          description: formData.description,
          url: finalUrlsString, // 存储选填的多图链接或空字符串
          status: 'Active',
          created_at: new Date().toISOString()
        }])

      if (dbError) throw dbError

      // 清空状态并刷新列表
      setFiles([])
      setFormData({ title: '', competitor: 'KeeTa', segment: 'New User', description: '' })
      alert('Missão de Inteligência enviada! / 情报战术指令下发成功！')
      await fetchRequests()

    } catch (err: any) {
      alert('Falha no upload / 提报失败: ' + (err.message || err))
    } finally {
      setIsUploading(false)
    }
  }

  // 辅助函数：解析多图字符串为数组
  const parseImages = (urlStr: string) => {
    if (!urlStr) return []
    return urlStr.split(',').filter(Boolean)
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-sm flex items-center gap-4 md:gap-6 border border-gray-100">
          <div className="bg-[#333] p-3.5 rounded-[18px] md:rounded-[24px] shadow-lg text-[#FFD111]">
            <ClipboardList size={28} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-[#333] tracking-tight">Ops Requests Centre</h2>
            <p className="text-gray-400 font-medium text-xs md:text-sm mt-0.5">
              前线战术攻防需求提报中心 / Batch Intel Mission Tasking
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
          
          {/* 左侧：提报控制面板 Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-1 bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100 space-y-5">
            <div className="border-b pb-3 border-gray-100">
              <h3 className="font-black text-sm text-[#333] uppercase tracking-wider">
                New Intel Task / 发起情报指令
              </h3>
              <p className="text-[10px] text-gray-400 font-bold mt-0.5">总部下发特定调研 Brief，前线同事跟进回传</p>
            </div>

            {/* 批量多图文件槽：已升级为 Optional / 选填 */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest flex items-center justify-between">
                <span className="flex items-center gap-1">Reference Images / 附带参考图 <span className="text-gray-400 normal-case font-normal">(Optional / 选填)</span></span>
                <span className="text-[#FFD111] bg-[#333] px-1.5 py-0.5 rounded text-[9px] font-mono">{files.length} IMG</span>
              </label>
              
              <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-[#FFD111] bg-gray-50/50 transition-colors">
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*"
                />
                <div className="flex flex-col items-center text-gray-400">
                  <ImageIcon size={22} className="mb-1" />
                  <span className="text-[11px] font-bold">可上传参考截图或留空 / Click to attach reference or leave empty</span>
                </div>
              </div>

              {/* 待上传队列网格 */}
              {files.length > 0 && (
                <div className="grid grid-cols-4 gap-2 pt-2 max-h-32 overflow-y-auto p-1 bg-gray-50 rounded-lg border border-gray-100">
                  {files.map((f, index) => (
                    <div key={index} className="relative aspect-square rounded-md bg-gray-200 overflow-hidden group border border-gray-300">
                      <img src={URL.createObjectURL(f)} alt="preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 基本业务字段 */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Mission Title / 任务标题 *</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Audit KeeTa World Cup campaign in SP" className="w-full bg-gray-50 p-3 rounded-xl font-bold text-xs border border-transparent focus:border-[#FFD111] outline-none text-[#333]" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Target Competitor / 目标竞品</label>
                  <select value={formData.competitor} onChange={e => setFormData({...formData, competitor: e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl font-bold text-xs outline-none text-[#333]">
                    <option value="KeeTa">KeeTa (Yellow)</option>
                    <option value="iFood">iFood (Red)</option>
                    <option value="Rappi">Rappi (Orange)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Segment / 目标客层</label>
                  <select value={formData.segment} onChange={e => setFormData({...formData, segment: e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl font-bold text-xs outline-none text-[#333]">
                    <option value="New User">新客 / New User</option>
                    <option value="High Frequency">高频客 / Core Active</option>
                    <option value="Churned Recovery">流失召回 / Churned</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Operational Briefing / 指令详情与要求 *</label>
                <textarea required rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="请清晰描述需要前线运营同事调研的竞品动态、商圈范围以及响应时效要求..." className="w-full bg-gray-50 p-3 rounded-xl font-bold text-xs border border-transparent focus:border-[#FFD111] outline-none text-[#333]" />
              </div>
            </div>

            <button type="submit" disabled={isUploading} className="w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all bg-[#333] text-[#FFD111] hover:bg-black disabled:opacity-50">
              {isUploading ? <><Loader2 size={14} className="animate-spin" /> Syncing Stack...</> : 'Deploy Mission / 下发情报指令'}
            </button>
          </form>

          {/* 右侧：看板 Feed */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-gray-200">
              <h3 className="font-black text-sm text-[#333] uppercase tracking-wider">
                Active Intel Missions / 任务进行中看板
              </h3>
              <span className="bg-[#333] text-white px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
                {requests.length} MISSIONS
              </span>
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-xs text-gray-400 font-bold uppercase">Loading dynamic Kanban...</div>
            ) : requests.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-xs text-gray-400 font-bold border">看板空空如也，请在左侧提报需求。</div>
            ) : (
              <div className="space-y-4">
                {requests.map((req) => {
                  const images = parseImages(req.url)
                  
                  return (
                    <div key={req.id} className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                      
                      {/* 卡片头部 */}
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div className="space-y-1">
                          <h4 className="font-black text-[#333] text-sm md:text-base">{req.title}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold">
                            <span className="flex items-center gap-1"><Target size={12}/>{req.competitor}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Layers size={12}/>{req.segment}</span>
                          </div>
                        </div>
                        <span className="bg-green-500/10 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-inner">
                          <CheckCircle2 size={12}/> Active / 推进中
                        </span>
                      </div>

                      {/* 描述文案 */}
                      {req.description && (
                        <p className="text-xs text-gray-500 font-medium leading-relaxed bg-gray-50/60 p-3 rounded-xl border border-gray-100/50">
                          {req.description}
                        </p>
                      )}

                      {/* 🚀 容错渲染：只有当数据库中确实存有图片链接时，才渲染图片网格墙，否则优雅地完全隐藏 */}
                      {images.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 pt-1">
                          {images.map((imgUrl, idx) => (
                            <a 
                              key={idx} 
                              href={imgUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 group shadow-sm hover:border-[#FFD111] transition-colors"
                            >
                              <img src={imgUrl} alt={`Intel link ${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[9px] font-mono transition-opacity">
                                VIEW
                              </div>
                            </a>
                          ))}
                        </div>
                      )}

                      {/* 卡片底部元数据 */}
                      <div className="flex items-center justify-between text-[9px] text-gray-400 font-mono font-bold pt-3 border-t border-gray-50">
                        <span className="flex items-center gap-1"><Calendar size={11}/> DEPLOYED: {new Date(req.created_at).toLocaleDateString()}</span>
                        <span className="text-gray-400 font-bold uppercase text-[8px] tracking-wider">
                          {images.length > 0 ? `ATTACHED: ${images.length} IMG` : 'TEXT BRIEF ONLY'}
                        </span>
                      </div>

                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}