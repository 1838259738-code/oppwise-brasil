import { supabase } from '@/lib/supabase'
import { ShoppingBag, Calendar, ExternalLink } from 'lucide-react'

// 强制动态渲染，禁用缓存
export const dynamic = 'force-dynamic'
export const revalidate = 0 

export default async function MaterialLibrary() {
  // 极致简化查询：只查单表，不查任何外键关联表 (competitors)，避免因为表结构不对导致的对象渲染错误
  const { data: materials, error } = await supabase
    .from('materials')
    .select('*')
    .order('id', { ascending: false }) 

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] p-10 flex items-center justify-center">
        <div className="bg-white p-8 rounded-[24px] shadow-lg text-center border-2 border-red-100">
          <h2 className="text-red-500 font-black text-2xl mb-2">Database Error</h2>
          <p className="text-gray-500 text-sm">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      <div className="bg-[#FFD111] pt-16 pb-20 px-8 rounded-b-[40px] shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-end">
          <div className="space-y-2">
            <h1 className="text-5xl font-extrabold text-[#333] tracking-tight">Intelligence <span className="text-white">Hub</span></h1>
            <p className="bg-black/10 text-[#333] inline-block px-3 py-1 rounded-full text-xs font-bold uppercase">Brazil Market / Operatix-B</p>
          </div>
          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md">
            <p className="text-xs font-bold text-[#333]">TOTAL ASSETS</p>
            <p className="text-3xl font-black text-[#333]">{materials?.length || 0}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {materials?.map((item) => {
            // 极简处理图片 URL
            const imageUrl = typeof item.url === 'string' ? item.url : ''
            const isValidImage = imageUrl.startsWith('http')

            return (
              <div key={item.id} className="bg-white rounded-[24px] overflow-hidden shadow-md hover:shadow-xl transition-all border border-transparent hover:border-[#FFD111] group flex flex-col">
                <div className="aspect-[4/5] bg-[#F3F3F3] relative flex items-center justify-center overflow-hidden">
                  {isValidImage ? (
                    <img 
                      src={imageUrl} 
                      alt="Intelligence Screenshot"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x500?text=Load+Error' }}
                    />
                  ) : (
                    <div className="text-center p-4">
                      <ShoppingBag size={48} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-[10px] text-gray-400 font-bold uppercase">No Image</p>
                    </div>
                  )}
                  
                  {/* 由于去掉了关联查询，这里写死标签作为降级展示 */}
                  <div className="absolute top-4 right-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm text-white bg-[#333] z-10">
                    ID: {item.competitor_id || 'N/A'}
                  </div>
                </div>

                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <h3 className="text-lg font-bold text-[#333] line-clamp-2">
                    {typeof item.titel === 'string' ? item.titel : 'Untitled'}
                  </h3>
                  <div className="pt-4 flex items-center justify-between border-t border-gray-50 text-gray-400 text-[10px] font-bold">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      Raw Record
                    </div>
                    
                    <a href={isValidImage ? imageUrl : '#'} target={isValidImage ? "_blank" : "_self"} className="bg-[#FFD111] p-2 rounded-xl text-[#333] hover:scale-110 transition-all"><ExternalLink size={14} /></a>
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