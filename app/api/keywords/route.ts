// 文件路径: app/api/keywords/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// 🚀 核心修复：强行声明为完全动态路由，禁用 Next.js 服务端任何静态预编译缓存，重估周期设为 0
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    // 1. 实时穿透物理表：从 auto_entries / materials 等表中捞取截至目前的最新大盘情报数据
    // 确保 6 月提报的最新数据能第一时间进入计算流水线
    const { data: entries, error: entriesError } = await supabase
      .from('auto_entries')
      .select('titel, quelle, created_at')
      .order('created_at', { ascending: false })

    if (entriesError) throw entriesError

    // 2. 核心大盘声量与份额动态精算
    // 统计总体声量，并动态拆解 iFood 与 KeeTa 在巴西市场的最新声量占比
    let totalCount = entries?.length || 0
    let ifoodCount = 0
    let keetaCount = 0

    if (entries && totalCount > 0) {
      entries.forEach(entry => {
        const text = (entry.titel || '') + (entry.quelle || '')
        // 兼容大小写模糊匹配，扫描竞对声量特征
        if (/ifood/i.test(text)) {
          ifoodCount++
        } else if (/keeta/i.test(text)) {
          keetaCount++
        }
      })
    }

    // 防止分母为0的边界容错，若无特定词则按大盘基数兜底分配
    if (ifoodCount === 0 && keetaCount === 0 && totalCount > 0) {
      // 动态捞取复合表作为权重兜底
      const { count: materialsCount } = await supabase
        .from('materials')
        .select('*', { count: 'exact', head: true })
      totalCount = materialsCount || totalCount
    }

    // 算出力透纸背的最新实时份额
    const ifoodShare = totalCount > 0 ? Math.round((ifoodCount / totalCount) * 100) : 65
    const keetaShare = totalCount > 0 ? Math.round((keetaCount / totalCount) * 100) : 35

    // 3. 组装契合前端大盘图表所需的高颗粒度数据结构
    const processedData = {
      totalVolume: totalCount,
      shares: [
        { name: 'iFood (Red)', value: ifoodShare, count: ifoodCount, color: '#EA1D2C' },
        { name: 'KeeTa (Yellow)', value: keetaShare, count: keetaCount, color: '#FFD111' }
      ],
      lastUpdated: new Date().toISOString()
    }

    // 4. 🔥 强硬响应：返回最新精算 JSON，并在 HTTP 协议层彻底洗净任何缓存残留
    return NextResponse.json({ 
      success: true, 
      data: processedData,
      timestamp: Date.now() // 带上服务器绝对实时时间戳
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })

  } catch (err: any) {
    console.error('📊 Dashboard calculation failed:', err)
    return NextResponse.json({ 
      success: false, 
      error: err.message || 'Internal Dashboard Engine Error' 
    }, { status: 500 })
  }
}