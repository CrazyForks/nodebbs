'use client';

import { Fragment } from 'react';
import { Pager } from '@/components/common/Pagination';
import JatraTopicCard from './JatraTopicCard';

export default function JatraTopicList({
  topics,
  totalTopics,
  currentPage,
  totalPages,
  limit,
  showPagination,
  onPageChange,
  itemInserts,
}) {
  if (topics.length === 0) {
    return (
      <div className='py-12 text-center text-muted-foreground bg-card rounded-xl border border-border shadow-sm'>
        暂无话题
      </div>
    );
  }

  return (
    <>
      <div className='flex flex-col'>
        {topics.map((topic, index) => (
          <Fragment key={topic.id}>
            <JatraTopicCard topic={topic} />
            {itemInserts?.[index]}
          </Fragment>
        ))}
      </div>

      {showPagination && totalPages > 1 && (
        <div className='py-6 flex justify-center'>
          <Pager
            total={totalTopics}
            page={currentPage}
            pageSize={limit}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </>
  );
}
