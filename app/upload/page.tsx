'use client'

import { useState } from 'react'
import { UploadCloud, CheckCircle2, Loader2, Tag, Layers, Zap, FolderPlus } from 'lucide-react'

export default function UploadMaterial() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    competitorId: '1', // 1: KeeTa, 2: iFood
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return alert('Por favor, selecione um arquivo! / 请先选择要上传的素材文件！')
    if (!formData.title) return alert('Por favor, insira o título! / 请输入素材标题！')

    setIsUploading(true)

    const data = new FormData()
    data.append('files', file)
    data.append('title', formData.title)
    data.append('competitorId', formData.competitorId)
    data.append('description', formData.description)

    try {
      // 呼叫后端的公共资产图床写入 API
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      })

      const result = await res.json()

      if (result.success) {
        alert('Material salvo com sucesso! / 核心竞品素材已成功同步双写至图库！')
        setFile(null)
        setFormData({ title: '', competitorId: '1', description: '' })
      } else {
        alert('Erro no upload / 上传失败: ' + result.error)
      }
    } catch (err) {
      alert('Erro de rede ao conectar com o servidor. / 网络连接异常。')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6 md:space-y-8">
        
        {/* 🚀 视觉重构：彻底替换掉原本难看的粗红线斜体 Intelligence Ingest */}
        <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 border border-gray-100">
          <div className="bg-[#333] p-3.5 rounded-[18px] md:rounded-[24px] shadow-lg text-[#FFD111]">
            <FolderPlus size={26} className="md:w-7 md:h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black text-[#333] tracking-tight">
                Upload Material
              </h2>
              <span className="text-gray-300 font-light text-lg">|</span>
              <span className="text-gray-500 font-bold text-sm md:text-base mt-0.5">
                原始素材入库
              </span>
            </div>
            <p className="text-gray-400 font-medium text-xs mt-1.5">
              前线地推高频提报专用通道 / Standardized Competitor Asset Ingestion Channel
            </p>
          </div>
        </div>

        {/* 素材提报核心表单 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
          
          {/* 拖拽上传槽 */}
          <div className={`relative border-2 border-dashed rounded-[20px] p-8 text-center transition-all ${file ? 'border-[#FFD111] bg-[#FFD111]/5' : 'border-gray-200 hover:border-[#FFD111] bg-gray-50'}`}>
            <input 
              type="file" 
              onChange={(e) => setFile(e.target.files?.[0] || null)} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              accept="image/*" 
            />
            {file ? (
              <div className="flex flex-col items-center">
                <CheckCircle2 className="text-[#FFD111] mb-2" size={32} />
                <span className="font-bold text-xs md:text-sm text-[#333] max-w-xs truncate">{file.name}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-gray-400 space-y-1">
                <UploadCloud size={30} />
                <span className="font-bold text-xs md:text-sm text-[#333]">点击或拖拽上传原始截图 / Drag files here to upload</span>
                <span className="text-[10px] text-gray-400">支持 PNG, JPG, JPEG 格式格式</span>
              </div>
            )}
          </div>

          {/* 业务元数据输入 */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1">
                <Tag size={12}/> Asset Title / 素材标题 *
              </label>
              <input 
                required 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                className="w-full bg-gray-50 p-3.5 rounded-xl font-bold text-xs md:text-sm outline-none focus:ring-2 focus:ring-[#FFD111] text-[#333]" 
                placeholder="e.g. iFood Checkout Banner Campanha de Maio" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1">
                <Layers size={12}/> Competitor Origin / 素材归属竞品 *
              </label>
              <select 
                value={formData.competitorId} 
                onChange={e => setFormData({...formData, competitorId: e.target.value})} 
                className="w-full bg-gray-50 p-3.5 rounded-xl font-bold text-xs md:text-sm outline-none focus:ring-2 focus:ring-[#FFD111] text-[#333]"
              >
                <option value="1">KeeTa (Yellow)</option>
                <option value="2">iFood (Red)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest">
                Contextual Description / 情报备注摘要
              </label>
              <textarea 
                rows={4} 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                placeholder="简要描述该素材捕获的商圈背景、对应力度或核心攻势特征... / Brief strategic briefing..." 
                className="w-full bg-gray-50 p-3.5 rounded-xl font-bold text-xs md:text-sm outline-none focus:ring-2 focus:ring-[#FFD111] text-[#333]" 
              />
            </div>
          </div>

          {/* 提报提交按键 */}
          <button 
            type="submit" 
            disabled={isUploading} 
            className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs md:text-sm transition-all flex items-center justify-center gap-2 ${
              isUploading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-[#333] text-[#FFD111] hover:bg-black hover:shadow-md'
            }`}
          >
            {isUploading ? (
              <><Loader2 size={16} className="animate-spin" /> Ingesting Asset Pipeline...</>
            ) : (
              <><Zap size={14} /> Commit to Intelligence Hub / 同步双写至资产库</>
            )}
          </button>

        </form>

      </div>
    </div>
  )
}