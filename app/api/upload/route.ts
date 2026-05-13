import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'; // 确保你安装了 supabase-js


export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const titel = formData.get('titel') as string;
    const wettbewerberId = formData.get('wettbewerberId') as string;
    const kategorieId = formData.get('kategorieId') as string;

    const BLOB_TOKEN = "vercel_blob_rw_gc4FNVgXJmwLdvSP_JVX10oMUSYDkQlCkj56wnJW2hoBqG6";

    // 1. 上传到 Blob
    const blob = await put(`intel/${file.name}`, file, {
      access: 'public',
      token: BLOB_TOKEN,
      addRandomSuffix: true,
    });

    // 2. 存入 Supabase (假设你的表名是 materials)
    // 注意：这里的 URL 和 Key 需要替换为你自己的
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error: dbError } = await supabase
      .from('materials') // 这里的表名要对应你在 Supabase 建好的表
      .insert([
        {
          titel: titel,
          url: blob.url,
          competitor_id: wettbewerberId,
          category_id: kategorieId,
          created_at: new Date(),
        }
      ]);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, url: blob.url });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}