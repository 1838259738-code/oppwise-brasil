import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { prisma } from '../../../lib/db';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    console.log("=== 收到云端上传请求 ===");
    
    const titel = formData.get('titel') as string || 'Unbenannt Intel';
    const beschreibung = formData.get('beschreibung') as string || '';
    const wettbewerberIdRaw = formData.get('wettbewerberId');
    const wettbewerberId = parseInt(wettbewerberIdRaw as string, 10);
    
    if (isNaN(wettbewerberId)) {
      throw new Error(`无效的 wettbewerberId: ${wettbewerberIdRaw}`);
    }

    const stadt = formData.get('stadt') as string || 'São Paulo';
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      throw new Error("没有检测到上传的文件");
    }

    const savedUrls: string[] = [];
    let base64ForAI: string | null = null;

    // 将文件逐一上传到 Vercel Blob 云存储
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      if (!base64ForAI) {
        base64ForAI = buffer.toString('base64');
      }

      // 核心：调用 Vercel Blob API 上传文件
      const blob = await put(`intel/${file.name}`, file, {
        access: 'public',
        addRandomSuffix: true, // 自动加随机后缀，防止同名文件覆盖
      });

      console.log("✅ 文件已存入云端:", blob.url);
      savedUrls.push(blob.url);
    }

    // 将云端 URL 数组存入 PostgreSQL 数据库的 FieldIntel 表
    const newIntel = await prisma.fieldIntel.create({
      data: {
        titel,
        wettbewerberId,
        stadt,
        screenType: "Promotion",
        userProfile: "General",
        dateiPfade: JSON.stringify(savedUrls), // 存入云端链接
        notizen: beschreibung,
      },
    });

    console.log("✅ 数据已同步至 Prisma ===", newIntel.id);

    return NextResponse.json({ success: true, intelId: newIntel.id, urls: savedUrls });

  } catch (error: any) {
    console.error("!!! API 崩溃拦截 !!!");
    console.error("详细信息:", error.message);
    return NextResponse.json(
      { success: false, error: "Upload failed", details: error.message }, 
      { status: 500 }
    );
  }
}