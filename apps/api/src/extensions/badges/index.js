import fp from 'fastify-plugin';
import badgeRoutes from './routes/index.js';
import badgeListeners from './listeners.js';
import registerBadgeEnricher from './enricher.js';

/**
 * Badges Feature
 * Handles achievement badges and user honors.
 */
async function badgesFeature(fastify, options) {
  fastify.register(badgeRoutes, { prefix: '/api/badges' });
  fastify.register(badgeListeners);
  
  // Register User Enricher
  registerBadgeEnricher(fastify);
}

export default fp(badgesFeature, {
  name: 'badges-feature'
});
