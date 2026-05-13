import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 使用最高权限密钥，彻底绕过所有乱七八糟的权限报错
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const titel = formData.get('titel') as string;
    const beschreibung = formData.get('beschreibung') as string;
    const wettbewerberId = formData.get('wettbewerberId') as string;
    const kategorieId = formData.get('kategorieId') as string;
    const aufnahmeDatum = formData.get('aufnahmeDatum') as string;

    if (!file) throw new Error('No file selected.');

    // 1. 将图片存入 Supabase Storage 的 intel 桶
    // 生成随机文件名防止覆盖 (例如: 170000000-xxxxx.png)
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('intel')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // 2. 获取这张图片的永久公开链接
    const { data: { publicUrl } } = supabase.storage
      .from('intel')
      .getPublicUrl(fileName);

    // 3. 将所有情报连同刚才的图片链接，一起写入 Supabase Database
    const { error: dbError } = await supabase
      .from('materials') // 确保你在 Supabase 建了这张表
      .insert([{
        titel,
        beschreibung,
        url: publicUrl, // 直接存入刚才生成的图片链接
        competitor_id: wettbewerberId,
        category_id: kategorieId,
        created_at: aufnahmeDatum,
      }]);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}