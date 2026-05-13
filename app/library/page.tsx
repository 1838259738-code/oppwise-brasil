import { supabase } from '@/lib/supabase'
import BibliothekClient from './BibliothekClient'

export default async function LibraryPage() {
  /**
   * 1. 使用 Supabase 的关联查询语法
   * '*, competitors(*), categories(*)' 等同于 Prisma 的 include
   */
  const { data, error } = await supabase
    .from('materials')
    .select('*, competitors(*), categories(*)')
    .order('created_at', { ascending: false });

  // 2. 容错处理：如果查询失败或表不存在，返回空数组防止页面崩溃
  if (error) {
    console.error('[Supabase Library Fetch Error]:', error);
  }

  const materialien = data || [];

  /**
   * 3. 数据层提示：
   * 现在的 materialien 结构已经包含了：
   * - competitors: { name, color }
   * - categories: { name }
   * 这将完美驱动你的 BibliothekClient 组件
   */
  return (
    <div className="bg-gray-50 min-h-screen">
      <BibliothekClient materialien={materialien} />
    </div>
  );
}