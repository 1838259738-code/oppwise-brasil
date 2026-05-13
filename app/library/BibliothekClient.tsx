'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Plus, FileText, ImageIcon, ExternalLink } from 'lucide-react'

export default function BibliothekClient({ materialien }: { materialien: any[] }) {
  const [search, setSearch] = useState('')
  
  const filtered = materialien.filter(m => {
    const titleMatch = (m.titel || m.title || '').toLowerCase().includes(search.toLowerCase())
    const descMatch = (m.beschreibung || m.description || '').toLowerCase().includes(search.toLowerCase())
    return titleMatch || descMatch
  })

  // 安全解析文件的函数，兼容 Supabase 新版单 URL 和旧版 JSON 数组
  const getFiles = (m: any) => {
    if (m.url) return [m.url] // 新版 Supabase 直接存 URL
    if (m.dateiPfade) {
      try { return JSON.parse(m.dateiPfade) } catch (e) { return [] }
    }
    return []
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* 头部区 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Intelligence Library</h2>
          <p className="text-gray-500 mt-2 font-medium">Browse, search, and manage all your raw intelligence assets.</p>
        </div>
        <Link 
          href="/upload" 
          className="bg-[#FFCC00] text-gray-900 px-6 py-3 rounded-xl font-bold shadow-[0_4px_14px_0_rgba(255,204,0,0.39)] hover:bg-[#F0C000] active:scale-[0.98] transition-all flex items-center gap-2"
        >
          <Plus size={20} strokeWidth={3} />
          New Material
        </Link>
      </div>

      {/* 搜索栏 */}
      <div className="relative mb-8 max-w-2xl">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={20} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by title, description, or keyword..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl text-gray-900 font-medium outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 transition-all shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
        />
      </div>

      {/* 卡片网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-center">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-bold text-lg">No materials found.</p>
          </div>
        ) : (
          filtered.map((m) => {
            const files = getFiles(m)
            const firstFile = files[0]
            
            // 简单判断是否是图片 (向下兼容本地上传的后缀，或者 Supabase 的公网 URL)
            const isImage = firstFile && (firstFile.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i) || firstFile.startsWith('http'))
            const fileUrl = firstFile?.startsWith('http') ? firstFile : `/uploads/${firstFile}`

            // 兼容性获取竞品和类别数据
            const compName = m.competitors?.name || m.wettbewerber?.name || 'Unknown'
            const compColor = m.competitors?.color || m.wettbewerber?.farbe || '#FFCC00'
            const catName = m.categories?.name || m.kategorie?.name || 'Uncategorized'

            return (
              <div key={m.id} className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-gray-100 hover:border-yellow-400 hover:shadow-[0_8px_30px_rgb(255,204,0,0.12)] transition-all overflow-hidden flex flex-col group">
                
                {/* 封面缩略图区 */}
                <div className="w-full h-48 bg-gray-100 relative overflow-hidden">
                  {isImage ? (
                    <img
                      src={fileUrl}
                      alt={m.titel || m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                      <FileText size={40} className="mb-2 opacity-50" />
                      <span className="text-xs font-bold uppercase tracking-wider">Document / Asset</span>
                    </div>
                  )}
                  {/* 右上角文件数量角标 */}
                  <div className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <ImageIcon size={12} /> {files.length}
                  </div>
                </div>

                {/* 卡片信息区 */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-extrabold text-gray-900 text-lg line-clamp-1 mb-2 group-hover:text-yellow-600 transition-colors">
                    {m.titel || m.title || 'Untitled'}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span 
                      className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider" 
                      style={{ backgroundColor: `${compColor}20`, color: compColor }}
                    >
                      {compName}
                    </span>
                    <span className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                      {catName}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-gray-400 mb-4 mt-auto">
                    {new Date(m.aufnahmeDatum || m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>

                  {/* 动作区 */}
                  <div className="flex gap-2 border-t border-gray-100 pt-4">
                    {files.map((f: string, i: number) => {
                      const url = f.startsWith('http') ? f : `/uploads/${f}`
                      return (
                        <a 
                          key={i} 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 text-center bg-gray-50 hover:bg-yellow-400 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                        >
                          View Asset
                          <ExternalLink size={12} />
                        </a>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}