'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  ClipboardList, 
  UploadCloud, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  Image as ImageIcon, 
  X, 
  ArrowLeft,
  MapPin,
  Layers
} from 'lucide-react'

export default function RequestDetail() {
  const { id } = useParams()
  const router = useRouter()
  
  const [request, setRequest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // 🚀 批量上传状态管理
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [notes, setNotes] = useState('')

  // 获取总部需求的元数据上下文
  useEffect(() => {
    async function fetchRequest() {
      try {
        const { data, error } = await supabase
          .from('requests')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        setRequest(data)
      } catch (err) {
        console.error('Error fetching request:', err)
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchRequest()
  }, [id])

  // 处理多图/批量选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      
      // 合并到已有选择中
      setSelectedFiles(prev => [...prev, ...filesArray])
      
      // 生成预览 URL
      const urlsArray = filesArray.map(file => URL.createObjectURL(file))
      setPreviews(prev => [...prev, ...urlsArray])
    }
  }

  // 移除某一张已选图片
  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  // 🚀 核心逻辑：批量原子化提报
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedFiles.length === 0) {
      setStatus({ type: 'error', msg: 'Por favor, selecione pelo menos uma imagem. / 请至少选择一张截图进行回传。' })
      return
    }

    setIsSubmitting(true)
    setStatus(null)

    try {
      // 循环多图，利用 Promise.all 并发或串行轰炸后端 API 实现批量处理
      let successCount = 0
      
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const formData = new FormData()
        
        // 自动继承总部的需求上下文，作为标签无缝砸向后端 API
        formData.append('files', file)
        formData.append('title', `[Response] ${request.title} (Batch-${i + 1})`)
        formData.append('competitorId', request.competitor === 'iFood' ? '2' : '1')
        formData.append('city', 'São Paulo (SP)') // 默认圣保罗核心商圈
        formData.append('screenType', 'Checkout Paywall / 结算拦截页') // 根据会员开通判定触达场景
        formData.append('userProfile', request.segment || 'New User / 沉默新客')
        formData.append('tags', 'Exclusive Lock / 排他性供给')
        formData.append('notes', `针对总部指令ID-${id}的回传。前线手记: ${notes}`)

        const res = await fetch('/api/field-intel', {
          method: 'POST',
          body: formData,
        })

        if (res.ok) successCount++
      }

      if (successCount === selectedFiles.length) {
        // 更新总部指令的状态为 Completed
        await supabase
          .from('requests')
          .update({ status: 'Completed' })
          .eq('id', id)

        setStatus({ 
          type: 'success', 
          msg: `Batch operational! 成功批量提报 ${successCount} 张视觉资产，已触发多模态 Vision 引擎执行深度像素审计！` 
        })
        setSelectedFiles([])
        setPreviews([])
        setNotes('')
        
        // 延迟刷新数据
        setTimeout(() => router.refresh(), 2000)
      } else {
        throw new Error(`部分图片提报失败，成功率: ${successCount}/${selectedFiles.length}`)
      }

    } catch (err: any) {
      console.error(err)
      setStatus({ type: 'error', msg: `Batch ingestion failure: ${err.message}` })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <Loader2 className="animate-spin text-[#333]" size={40} />
      </div>
    )
  }

  if (!request) {
    return (
      <div className="p-8 text-center font-bold text-gray-500">
        Mission instruction context not found. 指令上下文未找到。
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* 返回上级看板 */}
        <button 
          onClick={() => router.push('/requests')}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#333] transition-colors"
        >
          <ArrowLeft size={16} /> Back to Brief Board / 返回指令大盘
        </button>

        {/* 1. 总部下发需求的详情卡片 (完全对应你上传的截图视觉) */}
        <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-50 pb-6">
            <div className="space-y-1">
              <h1 className="text-xl md:text-2xl font-black text-[#333] tracking-tight">{request.title}</h1>
              <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                <span className="flex items-center gap-1"><MapPin size={12}/> {request.competitor || 'iFood'}</span>
                <span className="flex items-center gap-1"><Layers size={12}/> {request.segment || 'New User'}</span>
              </div>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border self-start md:self-auto ${
              request.status === 'Active' 
                ? 'bg-green-50 border-green-200 text-green-600' 
                : 'bg-gray-100 border-gray-200 text-gray-500'
            }`}>
              ● {request.status === 'Active' ? 'ACTIVE / 推进中' : 'COMPLETED / 已闭环'}
            </div>
          </div>

          <div className="bg-gray-50/70 rounded-2xl p-5 border border-gray-100">
            <p className="text-[#333] text-sm font-bold leading-relaxed whitespace-pre-wrap">
              {request.description}
            </p>
          </div>

          {request.url && (
            <div className="space-y-2">
              <p className="text-xs font-black text-gray-400 uppercase tracking-wider">总部参考示意图</p>
              <div className="flex gap-3 overflow-x-auto pb-2">
                <img src={request.url} alt="Reference" className="h-40 object-contain rounded-xl border border-gray-100" />
              </div>
            </div>
          )}
        </div>

        {/* 2. 🚀 强硬补齐：前线多图批量回传交工作单区域 */}
        <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
          <div>
            <h3 className="text-lg font-black text-[#333] uppercase italic flex items-center gap-2">
              <UploadCloud className="text-[#FFD111]" size={22} /> Frontline Mission Response / 前线批量提报
            </h3>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              针对该单指令批量回传前线盲测截图，数据将绕过 RLS 安全通道直供 Vision 多模态微调引擎
            </p>
          </div>

          {status && (
            <div className={`p-4 rounded-2xl border text-xs md:text-sm font-bold flex items-center gap-3 ${
              status.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {status.type === 'success' ? <CheckCircle2 size={18}/> : <AlertTriangle size={18}/>}
              {status.msg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 批量上传框组件 (关键：具有 multiple 属性) */}
            <div className="border-2 border-dashed border-gray-200 rounded-[24px] bg-gray-50/30 hover:bg-gray-50 transition-colors p-6 relative flex flex-col items-center justify-center text-center min-h-[160px] group">
              <input 
                type="file" 
                accept="image/*" 
                multiple  // <-- 🚀 开启浏览器级别的按住 Shift/Cmd 多选批量支持
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <ImageIcon size={32} className="text-gray-300 group-hover:text-[#FFD111] transition-colors mb-2" />
              <p className="text-xs font-bold text-gray-600">点击或将多张截图拖拽到此处</p>
              <p className="text-[10px] text-gray-400 font-medium mt-0.5">支持按住 Shift 键一次性选中并批量回传多张公域截图</p>
            </div>

            {/* 批量多图预览网格 */}
            {previews.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-wider">
                  已选择待提报资产 ({selectedFiles.length}张)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  {previews.map((url, index) => (
                    <div key={index} className="relative aspect-[3/4] bg-white rounded-xl border border-gray-200 p-1 group overflow-hidden shadow-sm">
                      <img src={url} alt="Upload Grid" className="w-full h-full object-contain rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600 transition-colors z-20"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">前线实测手记备注 (选填)</label>
              <textarea 
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="在此录入该商圈或具体品类的附加突发情况描述..." 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#333] resize-none text-[#333]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || selectedFiles.length === 0}
              className="w-full bg-[#333] text-[#FFD111] py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 disabled:opacity-40 shadow-lg"
            >
              {isSubmitting ? (
                <><Loader2 size={14} className="animate-spin" /> Batch Processing Pipeline... ({selectedFiles.length} 张解算中)</>
              ) : (
                `Deploy Ingestion / 针对此指令执行批量回传`
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}