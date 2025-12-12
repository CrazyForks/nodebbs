import { grantCredits, getCreditConfig } from './services/creditService.js';
import db from '../../db/index.js';
import { creditTransactions } from '../../db/schema.js';
import { eq, and } from 'drizzle-orm';

/**
 * Register credit system event listeners
 * @param {import('fastify').FastifyInstance} fastify
 */
export async function registerCreditListeners(fastify) {
  const { eventBus } = fastify;

  if (!eventBus) {
    fastify.log.warn('[积分系统] EventBus plugin not found, skipping listener registration');
    return;
  }

  // 1. 话题创建奖励 (Topic Created)
  eventBus.on('topic.created', async (topic) => {
    try {
      fastify.log.debug(`[积分系统] 处理话题创建奖励: TopicID=${topic.id}, UserID=${topic.userId}`);
      
      const amount = await getCreditConfig('post_topic_amount', 5);

      if (amount > 0) {
        await grantCredits({
          userId: topic.userId,
          amount: Number(amount),
          type: 'post_topic',
          relatedTopicId: topic.id,
          description: `发布话题：${topic.title}`,
        });
      }
    } catch (error) {
      fastify.log.error(error, `[积分系统] 发放话题创建奖励失败: TopicID=${topic.id}`);
    }
  });

  // 2. 回复创建奖励 (Post Created)
  eventBus.on('post.created', async (post) => {
    try {
      // 不奖励第一条帖子（即话题内容）
      if (post.postNumber === 1) return;

      fastify.log.debug(`[积分系统] 处理回复创建奖励: PostID=${post.id}, UserID=${post.userId}`);

      // 读取配置
      const replyAmount = await getCreditConfig('post_reply_amount', 2);

      if (replyAmount > 0) {
        await grantCredits({
          userId: post.userId,
          amount: Number(replyAmount),
          type: 'post_reply',
          relatedPostId: post.id,
          relatedTopicId: post.topicId,
          description: '发布回复',
        });
      } else {
         fastify.log.debug(`[积分系统] 回复奖励未开启或为扣费模式: Amount=${replyAmount}`);
      }
    } catch (error) {
      fastify.log.error(error, `[积分系统] 发放回复奖励失败: PostID=${post.id}`);
    }
  });

  // 3. 点赞奖励 (Post Liked)
  eventBus.on('post.liked', async ({ postId, postAuthorId, userId }) => {
    try {
      // 不奖励自己点赞自己
      if (postAuthorId === userId) {
        return;
      }

      fastify.log.debug(`[积分系统] 处理点赞奖励: PostID=${postId}, ToUserID=${postAuthorId}`);

      // 检查是否已经奖励过 (防止重复点赞/取消点赞刷分)
      const [existing] = await db
        .select()
        .from(creditTransactions)
        .where(
          and(
            eq(creditTransactions.type, 'receive_like'),
            eq(creditTransactions.relatedPostId, postId),
            eq(creditTransactions.relatedUserId, userId)
          )
        )
        .limit(1);

      if (existing) {
        fastify.log.debug(`[积分系统] 重复点赞，跳过奖励: PostID=${postId}, LikerID=${userId}`);
        return;
      }

      const amount = await getCreditConfig('receive_like_amount', 1);

      if (amount > 0) {
        await grantCredits({
          userId: postAuthorId, // 给帖子作者加分
          amount: Number(amount),
          type: 'receive_like',
          relatedPostId: postId,
          relatedUserId: userId,
          description: '获得点赞奖励',
        });
      }
    } catch (error) {
      fastify.log.error(error, `[积分系统] 发放点赞奖励失败: PostID=${postId}`);
    }
  });
  
  fastify.log.info('[积分系统] 事件监听器已注册');
}
