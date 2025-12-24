'use client';

import { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { Pager } from '@/components/common/Pagination';
import { useRouter } from 'next/navigation';
import ReplyItem from './ReplyItem';

const ReplyList = forwardRef(function ReplyList(
  {
    topicId,
    initialPosts,
    totalPosts: initialTotalPosts,
    totalPages,
    currentPage,
    limit,
    isRewardEnabled,
    rewardStatsMap = {}, // 新增：打赏统计 Map
    onRefreshRewards, // 新增：刷新打赏统计回调
  },
  ref
) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [totalPosts, setTotalPosts] = useState(initialTotalPosts);
  const repliesContainerRef = useRef(null);
  const prevPageRef = useRef(currentPage);

  // 当服务端数据更新时（分页切换），更新本地状态
  useEffect(() => {
    // 只有当 initialPosts 真正改变时（例如翻页）才更新
    // 避免因父组件重渲染（例如打赏导致的状态更新）而重置本地的乐观更新
    // 简单的浅比较
    if (initialPosts !== posts) {
        setPosts(initialPosts);
        setTotalPosts(initialTotalPosts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPosts, initialTotalPosts]);

  // 页码变化时滚动到顶部
  useEffect(() => {
    if (currentPage !== prevPageRef.current) {
        repliesContainerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      prevPageRef.current = currentPage;
    }
  }, [currentPage]);



  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    addPost: (newPost) => {
      setPosts((prevPosts) => [...prevPosts, newPost]);
      setTotalPosts((prev) => prev + 1);
    },
  }));

  const handlePageChange = (page) => {
    // 使用 URL 参数进行分页，触发服务端重新渲染
    // scroll: false 禁用 Next.js 默认滚动行为
    router.push(`/topic/${topicId}?p=${page}`, { scroll: false });
  };

  // 更新本地回复列表（用于删除等操作）
  const handlePostDeleted = (postId) => {
    setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId));
    setTotalPosts((prev) => Math.max(prev - 1, 0));
  };

  // 添加新回复到列表
  const handleReplyAdded = (newPost) => {
    setPosts((prevPosts) => [...prevPosts, newPost]);
    setTotalPosts((prev) => prev + 1);
  };

  return (
    <div className='space-y-4' >
      <div ref={repliesContainerRef} className='relative -top-16'/>
      {totalPosts > 0 && (
        <div className='flex items-center space-x-2 text-sm text-muted-foreground/70 mb-4'>
          <MessageSquare className='h-4 w-4' />
          <span className='font-medium'>{totalPosts} 条回复</span>
        </div>
      )}

      {posts.map((reply) => (
        <ReplyItem
          key={reply.id}
          reply={reply}
          topicId={topicId}
          onDeleted={handlePostDeleted}
          onReplyAdded={handleReplyAdded}
          isRewardEnabled={isRewardEnabled}
          rewardStats={rewardStatsMap[reply.id] || { totalAmount: 0, totalCount: 0 }}
          onRefreshRewards={onRefreshRewards}
        />
      ))}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className='mb-6'>
          <Pager
            total={totalPosts}
            page={currentPage}
            pageSize={limit}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
});

export default ReplyList;
