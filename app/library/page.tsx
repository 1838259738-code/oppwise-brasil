import { supabase } from '@/lib/supabase'
import { ShoppingBag, Calendar, MapPin, ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MaterialLibrary() {
  const { data: materials, error } = await supabase
    .from('materials')
    .select(`*, competitors (name, color)`)
    .order('created_at', { ascending: false })

  if (error) return <div className="p-10 text-red-500 font-bold">Connection Error: {error.message}</div>

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      {/* 顶部活力 Header */}
      <div className="bg-[#FFD111] pt-16 pb-20 px-8 rounded-b-[40px] shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-end">
          <div className="space-y-2">
            <h1 className="text-5xl font-extrabold text-[#333] tracking-tight">
              Intelligence <span className="text-white">Hub</span>
            </h1>
            <p className="bg-black/10 text-[#333] inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Brazil Market / Operatix-B
            </p>
          </div>
          <div className="hidden md:block bg-white/20 p-4 rounded-2xl backdrop-blur-md">
            <p className="text-xs font-bold text-[#333]">TOTAL ASSETS</p>
            <p className="text-3xl font-black text-[#333]">{materials?.length || 0}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {materials?.map((item) => {
            // 判断数据库里的 url 是不是真实的外部链接
            const hasRealImage = item.url && item.url.startsWith('http')

            return (
              <div key={item.id} className="bg-white rounded-[24px] overflow-hidden shadow-md hover:shadow-xl transition-all border border-transparent hover:border-[#FFD111] group flex flex-col">
                
                {/* 核心改动：真实图片预览区 */}
                <div className="aspect-[4/5] bg-[#F3F3F3] relative flex items-center justify-center overflow-hidden">
                  {hasRealImage ? (
                    <img 
                      src={item.url} 
                      alt={item.titel} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <ShoppingBag size={48} className="text-gray-300 group-hover:scale-110 transition-transform duration-500" />
                  )}
                  
                  {/* 悬浮的竞品标签 */}
                  <div 
                    className="absolute top-4 right-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm text-white z-10"
                    style={{ backgroundColor: item.competitors?.color || '#333' }}
                  >
                    {item.competitors?.name}
                  </div>
                </div>

                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#333] leading-tight line-clamp-2">
                      {item.titel}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-medium mt-2">
                      <MapPin size={12} />
                      <span>São Paulo, BR</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 mt-2 flex items-center justify-between border-t border-gray-50">
                    <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold">
                      <Calendar size={12} />
                      {item.aufnahmeDatum ? new Date(item.aufnahmeDatum).toLocaleDateString() : 'N/A'}
                    </div>
                    {/* 如果有真实链接，点击可以直接看高清大图 */}
                    <a 
                      href={hasRealImage ? item.url : '#'} 
                      target={hasRealImage ? "_blank" : "_self"}
                      className="bg-[#FFD111] p-2 rounded-xl text-[#333] hover:scale-110 transition-all cursor-pointer"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}