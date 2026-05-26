'use client'

import { useState } from 'react'
import { UploadCloud, Zap, Target, MapPin, CheckCircle2, Layers, Tag, Eye } from 'lucide-react'

export default function FieldIntelPage() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [aiResult, setAiResult] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: '',
    competitorId: '1',
    city: 'São Paulo',
    screenType: 'Checkout Page',
    userProfile: 'New User',
    tags: '',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return alert('Por favor, faça o upload de uma captura de tela primeiro! / Please upload a screenshot first!')
    
    setIsUploading(true)
    setAiResult(null)

    const data = new FormData()
    data.append('files', file)
    Object.entries(formData).forEach(([key, value]) => data.append(key, value))

    try {
      const res = await fetch('/api/field-intel', { method: 'POST', body: data })
      const result = await res.json()
      
      if (result.success) {
        setAiResult(result.data)
        setFile(null)
      } else {
        alert('Upload falhou / Upload failed: ' + result.error)
      }
    } catch (err) {
      alert('Erro de rede / Network error.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* 顶部控制台标题 */}
        <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6 border border-gray-100">
          <div className="bg-[#333] p-3.5 rounded-[18px] md:rounded-[24px] shadow-lg text-[#FFD111]">
             <Target size={28} className="md:w-8 md:h-8" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-[#333] tracking-tight">Field Intel AI Extraction</h2>
            <p className="text-gray-400 font-medium text-xs md:text-sm mt-0.5">
              上传前线竞品截图，由 AI 战略引擎秒级反推商业策略 / Upload competitor screenshots for real-time AI strategic analysis.
            </p>
          </div>
        </div>

        {/* 主体响应式布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          
          {/* 左侧：情报提交表单 */}
          <form onSubmit={handleSubmit} className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100 space-y-5 md:space-y-6">
            
            {/* 图床拖拽上传区 */}
            <div className={`relative border-2 border-dashed rounded-[20px] p-8 text-center transition-all ${file ? 'border-[#FFD111] bg-[#FFD111]/5' : 'border-gray-300 hover:border-[#FFD111] bg-gray-50'}`}>
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
              {file ? (
                <div className="flex flex-col items-center">
                  <CheckCircle2 className="text-[#FFD111] mb-2" size={32} />
                  <span className="font-bold text-sm text-[#333] max-w-xs truncate">{file.name}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <UploadCloud size={32} className="mb-2" />
                  <span className="font-bold text-sm">点击或拖拽上传竞品活动截图 / Click or drag to upload competitor screenshot</span>
                </div>
              )}
            </div>

            {/* 高颗粒度业务指标参数输入 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-1.5 sm:col-span-2">
                 <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1"><Tag size={12}/> Intel Title / 情报标题</label>
                 <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-50 p-3.5 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#FFD111] text-[#333]" placeholder="e.g. iFood Delivery Subsidy for Churned Users" />
               </div>
               
               <div className="space-y-1.5">
                 <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1"><Target size={12}/> Target Competitor / 目标竞品</label>
                 <select value={formData.competitorId} onChange={e => setFormData({...formData, competitorId: e.target.value})} className="w-full bg-gray-50 p-3.5 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#FFD111] text-[#333]">
                   <option value="1">KeeTa (Yellow)</option>
                   <option value="2">iFood (Red)</option>
                 </select>
               </div>
               
               <div className="space-y-1.5">
                 <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1"><MapPin size={12}/> City / 采集城市</label>
                 <input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-gray-50 p-3.5 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#FFD111] text-[#333]" />
               </div>
               
               <div className="space-y-1.5">
                 <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1"><Eye size={12}/> Touchpoint / 触达场景</label>
                 <select value={formData.screenType} onChange={e => setFormData({...formData, screenType: e.target.value})} className="w-full bg-gray-50 p-3.5 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#FFD111] text-[#333]">
                   <option value="Homepage Banner">首页 Banner / Homepage Banner</option>
                   <option value="Checkout Page">结算页 / Checkout Page</option>
                   <option value="Cart Interaction">购物车交互 / Cart Interaction</option>
                   <option value="Push Notification">Push 强推通知 / Push Notification</option>
                   <option value="Restaurant Menu">商家点餐页 / Merchant Menu</option>
                 </select>
               </div>
               
               <div className="space-y-1.5">
                 <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1"><Layers size={12}/> Target Segment / 用户分层</label>
                 <select value={formData.userProfile} onChange={e => setFormData({...formData, userProfile: e.target.value})} className="w-full bg-gray-50 p-3.5 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#FFD111] text-[#333]">
                   <option value="New User">新客 / New User</option>
                   <option value="1-2 Orders">1-2单早期留存客 / 1-2 Orders</option>
                   <option value="3-4 Orders">3-4单习惯养成客 / 3-4 Orders</option>
                   <option value="5+ Active">5+单核心高频客 / 5+ Active</option>
                   <option value="5+ Churned">5+单流失沉默客 / 5+ Churned</option>
                   <option value="Universal">大盘普惠用户 / Universal</option>
                 </select>
               </div>
               
               <div className="space-y-1.5 sm:col-span-2">
                 <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Strategy Tags / 策略标签 (Comma Separated)</label>
                 <input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="e.g. Free Delivery, Coupon Pack" className="w-full bg-gray-50 p-3.5 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#FFD111] text-[#333]" />
               </div>
               
               <div className="space-y-1.5 sm:col-span-2">
                 <label className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Field Operational Notes / 现场备注</label>
                 <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={3} className="w-full bg-gray-50 p-3.5 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-[#FFD111] text-[#333]" placeholder="补充前线观察到的其他动态... / Add any additional field notes..." />
               </div>
            </div>

            <button type="submit" disabled={isUploading} className={`w-full py-4.5 rounded-[18px] font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 ${isUploading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#333] text-[#FFD111] hover:bg-black hover:shadow-xl hover:-translate-y-0.5'}`}>
              {isUploading ? '正在调用 AI 视觉战略引擎... / Accessing AI Strategic Engine...' : <><Zap size={16} /> 提交并激发 AI 战略解析 / Submit & Analyze</>}
            </button>
          </form>

          {/* 右侧：AI 中文长报告深度控制台 */}
          <div className="bg-[#333] rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-xl text-white flex flex-col min-h-[400px]">
            <h4 className="text-[#FFD111] font-black text-xs uppercase tracking-[0.2em] mb-6 border-b border-white/10 pb-4 flex items-center justify-between">
              <span>AI Vision Strategic Engine v2.0</span>
              <span className="bg-white/10 text-gray-300 px-2 py-0.5 rounded text-[9px] tracking-normal font-mono">NODE: COGNITIVE-V3</span>
            </h4>
            
            {aiResult ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1 flex flex-col justify-between">
                <div className="bg-white/5 p-5 md:p-6 rounded-2xl border border-white/5">
                  
                  {/* 高级中文 Markdown 解析渲染器核心 */}
                  <div className="text-sm md:text-base leading-relaxed font-medium text-gray-100 whitespace-pre-wrap space-y-4">
                    {aiResult.ai_summary.split('\n').map((line: string, i: number) => {
                      if (line.startsWith('###')) {
                        return (
                          <h4 key={i} className="text-[#FFD111] font-black text-base md:text-lg mt-6 mb-2 first:mt-0 tracking-wide border-b border-[#FFD111]/10 pb-1 flex items-center gap-2">
                            {line.replace('###', '').trim()}
                          </h4>
                        )
                      }
                      
                      if (line.trim().startsWith('*')) {
                        const cleanLine = line.trim().replace('*', '').trim()
                        const parts = cleanLine.split('**')
                        return (
                          <div key={i} className="pl-4 border-l-2 border-[#FFD111]/30 my-2.5 text-gray-200 text-xs md:text-sm leading-relaxed">
                            {parts.map((part, index) => 
                              index % 2 === 1 ? <strong key={index} className="text-[#FFD111] font-bold">{part}</strong> : part
                            )}
                          </div>
                        )
                      }
                      
                      if (line.trim() === '') return <div key={i} className="h-1" />
                      return <p key={i} className="text-gray-300 text-xs md:text-sm">{line}</p>
                    })}
                  </div>
                </div>

                {/* 数据双写同步凭证区 */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[10px] font-bold text-gray-400 bg-black/20 p-4 rounded-xl gap-2 mt-4">
                  <span>INTEL REGISTRY ID: {aiResult.id}</span>
                  <span className="text-green-400 flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded-md">
                    <CheckCircle2 size={12}/> METADATA SYNCED TO HUB & MATERIALS
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 py-16">
                <Zap size={40} className="mb-3 text-gray-500 animate-pulse" />
                <p className="font-bold uppercase tracking-widest text-xs md:text-sm">等待左侧前线情报输入... / Awaiting Field Input...</p>
                <p className="text-[11px] text-gray-500 normal-case mt-1 max-w-xs">
                  数据提交后，全量表单特征和截图将被输入神经网络，生成商业破局反制推导。 / Context will be processed via Neural Networks to derive offensive/defensive strategy options.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}