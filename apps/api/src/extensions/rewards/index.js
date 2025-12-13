import fp from 'fastify-plugin';
import rewardsRoutes from './routes/index.js';
import checkInRoutes from './routes/checkin.js'; // Added here

import { registerRewardListeners } from './listeners.js';
// ... rest of imports


import db from '../../db/index.js';
import { eq, and, inArray } from 'drizzle-orm';
import { users } from '../../db/schema.js'; 
// userItems removed from schema export to break cycle? No, I commented it out in db/schema.js but it SHOULD indicate I need to import it manually or from where it is defined.
// Wait, userItems is defined in 'extensions/shop/schema.js'.
// db/schema.js does export * from extensions/shop/schema.js.
// So importing from db/schema.js IS correct for userItems IF I removed the *relation* from users, not the export.
// I only removed `userItems: many(userItems)` from `usersRelations`.
// So `userItems` table object IS exported from `db/schema.js`.
// So `import { userItems } ...` is valid.


/**
 * 奖励插件
 * 处理奖励系统逻辑、路由和事件监听器。
 */
async function rewardsPlugin(fastify, options) {



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
