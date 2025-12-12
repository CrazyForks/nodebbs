import fp from 'fastify-plugin';
import rewardsRoutes from './routes/index.js';
import checkInRoutes from './routes/checkin.js'; // Added here

import { registerRewardListeners } from './listeners.js';
// ... rest of imports


import { userEnricher } from '../../services/userEnricher.js';
import db from '../../db/index.js';
import { eq, and, inArray } from 'drizzle-orm';
import { users, shopItems, userBadges, badges as badgeSchema, userItems } from '../../db/schema.js'; 
// userItems removed from schema export to break cycle? No, I commented it out in db/schema.js but it SHOULD indicate I need to import it manually or from where it is defined.
// Wait, userItems is defined in 'extensions/shop/schema.js'.
// db/schema.js does export * from extensions/shop/schema.js.
// So importing from db/schema.js IS correct for userItems IF I removed the *relation* from users, not the export.
// I only removed `userItems: many(userItems)` from `usersRelations`.
// So `userItems` table object IS exported from `db/schema.js`.
// So `import { userItems } ...` is valid.

import { isRewardSystemEnabled } from './services/rewardService.js';

/**
 * 奖励插件
 * 处理奖励系统逻辑、路由和事件监听器。
 */
async function rewardsPlugin(fastify, options) {
  // 注册积分增强 (单用户)
  userEnricher.register('rewards', async (user) => {
    // 1. 检查系统是否已启用
    const isEnabled = await isRewardSystemEnabled();
    
    // 初始化默认值以确保结构一致
    if (user.avatarFrame === undefined) user.avatarFrame = null;
    if (user.badges === undefined) user.badges = [];

    if (!isEnabled) return;
    
    try {
        // 2. 获取头像框
        // Note: This logic belongs to SHOP or BADGES?
        // Why is it in rewards/credits?
        // Legacy design.
        // I will keep it as is, but renamed.
        // Ideally should be moved to Badge/Shop extensions later.
        
        const [foundAvatarFrame] = await db
          .select({
            id: userItems.id,
            itemType: shopItems.type,
            itemName: shopItems.name,
            itemMetadata: shopItems.metadata,
            imageUrl: shopItems.imageUrl,
          })
          .from(userItems)
          .innerJoin(shopItems, eq(userItems.itemId, shopItems.id))
          .where(
            and(
              eq(userItems.userId, user.id),
              eq(userItems.isEquipped, true), // userItems table obj is needed
              eq(shopItems.type, 'avatar_frame')
            )
          )
          .limit(1);

        user.avatarFrame = foundAvatarFrame || null;

        // 3. 获取徽章
        const badges = await db
          .select({
            id: userBadges.id,
            badgeId: badgeSchema.id,
            name: badgeSchema.name,
            slug: badgeSchema.slug,
            iconUrl: badgeSchema.iconUrl,
            description: badgeSchema.description,
            isDisplayed: userBadges.isDisplayed,
            earnedAt: userBadges.earnedAt
          })
          .from(userBadges)
          .innerJoin(badgeSchema, eq(userBadges.badgeId, badgeSchema.id))
          .where(
            and(
              eq(userBadges.userId, user.id),
              eq(userBadges.isDisplayed, true)
            )
          )
          .orderBy(userBadges.displayOrder);
          
        user.badges = badges;
    } catch (err) {
        console.error('Error enriching user rewards:', err);
    }
  });

  // 注册批量增强
  userEnricher.registerBatch('rewards', async (usersList) => {
      // 1. 检查系统是否已启用
      const isEnabled = await isRewardSystemEnabled();

      // 为所有用户初始化默认值
      usersList.forEach(u => {
          if (u.avatarFrame === undefined) u.avatarFrame = null;
          if (u.badges === undefined) u.badges = [];
      });

      if (!isEnabled || usersList.length === 0) return;

      const userIds = usersList.map(u => u.id);

      try {
          // 2. 批量获取头像框
          const frames = await db
            .select({
              userId: userItems.userId,
              itemMetadata: shopItems.metadata,
            })
            .from(userItems)
            .innerJoin(shopItems, eq(userItems.itemId, shopItems.id))
            .where(
              and(
                inArray(userItems.userId, userIds),
                eq(userItems.isEquipped, true),
                eq(shopItems.type, 'avatar_frame')
              )
            );
          
          const frameMap = new Map();
          frames.forEach(f => frameMap.set(f.userId, f));

          // 3. 批量获取徽章
          const badges = await db
            .select({
                userId: userBadges.userId,
                id: userBadges.id,
                badgeId: badgeSchema.id,
                name: badgeSchema.name,
                slug: badgeSchema.slug,
                iconUrl: badgeSchema.iconUrl,
                isDisplayed: userBadges.isDisplayed
            })
            .from(userBadges)
            .innerJoin(badgeSchema, eq(userBadges.badgeId, badgeSchema.id))
             .where(
                and(
                  inArray(userBadges.userId, userIds),
                  eq(userBadges.isDisplayed, true)
                )
             )
             .orderBy(userBadges.displayOrder);
          
          const badgeMap = new Map();
          badges.forEach(b => {
             if (!badgeMap.has(b.userId)) badgeMap.set(b.userId, []);
             badgeMap.get(b.userId).push(b);
          });

          // 4. 映射回用户
          usersList.forEach(u => {
             if (frameMap.has(u.id)) {
                 u.avatarFrame = { itemMetadata: frameMap.get(u.id).itemMetadata };
             }
             if (badgeMap.has(u.id)) {
                 u.badges = badgeMap.get(u.id);
             }
          });

      } catch (err) {
          console.error('Error batch enriching user rewards:', err);
      }
  });

  // 注册路由
  fastify.register(rewardsRoutes, { prefix: '/api/rewards' });
  fastify.register(checkInRoutes, { prefix: '/api' });

  // 注册事件监听器
  await registerRewardListeners(fastify);

}

export default fp(rewardsPlugin, {
  name: 'rewards-plugin',
  dependencies: ['event-bus', 'ledger-plugin'] // Added ledger-plugin dependency
});
