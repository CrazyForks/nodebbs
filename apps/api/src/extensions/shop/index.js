import fp from 'fastify-plugin';
import shopRoutes from './routes/index.js';
import registerShopEnricher from './enricher.js';

/**
 * 商城插件
 * 处理商城系统逻辑和路由。
 */
async function shopPlugin(fastify, options) {
  // 注册路由
  fastify.register(shopRoutes, { prefix: '/api/shop' });
  
  // 注册增强器
  registerShopEnricher(fastify);
}

export default fp(shopPlugin, {
  name: 'shop-plugin',
  // dependencies: ['credits-plugin'] // 可选：如果紧密依赖积分系统
});
