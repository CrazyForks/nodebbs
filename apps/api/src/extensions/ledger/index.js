import fp from 'fastify-plugin';
import { LedgerService } from './services/ledgerService.js';
import ledgerRoutes from './routes.js';

async function ledgerPlugin(fastify, options) {
  const service = new LedgerService(fastify);
  fastify.decorate('ledger', service);
  
  fastify.register(ledgerRoutes, { prefix: '/api/ledger' });
}

export default fp(ledgerPlugin, {
  name: 'ledger-plugin',
  dependencies: []
});
