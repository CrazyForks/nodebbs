import { userEnricher } from '../../services/userEnricher.js';
import { getUserBadges, getUsersBadges } from './services/badgeService.js';

/**
 * 为单个用户补充勋章信息
 */
async function enrichUser(user) {
  if (!user || !user.id) return;
  try {
    const badges = await getUserBadges(user.id);
    user.badges = badges;
  } catch (err) {
    console.error(`[BadgeEnricher] Failed to enrich user ${user.id}:`, err);
    user.badges = [];
  }
}

/**
 * 为多个用户批量补充勋章信息
 */
async function enrichUsers(users) {
  if (!users || users.length === 0) return;
  
  // 提取 ID，过滤掉已有勋章数据以避免不必要的重复获取（可选优化）
  const userIds = users.filter(u => u.id).map(u => u.id);
  const uniqueIds = [...new Set(userIds)];
  
  if (uniqueIds.length === 0) return;

  try {
    const badgesMap = await getUsersBadges(uniqueIds);
    
    users.forEach(user => {
      if (user.id && badgesMap[user.id]) {
        user.badges = badgesMap[user.id];
      } else {
        user.badges = [];
      }
    });
  } catch (err) {
    console.error('[BadgeEnricher] Failed to enrich users:', err);
    // 降级处理：设置为空数组
    users.forEach(user => { 
        if (!user.badges) user.badges = []; 
    });
  }
}

export default function registerBadgeEnricher() {
  userEnricher.register('badges', enrichUser);
  userEnricher.registerBatch('badges', enrichUsers);
}
