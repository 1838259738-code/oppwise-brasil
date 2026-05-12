import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const runtime = 'edge'; // 使用 Edge Runtime 速度更快

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    // 硬编码 Token 彻底绕过 Vercel 后台的 UI 锁定
    const BLOB_TOKEN = "vercel_blob_rw_gc4FNVgXJmwLdvSP_JVX10oMUSYDkQlCkj56wnJW2hoBqG6";

    if (!file) {
      return NextResponse.json({ error: '没有接收到文件' }, { status: 400 });
    }

    // 将文件存入 intel 文件夹，保持文件名
    const blob = await put(`intel/${file.name}`, file, {
      access: 'public',
      token: BLOB_TOKEN, // 强制手动传入 Token
    });

    return NextResponse.json({ success: true, url: blob.url });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}