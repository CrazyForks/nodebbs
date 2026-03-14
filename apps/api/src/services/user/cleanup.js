import db from '../../db/index.js';
import {
  users, accounts, sessions, follows, bookmarks, likes,
  notifications, blockedUsers, verifications, conversations,
  messages, subscriptions,
} from '../../db/schema.js';
import { eq, or } from 'drizzle-orm';
import crypto from 'crypto';

/**
 * 匿名化用户 — 清除 PII，保留帖子/话题（作者通过 username 自动匿名）
 */
export async function anonymizeUser(userId) {
  await db.transaction(async (tx) => {
    // 1. 匿名化用户个人信息（使用 userId + 随机后缀避免 unique 冲突）
    const suffix = crypto.randomBytes(4).toString('hex');
    await tx.update(users).set({
      username: `~deleted_${userId}_${suffix}`,
      email: null,
      phone: null,
      name: '已注销用户',
      bio: null,
      avatar: null,
      passwordHash: null,
      registrationIp: null,
      lastLoginIp: null,
      isPhoneVerified: false,
      isEmailVerified: false,
      deletionRequestedAt: null,
      deletionReason: null,
    }).where(eq(users.id, userId));

    // 2. 清除关联数据
    await Promise.all([
      tx.delete(sessions).where(eq(sessions.userId, userId)),
      tx.delete(accounts).where(eq(accounts.userId, userId)),
      tx.delete(verifications).where(eq(verifications.userId, userId)),
      tx.delete(follows).where(
        or(eq(follows.followerId, userId), eq(follows.followingId, userId))
      ),
      tx.delete(bookmarks).where(eq(bookmarks.userId, userId)),
      tx.delete(subscriptions).where(eq(subscriptions.userId, userId)),
      tx.delete(likes).where(eq(likes.userId, userId)),
      tx.delete(notifications).where(
        or(eq(notifications.userId, userId), eq(notifications.triggeredByUserId, userId))
      ),
      tx.delete(blockedUsers).where(
        or(eq(blockedUsers.userId, userId), eq(blockedUsers.blockedUserId, userId))
      ),
    ]);

    // 3. 标记私信中涉及该用户的会话为已删除
    const userConversations = await tx.select({ id: conversations.id, user1Id: conversations.user1Id })
      .from(conversations)
      .where(or(eq(conversations.user1Id, userId), eq(conversations.user2Id, userId)));

    for (const conv of userConversations) {
      const isUser1 = conv.user1Id === userId;
      await tx.update(conversations).set(
        isUser1 ? { isDeletedByUser1: true } : { isDeletedByUser2: true }
      ).where(eq(conversations.id, conv.id));
    }

    // 标记该用户发送的所有消息为已删除（在循环外执行一次）
    await tx.update(messages).set({ isDeletedBySender: true })
      .where(eq(messages.senderId, userId));

    // 4. 帖子/话题保留，不做删除 — 作者信息已通过 username 变更自动匿名
  });
}
