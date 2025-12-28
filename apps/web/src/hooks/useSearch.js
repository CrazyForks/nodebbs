import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { searchApi } from '@/lib/api';

/**
 * 搜索逻辑 Hook
 * 管理搜索状态、API 调用和分页逻辑
 * 
 * 设计说明：
 * - 从 URL 参数读取搜索关键词和类型
 * - 支持三种搜索类型：话题、回复、用户
 * - 初始搜索使用 type='all' 获取所有类型的第一页
 * - 单独加载特定类型的分页
 *
 * @returns {Object} 搜索状态和操作方法
 */
export function useSearch() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('s') || '';
  const typeParam = searchParams.get('type') || 'topics';

  const [loading, setLoading] = useState(true);
  const [searchType, setSearchType] = useState(typeParam);
  const [searchResults, setSearchResults] = useState({
    topics: { items: [], total: 0, page: 1, limit: 20 },
    posts: { items: [], total: 0, page: 1, limit: 20 },
    users: { items: [], total: 0, page: 1, limit: 20 },
  });
  const [loadingTypes, setLoadingTypes] = useState({
    topics: false,
    posts: false,
    users: false,
  });

  // 初始搜索：当搜索关键词改变时，获取所有类型的第一页
  useEffect(() => {
    if (searchQuery.trim()) {
      performInitialSearch();
    } else {
      // 清空搜索结果
      setSearchResults({
        topics: { items: [], total: 0, page: 1, limit: 20 },
        posts: { items: [], total: 0, page: 1, limit: 20 },
        users: { items: [], total: 0, page: 1, limit: 20 },
      });
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  /**
   * 执行初始搜索，获取所有类型的数据
   */
  const performInitialSearch = async () => {
    setLoading(true);
    try {
      const data = await searchApi.search(searchQuery.trim(), 'all', 1, 20);
      setSearchResults(data);
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 加载特定类型的特定页
   * @param {string} type - 搜索类型 (topics/posts/users)
   * @param {number} page - 页码
   */
  const loadTypePage = async (type, page) => {
    setLoadingTypes((prev) => ({ ...prev, [type]: true }));
    try {
      const data = await searchApi.search(searchQuery.trim(), type, page, 20);
      setSearchResults((prev) => ({
        ...prev,
        [type]: data[type],
      }));
    } catch (error) {
      console.error(`加载 ${type} 第 ${page} 页失败:`, error);
    } finally {
      setLoadingTypes((prev) => ({ ...prev, [type]: false }));
    }
  };

  return {
    /** 搜索关键词 */
    searchQuery,
    /** 当前搜索类型 */
    searchType,
    /** 设置搜索类型 */
    setSearchType,
    /** 初始加载状态 */
    loading,
    /** 各类型的加载状态 */
    loadingTypes,
    /** 搜索结果 */
    searchResults,
    /** 加载特定类型的分页 */
    loadTypePage,
  };
}
