'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Activity, Plus, Zap, Search, Trash2, Rss, Loader2, CheckCircle2 } from 'lucide-react'

export default function DataSourcesPage() {
  const [sources, setSources] = useState<any[]>([])
  const [keywords, setKeywords] = useState<any[]>([])
  
  // 表单状态
  const [formData, setFormData] = useState({ name: '', type: 'RSS Feed', url: '' })
  const [newKeyword, setNewKeyword] = useState('')
  
  // 交互状态
  const [isSaving, setIsSaving] = useState(false)
  const [isCrawling, setIsCrawling] = useState(false)
  const [crawlResult, setCrawlResult] = useState<string | null>(null)

  // 初始化加载真实数据
  useEffect(() => {
    fetchSources()
    fetchKeywords()
  }, [])

  const fetchSources = async () => {
    const { data } = await supabase.from('data_sources').select('*').order('created_at', { ascending: false })
    if (data) setSources(data)
  }

  const fetchKeywords = async () => {
    const { data } = await supabase.from('keywords').select('*').order('created_at', { ascending: false })
    if (data) setKeywords(data)
  }

  // 保存新的数据源
  const handleSaveSource = async () => {
    if (!formData.name || !formData.url) return
    setIsSaving(true)
    const { error } = await supabase.from('data_sources').insert([
      { name: formData.name, type: formData.type === 'RSS Feed' ? 'RSS' : 'API', url_or_config: formData.url, is_active: true }
    ])
    if (!error) {
      setFormData({ name: '', type: 'RSS Feed', url: '' })
      fetchSources()
    }
    setIsSaving(false)
  }

  // 保存新的监控关键词
  const handleAddKeyword = async (e: React.KeyboardEvent | React.MouseEvent) => {
    if (('key' in e && e.key !== 'Enter') || !newKeyword.trim()) return
    const { error } = await supabase.from('keywords').insert([{ word: newKeyword.trim() }])
    if (!error) {
      setNewKeyword('')
      fetchKeywords()
    }
  }

  // 真正触发刚才写好的爬虫接口
  const handleRunCrawler = async () => {
    setIsCrawling(true)
    setCrawlResult(null)
    try {
      const res = await fetch('/api/crawl')
      const data = await res.json()
      if (data.success) {
        setCrawlResult(`Success! Extracted ${data.newEntries} new insights.`)
      } else {
        setCrawlResult('Pipeline execution failed.')
      }
    } catch (err) {
      setCrawlResult('Network error during crawl.')
    }
    setIsCrawling(false)
    setTimeout(() => setCrawlResult(null), 5000)
  }

  // 删除数据源
  const handleDeleteSource = async (id: number) => {
    await supabase.from('data_sources').delete().eq('id', id)
    fetchSources()
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 头部标题区 */}
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-[#FFD111] p-3 rounded-2xl shadow-sm">
            <Activity size={28} className="text-[#333]" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#333] tracking-tight">Intelligence Pipelines</h1>
            <p className="text-gray-400 font-medium">Manage automated RSS feeds, IMAP scrapers, and monitor keywords.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 左侧：数据源管理 */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 新建源表单 */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
              <h3 className="text-lg font-black text-[#333] flex items-center gap-2 mb-6">
                <Rss size={20} className="text-[#FFD111]" /> Add New Source
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Source Name</label>
                    <input 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. iFood Tech Blog" 
                      className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#FFD111] outline-none font-bold text-[#333] transition-all" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Protocol Type</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#FFD111] outline-none font-bold text-[#333] transition-all"
                    >
                      <option>RSS Feed</option>
                      <option>REST API</option>
                    </select>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Target URL / Config</label>
                  <input 
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    placeholder="https://..." 
                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-[#FFD111] outline-none font-medium text-[#333] transition-all" 
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button onClick={() => setFormData({ name: '', type: 'RSS Feed', url: '' })} className="px-8 py-4 rounded-[20px] font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                    Clear
                  </button>
                  <button 
                    onClick={handleSaveSource}
                    disabled={isSaving || !formData.name || !formData.url}
                    className="px-8 py-4 rounded-[20px] font-black bg-[#333] text-white hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                    Save Pipeline
                  </button>
                </div>
              </div>
            </div>

            {/* 真实数据源列表 */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 px-2">Active Pipelines ({sources.length})</h4>
              {sources.map((source) => (
                <div key={source.id} className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-50 flex items-center justify-between group hover:border-[#FFD111] transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${source.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <div>
                      <h5 className="font-bold text-[#333]">{source.name}</h5>
                      <p className="text-xs text-gray-400 font-mono mt-1">{source.url_or_config}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-[#FFD111] bg-[#333] px-2 py-1 rounded-md uppercase tracking-wider">{source.type}</span>
                    <button onClick={() => handleDeleteSource(source.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* 右侧：操作区 */}
          <div className="space-y-6">
            
            {/* 真实执行爬虫按钮 */}
            <div className="bg-[#222] rounded-[32px] p-8 shadow-xl text-white relative overflow-hidden">
              <div className="absolute top-[-30px] right-[-30px] opacity-5">
                <Zap size={200} />
              </div>
              <h3 className="text-xl font-black mb-2 flex items-center gap-2">
                <Zap size={24} className="text-[#FFD111]" /> Manual Override
              </h3>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                Force execute all active pipelines and scrape new intelligence data from Brazil market immediately.
              </p>
              <button 
                onClick={handleRunCrawler}
                disabled={isCrawling}
                className="w-full bg-[#FFD111] text-[#333] py-5 rounded-[20px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
              >
                {isCrawling ? (
                  <><Loader2 size={20} className="animate-spin" /> Executing...</>
                ) : (
                  'Run Crawler Now'
                )}
              </button>
              
              {crawlResult && (
                <div className="mt-4 p-4 bg-white/10 rounded-2xl flex items-center gap-2 text-sm font-bold text-[#FFD111]">
                  <CheckCircle2 size={16} /> {crawlResult}
                </div>
              )}
            </div>

            {/* 真实关键词管理 */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-[#333] flex items-center gap-2">
                  <Search size={20} className="text-gray-400" /> Keywords
                </h3>
              </div>
              
              <div className="space-y-4">
                <input 
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={handleAddKeyword}
                  placeholder="Type & press Enter..."
                  className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-gray-300 outline-none font-bold text-[#333]"
                />
                <div className="flex flex-wrap gap-2 pt-2">
                  {keywords.map(kw => (
                     <span key={kw.id} className="bg-[#F8F9FA] border border-gray-200 text-[#333] px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 group cursor-default hover:border-[#FFD111] transition-colors">
                       {kw.word}
                     </span>
                  ))}
                  {keywords.length === 0 && <span className="text-xs text-gray-400 font-bold">No keywords added yet.</span>}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}