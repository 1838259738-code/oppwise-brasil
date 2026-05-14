'use client'

import { useState } from 'react'
import { UploadCloud, Database } from 'lucide-react'

export default function UploadMaterial() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    competitor: 'KeeTa (Yellow)',
    title: '',
    userSegment: 'New User',
    assetType: 'Welcome Coupon Pack'
  })

  const handleSubmit = async () => {
    if (!file) return alert('Please select a file first.')
    if (!formData.title) return alert('Please enter a title.')
    
    setIsUploading(true)

    const data = new FormData()
    data.append('files', file)
    // 根据下拉框选择映射真实的竞争对手 ID
    data.append('wettbewerberId', formData.competitor.includes('KeeTa') ? '1' : '2')
    // 将标题、用户分层和类型组合，保留更多上下文供 Intelligence Hub 展示
    const enrichedTitle = `[${formData.userSegment}] ${formData.title}`
    data.append('titel', enrichedTitle)
    data.append('beschreibung', `Type: ${formData.assetType} | Segment: ${formData.userSegment}`)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data
      })
      const result = await res.json()
      
      if (result.success) {
        alert('Asset synced to database successfully!')
        setFile(null)
        setFormData({ ...formData, title: '' }) // 清空标题，保留常用选项
      } else {
        alert('Upload failed: ' + result.error)
      }
    } catch (err) {
      alert('Network error. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F6F8] p-10 flex flex-col items-center justify-center">
      
      {/* 顶部标题区 */}
      <div className="w-full max-w-4xl mb-8 flex flex-col">
        <div className="w-2 h-16 bg-[#EA4335] mb-4"></div>
        <h1 className="text-5xl font-black italic text-[#333] tracking-tighter">INTELLIGENCE INGEST</h1>
        <p className="text-gray-500 font-bold tracking-widest uppercase mt-2 text-sm">Operatix-B / Brazil Market</p>
      </div>

      {/* 核心表单卡片 */}
      <div className="w-full max-w-4xl bg-white p-12 rounded-sm shadow-xl border border-gray-100">
        
        {/* 上传区域 */}
        <div className="mb-10">
          <label className="block text-sm font-black text-gray-400 tracking-widest uppercase mb-4">
            Intelligence Asset *
          </label>
          <div className="relative border-4 border-dashed border-[#FFD111] bg-yellow-50/30 rounded-xl h-64 flex flex-col items-center justify-center hover:bg-yellow-50 transition-colors">
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              accept="image/*"
            />
            <UploadCloud size={48} className="text-gray-400 mb-4" />
            <span className="text-gray-400 font-bold text-lg">
              {file ? file.name : 'Drag screenshot or click to browse'}
            </span>
            {file && <span className="text-[#FFD111] font-black uppercase text-sm mt-2">Ready to Sync</span>}
          </div>
        </div>

        {/* 字段输入区域 - 两行网格布局 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          
          {/* 第一行：竞品 & 标题 */}
          <div className="space-y-3">
            <label className="block text-sm font-black text-gray-400 tracking-widest uppercase">Target Competitor</label>
            <select 
              value={formData.competitor}
              onChange={(e) => setFormData({...formData, competitor: e.target.value})}
              className="w-full border-2 border-gray-100 p-5 rounded-none font-bold text-lg outline-none focus:border-[#333]"
            >
              <option>KeeTa (Yellow)</option>
              <option>iFood (Red)</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-black text-gray-400 tracking-widest uppercase">Intelligence Title</label>
            <input 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Campaign Banner BRL 15"
              className="w-full border-2 border-gray-100 p-5 rounded-none font-bold text-lg outline-none focus:border-[#333] text-gray-400"
            />
          </div>

          {/* 第二行：新增的用户分层 & 情报类型 */}
          <div className="space-y-3">
            <label className="block text-sm font-black text-gray-400 tracking-widest uppercase">Target Segment</label>
            <select 
              value={formData.userSegment}
              onChange={(e) => setFormData({...formData, userSegment: e.target.value})}
              className="w-full border-2 border-gray-100 p-5 rounded-none font-bold text-lg outline-none focus:border-[#333]"
            >
              <option value="New User">新客 (New User)</option>
              <option value="1-2 Orders">1-2单用户 (1-2 Orders)</option>
              <option value="3-4 Orders">3-4单用户 (3-4 Orders)</option>
              <option value="5+ Active">5+单活跃 (5+ Active)</option>
              <option value="5+ Churned">5+单沉默 (5+ Churned)</option>
              <option value="Universal">无差别普惠 (Universal)</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-black text-gray-400 tracking-widest uppercase">Asset Type</label>
            <select 
              value={formData.assetType}
              onChange={(e) => setFormData({...formData, assetType: e.target.value})}
              className="w-full border-2 border-gray-100 p-5 rounded-none font-bold text-lg outline-none focus:border-[#333]"
            >
              <option value="Welcome Coupon Pack">新客券包 (Welcome Pack)</option>
              <option value="General Voucher">常规优惠券 (General Voucher)</option>
              <option value="Campaign Event">大促/主题活动 (Campaign Event)</option>
              <option value="Delivery Subsidy">运费补贴 (Delivery Subsidy)</option>
              <option value="Homepage Pop-up">首页弹窗 (Homepage Pop-up)</option>
              <option value="Push Landing Page">定向召回落地页 (Push Landing)</option>
              <option value="VIP Pricing">会员专享价 (VIP Pricing)</option>
              <option value="Checkout Surcharge">结算页异常加价 (Checkout Surcharge)</option>
            </select>
          </div>
          
        </div>

        {/* 提交按钮 */}
        <button 
          onClick={handleSubmit}
          disabled={isUploading || !file}
          className={`w-full py-6 flex items-center justify-center gap-3 font-black italic tracking-widest text-2xl transition-all ${
            isUploading || !file 
              ? 'bg-[#E5E7EB] text-gray-400 cursor-not-allowed' 
              : 'bg-[#E5E7EB] text-[#A3A8B1] hover:bg-[#333] hover:text-white'
          }`}
        >
          <Database size={28} /> 
          {isUploading ? 'SYNCING...' : 'SYNC TO DATABASE'}
        </button>

      </div>
    </div>
  )
}