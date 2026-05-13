'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Rss, Hash, Zap, Activity, CheckCircle2, XCircle, RefreshCw } from 'lucide-react'

export default function DatenquellenClient({ quellen, keywords }: { quellen: any[], keywords: any[] }) {
  const router = useRouter()
  const [showAddSource, setShowAddSource] = useState(false)
  const [showAddKeyword, setShowAddKeyword] = useState(false)
  const [isCrawling, setIsCrawling] = useState(false)

  const toggleSource = async (id: number, aktiv: boolean) => {
    await fetch('/api/data-sources', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, aktiv: !aktiv }),
    })
    router.refresh()
  }

  const addSource = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    await fetch('/api/data-sources', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(form)),
      headers: { 'Content-Type': 'application/json' },
    })
    router.refresh()
    setShowAddSource(false)
  }

  const addKeyword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    await fetch('/api/keywords', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(form)),
      headers: { 'Content-Type': 'application/json' },
    })
    router.refresh()
    setShowAddKeyword(false)
  }

  const handleCrawl = async () => {
    setIsCrawling(true)
    try {
      await fetch('/api/crawl', { method: 'POST' })
      alert('Crawler execution triggered successfully!')
    } catch (err) {
      alert('Crawler failed to start.')
    } finally {
      setIsCrawling(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* 头部区域 */}
      <div className="mb-10 flex items-center gap-4">
        <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-400/20">
          <Activity className="text-gray-900 w-6 h-6" />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Intelligence Pipelines</h2>
          <p className="text-gray-500 font-medium mt-1">Manage automated RSS feeds, IMAP scrapers, and monitor keywords.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 左侧：自动化数据源管理 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Rss className="text-yellow-500 w-5 h-5" /> Automated Sources
              </h3>
            </div>
            <button 
              onClick={() => setShowAddSource(!showAddSource)} 
              className="text-gray-900 bg-yellow-400 hover:bg-yellow-500 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-1"
            >
              <Plus size={16} /> New Source
            </button>
          </div>

          {showAddSource && (
            <form onSubmit={addSource} className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 space-y-4 animate-in fade-in slide-in-from-top-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Source Name</label>
                  <input name="name" placeholder="e.g. iFood Tech Blog" className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 bg-gray-50 outline-none focus:border-yellow-400 focus:bg-white transition-colors font-medium" required />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Protocol Type</label>
                  <select name="typ" className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 bg-gray-50 outline-none focus:border-yellow-400 focus:bg-white transition-colors font-medium cursor-pointer">
                    <option value="RSS">RSS Feed</option>
                    <option value="IMAP">IMAP Email</option>
                    <option value="Keyword">Keyword Alert</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Target URL / Config</label>
                <input name="urlOderConfig" placeholder="https://..." className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 bg-gray-50 outline-none focus:border-yellow-400 focus:bg-white transition-colors font-medium" required />
              </div>
              <div className="pt-2 flex gap-2">
                <button type="submit" className="flex-1 bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors">Save Pipeline</button>
                <button type="button" onClick={() => setShowAddSource(false)} className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {quellen.map(q => (
              <div key={q.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center hover:border-yellow-400 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${q.typ === 'RSS' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                    <Rss size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-gray-900 text-lg">{q.name}</span>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">{q.typ}</span>
                    </div>
                    <p className="text-sm text-gray-400 font-medium mt-0.5 truncate max-w-[300px] md:max-w-[400px]">{q.urlOderConfig}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSource(q.id, q.aktiv)}
                  className={`relative inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-bold transition-all ${q.aktiv ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                >
                  {q.aktiv ? (
                    <><CheckCircle2 size={16} className="mr-1.5" /> Active</>
                  ) : (
                    <><XCircle size={16} className="mr-1.5" /> Paused</>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧：关键词面板 & 触发中枢 */}
        <div className="space-y-8">
          
          {/* 强制抓取雷达面板 */}
          <div className="bg-gray-900 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl"></div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2 relative z-10">
              <Zap className="text-yellow-400 w-5 h-5 fill-yellow-400" /> Manual Override
            </h3>
            <p className="text-gray-400 text-sm mb-6 relative z-10">Force execute all active pipelines and scrape new data immediately.</p>
            
            <button
              onClick={handleCrawl}
              disabled={isCrawling}
              className="w-full bg-[#FFCC00] text-gray-900 py-4 rounded-xl font-extrabold text-lg hover:bg-yellow-500 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,204,0,0.3)] disabled:opacity-70 disabled:active:scale-100 flex justify-center items-center gap-2 relative z-10"
            >
              {isCrawling ? (
                <><RefreshCw className="animate-spin w-5 h-5" /> Syncing Feeds...</>
              ) : (
                'Run Crawler Now'
              )}
            </button>
          </div>

          {/* 监控关键词 */}
          <div>
            <div className="flex justify-between items-end mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Hash className="text-gray-400 w-5 h-5" /> Keywords
              </h3>
              <button onClick={() => setShowAddKeyword(!showAddKeyword)} className="text-yellow-600 font-bold text-sm hover:text-yellow-700">
                + Add Word
              </button>
            </div>

            {showAddKeyword && (
              <form onSubmit={addKeyword} className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 mb-4 flex gap-2">
                <input name="keyword" placeholder="e.g. frete grátis" className="flex-1 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl text-sm outline-none focus:border-yellow-400 font-medium" required />
                <button type="submit" className="bg-gray-900 text-white font-bold px-4 py-2 rounded-xl text-sm">Save</button>
              </form>
            )}

            <div className="flex flex-wrap gap-2">
              {keywords.map(k => (
                <span key={k.id} className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-sm font-bold text-gray-700 shadow-sm flex items-center gap-1 cursor-default hover:border-yellow-400 transition-colors">
                  <Hash size={12} className="text-gray-400" />
                  {k.keyword}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}