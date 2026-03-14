import fp from 'fastify-plugin';
import moderationLogService from '../services/moderationLogService.js';

/**
 * 审核日志服务插件
 *
 * 将 moderationLogService 注册为 fastify.moderation
 * 使用方式：fastify.moderation.log({ ... })
 */
async function moderationLogPlugin(fastify, options) {
  fastify.decorate('moderation', moderationLogService);

  fastify.log.info('[审核日志] 服务已注册');
}

export default fp(moderationLogPlugin, {
  name: 'moderationLog',
  dependencies: [],
});
