'use client';

import { useSearch } from '@/hooks/useSearch';
import { SearchUI } from './SearchUI';

/**
 * 搜索页面客户端连接组件
 * 消费 useSearch Hook，将数据传递给 SearchUI
 */
export default function SearchPageClient() {
  const {
    searchQuery,
    searchType,
    setSearchType,
    loading,
    loadingTypes,
    searchResults,
    loadTypePage,
  } = useSearch();

  return (
    <SearchUI
      searchQuery={searchQuery}
      searchType={searchType}
      onSearchTypeChange={setSearchType}
      loading={loading}
      loadingTypes={loadingTypes}
      searchResults={searchResults}
      onLoadPage={loadTypePage}
    />
  );
}
