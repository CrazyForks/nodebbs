import { Suspense } from 'react';
import SearchPageClient from './components/SearchPageClient';
import { Loading } from '@/components/common/Loading';

/**
 * 搜索页面入口
 * 使用 Suspense 包裹客户端组件以支持 useSearchParams
 */
export default function SearchPage() {
  return (
    <Suspense fallback={<Loading text='加载中...' />}>
      <SearchPageClient />
    </Suspense>
  );
}
