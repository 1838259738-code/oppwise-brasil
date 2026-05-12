import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db'; // 确保路径正确，如果不确定可以换成绝对路径 '@/lib/db'

export async function POST(req: Request) {
  try {
    const { intelId } = await req.json();

    // 1. 获取刚刚上传的情报数据
    const intel = await prisma.fieldIntel.findUnique({
      where: { id: intelId },
      include: { wettbewerber: true }
    });

    if (!intel) return NextResponse.json({ error: "Intel not found" }, { status: 404 });

    // 2. 模拟 AI 分析结果 (后续这里替换为真实的 DeepSeek 调用)
    const aiAnalysis = {
      extractedText: "Cupom de R$15 OFF para pedidos acima de R$30",
      priceFindings: "15.00 BRL",
      strategyTags: "Aggressive Acquisition, Lunch Peak",
      aiSummary: "iFood 正在针对圣保罗午餐高峰期进行高额补贴，旨在拦截 Keeta 的新客流。"
    };

    // 3. 回写数据
    const updatedIntel = await prisma.fieldIntel.update({
      where: { id: intelId },
      data: {
        extractedText: aiAnalysis.extractedText,
        priceFindings: aiAnalysis.priceFindings,
        strategyTags: aiAnalysis.strategyTags,
        aiSummary: aiAnalysis.aiSummary,
      }
    });

    return NextResponse.json(updatedIntel);
  } catch (error) {
    console.error("Analysis Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}