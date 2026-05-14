import { supabase } from '@/lib/supabase'
import { ShoppingBag, Calendar, MapPin, ExternalLink } from 'lucide-react'

// 关键：禁用一切缓存，确保上传后立即刷新可见
export const revalidate = 0 
export const dynamic = 'force-dynamic'

export default async function MaterialLibrary() {
  // 拉取数据时，顺便检查数据是否完整
  const { data: materials, error } = await supabase
    .from('materials')
    .select(`*, competitors (name, color)`)
    .order('created_at', { ascending: false })

  if (error) return <div className="p-10 text-red-500 font-bold">Error: {error.message}</div>

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
            // 调试用：如果图片不显示，你可以检查控制台里的 URL 是否正确
            const imageUrl = item.url
            const isValidImage = imageUrl && imageUrl.startsWith('http')

            return (
              <div key={item.id} className="bg-white rounded-[24px] overflow-hidden shadow-md hover:shadow-xl transition-all border border-transparent hover:border-[#FFD111] group flex flex-col">
                <div className="aspect-[4/5] bg-[#F3F3F3] relative flex items-center justify-center overflow-hidden">
                  {isValidImage ? (
                    <img 
                      src={imageUrl} 
                      alt={item.titel}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      // 容错处理：如果图片加载失败，显示占位符
                      onError={(e) => { (e.target as any).src = 'https://via.placeholder.com/400x500?text=Image+Load+Error' }}
                    />
                  ) : (
                    <div className="text-center p-4">
                      <ShoppingBag size={48} className="text-gray-300 mx-auto mb-2" />
                      <p className="text-[10px] text-gray-400 font-bold uppercase">No Image Data</p>
                    </div>
                  )}
                  
                  <div className="absolute top-4 right-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm text-white z-10" style={{ backgroundColor: item.competitors?.color || '#333' }}>
                    {item.competitors?.name || 'KeeTa'}
                  </div>
                </div>

                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <h3 className="text-lg font-bold text-[#333] line-clamp-2">{item.titel}</h3>
                  <div className="pt-4 flex items-center justify-between border-t border-gray-50 text-gray-400 text-[10px] font-bold">
                    <div className="flex items-center gap-1.5"><Calendar size={12} />{new Date(item.created_at).toLocaleDateString()}</div>
                    <a href={imageUrl} target="_blank" className="bg-[#FFD111] p-2 rounded-xl text-[#333] hover:scale-110 transition-all"><ExternalLink size={14} /></a>
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