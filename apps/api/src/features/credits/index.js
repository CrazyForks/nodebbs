import fp from 'fastify-plugin';
import creditsRoutes from './routes/index.js';

import { registerCreditListeners } from './listeners.js';

/**
 * Credits Plugin
 * Handles credit system logic, routes, and event listeners.
 */
async function creditsPlugin(fastify, options) {
  // Register routes
  fastify.register(creditsRoutes, { prefix: '/api/credits' });

  // Register event listeners
  await registerCreditListeners(fastify);

}

export default fp(creditsPlugin, {
  name: 'credits-plugin',
  dependencies: ['event-bus']
});
