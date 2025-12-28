// 专为SSR优化
'use client';

import { TopicListUI } from './TopicListUI';
import { useTopicList } from '@/hooks/topic/useTopicList';

export default function TopicListClient({
  initialTopics,
  totalTopics,
  currentPage,
  totalPages,
  limit = 20,
  showPagination = true,
  showHeader = true,
}) {
  const { topics, handlePageChange } = useTopicList({ initialTopics });

  return (
    <TopicListUI
      topics={topics}
      totalTopics={totalTopics}
      currentPage={currentPage}
      totalPages={totalPages}
      limit={limit}
      showPagination={showPagination}
      showHeader={showHeader}
      onPageChange={handlePageChange}
    />
  );
}
