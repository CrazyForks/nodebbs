import { grantReward, getRewardConfig } from './services/rewardService.js';
import db from '../../db/index.js';
import { eq, and } from 'drizzle-orm';

/**
 * Register reward system event listeners
 * @param {import('fastify').FastifyInstance} fastify
 */
export async function registerRewardListeners(fastify) {
  const { eventBus } = fastify;

  if (!eventBus) {
    fastify.log.warn('[奖励系统] EventBus plugin not found, skipping listener registration');
    return;
  }

  // 1. 话题创建奖励 (Topic Created)
  eventBus.on('topic.created', async (topic) => {
    try {
      fastify.log.debug(`[奖励系统] 处理话题创建奖励: TopicID=${topic.id}, UserID=${topic.userId}`);
      
      const amount = await getRewardConfig('post_topic_amount', 5);

      if (amount > 0) {
        await grantReward(fastify, {
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
      // 使用 Ledger sysTransactions 进行检查
      const [existing] = await fastify.ledger.getTransactions({
        userId: postAuthorId,
        currencyCode: 'credits',
        type: 'receive_like',
        referenceType: 'reward_event',
        referenceId: `receive_like_${postId}_${userId}` // Generated deterministically
      });
      // 注意: Ledger getTransactions 尚未实现完善的过滤。
      // 因此暂时直接查表或使用自定义 SQL。
      // 但为了解耦，我们应该依赖 LedgerService 或 RewardService 的辅助方法。
      // 在 RewardService 中增加 checkDuplicateReward 方法？
      // 为了简单，这里还是直接查 sysTransactions 表，因为我们已经 import 了 db。
      
      const { sysTransactions } = await import('../../ledger/schema.js');
      
      const [existingTx] = await db
        .select()
        .from(sysTransactions)
        .where(
          and(
            eq(sysTransactions.type, 'receive_like'),
            eq(sysTransactions.referenceType, 'reward_event'),
            // eq(sysTransactions.referenceId, `receive_like_${postId}_${userId}`) // We don't have referenceId in legacy data, but for new data yes.
            // For robust backward compatibility or safety:
            // Check metadata? Or relatedUserId?
            eq(sysTransactions.relatedUserId, userId),
            // We need to check if relatedPostId matches. But relatedPostId is in metadata string now!
            // This is harder to query efficiently without JSON indexing.
            // But wait, our grantReward sets referenceId to unique string if provided?
            // In listeners we can set referenceId to `receive_like_${postId}_${userId}`.
            // So checking referenceId IS the way.
             eq(sysTransactions.referenceId, `receive_like_${postId}_${userId}`)
          )
        )
        .limit(1);

      if (existingTx) {
        fastify.log.debug(`[奖励系统] 重复点赞，跳过奖励: PostID=${postId}, LikerID=${userId}`);
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
          metadata: { relatedPostId: postId, relatedUserId: userId },
          referenceId: `receive_like_${postId}_${userId}` // Deterministic ID for deduplication
        });
      }
    } catch (error) {
      fastify.log.error(error, `[积分系统] 发放点赞奖励失败: PostID=${postId}`);
    }
  });
  
  fastify.log.info('[积分系统] 事件监听器已注册');
}
