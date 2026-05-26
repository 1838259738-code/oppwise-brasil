'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ClipboardList, Plus, Image as ImageIcon, CheckCircle2, Loader2, Calendar, Target, Layers, Trash2 } from 'lucide-react'

export default function OpsRequests() {
  // 状态机
  const [requests, setRequests] = useState<any[]>([])
  const [files, setFiles] = useState<File[]>([]) // 🚀 升级为文件数组，支持多图
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    competitor: 'KeeTa',
    segment: 'New User',
    description: ''
  })

  // 1. 初始化拉取需求看板数据
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

  // 2. 批量处理文件选中
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...selectedFiles]) // 追加文件
    }
  }

  // 3. 移除队列中的某张特定图片
  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // 4. 核心：批量双写提报逻辑
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (files.length === 0) return alert('Por favor, adicione pelo menos uma imagem! / 请至少上传一张情报图片！')
    if (!formData.title) return alert('Por favor, insira o título! / 请输入任务标题！')

    setIsUploading(true)
    const uploadedUrls: string[] = []

    try {
      // 🚀 循环并发上传多张图片到 Supabase Storage
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

      // 将多图 URL 数组通过逗号拼接成字符串，保持数据库平稳兼容
      const finalUrlsString = uploadedUrls.join(',')

      // 写入到数据库 requests 表
      const { error: dbError } = await supabase
        .from('requests')
        .insert([{
          title: formData.title,
          competitor: formData.competitor,
          segment: formData.segment,
          description: formData.description,
          url: finalUrlsString, // 存储多图链接串
          status: 'Active',
          created_at: new Date().toISOString()
        }])

      if (dbError) throw dbError

      // 清空状态并刷新列表
      setFiles([])
      setFormData({ title: '', competitor: 'KeeTa', segment: 'New User', description: '' })
      alert('Missão de Inteligência enviada! / 情报战术需求已批量提报成功！')
      await fetchRequests()

    } catch (err: any) {
      alert('Falha no upload / 提报失败: ' + (err.message || err))
    } finally {
      setIsUploading(false)
    }
  }

  // 💡 辅助函数：解析多图字符串为数组
  const parseImages = (urlStr: string) => {
    if (!urlStr) return []
    return urlStr.split(',').filter(Boolean)
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* Header Header */}
        <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-sm flex items-center gap-4 md:gap-6 border border-gray-100">
          <div className="bg-[#FFD111] p-3.5 rounded-[18px] md:rounded-[24px] shadow-inner text-[#333]">
            <ClipboardList size={28} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-[#333] tracking-tight">Ops Requests Centre</h2>
            <p className="text-gray-400 font-medium text-xs md:text-sm mt-0.5">
              前线战术攻防需求提报中心（支持多图批量双写）/ Batch Intel Mission Tasking
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
          
          {/* 左侧：批量提报控制面板 Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-1 bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100 space-y-5">
            <h3 className="font-black text-sm text-[#333] uppercase tracking-wider border-b pb-3 border-gray-100">
              New Intel Task / 新建情报指令
            </h3>

            {/* 批量多图文件槽 */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest flex items-center justify-between">
                <span>Attach Multi-Screenshots / 批量附加截图 *</span>
                <span className="text-[#FFD111] font-bold text-[10px]">{files.length} Selected</span>
              </label>
              
              <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-[#FFD111] bg-gray-50/50 transition-colors">
                <input 
                  type="file" 
                  multiple // 🚀 开启 HTML5 批量多选属性
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*"
                />
                <div className="flex flex-col items-center text-gray-400">
                  <ImageIcon size={24} className="mb-1" />
                  <span className="text-xs font-bold">点击或拖拽添加多张图片 (Multiple)</span>
                </div>
              </div>

              {/* 待上传的多图队列预览微型网格 */}
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

            {/* 基本字段组件 */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Mission Title / 任务标题</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Rappi World Cup Combo Pricing" className="w-full bg-gray-50 p-3 rounded-xl font-bold text-xs border border-transparent focus:border-[#FFD111] outline-none text-[#333]" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Competitor / 竞品</label>
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
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Operational Briefing / 需求详情与反制设想</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="输入所需的行动纲要..." className="w-full bg-gray-50 p-3 rounded-xl font-bold text-xs border border-transparent focus:border-[#FFD111] outline-none text-[#333]" />
              </div>
            </div>

            <button type="submit" disabled={isUploading || files.length === 0} className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${isUploading ? 'bg-gray-100 text-gray-400' : 'bg-[#333] text-[#FFD111] hover:bg-black'}`}>
              {isUploading ? <><Loader2 size={14} className="animate-spin" /> Syncing Stack...</> : 'Deploy Mission / 批量部署需求'}
            </button>
          </form>

          {/* 右侧：敏捷情报任务看板 (Kanban Active Feed) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-gray-200">
              <h3 className="font-black text-sm text-[#333] uppercase tracking-wider">
                Active Intel Missions / 实时进行中的情报作战卡片
              </h3>
              <span className="bg-[#333] text-white px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
                {requests.length} ASSETS
              </span>
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-xs text-gray-400 font-bold uppercase tracking-widest">Loading dynamic Kanban...</div>
            ) : requests.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-xs text-gray-400 font-bold border">看板空空如也，请在左侧批量提报。</div>
            ) : (
              <div className="space-y-4">
                {requests.map((req) => {
                  const images = parseImages(req.url) // 解析出图片列表
                  
                  return (
                    <div key={req.id} className="bg-white rounded-[20px] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                      
                      {/* 卡片头部特征标签 */}
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

                      {/* 🚀 核心看点：批量多图平铺展示墙 */}
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
                        <span className="text-[#333] bg-[#FFD111] px-2 py-0.5 rounded font-bold uppercase text-[8px] tracking-wider">
                          STACK COUNT: {images.length} IMG
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