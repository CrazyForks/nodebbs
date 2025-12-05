import fp from 'fastify-plugin';
import shopRoutes from './routes/index.js';

/**
 * Shop Feature (Badges & Items)
 * Handles shop item management, purchasing, and user inventory.
 */
async function shopFeature(fastify, options) {
  // Register routes
  // Note: Prefix is set here to keep APIs consistent
  fastify.register(shopRoutes, { prefix: '/api/shop' });
}

export default fp(shopFeature, {
  name: 'shop-feature',
  dependencies: ['credits-plugin'] // Shop depends on credits for payment
});
