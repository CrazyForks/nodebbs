import { useRef } from 'react';

/**
 * 回复区域逻辑 Hook (useReplySection)
 * 负责协调 ReplyForm 和 ReplyList 之间的通信
 * 主要用于在回复发布成功后，主动通知列表组件添加新回复
 *
 * @returns {Object} 包含 Ref 和回调方法的对象
 */
export function useReplySection() {
  const replyListRef = useRef(null);

  /**
   * 处理新回复添加的回调
   * 调用 ReplyList 组件暴露的 addPost 方法
   * @param {Object} newPost - 新添加的回复对象
   */
  const handleReplyAdded = (newPost) => {
    if (replyListRef.current) {
      replyListRef.current.addPost(newPost);
    }
  };

  return {
    /** 回复列表组件 Ref，用于调用子组件方法 */
    replyListRef,
    /** 处理回复添加的方法 */
    handleReplyAdded,
  };
}
