'use client'

import { useState } from 'react'
import { Filter, X, MapPin, Tag, ExternalLink, FileImage, Search } from 'lucide-react'

export default function AnalysenClient({ initialData, kategorien, wettbewerber }: { initialData: any[], kategorien: any[], wettbewerber: any[] }) {
  const [filterWettbewerb, setFilterWettbewerb] = useState('')
  const [filterKategorie, setFilterKategorie] = useState('')
  const [filterSuche, setFilterSuche] = useState('')

  const filtered = initialData.filter(item => {
    if (filterWettbewerb && item.wettbewerber !== filterWettbewerb) return false
    if (filterKategorie && item.kategorie !== filterKategorie) return false
    if (filterSuche && !item.titel.toLowerCase().includes(filterSuche.toLowerCase()) && !item.beschreibung?.toLowerCase().includes(filterSuche.toLowerCase())) return false
    return true
  })

  // 安全解析 JSON 的辅助函数
  const safeParse = (jsonStr: any) => {
    if (!jsonStr) return null
    if (typeof jsonStr !== 'string') return jsonStr
    try { return JSON.parse(jsonStr) } catch (e) { return null }
  }

  return (
    <>
      {/* 99Food 风格过滤器操作台 */}
      <div className="bg-gray-50 p-4 md:p-6 rounded-3xl border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-center shadow-inner">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-yellow-400 p-2 rounded-xl text-gray-900 shadow-sm">
            <Filter size={20} className="stroke-[2.5px]" />
          </div>
          <span className="font-bold text-gray-700 hidden md:inline-block whitespace-nowrap">Filter Intel:</span>
        </div>
        
        <select
          value={filterWettbewerb}
          onChange={(e) => setFilterWettbewerb(e.target.value)}
          className="w-full md:w-auto appearance-none border-2 border-transparent rounded-xl px-4 py-3 bg-white text-gray-900 font-bold outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 transition-all cursor-pointer shadow-sm"
        >
          <option value="">All Competitors</option>
          {wettbewerber.map((w: any) => (
            <option key={w.id} value={w.name}>{w.name}</option>
          ))}
        </select>

        <select
          value={filterKategorie}
          onChange={(e) => setFilterKategorie(e.target.value)}
          className="w-full md:w-auto appearance-none border-2 border-transparent rounded-xl px-4 py-3 bg-white text-gray-900 font-bold outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 transition-all cursor-pointer shadow-sm"
        >
          <option value="">All Categories</option>
          {kategorien.map((k: any) => (
            <option key={k.id} value={k.name}>{k.name}</option>
          ))}
          <option value="Field Intel">Field Intel</option>
        </select>

        <div className="relative w-full md:flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search titles & descriptions..."
            value={filterSuche}
            onChange={(e) => setFilterSuche(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border-2 border-transparent rounded-xl bg-white text-gray-900 font-medium outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 transition-all shadow-sm"
          />
        </div>

        {(filterWettbewerb || filterKategorie || filterSuche) && (
          <button
            onClick={() => { setFilterWettbewerb(''); setFilterKategorie(''); setFilterSuche('') }}
            className="w-full md:w-auto text-gray-500 hover:text-red-500 hover:bg-red-50 font-bold px-4 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <X size={18} /> Clear
          </button>
        )}
      </div>

      {/* 情报流卡片区 (Timeline Layout) */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <Filter size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-bold text-lg">No intelligence entries found matching your criteria.</p>
            <p className="text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          filtered.map((item, index) => {
            const priceFindings = safeParse(item.extra?.priceFindings);
            const strategyTags = safeParse(item.extra?.strategyTags);
            
            return (
              <div key={item.id} className="relative flex gap-4 md:gap-8 pb-8 group">
                {/* 侧边时间线与竞品原色点 */}
                <div className="hidden md:flex flex-col items-center mt-2">
                  <div 
                    className="w-5 h-5 rounded-full z-10 shadow-md border-4 border-white transition-transform group-hover:scale-125"
                    style={{ backgroundColor: item.farbe || '#ccc' }}
                  />
                  {index !== filtered.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-100 mt-2 absolute top-6 bottom-0 left-[9.5px]" />
                  )}
                </div>

                {/* 卡片主体 */}
                <div className="flex-1 bg-white p-6 md:p-8 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-gray-100 hover:border-yellow-400 hover:shadow-[0_8px_30px_rgb(255,204,0,0.12)] transition-all">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-black px-3 py-1 rounded-lg uppercase tracking-wider" style={{ backgroundColor: `${item.farbe}20`, color: item.farbe }}>
                          {item.wettbewerber}
                        </span>
                        <span className="text-xs font-bold bg-gray-100 text-gray-500 px-3 py-1 rounded-lg">
                          {item.kategorie}
                        </span>
                        <span className="text-xs font-bold text-gray-400">
                          {new Date(item.datum).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="text-xl font-extrabold text-gray-900 leading-tight">{item.titel}</h3>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                      item.type === 'auto' ? 'border-blue-200 text-blue-600 bg-blue-50' : 
                      item.type === 'field' ? 'border-purple-200 text-purple-600 bg-purple-50' : 
                      'border-green-200 text-green-600 bg-green-50'
                    }`}>
                      {item.type === 'auto' ? 'Automated Scan' : item.type === 'field' ? 'Field Intel' : 'Manual Upload'}
                    </span>
                  </div>

                  <p className="text-gray-600 leading-relaxed mb-4">{item.beschreibung}</p>

                  {/* Field Intel 专属拓展数据 */}
                  {(item.extra?.stadt || priceFindings || strategyTags) && (
                    <div className="bg-gray-50 rounded-2xl p-4 mt-4 space-y-3 border border-gray-100">
                      {item.extra?.stadt && (
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                          <MapPin size={16} className="text-yellow-500" />
                          Location: {item.extra.stadt}
                        </div>
                      )}
                      
                      {priceFindings && Array.isArray(priceFindings) && (
                        <div className="flex flex-wrap gap-2">
                          {priceFindings.map((p: any, i: number) => (
                            <div key={i} className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-sm shadow-sm flex items-center gap-2">
                              <span className="text-gray-500">{p.label}:</span>
                              <span className="font-extrabold text-gray-900">{p.value}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {strategyTags && Array.isArray(strategyTags) && (
                        <div className="flex flex-wrap gap-2">
                          {strategyTags.map((t: string, i: number) => (
                            <span key={i} className="bg-yellow-100 text-yellow-800 border border-yellow-200 px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                              <Tag size={12} /> {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 附件/图片展示区 (兼容 Supabase 绝对路径) */}
                  {item.dateien && Array.isArray(item.dateien) && item.dateien.length > 0 && (
                    <div className="mt-5 pt-5 border-t border-gray-100 flex flex-wrap gap-3">
                      {item.dateien.map((pfad: string, idx: number) => {
                        const isUrl = pfad.startsWith('http');
                        const url = isUrl ? pfad : `/uploads/${pfad}`; // 向下兼容旧的残留数据
                        
                        return (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-yellow-400 text-white hover:text-gray-900 px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm group/btn"
                          >
                            <FileImage size={16} />
                            View Asset {idx + 1}
                            <ExternalLink size={14} className="opacity-50 group-hover/btn:opacity-100" />
                          </a>
                        )
                      })}
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <span>Source: {item.quelle}</span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </>
  )
}