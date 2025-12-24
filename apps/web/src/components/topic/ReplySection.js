'use client';

import { useRef } from 'react';
import ReplyList from './ReplyList';
import ReplyForm from './ReplyForm';

export default function ReplySection({
  topicId,
  initialPosts,
  totalPosts,
  totalPages,
  currentPage,
  limit,
  isClosed,
  isDeleted,
  onTopicUpdate,
  isRewardEnabled,
  rewardStatsMap = {}, // 新增：打赏统计 Map
  onRewardSuccess, // 新增：打赏成功回调（局部更新）
}) {
  const replyListRef = useRef(null);

  // 处理新回复添加
  const handleReplyAdded = (newPost) => {
    if (replyListRef.current) {
      replyListRef.current.addPost(newPost);
    }
  };

  return (
    <>
      {/* 回复列表 */}
      <ReplyList
        ref={replyListRef}
        topicId={topicId}
        initialPosts={initialPosts}
        totalPosts={totalPosts}
        totalPages={totalPages}
        currentPage={currentPage}
        limit={limit}
        isRewardEnabled={isRewardEnabled}
        rewardStatsMap={rewardStatsMap}
        onRefreshRewards={onRewardSuccess}
      />

      {/* 回复表单 */}
      <ReplyForm
        topicId={topicId}
        isClosed={isClosed}
        isDeleted={isDeleted}
        onReplyAdded={handleReplyAdded}
        onTopicUpdate={onTopicUpdate}
      />
    </>
  );
}
