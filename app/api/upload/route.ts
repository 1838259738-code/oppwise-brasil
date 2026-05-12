import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  // 直接在代码里定义 Token，不再依赖 process.env
  const BLOB_TOKEN = "vercel_blob_rw_gc4FNVgXJmwLdvSP_JVX10oMUSYDkQlCkj56wnJW2hoBqG6";

  if (!filename || !request.body) {
    return NextResponse.json({ error: 'Missing filename or body' }, { status: 400 });
  }

  try {
    const blob = await put(filename, request.body, {
      access: 'public',
      token: BLOB_TOKEN, // 强制手动传入 Token
    });

    return NextResponse.json(blob);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}