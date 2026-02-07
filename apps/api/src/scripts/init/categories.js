/**
 * Categories 初始化脚本
 * 确保系统至少有一个默认分类，保证新装系统开箱即用
 */

import { eq } from 'drizzle-orm';
import { categories } from '../../db/schema.js';
import { BaseSeeder } from './base.js';

const DEFAULT_CATEGORIES = [
  {
    name: '综合讨论',
    slug: 'general',
    description: '讨论各类话题',
    color: '#3B82F6',
    position: 0,
  },
];

export class CategorySeeder extends BaseSeeder {
  constructor() {
    super('categories');
  }

  async init(db, reset = false) {
    const result = { addedCount: 0, updatedCount: 0, skippedCount: 0, total: DEFAULT_CATEGORIES.length };

    this.logger.header('初始化默认分类');

    for (const catData of DEFAULT_CATEGORIES) {
      const [existing] = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, catData.slug))
        .limit(1);

      if (existing) {
        if (reset) {
          await db
            .update(categories)
            .set(catData)
            .where(eq(categories.slug, catData.slug));
          result.updatedCount++;
          this.logger.success(`更新分类: ${catData.name}`);
        } else {
          result.skippedCount++;
        }
      } else {
        await db.insert(categories).values(catData);
        result.addedCount++;
        this.logger.success(`创建分类: ${catData.name}`);
      }
    }

    if (result.skippedCount > 0) {
      this.logger.info(`跳过 ${result.skippedCount} 个已存在的分类`);
    }

    this.logger.summary(result);
    return result;
  }

  async list() {
    this.logger.header('默认分类配置');
    DEFAULT_CATEGORIES.forEach(cat => {
      this.logger.item(`${cat.slug}: ${cat.name} - ${cat.description}`, '📂');
    });
    this.logger.divider();
  }

  async clean(db) {
    this.logger.warn('清理默认分类...');

    for (const catData of DEFAULT_CATEGORIES) {
      await db.delete(categories).where(eq(categories.slug, catData.slug));
      this.logger.success(`已删除分类: ${catData.slug}`);
    }

    this.logger.success('默认分类清理完成');
  }
}
