import fp from 'fastify-plugin';
import cors from '@fastify/cors';
import { isDev } from '../utils/env.js';

async function securityPlugin(fastify, opts) {
  // Register CORS https://github.com/fastify/fastify-cors?tab=readme-ov-file#options
  await fastify.register(cors, {
    origin: (origin, cb) => {
      // 允许没有 Origin 头的请求（如服务器间通信、Postman）
      if (!origin) {
        cb(null, true);
        return;
      }

      // 1. 优先检查 CORS_ORIGIN 环境变量
      if (process.env.CORS_ORIGIN) {
        if (process.env.CORS_ORIGIN === 'false') {
          cb(new Error('Not allowed by CORS'), false);
          return;
        }
        
        const allowedOrigins = process.env.CORS_ORIGIN.split(',').map((s) => s.trim());
        if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          cb(null, true);
          return;
        }
      }

      // 2. 开发环境下，自动允许 localhost 和 127.0.0.1
      if (isDev) {
        const url = new URL(origin);
        if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
          cb(null, true);
          return;
        }
      }
      
      // 3. 生产环境默认只允许 APP_URL (APP_URL 已弃用，完全依赖 CORS_ORIGIN)
      // if (process.env.APP_URL && origin === process.env.APP_URL) {
      //   cb(null, true);
      //   return;
      // }

      // 拒绝其他来源
      cb(new Error('Not allowed by CORS'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });
}

export default fp(securityPlugin);
