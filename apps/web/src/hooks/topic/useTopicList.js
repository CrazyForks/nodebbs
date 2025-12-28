import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * 话题列表逻辑 Hook
 * @param {Object} props
 * @param {Array} props.initialTopics - 初始话题列表数据
 */
export function useTopicList({ initialTopics }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [topics, setTopics] = useState(initialTopics);

  // 监听服务端数据变化，更新本地状态
  useEffect(() => {
    setTopics(initialTopics);
  }, [initialTopics]);

  // 处理页码变更
  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newPage === 1) {
      params.delete('p');
    } else {
      params.set('p', newPage.toString());
    }

    const newUrl = params.toString() ? `?${params}` : '?';
    router.push(newUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    /** 当前话题列表数据 */
    topics,
    /** 更新话题列表的方法 */
    setTopics,
    /** 处理页码变更方法 */
    handlePageChange,
  };
}
