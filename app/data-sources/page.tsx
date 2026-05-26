'use client'

import { useState } from 'react'
import { Settings2, Globe, MessageSquare, Newspaper, Trophy, ShieldCheck, Zap, Server, Activity, ArrowRight } from 'lucide-react'

export default function DataSources() {
  const [pipelines] = useState([
    {
      id: 1,
      name: 'Valor Econômico / Exame BR Corporate Stream',
      type: 'Corporate M&A & Strategic Partnerships',
      status: 'Active',
      region: 'Brazil Nationwide',
      icon: Newspaper,
      frequency: 'Every 15 Mins / 15分钟级动态轮询',
      latency: '< 2.5 min Ingestion SLA',
      desc: '分布式监听巴西主流财经媒体、反垄断机构（CADE）公告和企业官方PR频道。通过语义过滤算法自动流转并提取涉及竞品资本运作、高管变动、收并购以及与拉美本土传统供应链/大型线下连锁签署的战略合作协议（Parcerias）。'
    },
    {
      id: 2,
      name: 'Reddit Social Listener (r/brasil & r/investimentos)',
      type: 'Social Listening & UX Churn Signals',
      status: 'Active',
      region: 'São Paulo / Rio Grande do Sul / Metro Clusters',
      icon: MessageSquare,
      frequency: 'Real-time Webhook / 实时数据流推流',
      latency: '< 30s Processing Delay',
      desc: '基于 PRAW (Python Reddit API Wrapper) 的流式监听节点，通过对拉美核心高资产/泛大众讨论社区进行关键词网格嗅探。自动抓取并通过 VADER / LLM 情感分析聚合用户关于外卖平台服务杀熟（Preço Dinâmico）、配送费暴涨（Taxa de Entrega）、商家骑手两端暴雷的槽点和负面舆情。'
    },
    {
      id: 3,
      name: 'X / Twitter Live Campaign Tracker',
      type: 'Real-time Promotion & Promo Bug Ingestion',
      status: 'Active',
      region: 'All LatAm Digital Core Nodes',
      icon: Zap,
      frequency: 'Streaming API / 流式长连接抓取',
      latency: 'Millisecond-level / 毫秒级突发响应',
      desc: '流式监听巴西 Tech 圈、外卖羊毛党聚集的话题集群。专门针对狂欢节、美洲杯、世界杯（Copa do Mundo）等重大节日节点，高瞬时捕捉竞品突发的全盘大额普惠券（Cupons）、Bug券爆料、以及与KOL联动的特定快闪大促代码，为 99Food Operations 团队争取反制阻击的最佳黄金窗口期。'
    },
    {
      id: 4,
      name: 'Meio & Mensagem Marketing Analysis Pipeline',
      type: 'Growth Campaigns & GTM Strategy Monitor',
      status: 'Active',
      region: 'Global LatAm Content Radar',
      icon: Trophy,
      frequency: 'Hourly Cron Job / 每小时增量审计',
      latency: '< 10 min Ingestion SLA',
      desc: '聚焦拉美最权威的广告、公关与数字营销垂直流媒体。自动化解构竞品 GTM (Go-To-Market) 的大型破圈 Campaign 打法、地面补贴轰炸规模以及平台侧对消费者心智（Brand Equity）的侵占态势，沉淀为资产库内的结构化策略参照。'
    },
    {
      id: 5,
      name: 'App Store / Play Store Review Scraping Cluster',
      type: 'Product Interface & Feature Paywall Audit',
      status: 'Active',
      region: 'Brazil Storefront (PT-BR Feed)',
      icon: Globe,
      frequency: 'Every 30 Mins / 30分钟轮询清洗',
      latency: '< 5 min Sync Delay',
      desc: '自动化爬虫集群定时下钻巴西两大应用商店的评论流（App Reviews），专门识别包含 “Atualização / Update”、“Carrinho / Cart”、“Pagamento / Payment” 等产品侧关键词。智能监控并逆序推导出竞品在结算页（Checkout Page）、免运费会员（VIP Club）等核心转化漏斗上的产品交互迭代及灰度付费墙上线变动。'
    }
  ])

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* 顶部控制台控制卡片 */}
        <div className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between border border-gray-100 gap-6">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="bg-[#333] p-4 rounded-[18px] md:rounded-[24px] shadow-lg text-[#FFD111]">
              <Settings2 size={28} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-[#333] tracking-tight">Active Ingestion Pipelines</h2>
              <p className="text-gray-400 font-medium text-xs md:text-sm mt-0.5">
                分布式多源情报抓取管线索引中心 / Distributed OSINT Data Pipeline Management Hub
              </p>
            </div>
          </div>

          {/* 宏观吞吐指标小面板，拉高系统真货感 */}
          <div className="flex items-center gap-6 bg-gray-50 border px-6 py-4 rounded-[20px] shadow-inner flex-shrink-0">
            <div className="text-center">
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Active Nodes / 活动节点</div>
              <div className="text-xl font-black text-[#333] mt-0.5 flex items-center justify-center gap-1.5">
                <Server size={16} className="text-green-500" /> 5 / 5 Cluster
              </div>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Network Health / 网络健康</div>
              <div className="text-xl font-black text-green-600 mt-0.5 flex items-center justify-center gap-1.5">
                <Activity size={16} className="animate-pulse" /> 99.94%
              </div>
            </div>
          </div>
        </div>

        {/* 核心升级：高颗粒度管线网格系统 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {pipelines.map((pipe) => {
            const Icon = pipe.icon
            return (
              <div key={pipe.id} className="bg-white rounded-[24px] md:rounded-[32px] p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200 transition-all flex flex-col justify-between relative group">
                
                <div className="space-y-4">
                  {/* 第一层：节点标志与状态标牌 */}
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3.5 rounded-2xl bg-gray-50 text-[#333] border border-gray-100 group-hover:bg-[#FFD111] group-hover:text-[#333] transition-colors shadow-sm">
                        <Icon size={22} />
                      </div>
                      <div>
                        <h4 className="font-black text-sm md:text-base text-[#333] group-hover:text-yellow-600 transition-colors">
                          {pipe.name}
                        </h4>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mt-0.5">
                          {pipe.type}
                        </span>
                      </div>
                    </div>
                    <span className="bg-green-500/10 text-green-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 border border-green-500/10 shadow-inner">
                      <ShieldCheck size={11} /> {pipe.status}
                    </span>
                  </div>

                  {/* 第二层：硬核时效技术参数指标槽 */}
                  <div className="grid grid-cols-2 gap-3 bg-gray-50/70 p-3 rounded-xl border border-gray-100/50 text-[10px] font-mono font-bold text-gray-500">
                    <div>
                      <span className="text-gray-400 block uppercase text-[9px]">Ingestion Frequency / 抓取频率:</span>
                      <span className="text-[#333] mt-0.5 block">{pipe.frequency}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block uppercase text-[9px]">SLA Latency / 时效延迟下限:</span>
                      <span className="text-[#333] mt-0.5 block">{pipe.latency}</span>
                    </div>
                  </div>

                  {/* 第三层：深度中文业务描述文本 */}
                  <p className="text-xs md:text-sm text-gray-500 font-medium leading-relaxed pt-1">
                    {pipe.desc}
                  </p>
                </div>
                
                {/* 第四层：底栏跨国元数据页脚 */}
                <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono font-bold mt-6 pt-4 border-t border-gray-50">
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                    REGION: {pipe.region}
                  </span>
                  <span className="text-[#333] font-black tracking-widest flex items-center gap-1 group-hover:text-yellow-600 transition-colors">
                    PIPELINE LOGS <ArrowRight size={12} />
                  </span>
                </div>

              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}