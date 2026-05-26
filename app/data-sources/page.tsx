'use client'

import { useState } from 'react'
import { Settings2, Globe, MessageSquare, Newspaper, Trophy, ShieldCheck, Zap } from 'lucide-react'

export default function DataSources() {
  const [pipelines] = useState([
    { id: 1, name: 'Valor Econômico / Exame BR', type: 'Corporate Strategy', status: 'Active', region: 'Brazil Nationwide', icon: Newspaper, desc: '自动监听巴西本地财经媒体，捕捉竞品收并购、组织架构调整及官方签署的战略合作协议。' },
    { id: 2, name: 'Reddit Hub (r/brasil & r/investimentos)', type: 'Social Listening', status: 'Active', region: 'São Paulo / Rio', icon: MessageSquare, desc: '语义化扒取 Reddit 巴西本地核心社区，提取网民对 iFood/Rappi 异常加价、杀熟及配送延迟的真实吐槽。' },
    { id: 3, name: 'X / Twitter BR Tech Monitor', type: 'Real-time Campaign', status: 'Active', region: 'Brazil Metro Areas', icon: Zap, desc: '流式监听社交媒体趋势，捕获竞品在世界杯（Copa do Mundo）、狂欢节等重大节日节点突发的大额券爆料。' },
    { id: 4, name: 'Meio & Mensagem / BR Marketing Radar', type: 'Growth & Ads', status: 'Active', region: 'Global Content Node', icon: Trophy, desc: '追踪拉美广告与营销媒体，实时透视竞品最新推出的补贴 Campaign 规模与地推打法。' },
    { id: 5, name: 'Apple App Store & Google Play Review Bot', type: 'Product Experience', status: 'Active', region: 'Brazil Storefront', icon: Globe, desc: '自动化爬虫分钟级回传巴西应用商店评论，预警竞品 App 结算页（Checkout）产品迭代动向。' }
  ])

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-sm flex items-center gap-4 border border-gray-100">
          <div className="bg-[#333] p-3.5 rounded-[18px] text-[#FFD111]">
            <Settings2 size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#333] tracking-tight">Active Pipelines</h2>
            <p className="text-gray-400 font-medium text-xs md:text-sm mt-0.5">
              分布式多源情报抓取管线索引中心 / Distributed OSINT Data Pipeline Management
            </p>
          </div>
        </div>

        {/* 管线网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pipelines.map((pipe) => {
            const Icon = pipe.icon
            return (
              <div key={pipe.id} className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-gray-50 text-[#333] border">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h4 className="font-black text-sm md:text-base text-[#333]">{pipe.name}</h4>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{pipe.type}</span>
                      </div>
                    </div>
                    <span className="bg-green-500/10 text-green-600 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck size={10}/> {pipe.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed bg-gray-50 p-4 rounded-xl">
                    {pipe.desc}
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono font-bold mt-4 pt-3 border-t border-gray-50">
                  <span>REGION: {pipe.region}</span>
                  <span className="text-[#333] font-bold">100% OPERATIONAL</span>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}