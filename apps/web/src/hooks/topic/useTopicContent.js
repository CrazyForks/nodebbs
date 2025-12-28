import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { postApi } from '@/lib/api';
import { toast } from 'sonner';
import { useTopicContext } from '@/contexts/TopicContext';

/**
 * 话题内容区逻辑 Hook (useTopicContent)
 * 负责管理首贴的交互逻辑，如点赞、打赏弹窗状态
 * 
 * 设计说明：此 Hook 作为 TopicContent 组件的唯一数据入口，
 * 整合了 TopicContext 的共享状态和首帖专用的本地状态，
 * 使组件层无需同时消费 Hook 和 Context。
 *
 * @returns {Object} 包含状态和操作方法的对象
 */
export function useTopicContent() {
  // 从 Context 获取共享状态
  const { 
    topic, 
    rewardStats, 
    isRewardEnabled, 
    handleRewardSuccess 
  } = useTopicContext();
  
  const { user, isAuthenticated, openLoginDialog } = useAuth();
  
  // 首帖点赞状态（本地管理，因为只有首帖需要）
  const [likingPostIds, setLikingPostIds] = useState(new Set());
  const [likeState, setLikeState] = useState({
    isFirstPostLiked: topic.isFirstPostLiked || false,
    firstPostLikeCount: topic.firstPostLikeCount || 0,
  });
  
  // 打赏弹窗状态（本地管理）
  const [rewardDialogOpen, setRewardDialogOpen] = useState(false);
  const [rewardListOpen, setRewardListOpen] = useState(false);

  /**
   * 切换首帖点赞状态
   * @param {number} postId - 帖子ID
   * @param {boolean} isLiked - 当前是否已点赞
   */
  const handleTogglePostLike = async (postId, isLiked) => {
    if (!isAuthenticated) return openLoginDialog();
    if (likingPostIds.has(postId)) return;

    setLikingPostIds((prev) => new Set(prev).add(postId));

    try {
      if (isLiked) {
        await postApi.unlike(postId);
      } else {
        await postApi.like(postId);
      }

      // 更新本地状态
      setLikeState({
        isFirstPostLiked: !isLiked,
        firstPostLikeCount: isLiked
          ? (likeState.firstPostLikeCount || 0) - 1
          : (likeState.firstPostLikeCount || 0) + 1,
      });

      toast.success(isLiked ? '已取消点赞' : '点赞成功');
    } catch (err) {
      console.error('点赞操作失败:', err);
      toast.error(err.message || '操作失败');
    } finally {
      setLikingPostIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  return {
    // === 来自 Context 的共享状态 ===
    /** 话题数据 */
    topic,
    /** 打赏统计数据 Map */
    rewardStats,
    /** 是否开启打赏功能 */
    isRewardEnabled,
    /** 处理打赏成功的回调 */
    handleRewardSuccess,
    
    // === 来自 AuthContext ===
    /** 当前登录用户 */
    user,
    /** 是否已登录 */
    isAuthenticated,
    /** 打开登录弹窗方法 */
    openLoginDialog,
    
    // === 首帖专用本地状态 ===
    /** 正在进行点赞操作的帖子ID集合 */
    likingPostIds,
    /** 首贴点赞状态对象 */
    likeState,
    /** 打赏弹窗是否打开 */
    rewardDialogOpen,
    /** 设置打赏弹窗打开状态 */
    setRewardDialogOpen,
    /** 打赏列表弹窗是否打开 */
    rewardListOpen,
    /** 设置打赏列表弹窗打开状态 */
    setRewardListOpen,
    /** 切换首帖点赞状态方法 */
    handleTogglePostLike,
  };
}
