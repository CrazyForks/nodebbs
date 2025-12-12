/**
 * 奖励系统配置初始化
 */

import { rewardSystemConfig, userCheckIns, postRewards } from '../../extensions/rewards/schema.js';
import { eq } from 'drizzle-orm';

/**
 * 奖励系统默认配置
 */
export const DEFAULT_REWARD_CONFIGS = [

  {
    key: 'check_in_base_amount',
    value: '10',
    valueType: 'number',
    description: '签到基础积分',
    category: 'earning',
  },
  {
    key: 'check_in_streak_bonus',
    value: '5',
    valueType: 'number',
    description: '连续签到额外奖励（每天）',
    category: 'earning',
  },
  {
    key: 'post_topic_amount',
    value: '5',
    valueType: 'number',
    description: '发布话题奖励',
    category: 'earning',
  },
  {
    key: 'post_reply_amount',
    value: '2',
    valueType: 'number',
    description: '发布回复的积分变动 (正数=奖励，负数=扣费)',
    category: 'earning',
  },
  {
    key: 'receive_like_amount',
    value: '1',
    valueType: 'number',
    description: '获得点赞奖励',
    category: 'earning',
  },
  {
    key: 'reward_min_amount',
    value: '1',
    valueType: 'number',
    description: '打赏最小金额',
    category: 'spending',
  },
  {
    key: 'reward_max_amount',
    value: '1000',
    valueType: 'number',
    description: '打赏最大金额',
    category: 'spending',
  },
  {
    key: 'invite_reward_amount',
    value: '50',
    valueType: 'number',
    description: '邀请新用户奖励',
    category: 'earning',
  },
];

/**
 * 配置分类名称
 */
export const REWARD_CATEGORY_NAMES = {
  general: '通用设置',
  earning: '获取规则',
  spending: '消费规则',
};

/**
 * 按分类组织的配置
 */
export const REWARD_CONFIGS_BY_CATEGORY = DEFAULT_REWARD_CONFIGS.reduce(
  (acc, config) => {
    if (!acc[config.category]) {
      acc[config.category] = [];
    }
    acc[config.category].push(config);
    return acc;
  },
  {}
);

/**
 * 列出所有奖励配置
 */
export function listRewardConfigs() {
  console.log('\n' + '='.repeat(80));
  console.log('奖励系统配置');
  console.log('='.repeat(80) + '\n');

  Object.entries(REWARD_CONFIGS_BY_CATEGORY).forEach(([category, configs]) => {
    console.log(`\n📦 ${REWARD_CATEGORY_NAMES[category] || category}:\n`);
    configs.forEach((config) => {
      console.log(`  ${config.key}:`);
      console.log(`    值: ${config.value} (${config.valueType})`);
      console.log(`    描述: ${config.description}`);
      console.log();
    });
  });

  console.log('总计: ' + DEFAULT_REWARD_CONFIGS.length + ' 个配置项\n');
}

/**
 * 初始化奖励系统配置
 * @param {Object} db - Drizzle 数据库实例
 * @param {boolean} reset - 是否重置现有配置
 * @returns {Promise<{total: number, addedCount: number, updatedCount: number, skippedCount: number}>}
 */
export async function initRewardConfigs(db, reset = false) {
  console.log('📊 初始化奖励系统配置...');

  let addedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const config of DEFAULT_REWARD_CONFIGS) {
    try {
      // 检查配置是否已存在
      const [existing] = await db
        .select()
        .from(rewardSystemConfig)
        .where(eq(rewardSystemConfig.key, config.key))
        .limit(1);

      if (existing) {
        if (reset) {
          // 重置模式：更新现有配置
          await db
            .update(rewardSystemConfig)
            .set({
              value: config.value,
              valueType: config.valueType,
              description: config.description,
              category: config.category,
              updatedAt: new Date(),
            })
            .where(eq(rewardSystemConfig.key, config.key));
          updatedCount++;
          console.log(`  ✓ 重置: ${config.key}`);
        } else {
          // 非重置模式：跳过已存在的配置
          skippedCount++;
          console.log(`  - 跳过: ${config.key} (已存在)`);
        }
      } else {
        // 插入新配置
        await db.insert(rewardSystemConfig).values(config);
        addedCount++;
        console.log(`  + 新增: ${config.key}`);
      }
    } catch (error) {
      console.error(`  ✗ 失败: ${config.key}`, error.message);
    }
  }

  return {
    total: DEFAULT_REWARD_CONFIGS.length,
    addedCount,
    updatedCount,
    skippedCount,
  };
}

/**
 * 清空奖励系统数据
 * @param {import('drizzle-orm').NodePgDatabase} db
 */
export async function cleanRewards(db) {
  console.log('正在清空奖励系统数据...');

  await db.delete(postRewards);
  console.log('- 已清空帖子打赏 (postRewards)');

  await db.delete(userCheckIns);
  console.log('- 已清空用户签到 (userCheckIns)');

  // Config is usually kept unless specifically requested, but for a full clean:
  await db.delete(rewardSystemConfig);
  console.log('- 已清空奖励配置 (rewardSystemConfig)');

  return { success: true };
}
