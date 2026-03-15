/**
 * 事件总线 - 事件名常量
 * 所有事件的 emit/on 均应通过此文件的常量引用，避免字符串硬编码。
 *
 * Payload 约定（仅传递必要字段，避免泄露内部状态）：
 *   TOPIC_CREATED → { id, userId, title, slug, categoryId, createdAt }
 *   POST_CREATED  → { id, userId, topicId, postNumber, replyToPostId, createdAt }
 *   POST_LIKED    → { postId, postAuthorId, userId }
 *   USER_CHECKIN  → { userId, streak }
 *   USER_DELETION_REQUESTED → { userId, username }
 *   USER_DELETED  → { userId, username }
 */
export const EVENTS = {
  TOPIC_CREATED: 'topic.created',
  POST_CREATED: 'post.created',
  POST_LIKED: 'post.liked',
  USER_CHECKIN: 'user.checkin',
  USER_DELETION_REQUESTED: 'user.deletion_requested',
  USER_DELETED: 'user.deleted',
};
