'use client'

import { useState } from 'react'
import { UploadCloud, Loader2, CheckCircle2, AlertTriangle, Layers, Smartphone, Tag, Bookmark, MapPin } from 'lucide-react'

export default function UploadMaterial() {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [titel, setTitel] = useState('')
  const [notizen, setNotizen] = useState('')
  
  // 结构化运营勾选状态
  const [userProfile, setUserProfile] = useState('New User / 沉默新客')
  const [screenType, setScreenType] = useState('Homepage Banner / 首页大图')
  const [selectedTag, setSelectedTag] = useState('Campaign / 破局大促')
  const [competitorId, setCompetitorId] = useState('1') // 1: KeeTa, 2: iFood
  const [city, setCity] = useState('São Paulo (SP)')

  const [isUploading, setIsUploading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !titel.trim()) {
      setStatus({ type: 'error', msg: 'Por favor, preencha o título e selecione uma imagem. / 请填写标题并选择图片。' })
      return
    }

    setIsUploading(true)
    setStatus(null)

    // 🚀 核心改变：将所有结构化数据打入 FormData，打包空投给后端 API
    const formData = new FormData()
    formData.append('files', file)
    formData.append('title', titel.trim())
    formData.append('competitorId', competitorId)
    formData.append('city', city)
    formData.append('screenType', screenType)
    formData.append('userProfile', userProfile)
    formData.append('tags', selectedTag)
    formData.append('notes', notizen.trim())

    try {
      // 呼叫跑在后端的安全情报审计网关，彻底降维打击 RLS 限制
      const res = await fetch('/api/field-intel', {
        method: 'POST',
        body: formData,
      })

      const result = await res.json()

      if (!res.ok || result.error) {
        throw new Error(result.error || 'Server ingestion rejected.')
      }

      setStatus({ type: 'success', msg: 'Asset route secure! AI Multi-modal parsing complete and saved to Library! / 提报成功！已通过后端安全网关触发多模态像素识图并沉淀至图库！' })
      
      // 清空表单
      setFile(null)
      setPreviewUrl(null)
      setTitel('')
      setNotizen('')
    } catch (err: any) {
      console.error(err)
      setStatus({ type: 'error', msg: `Ingestion Failed: ${err.message || err}` })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-[32px] p-6 md:p-10 shadow-sm border border-gray-100 space-y-8">
        
        {/* Header */}
        <div className="border-b border-gray-100 pb-6">
          <h2 className="text-2xl md:text-3xl font-black text-[#333] tracking-tight uppercase italic flex items-center gap-3">
            <UploadCloud className="text-[#FFD111]" size={32} /> Ingest New Material
          </h2>
          <p className="text-gray-400 font-medium text-xs md:text-sm mt-1">
            通过后端的越障安全管线（Bypassed Secure Pipeline）提报高时效情报，激活多模态像素审计
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

        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* 左侧：图片拖拽上传与预览 */}
          <div className="space-y-4">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider">Step 1: Visual Asset Source</label>
            <div className="border-2 border-dashed border-gray-200 rounded-[24px] h-72 relative flex flex-col items-center justify-center p-4 bg-gray-50/50 hover:bg-gray-50 transition-colors group overflow-hidden">
              {previewUrl ? (
                <>
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-xl" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-xs font-bold bg-black/60 px-3 py-1.5 rounded-xl">点击更换图片</p>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-2">
                  <UploadCloud size={40} className="text-gray-300 mx-auto group-hover:text-[#FFD111] transition-colors" />
                  <p className="text-xs font-bold text-gray-500">拖拽或点击上传竞品高清截图</p>
                  <p className="text-[10px] text-gray-400 font-medium">Supports PNG, JPG up to 10MB</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
          </div>

          {/* 右侧：运营结构化勾选维度 */}
          <div className="space-y-5">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider">Step 2: Strategy Manifest Calibration</label>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 flex items-center gap-1"><Bookmark size={12}/> 战术情报简短标题 *</label>
              <input 
                required
                type="text" value={titel} onChange={(e) => setTitel(e.target.value)}
                placeholder="例如: iFood 圣保罗核心区周末运费降击" 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-[#333] text-[#333]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">归属竞品</label>
                <select value={competitorId} onChange={(e) => setCompetitorId(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-[#333]">
                  <option value="1">KeeTa (Yellow)</option>
                  <option value="2">iFood (Red)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 flex items-center gap-1"><MapPin size={12}/> 目标城市</label>
                <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-[#333]">
                  <option value="São Paulo (SP)">São Paulo (SP)</option>
                  <option value="Rio de Janeiro (RJ)">Rio de Janeiro (RJ)</option>
                  <option value="Belo Horizonte (BH)">Belo Horizonte (BH)</option>
                </select>
              </div>
            </div>

            {/* 勾选器 1：用户分层 */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 flex items-center gap-1"><Layers size={12}/> 目标用户分层 (User Profile)</label>
              <select 
                value={userProfile} onChange={(e) => setUserProfile(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-[#333]"
              >
                <option value="New User / 沉默新客">New User / 沉默新客</option>
                <option value="High-Frequency / 高频核心客">High-Frequency / 高频核心客</option>
                <option value="Churned Risk / 流失倾向客">Churned Risk / 流失倾向客</option>
                <option value="KA Merchant Exclusive / 品牌专享客">KA Merchant Exclusive / 品牌专享客</option>
              </select>
            </div>

            {/* 勾选器 2：页面触达场景 */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 flex items-center gap-1"><Smartphone size={12}/> 触达场景屏效 (Screen Type)</label>
              <select 
                value={screenType} onChange={(e) => setScreenType(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-[#333]"
              >
                <option value="Homepage Banner / 首页大图">Homepage Banner / 首页大图</option>
                <option value="Checkout Paywall / 结算拦截页">Checkout Paywall / 结算拦截页</option>
                <option value="Store Front / 店铺首屏">Store Front / 店铺首屏</option>
                <option value="Push Notification / 系统强推弹窗">Push Notification / 系统强推弹窗</option>
              </select>
            </div>

            {/* 勾选器 3：核心策略标签 */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 flex items-center gap-1"><Tag size={12}/> 核心竞争策略 (Tags)</label>
              <select 
                value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-[#333]"
              >
                <option value="Campaign / 破局大促">Campaign / 破局大促</option>
                <option value="Taxa Grátis / 免运费阻击">Taxa Grátis / 免运费阻击</option>
                <option value="Exclusive Lock / 排他性供给">Exclusive Lock / 排他性供给</option>
                <option value="AOV Steer / 客单价调节杠杆">AOV Steer / 客单价调节杠杆</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500">前线手记 / 附加备注 (Optional)</label>
              <textarea 
                rows={2} value={notizen} onChange={(e) => setNotizen(e.target.value)}
                placeholder="录入前线观察到的突发细节..." 
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none resize-none text-[#333]"
              />
            </div>

            <button
              type="submit"
              disabled={isUploading || !file}
              className="w-full bg-[#333] text-[#FFD111] py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 disabled:opacity-40 shadow-lg"
            >
              {isUploading ? (
                <><Loader2 size={14} className="animate-spin" /> API Route Processing...</>
              ) : (
                'Confirm Ingestion / 通过安全网关提报'
              )}
            </button>

          </div>
        </form>

      </div>
    </div>
  )
}