import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { intelId } = await req.json();

    if (!intelId) {
      return NextResponse.json({ error: "Missing intelId" }, { status: 400 });
    }

    // 1. 获取刚刚上传的情报数据 (代替 prisma.findUnique)
    // 关联查询竞品数据使用 competitors(*)
    const { data: intel, error: fetchError } = await supabase
      .from('field_intel')
      .select('*, competitors(*)')
      .eq('id', intelId)
      .single();

    if (fetchError || !intel) {
      console.error("Fetch Error:", fetchError);
      return NextResponse.json({ error: "Intel not found in Supabase" }, { status: 404 });
    }

    // 2. 模拟 AI 分析结果 (这里预留了接口，后续可直接在此处 fetch DeepSeek API)
    // 注意：Supabase 通常建议存储为文本或 JSONB
    const aiAnalysis = {
      extracted_text: "Cupom de R$15 OFF para pedidos acima de R$30",
      price_findings: "15.00 BRL",
      strategy_tags: "Aggressive Acquisition, Lunch Peak",
      ai_summary: `iFood 正在针对圣保罗午餐高峰期进行高额补贴。情报 ID: ${intelId}`
    };

    // 3. 回写数据 (代替 prisma.update)
    const { data: updatedIntel, error: updateError } = await supabase
      .from('field_intel')
      .update({
        extracted_text: aiAnalysis.extracted_text,
        price_findings: aiAnalysis.price_findings,
        strategy_tags: aiAnalysis.strategy_tags,
        ai_summary: aiAnalysis.ai_summary,
      })
      .eq('id', intelId)
      .select()
      .single();

    if (updateError) {
      console.error("Update Error:", updateError);
      return NextResponse.json({ error: "Failed to update AI analysis" }, { status: 500 });
    }

    // 4. 返回更新后的完整对象
    return NextResponse.json(updatedIntel);

  } catch (error) {
    console.error("Analysis Pipeline Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}