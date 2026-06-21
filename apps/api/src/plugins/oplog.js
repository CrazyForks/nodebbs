import fp from 'fastify-plugin';
import oplogService from '../services/oplogService.js';

/**
 * 操作日志插件
 *
 * 将 oplogService 注册为 fastify.oplog
 * 使用方式：fastify.oplog.add({ ... })
 */
async function oplogPlugin(fastify, options) {
  fastify.decorate('oplog', oplogService);

  fastify.log.info('[操作日志] 服务已注册');
}

export default fp(oplogPlugin, {
  name: 'oplog',
  dependencies: [],
});
